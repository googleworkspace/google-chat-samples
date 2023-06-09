# Cloud Functions Basic Chat bot

This code sample creates a Google Chat simple text-only Vote bot that
allows a user to vote (+1 or -1) on a message. The sample is built using
Python 3.10 and is hosted on Google Cloud Functions.


## Run the sample in Google Chat

1. [Create and deploy the cloud function](https://developers.google.com/chat/quickstart/gcf-app#create_and_deploy_a_cloud_function) using the file `main.py` in this repo as the `main.py` of the new Cloud Function.
1. [Enable the Google Chat API, configure and publish the bot](https://developers.google.com/chat/how-tos/apps-publish).
    Make sure to register the URL for the App Engine instance as the
    **HTTP endpoint** of the bot.
1. Add the Vote bot to a chat room and see a new message from the bot with
  the vote card ready to accept its first vote!
