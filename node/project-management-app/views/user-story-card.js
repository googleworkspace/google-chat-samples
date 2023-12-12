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
 * [card](https://developers.google.com/chat/api/guides/v1/messages/create#create)
 * object that the Chat app then sends back to Chat in a message or
 * [dialog](https://developers.google.com/chat/how-tos/dialogs) with a standard
 * view of a user story.
 */

const { UserStory, StatusIcon } = require('../model/user-story');
const { User } = require('../model/user');
const { UserStoryAssigneeWidget } = require('./widgets/user-story-assignee-widget');
const { UserStoryButtonsWidget } = require('./widgets/user-story-buttons-widget');
const { UserStoryColumnsWidget } = require('./widgets/user-story-columns-widget');
const { UserStoryCardType } = require('./widgets/user-story-card-type');

/**
 * A Card with a standard view of a user story.
 */
exports.UserStoryCard = class {

  /**
   * Creates a Card with a standard view of a user story.
   * @param {!UserStory} userStory A user story.
   * @param {?User} user The user assigned to the story.
   */
  constructor(userStory, user) {
    if (userStory === null || userStory === undefined) {
      return;
    }
    const userStoryData = userStory.data;

    this.header = {
      title: userStoryData.title,
      subtitle: 'ID: ' + userStory.id,
      imageUrl: StatusIcon[userStoryData.status],
      imageAltText: userStoryData.status,
      imageType: 'CIRCLE'
    };

    // Description section.
    this.sections = [];
    if (userStoryData.description !== undefined
      && userStoryData.description.length > 0) {
      this.sections.push({
        widgets: [
          {
            textParagraph: {
              text: userStoryData.description
            }
          }
        ]
      });
    }

    // Status / information section.
    this.sections.push({
      widgets: [
        new UserStoryColumnsWidget({
          label: 'Priority',
          text: userStoryData.priority || '-'
        }, {
          label: 'Size',
          text: userStoryData.size || '-'
        }),
        new UserStoryAssigneeWidget(userStoryData.assignee, user)
      ]
    });

    // Buttons section.
    const buttonListWidget = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_MESSAGE,
      /* showEdit= */ true,
      /* showSave= */ false);
    if (buttonListWidget.buttonList) {
      this.sections.push({
        widgets: [
          buttonListWidget
        ]
      });
    }
  }

}
