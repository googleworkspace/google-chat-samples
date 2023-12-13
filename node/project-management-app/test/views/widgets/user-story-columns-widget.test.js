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
const { UserStoryColumnsWidget } = require('../../../views/widgets/user-story-columns-widget');

describe('UserStoryColumnsWidget', function () {
  it('should return widget with user story data', function () {
    const expected =
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
                    topLabel: 'First Column',
                    text: 'First Value',
                    startIcon: {
                      iconUrl: 'icon.png',
                      imageType: 'CIRCLE'
                    }
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
                    topLabel: 'Second Column',
                    text: 'Second Value',
                    startIcon: null
                  }
                }
              ]
            }
          ]
        }
      });

    const actual = new UserStoryColumnsWidget({
      label: 'First Column',
      text: 'First Value',
      icon: 'icon.png'
    }, {
      label: 'Second Column',
      text: 'Second Value',
    });

    assert.deepStrictEqual(actual, expected);
  });
});
