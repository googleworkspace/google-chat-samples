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
 * object that the Chat app can add to a card to display the actions buttons for
 * a user story.
 */

const { UserStory, Status } = require('../../model/user-story');
const { UserStoryCardType } = require('./user-story-card-type');

/**
 * A ButtonList widget with the action buttons for a user story.
 */
exports.UserStoryButtonsWidget = class {

  /**
   * Creates a ButtonList widget with the action buttons for a user story, or an
   * empty object if there are no actions available.
   * @param {!UserStory} userStory A user story.
   * @param {!UserStoryCardType} cardType Type of UI where the card will appear.
   * @param {?boolean} showEdit Whether to include an Edit button.
   * @param {?boolean} showSave Whether to include a Save button.
   */
  constructor(userStory, cardType, showEdit, showSave) {
    if (userStory === null || userStory === undefined) {
      return;
    }
    const userStoryData = userStory.data;
    const parameters = [
      {
        key: 'id',
        value: userStory.id
      },
      {
        key: 'cardType',
        value: cardType
      }
    ];
    const interaction =
      cardType === UserStoryCardType.SINGLE_DIALOG
        || cardType === UserStoryCardType.LIST_DIALOG
        ? 'OPEN_DIALOG' : undefined;
    let buttons = [];
    if (showSave) {
      buttons.push({
        text: 'Save',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/save/materialiconsoutlined/24dp/1x/outline_save_black_24dp.png',
          altText: 'Save',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'saveUserStory',
            // Save action always updates a dialog.
            interaction: 'OPEN_DIALOG',
            parameters: parameters
          }
        }
      });
    }
    if (userStoryData.status !== Status.COMPLETED) {
      buttons.push({
        text: 'Assign to me',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/social/person/materialicons/24dp/1x/baseline_person_black_24dp.png',
          altText: 'Assign to me',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'assignUserStory',
            interaction: interaction,
            parameters: parameters
          }
        }
      });
    }
    if (userStoryData.status === Status.OPEN) {
      buttons.push({
        text: 'Start',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/av/play_arrow/materialicons/24dp/1x/baseline_play_arrow_black_24dp.png',
          altText: 'Start',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'startUserStory',
            interaction: interaction,
            parameters: parameters
          }
        }
      });
    }
    if (userStoryData.status === Status.STARTED) {
      buttons.push({
        text: 'Complete',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/done/materialicons/24dp/1x/baseline_done_black_24dp.png',
          altText: 'Complete',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'completeUserStory',
            interaction: interaction,
            parameters: parameters
          }
        }
      });
    }
    if (showSave) {
      buttons.push({
        text: 'Cancel',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/clear/materialicons/24dp/1x/baseline_clear_black_24dp.png',
          altText: 'Cancel',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'cancelEditUserStory',
            // Cancel action always updates a dialog.
            interaction: 'OPEN_DIALOG',
            parameters: parameters
          }
        }
      });
    }
    if (showEdit) {
      buttons.push({
        text: 'Edit',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/editor/edit_note/materialiconsoutlined/24dp/1x/outline_edit_note_black_24dp.png',
          altText: 'Edit',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'editUserStory',
            // Edit action always opens a dialog.
            interaction: 'OPEN_DIALOG',
            parameters: parameters
          }
        }
      });
    }
    if (cardType === UserStoryCardType.SINGLE_MESSAGE) {
      buttons.push({
        text: 'Refresh',
        icon: {
          iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/navigation/refresh/materialicons/24dp/1x/baseline_refresh_black_24dp.png',
          altText: 'Refresh',
          imageType: 'CIRCLE'
        },
        onClick: {
          action: {
            function: 'refreshUserStory',
            parameters: parameters
          }
        }
      });
    }
    if (buttons.length > 0) {
      this.buttonList = { buttons };
    }
  }

}
