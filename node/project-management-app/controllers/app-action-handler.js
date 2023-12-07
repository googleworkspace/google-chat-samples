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
// [START chat_project_management_app_action_handler]

const { UserStory } = require('../model/user-story');
const { User } = require('../model/user');
const { AIPService } = require('../services/aip-service');
const { UserService } = require('../services/user-service');
const { UserStoryService } = require('../services/user-story-service');
const { EditUserStoryCard } = require('../views/edit-user-story-card');
const { UserStoryCard } = require('../views/user-story-card');
const { UserStoryCardType } = require('../views/widgets/user-story-card-type');

const USERS_PREFIX = 'users/';

/**
 * AI actions that can be executed when editing a user story.
 * @enum {string}
 */
const AIAction = {
  /** Generate the description for a user story. */
  GENERATE: 'GENERATE',
  /** Expand the user story description. */
  EXPAND: 'EXPAND',
  /** Correct the grammar of the user story description. */
  GRAMMAR: 'GRAMMAR',
};

/**
 * Handles exceptions thrown by the UserStoryService.
 * @param {!Error} e An exception thrown by the UserStoryService.
 * @return {Object} A dialog status message with a user facing error message.
 * @throws {Error} If the exception is not a recognized type from the app.
 */
function handleException(e) {
  if (e.name === 'NotFoundException' || e.name === 'BadRequestException') {
    return {
      actionResponse: {
        type: 'DIALOG',
        dialogAction: {
          actionStatus: {
            statusCode: e.statusCode,
            userFacingMessage: e.message
          }
        }
      }
    }
  } else {
    throw e;
  }
}

/**
 * Chat application handler for card actions.
 */
class ChatAppActionHandler {
  /**
   * Instantiates the Chat app action handler.
   * @param {!Object} event The event received from Google Chat.
   * @param {!ChatApp} app The Chat app that is calling this action handler.
   */
  constructor(event, app) {
    this.event = event;
    this.spaceName = event.space.name;
    this.userName = event.user.name;
    this.userStoryId = event.common.parameters
      ? event.common.parameters.id : undefined;
    this.cardType = event.common.parameters
      ? event.common.parameters.cardType : undefined;
    this.app = app;
  }

