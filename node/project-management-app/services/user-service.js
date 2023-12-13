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
 * @fileoverview Service with the application logic specific to working with
 * [Chat users](https://developers.google.com/chat/identify-reference-users).
 */

const { NotFoundException } = require('../model/exceptions');
const { User } = require('../model/user');
const { FirestoreService } = require('./firestore-service');

/**
 * Service that executes all the User application logic.
 */
exports.UserService = {

  /**
   * Fetches a user from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string} userId The ID of the user.
   * @return {Promise<User>} The fetched user data.
   * @throws {NotFoundException} If the user does not exist.
   */
  getUser: async function (spaceName, userId) {
    return FirestoreService.getUser(spaceName, userId);
  },

  /**
   * Fetches multiple users from storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!string[]} userIds The IDs of the users.
   * @return {Promise<Object<string, !User>>} The fetched user data in a map.
   */
  getUsers: async function (spaceName, userIds) {
    return FirestoreService.getUsers(spaceName, userIds);
  },

  /**
   * Adds information about a user to storage.
   * @param {!string} spaceName The resource name of the space.
   * @param {!User} user The user data to persist.
   * @return {Promise<void>}
   */
  createOrUpdateUser: async function (spaceName, user) {
    return FirestoreService.createOrUpdateUser(spaceName, user);
  },

}
