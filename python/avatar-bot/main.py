# Copyright 2023 Google Inc. All Rights Reserved.
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

# [START hangouts_chat_avatar_bot]
from typing import Any, Mapping

import flask
import functions_framework

# Google Cloud Function that responds to messages sent in
# Google Chat.
#
# @param {Object} req Request sent from Google Chat.
# @param {Object} res Response to send back.
@functions_framework.http
def hello_chat(req: flask.Request):
    if req.method == "GET":
        return "Hello! This function must be called from Google Chat."

    request_json = req.get_json(silent=True)

    display_name = request_json["message"]["sender"]["displayName"]
    avatar = request_json["message"]["sender"]["avatarUrl"]

    response = create_message(name=display_name, image_url=avatar)

    return response


# Creates a card with two widgets.
# @param {string} name the sender's display name.
# @param {string} image_url the URL for the sender's avatar.
# @return {Object} a card with the user's avatar.
def create_message(name: str, image_url: str) -> Mapping[str, Any]:
    avatar_image_widget = {"image": {"imageUrl": image_url}}
    avatar_text_widget = {"textParagraph": {"text": "Your avatar picture:"}}
    avatar_section = {"widgets": [avatar_text_widget, avatar_image_widget]}

    header = {"title": f"Hello {name}!"}

    cards = {
        "cardsV2": [
            {
                "cardId": "avatarCard",
                "card": {
                    "name": "Avatar Card",
                    "header": header,
                    "sections": [avatar_section],
                },
            }
        ]
    }

    return cards


# [END hangouts_chat_avatar_bot]
