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
 * object that the Chat app can add to a card to display a row in a list with
 * data for a single user story.
 */

const { UserStory, StatusIcon } = require('../../model/user-story');

/**
 * A widget that presents information about a user story to be displayed in a
 * user story list.
 */
exports.UserStoryRowWidget = class {

  /**
   * Creates a widget that presents information about a user story to be
   * displayed in a user story list.
   * @param {!UserStory} userStory A user story.
   */
  constructor(userStory) {
    if (userStory === null || userStory === undefined) {
      return;
    }
    const userStoryData = userStory.data;
    this.decoratedText = {
      text: userStoryData.title,
      bottomLabel: 'ID: ' + userStory.id,
      startIcon: {
        iconUrl: StatusIcon[userStoryData.status],
        altText: userStoryData.status,
        imageType: 'CIRCLE'
      },
      button: {
        text: 'Edit',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/editor/edit_note/materialiconsoutlined/24dp/1x/outline_edit_note_black_24dp.png',
          altText: 'Edit',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'editUserStory',
            interaction: 'OPEN_DIALOG',
            parameters: [{
              key: 'id',
              value: userStory.id
            }]
          }
        }
      }
    }
  }

}
