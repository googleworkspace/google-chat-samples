/**
 * Copyright 2022 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START hangouts_chat_preview_link]

/**
 * Responds to messages that have links whose URLs match URL patterns
 * configured for link previews.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app attached to the message with
 * the previewed link.
 */
function onMessage(event) {
  // Checks for the presence of event.message.matchedUrl and attaches a card
  // if present
  if (event.message.matchedUrl) {
    return {
      'actionResponse': {
        'type': 'UPDATE_USER_MESSAGE_CARDS',
      },
      'cardsV2': [{
        'cardId': 'previewLink',
        'card': {
          'header': {
            'title': 'Example Customer Service Case',
            'subtitle': 'Case basics',
          },
          'sections': [{
            'widgets': [
              {'keyValue': {'topLabel': 'Case ID', 'content': 'case123'}},
              {'keyValue': {'topLabel': 'Assignee', 'content': 'Charlie'}},
              {'keyValue': {'topLabel': 'Status', 'content': 'Open'}},
              {
                'keyValue': {
                  'topLabel': 'Subject', 'content': 'It won\'t turn on...',
                }
              },
            ],
          },
          {
            'widgets': [{
              'buttons': [
                {
                  'textButton': {
                    'text': 'OPEN CASE',
                    'onClick': {
                      'openLink': {
                        'url': 'https://support.example.com/orders/case123',
                      },
                    },
                  },
                },
                {
                  'textButton': {
                    'text': 'RESOLVE CASE',
                    'onClick': {
                      'openLink': {
                        'url': 'https://support.example.com/orders/case123?resolved=y',
                      },
                    },
                  },
                },
                {
                  'textButton': {
                    'text': 'ASSIGN TO ME',
                    'onClick': {'action': {'actionMethodName': 'assign'}}
                  },
                },
              ],
            }],
          }],
        },
      }],
    };
  }

  // If the Chat app doesn’t detect a link preview URL pattern, it says so.
  return {'text': 'No matchedUrl detected.'};
}

/**
 * Updates a card that was attached to a message with a previewed link.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app. Either a new card attached to
 * the message with the previewed link, or an update to an existing card.
 */
function onCardClick(event) {
  // Checks whether the message event originated from a human or a Chat app
  // and sets actionResponse to "UPDATE_USER_MESSAGE_CARDS if human or
  // "UPDATE_MESSAGE" if Chat app.
  const actionResponseType = event.message.sender.type === 'HUMAN' ?
    'UPDATE_USER_MESSAGE_CARDS' :
    'UPDATE_MESSAGE';

  // To respond to the correct button, checks the button's actionMethodName.
  if (event.action.actionMethodName === 'assign') {
    return assignCase(actionResponseType);
  }
}

/**
 * Updates a card to say that "You" are the assignee after clicking the Assign
 * to Me button.
 *
 * @param {String} actionResponseType Which actionResponse the Chat app should
 * use to update the attached card based on who created the message.
 * @return {Object} Response from the Chat app. Updates the card attached to
 * the message with the previewed link.
 */
function assignCase(actionResponseType) {
  return {
    'actionResponse': {

      // Dynamically returns the correct actionResponse type.
      'type': actionResponseType,
    },
    'cardsV2': [{
      'cardId': 'assignCase',
      'card': {
        'header': {
          'title': 'Example Customer Service Case',
          'subtitle': 'Case basics',
        },
        'sections': [{
          'widgets': [
            {'keyValue': {'topLabel': 'Case ID', 'content': 'case123'}},
            {'keyValue': {'topLabel': 'Assignee', 'content': 'You'}},
            {'keyValue': {'topLabel': 'Status', 'content': 'Open'}},
            {
              'keyValue': {
                'topLabel': 'Subject', 'content': 'It won\'t turn on...',
              }
            },
          ],
        },
        {
          'widgets': [{
            'buttons': [
              {
                'textButton': {
                  'text': 'OPEN CASE',
                  'onClick': {
                    'openLink': {
                      'url': 'https://support.example.com/orders/case123',
                    },
                  },
                },
              },
              {
                'textButton': {
                  'text': 'RESOLVE CASE',
                  'onClick': {
                    'openLink': {
                      'url': 'https://support.example.com/orders/case123?resolved=y',
                    },
                  },
                },
              },
              {
                'textButton': {
                  'text': 'ASSIGN TO ME',
                  'onClick': {'action': {'actionMethodName': 'assign'}},
                },
              },
            ],
          }],
        }],
      },
    }],
  };
}

// [END hangouts_chat_preview_link]
