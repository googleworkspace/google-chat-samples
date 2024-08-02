# Google Chat Cloud Pub/Sub app sample

This code sample creates a simple Google Chat app that listens for
messages via Cloud Pub/Sub.

## Run the sample locally

Before you can run the sample, do the following:

  1. Follow the directions for setting up a topic and subscription as
     described in
     [Build a Google Chat app behind a firewall with Pub/Sub](https://developers.google.com/chat/api/guides/firewall/pub-sub).
  1. Run the sample, substituting your subscription id and service account JSON file from step 1.
    ```
    PROJECT_ID=your-project-id SUBSCRIPTION_ID=your-subscription-id GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json mvn compile exec:java \
    -Dexec.mainClass=Main
    ```

## Interact with the app

Either add and @mention the app in a room or in a direct mention to engage with the app.

When added to a room or messaged, the app will respond with a simple reply.
