/**
 * Copyright 2024 Google LLC
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
 * @fileoverview Service that calls the Workspace Events API using the app's
 * credentials to list and delete space subscriptions.
 */

const workspaceevents = require('@googleapis/workspaceevents');
const {SubscriptionEventType} = require('../model/events');

/** The scope needed to call the Workspace Events API as an app. */
const CHAT_BOT_SCOPE = ['https://www.googleapis.com/auth/chat.bot'];

/**
 * Initializes the Workspace Events client with app credentials.
 * @returns {Promise<workspaceevents.workspaceevents_v1.Workspaceevents>} An
 *     initialized Workspace Events  API client.
 */
async function initializeWorkspaceEventsClient() {
  // Authenticate with Application Default Credentials.
  const auth = new workspaceevents.auth.GoogleAuth({scopes: CHAT_BOT_SCOPE});
  const authClient = await auth.getClient();

  // Create the Workspace Events API client with app credentials.
  const workspaceEventsClient = workspaceevents.workspaceevents({
    version: 'v1',
    auth: authClient
  });
  return workspaceEventsClient;
}

/**
 * Service to list and delete space subscriptions in Google Chat.
 */
exports.AppAuthEventsService = {

  /**
   * Deletes space subscriptions for a Google Chat space by calling the
   * Workspace Events API with app credentials.
   *
   * <p>Uses the method
   * [subscriptions.list](https://developers.google.com/workspace/events/reference/rest/v1/subscriptions/list)
   * from the Workspace Events REST API to find the existing subscriptions for
   * the space, and the method
   * [subscriptions.delete](https://developers.google.com/workspace/events/reference/rest/v1/subscriptions/delete)
   * to delete the subscription(s).
   *
   * @param {!string} spaceName The resource name of the space in Google Chat.
   * @returns {Promise<workspaceevents.workspaceevents_v1.Schema$Operation[]>}
   *     A list of long-running operation resources that are the result of the
   *     subscription deletes.
   */
  deleteSpaceSubscriptions: async function (spaceName) {
    const workspaceEventsClient = await initializeWorkspaceEventsClient();
    let promises = [];
    let pageToken = '';
    do {
      let response;
      try {
        response = await workspaceEventsClient.subscriptions.list({
          filter: `event_types: "${SubscriptionEventType.MESSAGE_CREATED}"`
            + ` AND target_resource = "//chat.googleapis.com/${spaceName}"`,
          pageToken: pageToken,
        });
      } catch (err) {
        console.error(JSON.stringify({
          message: 'Error calling Workspace Events API ListSubscriptions.',
          error: err,
        }));
        break;
      }
      if (response.status !== 200) {
        console.error('Error calling Workspace Events API ListSubscriptions: '
          + response.status + ' - ' + response.statusText);
        break;
      }
      if (response.data.subscriptions) {
        response.data.subscriptions.forEach(subscription =>
          promises.push(workspaceEventsClient.subscriptions.delete({
            name: subscription.name,
            allowMissing: true,
          })));
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    return Promise.all(promises);
  },
}
