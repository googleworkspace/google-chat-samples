/**
 * Copyright 2024 Google Inc.
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

const uuid = require('uuid');
const express = require('express');
const PORT = process.env.PORT || 8080;

const IMAGES = [
  'https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif',
  'https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif',
  'https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif',
  'https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif',
];

const app = express()
  .use(express.urlencoded({extended: false}))
  .use(express.json());

app.post('/', async (req, res) => {
  var message = {};
  if (req.body.type === 'ADDED_TO_SPACE') {
    // Create new vote session sample
    message = createMessage(uuid.v4(), 'I like building Google Chat apps');
  } else if (req.body.type === 'MESSAGE') {
    // Create new vote session based on a direct/mention message
    message = createMessage(uuid.v4(), req.body.message.argumentText);
  } else if (req.body.type === 'CARD_CLICKED') {
    const action = req.body.action.actionMethodName;
    if (action === 'newvote') {
      // Create new vote
      message = createMessage(uuid.v4(), 'I like voting');
    } else if (action === 'upvote') {
      // Update vote
      const voteId = req.body.action.parameters[0].value;
      const statement = req.body.action.parameters[1].value;
      const count = Number(req.body.action.parameters[2].value);
      message = createMessage(voteId, statement, req.body.user.displayName, count + 1, true);
    }
  }

  return res.json(message);
});

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

app.listen(PORT, () => {
  console.log(`Server is running in port - ${PORT}`);
});
