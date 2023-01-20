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

  // Checks for the presence of event.message.matchedUrl and responds with a
  // text message if present
  if (req.body.message.matchedUrl) {
    res.json({
      'text': 'req.body.message.matchedUrl.url: ' +
        req.body.message.matchedUrl.url,
    });
  }

  // If the Chat app doesn’t detect a link preview URL pattern, it says so.
  res.json({'text': 'No matchedUrl detected.'});
};

// [END hangouts_chat_preview_link]
