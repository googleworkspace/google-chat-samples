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
Google Chat app with card interactions in Python App Engine
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
    case 'CARD_CLICKED':
      body = on_card_click(event)
    case _:
      # Other response types are not supported
      body = {}
  return json.jsonify(body)


def on_message(event: dict) -> dict:
  """Responds to a MESSAGE interaction event in Google Chat."""
  if event.get('message').get('slashCommand'):
    match event.get('message').get('slashCommand').get('commandId'):
      case "1":
        # If the slash command is "/about", responds with a text message and button
        # that opens a dialog.
        return {
          'text': "Manage your personal and business contacts 📇. To add a " +
                  "contact, use the slash command `/addContact`.",
          'accessoryWidgets': [{
            # [START open_dialog_from_button]
            'buttonList': { 'buttons': [{
              'text': "Add Contact",
              'onClick': { 'action': {
                'function': "openInitialDialog",
                'interaction': "OPEN_DIALOG"
              }}
            }]}
            # [END open_dialog_from_button]
          }]
        }
      case "2":
        # If the slash command is "/addContact", opens a dialog.
        return open_initial_dialog()

  # If user sends the Chat app a message without a slash command, the app responds
  # privately with a text and card to add a contact.
  return {
    'privateMessageViewer': event.get('user'),
    'text': "To add a contact, try `/addContact` or complete the form below:",
    'cardsV2': [{
      'cardId': "addContactForm",
      'card': {
        'header': { 'title': "Add a contact" },
        'sections':[{ 'widgets': CONTACT_FORM_WIDGETS + [{
          'buttonList': { 'buttons': [{
            'text': "Review and submit",
            'onClick': { 'action': { 'function': "openConfirmation" }}
          }]}
        }]}]
      }
    }]
  }

# [START subsequent_steps]
def on_card_click(event: dict) -> dict:
  """Responds to CARD_CLICKED interaction events in Google Chat."""
  # Initial dialog form page
  if "openInitialDialog" == event.get('common').get('invokedFunction'):
    return open_initial_dialog()
  # Confirmation dialog form page
  elif "openConfirmation" == event.get('common').get('invokedFunction'):
    return open_confirmation(event)
  # Submission dialog form page
  elif "submitForm" == event.get('common').get('invokedFunction'):
    return submit_form(event)


# [START open_initial_dialog]
def open_initial_dialog() -> dict:
  """Opens the initial step of the dialog that lets users add contact details."""
  return { 'actionResponse': {
    'type': "DIALOG",
    'dialogAction': { 'dialog': { 'body': { 'sections': [{
      'header': "Add new contact",
      'widgets': CONTACT_FORM_WIDGETS + [{
        'buttonList': { 'buttons': [{
          'text': "Review and submit",
          'onClick': { 'action': { 'function': "openConfirmation" }}
        }]}
      }]
    }]}}}
  }}
  # [END open_initial_dialog]


def open_confirmation(event: dict) -> dict:
  """Returns the second step as a dialog or card message that lets users confirm details."""
  name = fetch_form_value(event, "contactName") or ""
  birthdate = fetch_form_value(event, "contactBirthdate") or ""
  type = fetch_form_value(event, "contactType") or ""
  card_confirmation = {
    'header': "Your contact",
    'widgets': [{
      'textParagraph': { 'text': "Confirm contact information and submit:" }}, {
      'textParagraph': { 'text': "<b>Name:</b> " + name }}, {
      'textParagraph': {
        'text': "<b>Birthday:</b> " + convert_millis_to_date_string(birthdate)
      }}, {
      'textParagraph': { 'text': "<b>Type:</b> " + type }}, {
      # [START set_parameters]
      'buttonList': { 'buttons': [{
        'text': "Submit",
        'onClick': { 'action': {
          'function': "submitForm",
          'parameters': [{
            'key': "contactName", 'value': name }, {
            'key': "contactBirthdate", 'value': birthdate }, {
            'key': "contactType", 'value': type
          }]
        }}
      }]}
      # [END set_parameters]
    }]
  }

  # Returns a dialog with contact information that the user input.
  if event.get('isDialogEvent'): 
    return { 'action_response': {
      'type': "DIALOG",
      'dialogAction': { 'dialog': { 'body': { 'sections': [card_confirmation] }}}
    }}

  # Updates existing card message with contact information that the user input.
  return {
    'actionResponse': { 'type': "UPDATE_MESSAGE" },
    'privateMessageViewer': event.get('user'),
    'cardsV2': [{
      'card': { 'sections': [card_confirmation] }
    }]
  }
  # [END subsequent_steps]


