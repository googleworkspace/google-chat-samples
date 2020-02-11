# Hangouts Chat basic async bot

This code sample creates a simple Hangouts Chat bot that responds asynchronously to events and
messages from a room. The sample is built using Java 11 and 
[Spring Boot](https://spring.io/projects/spring-boot) on Google App Engine,
Standard Environment.

## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/java11/setting-up-environment)
     to install Java and the Google Cloud SDK.
      
  1. Follow the steps in [Using Maven and the App Engine Plugin](https://cloud.google.com/appengine/docs/standard/java11/using-maven)
     to install Maven.

  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/java11/console/#create)
     to create a project and enable App Engine.

  1. Create a service account for the bot, as documented
     [here](https://developers.google.com/hangouts/chat/how-tos/service-accounts).
     Replace the contents of the `src/main/resources/service-acct.json` file with the service
     account secrets that you download.
       
  1. Run the following command to deploy the app:
     ```
     mvn clean package appengine:deploy -Dapp.deploy.projectId=YOUR_PROJECT_ID
     ```

## Configure the bot for Hangouts Chat

  1. To configure the bot to respond to @mentions in Hangouts Chat, follow
     the steps to enable the API in
     [Publishing bots](https://developers.google.com/hangouts/chat/how-tos/bots-publish).
  1. When configuring the bot on the **Configuration** tab on the
     **Hangouts Chat API** page, enter the URL for the deployed version
     of the bot into the **Bot URL** text box.


## Interact with the bot

Either add and @mention the bot in a room or in a direct mention to engage with the bot.

When added to a room or messaged, the bot will respond with a simple reply.

## Run the sample locally

  1. Run the sample.
     ```
     mvn spring-boot:run
     ```

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080' -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'
```
