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
 * @fileoverview Module that exports a
 * [widget](https://developers.google.com/chat/api/reference/rest/v1/cards#Widget)
 * object that the Chat app can add to a card to display the assignee of a user
 * story.
 */

const { User } = require('../../model/user');

/**
 * A widget that presents information about the assignee of a user story.
 */
exports.UserStoryAssigneeWidget = class {

  /**
   * Creates a widget that presents information about the assignee of a user
   * story.
   * @param {?string} assignee The ID of the user assigned to the story.
   * @param {?User} user The user assigned to the story.
   */
  constructor(assignee, user) {
    let userDisplayName = assignee ? 'Unknown user' : '-';
    let userAvatar = undefined;
    if (user) {
      userDisplayName = user.displayName;
      if (user.avatarUrl) {
        userAvatar = {
          iconUrl: user.avatarUrl,
          imageType: 'CIRCLE'
        };
      }
    }
    this.decoratedText = {
      topLabel: 'Assigned to',
      text: userDisplayName,
      startIcon: userAvatar
    }
  }

}
