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

"""The main script for the project, which starts a Flask app
to listen to HTTP requests from Chat events and the OAuth flow callback."""

import logging
import os
import flask
from werkzeug.middleware.proxy_fix import ProxyFix
from request_verifier import verify_google_chat_request
from oauth_flow import oauth2callback
from user_auth_post import post_with_user_credentials

logging.basicConfig(
    level=logging.INFO,
    style="{",
    format="[{levelname:.1}{asctime} {filename}:{lineno}] {message}"
)

app = flask.Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)

@app.route("/", methods=["GET"])
def on_get() -> dict:
    """App route that handles unsupported GET requests."""
    return "Hello! This endpoint is meant to be called from Google Chat."

@app.route("/", methods=["POST"])
def on_event() -> dict:
    """App route that responds to interaction events from Google Chat."""
    if not verify_google_chat_request(flask.request):
        return "Hello! This endpoint is meant to be called from Google Chat."
    if event := flask.request.get_json(silent=True):
        if event["message"]:
            # Post a message back to the same Chat space using user credentials.
            return flask.jsonify(post_with_user_credentials(event))
        # Ignore events that don't contain a message.
        return flask.jsonify({})
    return "Error: Unknown action"

@app.route("/oauth2", methods=["GET"])
def on_oauth2():
    """App route that handles callback requests from the OAuth2 authorization flow.
    The handler exhanges the code received from the OAuth2 server with a set of
    credentials, stores the authentication and refresh tokens in the database,
    and redirects the request to the config complete URL provided in the request.
    """
    return oauth2callback(flask.request.url)

if __name__ == "__main__":
    PORT=os.getenv("PORT", "8080")
    app.run(port=PORT)
