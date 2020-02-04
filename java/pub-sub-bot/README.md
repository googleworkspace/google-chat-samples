# Hangouts Chat Cloud Pub/Sub bot sample

This code sample creates a simple Hangouts Chat bot that listens for
messages via Cloud Pub/Sub.

## Run the sample locally

Before you can run the sample, do the following:

  1. Follow the directions for setting up a topic and subscription as
     described in
     [Using Cloud Pub/Sub as an endpoint for your bot](https://developers.google.com/hangouts/chat/how-tos/pub-sub).
  1. Run the sample, substituting your subscription id and service account JSON file from step 1.
    ```
    SUBSCRIPTION_ID=your-subscription-id GOOGLE_APPLICATION_CREDENTIALS=your-service-account.json mvn compile exec:java \
    -Dexec.mainClass=com.google.chat.bot.pubsub.PubSubBot
    ```

## Interact with the bot

Either add and @mention the bot in a room or in a direct mention to engage with the bot.

When added to a room or messaged, the bot will respond with a simple reply.
