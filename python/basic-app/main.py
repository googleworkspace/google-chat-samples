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
Simple Google Chat app that responds to events and
messages from a space.
"""
import logging
from flask import Flask, render_template, request, json
from google.oauth2 import id_token
from google.auth.transport import requests

# Authentication audience (either APP_URL or PROJECT_NUMBER)
AUDIENCE_TYPE = "AUDIENCE_TYPE"

# Intended audience of the token:
# - The URL of the app when AUDIENCE_TYPE is set to APP_URL
# - The project number when AUDIENCE_TYPE is set to PROJECT_NUMBER
AUDIENCE = "AUDIENCE"

app = Flask(__name__)

@app.route('/', methods=['POST'])
def home_post():
    """Respond to POST requests to this endpoint.

    All requests sent to this endpoint from Google Chat are POST
    requests.
    """

    data = request.get_json()
    resp_dict = format_response(data)

    return json.jsonify(resp_dict)

def format_response(event):
    """Determine what response to provide based upon event data.

    Args:
      event: A dictionary with the event data.
    """

    text = ""

    authorization = request.headers.get('Authorization')
    if verify_chat_app_request(authorization[len("Bearer "):]) != True:
        text = 'Failed verification!'

    # Case 1: The app was added to a space
    elif event['type'] == 'ADDED_TO_SPACE' and event['space']['type'] == 'ROOM':
        text = 'Thanks for adding me to "%s"!' % event['space']['displayName']

    # Case 2: The app was added to a DM
    elif event['type'] == 'ADDED_TO_SPACE' and event['space']['type'] == 'DM':
        text = 'Thanks for adding me to a DM, %s!' % event['user']['displayName']

    elif event['type'] == 'MESSAGE':
        text = 'Your message: "%s"' % event['message']['text']

    elif event['type'] == 'REMOVED_FROM_SPACE':
        logging.info('App removed from a space')

    return {'text': text}

def verify_chat_app_request(bearer):
    """Determine whether a Google Chat request is legitimate.

    Args:
      bearer: The bearer value sent in the request.
    """
    if AUDIENCE_TYPE == "APP_URL":
        # [START chat_request_verification_app_url]
        # Bearer Tokens received by apps will always specify this issuer.
        CHAT_ISSUER = 'chat@system.gserviceaccount.com'

        try:
            # Verify valid token, signed by CHAT_ISSUER, intended for a third party.
            request = requests.Request()
            token = id_token.verify_oauth2_token(bearer, request, AUDIENCE)
            return token['email'] == CHAT_ISSUER

        except:
            return False
        # [END chat_request_verification_app_url]
    elif AUDIENCE_TYPE == "PROJECT_NUMBER":
        # [START chat_request_verification_project_number]
        # Bearer Tokens received by apps will always specify this issuer.
        CHAT_ISSUER = 'chat@system.gserviceaccount.com'

        try:
            # Verify valid token, signed by CHAT_ISSUER, intended for a third party.
            request = requests.Request()
            certs_url = 'https://www.googleapis.com/service_accounts/v1/metadata/x509/' + CHAT_ISSUER
            token = id_token.verify_token(bearer, request, AUDIENCE, certs_url)
            return token['iss'] == CHAT_ISSUER

        except:
            return False
        # [END chat_request_verification_project_number]

    # Skip verification if AUDIENCE_TYPE is not set with supported value
    return True;


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
