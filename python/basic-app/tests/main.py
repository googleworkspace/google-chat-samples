# Copyright 2022 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# pylint: disable=invalid-name
"""
Google Chat app that responds to events and messages from a room
synchronously. The app formats the response using cards,
inserting widgets based upon the user's original input.
"""
import logging
from typing import Any, Dict, List, Mapping

from flask import Flask, json, render_template, request

app = Flask(__name__)

INTERACTIVE_TEXT_BUTTON_ACTION = 'doTextButtonAction'
INTERACTIVE_IMAGE_BUTTON_ACTION = 'doImageButtonAction'
INTERACTIVE_BUTTON_PARAMETER_KEY = "param_key"
BOT_HEADER = 'Card app Python'


@app.route('/', methods=['POST'])
def home_post() -> Mapping[str, Any]:
  """Respond to POST requests to this endpoint.

  All requests sent to this endpoint from Google Chat are POST
  requests.
  """

  event_data = request.get_json()

  resp = None

  # If the app is removed from the space, it doesn't post a message
  # to the space. Instead, log a message showing that the app was removed.
  type = event_data['type']
  space = event_data.get('space', dict()).get('type')

  match (type, space):
    case ('REMOVED_FROM_SPACE', _):
      logging.info('Bot removed from  %s', event_data['space']['name'])
      return 'OK'

    case ('ADDED_TO_SPACE', 'ROOM'):
      resp = {'text':
              f'Thanks for adding me to {event_data["space"]["name"]}!'}

    case ('ADDED_TO_SPACE', 'DM'):
      resp = {'text': (f'Thanks for adding me to a DM, '
                       f'{event_data["user"]["displayName"]}!')}

    case ('MESSAGE', _):
      resp = create_card_response(event_data['message']['text'])

    case ('CARD_CLICKED', _):
      action_name = event_data['action']['actionMethodName']
      parameters = event_data['action']['parameters']
      resp = respond_to_interactive_card_click(action_name, parameters)

    case _:
      resp = {'text': f'Error! {type} is not a valid event type!'}

  logging.info(resp)
  return json.jsonify(resp)


@app.route('/', methods=['GET'])
def home_get() -> str:
  """Respond to GET requests to this endpoint.

  This function responds to requests with a simple HTML landing page for this
  App Engine instance.
  """

  return render_template('home.html')


def create_card_response(event_message: str) -> Dict[str, Any]:
  """Creates a card response based on the message sent in Google Chat.

  See the reference for JSON keys and format for cards:
  https://developers.google.com/chat/api/guides/message-formats/cards

  Args:
      eventMessage: the user's message to the app

  """

  response = dict()
  cards = list()
  widgets = list()
  header = None

  words = event_message.lower().split()

  for word in words:
    match word:
      case 'header':
        header = {
            'header': {
                'title': app_HEADER,
                'subtitle': 'Card header',
                'imageUrl': 'https://goo.gl/5obRKj',
                'imageStyle': 'IMAGE'
            }
        }

      case 'textparagraph':
        widgets.append({
            'textParagraph': {
                'text': '<b>This</b> is a <i>text paragraph</i>.'
            }
        })

      case 'keyvalue':
        widgets.append({
            'keyValue': {
                'topLabel': 'KeyValue Widget',
                'content': 'This is a KeyValue widget',
                'bottomLabel': 'The apptom label',
                'icon': 'STAR'
            }
        })

      case 'interactivetextbutton':
        widgets.append({
            'buttons': [
                {
                    'textButton': {
                        'text': 'INTERACTIVE BUTTON',
                        'onClick': {
                            'action': {
                                'actionMethodName': INTERACTIVE_TEXT_BUTTON_ACTION,
                                'parameters': [{
                                    'key': INTERACTIVE_BUTTON_PARAMETER_KEY,
                                    'value': event_message
                                }]
                            }
                        }
                    }
                }
            ]
        })

      case 'interactiveimagebutton':
        widgets.append({
            'buttons': [
                {
                    'imageButton': {
                        'icon': 'EVENT_SEAT',
                        'onClick': {
                            'action': {
                                'actionMethodName': INTERACTIVE_IMAGE_BUTTON_ACTION,
                                'parameters': [{
                                    'key': INTERACTIVE_BUTTON_PARAMETER_KEY,
                                    'value': event_message
                                }]
                            }
                        }
                    }
                }
            ]
        })

      case 'textbutton':
        widgets.append({
            'buttons': [
                {
                    'textButton': {
                        'text': 'TEXT BUTTON',
                        'onClick': {
                            'openLink': {
                                'url': 'https://developers.google.com',
                            }
                        }
                    }
                }
            ]
        })

      case 'imagebutton':
        widgets.append({
            'buttons': [
                {
                    'imageButton': {
                        'icon': 'EVENT_SEAT',
                        'onClick': {
                            'openLink': {
                                'url': 'https://developers.google.com',
                            }
                        }
                    }
                }
            ]
        })

      case 'image':
        widgets.append({
            'image': {
                'imageUrl': 'https://goo.gl/Bpa3Y5',
                'onClick': {
                    'openLink': {
                        'url': 'https://developers.google.com'
                    }
                }
            }
        })

  if header is not None:
    cards.append(header)

  cards.append({'sections': [{'widgets': widgets}]})
  response['cards'] = cards

  return response


def respond_to_interactive_card_click(
        action_name: str, custom_params: List[Dict[str, Any]]) -> Dict[str, Any]:
  """Creates a response for when the user clicks on an interactive card.

  See the guide for creating interactive cards
  https://developers.google.com/chat/api/guides/message-formats/cards

  Args:
      action_name: the name of the custom action defined in the original app response
      custom_params: the parameters defined in the original app response

  """
  message = 'You clicked {}'.format(
      'a text button' if action_name == INTERACTIVE_TEXT_BUTTON_ACTION
      else 'an image button')

  original_message = ""

  if custom_params[0]['key'] == INTERACTIVE_BUTTON_PARAMETER_KEY:
    original_message = custom_params[0]['value']
  else:
    original_message = '<i>Cannot determine original message</i>'

  # If you want to respond to the same room but with a new message,
  # change the following value to NEW_MESSAGE.
  action_response = 'UPDATE_MESSAGE'

  return {
      'actionResponse': {
          'type': action_response
      },
      'cards': [
          {
              'header': {
                  'title': app_HEADER,
                  'subtitle': 'Interactive card clicked',
                  'imageUrl': 'https://goo.gl/5obRKj',
                  'imageStyle': 'IMAGE'
              }
          },
          {
              'sections': [
                  {
                      'widgets': [
                          {
                              'textParagraph': {
                                  'text': message
                              }
                          },
                          {
                              'keyValue': {
                                  'topLabel': 'Original message',
                                  'content': original_message
                              }
                          }
                      ]
                  }
              ]
          }
      ]
  }


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)
