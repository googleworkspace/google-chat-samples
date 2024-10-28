# Google Chat vote app

This code sample creates a Google Chat vote app that allows users to vote
on a message. The sample is built using Java 17 and 
[Spring Boot](https://spring.io/projects/spring-boot) on Google App Engine,
Standard Environment.

![Vote app](./showcase.png)

## Deploy the sample

  1. Follow the steps in [Setting Up Your Development Environment](https://cloud.google.com/appengine/docs/standard/setting-up-environment?tab=java)
     to install Java and the Google Cloud SDK.
      
  1. Follow the steps in [Using Maven and the App Engine Plugin](https://cloud.google.com/appengine/docs/standard/java-gen2/using-maven)
     to install Maven.

  1. Follow the steps in [Setting Up Your GCP Resources](https://cloud.google.com/appengine/docs/standard/managing-projects-apps-billing#create)
     to create a project and enable App Engine.

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
     of the app into the **App URL** text box.

## Interact with the app

Either add or @mention the app in a space or in a direct mention to start a new vote session.

You can specify the statement to start a new vote session for when mentioning the app,
for example `@VoteApp Blue is my favorite color`.

## Start the sample locally

  1. Run the sample.
     ```
     mvn spring-boot:run
     ```

To verify that the sample is running and responds with the correct data
to incoming requests, run the following command from the terminal:

```
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8080' -d '{ "type": "MESSAGE", "message": { "text": "Hello!", "sender": { "displayName": "me"}}, "space": { "displayName": "some space"}}'
```
