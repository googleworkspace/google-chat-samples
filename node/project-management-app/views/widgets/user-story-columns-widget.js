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
 * object that the Chat app can add to a card to display information in two
 * columns.
 */

/**
 * Returns an Icon widget with the provided URL, or <code>null</code> if no URL
 * is provided.
 * @param {?string} iconUrl The icon URL.
 * @return {Object | null} An Icon widget or <code>null</code>.
 */
function getIconWidget(iconUrl) {
  return iconUrl ? {
    iconUrl: iconUrl,
    imageType: 'CIRCLE'
  } : null;
}

/**
 * A 2-column widget that presents information about a user story.
 */
exports.UserStoryColumnsWidget = class {

  /**
   * Creates a 2-column widget that presents information about a user story.
   * @param {!{label: !string, text: !string, icon: ?string}} firstColumnData
   * @param {!{label: !string, text: !string, icon: ?string}} secondColumnData
   */
  constructor(firstColumnData, secondColumnData) {
    this.columns = {
      columnItems: [
        {
          horizontalSizeStyle: 'FILL_AVAILABLE_SPACE',
          horizontalAlignment: 'START',
          verticalAlignment: 'CENTER',
          widgets: [
            {
              decoratedText: {
                topLabel: firstColumnData.label,
                text: firstColumnData.text,
                startIcon: getIconWidget(firstColumnData.icon)
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
                topLabel: secondColumnData.label,
                text: secondColumnData.text,
                startIcon: getIconWidget(secondColumnData.icon)
              }
            }
          ]
        }
      ]
    }
  }

}
