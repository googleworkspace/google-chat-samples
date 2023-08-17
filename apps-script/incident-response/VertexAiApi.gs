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
 * Summarizes a Chat conversation using the Vertex AI text prediction API.
 *
 * @param {string} chatHistory The Chat history that will be summarized.
 * @return {string} The content from the text prediction response.
 */
function summarizeChatHistory_(chatHistory) {
  return callVertexTextAI_(`${SUMMARIZE_CHAT_HISTORY_PROMPT}\n\n${chatHistory}`);
}

/**
 * Executes a Vertex AI API request for text prediction.
 *
 * @param {string} prompt The prompt to send to the text prediction model.
 * @return {string} The content from the text prediction response.
 */
function callVertexTextAI_(prompt) {
  const request = {
    instances: [
      { prompt: prompt }
    ],
    parameters: {
      temperature: 0.2,
      maxOutputTokens: 256,
      topK: 40,
      topP: 0.95
    }
  }
  const fetchOptions = {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    contentType: 'application/json',
    payload: JSON.stringify(request)
  }
  const response = UrlFetchApp.fetch(VERTEX_TEXT_AI_ENDPOINT, fetchOptions);
  const payload = JSON.parse(response.getContentText());
  return payload.predictions[0].content;
}

// [END google_chat_incident_response]
