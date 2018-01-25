# Hangouts Chat Cloud Pub/Sub bot sample

## Install the prerequisites

Run the following:
```
pip install --upgrade google-cloud-pubsub
pip install --upgrade oauth2client
pip install --upgrade google-api-python-client
pip install --upgrade httplib2
```

## Run the sample

Before you can run the sample, do the following:

  - Follow the directions for setting up a topic and subscription as
    described in
    [Using Cloud Pub/Sub as an endpoint for your bot](https://developers.google.com/hangouts/chat/how-tos/pub-sub).
  - In `bot.py`, replace the value of the constants `PROJECT_ID` and
    `SUBSCRIPTION_NAME` with the IDs of the project and subscription that
    you created.
  - Make sure that you have set the GOOGLE_APPLICATION_CREDENTIALS variable
    to point to the location of your service account secret file in your
    environment before you invoke Maven.

Run the following command from the project directory:
```
python bot.py
```