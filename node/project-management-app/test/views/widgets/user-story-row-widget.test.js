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
const { UserStory, StatusIcon, Status, Priority, Size } = require('../../../model/user-story');
const { UserStoryRowWidget } = require('../../../views/widgets/user-story-row-widget');

describe('UserStoryRowWidget', function () {
  it('should return widget with user story data', function () {
    const userStory = new UserStory('id', {
      title: 'Title',
      description: 'Description',
      assignee: '123',
      status: Status.COMPLETED,
      priority: Priority.LOW,
      size: Size.SMALL,
    });
    const expected =
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
      });

    const actual = new UserStoryRowWidget(userStory);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return empty object if user story is null', function () {
    const actual = new UserStoryRowWidget(null);

    assert.strictEqual(Object.keys(actual).length, 0);
  });

  it('should return empty object if user story is undefined', function () {
    const actual = new UserStoryRowWidget();

    assert.strictEqual(Object.keys(actual).length, 0);
  });
});
