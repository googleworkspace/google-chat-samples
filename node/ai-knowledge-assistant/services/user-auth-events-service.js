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
 * @fileoverview Service that calls the Workspace Events API using the user's
 * credentials to create or renew space subscriptions.
 */

const workspaceevents = require('@googleapis/workspaceevents');
const {env} = require('../env');
const {SubscriptionEventType} = require('../model/events');
const {InvalidTokenException} = require('../model/exceptions');
const {FirestoreService} = require('./firestore-service');
const {initializeOauth2Client} = require('./user-auth');

/**
 * Initializes the Workspace Events API client with user credentials.
 * @param {!string} userName The resource name of the user providing the credentials.
 * @returns {Promise<workspaceevents.workspaceevents_v1.Workspaceevents>} An
 *   initialized Workspace Events API client.
 * @throws {InvalidTokenException} If there are no OAuth2 tokens stored for
 *     the user in the database.
 */
async function initializeWorkspaceEventsClient(userName) {
  // Try to obtain an existing OAuth2 token from storage.
  const tokens = await FirestoreService.getUserToken(userName);
  if (tokens === null) {
    throw new InvalidTokenException('Token not found');
  }

  // Authenticate with the user's OAuth2 tokens.
  const credentials = {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  };
  const oauth2Client = initializeOauth2Client(credentials);

  // Create the Chat API client with user credentials.
  const workspaceEventsClient = workspaceevents.workspaceevents({
    version: 'v1',
    auth: oauth2Client
  });
  return workspaceEventsClient;
}

/**
 * Service to create and renew space subscriptions in Google Chat.
 */
exports.UserAuthEventsService = {

  /**
   * Creates a space subscription for a Google Chat space by calling the
   * Workspace Events API with user credentials.
   *
   * <p>The following event types are included in the subscription:
   *
   * <ul>
   *   <li>google.workspace.chat.message.v1.created
   *   <li>google.workspace.chat.message.v1.updated
   *   <li>google.workspace.chat.message.v1.deleted
   * </ul>
   *
   * <p>Uses the method
   * [subscriptions.create](https://developers.google.com/workspace/events/reference/rest/v1/subscriptions/create)
   * from the Workspace Events REST API.
   *
   * @param {!string} spaceName The resource name of the space in Google Chat.
   * @param {!string} userName The resource name of the user whose credentials
   *     will be used to call the Chat API.
   * @returns {Promise<workspaceevents.workspaceevents_v1.Schema$Operation>}
   *     A long-running operation resource that is the result of the
   *     subscription creation.
   * @throws {InvalidTokenException} If there are no OAuth2 tokens stored for
   *     the user in the database or the call to the Events API fails.
   */
  createSpaceSubscription: async function (spaceName, userName) {
    const workspaceEventsClient = await initializeWorkspaceEventsClient(userName);
    const subscription = {
      // The space to create the space subscription.
      targetResource: "//chat.googleapis.com/" + spaceName,
      // The event type to subscribe to.
      eventTypes: [
        SubscriptionEventType.MESSAGE_CREATED,
        SubscriptionEventType.MESSAGE_UPDATED,
        SubscriptionEventType.MESSAGE_DELETED,
      ],
      // The PubSub notification endpoint.
      notificationEndpoint: {
        pubsubTopic: `projects/${env.project}/topics/${env.topic}`
      },
      // The payload options.
      payloadOptions: {
        includeResource: true
      },
    };
    let response;
    try {
      response = await workspaceEventsClient.subscriptions.create({
        requestBody: subscription
      });
    } catch (err) {
      console.error(JSON.stringify({
        message: 'Error calling Workspace Events API CreateSubscription.',
        error: err,
      }));
      if (err.code === 403) {
        await FirestoreService.removeUserToken(userName);
        throw new InvalidTokenException('Invalid token');
      }
      return;
    }
    if (response.status !== 200) {
      console.error('Error calling Workspace Events API CreateSubscription: '
        + response.status + ' - ' + response.statusText);
      return;
    }
    return response.data;
  },

  /**
   * Renews a space subscription for a Google Chat space by calling the
   * Workspace Events API with user credentials.
   *
   * <p>Uses the method
   * [subscriptions.patch](https://developers.google.com/workspace/events/reference/rest/v1/subscriptions/patch)
   * from the Workspace Events REST API.
   *
   * @param {!string} userName The resource name of the user whose credentials
   *     will be used to call the Chat API.
   * @param {!string} subscriptionName The resource name of the subscription.
   * @returns {Promise<workspaceevents.workspaceevents_v1.Schema$Operation[]>}
   *     A long-running operation resource that is the result of the
   *     subscription update.
   * @throws {InvalidTokenException} If there are no OAuth2 tokens stored for
   *     the user in the database or the call to the Events API fails.
   */
  renewSpaceSubscription: async function (userName, subscriptionName) {
    const workspaceEventsClient = await initializeWorkspaceEventsClient(userName);
    const subscription = {
      // Renews with the maximum possible time-to-live (TTL).
      ttl: '0s'
    };
    let response;
    try {
      response = await workspaceEventsClient.subscriptions.patch({
        name: subscriptionName,
        updateMask: 'ttl',
        requestBody: subscription,
      });
    } catch (err) {
      console.error(JSON.stringify({
        message: 'Error calling Workspace Events API PatchSubscription.',
        error: err,
      }));
      if (err.code === 403) {
        await FirestoreService.removeUserToken(userName);
        throw new InvalidTokenException('Invalid token');
      }
      return;
    }
    if (response.status !== 200) {
      console.error('Error calling Workspace Events API PatchSubscription: '
        + response.status + ' - ' + response.statusText);
      return;
    }
    return response.data;
  },
}
