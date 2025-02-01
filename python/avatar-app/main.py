# Copyright 2024 Google LLC
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

# [START chat_avatar_app]
from typing import Any, Mapping

import flask
import functions_framework

# Command IDs (configure these in Google Chat API)
ABOUT_COMMAND_ID = 1  # ID for the "/about" slash command
HELP_COMMAND_ID = 2  # ID for the "Help" quick command


@functions_framework.http
def avatar_app(req: flask.Request) -> Mapping[str, Any]:
    """Google Cloud Function that handles HTTP requests from Google Chat.

    Args:
        flask.Request: the request

    Returns:
        Mapping[str, Any]: the response
    """
    event = req.get_json(silent=True)

    if event and "appCommandMetadata" in event:
        return handle_app_commands(event)
    else:
        return handle_regular_message(event)


# [START chat_avatar_slash_command]
def handle_app_commands(event: Mapping[str, Any]) -> Mapping[str, Any]:
    """Handles slash and quick commands.

    Args:
        Mapping[str, Any] event: The Google Chat event.

    Returns:
        Mapping[str, Any]: the response
    """
    app_command_id = event["appCommandMetadata"]["appCommandId"]

    if app_command_id == ABOUT_COMMAND_ID:
        return {
            "privateMessageViewer": event["user"],
            "text": "The Avatar app replies to Google Chat messages.",
        }
    elif app_command_id == HELP_COMMAND_ID:
        return {
            "privateMessageViewer": event["user"],
            "text": "The Avatar app replies to Google Chat messages.",
        }
    return {}


# [END chat_avatar_slash_command]


def handle_regular_message(event: Mapping[str, Any]) -> Mapping[str, Any]:
    """Handles regular messages (not commands).

    Args:
        Mapping[str, Any] event: The Google Chat event.

    Returns:
        Mapping[str, Any]: the response
    """

    if not event or "user" not in event:
        return "Invalid request."

    message_data = create_message(event["user"])
    return message_data


def create_message(user: Mapping[str, Any]) -> Mapping[str, Any]:
    """Creates a card message with the user's avatar.

    Args:
        Mapping[str, Any] user: The user who sent the message.

    Returns:
        Mapping[str, Any]: a card with the user's avatar.
    """
    display_name = user.get("displayName", "")
    avatar_url = user.get("avatarUrl", "")

    return {
        "text": "Here's your avatar",
        "cardsV2": [
            {
                "cardId": "avatarCard",
                "card": {
                    "name": "Avatar Card",
                    "header": {"title": f"Hello {display_name}!"},
                    "sections": [
                        {
                            "widgets": [
                                {"textParagraph": {"text": "Your avatar picture:"}},
                                {"image": {"imageUrl": avatar_url}},
                            ]
                        }
                    ],
                },
            }
        ],
    }


# [END chat_avatar_app]
