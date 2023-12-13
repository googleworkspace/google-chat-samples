/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Types of user interface where user story cards can appear.
 * @enum {string}
 */
exports.UserStoryCardType = {
  /** Message with a single user story card. */
  SINGLE_MESSAGE: 'single_message',
  /** Message with a list of the user's stories. */
  LIST_MESSAGE: 'list_message',
  /** Dialog with a single user story card. */
  SINGLE_DIALOG: 'single_dialog',
  /** Dialog with a list of user stories. */
  LIST_DIALOG: 'list_dialog',
};
