/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The main application logic. Processes the
 * [Chat event](https://developers.devsite.corp.google.com/chat/api/guides/message-formats/events#card-clicked).
 * It handles Chat app mentions, slash commands, and calls the
 * {@code AppActionHandler} to handle card click events.
 */

const { Status } = require('../model/user-story');
const { User } = require('../model/user');
const { AIPService } = require('../services/aip-service');
const { SpaceService } = require('../services/space-service');
const { UserService } = require('../services/user-service');
const { UserStoryService } = require('../services/user-story-service');
const { HelpCard } = require('../views/help-card');
const { UserStoryCard } = require('../views/user-story-card');
const { UserStoryListCard } = require('../views/user-story-list-card');
const AppActionHandler = require('./app-action-handler');

/** The prefix used by the Google Chat API in the User resource name. */
const USERS_PREFIX = 'users/';

/**
 * [Slash commands](https://developers.google.com/chat/how-tos/slash-commands)
 * supported by the Chat app.
 * @enum {number}
 */
const SlashCommand = {
  CREATE_USER_STORY: 1,
  MY_USER_STORIES: 2,
  USER_STORY: 3,
  MANAGE_USER_STORIES: 4,
  CLEANUP_USER_STORIES: 5,
}

/**
 * Google Chat
 * [event types](https://developers.google.com/chat/api/guides/message-formats/events).
 * @enum {string}
 */
const EventType = {
  MESSAGE: 'MESSAGE',
  ADDED_TO_SPACE: 'ADDED_TO_SPACE',
  REMOVED_FROM_SPACE: 'REMOVED_FROM_SPACE',
  CARD_CLICKED: 'CARD_CLICKED',
}

/**
 * Chat application logic.
 */
class ChatApp {
  /**
   * Instantiates the Chat app.
   * @param {!Object} event The
   * [event](https://developers.google.com/chat/api/guides/message-formats/events)
   * received from Google Chat.
   */
  constructor(event) {
    this.event = event;
    this.spaceName = event.space.name;
    this.userName = event.user.name;
  }

  /**
   * Executes the Chat app and returns a
   * [message](https://developers.google.com/chat/messages-overview) as a
   * response.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async execute() {
    switch (this.event.type) {
      case EventType.ADDED_TO_SPACE:
        return this.handleAddedToSpace();
      case EventType.REMOVED_FROM_SPACE:
        return this.handleRemovedFromSpace();
      case EventType.CARD_CLICKED:
        return AppActionHandler.execute(this.event, this);
      case EventType.MESSAGE:
        if (this.event.message.slashCommand) {
          return this.handleSlashCommand();
        }
        // Respond to mentions with the text "user stories" or "userstories"
        // by executing the command "My User Stories". We trim and lower case
        // the argument text sent by the user in the message before the
        // comparison, so we trigger the command regardless of the text's
        // capitalizatino or whitespace.
        const argumentText =
          (this.event.message.argumentText || '').trim().toLowerCase();
        if (argumentText === 'user stories'
          || argumentText === 'userstories') {
          return this.handleMyUserStories();
        }
        // The default response to a mention/DM is returning a help message.
        return this.handleHelp();
      default:
        return {};
    }
  }

  /**
   * Handles the ADDED_TO_SPACE event by sending back a welcome text message.
   * It also adds the space to storage so it can later receive user stories.
   * @return {Object} A welcome text message to post back to the space.
   */
  async handleAddedToSpace() {
    await SpaceService.createSpace(
      this.spaceName, this.event.space.displayName);
    const message = 'Thank you for adding the Project Management app.' +
      ' Message the app for a list of available commands.';
    return { text: message };
  }

  /**
   * Handles the REMOVED_FROM_SPACE event by deleting the space from storage.
   */
  async handleRemovedFromSpace() {
    await SpaceService.deleteSpace(this.spaceName);
    return {};
  }

  /**
   * Handles a slash command and returns a message as a response.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleSlashCommand() {
    switch (Number(this.event.message.slashCommand.commandId)) {
      case SlashCommand.CREATE_USER_STORY:
        return this.handleCreateUserStory();
      case SlashCommand.MY_USER_STORIES:
        return this.handleMyUserStories();
      case SlashCommand.USER_STORY:
        return this.handleUserStory();
      case SlashCommand.MANAGE_USER_STORIES:
        return this.handleManageUserStories();
      case SlashCommand.CLEANUP_USER_STORIES:
        return this.handleCleanupUserStories();
      default:
        return { text: '⚠️ Unrecognized command.' };
    }
  }

  /**
   * Handles the create user story command.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleCreateUserStory() {
    const title = (this.event.message.argumentText || '').trim();
    if (title.length === 0) {
      return {
        text: 'Title is required.'
          + ' Include a title in the command: */createUserStory* _title_'
      };
    }
    const description = await AIPService.generateDescription(title);
    const userStory =
      await UserStoryService.createUserStory(
        this.spaceName, title, description);
    return {
      text: `<${this.userName}> created a user story.`,
      cardsV2: [{
        cardId: 'userStoryCard',
        card: new UserStoryCard(userStory)
      }]
    };
  }

  /**
   * Handles the my user stories command.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleMyUserStories() {
    const userStories =
      await UserStoryService.listUserStoriesByUser(
        this.spaceName, this.userName);
    const openUserStories = userStories
      .filter((userStory) => userStory.data.status !== Status.COMPLETED);
    const user = new User(
      this.userName.replace(USERS_PREFIX, ''),
      this.event.user.displayName,
      this.event.user.avatarUrl);
    const users = { [user.id]: user };
    const title = 'User Stories assigned to ' + this.event.user.displayName;
    return {
      cardsV2: [{
        cardId: 'userStoriesCard',
        card: new UserStoryListCard(
          title,
          openUserStories,
          users,
          /* isDialog= */ false)
      }]
    };
  }

  /**
   * Handles the user story command.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleUserStory() {
    const id = (this.event.message.argumentText || '').trim();
    if (id.length === 0) {
      return {
        text: 'User story ID is required.'
          + ' Include an ID in the command: */userStory* _id_'
      };
    }
    try {
      const userStory =
        await UserStoryService.getUserStory(this.spaceName, id);
      const user = userStory.data.assignee
        ? await UserService.getUser(
          this.spaceName, userStory.data.assignee.replace(USERS_PREFIX, ''))
        : undefined;
      return {
        cardsV2: [{
          cardId: 'userStoryCard',
          card: new UserStoryCard(userStory, user)
        }]
      };
    } catch (e) {
      if (e.name === 'NotFoundException') {
        return { text: `⚠️ User story ${id} not found.` };
      } else {
        throw e;
      }
    }
  }

  /**
   * Handles the manage user stories command.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleManageUserStories() {
    const userStories =
      await UserStoryService.listAllUserStories(this.spaceName);
    // Obtain a unique list of users assigned to the fetched user stories.
    const userIds = [...new Set(userStories
      .filter(userStory => !!userStory.data.assignee)
      .map(userStory => userStory.data.assignee))];
    const users = await UserService.getUsers(this.spaceName, userIds);
    return {
      actionResponse: {
        type: 'DIALOG',
        dialogAction: {
          dialog: {
            body: new UserStoryListCard(
              /* title= */ 'User Stories',
              userStories,
              users,
              /* isDialog= */ true)
          }
        }
      }
    };
  }

  /**
   * Handles the clean up user stories command.
   * @return {Promise<Object>} A message to post back to the space.
   */
  async handleCleanupUserStories() {
    await UserStoryService.cleanupUserStories(this.spaceName);
    return { text: `<${this.userName}> deleted all the user stories.` };
  }

  /**
   * Returns a help message with the list of available commands.
   * @return {Object} A message to post back to the space.
   */
  handleHelp() {
    return {
      cardsV2: [{
        cardId: 'helpCard',
        card: new HelpCard()
      }]
    };
  }

}

module.exports = {
  /**
   * Executes the Chat app and returns a
   * [message](https://developers.google.com/chat/messages-overview) as a
   * response.
   * @param {!Object} event The
   * [event](https://developers.google.com/chat/api/guides/message-formats/events)
   * received from Google Chat.
   * @return {Promise<Object>} A message to post back to the space.
   */
  execute: async function (event) {
    return new ChatApp(event).execute();
  }
};
