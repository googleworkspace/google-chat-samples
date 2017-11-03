# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using Python on Google App Engine,
Standard Environment.


## Run the sample locally

  1. Download the [Google App Engine Python SDK](https://cloud.google.com/appengine).
  1. Install any extra libraries using `pip`.
     `pip install -t lib -r requirements.txt`
  1. Start a virtual environment
	```
	virtualenv env
	source env/bin/activate
	```
  1. Run the sample.
    `dev_appserver.py app.yaml`

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080' -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'

## Run the local tests

Run the following command from the `tests/` directory:

```
python runner.py /path/to/google-cloud-sdk/
```

## Deploy the sample

First, create a new project in the
[Google Cloud Console](https://console.cloud.google.com).
After you have created a new project in the Cloud Console, you can deploy
your bot to Google App Engine.

```
gcloud app deploy
```

You may need to create your App Engine instance first:

```
gcloud app create --region <some-region>
```

To browse to the sample, use the following command:

```
gcloud app browse
```
## Configure the bot for Hangouts Chat

  1. To configure the bot to respond to @ mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.

## Shut down the local environment

```
virtualenv deactivate
```