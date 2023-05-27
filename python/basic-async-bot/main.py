# Copyright 2017 Google Inc.
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
Hangouts Chat bot that responds to events and messages from a room asynchronously.
"""

# [START async-bot]


import logging
from googleapiclient.discovery import build
from flask import Flask, render_template, request, json
import google.auth

app = Flask(__name__)

scopes = ['https://www.googleapis.com/auth/chat.bot']
credentials, project_id = google.auth.default()
credentials = credentials.with_scopes(scopes=scopes)
chat = build('chat', 'v1', credentials=credentials)


@app.route('/', methods=['POST'])
def home_post():
    """Respond to POST requests to this endpoint.

    All requests sent to this endpoint from Hangouts Chat are POST
    requests.
    """

    event_data = request.get_json()

    resp = None

    # If the bot is removed from the space, it doesn't post a message
    # to the space. Instead, log a message showing that the bot was removed.
    if event_data['type'] == 'REMOVED_FROM_SPACE':
        logging.info('Bot removed from  %s', event_data['space']['name'])
        return json.jsonify({})

    resp = format_response(event_data)
    space_name = event_data['space']['name']
    send_async_response(resp, space_name)

    # Return empty json response since message already sent via REST API
    return json.jsonify({})

# [START async-response]

def send_async_response(response, space_name):
    """Sends a response back to the Hangouts Chat room asynchronously.

    Args:
      response: the response payload
      space_name: The URL of the Hangouts Chat room

    """
    chat.spaces().messages().create(
        parent=space_name,
        body=response).execute()

# [END async-response]

def format_response(event):
    """Determine what response to provide based upon event data.

    Args:
      event: A dictionary with the event data.

    """

    event_type = event['type']

    text = ""
    sender_name = event['user']['displayName']

    # Case 1: The bot was added to a room
    if event_type == 'ADDED_TO_SPACE' and event['space']['type'] == 'ROOM':
        text = 'Thanks for adding me to {}!'.format(event['space']['displayName'])

    # Case 2: The bot was added to a DM
    elif event_type == 'ADDED_TO_SPACE' and event['space']['type'] == 'DM':
        text = 'Thanks for adding me to a DM, {}!'.format(sender_name)

    elif event_type == 'MESSAGE':
        text = 'Your message, {}: "{}"'.format(sender_name, event['message']['text'])

    response = {'text': text}

    # The following three lines of code update the thread that raised the event.
    # Delete them if you want to send the message in a new thread.
    if event_type == 'MESSAGE' and event['message']['thread'] is not None:
        thread_id = event['message']['thread']
        response['thread'] = thread_id

    return response

# [END async-bot]

@app.route('/', methods=['GET'])
def home_get():
    """Respond to GET requests to this endpoint.

    This function responds to requests with a simple HTML landing page for this
    App Engine instance.
    """

    return render_template('home.html')


if __name__ == '__main__':
    # This is used when running locally. Gunicorn is used to run the
    # application on Google App Engine. See entrypoint in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
