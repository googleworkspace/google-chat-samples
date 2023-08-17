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
// [START google_chat_incident_response]

/**
 * Executes a Chat API SetUp Space request using user authentication.
 *
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces/setup
 * @return {Object} the payload from the Chat API response.
 */
function callSetUpSpace_(payload) {
  return callChatApi_({
    uri: SETUP_SPACE_ENDPOINT,
    method: 'POST',
    payload: payload
  });
}

/**
 * Executes a Chat API Create Membership request using user authentication.
 *
 * @param {String} spaceName The resource name of the space in which to create the message.
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces.members/create
 * @return {Object} the payload from the Chat API response.
 */
function callCreateMembership_(spaceName, payload) {
  return callChatApi_({
    uri: MEMBERSHIPS_ENDPOINT(spaceName),
    method: 'POST',
    payload: payload
  });
}

/**
 * Executes a Chat API Create Message request using user authentication.
 *
 * @param {String} spaceName The resource name of the space in which to create the message.
 * @param {Object} payload The request body, as described in https://developers.google.com/chat/api/reference/rest/v1/spaces.messages/create
 * @return {Object} the payload from the Chat API response.
 */
function callCreateMessage_(spaceName, payload) {
  return callChatApi_({
    uri: MESSAGES_ENDPOINT(spaceName),
    method: 'POST',
    payload: payload
  });
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
  const response = callChatApi_({
    uri: MESSAGES_ENDPOINT(spaceName) + '?pageSize=100',
    method: 'GET'
  });
  return response.messages;
}

/**
 * Executes a Chat API request using user authentication.
 *
 * @param {Object} options an object containing the uri to call and optionally the HTTP method and the request payload.
 *                 If an HTTP method is not specified, GET is used.
 * @return {Object} the payload from the Chat API response.
 */
function callChatApi_(options) {
  const uri = encodeURI(options.uri);
  let fetchOptions = {
    method: options.method ? options.method : 'GET',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  }
  if (options.payload) {
    fetchOptions.contentType = 'application/json';
    fetchOptions.payload = JSON.stringify(options.payload);
  }
  const response = UrlFetchApp.fetch(uri, fetchOptions);
  const payload = JSON.parse(response.getContentText());
  return payload;
}

// [END google_chat_incident_response]
