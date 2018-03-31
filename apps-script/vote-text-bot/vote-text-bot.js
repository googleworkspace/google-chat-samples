/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Hangouts Chat simple text-only vote bot in Google Apps Script
 *
 * @see developers.google.com/hangouts/chat/how-tos/cards-onclick
 */

/**
 * Create and return new interactive card or update existing one
 *
 * @param {string} voter Google user name
 * @param {number} voteCount Current vote count
 * @param {boolean} update Update existing or create new card?
 * @return {object} actual JSON payload to return to Hangouts Chat
 * @see developers.google.com/hangouts/chat/concepts/cards
 */
function createMessage(voter, voteCount, update) {
  var parameters = [{key: 'count', value: voteCount.toString()}];
  return {
    actionResponse: {
      type: update ? 'UPDATE_MESSAGE' : 'NEW_MESSAGE'
    },
    cards: [{
      header: {
        title: 'Last vote by ' + voter + '!'
      },
      sections: [{
        widgets: [{
          textParagraph: {
            text: voteCount + ' votes!'
          }
        }, {
          buttons: [{
            textButton: {
              text: '+1',
              onClick: {
                action: {
                  actionMethodName: 'upvote',
                  parameters: parameters
                }
              }
            }
          }, {
            textButton: {
              text: '-1',
              onClick: {
                action: {
                  actionMethodName: 'downvote',
                  parameters: parameters
                }
              }
            }
          }, {
            textButton: {
              text: 'NEW',
              onClick: {
                action: {
                  actionMethodName: 'newvote'
                }
              }
            }
          }]
        }]
      }]
    }]
  };
}

/**
 * Handler for bot-added-to-room and message events. Create new
 * vote when any MESSAGE events are received in Hangouts Chat.
 *
 * @param {Event} e The Hangouts Chat event
 * @return {object} JSON payload for new vote card
 * @see developers.google.com/hangouts/chat/how-tos/bots-apps-script#apps_script_bot_concepts
 * @see developers.google.com/hangouts/chat/reference/message-formats/events#event_types
 */
function onMessage(e) {
  return createMessage(e.user.displayName, 0);
}

/**
 * Card click event handler
 *
 * @param {Event} e The Hangouts Chat event
 * @return {object} payload for appropriate vote card, depending on user input
 * @see developers.google.com/hangouts/chat/how-tos/cards-onclick
 */
function onCardClick(e) {
  // Create a new vote card when 'NEW' button is clicked.
  if (e.action.actionMethodName === 'newvote') {
    return createMessage(e.user.displayName, 0);
  }
  // Updates the card in-place when '+1' or '-1' button is clicked.
  var voteCount = +e.action.parameters[0].value;
  e.action.actionMethodName === 'upvote' ? ++voteCount : --voteCount;
  return createMessage(e.user.displayName, voteCount, true);
}
