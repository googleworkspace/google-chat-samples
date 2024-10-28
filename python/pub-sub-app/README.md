# Google Chat Cloud Pub/Sub app sample

This code sample creates a simple Google Chat app that listens for
messages via Cloud Pub/Sub.

For more information on how to build with Pub/Sub, please read the
[guide](https://developers.google.com/workspace/chat/quickstart/pub-sub).

## Run the sample locally

Before you can run the sample, do the following:

  1. Follow the directions for setting up a topic and subscription as
     described in
     [Build a Google Chat app behind a firewall with Pub/Sub](https://developers.google.com/chat/api/guides/firewall/pub-sub).
  1. Start a virtual environment
     ```
     python -m venv env
     source env/bin/activate
     ```
  1. Install libraries using `pip`.
     ```
     pip install -r requirements.txt -U
     ```
  1. Run the sample, substituing your subscription id and service account JSON file from step 1.
     ```
     PROJECT_ID=your-project-id SUBSCRIPTION_ID=your-subscription-id GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json python app.py
     ```

## Interact with the app

Either add and @mention the app in a space or in a direct mention to engage with the app.

When added to a space or messaged, the app will respond with a simple reply.
