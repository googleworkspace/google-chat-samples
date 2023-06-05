/**
 * Copyright 2022 Google Inc.
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
/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onMessage(event) {
  const displayName = event.message.sender.displayName;
  const avatarUrl = event.message.sender.avatarUrl;

  return createMessage(displayName, avatarUrl);
}

/**
 * Creates a card with two widgets.
 * @param {string} displayName the sender's display name
 * @param {string} avatarUrl the URL for the sender's avatar
 * @return {Object} a card with the sender's avatar.
 */
function createMessage(displayName, avatarUrl) {
  const cardHeader = {
    title: `Hello ${displayName}!`
  };

  const avatarWidget = {
    textParagraph: {text: 'Your avatar picture: '}
  };

  const avatarImageWidget = {
    image: {imageUrl: avatarUrl}
  };

  const avatarSection = {
    widgets: [
      avatarWidget,
      avatarImageWidget
    ],
  };

  return {
    cardsV2: [{
      cardId: 'avatarCard',
      card: {
        name: 'Avatar Card',
        header: cardHeader,
        sections: [avatarSection],
      }
    }],
  };
}
// [END chat_avatar_app]
