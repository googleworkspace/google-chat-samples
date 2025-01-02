/**
 * Copyright 2025 Google LLC
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
 * @fileoverview Function to post a message to a Google Chat space using the
 * credentials of the calling user.
 */

import chat from '@google-apps/chat';
import {FirestoreService} from './firestore-service.js';
import {generateAuthUrl, initializeOauth2Client} from './oauth-flow.js';

// Error code for Unauthenticated requests.
// (see https://grpc.io/docs/guides/status-codes/)
const UNAUTHENTICATED = 16;

/**
 * Posts a message to a Google Chat space by calling the Chat API with user
 * credentials.
 * The message is posted to the same space as the received event.
 * If the user has not authorized the app to use their credentials yet, instead
 * of posting the message, this functions returns a configuration request to
 * start the OAuth authorization flow.
 * @param {!Object} event The event received from Google Chat.
 * @return {Promise<Object>} An ActionResponse message request additional
 *     configuration if the app needs authorization from the user. Otherwise, an
 *     empty object.
 */
export async function postWithUserCredentials(event) {
  const message = event.message;
  const spaceName = event.space.name;
  const userName = event.user.name;
  const displayName = event.user.displayName;

  // Try to obtain an existing OAuth2 token from storage.
  const tokens = await FirestoreService.getUserToken(userName);

  if (tokens === null) {
    // App doesn't have tokens for the user yet.
    // Request configuration to obtain OAuth2 tokens.
    return getConfigRequestResponse(event);
  }

  // Authenticate with the user's OAuth2 tokens.
  const oauth2Client = initializeOauth2Client(tokens);

  // Create the Chat API client with user credentials.
  const chatClient = new chat.v1.ChatServiceClient({
    authClient: oauth2Client,
  });

  // Create a Chat message using the Chat API.
  const request = {
    // The space to create the message in.
    parent: spaceName,
    // The message to create.
    message: {
      'text': `${displayName} said: ${message.text}`,
      'thread': message.thread,
    },
    // Respond in the same thread.
    messageReplyOption: 'REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD',
  };
  try {
    // Call Chat API.
    await chatClient.createMessage(request);
  } catch (e) {
    if (e.code === UNAUTHENTICATED) {
      // This error probably happened because the user revoked the
      // authorization. So, let's request configuration again.
      return getConfigRequestResponse(event);
    }
    throw e;
  }

  return {};
}

/**
 * Returns an action response that tells Chat to request configuration for the
 * app. The configuration will be tied to the user who sent the event.
 * @param {Object} event The event received from Google Chat.
 * @return {Object} An ActionResponse message request additional configuration.
 */
function getConfigRequestResponse(event) {
  const authUrl = generateAuthUrl(
      event.user.name, event.configCompleteRedirectUrl);
  return {
    actionResponse: {
      type: 'REQUEST_CONFIG',
      url: authUrl,
    },
  };
}
