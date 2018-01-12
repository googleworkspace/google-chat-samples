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

from google.cloud import pubsub_v1
import time
import json
from httplib2 import Http
from oauth2client.service_account import ServiceAccountCredentials
from apiclient.discovery import build, build_from_document
import os

PROJECT_ID = 'YOUR PROJECT ID'
SUBSCRIPTION_NAME = 'YOUR SUBSCRIPTION NAME'
CREDENTIALS_PATH_ENV_PROPERTY = 'GOOGLE_APPLICATION_CREDENTIALS'

def receive_messages():
    """Receives messages from a pull subscription."""
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(
        PROJECT_ID, SUBSCRIPTION_NAME)

    def callback(message):
        print('Received message: {}'.format(message.data))

        event_data = json.loads(message.data)
        space_name = event_data['space']['name']

        # If the bot was removed, we don't need to return a response.
        if event_data['type'] == 'REMOVED_FROM_SPACE':
            print 'Bot removed rom space {}'.format(space_name)
            return

        response = format_response(event_data)

        # Send the asynchronous response back to Hangouts Chat
        send_response(response, space_name)
        message.ack()

    subscriber.subscribe(subscription_path, callback=callback)

    print('Listening for messages on {}'.format(subscription_path))
    while True:
        time.sleep(60)

def send_response(response, space_name):
    """Sends a response back to the Hangouts Chat room using the asynchronous API.

    Args:
      response: the response payload
      space_name: The URL of the Hangouts Chat room

    """
    scopes = ['https://www.googleapis.com/auth/chat.bot']
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        os.environ[CREDENTIALS_PATH_ENV_PROPERTY], scopes)
    http_auth = credentials.authorize(Http())

    chat = build('chat', 'v1', http=http_auth)
    chat.spaces().messages().create(
        parent=space_name,
        body=response).execute()

def format_response(event):
    """Determine what response to provide based upon event data.

    Args:
      event: A dictionary with the event data.

    """

    event_type = event['type']

    text = ""
    senderName = event['user']['displayName']

    # Case 1: The bot was added to a room
    if event_type == 'ADDED_TO_SPACE' and event['space']['type'] == 'ROOM':
        text = 'Thanks for adding me to {}!'.format(event['space']['displayName'])

    # Case 2: The bot was added to a DM
    elif event_type == 'ADDED_TO_SPACE' and event['space']['type'] == 'DM':
        text = 'Thanks for adding me to a DM, {}!'.format(senderName)

    elif event_type == 'MESSAGE':
        text = 'Your message, {}: "{}"'.format(senderName, event['message']['text'])

    response = { 'text': text }

    # The following three lines of code update the thread that raised the event.
    # Delete them if you want to send the message in a new thread.
    if event['message']['thread'] != None:
        threadId = event['message']['thread']
        response['thread'] = threadId

    return response


if __name__ == '__main__':
	print(os.environ[CREDENTIALS_PATH_ENV_PROPERTY])
	receive_messages()