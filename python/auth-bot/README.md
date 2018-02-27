# Hangouts Chat authorization bot

This code sample creates a Hangouts Chat bot that requests additional
authorizations from the user. This bot retrieves the user's Google profile
information from [People API](https://developers.google.com/people/), and
is performing authorization against
[Google's OAuth2](https://developers.google.com/identity/protocols/OAuth2WebServer)
endpoints.

The sample is built using Python on Google App Engine, Flexible Environment.

## Run the sample in Hangouts Chat

  1. Create a new project in the
     [Google Cloud Console](https://console.cloud.google.com)
  1. Enable the People API for your project using
     [this wizard](https://pantheon.corp.google.com/flows/enableapi?apiid=people.googleapis.com).
  1. Create an OAuth2 client ID with the type "Web application" and a redirect
     URI of `https://<project ID>.appspot.com/auth/callback`.
     Download the associated JSON file, move it to this directory, and name it
     `client_secret.json`.
  1. Download the
     [Google App Engine Python SDK](https://cloud.google.com/appengine).
  1. Start a virtual environment
      ```
      virtualenv env
      source env/bin/activate
      ```
      Note: This code requires Python 3 to run.
  1. Install dependencies using `pip`.
      ```
      pip install -t lib -r requirements.txt
      ```
  1. Create an App Engine instance for the bot.
     ```
     gcloud app create --region <REGION>
     ```
  1. Deploy the sample to Google App Engine.
     ```
     gcloud app deploy
     ```
  1. To configure the bot to respond to @ mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.
  1. Add the bot to a room or direct message.
  1. Send the message to the bot with an @-message or directly in a DM.

Note: When running this sample, you may receive an error about
SpooledTemporaryFile class missing from the werkzeug package. To fix this, after
you've downloaded all of the support libraries to lib/ open up
lib/werkzeug/formparser.py and change the following line

```
from tempfile import SpooledTemporaryFile
```

to

```
from tempfile import TemporaryFile
```

## Shut down the local environment

```
virtualenv deactivate
```
