"""Functionality related to the OAuth2 flow and storing credentials.

Credentials are persisted to Google Cloud Datastore. An AES cypher is used to
encrypt user information passed through the state parameter.
"""

import base64
import logging
import os
import time
from typing import Union
import Crypto.Cipher
import flask
import requests
from google.cloud import datastore
from google.oauth2 import credentials
from google_auth_oauthlib import flow

Credentials = credentials.Credentials
mod = flask.Blueprint('auth', __name__)

# Scopes required to access the People API.
PEOPLE_API_SCOPES = [
    'profile',
    'https://www.googleapis.com/auth/user.emails.read',
    'https://www.googleapis.com/auth/user.addresses.read',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
]
# Path to OAuth2 client secret JSON file.
OAUTH2_CLIENT_SECRET_FILE = os.path.join(
    os.path.dirname(__file__),
    'client_secret.json')

class Store(object):
    """Manages storage in Google Cloud Datastore."""

    # Cloud Datastore kind.
    KIND = 'UserOAuth'
    # Cloud Datastore properties.
    class PROPERTIES:
        CREDENTIALS = 'Credentials'
        TIMESTAMP = 'Timestamp'

    def __init__(self):
        self.datastore_client = datastore.Client()

    def get(self, user_name: str) -> Union[datastore.Entity, None]:
        return self.datastore_client.get(
            self.datastore_client.key(self.KIND, user_name))

    def set(self, user_name: str, properties: dict):
        entity = datastore.Entity(self.datastore_client.key(self.KIND, user_name))
        entity.update(properties)
        entity.update({
            self.PROPERTIES.TIMESTAMP: time.time(),
        })
        self.datastore_client.put(entity)

    def delete(self, user_name: str):
        self.datastore_client.delete(
            self.datastore_client.key(self.KIND, user_name))

    def get_user_credentials(self, user_name: str) -> Union[Credentials, None]:
        """Retrieves stored OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the user.

        Returns:
            A Credentials object, or None if the user has not authorized the bot.
        """
        entity = self.get(user_name)
        if entity is None or self.PROPERTIES.CREDENTIALS not in entity:
            return None
        return Credentials(
            **entity[self.PROPERTIES.CREDENTIALS])

    def put_user_credentials(
            self, user_name: str, creds: Credentials) -> None:
        """Stores OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the associated user.
            creds (Credentials): The OAuth2 credentials obtained for the user.
        """
        self.set(
            user_name,
            {
                self.PROPERTIES.CREDENTIALS: {
                    'token': creds.token,
                    'refresh_token': creds.refresh_token,
                    'token_uri': creds.token_uri,
                    'client_id': creds.client_id,
                    'client_secret': creds.client_secret,
                    'scopes': creds.scopes,
                }
            })

    def delete_user_credentials(self, user_name: str):
        """Deleted stored OAuth2 credentials for a user.

        Args:
            user_name (str): The identifier for the associated user.
        """
        self.delete(user_name)


class OAuth2CallbackCipher(object):
    """Handles encryption and decryption of state parameters."""
    # Loads the encryption key for OAuth callback arguments. This value isn't
    # related to Google at all, it just needs to be a valid AES key.
    OAUTH2_CALLBACK_KEY_FILE = os.path.join(
        os.path.dirname(__file__),
        'oauth2-callback-key.txt')
    OAUTH2_CALLBACK_KEY = open(OAUTH2_CALLBACK_KEY_FILE, 'r').read().strip()

    @classmethod
    def get_cipher(cls):
        return Crypto.Cipher.AES.new(
            cls.OAUTH2_CALLBACK_KEY, Crypto.Cipher.AES.MODE_ECB)

    @classmethod
    def encrypt(cls, args: dict) -> str:
        # Produce JSON payload, padded to multiple of 16 bytes.
        json_str = flask.json.dumps(args)
        json_str = json_str.ljust(-(-len(json_str) // 16) * 16)
        return base64.b64encode(
            cls.get_cipher().encrypt(json_str.encode('utf-8')))

    @classmethod
    def decrypt(cls, encrypted_args: str) -> dict:
        return flask.json.loads(
            cls.get_cipher().decrypt(
                base64.b64decode(encrypted_args)).rstrip().decode('utf-8'))


def get_user_credentials(user_name: str):
    """Gets stored crednetials for a user, if it exists."""
    store = Store()
    return store.get_user_credentials(user_name)

def get_authorization_url(event: dict):
    """Gets the authorization URL to redirect the user to.

    Args:
        event (dict): The parsed Event object of the event that requires
                      authorization to respond to.

    Returns:
        str: The authorization URL to direct the user to.
    """
    oauth2_callback_args = OAuth2CallbackCipher.encrypt({
        'user_name': event['user']['name'],
        'space_name': event['space']['name'],
        'thread_name': event['message']['thread']['name'],
        'redirect_url': event['configCompleteRedirectUrl'],
    })
    oauth2_flow = flow.Flow.from_client_secrets_file(
        OAUTH2_CLIENT_SECRET_FILE,
        scopes=PEOPLE_API_SCOPES,
        redirect_uri=flask.url_for('auth.on_oauth2_callback', _external=True))
    oauth2_url, _ = oauth2_flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=oauth2_callback_args,
        prompt='consent')
    return oauth2_url

def logout(user_name: str):
    """Logs out the user, removing their stored credentials and revoking the
    grant

    Args:
        user_name (str): The identifier of the user.
    """
    store = Store()
    user_credentials = store.get_user_credentials(user_name)
    if user_credentials is None:
        logging.info('Ignoring logout request for user %s', user_name)
        return flask.jsonify({
            'text': 'You are currently not logged in.',
        })
    logging.info('Logging out user %s', user_name)
    store.delete_user_credentials(user_name)
    requests.post(
        'https://accounts.google.com/o/oauth2/revoke',
        params={'token': user_credentials.token},
        headers={'Content-Type': 'application/x-www-form-urlencoded'})


@mod.route('/callback')
def on_oauth2_callback():
    """Handles the OAuth callback."""
    oauth2_callback_args = OAuth2CallbackCipher.decrypt(
        flask.request.args['state'])
    user_name, redirect_url = (
        oauth2_callback_args['user_name'],
        oauth2_callback_args['redirect_url'])
    oauth2_flow = flow.Flow.from_client_secrets_file(
        OAUTH2_CLIENT_SECRET_FILE,
        scopes=PEOPLE_API_SCOPES,
        redirect_uri=flask.url_for('auth.on_oauth2_callback', _external=True),
        state=flask.request.args['state'])
    oauth2_flow.fetch_token(authorization_response=flask.request.url)
    store = Store()
    store.put_user_credentials(user_name, oauth2_flow.credentials)
    logging.info(
        'Storing credentials for user %s and redirecting to %s',
        user_name,
        redirect_url)
    return flask.redirect(redirect_url)
