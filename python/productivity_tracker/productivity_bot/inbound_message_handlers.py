# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from productivity_bot.models import User, ActiveLoops, UserResponses
from productivity_bot.api_helper import APIHelper

COMMAND_ERROR = 'Sorry, that was an invalid command.'
SESSION_BEGIN = 'Working session has begun! To end the session, say "stop"'
SESSION_END = 'Working session has ended! See a summary of your work here: %s'

def handle_inbound_message(message_text, user_id, space_name, email):
    """Handles inbound messages sent to the bot.

    Args:
        message_text (str): The raw text sent to this bot from the user
        user_id (str): The user's user_name field (
            https://developers.google.com/hangouts/chat/reference/rest/v1/User)
        space_name (str): The space's space_name field (
            https://developers.google.com/hangouts/chat/reference/rest/v1/spaces)
        email (str): The user's email

    Returns:
        str: The bot's response (str)
    """
    user = User.objects.get_or_create(
        space_name=space_name,
        user_id=user_id,
        email=email
    )[0]

    message = message_text.lower().split()

    if message[0] == 'start':
        if (len(message) != 1 or get_active_loop(user)):
            return COMMAND_ERROR

        return start_active_loop(user)

    if message[0] == 'stop':
        if len(message) != 1 or not get_active_loop(user):
            return COMMAND_ERROR

        return end_active_loop(user)

    if not get_active_loop(user):
        return COMMAND_ERROR

    return log_user_response(user, message)


def start_active_loop(user):
    """Starts a working session/active loop for the user

    Args:
        user: The User object for the user who's starting an active loop

    Returns:
        The bot's response (str)
    """

    # Check if this user is in an active loop
    # If they are, delete that active loop to create a new one.
    active_loop = get_active_loop(user)
    if active_loop:
        active_loop.delete()

    ActiveLoops(user=user).save()

    return SESSION_BEGIN


def end_active_loop(user):
    """Ends a working session/active loop for the user

    Args:
        user (User obj): The User object for the user who's starting an active loop

    Returns:
        str: The bot's response
    """
    active_loop = get_active_loop(user)
    if not active_loop:
        return "You are not in a working session."

    api_helper = APIHelper()

    sheet_properties, file_existed = api_helper.get_or_create_sheet(user)
    sheet_id = sheet_properties['sheetId']
    spreadsheet_id = user.spreadsheet_id

    # If the file was just created, share it with the user
    if not file_existed:
        api_helper.share_drive_file(spreadsheet_id, user.email)

    # Copy the information from the UserResponses table to this sheet
    api_helper.copy_sql_table_to_sheet(
        UserResponses,
        {'active_loop': active_loop},
        spreadsheet_id,
        sheet_properties['title']
    )

    active_loop.delete()
    sheet_link = 'https://docs.google.com/spreadsheets/d/{}#gid={}'.format(
        spreadsheet_id, sheet_id)
    return SESSION_END% sheet_link


def get_active_loop(user):
    """Returns the ActiveLoop object for specified User object

    Args:
        user: The User object for the user who's starting an active loop

    Returns:
        ActiveLoop object: if one exists for this user
        None:             otherwise

    """
    active_loop = ActiveLoops.objects.filter(user=user)
    if active_loop.exists():
        return active_loop[0]
    return None

def log_user_response(user, text):
    """Logs a user's response as a completed task

    Args:
        user (User object): The User who's logging a response
        text (list): The text sent by the user.

    Returns:
        str: The bot's response
    """
    active_loop = ActiveLoops.objects.get(user=user)
    raw_text = " ".join(text)

    user_response = UserResponses(active_loop=active_loop, raw_text=raw_text)
    user_response.save()

    return "Response has been logged!"
