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
const { UserStoryListCard } = require('../../views/user-story-list-card');
const { UserStoryAssigneeWidget } = require('../../views/widgets/user-story-assignee-widget');
const { UserStoryColumnsWidget } = require('../../views/widgets/user-story-columns-widget');
const { UserStoryRowWidget } = require('../../views/widgets/user-story-row-widget');

const USER_STORIES = [
  new UserStory('id', {
    title: 'Title',
    description: 'Description',
    assignee: '123',
    status: Status.COMPLETED,
    priority: Priority.LOW,
    size: Size.SMALL,
  })
];

describe('UserStoryListCard', function () {
  it('should return User Story list card', function () {
    const user = new User('123', 'Display Name', 'avatar.jpg');
    const expected = Object.assign(Object.create(UserStoryListCard.prototype), {
      sections: [{
        collapsible: true,
        uncollapsibleWidgetsCount: 1,
        widgets: [
          Object.assign(Object.create(UserStoryRowWidget.prototype), {
            decoratedText: {
              text: 'Title',
              bottomLabel: 'ID: id',
              startIcon: {
                iconUrl: StatusIcon[Status.COMPLETED],
                altText: 'COMPLETED',
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
                      value: 'id'
                    }]
                  }
                }
              }
            }
          }),
          {
            divider: {}
          },
          {
            textParagraph: {
              text: 'Description'
            }
          },
          {
            divider: {}
          },
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
          }),
        ]
      }]
    });

    const actual =
      new UserStoryListCard(
        'Title',
        USER_STORIES,
        /* users= */ { '123': user },
        /* isDialog= */ true);

    assert.deepStrictEqual(actual, expected);
  });

  it('should add title if isDialog is false', function () {
    const actual =
      new UserStoryListCard(
        'Title',
        USER_STORIES,
        /* users= */ {},
        /* isDialog= */ false);

    assert.deepStrictEqual(actual.header, { title: 'Title' });
  });

  it('should return message if user story list is empty', function () {
    const expected = Object.assign(Object.create(UserStoryListCard.prototype), {
      sections: [{
        widgets: [{
          textParagraph: {
            text: 'You don\'t have any user story yet.'
          }
        }]
      }]
    });

    const actual = new UserStoryListCard(
      'Title',
      /* userStories= */ [],
      /* users= */ {},
      /* isDialog= */ true);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return empty object if user story list is null', function () {
    const actual = new UserStoryListCard('Title', null);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story list is undefined', function () {
    const actual = new UserStoryListCard('Title');

    assert.strictEqual(Object.keys(actual).length, 0);
  });
});
