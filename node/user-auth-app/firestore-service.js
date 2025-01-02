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
 * @fileoverview Service that handles database operations.
 */

import {Firestore} from '@google-cloud/firestore';

/**
 @typedef Tokens
 @type {Object}
 @property {string} accessToken The OAuth access token for the user.
 @property {string} refreshToken The OAuth refresh token for the user.
 */

/** The prefix used by the Google Chat API in the User resource name. */
const USERS_PREFIX = 'users/';

/** The name of the users collection in the database. */
const USERS_COLLECTION = 'users';

// Initialize the Firestore database using Application Default Credentials.
const db = new Firestore({databaseId: 'auth-data'});

/** Service that saves and loads OAuth user tokens on Firestore. */
export const FirestoreService = {
  /**
   * Saves the user's OAuth2 tokens to storage.
   * @param {!string} userName The resource name of the user.
   * @param {!string} accessToken The OAuth2 access token.
   * @param {!string} refreshToken The OAuth2 refresh token.
   * @return {Promise<void>}
   */
  saveUserToken: async function(userName, accessToken, refreshToken) {
    const docRef = db
        .collection(USERS_COLLECTION)
        .doc(userName.replace(USERS_PREFIX, ''));
    await docRef.set({accessToken, refreshToken});
  },

  /**
   * Fetches the user's OAuth2 tokens from storage.
   * @param {!string} userName The resource name of the user.
   * @return {Promise<Tokens | null>} The fetched tokens or null if the user is
   *     not found in the database.
   */
  getUserToken: async function(userName) {
    const doc = await db
        .collection(USERS_COLLECTION)
        .doc(userName.replace(USERS_PREFIX, ''))
        .get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  },
};
