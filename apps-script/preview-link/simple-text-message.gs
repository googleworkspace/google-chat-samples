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
 * @param {Object} event The event object from Chat API.
 *
 * @return {Object} Response from the Chat app attached to the message with
 * the previewed link.
 */
function onMessage(event) {
  // Checks for the presence of event.message.matchedUrl and responds with a
  // text message if present
  if (event.message.matchedUrl) {
    return {
      'text': 'event.message.matchedUrl.url: ' + event.message.matchedUrl.url,
    };
  }

  // If the Chat app doesn’t detect a link preview URL pattern, it says so.
  return {'text': 'No matchedUrl detected.'};
}

// [END hangouts_chat_preview_link]
