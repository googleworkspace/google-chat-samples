# Cloud Functions Basic Chat bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using JavaScript on Google Cloud Functions.


## Run the sample in Hangouts Chat

  1. Create a cloud function
     `gcloud functions deploy basicBot --trigger-http`
  2. [Enable the Hangouts Chat API, configure and publish the bot](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
     Make sure to register the URL for the App Engine instance as the
     **HTTP endpoint** of the bot.
  1. Add the bot to a room or direct message.
  2. Send the message to the bot with an @-message or directly in a DM, example: `@BotName i love dogs`
