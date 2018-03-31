# Copyright 2018 Google LLC
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

'''
Hangouts Chat simple text-only vote bot in Python App Engine

@see developers.google.com/hangouts/chat/how-tos/cards-onclick
'''

import json
import webapp2

def createMessage(voter, vote_count=0, update=False):
    """
    Create and return new interactive card or update existing one

    @type  voter:       str
    @param voter:       user (display) name
    @type  vote_count:  int
    @param vote_count:  current vote count
    @type  update:      bool
    @param update:      update existing or create new card?
    @rtype:             dict
    @return:            JSON payload to return to Hangouts Chat
    @see:   developers.google.com/hangouts/chat/concepts/cards
    """

    PARAMETERS = [{'key': 'count', 'value': str(vote_count)}]
    return {
        'actionResponse': {
            'type': 'UPDATE_MESSAGE' if update else 'NEW_MESSAGE'
        },
        'cards': [{
            'header': {'title': 'Last vote by %s!' % voter},
            'sections': [{
                'widgets': [{
                    'textParagraph': {'text': '%d votes!' % vote_count}
                }, {
                    'buttons': [{
                        'textButton': {
                            'text': '+1',
                            'onClick': {
                                'action': {
                                    'actionMethodName': 'upvote',
                                    'parameters': PARAMETERS,
                                }
                            }
                        }
                    }, {
                        'textButton': {
                            'text': '-1',
                            'onClick': {
                                'action': {
                                    'actionMethodName': 'downvote',
                                    'parameters': PARAMETERS,
                                }
                            }
                        }
                    }, {
                        'textButton': {
                            'text': 'NEW',
                            'onClick': {
                                'action': {
                                    'actionMethodName': 'newvote',
                                }
                            }
                        }
                    }]
                }]
            }]
        }]
    }

class MainPage(webapp2.RequestHandler):
    def post(self):
        """Handle requests from Hangouts Chat

        * Create new vote for ADDED_TO_SPACE and MESSAGE events
        * Update existing card for 'upvote' or 'downvote' clicks
        * Create new vote for 'newvote' clicks

        @type  self:      RequestHandler()
        @param self:      request/response object
        """
        event = json.loads(self.request.body)
        user = event['user']['displayName']
        # Update vote when card button pressed
        if event['type'] == 'CARD_CLICKED':
            method = event['action']['actionMethodName']
            # Create new vote when "NEW" button clicked
            if method == 'newvote':
                body = createMessage(user)
            # Update card in-place when "+1" or "-1" button clicked
            else:
                delta = 1 if method == 'upvote' else -1
                vote_count = int(event['action']['parameters'][0]['value']) + delta
                body = createMessage(user, vote_count, True)
        # Create new vote for any msg
        elif event['type'] == 'MESSAGE':
            body = createMessage(user)
        else: # no response for ADDED_TO_SPACE or REMOVED_FROM_SPACE
            return

        # Send response back to Hangouts Chat
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(body))

# start server loop
app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
