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
"""
Hangouts Chat bot that listens for messages via Cloud Pub/Sub.
"""

# [START pub-sub-bot]

import json
import logging
import os
import sys
import time
from google.cloud import pubsub_v1
from googleapiclient.discovery import build
import google.auth


def receive_messages():
  """Receives messages from a pull subscription."""

  scopes = ['https://www.googleapis.com/auth/chat.bot']
  credentials, project_id = google.auth.default()
  credentials = credentials.with_scopes(scopes=scopes)
  chat = build('chat', 'v1', credentials=credentials)

  subscription_id = os.environ.get('SUBSCRIPTION_ID')
  subscriber = pubsub_v1.SubscriberClient()
  subscription_path = subscriber.subscription_path(
      project_id, subscription_id)

  def callback(message):
    logging.info('Received message: %s', message.data)

    event = json.loads(message.data)
    space_name = event['space']['name']

    # If the bot was removed, we don't need to return a response.
    if event['type'] == 'REMOVED_FROM_SPACE':
      logging.info('Bot removed rom space %s', space_name)
      return

    response = format_response(event)

    # Send the asynchronous response back to Hangouts Chat
    chat.spaces().messages().create(
        parent=space_name,
        body=response).execute()
    message.ack()

  subscriber.subscribe(subscription_path, callback=callback)
  logging.info('Listening for messages on %s', subscription_path)

  # Keep main thread from exiting while waiting for messages
  while True:
    time.sleep(60)


def format_response(event):
  """Determine what response to provide based upon event data.
  Args:
    event: A dictionary with the event data.
  """

  event_type = event['type']

  text = ""
  sender_name = event['user']['displayName']

  match event_type:
    case 'ADDED_TO_SPACE':
      if event['space']['type'] == 'ROOM':
        text = 'Thanks for adding me to {}!'.format(
            event['space']['displayName'])
      else:
        text = 'Thanks for adding me to a DM, {}!'.format(sender_name)

    case 'MESSAGE':
      # The following three lines of code update the thread that raised the event.
      # Remove them if you want to send the message in a new thread.
      if event['message']['thread'] is not None:
        thread_id = event['message']['thread']
        response['thread'] = thread_id

      text = 'Your message, {}: "{}"'.format(
          sender_name, event['message']['text'])

  response = {'text': text}

  return response


if __name__ == '__main__':
  if 'SUBSCRIPTION_ID' not in os.environ:
    logging.error('Missing SUBSCRIPTION_ID env var.')
    sys.exit(1)

  logging.basicConfig(
      level=logging.INFO,
      style='{',
      format='{levelname:.1}{asctime} {filename}:{lineno}] {message}')
  receive_messages()

# [END pub-sub-bot]
