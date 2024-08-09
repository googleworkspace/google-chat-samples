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

// This script contains the Google Vertex AI-specific utilities functions.

/**
 * Summarizes a Google Chat space history with the Gemini Pro model using Vertex AI API.
 *
 * @param {string} history the history
 * @return {string} the summary
 */
function summarizeSpace(history) {
  const url = `https://${VERTEX_AI_LOCATION_ID}-aiplatform.googleapis.com/v1`
    + `/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION_ID}`
    + "/publishers/google/models/gemini-1.0-pro:generateContent";
  const options = {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    contentType: "application/json",
    payload: JSON.stringify({
      contents: {
        role: "user",
        parts: {
          text: "Summarize the following conversation between engineers resolving an issue"
              + " in a few sentences.\n\n" + history
        }
      },
      safetySettings: {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_LOW_AND_ABOVE"
      },
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    })
  };

  return JSON.parse(UrlFetchApp.fetch(url, options).getContentText())
    .candidates[0].content.parts[0].text;
}
