# Copyright 2022 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START vote-text-bot]
from __future__ import annotations

from typing import Any, Mapping

import flask


IMAGES = [
    'https://media2.giphy.com/media/3oEjHK3aw2LcB1V3QQ/giphy.gif',
    'https://media3.giphy.com/media/l0HlUIHlH4AKadXzy/giphy.gif',
    'https://media0.giphy.com/media/3otPorfb8Lu7wjKllm/giphy.gif',
    'https://media3.giphy.com/media/xT9IgFLBcm3Wi6l6qA/giphy.gif',
]


def vote(req: flask.Request) -> Mapping[str, Any]:
  """ Google Cloud Function that responds to events sent from a Chat space.

  Responds with the 'Vote' card together with a graphic.

  Args:
      req (flask.Request): the http request containing the chat message.

  Returns:
      Mapping[str, Any]: the response card
  """
  if req.method == 'GET':
    return 'Sorry, this function must be called from a Google Chat.'

  request = req.get_json(silent=True)
  print(request)

  match request.get('type'):
    case 'ADDED_TO_SPACE' | 'MESSAGE':
      message = create_message('nobody', 0, False)

    case 'CARD_CLICKED':
      action = request.get('action').get('actionMethodName')
      user = request.get('user').get('displayName')
      match action:
        case 'upvote':
          count = int(request.get('action').get('parameters')[0].get('value'))
          message = create_message(user, count + 1, True)
        case 'newvote':
          message = create_message(user, 0, False)
    case _:
      message = 'Error'

  return message


def create_message(voter: str, count: int, update: bool) -> Mapping[str, Any]:
  """Creates the card message

  Args:
      voter (str): the user who voted (where appropriate)
      count (int): the current cote count
      update (bool): is this an update or a new message

  Returns:
      Mapping[str, Any]: the vote card
  """
  return {
      'actionResponse': {
          'type': ('UPDATE_MESSAGE' if update else 'NEW_MESSAGE')},
      'cards': [{
          'header': {'title': f'Last vote by {voter}!'},
          'sections': [{
              'widgets': [{
                  'textParagraph': {'text': f'{count} votes!'}
              }, {
                  'image': {
                      'imageUrl': IMAGES[count % len(IMAGES)]}
              }, {
                  'buttons': [{
                      'textButton': {
                              'text': 'UPVOTE',
                              'onClick': {
                                  'action': {
                                      'actionMethodName': 'upvote',
                                      'parameters': [
                                          {
                                              'key': 'count',
                                              'value': f'{count}'
                                          }
                                      ]
                                  }
                              }
                              }
                  }, {
                      'textButton': {
                          'text': 'NEW VOTE',
                          'onClick': {
                                  'action': {
                                      'actionMethodName': 'newvote'
                                  }
                          }
                      }
                  }]
              }]
          }]
      }]
  }

# [END vote_text_bot]
