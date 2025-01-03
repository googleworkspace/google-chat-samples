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

"""Function to post a message to a Google Chat space using the credentials of
the calling user."""

from google.api_core.exceptions import Unauthenticated
from google.apps import chat_v1 as google_chat
from firestore_service import get_token
from oauth_flow import create_credentials, generate_auth_url, SCOPES

def post_with_user_credentials(event: dict) -> dict:
    """Posts a message to a Google Chat space by calling the Chat API with user
    credentials.
    The message is posted to the same space as the received event.
    If the user has not authorized the app to use their credentials yet, instead
    of posting the message, this functions returns a configuration request to
    start the OAuth authorization flow.
    """
    message = event["message"]
    space_name = event["space"]["name"]
    user_name = event["user"]["name"]
    display_name = event["user"]["displayName"]

    # Try to obtain an existing OAuth2 token from storage.
    tokens = get_token(user_name)

    if tokens is None:
        # App doesn't have tokens for the user yet.
        # Request configuration to obtain OAuth2 tokens.
        return get_config_request(event)

    # Authenticate with the user's OAuth2 tokens.
    credentials = create_credentials(
        tokens["accessToken"], tokens["refreshToken"])

    # Create the Chat API client with user credentials.
    chat_client = google_chat.ChatServiceClient(
        credentials = credentials,
        client_options = {
            "scopes" : SCOPES
        }
    )

    # Initialize request arguments
    request = google_chat.CreateMessageRequest(
        # The space to create the message in.
        parent = space_name,
        # Creates the message as a reply to the thread specified by thread.name.
        # If it fails, the message starts a new thread instead.
        message_reply_option = "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD",
        # The message to create.
        message = {
            "text": display_name + " said: " + message["text"],
            "thread": {
                "name": message["thread"]["name"]
            }
        }
    )

    try:
        # Call Chat API.
        chat_client.create_message(request)
    except Unauthenticated:
        # This error probably happened because the user revoked the authorization.
        # So, let's request configuration again.
        return get_config_request(event)

    return {}

def get_config_request(event):
    """Returns an action response that tells Chat to request configuration for
    the app. The configuration will be tied to the user who sent the event."""
    auth_url = generate_auth_url(
        event["user"]["name"],
        event["configCompleteRedirectUrl"])
    return {
        "actionResponse": {
            "type": 'REQUEST_CONFIG',
            "url": auth_url
        }
    }
