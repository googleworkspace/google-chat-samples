/**
 * Copyright 2018 Google Inc.
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

const express = require('express');
const PORT = process.env.PORT || 8080;
const {OAuth2Client} = require('google-auth-library');

// Authentication audience (either APP_URL or PROJECT_NUMBER)
const audienceType = 'AUDIENCE_TYPE';

// Intended audience of the token:
// - The URL of the app when audienceType is set to APP_URL
// - The project number when audienceType is set to PROJECT_NUMBER
const audience = 'AUDIENCE';

const client = new OAuth2Client();

const app = express()
  .use(express.urlencoded({extended: false}))
  .use(express.json());

app.post('/', async (req, res) => {
  let text = '';

  let authorization = req.headers.authorization;
  if (!(await verifyChatAppRequest(authorization.substring('Bearer '.length, authorization.length)))) {
    text = 'Failed verification!';
  } else if (req.body.type === 'ADDED_TO_SPACE' && req.body.space.type === 'ROOM') {
    // Case 1: When App was added to the ROOM
    text = `Thanks for adding me to ${req.body.space.displayName}`;
  } else if (req.body.type === 'ADDED_TO_SPACE' &&
    // Case 2: When App was added to a DM
    req.body.space.type === 'DM') {
    text = `Thanks for adding me to a DM, ${req.body.user.displayName}`;
  } else if (req.body.type === 'MESSAGE') {
    // Case 3: Texting the App
    text = `Your message : ${req.body.message.text}`;
  }
  return res.json({text});
});

// Determine whether a Google Chat request is legitimate.
async function verifyChatAppRequest(bearer) {
  if (audienceType === 'APP_URL') {
    // [START chat_request_verification_app_url]
    // Bearer Tokens received by apps will always specify this issuer.
    const chatIssuer = 'chat@system.gserviceaccount.com';

    // Verify valid token, signed by chatIssuer, intended for a third party.
    try {
      const ticket = await client.verifyIdToken({
        idToken: bearer,
        audience: audience
      });
      return ticket.getPayload().email_verified
          && ticket.getPayload().email === chatIssuer;
    } catch (unused) {
      return false;
    }
    // [END chat_request_verification_app_url]
  } else if (audienceType === 'PROJECT_NUMBER') {
    // [START chat_request_verification_project_number]
    // Bearer Tokens received by apps will always specify this issuer.
    const chatIssuer = 'chat@system.gserviceaccount.com';

    // Verify valid token, signed by CHAT_ISSUER, intended for a third party.
    try {
      const response = await fetch('https://www.googleapis.com/service_accounts/v1/metadata/x509/' + chatIssuer);
      const certs = await response.json();
      await client.verifySignedJwtWithCertsAsync(
        bearer, certs, audience, [chatIssuer]);
      return true;
    } catch (unused) {
      return false;
    }
    // [END chat_request_verification_project_number]
  }

  // Skip verification if audienceType is not set with supported value
  return true;
}

app.listen(PORT, () => {
  console.log(`Server is running in port - ${PORT}`);
});