def submit_form(event: dict) -> dict:
  """Validates and submits information from a dialog or card message and notified status."""
  # [START status_notification]
  contact_name = event.get('common').get('parameters')["contactName"]
  # Checks to make sure the user entered a contact name.
  # If no name value detected, returns an error message.
  if contact_name == "":
    error_message = "Don't forget to name your new contact!"
    if "SUBMIT_DIALOG" == event.get('dialogEventType'):
      return { 'actionResponse': {
        'type': "DIALOG",
        'dialogAction': { 'actionStatus': {
          'statusCode': "INVALID_ARGUMENT",
          'userFacingMessage': error_message
        }}
      }}
    else:
      return {
        'privateMessageViewer': event.get('user'),
        'text': error_message
      }
      # [END status_notification]

  # [START confirmation_message]
  # The Chat app indicates that it received form data from the dialog or card.
  # Sends private text message that confirms submission.
  confirmation_message = "✅ " + contact_name + " has been added to your contacts.";
  if "SUBMIT_DIALOG" == event.get('dialogEventType'):
    return {
      'actionResponse': {
        'type': "DIALOG",
        'dialogAction': { 'actionStatus': {
          'statusCode': "OK",
          'userFacingMessage': "Success " + contact_name
        }}
      }
    }
  else:
    return {
      'actionResponse': { 'type': "NEW_MESSAGE" },
      'privateMessageViewer': event.get('user'),
      'text': confirmation_message
    }
    # [END confirmation_message]


def fetch_form_value(event: dict, widgetName: str) -> str:
  """Extracts form input value for a given widget."""                    
  form_item = event.get('common').get('formInputs')[widgetName]
  # For widgets that receive StringInputs data, the value input by the user.
  if 'stringInputs' in form_item:
    string_input = event.get('common').get('formInputs')[widgetName].get('stringInputs').get('value')[0]
    if string_input:
      return string_input
  # For widgets that receive dateInput data, the value input by the user.
  elif 'dateInput' in form_item:
    date_input = event.get('common').get('formInputs')[widgetName].get('dateInput').get('msSinceEpoch')
    if date_input:
       return date_input


def convert_millis_to_date_string(millis: str) -> str:
  """Converts date in milliseconds since epoch to user-friendly string."""
  datetime_object = datetime.fromtimestamp(int(millis) / 1000.0)
  return datetime_object.strftime("%Y-%m-%d")


if __name__ == '__main__':
  # This is used when running locally. Gunicorn is used to run the
  # application on Google App Engine. See entrypoint in app.yaml.
  app.run(host='127.0.0.1', port=8080, debug=True)


# [START input_widgets]
# The section of the contact card that contains the form input widgets. Used in a dialog and card message.
# To add and preview widgets, use the Card Builder: https://addons.gsuite.google.com/uikit/builder
CONTACT_FORM_WIDGETS = [
  {
    "textInput": {
      "name": "contactName",
      "label": "First and last name",
      "type": "SINGLE_LINE"
    }
  },
  {
    "dateTimePicker": {
      "name": "contactBirthdate",
      "label": "Birthdate",
      "type": "DATE_ONLY"
    }
  },
  {
    "selectionInput": {
      "name": "contactType",
      "label": "Contact type",
      "type": "RADIO_BUTTON",
      "items": [
        {
          "text": "Work",
          "value": "Work",
          "selected": False
        },
        {
          "text": "Personal",
          "value": "Personal",
          "selected": False
        }
      ]
    }
  }
]
# [END input_widgets]
