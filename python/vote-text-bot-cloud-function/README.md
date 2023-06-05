# Cloud Functions Basic Chat App

This code sample creates a Chat simple text-only Vote App that
allows a user to vote (+1 or -1) on a message. The sample is built using
Python 3.10 and is hosted on Google Cloud Functions.


## Run the sample in Chat

1. [Create and deploy the cloud function](https://developers.google.com/chat/quickstart/gcf-app#create_and_deploy_a_cloud_function) using the file `main.py` in this repo as the `main.py` of the new Cloud Function.
1. [Enable the Chat API, configure and publish the App](https://developers.google.com/chat/how-tos/apps-publish).
    Make sure to register the URL for the App Engine instance as the
    **HTTP endpoint** of the app.
1. Add the Vote app to a chat room and see a new message from the app with
  the vote card ready to accept its first vote!
