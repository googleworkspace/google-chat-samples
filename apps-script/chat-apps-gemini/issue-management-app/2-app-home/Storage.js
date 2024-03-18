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

// This script contains the storage-specific utilities functions.

/**
 * Contains the issues.
 */
const appProperties = PropertiesService.getScriptProperties();

/**
 * Saves a new issue.
 * 
 * @param {string} title the title of the issue
 * @param {string} description the description of the issue
 * @param {string} spaceId the ID of dedicated space of the issue
 * @return {object} the newly stored issue
 */
function saveCreatedIssue(title, description, spaceId) {
  appProperties.setProperty(spaceId, JSON.stringify({
    title: title,
    description: description,
    spaceId: spaceId.replace("spaces/", ""),
    status: "OPENED",
    resolution : "",
    reportUrl: ""
  }));

  return JSON.parse(appProperties.getProperty(spaceId));
}

/**
 * Closes an existing issue.
 * 
 * @param {string} spaceId the ID of dedicated space of the issue
 * @param {string} resolution the resolution of the issue
 * @param {string} reportUrl the report URL of the issue
 * @return {object} the newly closed issue
 */
function saveClosedIssue(spaceId, resolution, reportUrl) {
  var issue = JSON.parse(appProperties.getProperty(spaceId));
  issue.status = "CLOSED",
  issue.resolution = resolution ? resolution : "Unknown";
  issue.reportUrl = reportUrl;
  appProperties.setProperty(spaceId, JSON.stringify(issue));

  return issue;
}
