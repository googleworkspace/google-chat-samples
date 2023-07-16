# Google Chat Cloud Pub/Sub app sample

This code sample creates a simple Google Chat app that listens for
messages via Cloud Pub/Sub.

## Run the sample locally

Before you can run the sample, do the following:

  1. Follow the directions for setting up a topic and subscription as
     described in
     [Using Cloud Pub/Sub as an endpoint for your bot](https://developers.google.com/chat/api/guides/firewall/pub-sub).
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
    SUBSCRIPTION_ID=your-subscription-id GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json python bot.py
    ```

## Interact with the bot

Either add and @mention the app in a room or in a direct mention to engage with the bot.

When added to a room or messaged, the app will respond with a simple reply.

