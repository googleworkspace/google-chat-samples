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
// [START chat_incident_response_web]

/**
 * Serves the web page from Index.html.
 */
function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate();
}

/**
 * Serves the web content from the specified filename.
 */
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * Returns the email address of the user running the script.
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

// [END chat_incident_response_web]