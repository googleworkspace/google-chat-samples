
from httplib2 import Http
from oauth2client.service_account import ServiceAccountCredentials
from apiclient.discovery import build, build_from_document

# Adapted from 
# https://github.com/gsuitedevs/hangouts-chat-samples/blob/master/python/basic-async-bot/bot.py
def send_reminder(space_name):
    """Sends a response back to the Hangouts Chat room asynchronously.
    Args:
      spaceName: The URL of the Hangouts Chat room
    """
    response = {'text': 'What have you completed since I last checked in?'}

    scopes = ['https://www.googleapis.com/auth/chat.bot']
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        'service_acct.json', scopes)
    http_auth = credentials.authorize(Http())

    chat = build('chat', 'v1', http=http_auth)
    chat.spaces().messages().create(
        parent=space_name,
        body=response).execute()
    return True