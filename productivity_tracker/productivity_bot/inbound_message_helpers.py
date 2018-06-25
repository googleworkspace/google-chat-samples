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

from productivity_bot.models import User, ActiveLoops

COMMAND_ERROR = 'Sorry, that was an invalid command.'
SESSION_BEGIN = 'Working session has begun! To end the session, say "stop"'
SESSION_END = 'Working session has ended! See a summary of your work here: %s'

def handle_inbound_message(message_text, username, space_name):
    """Handles inbound messages sent to the bot.

    Server performs an action based on the user's input:
        'start <X> hours': Start a working session and ping the user every X 
            hours
        'stop': Stop the existing working session and send the user a session 
            summary
        '<XYZ>': Log that the user completed <XYZ>

    Args:
        message_text: The raw string sent to this bot from the user via hangouts
            chat
        username: The user's name field (via 
            https://developers.google.com/hangouts/chat/reference/rest/v1/User)
        space_name: The space's name field (via 
            https://developers.google.com/hangouts/chat/reference/rest/v1/spaces)

    Returns:
        The text that the bot should send back to the user via the hangouts chat
            DM

    Raises:
        No errors should be raised. An error would be unexpected behavior.
    """
    message = message_text.split()
    user = User.objects.get_or_create(
        space_name=space_name, 
        username=username
    )[0]
    # User wants to start working session
    if message[0] == 'start':
        mssg_freq = message[1]
        if (len(message) != 3):
            return COMMAND_ERROR
        if (not mssg_freq.isdigit() or message[2] != 'hours'):
            return COMMAND_ERROR

        response = start_active_loop(user, mssg_freq, space_name)
        return response
    # User wants to stop working session
    elif message[0] == 'stop':
        if len(message) != 1 and not in_active_loop(user): 
            return COMMAND_ERROR

        response = end_active_loop(user)
        return response
    # User wants to log work
    else:
        if not in_active_loop(user): 
            return COMMAND_ERROR

        response = log_user_response(user, message)
        return response


def start_active_loop(user, mssg_freq, space_name):
    """Starts a working session/active loop for the user

    This function will create an ActiveLoop object for the user indicating that
    the user is in a working session and should be pinged every mssg_freq
    minutes. If the user is already in a working session, this function will
    delete the existing object and create a new one, allowing users to change
    their frequencies on-the-fly.

    Args:
        user: The User object referring to the user who's requested the active 
            loop
        mssg_freq: The frequency at which the user should be pinged
        space_name: The space's name field (via 
            https://developers.google.com/hangouts/chat/reference/rest/v1/spaces)

    Returns:
        The text that the bot should send back to the user via the hangouts chat
            DM

    Raises:
        No errors should be raised. An error would be unexpected behavior.
    """

    # Check if this user is in an active loop
    # If they are, delete that active loop to create a new one.
    active_loop = in_active_loop(user)
    if active_loop: active_loop.delete()

    active_loop = ActiveLoops(
        user=user, 
        mssg_freq=int(mssg_freq),
        mins_to_mssg = -1*int(mssg_freq))
    active_loop.save()

    return SESSION_BEGIN


def end_active_loop(user):
    """Ends a working session/active loop for the user

    This function will delete an ActiveLoop object for the user. If no object
    exists, it will return gracefully.
    This function will also 'wrap up' the working session by copying the user's
    data into a google sheet, drawing necessary conclusions for the user, and
    displaying it back in the DM.

    Args:
        user: The User object referring to the user who's requested the active 
            loop
    
    Returns:
        The text that the bot should send back to the user via the hangouts chat
            DM

    Raises:
        No errors should be raised. An error would be unexpected behavior.
    """

    active_loop = in_active_loop(user)
    if not active_loop: return "You are not in a working session."
    
    # TODO(ahez): copy SQL data to google sheet
    # TODO(ahez): use GCP NLP API to categorize the data
    # TODO(ahez): Visualize the data with sheets Charts (& maybe data studio)

    active_loop.delete()

    # TODO(ahez): Implement change this summary link once we have a visual
    summary_link = "#"
    return SESSION_END% summary_link


def in_active_loop(user):
    """Checks if there exists an ActiveLoop object for specified User object

    This function determines if the specified user is in an active loop. If it
    is, the function will return the object. Otherwise, it will return False.

    Args:
        user: The User object referring to the user who's requested the active
            loop
    
    Returns:
        ActiveLoop object: if one exists for this user
        False:             otherwise

    Raises:
        No errors should be raised. An error would be unexpected behavior.
    """

    active_loop = ActiveLoops.objects.filter(user=user)
    if active_loop.exists(): return active_loop[0]
    else: return False


def log_user_response(user, text):
    """Logs a user's response as a completed task

    When the user reports completed work, this function is called to log the
    data. It will be stored in the UserResponse table and then copied over to a 
    google sheet in end_active_loop()

    Args:
        user: The User object referring to the user who's requested the active 
            loop
        text: The raw text sent by the user. To be stored now and analyzed 
            later.
    
    Returns:
        The text that the bot should send back to the user via the hangouts chat
            DM

    Raises:
        No errors should be raised. An error would be unexpected behavior.
    """

    # TODO(ahez): Implement this function
    # TODO(ahez): Decide whether to analyze data (using NLP API) here or when
    #    copying to Sheets in end_active_loop(user)


    return "Response has been logged!"
