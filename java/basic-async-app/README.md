# Google Chat basic async app

This code sample creates a simple Google Chat app that responds asynchronously to events and
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

  1. Create a service account for the app, as documented
     [here](https://developers.google.com/chat/api/guides/auth/service-accounts).
     Replace the contents of the `src/main/resources/service-acct.json` file with the service
     account secrets that you download.
       
  1. Run the following command to deploy the app:
     ```
     mvn clean package appengine:deploy -Dapp.deploy.projectId=YOUR_PROJECT_ID
     ```

## Configure the app for Google Chat

  1. To configure the app to respond to @mentions in Google Chat, follow
     the steps to enable the API in
     [Publishing apps](https://developers.google.com/chat/how-tos/apps-publish).
  1. When configuring the app on the **Configuration** tab on the
     **Google Chat API** page, enter the URL for the deployed version
     of the app into the **app URL** text box.


## Interact with the app

Either add and @mention the app in a room or in a direct mention to engage with the app.

When added to a room or messaged, the app will respond with a simple reply.

## Run the sample locally

  1. Run the sample.
     ```
     mvn spring-boot:run
     ```

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080' -d \
 '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some room"}}'
```
