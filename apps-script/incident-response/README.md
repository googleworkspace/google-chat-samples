# Google Chat Incident Response app

This code sample creates a simple Google Chat app to help users respond to technical incidents.

This example creates an Apps Script app with two parts: a web page and a Chat app.

The web page lets users enter some basic incident information: title, description,
and email addresses of the responders.
The information entered is passed on to the Chat app, which automatically creates a
[Chat space](https://developers.google.com/chat/api/reference/rest/v1/spaces),
adds the reponders as members, and posts the incident description as a message.
This represents a starting point for an incident response in this example,
but it could easily be modified, for example, to respond automatically to an outage detected
by a monitoring agent.

After the team completes the incident handling, they can use a slash command to automatically
create a post-mortem in Google Docs.
The app adds a user-provided description of the incident resolution, a transcript of the Chat
conversation, and a summary of the conversation (automatically generated using
[Vertex AI](https://cloud.google.com/vertex-ai)) to the post-mortem.

## Tutorial

Follow the [Incident Response Tutorial](https://developers.google.com/chat/tutorial-incident-response)
to learn how to create this app yourself.

## Run the sample

To run this sample, you must follow these directions to create the app
and publish it for yourself in your Google Workspace domain. Once it's published,
you can open the app's web page to start an incident response.

1. Follow most of these [directions for setting up a Google Apps Script
   app](https://developers.google.com/chat/quickstart/apps-script-app).
2. Make these customizations for your Incidente Response app Apps Script project:
  - In the Project Settings, check _Show "appsscript.json" manifest file in the editor_.
  - Click the **+** (_Add a service_) button besides the Services list. Select the _Admin SDK API_.
    Check that the identifier is _AdminDirectory_.
    Click **Add**.
  - Replace the template code in the editor with the contents of the files in this sample,
    including the file `appsscript.json` (create new files as needed).
  - In the file `Consts.js`, replace the value of the `PROJECT_ID` with the ID (not the number)
    of your GCP Project, which you can copy from thew [Google Cloud Console](https://console.cloud.google.com/).
  - Click _Deploy > New deployment_. Click the icon besides _Select type_ and select both
    _Wep app_ and _Add-on_. Name your deployment and click **Deploy**.
  - Copy the _Deployment ID_ to use in your Chat app configuration in the next step.
    Copy the _Web app URL_ to access your app later.
3. Make these customizations for your Incident Response app configuration in the
   [Google Cloud Console](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat):
  - **Project name**: "Incident Response app"
  - **App name**: "Incident Response app"
  - **Description**: "Incident Response app"
  - **Functionality**: Check the options _Enable interactive features_, _Receive 1:1 messages_, and _Join
    spaces and group conversations_
  - **Connection settings**: select _Apps Script_ and add the _Deployment ID_ (per general directions above)
  - **Slash commands**: Add a slash command with the name "/closeIncident", the ID "1", and give it a description
  - **Permissions**: select _Make this Chat app available to specific people and groups in (your domain)_,
    and enter your Google Workspace email address
4. Click **Save changes** to publish your app
5. Enable the [Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com), [Admkin SDK
   API](https://console.cloud.google.com/apis/library/admin.googleapis.com) and [Vertex AI
   API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) in your project.
6. Navigate to the _Web app URL_ from the Apps Script deployment to test your app.
