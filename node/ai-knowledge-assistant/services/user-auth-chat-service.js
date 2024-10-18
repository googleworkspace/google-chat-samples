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
 * @fileoverview Service that calls the Chat API to list messages using the
 * user's credentials.
 */

const chat = require('@googleapis/chat');
const {InvalidTokenException} = require('../model/exceptions');
const {Message} = require('../model/message');
const {FirestoreService} = require('./firestore-service');
const {initializeOauth2Client} = require('./user-auth');

/**
 * Initializes the Chat API client with user credentials.
 * @param {!string} userName The resource name of the user providing the credentials.
 * @returns {Promise<chat.chat_v1.Chat>} An initialized Chat API client.
 * @throws {InvalidTokenException} If there are no OAuth2 tokens stored for
 *     the user in the database.
 */
async function initializeChatClient(userName) {
  // Try to obtain an existing OAuth2 token from storage.
  const tokens = await FirestoreService.getUserToken(userName);
  if (tokens === null) {
    throw new InvalidTokenException('Token not found');
  }

  // Authenticate with the user's OAuth2 tokens.
  const credentials = {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  };
  const oauth2Client = initializeOauth2Client(credentials);

  // Create the Chat API client with user credentials.
  const chatClient = chat.chat({
    version: 'v1',
    auth: oauth2Client
  });
  return chatClient;
}

/**
 * Service to list Google Chat messages using user credentials.
 */
exports.UserAuthChatService = {

  /**
   * Lists messages in a Google Chat space by calling the Chat API with user
   * credentials.
   *
   * <p>Only the text messages sent by human users are returned. So, messages
   * posted by Chat apps or with an empty text field are discarded.
   *
   * <p>Uses the method
   * [spaces.messages.list](https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces.messages/list)
   * from the Chat REST API.
   *
   * @param {!string} spaceName The resource name of the space in Google Chat.
   * @param {!string} userName The resource name of the user whose credentials
   *     will be used to call the Chat API.
   * @returns {Promise<Message[]>} The list of messages in the space.
   * @throws {InvalidTokenException} If there are no OAuth2 tokens stored for
   *     the user in the database or the call to the Chat API fails.
   */
  listUserMessages: async function (spaceName, userName) {
    const chatClient = await initializeChatClient(userName);
    let messages = [];
    let pageToken = '';

    do {
      let response;
      try {
        response = await chatClient.spaces.messages.list({
          parent: spaceName,
          pageSize: 1000,
          pageToken: pageToken,
        });
      } catch (err) {
        console.error(JSON.stringify({
          message: 'Error calling Chat API ListMessages.',
          error: err,
        }));
        if (err.code === 403) {
          await FirestoreService.removeUserToken(userName);
          throw new InvalidTokenException('Invalid token');
        }
        return;
      }
      if (response.status !== 200) {
        console.error('Error calling Chat API ListMessages: '
          + response.status + ' - ' + response.statusText);
        break;
      }
      if (response.data.messages) {
        response.data.messages
          .filter(message => (message.sender.type !== 'BOT') && message.text)
          .map(message =>
            new Message(message.name, message.text, message.createTime))
          .forEach(message => messages.push(message));
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return messages;
  }
}
