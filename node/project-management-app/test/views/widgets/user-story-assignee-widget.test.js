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
const { UserStoryAssigneeWidget } = require('../../../views/widgets/user-story-assignee-widget');

describe('UserStoryAssigneeWidget', function () {
  it('should return widget with user data', function () {
    const expected =
      Object.assign(Object.create(UserStoryAssigneeWidget.prototype), {
        decoratedText: {
          topLabel: 'Assigned to',
          text: 'Display Name',
          startIcon: {
            iconUrl: 'avatar.jpg',
            imageType: 'CIRCLE'
          }
        }
      });

    const actual = new UserStoryAssigneeWidget('123', {
      displayName: 'Display Name',
      avatarUrl: 'avatar.jpg'
    });

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget with unknown user', function () {
    const expected =
      Object.assign(Object.create(UserStoryAssigneeWidget.prototype), {
        decoratedText: {
          topLabel: 'Assigned to',
          text: 'Unknown user',
          startIcon: undefined,
        }
      });

    const actual = new UserStoryAssigneeWidget('123');

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget with null user assigned', function () {
    const expected =
      Object.assign(Object.create(UserStoryAssigneeWidget.prototype), {
        decoratedText: {
          topLabel: 'Assigned to',
          text: '-',
          startIcon: undefined,
        }
      });

    const actual = new UserStoryAssigneeWidget(null);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return widget with no user assigned', function () {
    const expected =
      Object.assign(Object.create(UserStoryAssigneeWidget.prototype), {
        decoratedText: {
          topLabel: 'Assigned to',
          text: '-',
          startIcon: undefined,
        }
      });

    const actual = new UserStoryAssigneeWidget();

    assert.deepStrictEqual(actual, expected);
  });
});
