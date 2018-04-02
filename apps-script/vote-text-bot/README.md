# Hangouts Chat Vote bot sample (text-only)

This code sample creates a Hangouts Chat simple text-only Vote bot that
allows a user to vote (+1 or -1) on a message. This implementation is
written in JavaScript and hosted on Google Apps Script.

## Run the sample

To run this sample, you must follow these directions to create the bot
and publish it for yourself in your G Suite domain. Once it's published,
you can find it and add it to a chat room or direct message.

1. Follow most of these [directions for setting up a Google Apps Script
  bot](http://developers.google.com/hangouts/chat/quickstart/apps-script-bot).
1. Make these customizations for your Apps Script Vote bot:
  - Replace the template code in the editor with the Vote bot (`vote-text-bot.js`).
  - **Project name**: "Vote bot"
  - **Bot name**: "Vote bot"
  - **Avatar URL**: `https://www.gstatic.com/images/icons/material/system/2x/how_to_vote_black_48dp.png`
  - **Description**: "Vote bot"
  - **Functionality**: enable for (at least) chat rooms
  - **Connection settings**: select _Apps Script_ and add _Deployment ID_ (per general directions above)
  - **Permissions**: select _Specific people and groups in your domain_, and enter your G Suite email address
1. Click **Save changes** to publish your bot
1. Add the Vote bot to a chat room and see a new message from the bot with
  the vote card ready to accept its first vote!

## Reference

- [Creating Hangouts Chat interactive cards](https://developers.google.com/hangouts/chat/how-tos/cards-onclick) featuring the same vote bot that supports images and hosted on [Google Cloud Functions](https://cloud.google.com/functions)
- [Hangouts Chat bot concept page](https://developers.google.com/hangouts/chat/concepts/bots)
- [Creating new bots in Hangouts Chat](https://developers.google.com/hangouts/chat/how-tos/bots-develop)
- [Hangouts Chat developer documentation](https://developers.google.com/hangouts/chat)
- [Google Apps Script documentation](https://developers.google.com/apps-script)
- [Google Apps Script video library](https://developers.google.com/apps-script/guides/videos)
