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
 * Summarizes a Google Chat space history using the text-bison model using Vertex AI API.
 *
 * @param {string} history the history
 * @return {string} the summary
 */
function summarizeSpace(history) {
  const url = `https://${VERTEX_AI_LOCATION_ID}-aiplatform.googleapis.com/v1`
    + `/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION_ID}`
    + "/publishers/google/models/text-bison:predict";
  const options = {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    contentType: "application/json",
    payload: JSON.stringify({
      instances: [{
        prompt: "Summarize the following conversation between engineers resolving an issue"
              + " in a few sentences. Use only the information from the conversation.\n\n"
              + history
      }],
      parameters: {
        maxOutputTokens: 256,
        temperature: 0.2,
        topP: 0.95,
        topK: 40
      }
    })
  };

  return JSON.parse(UrlFetchApp.fetch(url, options).getContentText())
    .predictions[0].content;
}

/**
 * Gets feedback on inclusivity for a text using the text-bison model using Vertex AI API.
 * 
 * Returns "It's inclusive!" when it is otherwise a list of word(s) that might not be optimal.
 *
 * @param {string} text the text
 * @return {string} the feedback
 */
function getInclusivityFeedback(text) {
  const url = `https://${VERTEX_AI_LOCATION_ID}-aiplatform.googleapis.com/v1`
    + `/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION_ID}`
    + "/publishers/google/models/gemini-1.0-pro:generateContent";
  const options =  {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    contentType: "application/json",
    payload: JSON.stringify({
      contents: {
        role: "user",
        parts: {
            text: "Are there any words that obviously go against inclusivity in this text:"
              + `\n\n----------\n${text}\n----------\n\n`
              + "If there are not, answer \"It's inclusive!\" "
              + "otherwise list them in a single really short sentence separated by commas."
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
