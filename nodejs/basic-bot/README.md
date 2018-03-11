# Hangouts Chat basic bot

This sample code creates a basic Hangouts Chat bot that can responds to events and messages from a room. This sample is built using NodeJS ( ExpressJS Framework ) on Standard Environment.

## Run the sample locally
  
  1. Install libraries using `npm`. </br>
     `npm install express body-parser --save` or </br> `npm install` (if package.json is available)
  2. Run the sample.</br>
    `node index.js`

## Configuring the url to Hangouts Chat

  1. To configure the bot to respond to @ mentions in Hangouts Chat, follow the steps to enable the API in [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).

  2. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version of the bot into the **Bot URL** text box.