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
Google Chat app with preview link in Python App Engine
"""

from typing import Any, Mapping
from flask import Flask, request, json

app = Flask(__name__)

@app.route('/', methods=['POST'])
def post() -> Mapping[str, Any]:
  """Handle requests from Google Chat

  Returns:
      Mapping[str, Any]: the response
  """
  event = request.get_json()
  match event.get('type'):
    case 'MESSAGE':
      body = on_message(event)
    case 'CARD_CLICKED':
      body = on_card_click(event)
    case _:
      # Other response types are not supported
      body = {}
  return json.jsonify(body)


def on_message(event: dict) -> dict:
  """Respond to messages that have links whose URLs match URL patterns
  configured for link previewing.
  """
  # If the Chat app does not detect a link preview URL pattern, reply
  # with a text message that says so.
  if event.get('message').get('matchedUrl') is None:
    return { 'text': 'No matchedUrl detected.' }

  # [START preview_links_text]
  # Reply with a text message for URLs of the subdomain "text"
  if 'text.example.com' in event.get('message').get('matchedUrl').get('url'):
    return {
      'text': 'event.message.matchedUrl.url: ' +
              event.get('message').get('matchedUrl').get('url')
    }
    # [END preview_links_text]

  # [START preview_links_card]
  # Attach a card to the message for URLs of the subdomain "support"
  if 'support.example.com' in event.get('message').get('matchedUrl').get('url'):
    # A hard-coded card is used in this example. In a real-life scenario,
    # the case information would be fetched and used to build the card.
    return {
      'actionResponse': { 'type': 'UPDATE_USER_MESSAGE_CARDS' },
      'cardsV2': [{
        'cardId': 'attachCard',
        'card': {
          'header': {
            'title': 'Example Customer Service Case',
            'subtitle': 'Case basics',
          },
          'sections': [{ 'widgets': [
            { 'decoratedText': { 'topLabel': 'Case ID', 'text': 'case123'}},
            { 'decoratedText': { 'topLabel': 'Assignee', 'text': 'Charlie'}},
            { 'decoratedText': { 'topLabel': 'Status', 'text': 'Open'}},
            { 'decoratedText': { 'topLabel': 'Subject', 'text': 'It won\'t turn on...' }},
            { 'buttonList': { 'buttons': [{
              'text': 'OPEN CASE',
              'onClick': { 'openLink': {
                'url': 'https://support.example.com/orders/case123'
              }},
            }, {
              'text': 'RESOLVE CASE',
              'onClick': { 'openLink': {
                'url': 'https://support.example.com/orders/case123?resolved=y',
              }},
            }, {
              'text': 'ASSIGN TO ME',
              'onClick': { 'action': { 'function': 'assign'}}
            }]}}
          ]}]
        }
      }]
    }
    # [END preview_links_card]

# [START preview_links_assign]
def on_card_click(event: dict) -> dict:
  """Updates a card that was attached to a message with a previewed link."""
  # To respond to the correct button, checks the button's actionMethodName.
  if 'assign' == event.get('action').get('actionMethodName'):
    # A hard-coded card is used in this example. In a real-life scenario,
    # an actual assign action would be performed before building the card.

    # Checks whether the message event originated from a human or a Chat app
    # and sets actionResponse.type to "UPDATE_USER_MESSAGE_CARDS if human or
    # "UPDATE_MESSAGE" if Chat app.
    actionResponseType = 'UPDATE_USER_MESSAGE_CARDS' if \
      event.get('message').get('sender').get('type') == 'HUMAN' else \
      'UPDATE_MESSAGE'

    # Returns the updated card that displays "You" for the assignee
    # and that disables the button.
    return {
      'actionResponse': { 'type': actionResponseType },
      'cardsV2': [{
        'cardId': 'attachCard',
        'card': {
          'header': {
            'title': 'Example Customer Service Case',
            'subtitle': 'Case basics',
          },
          'sections': [{ 'widgets': [
            { 'decoratedText': { 'topLabel': 'Case ID', 'text': 'case123'}},
            # The assignee is now "You"
            { 'decoratedText': { 'topLabel': 'Assignee', 'text': 'You'}},
            { 'decoratedText': { 'topLabel': 'Status', 'text': 'Open'}},
            { 'decoratedText': { 'topLabel': 'Subject', 'text': 'It won\'t turn on...' }},
            { 'buttonList': { 'buttons': [{
              'text': 'OPEN CASE',
              'onClick': { 'openLink': {
                'url': 'https://support.example.com/orders/case123'
              }},
            }, {
              'text': 'RESOLVE CASE',
              'onClick': { 'openLink': {
                'url': 'https://support.example.com/orders/case123?resolved=y',
              }},
            }, {
              'text': 'ASSIGN TO ME',
              # The button is now disabled
              'disabled': True,
              'onClick': { 'action': { 'function': 'assign'}}
            }]}}
          ]}]
        }
      }]
    }
    # [END preview_links_assign]


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)
