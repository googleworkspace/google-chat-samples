# Chat Cloud Pub/Sub App sample

This code sample creates a simple Chat App that listens for messages via
Cloud Pub/Sub.

## Run the sample locally

Before you can run the sample, do the following:

  1. Follow the directions for setting up a topic and subscription as
     described in
     [Using Cloud Pub/Sub as an endpoint for your app](https://developers.google.com/chat/api/guides/firewall/pub-sub).
  1. Start a virtual environment
     ```
     virtualenv env
     source env/bin/activate
     ```
  1. Install libraries using `pip`.
     ```
     pip install -r requirements.txt
     ```
  1. Run the sample, substituing your subscription id and service account JSON file from step 1.
    ```
    SUBSCRIPTION_ID=your-subscription-id GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json python app.py
    ```

## Interact with the app

Either add and @mention the app in a room or in a direct mention to engage with the app.

When added to a room or messaged, the app will respond with a simple reply.

