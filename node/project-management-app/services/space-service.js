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
 * [Chat spaces](https://developers.google.com/chat/concepts#messages-and-spaces).
 */

const { FirestoreService } = require('./firestore-service');

/**
 * Service that executes all the Space application logic.
 */
exports.SpaceService = {

  /**
   * Creates a new space in storage with the given display name.
   * @param {!string} spaceName The resource name of the space.
   * @param {?string} displayName The display name of the space.
   * @return {Promise<void>}
   */
  createSpace: async function (spaceName, displayName) {
    return FirestoreService.createSpace(spaceName, displayName);
  },

  /**
   * Deletes a space from storage. Also deletes any user stories in the space.
   * @param {!string} spaceName The resource name of the space.
   * @return {Promise<void>}
   */
  deleteSpace: async function (spaceName) {
    return FirestoreService.deleteSpace(spaceName);
  },

}
