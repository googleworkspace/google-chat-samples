#!/usr/bin/env python3
"""Simple bot that exercises Google OAuth and Google People API.

This bot runs on the App Engine Flexible Environment, and uses Google Cloud
Datastore for storing user credentials.
"""

import logging
import os
import flask
import google_auth_httplib2
import werkzeug.contrib.fixers
from apiclient import discovery
from google.oauth2 import credentials
import auth

Credentials = credentials.Credentials

app = flask.Flask(__name__)
app.register_blueprint(auth.mod, url_prefix='/auth')
app.wsgi_app = werkzeug.contrib.fixers.ProxyFix(app.wsgi_app)

logging.basicConfig(
    level=logging.INFO,
    style='{',
    format='{levelname:.1}{asctime} {filename}:{lineno}] {message}')


@app.route('/', methods=['POST'])
def on_event():
    """Handler for events from Hangouts Chat."""
    event = flask.request.get_json()  # type: dict
    if event['type'] == 'MESSAGE' or (
            event['type'] == 'ADDED_TO_SPACE' and 'message' in event):
        if 'logout' in event['message']['text'].lower():
            return on_logout(event)
        return on_mention(event)
    elif event['type'] == 'ADDED_TO_SPACE':
        return flask.jsonify({
            'text': (
                'Thanks for adding me! '
                'Try mentioning me with `@MyProfile` to see your profile.'
            )
        })


def on_mention(event: dict) -> dict:
    """Handles a mention from Hangouts Chat."""
    user_name = event['user']['name']
    user_credentials = auth.get_user_credentials(user_name)
    if user_credentials is None:
        logging.info('Requesting credentials for user %s', user_name)
        oauth2_url = auth.get_authorization_url(event)
        return flask.jsonify({
            'actionResponse': {
                'type': 'REQUEST_CONFIG',
                'url': oauth2_url,
            },
        })
    logging.info('Found existing auth credentials for user %s', user_name)
    return flask.jsonify(produce_profile_message(user_credentials))


def on_logout(event):
    """Handles logging out the user."""
    user_name = event['user']['name']
    try:
        auth.logout(user_name)
    except Exception as e:
        logging.exception(e)
        return flask.jsonify({
            'text': 'Failed to log out user %s: ```%s```' % (user_name, e),
        })
    else:
        return flask.jsonify({
            'text': 'Logged out.',
        })


def produce_profile_message(creds: Credentials):
    """Generate a message containing the users profile inforamtion."""
    http = google_auth_httplib2.AuthorizedHttp(creds)
    people_api = discovery.build('people', 'v1', http=http)
    try:
        person = people_api.people().get(
            resourceName='people/me',
            personFields=','.join([
                'names',
                'addresses',
                'emailAddresses',
                'phoneNumbers',
                'photos',
            ])).execute()
    except Exception as e:
        logging.exception(e)
        return {
            'text': 'Failed to fetch profile info: ```%s```' % e,
        }
    card = {}
    if person.get('names') and person.get('photos'):
        card.update({
            'header': {
                'title': person['names'][0]['displayName'],
                'imageUrl': person['photos'][0]['url'],
                'imageStyle': 'AVATAR',
            },
        })
    widgets = []
    for email_address in person.get('emailAddresses', []):
        widgets.append({
            'keyValue': {
                'icon': 'EMAIL',
                'content': email_address['value'],
            }
        })
    for phone_number in person.get('phoneNumbers', []):
        widgets.append({
            'keyValue': {
                'icon': 'PHONE',
                'content': phone_number['value'],
            }
        })
    for address in person.get('addresses', []):
        if 'formattedValue' in address:
            widgets.append({
                'keyValue': {
                    'icon': 'MAP_PIN',
                    'content': address['formattedValue'],
                }
            })
    if widgets:
        card.update({
            'sections': [
                {
                    'widgets': widgets,
                }
            ]
        })
    if card:
        return {'cards': [card]}
    return {
        'text': 'Hmm, no profile information found',
    }


if __name__ == '__main__':
    os.environ.update({
        # Disable HTTPS check in oauthlib when testing locally.
        'OAUTHLIB_INSECURE_TRANSPORT': '1',
    })

    if not os.environ['GOOGLE_APPLICATION_CREDENTIALS']:
        raise Exception(
            'Set the environment variable GOOGLE_APPLICATION_CREDENTIALS with '
            'the path to your service_account.json file.')
    app.run(port=8080, debug=True)
