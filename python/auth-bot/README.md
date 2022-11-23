# Hangouts Chat authorization bot

This code sample creates a Hangouts Chat bot that requests additional
authorizations from the user. This bot retrieves the user's Google profile
information from [People API](https://developers.google.com/people/), and
is performing authorization against
[Google's OAuth2](https://developers.google.com/identity/protocols/OAuth2WebServer)
endpoints.

The sample is built using Python on Google App Engine, Standard Environment.


## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/python3/setting-up-environment)
     to install Python and the Google Cloud SDK
  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/python3/console/#create)
     to create a project and enable App Engine.
  1. Enable the People API for your project using
     [this wizard](https://console.cloud.google.com/flows/enableapi?apiid=people.googleapis.com).
  1. Enable the Cloud Datastore API for your project using
     [this wizard](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com).
  1. Follow [instructions](https://support.google.com/googleapi/answer/6158849?hl=en) for creating
     an oauth client ID for your project. USe the ype "Web application" and a redirect
     URI of `https://<project ID>.appspot.com/auth/callback`.
  1. Download the associated JSON file, move it to this directory, and name it
     `client_secret.json`.

  1. Run the following command to deploy the app:
     ```
     gcloud app deploy
     ```

## Configure the bot for Hangouts Chat

  1. To configure the bot to respond to @mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.

## Interact with the bot

Either add and @mention the bot in a room or in a direct mention to engage with the bot.

When first messaged or added to a space, the bot will respond with a private rqeuest
to configure the bot. Follow the link to authorize access to your profile data. Subsequent
messages will display a card with your profile.

To deauthorize the bot, message "logout" to the bot.

## Run the sample locally

Note: Follow the steps for deployment and configuring the bot for Hangouts Chat
before running locally.

  1. Create a service account for the bot, as documented
     [here](https://developers.google.com/hangouts/chat/how-tos/service-accounts).
     Save the private key in a `service-acct.json` file in the working directory.
  1. Start a virtual environment
  ```
  python3 -m venv python3.10
  source python3.10/bin/activate
  ```
  1. Install libraries using `pip`.
     `pip install -r requirements.txt --upgrade`
  1. Run the sample.
    `GOOGLE_APPLICATION_CREDENTIALS=service-acct.json python main.py`

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -H 'Content-Type: application/json' --data '{"type": "MESSAGE", "configCompleteRedirectUrl": "https://www.example.com", "message": { "text": "header keyvalue", "thread": null }, "user": { "name": "users/123", "displayName": "me"}, "space": { "displayName": "space", "name": "spaces/-oMssgAAAAE"}}' http://127.0.0.1:8080/```

## Shut down the local environment

```
deactivate
```

## Troubleshooting

Note: When running this sample, you may receive an error about
SpooledTemporaryFile class missing from the werkzeug module. To fix this, after
you've downloaded all of the support libraries to lib/ open up
lib/werkzeug/formparser.py and change the following line

```
from tempfile import SpooledTemporaryFile
```

to

```
from tempfile import TemporaryFile
```
