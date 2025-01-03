# Copyright 2025 Google LLC. All Rights Reserved.
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

"""Functions to handle the OAuth authentication flow."""

import json
import logging
from urllib.parse import parse_qs, urlparse

import flask
import google_auth_oauthlib.flow
from google.auth.transport import requests
from google.oauth2 import id_token
from google.oauth2.credentials import Credentials
from firestore_service import store_token

# This variable specifies the name of a file that contains the OAuth 2.0
# information for this application, including its client_id and client_secret.
CLIENT_SECRETS_FILE = "client_secrets.json"

# Application OAuth credentials.
KEYS = json.load(open(CLIENT_SECRETS_FILE, encoding="UTF-8"))["web"]

# Define the app's authorization scopes.
# Note: 'openid' is required to that Google Auth will return a JWT with the
# user id, which we can use to validate that the user who granted consent is
# the same who requested it (to avoid identity theft).
SCOPES = ["openid", "https://www.googleapis.com/auth/chat.messages.create"]

def generate_auth_url(user_name: str, config_complete_redirect_url: str) -> str:
    """Generates the URL to start the OAuth2 authorization flow."""
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = KEYS["redirect_uris"][0]
    # Generate URL for request to Google's OAuth 2.0 server.
    auth_url, _ = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission.
        access_type="offline",
        # Optional, enable incremental authorization. Recommended as a best practice.
        include_granted_scopes="true",
        state=json.dumps({
            "userName": user_name,
            "configCompleteRedirectUrl": config_complete_redirect_url
        })
    )
    return auth_url

def create_credentials(access_token: str, refresh_token: str) -> Credentials:
    """Returns the Credentials to authenticate using the user tokens."""
    return Credentials(
        token = access_token,
        refresh_token = refresh_token,
        token_uri = KEYS["token_uri"],
        client_id = KEYS["client_id"],
        client_secret = KEYS["client_secret"],
        scopes = SCOPES
    )

def oauth2callback(url: str):
    """Handles an OAuth2 callback request.
    If the authorization was succesful, it exchanges the received code with the
    access and refresh tokens and saves them into Firestore to be used when
    calling the Chat API. Then, it redirects the response to the
    configCompleteRedirectUrl specified in the authorization URL.
    If the authorization fails, it just prints an error message to the response.
    """
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = KEYS["redirect_uris"][0]

    # Fetch state from url
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    if "error" in qs:
        # An error response e.g. error=access_denied.
        logging.warning("Error: %s", qs["error"][0])
        return "Error: " + qs["error"][0]

    # Use the authorization server's response to fetch the OAuth 2.0 tokens.
    if "code" not in qs:
        logging.warning("Error: invalid query code.")
        return "Error: invalid query code."
    code = qs["code"][0]
    flow.fetch_token(code=code)
    credentials = flow.credentials
    token = id_token.verify_oauth2_token(
        credentials.id_token, requests.Request(), KEYS["client_id"])
    user_name = "users/" + token["sub"]

    # Save tokens to the database so the app can use them to make API calls.
    store_token(user_name, credentials.token, credentials.refresh_token)

    # Validate that the user who granted consent is the same who requested it.
    if "state" not in qs:
        logging.warning("Error: invalid query state.")
        return "Error: invalid query state."
    state = json.loads(qs["state"][0])
    if user_name != state["userName"]:
        logging.warning("Error: token user does not correspond to request user.")
        return """Error: the user who granted consent does not correspond to
            the user who initiated the request. Please start the configuration
            again and use the same account you're using in Google Chat."""

    # Redirect to the URL that tells Google Chat that the configuration is
    # completed.
    return flask.redirect(state["configCompleteRedirectUrl"])
