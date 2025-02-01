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

// [START chat_avatar_app]
const functions = require('@google-cloud/functions-framework');

// Command IDs (configure these in Google Chat API)
const ABOUT_COMMAND_ID = 1; // ID for the "/about" slash command
const HELP_COMMAND_ID = 2; // ID for the "Help" quick command

/**
 * Google Cloud Function that handles HTTP requests from Google Chat.
 *
 * @param {Object} req - The HTTP request object sent from Google Chat.
 * @param {Object} res - The HTTP response object.
 */
functions.http('avatarApp', (req, res) => {
  const event = req.body;

  if (event.appCommandMetadata) {
    handleAppCommands(event, res);
  } else {
    handleRegularMessage(event, res);
  }
});

// [START chat_avatar_slash_command]
/**
 * Handles slash and quick commands.
 *
 * @param {Object} event - The Google Chat event.
 * @param {Object} res - The HTTP response object.
 */
function handleAppCommands(event, res) {
  const {appCommandId, appCommandType} = event.appCommandMetadata;

  switch (appCommandId) {
    case ABOUT_COMMAND_ID:
      return res.send({
        privateMessageViewer: event.user,
        text: 'The Avatar app replies to Google Chat messages.'
      });
    case HELP_COMMAND_ID:
      return res.send({
        privateMessageViewer: event.user,
        text: 'The Avatar app replies to Google Chat messages.'
      });
  }
}
// [END chat_avatar_slash_command]

/**
 * Handles regular messages (not commands).
 *
 * @param {Object} event - The Google Chat event.
 * @param {Object} res - The HTTP response object.
 */
function handleRegularMessage(event, res) {
  const messageData = createMessage(event.user);
  res.send(messageData);
}

/**
 * Creates a card message with the user's avatar.
 *
 * @param {Object} user - The user who sent the message.
 * @param {string} user.displayName - The user's display name.
 * @param {string} user.avatarUrl - The URL of the user's avatar.
 * @return {Object} - The card message object.
 */
function createMessage({displayName, avatarUrl}) {
  return {
    text: 'Here\'s your avatar',
    cardsV2: [{
      cardId: 'avatarCard',
      card: {
        name: 'Avatar Card',
        header: {
          title: `Hello ${displayName}!`,
        },
        sections: [{
          widgets: [
            {textParagraph: {text: 'Your avatar picture:'}},
            {image: {imageUrl: avatarUrl}},
          ],
        }],
      },
    }],
  };
}
// [END chat_avatar_app]
