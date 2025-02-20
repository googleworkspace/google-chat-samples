/**
 * Copyright 2025 Google LLC
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
// [START chat_incident_response_vertex_ai_api]
/**
 * Summarizes a Chat conversation using the Vertex AI text prediction API.
 *
 * @param {string} chatHistory The Chat history that will be summarized.
 * @return {string} The content from the text prediction response.
 */


function summarizeChatHistory_(chatHistory) {
  
  const API_ENDPOINT = `https://${VERTEX_AI_LOCATION_ID}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_LOCATION_ID}/publishers/google/models/${MODEL_ID}:generateContent`;
  const prompt = "Summarize the following conversation between Engineers resolving an incident"
      + " in a few sentences. Use only the information from the conversation.\n\n" + chatHistory;
  // Get the access token.
  const accessToken = ScriptApp.getOAuthToken();

  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json',
  };
  const payload = {
    'contents': {
      'role': 'user',
      'parts' : [
        {
          'text': prompt
        }
      ]
    }
  }
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true,
  };
  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseText);
      console.log(jsonResponse)
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0) {
        return jsonResponse.candidates[0].content.parts[0].text; // Access the summarized text
      } else {
        return "No summary found in response.";
      }

    } else {
      console.error("Vertex AI API Error:", responseCode, responseText);
      return `Error: ${responseCode} - ${responseText}`;
    }
  } catch (e) {
    console.error("UrlFetchApp Error:", e);
    return "Error: " + e.toString();
  }
}
// [END chat_incident_response_vertex_ai_api]