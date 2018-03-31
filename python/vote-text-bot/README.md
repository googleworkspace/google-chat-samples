# Hangouts Chat text-only Vote bot sample

This code sample creates a Hangouts Chat simple text-only Vote bot.
written in Python + webapp2 and hosted on Google App Engine. It is
portable to Flask for App Engine or alternative hosting.

## Run the sample

Before you can run the sample, do the following:

1. [Install](https://cloud.google.com/sdk/downloads) the Google Cloud SDK
  if you haven't already and ensure the `gcloud` command works.
1. Create a new [Google Cloud Platform](https://cloud.google.com) project
  [here](https://console.cloud.google.com) or select an existing project,
  and create an App Engine app (or using an existing one) and note the
  _YOUR-APP_.appspot.com domain you get by default (customize as desired).
1. Create a new folder and drop the files for this bot in it. Then from there,
  [deploy](https://cloud.google.com/appengine/docs/standard/python/tools/uploadinganapp#deploying_an_app)
  it to App Engine.
1. Now that your bot is online, we need to
  [publish](https://developers.google.com/hangouts/chat/how-tos/bots-publish)
  it so Hangouts Chat can forward chat messages to it. Follow the instructions
  on that page to enable the Hangouts Chat API. On the [Configuration
  tab](https://console.developers.google.com/apis/api/chat.googleapis.com/hangouts-chat),
  set the following values:
  - Name the project "Vote bot" and click **OK**.
  - In the **Bot name** field, enter "Vote bot".
  - In the **Avatar URL** field, enter `https://www.gstatic.com/images/icons/material/system/2x/how_to_vote_black_48dp.png`
  - In the **Description** field, enter "Vote bot".
  - Under **Functionality**, select both checkboxes.
  - Under **Connection settings**, add the _YOUR-APP_.appspot.com default
    domain as discussed above to the **Bot URL** field.
  - Under **Permissions**, select _Specific people and groups in your domain_, and enter your own email.
1. Once you click the **Save changes** button, your bot will be published!
1. Add the Vote bot to a chat room and see a new message from the bot with
  the vote card ready to accept its first vote!

## Reference

- Google Hangouts Chat developer [documentation](https://developers.google.com/hangouts/chat)
- If you're new to [Google App
  Engine](https://cloud.google.com/products/appengine), review the
  [documentation](https://cloud.google.com/appengine/docs/standard/python/)
  to familiarize yourself with the PaaS platform.
