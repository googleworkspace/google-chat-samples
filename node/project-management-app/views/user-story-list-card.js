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
 * [dialog](https://developers.google.com/chat/how-tos/dialogs) with a list of
 * user stories.
 */

const { UserStory } = require('../model/user-story');
const { User } = require('../model/user');
const { UserStoryAssigneeWidget } = require('./widgets/user-story-assignee-widget');
const { UserStoryButtonsWidget } = require('./widgets/user-story-buttons-widget');
const { UserStoryColumnsWidget } = require('./widgets/user-story-columns-widget');
const { UserStoryRowWidget } = require('./widgets/user-story-row-widget');
const { UserStoryCardType } = require('./widgets/user-story-card-type');

/**
 * A Card with a list of user stories.
 */
exports.UserStoryListCard = class {

  /**
   * Creates a Card with a view of a list of user stories.
   * @param {!string} title The title of the card.
   * @param {!UserStory[]} userStories An array of user stories.
   * @param {!Object<string, !User>} users A map with user data by user ID.
   * @param {!boolean} isDialog Whether this card is being added to a dialog.
   */
  constructor(title, userStories, users, isDialog) {
    if (userStories === null || userStories === undefined) {
      return;
    }

    if (!isDialog) {
      this.header = {
        title: title
      };
    }

    if (userStories.length === 0) {
      this.sections = [{
        widgets: [
          {
            textParagraph: {
              text: 'You don\'t have any user story yet.'
            }
          }
        ]
      }];
      return;
    }

    this.sections = [];
    for (const userStory of userStories) {
      const userStoryData = userStory.data;
      const user = userStoryData.assignee
        ? users[userStoryData.assignee] : null;
      let userStorySection = {
        collapsible: true,
        uncollapsibleWidgetsCount: 1,
        widgets: [
          new UserStoryRowWidget(userStory)
        ]
      };
      if (userStoryData.description !== undefined
        && userStoryData.description.length > 0) {
        userStorySection.widgets.push(
          {
            divider: {}
          },
          {
            textParagraph: {
              text: userStoryData.description
            }
          }
        );
      }
      userStorySection.widgets.push(
        {
          divider: {}
        },
        new UserStoryColumnsWidget({
          label: 'Priority',
          text: userStoryData.priority || '-'
        }, {
          label: 'Size',
          text: userStoryData.size || '-'
        }),
        new UserStoryAssigneeWidget(userStoryData.assignee, user)
      );
      const cardType = isDialog
        ? UserStoryCardType.LIST_DIALOG : UserStoryCardType.LIST_MESSAGE;
      const buttonListWidget = new UserStoryButtonsWidget(
        userStory, cardType, /* showEdit= */ false, /* showSave= */ false);
      if (buttonListWidget.buttonList) {
        userStorySection.widgets.push({ divider: {} }, buttonListWidget);
      }
      this.sections.push(userStorySection);
    }
  }

}
