# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using Python 3 on Google App Engine,
Standard Environment.

## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/python3/setting-up-environment)
     to install Python and the Google Cloud SDK

  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/python3/console/#create)
     to create a project and emable App Engine.

  1. Rum the following command to deploy the app:
     ```
     gcloud app deploy
     ```

## Configure the bot for Hangouts Chat

  1. To configure the bot to respond to @ mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.


## Interact with the bot

Either add and @-mention the bot in a room or in a direct mention to engage with the bot.

When added to a room or messaged, the bot will respond with a simple reply.

## Run the sample locally

  1. Start a virtual environment
  ```
  virtualenv env
  source env/bin/activate
  ```
  1. Install libraries using `pip`.
     `pip install -r requirements.txt`
  1. Run the sample.
    `python main.py`

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080' -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'
```

## Run the local tests

Run the following command from the `tests/` directory:

```
python -m unittest tests/*
```

## Shut down the local environment

```
virtualenv deactivate
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
