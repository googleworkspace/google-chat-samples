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
Google Chat app with an app home in Python App Engine
"""

import datetime
from typing import Any, Mapping
from flask import Flask, request, json

app = Flask(__name__)

# [START chat_app_home]
@app.route('/', methods=['POST'])
def post() -> Mapping[str, Any]:
  """Handle requests from Google Chat

  Returns:
      Mapping[str, Any]: the response
  """
  event = request.get_json()
  match event['chat'].get('type'):

    case 'APP_HOME':
      # App home is requested
      body = { "action": { "navigations": [{
        "pushCard": get_home_card()
      }]}}

    case 'SUBMIT_FORM':
      # The update button from app home is clicked
      event_object = event.get('commonEventObject')
      if event_object is not None:
        if 'update_app_home' == event_object.get('invokedFunction'):
          body = update_app_home()

    case _:
      # Other response types are not supported
      body = {}

  return json.jsonify(body)


def get_home_card() -> Mapping[str, Any]:
  """Create the app home card

  Returns:
      Mapping[str, Any]: the card
  """
  return { "sections": [{ "widgets": [
    { "textParagraph": {
      "text": "Here is the app home 🏠 It's " +
        datetime.datetime.now().isoformat()
    }},
    { "buttonList": { "buttons": [{
      "text": "Update app home",
      "onClick": { "action": {
        "function": "update_app_home"
      }}
    }]}}
  ]}]}
# [END chat_app_home]

# [START chat_app_home_update]
def update_app_home() -> Mapping[str, Any]:
  """Update the app home

  Returns:
      Mapping[str, Any]: the update card render action
  """
  return { "renderActions": { "action": { "navigations": [{
    "updateCard": get_home_card()
  }]}}}
# [END chat_app_home_update]


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)
