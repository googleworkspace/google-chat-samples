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
Google Chat App that listens for messages via Cloud Pub/Sub.
"""

# [START chat_pub_sub_app]

import json
import logging
import os
import sys
import time
from google.apps import chat_v1 as google_chat
from google.cloud import pubsub_v1
from google.oauth2.service_account import Credentials


def receive_messages():
  """Receives messages from a pull subscription."""

  scopes = ['https://www.googleapis.com/auth/chat.bot']
  service_account_key_path = os.environ.get(
    'GOOGLE_APPLICATION_CREDENTIALS')
  creds = Credentials.from_service_account_file(
    service_account_key_path)
  chat = google_chat.ChatServiceClient(
    credentials = creds,
    client_options = {
      "scopes": scopes
    })

  project_id = os.environ.get('PROJECT_ID')
  subscription_id = os.environ.get('SUBSCRIPTION_ID')
  subscriber = pubsub_v1.SubscriberClient()
  subscription_path = subscriber.subscription_path(
      project_id, subscription_id)

  # Handle incoming message, then ack/nack the received message
  def callback(message):
    event = json.loads(message.data)
    logging.info('Data : %s', event)
    space_name = event['space']['name']

    # Post the response to Google Chat.
    request = format_request(event)
    if request is not None:
      chat.create_message(request)

    # Ack the message.
    message.ack()

  subscriber.subscribe(subscription_path, callback = callback)
  logging.info('Listening for messages on %s', subscription_path)

  # Keep main thread from exiting while waiting for messages
  while True:
    time.sleep(60)


def format_request(event):
  """Send message to Google Chat based on the type of event.
  Args:
    event: A dictionary with the event data.
  """
  space_name = event['space']['name']
  event_type = event['type']

  # If the app was removed, we don't respond.
  if event['type'] == 'REMOVED_FROM_SPACE':
    logging.info('App removed rom space %s', space_name)
    return
  elif event_type == 'ADDED_TO_SPACE' and 'message' not in event:
    # An app can also be added to a space by @mentioning it in a
    # message. In that case, we fall through to the message case
    # and let the app respond. If the app was added using the
    # invite flow, we just post a thank you message in the space.
    return google_chat.CreateMessageRequest(
        parent = space_name,
        message = {
          'text': 'Thank you for adding me!'
        }
    )
  elif event_type in ['ADDED_TO_SPACE', 'MESSAGE']:
    # In case of message, post the response in the same thread.
    return google_chat.CreateMessageRequest(
        parent = space_name,
        message_reply_option = google_chat.CreateMessageRequest.MessageReplyOption.REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD,
        message = {
          'text': 'You said: `' + event['message']['text'] + '`',
          'thread': {
            'name': event['message']['thread']['name']
          }
        }
    )


if __name__ == '__main__':
  if 'PROJECT_ID' not in os.environ:
    logging.error('Missing PROJECT_ID env var.')
    sys.exit(1)

  if 'SUBSCRIPTION_ID' not in os.environ:
    logging.error('Missing SUBSCRIPTION_ID env var.')
    sys.exit(1)

  if 'GOOGLE_APPLICATION_CREDENTIALS' not in os.environ:
    logging.error('Missing GOOGLE_APPLICATION_CREDENTIALS env var.')
    sys.exit(1)

  logging.basicConfig(
      level=logging.INFO,
      style='{',
      format='{levelname:.1}{asctime} {filename}:{lineno}] {message}')
  receive_messages()

# [END chat_pub_sub_app]
