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
 * @fileoverview Definition of a Cloud Function that responds to interaction
 * events from the AI Knowledge Assistant Google Chat app.
 */

/** [Cloud Functions](https://cloud.google.com/functions/docs) client library. */
const functions = require('@google-cloud/functions-framework');
const express = require('express');
const App = require('./controllers/app');
const {oauth2callback} = require('./services/user-auth');
const {env} = require('./env.js');

// Initialize an Express app to handle routing.
const expressApp = express();

/** App route that handles unsupported GET requests. */
expressApp.get('/', (_, res) => {
  res
    .status(400)
    .send('This function is meant to be used in a Google Chat app.');
});

/**
 * App route that handles callback requests from the OAuth2 authorization flow.
 * The handler exhanges the code received frmo the OAuth2 server with a set of
 * credentials, stores the authentication and refresh tokens in the database,
 * and redirects the request to the config complete URL provided in the request.
 */
expressApp.get('/oauth2', async (req, res) => {
  if (env.logging) {
    console.log('OAuth2 callback request received');
  }
  await oauth2callback(req, res);
});

/**
 * App route that responds to interaction events from Google Chat. It uses the
 * {@code App} object to handle the application logic.
 */
expressApp.post('/', async (req, res) => {
  const event = req.body;
  if (!event.type) {
    res
      .status(400)
      .send('This function is meant to be used in a Google Chat app.');
    return;
  }

  if (env.logging) {
    console.log(JSON.stringify({message: 'Request received', event}));
  }
  const responseMessage = await App.execute(event);
  res.json(responseMessage);
  if (env.logging) {
    console.log(JSON.stringify({message: 'Response sent', responseMessage}));
  }
});

// Export the Express app as the Cloud Function HTTP entry point.
functions.http('app', expressApp);
