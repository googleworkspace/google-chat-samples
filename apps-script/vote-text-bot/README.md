# Hangouts Chat text-only Vote bot sample

This code sample creates a Hangouts Chat simple text-only Vote bot
written in JavaScript and hosted on Google Apps Script. While Apps
Script features tight integration with G Suite data and applications,
developers can port it to Google Cloud Functions for a tighter
integration with Google Cloud Platform if desired. The Vote bot can
also be ported to Node.js for alternative hosting.

## Run the sample

Before you can run the sample, do the following:

1. Read the [directions for setting up a Google Apps Script
  bot](http://developers.google.com/hangouts/chat/quickstart/apps-script-bot).
1. Follow all of those directions _except_:
  - Replace the template code with the Vote bot (vote-text-bot.js) in the editor.
  - Name the project "Vote bot" and click **OK**.
  - In the **Bot name** field, enter "Vote bot".
  - In the **Avatar URL** field, enter `https://www.gstatic.com/images/icons/material/system/2x/how_to_vote_black_48dp.png`
  - In the **Description** field, enter "Vote bot".
  - Under **Functionality**, select both checkboxes.
  - Under **Connection settings**, select Apps Script project and paste the Deployment ID into the field.
  - Under **Permissions**, select _Specific people and groups in your domain_, and enter your own email.
1. Once you click the **Save changes** button, your bot will be published!
1. Add the Vote bot to a chat room and see a new message from the bot with
the vote card ready to accept its first vote!

## Reference

- Hangouts Chat developer [documentation](https://developers.google.com/hangouts/chat)
- If you're new to Apps Script, you may wish to first check [the
  documentation](https://developers.google.com/apps-script) to
  familiarize yourself with it or watch some
  [videos](https://developers.google.com/apps-script/guides/videos).
