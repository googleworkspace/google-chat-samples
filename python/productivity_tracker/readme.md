# Hangouts Productivity Tracker Chatbot Sample App

Use the Hangouts Productivity Tracker Chatbot (HPTC) to work smarter, not harder.

- **Quickly record tasks.** HPTC will automatically compile the tasks you enter into a Google Sheet.
- **Measure your productivity.** HPTC will record the time you spend in between tasks, so you can evaluate and improve your productivity.

![example](https://user-images.githubusercontent.com/6697240/42903254-1eb8d378-8a86-11e8-8909-d47a39a24ccc.gif)


This bot uses the following Google APIs:

- [Hangouts Chat API](https://developers.google.com/hangouts/chat/)
- [Google Drive API](https://developers.google.com/drive/)
- [Google Sheets API](https://developers.google.com/sheets/)
- [Cloud SQL API](https://cloud.google.com/sql/)
- [Cloud Natural Language API](https://cloud.google.com/natural-language/)
- [App Engine's Flexible Environment](https://cloud.google.com/appengine/)


# How It Works

### Commands

- `start`:  Start a working session.
- *example:  `submitted time reports` *:  During a working session, say anything to log work.
- `stop`:  End a working session and get a report.

# How to Install and Deploy to [Google App Engine Flex](https://cloud.google.com/appengine/)

### Requirements

- A [Google Cloud Platform](https://cloud.google.com/) account where you can create a project and enable billing.
- A local terminal with Python 2.7 and pip installed.

> Go [here](https://www.python.org/downloads/release/python-2710/) to install Python 2.7. Pip comes installed with most Python distributions.

### 1. Environment Setup

1. Clone this repo:
    `git clone https://github.com/gsuitedevs/hangouts-chat-samples`
1. Open a terminal.
1. Open the root directory:
    `cd hangouts-chat-samples/python/productivity_tracker`
1. Install [virtualenv](https://virtualenv.pypa.io/en/stable/):
    `pip install virtualenv`
1. Create a virtual environment:
    `virtualenv env`
1. Activate your virtual environment:
    `source env/bin/activate`
1. Install project dependencies:
    `pip install -r requirements.txt`

### 2. Set up on Cloud Console

1. [Create a project on the Google Cloud Platform Console](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project)
1. [Enable Billing on that Project](https://cloud.google.com/billing/docs/how-to/modify-project)
1. Enable the following APIs in [Google Cloud's API Library](https://console.cloud.google.com/apis/library)
    - [Cloud SQL API](https://cloud.google.com/sql/)
    - [Google Drive API](https://developers.google.com/drive/)
    - [Google Sheets API](https://developers.google.com/sheets/)
    - [Cloud Natural Language API](https://cloud.google.com/natural-language/)
    - [Hangouts Chat API](https://developers.google.com/hangouts/chat/)
1. [Create a service account and download the service account key](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating_a_service_account).
    -  When creating the service account, select **Project** > **Owner** under **Project Role**
    - Save the service account key as `service_account.json`.
1. [Set the environment variable for your service account key](https://cloud.google.com/docs/authentication/getting-started#setting_the_environment_variable) to tell your Google Cloud project where to look for your service account locally.


### 3. Deployment

1. [Deploy the application](https://cloud.google.com/python/django/flexible-environment).
1. [Publish the bot](https://developers.google.com/hangouts/chat/how-tos/bots-publish). Set "https://mcbotterstein.appspot.com/chatbot_event" as the bot url.
