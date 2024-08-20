# Copyright 2023 Google LLC
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

# The ID of the slash command "/about".
# It's not enabled by default, set to the actual ID to enable it. You need to
# use the same ID as set in the Google Chat API configuration.
ABOUT_COMMAND_ID = ""

@functions_framework.http
def avatar_app(req: flask.Request) -> Mapping[str, Any]:
  """Google Cloud Function that handles requests from Google Chat

  Args:
      flask.Request: the request

  Returns:
      Mapping[str, Any]: the response
  """
  if req.method == "GET":
    return "Hello! This function must be called from Google Chat."

  request_json = req.get_json(silent=True)

  # [START chat_avatar_slash_command]
  # Checks for the presence of a slash command in the message.
  if "slashCommand" in request_json["message"]:
    # Executes the slash command logic based on its ID.
    # Slash command IDs are set in the Google Chat API configuration.
    if request_json["message"]["slashCommand"]["commandId"] == ABOUT_COMMAND_ID:
      return {
        "privateMessageViewer": request_json["user"],
        "text": 'The Avatar app replies to Google Chat messages.'
      }
  # [END chat_avatar_slash_command]

  display_name = request_json["message"]["sender"]["displayName"]
  avatar = request_json["message"]["sender"]["avatarUrl"]
  response = create_message(name=display_name, image_url=avatar)
  return response


def create_message(name: str, image_url: str) -> Mapping[str, Any]:
  """Google Cloud Function that handles requests from Google Chat

  Args:
      str name: the sender's display name.
      str image_url: the URL for the sender's avatar.

  Returns:
      Mapping[str, Any]: a card with the user's avatar.
  """
  return {
    "text": "Here's your avatar",
    "cardsV2": [{
      "cardId": "avatarCard",
      "card": {
          "name": "Avatar Card",
          "header": { "title": f"Hello {name}!" },
          "sections": [{
            "widgets": [{
              "textParagraph": { "text": "Your avatar picture:" }
            }, {
              "image": { "imageUrl": image_url }
            }]
          }]
      }
    }]
  }
# [END chat_avatar_app]
