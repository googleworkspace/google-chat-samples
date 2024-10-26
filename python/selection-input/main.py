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
Google Chat app with a selection input in Python App Engine
"""

from typing import Any, Mapping
from datetime import datetime
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
    case 'WIDGET_UPDATE':
      body = on_widget_update(event)
    case _:
      # Other response types are not supported
      body = {}
  return json.jsonify(body)


def on_message(event: dict) -> dict:
  """Responds to a MESSAGE interaction event in Google Chat."""
  return { 'cardsV2': [{
    'cardId': "contactSelector",
    'card': { 'sections':[{ 'widgets': [{
      # [START selection_input]
      'selectionInput': {
        'name': "contacts",
        'type': "MULTI_SELECT",
        'label': "Selected contacts",
        'multiSelectMaxSelectedItems': 3,
        'multiSelectMinQueryLength': 1,
        'externalDataSource': { 'function': "getContacts" },
        # Suggested items loaded by default.
        # The list is static here but it could be dynamic.
        'items': [get_contact("3")]
      }
      # [END selection_input]
    }]}]}
  }]}


# [START process_query]
def on_widget_update(event: dict) -> dict:
  """Responds to a WIDGET_UPDATE event in Google Chat."""
  if "getContacts" == event.get("common").get("invokedFunction"):
    query = event.get("common").get("parameters").get("autocomplete_widget_query")
    return { 'actionResponse': {
      'type': "UPDATE_WIDGET",
      'updatedWidget': { 'suggestions': { 'items': list(filter(lambda e: query is None or query in e["text"], [
        # The list is static here but it could be dynamic.
        get_contact("1"), get_contact("2"), get_contact("3"), get_contact("4"), get_contact("5")
      # Only return items based on the query from the user
      ]))}}
    }}


def get_contact(id: str) -> dict:
  """Generate a suggested contact given an ID."""
  return {
    'value': id,
    'startIconUri': "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
    'text': "Contact " + id
  }
  # [END process_query]


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)
