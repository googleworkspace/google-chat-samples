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

/**
 * @fileoverview Definition of a Cloud Function that responds to interaction
 * events from the Project Management Google Chat app.
 */

/** [Cloud Functions](https://cloud.google.com/functions/docs) client library */
const functions = require('@google-cloud/functions-framework');
const App = require('./controllers/app');
const { env } = require('./env.js');

/**
 * Cloud Function that responds to interaction events from Google Chat. It uses
 * the {@code App} object to handle the Project Management application logic.
 */
functions.http('projectManagementChatApp', async (req, res) => {
  if (req.method === 'GET' || !req.body.message) {
    res
      .status(400)
      .send('This function is meant to be used in a Google Chat app.');
    return;
  }

  const event = req.body;
  if (env.logging) {
    console.log(JSON.stringify({ message: 'Request received', event }));
  }
  const responseMessage = await App.execute(event);
  res.json(responseMessage);
  if (env.logging) {
    console.log(JSON.stringify({ message: 'Response sent', responseMessage }));
  }
});
