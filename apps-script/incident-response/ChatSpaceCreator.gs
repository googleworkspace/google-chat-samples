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
 * Creates a space in Google Chat with the provided title and members, and posts an
 * initial message to it.
 *
 * @param {Object} formData the data submitted by the user. It should contain the fields
 *                          title, description, and users.
 * @return {string} the resource name of the new space.
 */
function createChatSpace(formData) {
  try {
    const users = formData.users.trim().length > 0 ? formData.users.split(',') : [];
    const spaceName = setUpSpace_(formData.title, users);
    addAppToSpace_(spaceName);
    createMessage_(spaceName, formData.description);
    return spaceName;
  } catch (e) {
    return `ERROR: ${e}`;
  }
}

/**
 * Creates a space in Google Chat with the provided display name and members.
 *
 * @return {string} the resource name of the new space.
 */
function setUpSpace_(displayName, users) {
  const memberships = users.map(email => ({
    member: {
      name: `users/${email}`,
      type: "HUMAN"
    }
  }));
  const space = callSetUpSpace_({
    space: {
      displayName: displayName,
      spaceType: "SPACE",
      externalUserAllowed: true
    },
    memberships: memberships
  });
  return space.name;
}

/**
 * Adds this Chat app to the space.
 *
 * @return {string} the resource name of the new membership.
 */
function addAppToSpace_(spaceName) {
  const membership = callCreateMembership_(spaceName, {
    member: {
      name: "users/app",
      type: "BOT"
    }
  });
  return membership.name;
}

/**
 * Posts a text message to the space on behalf of the user.
 *
 * @return {string} the resource name of the new message.
 */
function createMessage_(spaceName, text) {
  const message = callCreateMessage_(spaceName, {
    text: text
  });
  return message.name;
}

// [END google_chat_incident_response]
