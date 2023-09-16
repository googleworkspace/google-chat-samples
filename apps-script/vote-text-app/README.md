# Google Chat Vote app sample (text-only)

This code sample creates a Google Chat simple text-only Vote app that
allows a user to vote (+1 or -1) on a message. This implementation is
written in JavaScript and hosted on Google Apps Script. It should look
like this:

![Vote app (text-only)](https://user-images.githubusercontent.com/744973/43745610-9fdfc1c4-9994-11e8-9f47-b16fe3438458.png)

## Run the sample

To run this sample, you must follow these directions to create the app
and publish it for yourself in your G Suite domain. Once it's published,
you can find it and add it to a chat room or direct message.

1. Follow most of these [directions for setting up a Google Apps Script
  app](https://developers.google.com/chat/quickstart/apps-script-app).
1. Make these customizations for your Apps Script Vote app:
  - Replace the template code in the editor with the Vote app (`vote-text-app.js`).
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
- [Google Apps Script documentation](https://developers.google.com/apps-script)
- [Google Apps Script video library](https://developers.google.com/apps-script/guides/videos)
