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
const { UserStory, Status, Priority, Size } = require('../../model/user-story');
const { User } = require('../../model/user');
const { EditUserStoryCard } = require('../../views/edit-user-story-card');
const { UserStoryAssigneeWidget } = require('../../views/widgets/user-story-assignee-widget');
const { UserStoryButtonsWidget } = require('../../views/widgets/user-story-buttons-widget');
const { UserStoryCardType } = require('../../views/widgets/user-story-card-type');

const USER_STORY = new UserStory('id', {
  title: 'Title',
  description: 'Description',
  assignee: '123',
  status: Status.COMPLETED,
  priority: Priority.LOW,
  size: Size.SMALL,
});

const USER = new User('123', 'Display Name', 'avatar.jpg');

describe('EditUserStoryCard', function () {
  it('should return Edit User Story card', function () {
    const expected = Object.assign(Object.create(EditUserStoryCard.prototype), {
      header: {
        title: 'Title',
        subtitle: 'ID: id'
      },
      sections: [
        {
          widgets: [
            {
              textInput: {
                name: 'title',
                label: 'Title',
                type: 'SINGLE_LINE',
                value: 'Title'
              }
            },
            {
              textInput: {
                name: 'description',
                label: 'Description',
                type: 'MULTIPLE_LINE',
                value: 'Description'
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
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'assignee',
                            value: '123'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_DIALOG
                          }
                        ]
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
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'assignee',
                            value: '123'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_DIALOG
                          }
                        ]
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
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'assignee',
                            value: '123'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_DIALOG
                          }
                        ]
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
                items: [
                  {
                    text: 'OPEN',
                    value: 'OPEN',
                    selected: false
                  },
                  {
                    text: 'STARTED',
                    value: 'STARTED',
                    selected: false
                  },
                  {
                    text: 'COMPLETED',
                    value: 'COMPLETED',
                    selected: true
                  },
                ]
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
                          items: [
                            {
                              text: 'Low',
                              value: 'Low',
                              selected: true
                            },
                            {
                              text: 'Medium',
                              value: 'Medium',
                              selected: false
                            },
                            {
                              text: 'High',
                              value: 'High',
                              selected: false
                            },
                          ]
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
                          items: [
                            {
                              text: 'Small',
                              value: 'Small',
                              selected: true
                            },
                            {
                              text: 'Medium',
                              value: 'Medium',
                              selected: false
                            },
                            {
                              text: 'Large',
                              value: 'Large',
                              selected: false
                            },
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            },
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
                    text: 'Save',
                    icon: {
                      iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/save/materialiconsoutlined/24dp/1x/outline_save_black_24dp.png',
                      altText: 'Save',
                      imageType: 'CIRCLE'
                    },
                    onClick: {
                      action: {
                        function: 'saveUserStory',
                        interaction: 'OPEN_DIALOG',
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_DIALOG
                          }
                        ]
                      }
                    }
                  },
                  {
                    text: 'Cancel',
                    icon: {
                      iconUrl: 'https://raw.githubusercontent.com/google/material-design-icons/master/png/content/clear/materialicons/24dp/1x/baseline_clear_black_24dp.png',
                      altText: 'Cancel',
                      imageType: 'CIRCLE'
                    },
                    onClick: {
                      action: {
                        function: 'cancelEditUserStory',
                        interaction: 'OPEN_DIALOG',
                        parameters: [
                          {
                            key: 'id',
                            value: 'id'
                          },
                          {
                            key: 'cardType',
                            value: UserStoryCardType.SINGLE_DIALOG
                          }
                        ]
                      }
                    }
                  },
                ]
              }
            })
          ]
        },
      ]
    });

    const actual =
      new EditUserStoryCard(USER_STORY, USER, /* updated= */ false);

    assert.deepStrictEqual(actual, expected);
  });

  it('should add message if updated is true', function () {
    const actual =
      new EditUserStoryCard(USER_STORY, USER, /* updated= */ true);

    assert.deepStrictEqual(actual.sections[0], {
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
  });

  it('should return empty object if user story is null', function () {
    const actual = new EditUserStoryCard(null);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story is undefined', function () {
    const actual = new EditUserStoryCard();

    assert.strictEqual(Object.keys(actual).length, 0);
  });
});
