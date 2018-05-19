# App Engine Basic Taco Chat bot

This code sample creates a simple Hangouts Chat bot that responds to events and
messages from a room. The sample is built using Go on Google Cloud
App Engine Standard Env.

## Run the sample in Hangouts Chat

1.  Create a App Engine
    `gcloud app deploy`
2.  [Enable the Hangouts Chat API, configure and publish the bot](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
    Make sure to register the URL for the App Engine instance as the
    **HTTP endpoint** of the bot.
3.  Add the bot to a room or direct message.
4.  Send the message to the bot with an @-message or directly in a DM, example:
    `@BotName random` will return a recipe with ingredients

## Example Output:

!(Taco Chat Bot)[https://github.com/BaReinhard/random_assets/blob/master/NachoLibreBot.png?raw=true]
