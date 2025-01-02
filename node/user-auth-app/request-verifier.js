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
 * @fileoverview Utility to verify that an HTTP request was sent by Google Chat.
 */

import {OAuth2Client} from 'google-auth-library';

// Bearer Tokens received by apps will always specify this issuer.
const CHAT_ISSUER = 'chat@system.gserviceaccount.com';

/**
 * Verifies that an HTTP request was sent by Google Chat.
 * @param {!Object} req An Express-style HTTP request.
 * @return {Promise<boolean>} `true` if the bearer token in the request is valid
 *     and sent by Google Chat to this server; `false` otherwise.
 */
export async function verifyGoogleChatRequest(req) {
  // Extract the signed token sent by Google Chat from the request.
  const authorization = req.headers.authorization;
  const token = authorization.substring('Bearer '.length, authorization.length);

  // The ID token audience should correspond to the server URl.
  const audience = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  // Verify valid token, signed by CHAT_ISSUER, intended for this server.
  try {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: audience,
    });
    return ticket.getPayload().email_verified &&
        ticket.getPayload().email === CHAT_ISSUER;
  } catch (unused) {
    return false;
  }
}
