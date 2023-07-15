# Google Chat basic app

This code sample creates a simple Google Chat app that can responds to events and 
messages from a room. This sample is built using NodeJS ( ExpressJS Framework ) on Standard Environment.

## Run the sample locally
  
  1. Install libraries using `npm`. </br>
     `npm install express body-parser --save` or </br> `npm install` (if package.json is available)
  2. Run the sample.</br>
    `node index.js`

## Configuring the url to Google Chat

  1. To configure the app to respond to @ mentions in Google Chat, follow the steps to enable the API in [Publishing apps](https://developers.google.com/chat/how-tos/apps-publish).

  2. When configuring the app on the **Configuration** tab on the
     **Google Chat API** page, enter the URL for the deployed version of the app into the **app URL** text box.
