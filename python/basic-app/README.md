# Google Chat basic app

This code sample creates a simple Google Chat app that responds to events and
messages from a space. The sample is built using Python 3 and [Flask](https://flask.palletsprojects.com/)
on Google App Engine, Standard Environment.

## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/setting-up-environment?tab=python)
     to install Python and the Google Cloud SDK

  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/managing-projects-apps-billing#create)
     to create a project and enable App Engine.

  1. Run the following command to deploy the app:
     ```
     gcloud app deploy
     ```

## Configure the app for Google Chat

  1. To configure the app to respond to @mentions in Google Chat, follow
     the steps to enable the API in
     [Publishing apps](https://developers.google.com/chat/how-tos/apps-publish).
  1. When configuring the app on the **Configuration** tab on the
     **Google Chat API** page, enter the URL for the deployed version
     of the app into the **App URL** text box.


## Interact with the app

Either add and @mention the app in a space or in a direct mention to engage with the app.

When added to a space or messaged, the app will respond with a simple reply.

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

## Optional: Enable Google Chat app request verification

This code sample supports request verification but it's disabled by default. To enable it you need to:

  1. Set the constant `AUDIENCE_TYPE` to `APP_URL` or `PROJECT_NUMBER` in the file `main.py` depending on the type
     of authentication audience you want to use.

  1. Set the constant `AUDIENCE` in the file `main.py` to the app URL or project number depending on what you
     specified in the previous step.

  1. Set the parameter `Authentication Audience` under `Connection settings` from the Google Chat app configuration
     to the same audience type you specified in the `AUDIENCE_TYPE` constant.

  1. Redeploy or restart the sample in AppEngine or locally and interact with the app as described in other sections.

You can learn more about Google Chat app request verification from the guide
[Verify requests from Google Chat](https://developers.google.com/workspace/chat/verify-requests-from-chat).
