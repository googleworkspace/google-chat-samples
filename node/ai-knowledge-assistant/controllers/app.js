/**
 * Copyright 2024 Google LLC
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
 * [Chat event](https://developers.google.com/workspace/chat/interaction-events).
 * It handles Chat app mentions and added to space events.
 */

const {env} = require('../env.js');
const {AppAuthChatService} = require('../services/app-auth-chat-service');
const {AppAuthEventsService} = require('../services/app-auth-events-service');
const {FirestoreService} = require('../services/firestore-service');
const {UserAuthChatService} = require('../services/user-auth-chat-service');
const {UserAuthEventsService} = require('../services/user-auth-events-service');
const {generateAuthUrl} = require('../services/user-auth.js');

/**
 * Google Chat
 * [event types](https://developers.google.com/workspace/chat/interaction-events).
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
   * [event](https://developers.google.com/workspace/chat/interaction-events)
   * received from Google Chat.
   */
  constructor(event) {
    this.event = event;
    this.spaceName = event.space.name;
    this.userName = event.user.name;
    this.configCompleteRedirectUrl = event.configCompleteRedirectUrl;
  }

  /**
   * Executes the Chat app and returns a
   * [message](https://developers.google.com/workspace/chat/messages-overview)
   * as a response.
   * @return {Promise<import('@googleapis/chat').chat_v1.Schema$Message>} A
   *     message to post back to the space.
   */
  async execute() {
    switch (this.event.type) {
      case EventType.ADDED_TO_SPACE:
      case EventType.MESSAGE:
        return this.handleAddedToSpaceOrMention();
      case EventType.REMOVED_FROM_SPACE:
        return this.handleRemovedFromSpace();
      case EventType.CARD_CLICKED:
        return this.handleCardClickEvent();
      default:
        return {};
    }
  }

  /**
   * Handles the ADDED_TO_SPACE or MESSAGE event by sending back a welcome message.
   * It also adds the space to storage, queries all messages currently in the space,
   * and saves all the messages into storage.
   * @return {Promise<import('@googleapis/chat').chat_v1.Schema$Message>} A
   *     welcome text message to post back to the space.
   */
  async handleAddedToSpaceOrMention() {
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Saving message history and subscribing to the space.',
        spaceName: this.spaceName,
        userName: this.userName,
      }));
    }
    await FirestoreService.createSpace(this.spaceName);

    try {
      // List and save the previous messages from the space.
      const messages = await UserAuthChatService.listUserMessages(
        this.spaceName, this.userName);
      await FirestoreService.createOrUpdateMessages(this.spaceName, messages);

      // Create space subscription.
      await UserAuthEventsService.createSpaceSubscription(
        this.spaceName, this.userName);
    } catch (e) {
      if (e.name === 'InvalidTokenException') {
        // App doesn't have a refresh token for the user.
        // Request configuration to obtain OAuth2 tokens.
        return {
          actionResponse: {
            type: 'REQUEST_CONFIG',
            url: generateAuthUrl(this.userName, this.configCompleteRedirectUrl)
          }
        };
      }
      // Rethrow unrecognized errors.
      throw e;
    }

    // Reply with welcome message.
    const text = 'Thank you for adding me to this space. I help answer'
      + ' questions based on past conversation in this space. Go ahead and ask'
      + ' me a question!';
    return {text: text};
  }

  /**
   * Handles the REMOVED_FROM_SPACE event by deleting the space subscriptions
   * and deleting the space from storage.
   */
  async handleRemovedFromSpace() {
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Deleting space subscriptions and message history.',
        spaceName: this.spaceName,
      }));
    }
    await AppAuthEventsService.deleteSpaceSubscriptions(this.spaceName);
    await FirestoreService.deleteSpace(this.spaceName);
    return {};
  }

  /**
   * Handles the CARD_CLICKED event by sending a message to the space manager.
   * @return {Promise<import('@googleapis/chat').chat_v1.Schema$Message>} A text
   *     message to post back to the space.
   */
  async handleCardClickEvent() {
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Handling card clicked event.',
        spaceName: this.spaceName,
      }));
    }
    let text = 'Please answer the question above.';
    const spaceManagerName =
      await AppAuthChatService.listSpaceManager(this.spaceName);
    if (spaceManagerName) {
      text = `<${spaceManagerName}> ${text}`;
    }
    return {text: text};
  }
}

module.exports = {
  /**
   * Executes the Chat app and returns a
   * [message](https://developers.google.com/workspace/chat/messages-overview)
   * as a response.
   * @param {!Object} event The
   * [event](https://developers.google.com/workspace/chat/interaction-events)
   * received from Google Chat.
   * @return {Promise<import('@googleapis/chat').chat_v1.Schema$Message>} A
   *     message to post back to the space.
   */
  execute: async function (event) {
    return new ChatApp(event).execute();
  }
};
