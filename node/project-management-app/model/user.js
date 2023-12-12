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
 * @fileoverview Definition of classes and enums that the application services
 * use to store and pass user data between functions. They set the data model
 * for the Firestore database.
 */

/**
 * A user that interacted with the app.
 * @record
 */
exports.User = class {
  /**
   * Creates a new user.
   * @param {!string} id The ID of the user.
   * @param {!string} displayName The display name of the user.
   * @param {?string} avatarUrl The avatar URL of the user.
   */
  constructor(id, displayName, avatarUrl) {
    /** @type {!string} The ID of the user. */
    this.id = id;
    /** @type {!string} The display name of the user. */
    this.displayName = displayName;
    /** @type {?string} The avatar URL of the user. */
    this.avatarUrl = avatarUrl;
  }
}
