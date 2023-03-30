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
 * Responds to messages that have links whose URLs match URL patterns
 * configured for link previewing.
 *
 * @param {Object} req Request sent from Google Chat.
 * @param {Object} res Response to send back.
 */
exports.onMessage = (req, res) => {
  if (req.method === 'GET' || !req.body.message) {
    res.send(
        'Hello! This function is meant to be used in a Google Chat Space.');
  }

  // Respond to button clicks on attached cards
  if (req.body.type === 'CARD_CLICKED') {
    // Checks for the presence of "actionMethodName": "assign" and sets
    // actionResponse.type to "UPDATE_USER"MESSAGE_CARDS" if present or
    // "UPDATE_MESSAGE" if absent.
    const actionResponseType = req.body.action.actionMethodName === 'assign' ?
      'UPDATE_USER_MESSAGE_CARDS' :
      'UPDATE_MESSAGE';

    if (req.body.action.actionMethodName === 'assign') {
      res.json({
        'actionResponse': {

          // Dynamically returns the correct actionResponse type.
          'type': actionResponseType,
        },

        // Preview card details
        'cardsV2': [{}],
      });
    }
  }
};

// [END hangouts_chat_preview_link]
