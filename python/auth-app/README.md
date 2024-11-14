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
* **Basic familiarity with Google Cloud Console and command line:**

##  Deployment Steps

1. **Enable APIs:**
   *  Enable the Cloud Datastore API: [Enable Datastore API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
   *  Enable the People API: [Enable People API](https://console.cloud.google.com/flows/enableapi?apiid=people.googleapis.com)
   *  Enable the Google Chat API:  [Enable Chat API](https://console.cloud.google.com/flows/enableapi?apiid=chat.googleapis.com)

   ```bash
   gcloud services enable \
    datastore.googleapis.com people.googleapis.com chat.googleapis.com
   ```

2. **Create OAuth Client ID:**
   * In your Google Cloud project, go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
   * Click "Create Credentials" > "OAuth client ID".
   * Select "Web application" as the application type.
   * Add `http://localhost:8080/auth/callback` to "Authorized redirect URIs" for local testing.
   * Download the JSON file and rename it to `client_secrets.json` in your project directory.

3. **Deploy to App Engine:**
   * Open `app.yaml` and replace `<SERVICE_ACCOUNT>` with the email address of your App Engine default service account (you can find this in the [App Engine settings](https://console.cloud.google.com/appengine/settings) in Cloud Console).
   * Deploy the app:
     ```bash
     gcloud app deploy
     ```
   * Get the app hostname:
     ```bash
     gcloud app describe | grep defaultHostname
     ```
   * Update `client_secrets.json`: Replace `http://localhost:8080/auth/callback` in "Authorized redirect URIs" with `<hostname from the previous step>/auth/callback`.
   * Redeploy the app:
     ```bash
     gcloud app deploy
     ```

4. **Grant Datastore Permissions:**
   *  Grant the App Engine default service account permissions to access Datastore:
      ```bash
      PROJECT_ID=$(gcloud config list --format='value(core.project)')
      SERVICE_ACCOUNT_EMAIL=$(gcloud app describe | grep serviceAccount | cut -d ':' -f 2) 
      gcloud projects add-iam-policy-binding $PROJECT_ID \
       --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
       --role="roles/datastore.owner"
      ```

## Configure Google Chat Integration

1. **Enable the Google Chat API:**  [Enable Chat API](https://console.cloud.google.com/flows/enableapi?apiid=chat.googleapis.com)
2. **Create a Google Chat App:**
   * Go to [Google Chat API](https://developers.google.com/chat/api/guides/quickstart/apps-script) and click "Configuration".
   * Enter your App Engine app's URL (obtained in the previous deployment steps) as the **HTTP endpoint URL**.
   * Complete the rest of the configuration as needed.

## Interact with the App

* Add the app to a Google Chat space.
* @mention the app.
* Follow the authorization link to grant the app access to your profile.
* Send messages to the app to see your profile information.
* Type "logout" to deauthorize the app.

## Run Locally

1. **Set up Service Account:**
   * Create a service account with the "Project > Editor" role.
   * Download the service account key as a JSON file (`service-acct.json`).

2. **Set Environment Variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=./service-acct.json 
   ```

3.  **Create Virtual Environment (Recommended):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the App:**

    ```bash
    python main.py
    ```

6.  **Test the App:**

```bash
curl \
  -H 'Content-Type: application/json' \
  --data '{
    "type": "MESSAGE",
    "configCompleteRedirectUrl": "https://www.example.com",
    "message": {
      "text": "header keyvalue",
      "thread": null
    },
    "user": {
      "name": "users/123",
      "displayName": "me"
    },
    "space": {
      "displayName": "space",
      "name": "spaces/-oMssgAAAAE"
    }
  }' \
  http://127.0.0.1:8080/
```

## Troubleshooting

  * **`SpooledTemporaryFile` Error:** If you encounter an error related to the `SpooledTemporaryFile` class,  replace `from tempfile import SpooledTemporaryFile` with `from tempfile import TemporaryFile` in `lib/werkzeug/formparser.py`.
  * **Other Errors:** Refer to the [Google Chat API documentation](https://www.google.com/url?sa=E&source=gmail&q=https://developers.google.com/chat/api/guides/overview) and [App Engine documentation](https://cloud.google.com/appengine/docs) for troubleshooting and common issues.
