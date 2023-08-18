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
// [START chat_incident_response_vertex]

/**
 * Summarizes a Chat conversation using the Vertex AI text prediction API.
 *
 * @param {string} chatHistory The Chat history that will be summarized.
 * @return {string} The content from the text prediction response.
 */
function summarizeChatHistory_(chatHistory) {
  const prompt =
    "Summarize the following conversation between Engineers resolving an incident"
      + " in a few sentences. Use only the information from the conversation.\n\n"
      + chatHistory;
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
  const response = UrlFetchApp.fetch(
    `https://${VERTEX_AI_LOCATION_ID}-aiplatform.googleapis.com/v1`
      + `/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION_ID}`
      + "/publishers/google/models/text-bison:predict",
    fetchOptions);
  const payload = JSON.parse(response.getContentText());
  return payload.predictions[0].content;
}

// [END chat_incident_response_vertex]
