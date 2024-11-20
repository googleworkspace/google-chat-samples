# Google Chat Authorization App

This sample demonstrates how to create a Google Chat app that requests authorization from the user to access their Google profile information using the People API. This app is built using Python on Google App Engine (Standard Environment) and leverages Google's OAuth2 for authorization.

**Key Features:**

* **User Authorization:** Securely requests user consent to access their Google profile data.
* **People API Integration:** Retrieves and displays user profile information.
* **Google Chat Integration:**  Responds to @mentions in Google Chat.
* **App Engine Deployment:**  Provides step-by-step instructions for deploying to App Engine.

## Prerequisites

* **Python 3.7 or higher:**  [Download](https://www.python.org/downloads/)
* **Google Cloud SDK:**  [Install](https://cloud.google.com/sdk/docs/install)
* **Google Cloud Project:**  [Create](https://console.cloud.google.com/projectcreate)

##  Deployment Steps

1. **Enable APIs:**

   * Enable the Cloud Datastore, People, and Google Chat APIs using the
     [console](https://console.cloud.google.com/apis/enableflow?apiid=datastore.googleapis.com,people.googleapis.com,chat.googleapis.com)
     or gcloud:

     ```bash
     gcloud services enable datastore.googleapis.com people.googleapis.com chat.googleapis.com
     ```

1. **Initiate Deployment to App Engine:**

   * Open `app.yaml` and replace `<SERVICE_ACCOUNT>` with the email address of your App Engine
     default service account (you can find this in the
     [App Engine settings](https://console.cloud.google.com/appengine/settings) in Cloud Console).

   * Deploy the app:

     ```bash
     gcloud app deploy
     ```

1. **Create and Use OAuth Client ID:**

   * Get the app hostname:

     ```bash
     gcloud app describe | grep defaultHostname
     ```

   * In your Google Cloud project, go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
   * Click `Create Credentials > OAuth client ID`.
   * Select `Web application` as the application type.
   * Add `<hostname from the previous step>/auth/callback` to `Authorized redirect URIs`.
   * Download the JSON file and rename it to `client_secrets.json` in your project directory.
   * Redeploy the app with the file `client_secrets.json`:

     ```bash
     gcloud app deploy
     ```

1. **Grant Datastore Permissions:**

   *  Grant the App Engine default service account permissions to access Datastore:

      ```bash
      PROJECT_ID=$(gcloud config list --format='value(core.project)')
      SERVICE_ACCOUNT_EMAIL=$(gcloud app describe | grep serviceAccount | cut -d ':' -f 2) 
      gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
       --role="roles/datastore.owner"
      ```

## Create the Google Chat app

* Go to
  [Google Chat API](https://developers.google.com/chat/api/guides/quickstart/apps-script)
  and click `Configuration`.
* Enter your App Engine app's URL (obtained in the previous deployment steps)
  as the **HTTP endpoint URL**.
* Complete the rest of the configuration as needed.

## Interact with the App

* Add the app to a Google Chat space.
* @mention the app.
* Follow the authorization link to grant the app access to your profile.
* Send messages to the app to see your profile information.
* Type `logout` to deauthorize the app.
