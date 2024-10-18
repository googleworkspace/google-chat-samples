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
 * @fileoverview Definition of a Cloud Function that responds to subcribed Chat
 * PubSub messages.
 */

/** [Cloud Functions](https://cloud.google.com/functions/docs) client library. */
const functions = require('@google-cloud/functions-framework');
const EventApp = require('./controllers/event-app.js');
const {env} = require('./env.js');

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the PubSub trigger topic receives a message.
functions.cloudEvent('eventsApp', async (cloudEvent) => {
  if (env.logging) {
    console.log(JSON.stringify({message: 'Cloud event', cloudEvent}));
  }
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64message = cloudEvent.data.message.data;
  const event = JSON.parse(Buffer.from(base64message, 'base64').toString());
  const eventType = cloudEvent.data.message.attributes["ce-type"];

  if (env.logging) {
    console.log(JSON.stringify({message: 'Event received', event, eventType}));
  }
  await EventApp.execute(eventType, event);
  if (env.logging) {
    console.log(JSON.stringify({message: 'Event processed'}));
  }
});
