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
 * @fileoverview The main script for the project, which starts an Express app
 * to listen to HTTP requests from Chat events and the OAuth flow callback.
 */

import express from 'express';
import {oauth2callback} from './oauth-flow.js';
import {verifyGoogleChatRequest} from './request-verifier.js';
import {postWithUserCredentials} from './user-auth-post.js';

/**
 * Processes invocation events from Chat.
 * @param {!Object} event The event received from Google Chat.
 * @return {Promise<Object>} A response message to send back to Chat.
 */
async function processChatEvent(event) {
  const message = event.message;
  if (!message) {
    // Ignore events that don't contain a message.
    return {};
  }
  // Post a message back to the same Chat space using user credentials.
  return postWithUserCredentials(event);
}

// Initialize an Express app to handle routing.
const app = express()
    .use(express.urlencoded({extended: false}))
    .use(express.json())
    .enable('trust proxy');

/** App route that handles unsupported GET requests. */
app.get('/', (_, res) => {
  res.send('Hello! This endpoint is meant to be called from Google Chat.');
});

/**
 * App route that handles callback requests from the OAuth2 authorization flow.
 * The handler exhanges the code received from the OAuth2 server with a set of
 * credentials, stores the authentication and refresh tokens in the database,
 * and redirects the request to the config complete URL provided in the request.
 */
app.get('/oauth2', async (req, res) => {
  await oauth2callback(req, res);
});

/** App route that responds to interaction events from Google Chat. */
app.post('/', async (req, res) => {
  if (!(await verifyGoogleChatRequest(req))) {
    res.send('Hello! This endpoint is meant to be called from Google Chat.');
    return;
  }
  const event = req.body;
  const responseMessage = await processChatEvent(event);
  res.json(responseMessage);
});

// Start listening for requests.
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running in port - ${PORT}`);
});
