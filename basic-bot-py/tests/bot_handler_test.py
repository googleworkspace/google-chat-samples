# Copyright 2016 Google Inc.
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

import unittest
import json
import sys
from google.appengine.ext import testbed

# Import the module under test
import bot
from events import Event, event_factory

class BotTest(unittest.TestCase):
    ROOM_DISPLAY_NAME = 'Bot Testing'
    USER_DISPLAY_NAME = 'Bot Tester'
    TEST_MESSAGE = "Test message"

    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.app = bot.app.test_client()

    # Test the response when the bot is added to the room
    def testBotAddedToRoom(self):

        message = {
            'type': 'ADDED_TO_SPACE',
            'space': {
                'type': 'ROOM',
                'displayName':  self.ROOM_DISPLAY_NAME
            },
            'user': {
                'displayName': self.USER_DISPLAY_NAME
            }
        }

        response = self.app.post('/',
            data=json.dumps(message),
            content_type='application/json')

        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['text'], 'Thanks for adding me to "%s"!' % self.ROOM_DISPLAY_NAME)
        self.assertEqual(response.content_type, 'application/json')

    # Test the response when the bot is added to the room
    def testBotAddedToDM(self):

        message = {
            'type': 'ADDED_TO_SPACE',
            'space': {
                'type': 'DM',
                'displayName':  self.ROOM_DISPLAY_NAME
            },
            'user': {
                'displayName': self.USER_DISPLAY_NAME
            }
        }

        response = self.app.post('/',
            data=json.dumps(message),
            content_type='application/json')

        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['text'], 'Thanks for adding me to a DM, %s!'
            % self.USER_DISPLAY_NAME)
        self.assertEqual(response.content_type, 'application/json')

    def testBotSentMessage(self):
        message_text = 'Hello bot test!'

        message = {
            'type': 'MESSAGE',
            'space': {
                'type': 'DM',
                'displayName':  self.ROOM_DISPLAY_NAME
            },
            'user': {
                'displayName': self.USER_DISPLAY_NAME
            },
            'message': {
                'text': message_text
            }
        }

        response = self.app.post('/',
            data=json.dumps(message),
            content_type='application/json')

        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['text'], 'Your message: "%s"'
            % message_text)
        self.assertEqual(response.content_type, 'application/json')