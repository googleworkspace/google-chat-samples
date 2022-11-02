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
// [START hangouts_chat_node_preview_link]

/**
 * Responds to messages that have links whose URLs match URL patterns
 * configured for link previewing.
 *
 * @param {Object} req Request sent from Google Chat.
 * @param {Object} res Response to send back.
 */
exports.onMessage = (req, res) => {
  if (req.method === 'GET' || !req.body.message) {
    res.send(
        'Hello! This function is meant to be used in a Google Chat Space.');
  }

  // Checks for the presence of event.message.matchedUrl and attaches a card
  // if present
  if (req.body.message.matchedUrl) {
    res.json(createMessage());
  }

  // Respond to button clicks on attached cards
  if (req.body.type === 'CARD_CLICKED') {
    // Checks whether the message event originated from a human or a Chat app
    // and sets actionResponse.type to "UPDATE_USER_MESSAGE_CARDS if human or
    // "UPDATE_MESSAGE" if Chat app.
    const actionResponseType = req.body.action.actionMethodName === 'HUMAN' ?
      'UPDATE_USER_MESSAGE_CARDS' :
      'UPDATE_MESSAGE';

    if (req.body.action.actionMethodName === 'assign') {
      res.json(createMessage(actionResponseType, 'You'));
    }
  }

  // If the Chat app doesn’t detect a link preview URL pattern, it says so.
  res.json({'text': 'No matchedUrl detected.'});
};

/**
 * Message to create a card with the correct response type and assignee.
 *
 * @param {string} actionResponseType
 * @param {string} assignee
 * @return {Object} a card with URL preview
 */
function createMessage(
    actionResponseType = 'UPDATE_USER_MESSAGE_CARDS',
    assignee = 'Charlie'
) {
  return {
    'actionResponse': {'type': actionResponseType},
    'cards': [
      {
        'header': {
          'title': 'Example Customer Service Case',
          'subtitle': 'Case basics',
        },
        'sections': [
          {
            'widgets': [
              {'keyValue': {'topLabel': 'Case ID', 'content': 'case123'}},
              {'keyValue': {'topLabel': 'Assignee', 'content': assignee}},
              {'keyValue': {'topLabel': 'Status', 'content': 'Open'}},
              {
                'keyValue': {
                  'topLabel': 'Subject', 'content': 'It won"t turn on...',
                },
              },
            ],
          },
          {
            'widgets': [
              {
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
                      'onClick': {
                        'action': {
                          'actionMethodName': 'assign',
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

// [END hangouts_chat_node_preview_link]
