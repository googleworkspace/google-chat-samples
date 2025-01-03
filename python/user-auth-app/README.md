# Google Chat User Authorization App

This sample demonstrates how to create a Google Chat app that requests
authorization from the user to make calls to Chat API on their behalf. The first
time the user interacts with the app, it requests offline OAuth tokens for the
user and saves them to a Firestore database. If the user interacts with the app
again, the saved tokens are used so the app can call Chat API on behalf of the
user without asking for authorization again. Once saved, the OAuth tokens could
even be used to call Chat API without the user being present.

This app is built using Python on Google App Engine (Standard Environment) and
leverages Google's OAuth2 for authorization and Firestore for data storage.

**Key Features:**

* **User Authorization:** Securely requests user consent to call Chat API with
  their credentials.
* **Chat API Integration:** Calls Chat API to post messages on behalf of the
  user.
* **Google Chat Integration:**  Responds to DMs or @mentions in Google Chat. If
  necessary, request configuration to start an OAuth authorization flow.
* **App Engine Deployment:**  Provides step-by-step instructions for deploying
  to App Engine.
* **Cloud Firestore:** Stores user tokens in a Firestore database.

## Prerequisites

* **Python 3:**  [Download](https://www.python.org/downloads/)
* **Google Cloud SDK:**  [Install](https://cloud.google.com/sdk/docs/install)
* **Google Cloud Project:**  [Create](https://console.cloud.google.com/projectcreate)

##  Deployment Steps

1. **Enable APIs:**

   * Enable the Cloud Firestore and Google Chat APIs using the
     [console](https://console.cloud.google.com/apis/enableflow?apiid=firestore.googleapis.com,chat.googleapis.com)
     or gcloud:

     ```bash
     gcloud services enable firestore.googleapis.com chat.googleapis.com
     ```

1. **Initiate Deployment to App Engine:**

   * Go to [App Engine](https://console.cloud.google.com/appengine) and
     initialize an application.

   * Deploy the User Authorization app to App Engine:

     ```bash
     gcloud app deploy
     ```

1. **Create and Use OAuth Client ID:**

   * Get the app hostname:

     ```bash
     gcloud app describe | grep defaultHostname
     ```

   * In your Google Cloud project, go to
     [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
   * Click `Create Credentials > OAuth client ID`.
   * Select `Web application` as the application type.
   * Add `<hostname from the previous step>/oauth2` to `Authorized redirect URIs`.
   * Download the JSON file and rename it to `client_secrets.json` in your
     project directory.
   * Redeploy the app with the file `client_secrets.json`:

     ```bash
     gcloud app deploy
     ```

1. **Create a Firestore Database:**

   *  Create a Firestore database in native mode named `auth-data` using the
      [console](https://console.cloud.google.com/firestore) or gcloud:

      ```bash
      gcloud firestore databases create \
      --database=auth-data \
      --location=REGION \
      --type=firestore-native
      ```

      Replace `REGION` with a
      [Firestore location](https://cloud.google.com/firestore/docs/locations#types)
      such as `nam5` or `eur3`.

## Create the Google Chat app

* Go to
  [Google Chat API](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat)
  and click `Configuration`.
* In **App name**, enter `User Auth App`.
* In **Avatar URL**, enter `https://developers.google.com/chat/images/quickstart-app-avatar.png`.
* In **Description**, enter `Quickstart app`.
* Under Functionality, select **Receive 1:1 messages** and
  **Join spaces and group conversations**.
* Under **Connection settings**, select **HTTP endpoint URL** and enter your App
  Engine app's URL (obtained in the previous deployment steps).
* In **Authentication Audience**, select **HTTP endpoint URL**.
* Under **Visibility**, select **Make this Google Chat app available to specific
  people and groups in your domain** and enter your email address.
* Click **Save**.

The Chat app is ready to receive and respond to messages on Chat.

## Interact with the App

* Add the app to a Google Chat space.
* @mention the app.
* Follow the authorization link to grant the app access to your account.
* Once authorization is complete, the app will post a message to the space using
  your credentials.
* If you @mention the app again, it will post a new message to the space with
  your credentials using the saved tokens, without asking for authorization again.

## Related Topics

* [Authenticate and authorize as a Google Chat user](https://developers.google.com/workspace/chat/authenticate-authorize-chat-user)
* [Receive and respond to user interactions](https://developers.google.com/workspace/chat/receive-respond-interactions)
