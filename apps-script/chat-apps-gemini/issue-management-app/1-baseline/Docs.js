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

// This script contains the Google Docs-specific utilities functions.

/**
 * Creates an issue report as a Google Doc in the user's Google Drive.
 *
 * @param {string} title the title of the issue
 * @param {string} description the description of the issue
 * @param {string} resolution the resolution of the issue
 * @param {string} history the history of the issue
 * @param {string} summary the summary of the issue
 * @return {string} the URL of the created report
 */
function createReport(title, description, resolution, history, summary) {
  let doc = DocumentApp.create(title);
  let body = doc.getBody();
  body.appendParagraph(`Issue Report: ${title}`).setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph("Description").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(description);
  body.appendParagraph("Resolution").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(resolution);
  body.appendParagraph("Summary").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(summary);
  body.appendParagraph("History").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(history);
  return doc.getUrl();
}
