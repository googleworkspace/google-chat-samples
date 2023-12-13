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
 * @fileoverview Service that handles database operations.
 *
 * The database contains a collection to store the
 * [Chat spaces](https://developers.google.com/chat/concepts#messages-and-spaces)
 * that the app is installed in, with subcollections for user stories and
 * [Chat users](https://developers.google.com/chat/identify-reference-users):
 *
 * - `spaces` collection
 *   - `userStories` subcollection
 *   - `users` subcollection
 */

/** [Firestore](https://cloud.google.com/firestore/docs) client library. */
const { Firestore, FieldPath } = require('@google-cloud/firestore');
const { NotFoundException } = require('../model/exceptions');
const { UserStory } = require('../model/user-story');
const { User } = require('../model/user');

/** The prefix used by the Google Chat API in the Space resource name. */
const SPACES_PREFIX = 'spaces/';

/** The name of the spaces collection in the database. */
const SPACES_COLLECTION = 'spaces';

/** The name of the user stories subcollection in the database. */
const USER_STORIES_COLLECTION = 'userStories';

/** The name of the users subcollection in the database. */
const USERS_COLLECTION = 'users';

/** The size of the batch for collection clean up operations. */
const BATCH_SIZE = 50;

// Initialize the Firestore database using Application Default Credentials.
const db = new Firestore();

/**
 * Returns a reference to the user stories subcollection for a space.
 * @param {!string} spaceName The resource name of the space.
 * @return {FirebaseFirestore.CollectionReference} A reference to the user
 *     stories subcollection for the space.
 */
function getUserStoriesCollection(spaceName) {
  return db
    .collection(SPACES_COLLECTION)
    .doc(spaceName.replace(SPACES_PREFIX, ''))
    .collection(USER_STORIES_COLLECTION);
}

/**
 * Returns a reference to the users subcollection for a space.
 * @param {!string} spaceName The resource name of the space.
 * @return {FirebaseFirestore.CollectionReference} A reference to the users
 *     subcollection for the space.
 */
function getUsersCollection(spaceName) {
  return db
    .collection(SPACES_COLLECTION)
    .doc(spaceName.replace(SPACES_PREFIX, ''))
    .collection(USERS_COLLECTION);
}

/**
 * Batch delete all the documents returned from the specified query, with
 * support for resolving a promise after all the documents are deleted.
 * (Function copied from
 * https://cloud.google.com/firestore/docs/manage-data/delete-data#collections).
 * @param {FirebaseFirestore.Query} query The query to fetch documents from.
 * @param {function()} resolve Function to resolve the promise after all the
 *     documents are deleted.
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
 * Service to read and write user stories in storage using Cloud Firestore.
 */
exports.FirestoreService = {

  /**
   * Adds a space to storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {?string} displayName The display name of the space.
   * @return {Promise<void>}
   */
  createSpace: async function (spaceName, displayName) {
    let data = {};
    if (displayName) {
      data.displayName = displayName
    };
    const docRef = db
      .collection(SPACES_COLLECTION)
      .doc(spaceName.replace(SPACES_PREFIX, ''));
    await docRef.set(data);
  },

  /**
   * Deletes a space from storage. Also deletes any user stories in the space.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  deleteSpace: async function (spaceName) {
    await this.cleanupUserStories(spaceName);
    await this.cleanupUsers(spaceName);
    const docRef = db
      .collection(SPACES_COLLECTION)
      .doc(spaceName.replace(SPACES_PREFIX, ''));
    await docRef.delete();
  },

  /**
   * Fetches a user story from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @return {Promise<UserStory>} The fetched user story data.
   * @throws {NotFoundException} If the user story does not exist.
   */
  getUserStory: async function (spaceName, id) {
    const collectionRef = getUserStoriesCollection(spaceName);
    const doc = await collectionRef.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('User story not found.');
    }
    return new UserStory(id, doc.data());
  },

  /**
   * Creates a new user story in storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!Object} data The data to persist.
   * @return {Promise<UserStory>} The created user story data.
   */
  createUserStory: async function (spaceName, data) {
    const collectionRef = getUserStoriesCollection(spaceName);
    const docRef = await collectionRef.add(data);
    const doc = await docRef.get();
    return new UserStory(doc.id, doc.data());
  },

  /**
   * Updates an existing user story in storage.
   * Only the fields provided in `data` are updated.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} id The ID of the user story in storage.
   * @param {!Object} data The data to persist.
   * @return {Promise<UserStory>} The updated user story data.
   */
  updateUserStory: async function (spaceName, id, data) {
    const collectionRef = getUserStoriesCollection(spaceName);
    await collectionRef.doc(id).update(data);
    const doc = await collectionRef.doc(id).get()
    return new UserStory(id, doc.data());
  },

  /**
   * Lists all the user stories in storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<UserStory[]>} An array with the fetched user story data.
   */
  listAllUserStories: async function (spaceName) {
    let userStories = [];
    const collectionRef = getUserStoriesCollection(spaceName);
    const snapshot = await collectionRef.get();
    snapshot.forEach((doc) =>
      userStories.push(new UserStory(doc.id, doc.data())));
    return userStories;
  },

  /**
   * Lists all the user stories in storage assigned to the specified user.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} userId The ID of the user.
   * @return {Promise<UserStory[]>} An array with the fetched user story data.
   */
  listUserStoriesByUser: async function (spaceName, userId) {
    let userStories = [];
    const collectionRef = getUserStoriesCollection(spaceName);
    const snapshot =
      await collectionRef.where('assignee', '==', userId).get();
    snapshot.forEach((doc) =>
      userStories.push(new UserStory(doc.id, doc.data())));
    return userStories;
  },

  /**
   * Deletes all the user stories in storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  cleanupUserStories: async function (spaceName) {
    const collectionRef = getUserStoriesCollection(spaceName);
    const query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
  },

  /**
   * Fetches a user from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} userId The ID of the user.
   * @return {Promise<User>} The fetched user data.
   * @throws {NotFoundException} If the user does not exist.
   */
  getUser: async function (spaceName, userId) {
    const collectionRef = getUsersCollection(spaceName);
    const doc = await collectionRef.doc(userId).get();
    if (!doc.exists) {
      throw new NotFoundException('User not found.');
    }
    return new User(userId, doc.data().displayName, doc.data().avatarUrl);
  },

  /**
   * Fetches multiple users from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string[]} userIds The IDs of the users.
   * @return {Promise<Object<string, !User>>} The fetched user data in a map.
   */
  getUsers: async function (spaceName, userIds) {
    let users = {};
    if (userIds.length === 0) {
      return users;
    }
    const collectionRef = getUsersCollection(spaceName);
    const snapshot =
      await collectionRef.where(FieldPath.documentId(), 'in', userIds).get();
    snapshot.forEach((doc) => users[doc.id] =
      new User(doc.id, doc.data().displayName, doc.data().avatarUrl));
    return users;
  },

  /**
   * Adds information about a user to storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!User} user The user data to persist.
   * @return {Promise<void>}
   */
  createOrUpdateUser: async function (spaceName, user) {
    let data = { displayName: user.displayName };
    if (user.avatarUrl) {
      data.avatarUrl = user.avatarUrl;
    }
    const collectionRef = getUsersCollection(spaceName);
    const docRef = collectionRef.doc(user.id);
    await docRef.set(data);
  },

  /**
   * Deletes all the users in storage.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  cleanupUsers: async function (spaceName) {
    const collectionRef = getUsersCollection(spaceName);
    const query = collectionRef.orderBy('__name__').limit(BATCH_SIZE);
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
  },

};
