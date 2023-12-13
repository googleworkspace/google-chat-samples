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
 * object that the Chat app then sends back to Chat in a
 * [dialog](https://developers.google.com/chat/how-tos/dialogs) so the user can
 * edit a user story.
 */

const { UserStory, Status, Priority, Size } = require('../model/user-story');
const { User } = require('../model/user');
const { UserStoryAssigneeWidget } = require('./widgets/user-story-assignee-widget');
const { UserStoryButtonsWidget } = require('./widgets/user-story-buttons-widget');
const { UserStoryCardType } = require('./widgets/user-story-card-type');

/**
 * Builds an array of SelectionInput widgets taking the items from an enum.
 * @param {!Object} itemsEnum An enum with the available items.
 * @param {?string} value The current value of the field.
 * @return {Array<Object>} An array of SelectionInput widgets.
 */
function buildSelectionItems(itemsEnum, value) {
  return Object.keys(itemsEnum).map((key) => ({
    text: itemsEnum[key],
    value: itemsEnum[key],
    selected: value === itemsEnum[key]
  }));
}

/**
 * A Card to edit a user story.
 */
exports.EditUserStoryCard = class {

  /**
   * Creates a Card with a standard view of a user story.
   * @param {!UserStory} userStory A user story.
   * @param {?User} user The user assigned to the story.
   * @param {?boolean} updated Whether the user story was updated in storage.
   */
  constructor(userStory, user, updated) {
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
        key: 'assignee',
        value: userStoryData.assignee
      },
      {
        key: 'cardType',
        value: UserStoryCardType.SINGLE_DIALOG
      }
    ];

    this.header = {
      title: userStoryData.title,
      subtitle: 'ID: ' + userStory.id
    };

    this.sections = [];
    if (updated) {
      this.sections.push({
        widgets: [
          {
            decoratedText: {
              icon: {
                iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/info_outline/materialicons/48dp/1x/baseline_info_outline_black_48dp.png'
              },
              text: 'Saved.'
            }
          }
        ]
      });
    };

    this.sections.push(
      {
        widgets: [
          {
            textInput: {
              name: 'title',
              label: 'Title',
              type: 'SINGLE_LINE',
              value: userStoryData.title || ''
            }
          },
          {
            textInput: {
              name: 'description',
              label: 'Description',
              type: 'MULTIPLE_LINE',
              value: userStoryData.description || ''
            }
          },
          {
            buttonList: {
              buttons: [
                {
                  text: 'Regenerate',
                  icon: {
                    iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/generating_tokens/materialiconsoutlined/24dp/1x/outline_generating_tokens_black_24dp.png',
                    altText: 'Regenerate',
                    imageType: 'CIRCLE'
                  },
                  onClick: {
                    action: {
                      function: 'generateUserStoryDescription',
                      interaction: 'OPEN_DIALOG',
                      parameters: parameters
                    }
                  }
                },
                {
                  text: 'Expand',
                  icon: {
                    iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/generating_tokens/materialiconsoutlined/24dp/1x/outline_generating_tokens_black_24dp.png',
                    altText: 'Expand',
                    imageType: 'CIRCLE'
                  },
                  onClick: {
                    action: {
                      function: 'expandUserStoryDescription',
                      interaction: 'OPEN_DIALOG',
                      parameters: parameters
                    }
                  }
                },
                {
                  text: 'Correct grammar',
                  icon: {
                    iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/spellcheck/materialicons/24dp/1x/baseline_spellcheck_black_24dp.png',
                    altText: 'Correct grammar',
                    imageType: 'CIRCLE'
                  },
                  onClick: {
                    action: {
                      function: 'correctUserStoryDescriptionGrammar',
                      interaction: 'OPEN_DIALOG',
                      parameters: parameters
                    }
                  }
                }
              ]
            }
          },
          {
            selectionInput: {
              name: 'status',
              label: 'Status',
              type: 'DROPDOWN',
              items: buildSelectionItems(Status, userStoryData.status)
            }
          },
          {
            columns: {
              columnItems: [
                {
                  horizontalSizeStyle: 'FILL_AVAILABLE_SPACE',
                  horizontalAlignment: 'START',
                  verticalAlignment: 'CENTER',
                  widgets: [
                    {
                      selectionInput: {
                        name: 'priority',
                        label: 'Priority',
                        type: 'DROPDOWN',
                        items:
                          buildSelectionItems(Priority, userStoryData.priority)
                      }
                    }
                  ]
                },
                {
                  horizontalSizeStyle: 'FILL_AVAILABLE_SPACE',
                  horizontalAlignment: 'START',
                  verticalAlignment: 'CENTER',
                  widgets: [
                    {
                      selectionInput: {
                        name: 'size',
                        label: 'Size',
                        type: 'DROPDOWN',
                        items: buildSelectionItems(Size, userStoryData.size)
                      }
                    }
                  ]
                }
              ]
            }
          },
          new UserStoryAssigneeWidget(userStoryData.assignee, user)
        ]
      });

    // Buttons section.
    const buttonListWidget = new UserStoryButtonsWidget(
      userStory,
      UserStoryCardType.SINGLE_DIALOG,
      /* showEdit= */ false,
      /* showSave= */ true);
    if (buttonListWidget.buttonList) {
      this.sections.push({
        widgets: [
          buttonListWidget
        ]
      });
    }
  }

}
