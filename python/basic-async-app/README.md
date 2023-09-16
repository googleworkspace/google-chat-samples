# Google Chat basic asynchronous app

This code sample creates a simple Google Chat app that responds to events and
messages from a room asynchronously. The sample is built using Python on
Google App Engine, Standard Environment.


## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/python3/setting-up-environment)
     to install Python and the Google Cloud SDK

  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/python3/console/#create)
     to create a project and enable App Engine.

  1. Create a service account for the app, as documented
     [here](https://developers.google.com/chat/api/guides/auth/service-accounts).
     Replace the contents of the `service-acct.json` file with the service
     account secrets that you download.

  1. Run the following command to deploy the app:
     > ```
     > gcloud app deploy
     > ```

## Configure the app for Google Chat

  1. To configure the app to respond to @mentions in Google Chat, follow
     the steps to enable the API in
     [Publishing apps](https://developers.google.com/chat/api/guides/auth/service-accounts).
  1. When configuring the app on the **Configuration** tab on the
     **Google Chat API** page, enter the URL for the deployed version
     of the app into the **Bot URL** text box.


## Interact with the app

Either add and @mention the app in a room or in a direct mention to engage with the app.

When added to a room or messaged, the app will respond with a simple reply.

## Run the sample locally

Note: Follow the steps for deployment and configuring the app for Google Chat
before running locally.

  1. Start a virtual environment
     > ```
     > virtualenv env
     > source env/bin/activate
     > ```
  1. Install libraries using `pip`.
     > ```
     > pip install -r requirements.txt -U
     > ```
  1. Run the sample.
     > ```
     > GOOGLE_APPLICATION_CREDENTIALS=service-acct.json python main.py
     > ```

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal. Note that this will result
in an error by default. Replacing the `space.name` property with a valid resource name for the app will allow local requests to be processed correctly.

```
curl -H 'Content-Type: application/json' --data '{"type": "MESSAGE", "message": { "text": "header keyvalue", "thread": null }, "user": { "displayName": "me"}, "space": { "displayName": "space", "name": "spaces/..."}}' http://127.0.0.1:8080/
```

## Shut down the local environment

> `virtualenv deactivate`

## Troubleshooting

Note: When running this sample, you may receive an error about
SpooledTemporaryFile class missing from the werkzeug module. To fix this, after
you've downloaded all of the support libraries to lib/ open up
lib/werkzeug/formparser.py and change the following line

> `from tempfile import SpooledTemporaryFile`

to

> `from tempfile import TemporaryFile`