  /**
   * Executes the handler for a card action and returns a message as a response.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async execute() {
    if (this.event.isDialogEvent
      && this.event.dialogEventType === 'CANCEL_DIALOG') {
      return {
        actionResponse: {
          type: 'DIALOG',
          dialogAction: {
            actionStatus: 'OK'
          }
        }
      };
    }
    switch (this.event.common.invokedFunction) {
      case 'myUserStories':
        return this.app.handleMyUserStories();
      case 'manageUserStories':
        return this.app.handleManageUserStories();
      case 'cleanupUserStories':
        return this.app.handleCleanupUserStories();
      case 'editUserStory':
        return this.handleEditUserStory();
      case 'assignUserStory':
        return this.handleAssignUserStory();
      case 'startUserStory':
        return this.handleStartUserStory();
      case 'completeUserStory':
        return this.handleCompleteUserStory();
      case 'cancelEditUserStory':
        return this.handleCancelEditUserStory();
      case 'saveUserStory':
        return this.handleSaveUserStory();
      case 'refreshUserStory':
        return this.handleRefreshUserStory();
      case 'generateUserStoryDescription':
        return this.handleUserStoryAIAction(AIAction.GENERATE);
      case 'expandUserStoryDescription':
        return this.handleUserStoryAIAction(AIAction.EXPAND);
      case 'correctUserStoryDescriptionGrammar':
        return this.handleUserStoryAIAction(AIAction.GRAMMAR);
      default:
        if (this.cardType === UserStoryCardType.SINGLE_DIALOG
          || this.cardType === UserStoryCardType.LIST_DIALOG) {
          return {
            actionResponse: {
              type: 'DIALOG',
              dialogAction: {
                actionStatus: {
                  statusCode: 'INVALID_ARGUMENT',
                  userFacingMessage: '⚠️ Unrecognized action.'
                }
              }
            }
          }
        }
        return { text: '⚠️ Unrecognized action.' };
    }
  }

  /**
   * Handles the edit user story command.
   * @return {Promise<Object>} A message to open the user story dialog.
   */
  async handleEditUserStory() {
    try {
      const userStory =
        await UserStoryService.getUserStory(this.spaceName, this.userStoryId);
      const user = userStory.data.assignee
        ? await UserService.getUser(
          this.spaceName, userStory.data.assignee.replace(USERS_PREFIX, ''))
        : undefined;
      return {
        actionResponse: {
          type: 'DIALOG',
          dialogAction: {
            dialog: {
              body: new EditUserStoryCard(userStory, user)
            }
          }
        }
      };
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the assign user story command.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async handleAssignUserStory() {
    // Save the user display name and avatar to storage so we can display them
    // in the user story cards.
    const user = new User(
      this.userName.replace(USERS_PREFIX, ''),
      this.event.user.displayName,
      this.event.user.avatarUrl);
    try {
      await UserService.createOrUpdateUser(this.spaceName, user);
      // Assign the user story.
      const userStory =
        await UserStoryService.assignUserStory(
          this.spaceName, this.userStoryId, this.userName);
      return this.buildResponse(userStory, user, /* updated= */ true);
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the start user story command.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async handleStartUserStory() {
    try {
      const userStory =
        await UserStoryService.startUserStory(this.spaceName, this.userStoryId);
      const user = userStory.data.assignee
        ? await UserService.getUser(this.spaceName, userStory.data.assignee)
        : undefined;
      return this.buildResponse(userStory, user, /* updated= */ true);
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the complete user story command.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async handleCompleteUserStory() {
    try {
      const userStory =
        await UserStoryService.completeUserStory(
          this.spaceName, this.userStoryId);
      const user = userStory.data.assignee
        ? await UserService.getUser(this.spaceName, userStory.data.assignee)
        : undefined;
      return this.buildResponse(userStory, user, /* updated= */ true);
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the cancel edit user story command.
   * @return {Promise<Object>} A message to open the user stories list dialog.
   */
  async handleCancelEditUserStory() {
    return this.app.handleManageUserStories();
  }

  /**
   * Handles the save user story command.
   * @return {Promise<Object>} A message to open the user story dialog.
   */
  async handleSaveUserStory() {
    const formInputs = this.event.common.formInputs;
    const title = formInputs.title.stringInputs.value[0];
    const description = formInputs.description.stringInputs.value[0];
    const status = formInputs.status
      ? formInputs.status.stringInputs.value[0] : '';
    const priority = formInputs.priority
      ? formInputs.priority.stringInputs.value[0] : '';
    const size = formInputs.size
      ? formInputs.size.stringInputs.value[0] : '';
    try {
      const userStory =
        await UserStoryService.updateUserStory(
          this.spaceName,
          this.userStoryId,
          title,
          description,
          status,
          priority,
          size);
      const user = userStory.data.assignee
        ? await UserService.getUser(this.spaceName, userStory.data.assignee)
        : undefined;
      return this.buildResponse(userStory, user, /* updated= */ true);
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the refresh user story command.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async handleRefreshUserStory() {
    try {
      const userStory =
        await UserStoryService.getUserStory(this.spaceName, this.userStoryId);
      const user = userStory.data.assignee
        ? await UserService.getUser(
          this.spaceName, userStory.data.assignee.replace(USERS_PREFIX, ''))
        : undefined;
      return {
        cardsV2: [{
          cardId: 'userStoryCard',
          card: new UserStoryCard(userStory, user)
        }],
        actionResponse: {
          type: 'UPDATE_MESSAGE'
        }
      };
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Handles the commands to modify the user story description using AI.
   * @param {AIAction} action The type of AI action to execute.
   * @return {Promise<Object>} A message to re-open the edit user story dialog.
   */
  async handleUserStoryAIAction(action) {
    const formInputs = this.event.common.formInputs;
    const title = formInputs.title.stringInputs.value[0];
    let description = formInputs.description.stringInputs.value[0];
    const status = formInputs.status
      ? formInputs.status.stringInputs.value[0] : '';
    const priority = formInputs.priority
      ? formInputs.priority.stringInputs.value[0] : '';
    const size = formInputs.size
      ? formInputs.size.stringInputs.value[0] : '';
    const assignee = this.event.common.parameters
      ? this.event.common.parameters.assignee : undefined;
    try {
      switch (action) {
        case AIAction.GENERATE:
          if (title.trim().length === 0) {
            description = '';
          } else {
            description = await AIPService.generateDescription(title);
          }
          break;
        case AIAction.EXPAND:
          if (description.trim().length > 0) {
            description = await AIPService.expandDescription(description);
          }
          break;
        case AIAction.GRAMMAR:
          if (description.trim().length > 0) {
            description = await AIPService.correctDescription(description);
          }
          break;
        default:
        // Unrecognized action.
      }
      // Display the (potentially unsaved) current values of the fields from the
      // dialog, not the values from the database.
      const userStoryData = {
        title,
        description,
        status,
        priority,
        size,
        assignee,
      };
      const userStory = new UserStory(this.userStoryId, userStoryData);
      const user = assignee
        ? await UserService.getUser(this.spaceName, assignee)
        : undefined;
      return this.buildResponse(userStory, user, /* updated= */ false);
    } catch (e) {
      return handleException(e);
    }
  }

  /**
   * Builds a response message to send back to Google Chat after updating the
   * user story.
   *
   * The content of the response message depends on the type of the card that
   * generated the action:
   *
   * - single-story card message: update the message's story card
   * - story list message: update the message's story list card
   * - single-story dialog: push a new dialog with an updated story card
   * - story list dialog: push a new dialog with an updated story list card
   *
   * @param {!UserStory} userStory The updated user story.
   * @param {?User} user The user assigned to the user story.
   * @param {!boolean} updated Whether the user story was updated in storage.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  async buildResponse(userStory, user, updated) {
    switch (this.cardType) {
      case UserStoryCardType.SINGLE_MESSAGE:
        return {
          text: updated ? 'User story updated.' : null,
          cardsV2: [{
            cardId: 'userStoryCard',
            card: new UserStoryCard(userStory, user)
          }],
          actionResponse: {
            type: 'UPDATE_MESSAGE'
          }
        };
      case UserStoryCardType.LIST_MESSAGE:
        let message = await this.app.handleMyUserStories();
        message.actionResponse = {
          type: 'UPDATE_MESSAGE'
        };
        return message;
      case UserStoryCardType.SINGLE_DIALOG:
        return {
          actionResponse: {
            type: 'DIALOG',
            dialogAction: {
              actionStatus: {
                statusCode: 'OK',
                userFacingMessage: 'Saved.'
              },
              dialog: {
                body: new EditUserStoryCard(userStory, user, updated)
              }
            }
          }
        };
      case UserStoryCardType.LIST_DIALOG:
        return this.app.handleManageUserStories();
      default:
        return {};
    }
  }

}

module.exports = {
  /**
   * Executes the Chat app action handler and returns a message as a response.
   * @param {!Object} event The event received from Google Chat.
   * @param {!ChatApp} app The Chat app that is calling this action handler.
   * @return {Promise<Object>} A message to post back to the DM or space.
   */
  execute: async function (event, app) {
    return new ChatAppActionHandler(event, app).execute();
  }
};

// [END chat_project_management_app_action_handler]
