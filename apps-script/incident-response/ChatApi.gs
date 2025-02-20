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
/**
 * Handles an incident by creating a chat space, adding members, and posting a message.
 * Uses either application credentials or human credentials based on the formData.
 *
 * @param {Object} formData - The data submitted by the user. It should contain the fields:
 *                           - title: The display name of the chat space.
 *                           - description: The description of the incident.
 *                           - users: A comma-separated string of user emails to be added to the space.
 *                           - isAppCredentials: Boolean indicating whether to use application credentials.
 * @return {string} The resource name of the new space.
 */
function handleIncident(formData) {
  const isAppCredentials = formData.isAppCredentials; // Get the isAppCredentials element
  if(isAppCredentials){
    return handleIncidentWithAppCredentials(formData)
  } else{
    return handleIncidentWithHumanCredentials(formData)
  }
}