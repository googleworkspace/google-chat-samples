# Hangouts Chat Cloud Pub/Sub bot sample

## Install the prerequisites

Make sure that you have set the GOOGLE_APPLICATION_CREDENTIALS variable
in your environment and that it points to the location of the service account
used for posting to Hangouts Chat.

Follow instructions here:
https://developers.google.com/hangouts/chat/how-tos/pub-sub

Run the following:
pip install --upgrade google-cloud-pubsub
pip install --upgrade oauth2client
pip install --upgrade google-api-python-client
pip install --upgrade httplib2

## Run the sample

Run the following command from the project directory:
```
python bot.py
```