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

"""Basic app that relies on Google OAuth and Google People API.

It runs in Python App Engine and uses Google Cloud Datastorefor storing user credentials.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import flask
import auth
from google.oauth2.credentials import Credentials
from googleapiclient import discovery
from werkzeug.middleware.proxy_fix import ProxyFix

app = flask.Flask(__name__)
app.register_blueprint(auth.mod, url_prefix="/auth")
app.wsgi_app = ProxyFix(app.wsgi_app)

# Set the secret key for sessions
app.secret_key = os.environ.get("SESSION_SECRET", "notasecret")

logging.basicConfig(
    level=logging.INFO,
    style="{",
    format="{levelname:.1}{asctime} {filename}:{lineno}] {message}"
)


@app.route("/", methods=["POST"])
def on_event() -> Any | dict:
    """Handler for events from Google Chat."""
    if event := flask.request.get_json():
        if message := event.get("message"):
            if "logout" in message.get("text", "").lower():
                return on_logout(event)
            else:
                return on_mention(event)
        if event["type"] == "ADDED_TO_SPACE":
            return flask.jsonify({ "text": (
                "Thanks for adding me! "
                "Try mentioning me with `@` to see your profile."
            )})
        return flask.jsonify({})
    return "Error: Unknown action"


def on_mention(event: dict) -> dict:
    """Handles a mention from Google Chat."""
    user_name = event["user"]["name"]
    user_credentials = auth.get_user_credentials(user_name)
    if not user_credentials:
        logging.info("Requesting credentials for user %s", user_name)
        return flask.jsonify({ "actionResponse": {
            "type": "REQUEST_CONFIG",
            "url": auth.get_config_url(event)
        }})
    logging.info("Found existing auth credentials for user %s", user_name)
    return flask.jsonify(produce_profile_message(user_credentials))


def on_logout(event) -> dict:
    """Handles logging out the user."""
    user_name = event["user"]["name"]
    try:
        auth.logout(user_name)
    except Exception as e:
        logging.exception(e)
        return flask.jsonify({
            "text": "Failed to log out user %s: ```%s```" % (user_name, e)
        })
    else:
        return flask.jsonify({ "text": "Logged out." })


def produce_profile_message(creds: Credentials) -> dict:
    """Generate a message containing the users profile inforamtion."""
    people_api = discovery.build("people", "v1", credentials=creds)
    try:
        person = (people_api.people().get(
            resourceName="people/me",
            personFields=",".join(["names", "photos"])
        ).execute())
    except Exception as e:
        logging.exception(e)
        return { "text": "Failed to fetch profile info: ```%s```" % e }
    if person.get("names") and person.get("photos"):
        return { "cards": [{ "header": {
            "title": person["names"][0]["displayName"],
            "imageUrl": person["photos"][0]["url"],
            "imageStyle": "AVATAR"
        }}]}
    return { "text": "Hmm, no profile information found"}


if __name__ == "__main__":
    os.environ.update({
        # Disable HTTPS check in oauthlib when testing locally.
        "OAUTHLIB_INSECURE_TRANSPORT": "1",
    })
    if not os.environ["GOOGLE_APPLICATION_CREDENTIALS"]:
        raise Exception(
            "Set the environment variable GOOGLE_APPLICATION_CREDENTIALS with "
            "the path to your service account JSON file."
        )
    app.run(port=8080, debug=True)
