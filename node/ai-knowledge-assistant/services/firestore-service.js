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
 * @fileoverview Service that handles database operations.
 *
 * The database contains a collection to store the
 * [Chat spaces](https://developers.google.com/workspace/chat/overview#messages-and-spaces)
 * that the app is installed in, with subcollections for the
 * [messages](https://developers.google.com/workspace/chat/messages-overview) in
 * the space.
 *
 * Another collection stores the application's
 * [users](https://developers.google.com/workspace/chat/identify-reference-users)
 * and their Oauth tokens used to call the Chat API.
 *
 * - `spaces` collection
 *   - `messages` subcollection
 * - `users` collection
 */

/** [Firestore](https://cloud.google.com/firestore/docs) client library. */
const {Firestore} = require('@google-cloud/firestore');
const {Message} = require('../model/message');

/** The prefix used by the Google Chat API in the Space resource name. */
const SPACES_PREFIX = 'spaces/';

/** The name of the spaces collection in the database. */
const SPACES_COLLECTION = 'spaces';

/** The prefix used by the Google Chat API in the Message resource name. */
const MESSAGES_PREFIX = '/messages/';

/** The name of the messages subcollection in the database. */
const MESSAGE_COLLECTION = 'messages';

/** The prefix used by the Google Chat API in the User resource name. */
const USERS_PREFIX = 'users/';

/** The name of the users collection in the database. */
const USERS_COLLECTION = 'users';

/** The size of the batch for collection clean up operations. */
const BATCH_SIZE = 50;

// Initialize the Firestore database using Application Default Credentials.
const db = new Firestore();

/**
 * Returns a reference to the messages subcollection for a space.
 * @param {!string} spaceName The resource name of the space.
 * @return {FirebaseFirestore.CollectionReference} A reference to the messages
 *                                                 subcollection for the space.
 */
function getMessagesCollection(spaceName) {
  return db
    .collection(SPACES_COLLECTION)
    .doc(spaceName.replace(SPACES_PREFIX, ''))
    .collection(MESSAGE_COLLECTION);
}

/**
 * Batch delete all the documents returned from the specified query, with
 * support for resolving a promise after all the documents are deleted.
 * (Function copied from
 * https://cloud.google.com/firestore/docs/manage-data/delete-data#collections).
 * @param {FirebaseFirestore.Query} query The query to fetch documents from.
 * @param {function()} resolve Function to resolve the promise after all the
 *                             documents are deleted.
 * @return {Promise<void>}
 */
async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

/**
 * Service to read and write Chat messages in storage using Cloud Firestore.
 */
exports.FirestoreService = {

  /**
   * Adds a space to storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  createSpace: async function (spaceName) {
    const docRef = db
      .collection(SPACES_COLLECTION)
      .doc(spaceName.replace(SPACES_PREFIX, ''));
    await docRef.set({spaceName});
  },

  /**
   * Deletes a space from storage. Also deletes any messages in the space.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  deleteSpace: async function (spaceName) {
    await this.cleanupMessages(spaceName);
    const docRef = db
      .collection(SPACES_COLLECTION)
      .doc(spaceName.replace(SPACES_PREFIX, ''));
    await docRef.delete();
  },

  /**
   * Creates or updates multiple messages in storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!Message[]} messages The Message data to persist.
   * @return {Promise<Void>}
   */
  createOrUpdateMessages: async function (spaceName, messages = []) {
    messages.forEach(message => this.createOrUpdateMessage(spaceName, message));
  },

  /**
   * Creates or updates a message in storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!Message} message The Message data to persist.
   * @return {Promise<Void>}
   */
  createOrUpdateMessage: async function (spaceName, message) {
    const id =
      message.name.replace(spaceName + MESSAGES_PREFIX, '');
    const collectionRef = getMessagesCollection(spaceName);
    const docRef = collectionRef.doc(id);
    await docRef.set({
      text: message.text,
      time: message.time,
    });
  },

  /**
   * Lists all the messages in a space.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<Message[]>} An array with the fetched messages.
   */
  listMessages: async function (spaceName) {
    let messages = [];
    const collectionRef = getMessagesCollection(spaceName);
    const snapshot = await collectionRef.orderBy('time').get();

    snapshot.forEach((doc) =>
      messages.push(new Message(
        spaceName + MESSAGES_PREFIX + doc.id,
        doc.data().text,
        doc.data().time,
      )));
    return messages;
  },

  /**
   * Deletes a message from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} messageName The resource name of the message.
   * @return {Promise<void>}
   */
  deleteMessage: async function (spaceName, messageName) {
    const id = messageName.replace(spaceName + MESSAGES_PREFIX, '');
    const collectionRef = getMessagesCollection(spaceName);
    const docRef = collectionRef.doc(id);
    await docRef.delete();
  },

  /**
   * Deletes all the messages in storage for a space.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  cleanupMessages: async function (spaceName) {
    const collectionRef = getMessagesCollection(spaceName);
    const query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
  },

  /**
   * Saves the user's OAuth2 tokens to storage.
   * @param {!string} userName The resource name of the user.
   * @param {!string} accessToken The OAuth2 access token.
   * @param {!string} refreshToken The OAuth2 refresh token.
   * @return {Promise<void>}
   */
  saveUserToken: async function (userName, accessToken, refreshToken) {
    const docRef = db
      .collection(USERS_COLLECTION)
      .doc(userName.replace(USERS_PREFIX, ''));
    await docRef.set({accessToken, refreshToken});
  },

  /**
   * Fetches the user's OAuth2 tokens from storage.
   * @param {!string} userName The resource name of the user.
   * @return {Promise<Object | null>} The fetched tokens or null if the user is
   *                                  not found in the database.
   */
  getUserToken: async function (userName) {
    const doc = await db
      .collection(USERS_COLLECTION)
      .doc(userName.replace(USERS_PREFIX, ''))
      .get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  },

  /**
   * Removes the user's OAuth2 tokens from storage.
   * @param {!string} userName The resource name of the user.
   * @return {Promise<void>}
   */
  removeUserToken: async function (userName) {
    const docRef = db
      .collection(USERS_COLLECTION)
      .doc(userName.replace(USERS_PREFIX, ''));
    await docRef.delete();
  },
};
