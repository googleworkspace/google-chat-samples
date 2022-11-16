/**
 * Copyright 2022 Google LLC.
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
// [START hangouts_chat_preview_link]

/**
 * Updates a card that was attached to a message with a previewed link.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app. Either a new card attached to
 * the message with the previewed link, or an update to an existing card.
 */
function onCardClick(event) {
  // Checks for the presence of "actionMethodName": "assign" and sets
  // actionResponse.type to "UPDATE_USER"MESSAGE_CARDS" if present or
  // "UPDATE_MESSAGE" if absent.
  const actionResponseType = event.action.actionMethodName === 'assign' ?
    'UPDATE_USER_MESSAGE_CARDS' :
    'UPDATE_MESSAGE';

  if (event.action.actionMethodName === 'assign') {
    return assignCase(actionResponseType);
  }
}

/**
 * Updates a card to say that "You" are the assignee after clicking the Assign
 * to Me button.
 *
 * @param {String} actionResponseType Which actionResponse the Chat app should
 * use to update the attached card based on who created the message.
 * @return {Object} Response from the Chat app. Updates the card attached to
 * the message with the previewed link.
 */
function assignCase(actionResponseType) {
  return {
    'actionResponse': {

      // Dynamically returns the correct actionResponse type.
      'type': actionResponseType,
    },
    // Preview card details
    'cards': [{}],
  };
}

// [END hangouts_chat_preview_link]
