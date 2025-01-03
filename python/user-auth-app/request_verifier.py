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

"""Utility to verify that an HTTP request was sent by Google Chat."""

import flask
from google.auth.transport import requests
from google.oauth2 import id_token

# Bearer Tokens received by apps will always specify this issuer.
CHAT_ISSUER = 'chat@system.gserviceaccount.com'

def verify_google_chat_request(request: flask.Request) -> bool:
    """Verifies that an HTTP request was sent by Google Chat."""
    try:
        # Extract the signed token sent by Google Chat from the request.
        authorization = request.headers.get('Authorization')
        bearer_token = authorization[len("Bearer "):]
        # The ID token audience should correspond to the server URl.
        audience = request.base_url
        # Verify valid token, signed by CHAT_ISSUER, intended for a third party.
        token = id_token.verify_oauth2_token(
            bearer_token, requests.Request(), audience)
        return token["email"] == CHAT_ISSUER
    except Exception:
        return False
