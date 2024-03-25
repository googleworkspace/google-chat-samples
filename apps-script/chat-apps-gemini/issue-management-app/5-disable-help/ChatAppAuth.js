/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This script contains utilities functions based on app authentication.

/**
 * Creates a new message by using the Advanced Chat Service.
 * 
 * @param {Object} message the message object to send to Google Chat
 * @param {string} spaceId the space ID where to create the message
 */
function createAppMessageUsingChatService(message, spaceId) {
  Chat.Spaces.Messages.create(message, spaceId, {}, {
    'Authorization': 'Bearer ' + getService_().getAccessToken()
  });
}

/**
 * Authenticates the app service by using the OAuth2 library.
 * 
 * Warning: This example uses a service account private key for simplicity's sake, it should always
 * be stored in an secure location.
 * 
 * @return {Object} the authenticated app service
 */
function getService_() {
  return OAuth2.createService(CHAT_CREDENTIALS.client_email)
    .setTokenUrl(CHAT_CREDENTIALS.token_uri)
    .setPrivateKey(CHAT_CREDENTIALS.private_key)
    .setIssuer(CHAT_CREDENTIALS.client_email)
    .setSubject(CHAT_CREDENTIALS.client_email)
    .setScope('https://www.googleapis.com/auth/chat.bot')
    .setPropertyStore(appProperties);
}
