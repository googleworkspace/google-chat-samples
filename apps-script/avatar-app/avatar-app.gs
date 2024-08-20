/**
 * Copyright 2022 Google LLC
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
// [START chat_avatar_app]

// The ID of the slash command "/about".
// It's not enabled by default, set to the actual ID to enable it. You need to
// use the same ID as set in the Google Chat API configuration.
const ABOUT_COMMAND_ID = null;

/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onMessage(event) {

  // [START chat_avatar_slash_command]
  // Checks for the presence of a slash command in the message.
  if (event.message.slashCommand) {
    // Executes the slash command logic based on its ID.
    // Slash command IDs are set in the Google Chat API configuration.
    switch (event.message.slashCommand.commandId) {
      case ABOUT_COMMAND_ID:
        return {
          privateMessageViewer: event.user,
          text: 'The Avatar app replies to Google Chat messages.'
        };
    }
  }
  // [END chat_avatar_slash_command]

  const displayName = event.message.sender.displayName;
  const avatarUrl = event.message.sender.avatarUrl;
  return createMessage(displayName, avatarUrl);
}

/**
 * Creates a card with two widgets.
 * 
 * @param {string} displayName the sender's display name
 * @param {string} avatarUrl the URL for the sender's avatar
 * @return {Object} a card with the sender's avatar.
 */
function createMessage(displayName, avatarUrl) {
  return {
    text: 'Here\'s your avatar',
    cardsV2: [{
      cardId: 'avatarCard',
      card: {
        name: 'Avatar Card',
        header: {
          title: `Hello ${displayName}!`,
        },
        sections: [{ widgets: [{
          textParagraph: { text: 'Your avatar picture: ' }
        }, {
          image: { imageUrl: avatarUrl }
        }]}]
      }
    }]
  };
}
// [END chat_avatar_app]
