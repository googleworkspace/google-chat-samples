/**
 * Copyright 2024 Google LLC
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
 * Google Chat vote app
 */

const IMAGES = [
  'https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif',
  'https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif',
  'https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif',
  'https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif',
];

/**
 * ADDED_TO_SPACE event handler. Create new vote session sample.
 *
 * @param {Object} event the event object from Google Chat
 * @return {object} JSON payload for new vote card
 */
function onAddToSpace(event) {
  return createMessage(Utilities.getUuid(), 'I like building Google Chat apps');
}

/**
 * MESSAGE event handler. Create new vote session based on a direct/mention message.
 *
 * @param {Object} event the event object from Google Chat
 * @return {object} JSON payload for new vote card
 */
function onMessage(event) {
  return createMessage(Utilities.getUuid(), event.message.argumentText);
}

/**
 * CARD_CLICKED event handler.
 * - Update vote when upvote button pressed.
 * - Create new vote when "NEW" button clicked.
 *
 * @param {Object} event the event object from Google Chat
 * @return {object} JSON payload for new or updated vote card, depending on event
 */
function onCardClick(event) {
  const action = event.action.actionMethodName;
  if (action === 'newvote') {
    return createMessage(Utilities.getUuid(), 'I like voting');
  } else if (action === 'upvote') {
    const voteId = event.action.parameters[0].value;
    const statement = event.action.parameters[1].value;
    const count = Number(event.action.parameters[2].value);
    return createMessage(voteId, statement, event.user.displayName, count + 1, true);
  }

  return {};
}

/**
 * Creates the card message.
 *
 * @param {string} voteId required, unique ID of the vote
 * @param {string} statement equired, the statement users can vote for
 * @param {string} voter the user who voted (where appropriate)
 * @param {number} count the current vote count
 * @param {boolean} update whether it's an update or a new vote session
 * @return {object} JSON payload
 */
function createMessage(voteId, statement, voter='nobody', count = 0, update = false) {
  return {
    actionResponse: { type: update ? 'UPDATE_MESSAGE' : 'NEW_MESSAGE' },
    cards: [{
      name: voteId,
      header: { title: 'Vote: ' + statement },
      sections: [{ widgets: [{
        textParagraph: { text: count + ' votes, last vote was by ' + voter + "!" }
      }, {
        image: { imageUrl: IMAGES[count % IMAGES.length] }
      }, {
        buttons: [{ textButton: {
          text: 'UPVOTE',
          onClick: { action: {
            actionMethodName: 'upvote',
            parameters: [{
              key: 'voteId',
              value: voteId
            }, {
              key: 'statement',
              value: statement
            }, {
              key: 'count',
              value: count.toString()
            }]
          }}
        }}, { textButton: {
          text: 'NEW VOTE',
          onClick: { action: { actionMethodName: 'newvote' }}}
        }]
      }]}]
    }]
  };
}
