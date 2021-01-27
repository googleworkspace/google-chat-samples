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

from googleapiclient.discovery import build
from google.oauth2 import service_account

# Adapted from
# https://github.com/googleworkspace/hangouts-chat-samples/blob/master/python/basic-async-bot/bot.py
def send_reminder(space_name):
    """Sends a response back to the Hangouts Chat room asynchronously.
    Args:
      spaceName: The URL of the Hangouts Chat room
    """
    response = {'text': 'What have you completed since I last checked in?'}

    scopes = ['https://www.googleapis.com/auth/chat.bot']
    credentials = service_account.Credentials.from_service_account_file('service_account.json')
    credentials = credentials.with_scopes(scopes=scopes)
    chat = build('chat', 'v1', credentials=credentials)
    chat.spaces().messages().create(
        parent=space_name,
        body=response).execute()
    return True
