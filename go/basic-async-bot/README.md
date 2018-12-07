# Hangouts Chat basic async bot

This code sample creates a simple Hangouts Chat bot that responds to events
and messages from a room asynchronously. The sample is built using Go on
Google App Engine, Standard Environment.

## Deploy the sample

You will need a [service
account](https://developers.google.com/hangouts/chat/how-tos/service-accounts)
to push with the application. The provided `app.yaml` expects it to be named
`account.yaml` and in the same directory (peer to this file).

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
