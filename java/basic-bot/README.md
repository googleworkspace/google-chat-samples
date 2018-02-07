# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using Java on Google App Engine,
Standard Environment.

## Run the sample locally

  1. Download the [Google App Engine SDK](https://cloud.google.com/appengine).
  1. Run the sample.
    `mvn appengine:devserver`

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080/bot' \
  -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'
```

## Run the sample in Hangouts Chat

  1. Create an App Engine instance for the bot
     `gcloud app create --region <REGION>`
  1. Update the `src/main/webapp/WEB-INF/appengine-web.xml` file with your
     Google Cloud project ID
  1. Deploy the sample to App Engine
     `mvn appengine:update`
  1. [Enable the Hangouts Chat API, configure and publish the bot](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
     Make sure to register the URL for the App Engine instance as the
     **HTTP endpoint** of the bot.
  1. Add the bot to a room or direct message.
  1. Send the message to the bot with an @-message or directly in a DM