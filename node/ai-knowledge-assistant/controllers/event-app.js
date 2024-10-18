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
 * @fileoverview The application logic for subscription events. Processes the
 * [Chat event](https://developers.google.com/workspace/events/guides/events-chat).
 * It stores new messages in storage, answers questions using Vertex AI, and
 * renews the subscription when receiving a lifecycle notification event.
 */

const {env} = require('../env.js');
const {SubscriptionEventType} = require('../model/events');
const {Message} = require('../model/message');
const {AIPService} = require('../services/aip-service');
const {AppAuthChatService} = require('../services/app-auth-chat-service');
const {FirestoreService} = require('../services/firestore-service');
const {UserAuthEventsService} = require('../services/user-auth-events-service');

/**
 * Chat application logic for event processing.
 */
class EventApp {
  /**
   * Instantiates the Event app.
   * @param {!string} eventType The type of the received subscription event.
   * @param {!Object} event The subscription event received from Google Chat.
   */
  constructor(eventType, event) {
    this.eventType = eventType;
    this.event = event;
  }

  /**
   * Executes the Chat app.
   * @return {Promise<Void>}
   */
  async execute() {
    switch (this.eventType) {
      case SubscriptionEventType.MESSAGE_CREATED:
      case SubscriptionEventType.MESSAGE_UPDATED:
        return this.handleMessageEvent(this.event.message);

      case SubscriptionEventType.MESSAGE_DELETED:
        return this.handleMessageDeletedEvent(this.event.message);

      case SubscriptionEventType.BATCH_MESSAGE_CREATED:
      case SubscriptionEventType.BATCH_MESSAGE_UPDATED:
        return Promise.all(
          this.event.messages
            .map(payload => payload.message)
            .map(message => this.handleMessageEvent(message)));

      case SubscriptionEventType.BATCH_MESSAGE_DELETED:
        return Promise.all(
          this.event.messages
            .map(payload => payload.message)
            .map(message => this.handleMessageDeletedEvent(message)));

      case SubscriptionEventType.EXPIRATION_REMINDER:
        return this.handleExpirationReminderEvent(this.event.subscription);

      default:
      // Do nothing for unrecognized event type.
    }
  }

  /**
   * Handles message created and message updated events.
   * The event is ignored if the message was created by an app or has empty text.
   * Otherwise, the message is stored in the database.
   * If the event is message created, we handle the messge using AI to
   * potentially answer the question.
   * @param {!Object} message The message received in the event.
   * @returns {Promise<void>}
   */
  async handleMessageEvent(message) {
    if ((message.sender.type === 'BOT') || !message.text) {
      if (env.logging) {
        console.log('Ignoring message from a Chat app or with an empty text.');
      }
      return;
    }
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Handling message event.',
        text: message.text,
        type: this.eventType,
      }));
    }
    await FirestoreService.createOrUpdateMessage(
      message.space.name,
      new Message(message.name, message.text, message.createTime));
    if (this.eventType === SubscriptionEventType.MESSAGE_CREATED
      || this.eventType === SubscriptionEventType.BATCH_MESSAGE_CREATED) {
      await this.handleAIaction();
    }
  }

  /**
   * Handles message deleted events.
   * @param {!Object} message The message received in the event.
   * @returns {Promise<void>}
   */
  async handleMessageDeletedEvent(message) {
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Deleting message from storage.',
        name: message.name,
      }));
    }
    const spaceName = message.name.substring(0, message.name.indexOf('/messages'));
    await FirestoreService.deleteMessage(spaceName, message.name);
  }

  /**
   * Handles expiration reminder events.
   * @param {!Object} subscription The subscription received in the event.
   * @returns {Promise<void>}
   */
  async handleExpirationReminderEvent(subscription) {
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Renewing subscription.',
        subscriptionName: subscription.name,
        userName: subscription.authority,
      }));
    }
    await UserAuthEventsService.renewSpaceSubscription(
      subscription.authority, subscription.name);
  }

  /**
   * Calls the AI service to potentially create a response to the message.
   * @return {Promise<Void>}
   */
  async handleAIaction() {
    const message = this.event.message;
    const hasQuestion = await AIPService.containsQuestion(message.text);
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Evaluated whether message has a question.',
        text: message.text,
        hasQuestion: hasQuestion,
      }));
    }
    if (!hasQuestion) {
      return;
    }
    const spaceName = message.space.name;
    const allMessages = await FirestoreService.listMessages(spaceName);
    const responseText = await AIPService.answerQuestion(message.text, allMessages);
    if (env.logging) {
      console.log(JSON.stringify({
        message: 'Posting response message.',
        text: responseText,
      }));
    }
    await this.createMessage(spaceName, responseText, message.thread?.name);
  }

  /**
   * Create a message using the Chat API.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} messageText The message text to be created.
   * @param {?string} threadName The resource name of the message thread.
   * @return {Promise<Void>}
   */
  async createMessage(spaceName, messageText, threadName) {
    const message = {
      'text': messageText,
      'thread': {
        'name': threadName
      },
      'accessoryWidgets': [
        {
          'buttonList': {
            'buttons': [
              {
                'icon': {
                  'material_icon': {
                    'name': 'contact_support'
                  }
                },
                'text': 'Get help',
                'altText': 'Get additional help from a space manager',
                'onClick': {
                  'action': {
                    'function': 'doContactSupport'
                  }
                }
              }
            ]
          }
        }
      ]
    };
    await AppAuthChatService.createMessageInThread(spaceName, message);
  }
}

module.exports = {
  /**
   * Executes the Event app to process received events.
   *
   * <p>If the event contains a new or updated message, it is stored in the
   * database. If the message is new and contains a question, it uses the
   * Vertex AI API to post an answer.
   *
   * <p>If the event contains a subscription expiration reminder, it renews
   * the subscription.
   *
   * @param {!string} eventType The type of the received subscription event.
   * @param {!Object} event The subscription event received from Google Chat.
   * @return {Promise<void>}
   */
  execute: async function (eventType, event) {
    return new EventApp(eventType, event).execute();
  }
};
