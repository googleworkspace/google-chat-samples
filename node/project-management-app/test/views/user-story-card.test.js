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

const assert = require('assert');
const { UserStory, StatusIcon, Status, Priority, Size } = require('../../model/user-story');
const { User } = require('../../model/user');
const { UserStoryCard } = require('../../views/user-story-card');
const { UserStoryAssigneeWidget } = require('../../views/widgets/user-story-assignee-widget');
const { UserStoryButtonsWidget } = require('../../views/widgets/user-story-buttons-widget');
const { UserStoryColumnsWidget } = require('../../views/widgets/user-story-columns-widget');
const { UserStoryCardType } = require('../../views/widgets/user-story-card-type');

describe('UserStoryCard', function () {
  it('should return User Story card', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.COMPLETED,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const user = new User('123', 'Display Name', 'avatar.jpg');
    const expected = Object.assign(Object.create(UserStoryCard.prototype), {
      header: {
        title: 'Title',
        subtitle: 'ID: id',
        imageUrl: StatusIcon[Status.COMPLETED],
        imageAltText: 'COMPLETED',
        imageType: 'CIRCLE',
      },
      sections: [
        {
          widgets: [
            {
              textParagraph: {
                text: 'Description',
              }
            }
          ]
        },
        {
          widgets: [
            Object.assign(Object.create(UserStoryColumnsWidget.prototype), {
              columns: {
                columnItems: [
                  {
                    horizontalSizeStyle: 'FILL_AVAILABLE_SPACE',
                    horizontalAlignment: 'START',
                    verticalAlignment: 'CENTER',
                    widgets: [
                      {
                        decoratedText: {
                          topLabel: 'Priority',
                          text: 'Low',
                          startIcon: null,
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
                        decoratedText: {
                          topLabel: 'Size',
                          text: 'Small',
                          startIcon: null,
                        }
                      }
                    ]
                  }
                ]
              }
            }),
            Object.assign(Object.create(UserStoryAssigneeWidget.prototype), {
              decoratedText: {
                topLabel: 'Assigned to',
                text: 'Display Name',
                startIcon: {
                  iconUrl: 'avatar.jpg',
                  imageType: 'CIRCLE',
                }
              }
            })
          ]
        },
        {
          widgets: [
            Object.assign(Object.create(UserStoryButtonsWidget.prototype), {
              buttonList: {
                buttons: [
                  {
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
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_MESSAGE
                          }
                        ]
                      }
                    }
                  },
                  {
                    text: 'Refresh',
                    icon: {
                      iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/navigation/refresh/materialicons/24dp/1x/baseline_refresh_black_24dp.png',
                      altText: 'Refresh',
                      imageType: 'CIRCLE'
                    },
                    onClick: {
                      action: {
                        function: 'refreshUserStory',
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_MESSAGE
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            })
          ]
        },
      ]
    });

    const actual = new UserStoryCard(userStory, user);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return empty object if user story is null', function () {
    const actual = new UserStoryCard(null);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story is undefined', function () {
    const actual = new UserStoryCard();

    assert.strictEqual(Object.keys(actual).length, 0);
  });
});
