# Copyright 2022 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Functionality related to the OAuth2 flow and storing credentials.

Credentials are persisted to Google Cloud Datastore.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Union

import flask
import jwt
from google.auth.transport import requests
from google.cloud import datastore
from google.oauth2 import id_token
from google.oauth2.credentials import Credentials
from google_auth_oauthlib import flow

CLIENT_SECRET_PATH = os.environ.get('CLIENT_SECRET_PATH', 'client_secret.json')
JWT_SECRET = os.environ.get('SESSION_SECRET', 'notasecret')

mod = flask.Blueprint('auth', __name__)

# Scopes required to access the People API.
PEOPLE_API_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/user.emails.read',
    'https://www.googleapis.com/auth/user.addresses.read',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
]

class Store:
    """Manages storage in Google Cloud Datastore."""

    def __init__(self) -> Store:
        self.datastore_client = datastore.Client()

    def get_user_credentials(self, user_name: str) -> Credentials | None:
        """Retrieves stored OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the user.

        Returns:
            A Credentials object, or None if the user has not authorized the bot.
        """
        key = self.datastore_client.key('RefreshToken', user_name)
        entity = self.datastore_client.get(key)

        if entity is None or 'credentials' not in entity:
            return None
        return Credentials(**entity['credentials'])

    def put_user_credentials(self, user_name: str, creds: Credentials) -> None:
        """Stores OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the associated user.
            creds (Credentials): The OAuth2 credentials obtained for the user.
        """
        key = self.datastore_client.key('RefreshToken', user_name)
        entity = datastore.Entity(key)
        entity.update({
            'credentials': {
                'token': creds.token,
                'refresh_token': creds.refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': creds.scopes,
            },
            'timestamp': time.time()
        })
        self.datastore_client.put(entity)

    def delete_user_credentials(self, user_name: str) -> None:
        """Deleted stored OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the associated user.
        """
        key = self.datastore_client.key('RefreshToken', user_name)
        self.datastore_client.delete(key)


def get_user_credentials(user_name: str) -> Credentials:
    """Gets stored crednetials for a user, if it exists."""
    store = Store()
    return store.get_user_credentials(user_name)

def get_config_url(event) -> Any:
    """Gets the authorization URL to redirect the user to.

    Args:
        event (dict): The parsed Event object of the event that requires
                      authorization to respond to.

    Returns:
        str: The authorization URL to direct the user to.
    """
    payload = {
        'completion_url': event['configCompleteRedirectUrl']
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return flask.url_for('auth.start_auth', token=token, _external=True)

def logout(user_name: str) -> None:
    """Logs out the user, removing their stored credentials and revoking the
    grant

    Args:
        user_name (str): The identifier of the user.
    """
    store = Store()
    user_credentials = store.get_user_credentials(user_name)
    if user_credentials is None:
        logging.info('Ignoring logout request for user %s', user_name)
        return
    logging.info('Logging out user %s', user_name)
    store.delete_user_credentials(user_name)
    request = requests.Request()
    request.post(
        'https://accounts.google.com/o/oauth2/revoke',
        params={'token': user_credentials.token},
        headers={'Content-Type': 'application/x-www-form-urlencoded'})


@mod.route('/start')
def start_auth() -> flask.Response:
    """Begins the oauth flow to authorize access to profile data."""
    token = flask.request.args['token']
    request = jwt.decode(token, JWT_SECRET, algorithm='HS256')

    flask.session['completion_url'] = request['completion_url']
    oauth2_flow = flow.Flow.from_client_secrets_file(
        CLIENT_SECRET_PATH,
        scopes=PEOPLE_API_SCOPES,
        redirect_uri=flask.url_for('auth.on_oauth2_callback', _external=True))
    oauth2_url, state = oauth2_flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent')
    flask.session['state'] = state
    return flask.redirect(oauth2_url)

@mod.route('/callback')
def on_oauth2_callback() -> flask.Response:
    """Handles the OAuth callback."""
    saved_state = flask.session['state']
    state = flask.request.args['state']

    if state != saved_state:
        logging.warn('Mismatched state in oauth response')
        return flask.abort(403)

    redirect_uri = flask.url_for('auth.on_oauth2_callback', _external=True)
    oauth2_flow = flow.Flow.from_client_secrets_file(
        CLIENT_SECRET_PATH,
        scopes=PEOPLE_API_SCOPES,
        redirect_uri=redirect_uri)
    oauth2_flow.fetch_token(authorization_response=flask.request.url)
    creds = oauth2_flow.credentials

    # Use the id_token to identify the chat user.
    request = requests.Request()
    id_info = id_token.verify_oauth2_token(creds.id_token, request, creds.client_id)

    if id_info['iss'] != 'https://accounts.google.com':
        flask.abort(403)

    user_id = id_info['sub']
    user_name = 'users/{user_id}'.format(user_id=user_id)
    store = Store()
    store.put_user_credentials(user_name, creds)
    completion_url = flask.session['completion_url']
    return flask.redirect(completion_url)
