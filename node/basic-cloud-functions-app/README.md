# Cloud Functions Basic Chat App

This code sample creates a simple Chat app that responds to events and
messages from a room. The sample is built using JavaScript on Google Cloud
Functions.


## Run the sample in Chat

  1. Create a cloud function
     `gcloud functions deploy basicApp --trigger-http`
  2. [Enable the Chat API, configure and publish the app](https://developers.google.com/chat/how-tos/apps-publish).
     Make sure to register the URL for the App Engine instance as the
     **HTTP endpoint** of the app.
  1. Add the app to a room or direct message.
  2. Send the message to the app with an @-message or directly in a DM, example:
     `@AppName i love dogs`
