# Google Chat Vote app sample (text-only)

This code sample creates a Google Chat simple text-only Vote app that
allows a user to vote (+1 or -1) on a message. This implementation is
written in Python and hosted on Google App Engine.

![Vote app (text-only)](https://user-images.githubusercontent.com/744973/43745610-9fdfc1c4-9994-11e8-9f47-b16fe3438458.png)

## Run the sample

To run this sample, you must follow these directions to create an App Engine
project, create the app and publish it for yourself in your G
Suite domain, pointing Google Chat to your App Engine-based app.
Once it's published, you can find the app and add it to a chat room or
direct message.

1. [Install the Google Cloud SDK](https://cloud.google.com/sdk/downloads)
  if you haven't already and ensure the `gcloud` command works.
1. [Create a new Google Cloud Platform project](https://console.cloud.google.com)
  or select an existing project.
1. Create an App Engine app (or use an existing one) and note the
  `_APP-ID_.appspot.com` domain you get by default (customize as desired).
1. Create a new folder and drop the files for this app in it. From there,
  [deploy your App Engine app](https://cloud.google.com/appengine/docs/standard/python/tools/uploadinganapp#deploying_an_app).
1. Now follow the instructions to
  [publish your app to Google Chat](https://developers.google.com/chat/how-tos/apps-publish)
1. On the [Google Chat Configuration
  tab](https://console.cloud.google.com/apis/library/chat.googleapis.com),
  customize your app by setting the following values:
  - **Project name**: "Vote app"
  - **App name**: "Vote app"
  - **Avatar URL**: `https://www.gstatic.com/images/icons/material/system/2x/how_to_vote_black_48dp.png`
  - **Description**: "Vote app"
  - **Functionality**: enable for (at least) chat rooms
  - **Connection settings**: select _Apps Script_ and add _Deployment ID_ (per general directions above)
  - **Permissions**: select _Specific people and groups in your domain_, and enter your G Suite email address
1. Click **Save changes** to publish your app
1. Add the Vote app to a chat room and see a new message from the app with
  the vote card ready to accept its first vote!

## Reference

- [Creating Google Chat interactive cards](https://developers.google.com/chat/api/guides/message-formats/cards) featuring the same vote app that supports images and hosted on [Google Cloud Functions](https://cloud.google.com/functions)
- [Google Chat app concept page](https://developers.google.com/chat/how-tos/apps-develop)
- [Creating new apps in Google Chat](https://developers.google.com/chat/how-tos/apps-develop)
- [Google Chat developer documentation](https://developers.google.com/chat)
- [Google App Engine product documentation](https://cloud.google.com/products/appengine)
- [Python App Engine (standard) documentation](https://cloud.google.com/appengine/docs/standard/python/)
