# Google Chat Productivity Tracker Chatbot Sample App

Use the Google Chat Productivity Tracker App (GCPT) to work smarter, not harder.

- **Quickly record tasks.** GCPT will automatically compile the tasks you enter into a Google Sheet.
- **Measure your productivity.** GCPT will record the time you spend in between tasks, so you can evaluate and improve your productivity.

![example](https://user-images.githubusercontent.com/6697240/42903254-1eb8d378-8a86-11e8-8909-d47a39a24ccc.gif)


This bot uses the following Google APIs:

- [Google Chat API](https://developers.google.com/chat/)
- [Google Drive API](https://developers.google.com/drive/)
- [Google Sheets API](https://developers.google.com/sheets/)
- [Cloud SQL API](https://cloud.google.com/sql/)
- [Cloud Natural Language API](https://cloud.google.com/natural-language/)
- [App Engine's Flexible Environment](https://cloud.google.com/appengine/)


# How It Works

### Commands

- `start`:  Start a working session.
- *example*:  `submitted time reports`:  During a working session, say anything to log work.
- `stop`:  End a working session and get a report.

# How to Install and Deploy to [Google App Engine Flex](https://cloud.google.com/appengine/)

### Requirements

- A [Google Cloud Platform](https://cloud.google.com/) account where you can create a project and enable billing.
- A local terminal with Python 3.10+ and pip installed.

> Go [here](https://www.python.org/downloads/) to install the latest version of Python. Pip comes installed with most Python distributions.

### 1. Environment Setup

1. Clone this repo:
    `git clone https://github.com/googleworkspace/google-chat-samples`
1. Open a terminal.
1. Open the root directory:
    `cd google-chat-samples/python/productivity_tracker`
1. Create a virtual environment:
    `python -m venv env`
1. Activate your virtual environment:
    `source env/bin/activate`
1. Install project dependencies:
    `pip install -r requirements.txt -U`
    Note: you may need to `sudo apt-get install libmysqlclient-dev -y`

### 2. Set up on Cloud Console

1. [Create a project on the Google Cloud Platform Console](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)
1. [Enable Billing on that Project](https://cloud.google.com/billing/docs/how-to/modify-project)
1. [Enable the Cloud SQL, Compute Engine, Google Drive, Google Sheets, Secret Manager, Cloud Natural Language and Google Chat APIs](https://console.cloud.google.com/flows/enableapi?apiid=compute.googleapis.com,drive.googleapis.com,sqladmin.googleapis.com,sheets.googleapis.com,secretmanager.googleapis.com,language.googleapis.com,chat.googleapis.com).
1. [Create a service account and download the service account key](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating_a_service_account).
    -  When creating the service account, select **Project** > **Owner** under **Project Role**
1. [Create a Cloud SQL MySQL instance](https://cloud.google.com/sql/docs/mysql/create-instance).
1. Update `settings.txt` to set the databse connection settings and secret keys.
1. Secure the settings file in Secret Manager:
    `gcloud secrets create django_settings --data-file settings.txt`

### 3. Deployment

1. Run the application on your local machine and [run the database and static migration commands](https://cloud.google.com/python/django/app-engine#run-locally).
    Note: you will have to use `tcp=3306` for MySQL
1. Deploy the application with the service account:
    `gcloud beta app deploy --service-account SERVICEACCOUNT@PROJECT_ID.iam.gserviceaccount.com`
1. [Configure the app](https://developers.google.com/chat/how-tos/apps-publish) in the [console](https://console.cloud.google.com/apis/library/chat.googleapis.com).
    Set "https://{PROJECT_NAME}.appspot.com/chatbot_event" as the bot url.
