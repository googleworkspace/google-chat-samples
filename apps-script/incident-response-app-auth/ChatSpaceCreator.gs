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
// [START handle_incident_with_application_credentials]

/**
 * Handles an incident by creating a chat space, adding members, and posting a message.
 * All the actions are done using application credentials.
 *
 * @param {Object} formData - The data submitted by the user. It should contain the fields:
 *                           - title: The display name of the chat space.
 *                           - description: The description of the incident.
 *                           - users: A comma-separated string of user emails to be added to the space.
 * @return {string} The resource name of the new space.
 */
function handleIncident(formData) {
  const users = formData.users.trim().length > 0 ? formData.users.split(',') : [];
  const service = getService_();
  if (!service.hasAccess()) {
    console.error(service.getLastError());
    return;
   }
  const spaceName = createChatSpace_(formData.title, service);
  createHumanMembership_(spaceName, getUserEmail(), service);
  for (const user of users ){
    createHumanMembership_(spaceName, user, service);
  }
  createMessage_(spaceName, formData.description, service);
  return spaceName;
}
/**
 * Creates a chat space with application credentials.
 *
 * @param {string} displayName - The name of the chat space.
 * @param {object} service - The credentials of the service account.
 * @returns {string} The resource name of the new space.
*/
function createChatSpace_(displayName, service) {
  try {
    // For private apps, the alias can be used
    const my_customer_alias = "customers/my_customer";
    // Specify the space to create.
    const space = {
        displayName: displayName,
        spaceType: 'SPACE',                
        customer: my_customer_alias
    };
    // Call Chat API with a service account to create a message.
    const createdSpace = Chat.Spaces.create(
        space,
        {},
        // Authenticate with the service account token.
        {'Authorization': 'Bearer ' + service.getAccessToken()});
    return createdSpace.name;
  } catch (err) {
    // TODO (developer) - Handle exception.
    console.log('Failed to create space with error %s', err.message);
  }
}
/*
 * Creates a chat message with application credentials.
 *
 * @param {string} spaceName - The resource name of the space.
 * @param {string} message - The text to be posted.
 * @param {object} service - The credentials of the service account.
 * @return {string} the resource name of the new space.
 */
function createMessage_(spaceName, message, service) {
  try {
    // Call Chat API with a service account to create a message.
    const result = Chat.Spaces.Messages.create(
        {'text': message},
        spaceName,
        {},
        // Authenticate with the service account token.
        {'Authorization': 'Bearer ' + service.getAccessToken()});

  } catch (err) {
    // TODO (developer) - Handle exception.
    console.log('Failed to create message with error %s', err.message);
  }
}
/**
 * Creates a human membership in a chat space with application credentials.
 *
 * @param {string} spaceName - The resource name of the space.
 * @param {string} email - The email of the user to be added.
 * @param {object} service - The credentials of the service account.
 */
function createHumanMembership_(spaceName, email, service){
  try{
    const membership = {
      member: {
        name: 'users/'+email,
        // User type for the membership
        type: 'HUMAN'
      }
    };
    const result = Chat.Spaces.Members.create(
      membership,
      spaceName,
      {},
      {'Authorization': 'Bearer ' + service.getAccessToken()}
    );
  } catch (err){
    console.log('Failed to create membership with error %s', err.message)
  }

}

 /*
 * Creates a service for the service account.
 * @return {object}  - The credentials of the service account.
 */
function getService_() {
  return OAuth2.createService(APP_CREDENTIALS.client_email)
      .setTokenUrl('https://oauth2.googleapis.com/token')
      .setPrivateKey(APP_CREDENTIALS.private_key)
      .setIssuer(APP_CREDENTIALS.client_email)
      .setSubject(APP_CREDENTIALS.client_email)
      .setScope(APP_CREDENTIALS_SCOPES)
      .setPropertyStore(PropertiesService.getScriptProperties());
}
// [END handle_incident_with_application_credentials]