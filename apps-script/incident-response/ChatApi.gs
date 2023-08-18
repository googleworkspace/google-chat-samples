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
// [START chat_incident_response_api]

/**
 * Executes a Chat API SetUp Space request using user authentication.
 *
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces/setup
 * @return {Object} the space from the Chat API response.
 */
function callSetUpSpace_(payload) {
  const response = UrlFetchApp.fetch(
    "https://chat.googleapis.com/v1/spaces:setup",
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  const space = JSON.parse(response.getContentText());
  return space;
}

/**
 * Executes a Chat API Create Membership request using user authentication.
 *
 * @param {String} spaceName The resource name of the space in which to create the message.
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces.members/create
 * @return {Object} the membership from the Chat API response.
 */
function callCreateMembership_(spaceName, payload) {
  const response = UrlFetchApp.fetch(
    `https://chat.googleapis.com/v1/${spaceName}/members`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  const membership = JSON.parse(response.getContentText());
  return membership;
}

/**
 * Executes a Chat API Create Message request using user authentication.
 *
 * @param {String} spaceName The resource name of the space in which to create the message.
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create
 * @return {Object} the message from the Chat API response.
 */
function callCreateMessage_(spaceName, payload) {
  const response = UrlFetchApp.fetch(
    `https://chat.googleapis.com/v1/${spaceName}/messages`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  const message = JSON.parse(response.getContentText());
  return message;
}

/**
 * Executes a Chat API List Messages request using user authentication.
 *
 * For simplicity for this demo, it only retrieves the first page with up to 100 messages.
 *
 * @param {String} spaceName The resource name of the space in which to list the messages.
 * @return {Array} a list of Messages from the Chat API response.
 */
function callListMessages_(spaceName) {
  const response = UrlFetchApp.fetch(
    `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=100`,
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    });
  const parsedResponse = JSON.parse(response.getContentText());
  return parsedResponse.messages;
}

// [END chat_incident_response_api]
