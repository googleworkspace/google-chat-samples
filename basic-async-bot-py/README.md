# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room asynchronously. The sample is built using Python on
Google App Engine, Standard Environment.

## Run the sample in Hangouts Chat

  1. Create a new project in the
     [Google Cloud Console](https://console.cloud.google.com)
  1. Create a service account for the bot, as documented
     [here](https://developers.google.com/hangouts/chat/how-tos/service-accounts).
     Replace the contents of the `service-acct.json` file with the service
     account secrets that you download.
  1. Download the
     [Google App Engine Python SDK](https://cloud.google.com/appengine).
  1. Start a virtual environment
      ```
      virtualenv env
      source env/bin/activate
      ```
  1. Install any extra libraries using `pip`.
      ```
      pip install -t lib -r requirements.txt
      pip install --upgrade -t lib oauth2client
      pip install --upgrade -t lib google-api-python-client
      pip install --upgrade -t lib httplib2
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