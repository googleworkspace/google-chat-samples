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
 * @fileoverview Functions to handle the OAuth authentication flow.
 */

import {OAuth2Client} from 'google-auth-library';
import {readFileSync} from 'fs';
import {parse} from 'url';
import {FirestoreService} from './firestore-service.js';

/**
 @typedef Tokens
 @type {Object}
 @property {string} accessToken The OAuth access token for the user.
 @property {string} refreshToken The OAuth refresh token for the user.
 */

// Application OAuth credentials.
const keys = JSON.parse(readFileSync('./client_secrets.json'));

// Define the app's authorization scopes.
// Note: 'openid' is required to that Google Auth will return a JWT with the
// user id, which we can use to validate that the user who granted consent is
// the same who requested it (to avoid identity theft).
const scopes = [
  'openid',
  'https://www.googleapis.com/auth/chat.messages.create',
];

/**
 * Converts the provided data to a JSON string then encodes it with Base64.
 * @param {!Object} data The data to encode.
 * @return {string} Encoded data
 */
function base64encode(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decodes the provided Base64 JSON string into an object.
 * @param {!string} data The data to decode.
 * @return {Object} Decoded data
*/
function base64decode(data) {
  return JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
}

/**
 * Creates a new OAuth2 client with the configured keys.
 * @return {OAuth2Client} A client with the configured keys but without
 *     initialized credentials.
 */
function createClient() {
  return new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0],
  );
}

/**
 * Initializes an OAuth2 client with the provided user tokens.
 * @param {!Tokens} tokens The OAuth2 access and refresh tokens to use for
 *     authentication.
 * @return {OAuth2Client} An initialized client.
 */
export function initializeOauth2Client(tokens) {
  const credentials = {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  };
  const oauth2Client = createClient();
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
}

/**
 * Generates the URL to start the OAuth2 authorization flow.
 * @param {!string} userName The resource name of the Chat user requesting
 *     authorization.
 * @param {!string} configCompleteRedirectUrl The URL to redirect to after
 *     completing the flow.
 * @return {string} The authorization URL to start the OAuth2 flow. The
 *     provided user name and redirect URL are encoded in the returned URL's
 *     state parameter to be retrieved later by the callback processor.
 */
export function generateAuthUrl(userName, configCompleteRedirectUrl) {
  const oauth2Client = createClient();
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes.join(' '),
    include_granted_scopes: true,
    state: base64encode({userName, configCompleteRedirectUrl}),
  });
  return authorizeUrl;
}

/**
 * Handles an OAuth2 callback request.
 *
 * <p>If the authorization was succesful, it exchanges the received code with
 * the access and refresh tokens and saves them into Firestore to be used when
 * calling the Chat API. Then, it redirects the response to the
 * <code>configCompleteRedirectUrl</code> specified in the authorization URL.
 *
 * <p>If the authorization fails, it just prints an error message to the
 * response.
 *
 * @param {!Object} req An Express-style HTTP request.
 * @param {!Object} res An Express-style HTTP response.
 * @return {Promise<void>}
 */
export async function oauth2callback(req, res) {
  try {
    // Handle the OAuth 2.0 server response.
    const q = parse(req.url, true).query;
    if (q.error) {
      // An error response e.g. error=access_denied.
      console.log('Error: ' + q.error);
      res.send('Error: ' + q.error);
      return;
    }

    // Get access and refresh tokens.
    const oauth2Client = createClient();
    const {tokens} = await oauth2Client.getToken(q.code);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: keys.web.client_id,
    });
    const userId = ticket.getPayload().sub;

    // Save tokens to the database so the app can use them to make API calls.
    await FirestoreService.saveUserToken(
        userId, tokens.access_token || '', tokens.refresh_token || '');

    // Read the state with the userName and configCompleteRedirectUrl from the
    // provided state.
    let state;
    try {
      state = base64decode(q.state);
    } catch (e) {
      console.log('Error: Invalid request state: ' + q.state);
      res.send('Error: Invalid request state.');
      return;
    }

    // Validate that the user who granted consent is the same who requested it.
    if (`users/${userId}` !== state.userName) {
      console.log('Error: token user does not correspond to request user.');
      res.send('Error: the user who granted consent does not correspond to' +
        ' the user who initiated the request. Please start the configuration' +
        ' again and use the same account you\'re using in Google Chat.');
      return;
    }

    // Redirect to the URL that tells Google Chat that the configuration is
    // completed.
    res.redirect(state.configCompleteRedirectUrl);
  } catch (e) {
    const message = e.message || e;
    console.log('Error: ' + message);
    res.send('Error: ' + message);
  }
}
