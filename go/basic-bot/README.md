# Hangouts Chat basic bot

This code sample creates a simple Hangouts Chat bot that responds to events
and messages from a room. The sample is built using Go on Google App Engine,
Standard Environment.

## Run the sample locally

  1. Download the [Go compiler](https://golang.org/dl/).
  1. Run the application
  ```
  go run main.go
  ```

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

curl 'http://localhost:8080' -X POST -H 'Content-Type: application/json' -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'

## Deploy the sample

First, create a new project in the
[Google Cloud Console](https://console.cloud.google.com).
After you have created a new project in the Cloud Console, you can deploy
your bot to Google App Engine.

```
gcloud app deploy
```

You may need to create your App Engine instance first:

```
gcloud app create --region <some-region>
```

To browse to the sample, use the following command:

```
gcloud app browse
```
## Configure the bot for Hangouts Chat

  1. To configure the bot to respond to @ mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.
