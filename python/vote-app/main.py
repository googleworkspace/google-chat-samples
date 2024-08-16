# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""
Google Chat vote app
"""

import uuid
from typing import Any, Mapping
from flask import Flask, request, json

IMAGES = [
    'https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif',
    'https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif',
    'https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif',
    'https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif',
]

app = Flask(__name__)

@app.route('/', methods=['POST'])
def post() -> Mapping[str, Any]:
  """Handle requests from Google Chat

  - Create new vote for ADDED_TO_SPACE and MESSAGE events
  - Update existing card for 'upvote' clicks
  - Create new vote for 'newvote' clicks
  - Display a different image after each event

  Returns:
      Mapping[str, Any]: the response card
  """
  event = request.get_json()

  match event['type']:

    case 'ADDED_TO_SPACE':
      # Create new vote session for when added to a space
      message = create_message(uuid.uuid4(), 'I like building Google Chat apps')

    case 'MESSAGE':
      # Create new vote session for any direct/mention message
      message = create_message(uuid.uuid4(), event['message']['argumentText'])

    case 'CARD_CLICKED':
      action = event['action']['actionMethodName']
      match action:
        case 'newvote':
          # Create new vote when "NEW" button clicked
          message = create_message(uuid.uuid4(), 'I like voting')
        case 'upvote':
          # Update vote when upvote button pressed
          voteId = event['action']['parameters'][0]['value']
          statement = event['action']['parameters'][1]['value']
          count = int(event['action']['parameters'][2]['value'])
          message = create_message(voteId, statement, voter=event['user']['displayName'], count=count + 1, update=True)

    case _:
      # no response for REMOVED_FROM_SPACE
      message = {}

  return json.jsonify(message)


def create_message(voteId: str, statement: str, voter: str = 'nobody', count: int = 0, update: bool = False)-> Mapping[str, Any]:
  """Creates the card message

  Args:
      voteId (str): required, unique ID of the vote
      statement (str): required, the statement users can vote for
      voter (str): the user who voted (where appropriate)
      count (int): the current vote count
      update (bool): whether it's an update or a new vote session

  Returns:
      Mapping[str, Any]: the vote card
  """
  return {
    'actionResponse': { 'type': ('UPDATE_MESSAGE' if update else 'NEW_MESSAGE')},
    'cards': [{
      "name": voteId,
      'header': { 'title': f'Vote: {statement}' },
      'sections': [{ 'widgets': [{
        'textParagraph': { 'text': f'{count} votes, last vote was by {voter}!' }
      }, {
        'image': { 'imageUrl': IMAGES[count % len(IMAGES)] }
      }, {
        'buttons': [{ 'textButton': {
          'text': 'UPVOTE',
          'onClick': { 'action': {
            'actionMethodName': 'upvote',
            'parameters': [{
              'key': 'voteId',
              'value': f'{voteId}'
            }, {
              'key': 'statement',
              'value': f'{statement}'
            }, {
              'key': 'count',
              'value': f'{count}'
            }]
          }}
        }}, { 'textButton': {
          'text': 'NEW VOTE',
          'onClick': { 'action': { 'actionMethodName': 'newvote' }}
        }}]
      }]}]
    }]
  }


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)
