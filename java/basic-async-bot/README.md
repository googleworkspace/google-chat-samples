# Hangouts Chat basic async bot

This code sample creates a simple Hangouts Chat bot that responds asynchronously to events and
messages from a room. The sample is built using Java on Google App Engine,
Standard Environment.

## Run the sample in Hangouts Chat

  1. Create a service account for the bot, as documented
     [here](https://developers.google.com/hangouts/chat/how-tos/service-accounts).
     Replace the contents of the `src/main/resources/service-acct.json` file with the service
     account secrets that you download.
  1. Create an App Engine instance for the bot
     `gcloud app create --region <REGION>`
  1. Deploy the sample to App Engine
     `mvn appengine:update`
  1. Enable the Hangouts Chat API, configure and publish the bot. Make sure to
     register the URL for the App Engine instance as the **HTTP endpoint** of the bot.
  1. Add the bot to a room or direct message.
  1. Send the message to the bot with an @-message or directly in a DM.