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
 * @fileoverview Definition of classes and enums that the application services
 * use to store and pass message between functions. They set the data
 * model for the Firestore database.
 */

/**
 * A Chat message managed by the app.
 * @record
 */
exports.Message = class {
  /**
   * Initializes a new Message.
   * @param {!string} name The resource name of the message.
   * @param {!string} text The message text.
   * @param {!string} time The message timestamp.
   */
  constructor(name, text, time) {
    /** @type {!string} The resource name of the message. */
    this.name = name;
    /** @type {!string} The message text. */
    this.text = text;
    /** @type {!string} The message timestamp. */
    this.time = time;
  }
}
