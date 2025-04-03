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
// [START chat_incident_response_docs]

/**
 * Creates a Doc in the user's Google Drive and writes a summary of the incident information to it.
 *
 * @param {string} title The title of the incident
 * @param {string} resolution Incident resolution described by the user
 * @param {string} chatHistory The whole Chat history be included in the document
 * @param {string} chatSummary A summary of the Chat conversation to be included in the document
 * @return {string} the URL of the created Doc
 */
function createDoc_(title, resolution, chatHistory, chatSummary) {
  let doc = DocumentApp.create(title);
  let body = doc.getBody();
  body.appendParagraph(`Post-Mortem: ${title}`).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph("Resolution").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(resolution);
  body.appendParagraph("Summary of the conversation").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(chatSummary);
  body.appendParagraph("Full Chat history").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(chatHistory);
  return doc.getUrl();
}
// [END chat_incident_response_docs]