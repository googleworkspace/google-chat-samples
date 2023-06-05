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
"""
Chat simple text-only vote bot in Python App Engine
"""

from flask import Flask, request, json

app = Flask(__name__)

@app.route('/', methods=['POST'])
def post():
    """Handle requests from Chat

    Create new vote for ADDED_TO_SPACE and MESSAGE events
    Update existing card for 'upvote' or 'downvote' clicks
    Create new vote for 'newvote' clicks
    """
    event = request.get_json()
    user = event['user']['displayName']
    # Update vote when card button pressed
    if event['type'] == 'CARD_CLICKED':
        method = event['action']['actionMethodName']
        # Create new vote when "NEW" button clicked
        if method == 'newvote':
            body = create_message(user)
        else:
            # Update card in-place when "+1" or "-1" button clicked
            delta = 1 if method == 'upvote' else -1
            vote_count = int(event['action']['parameters'][0]['value']) + delta
            body = create_message(user, vote_count, True)
    # Create new vote for any msg
    elif event['type'] == 'MESSAGE':
        body = create_message(user)
    else: # no response for ADDED_TO_SPACE or REMOVED_FROM_SPACE
        return json.jsonify({})

    return json.jsonify(body)

def create_message(voter, vote_count=0, should_update=False):
    """
    Create and return new interactive card or update existing one

    Args:
        voter (str): user (display) name
        vote_count (int): current vote count
        should_update (bool): update existing or create new card?

    Returns:
        dict: Card response
    """
    parameters = [{'key': 'count', 'value': str(vote_count)}]
    return {
        'actionResponse': {
            'type': 'UPDATE_MESSAGE' if should_update else 'NEW_MESSAGE'
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
                                    'parameters': parameters,
                                }
                            }
                        }
                    }, {
                        'textButton': {
                            'text': '-1',
                            'onClick': {
                                'action': {
                                    'actionMethodName': 'downvote',
                                    'parameters': parameters,
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

if __name__ == '__main__':
    # This is used when running locally. Gunicorn is used to run the
    # application on Google App Engine. See entrypoint in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
