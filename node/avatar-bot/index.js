/**
 * @license
 * Copyright Google Inc.
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
// [START hangouts_chat_avatar_bot]

/**
 * Google Cloud Function that responds to messages sent from a
 * Hangouts Chat room.
 *
 * @param {Object} req Request sent from Hangouts Chat room
 * @param {Object} res Response to send back
 */
exports.helloHangoutsChat = function helloHangoutsChat(req, res) {
  if (req.method === 'GET' || !req.body.message) {
    res.send('Hello! This function is meant to be used in a Hangouts Chat ' +
     'Room.');
  }

  const sender = req.body.message.sender.displayName;
  const image = req.body.message.sender.avatarUrl;

  const data = createMessage(sender, image);

  res.send(data);
};

/**
 * Creates a card with two widgets.
 * @param {string} displayName the sender's display name
 * @param {string} imageURL the URL for the sender's avatar
 * @return {Object} a card with the user's avatar.
 */
function createMessage(displayName, imageURL) {
  const HEADER = {
    'title': 'Hello ' + displayName + '!',
  };

  const SENDER_IMAGE_WIDGET = {
    'imageUrl': imageURL,
  };

  return {
    'cards': [{
      'header': HEADER,
      'sections': [{
        'widgets': [{
          'textParagraph': {
            'text': 'Your avatar picture:',
          },
        }, {
          'image': SENDER_IMAGE_WIDGET,
        }],
      }],
    }],
  };
}
// [END hangouts_chat_avatar_bot]
