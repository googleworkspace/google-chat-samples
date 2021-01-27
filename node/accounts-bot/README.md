# Accounts Bot

This demo bot serves account owner information for a fictional sales team. This code sample 
shows how create a bot that looks up information from a [Google Sheet][data_sheet] and served by a
[Google Cloud Function][gcf]. With this bot, a user who requests an account owner's information will
either receive a card with contact info or an option ensure the data is up-to-date if the requested
account could not be found. 

![Acme-Lookup](https://github.com/googleworkspace/hangouts-chat-samples/blob/master/node/accounts-bot/assets/AcmeLookup.png)

[gcf]: https://cloud.google.com/functions
[data_sheet]: https://docs.google.com/spreadsheets/d/1kxW15ZI48mh4KkvgsMpg7gInmEQmyKYRnZdbUOSMRnU/copy

## Prerequisites

1. The [Google Cloud SDK][cloud_sdk] and `gcloud` set up on your machine.
1. Please be sure to have completed or understood the concepts in the Hangouts Chat 
Google Cloud Functions [quickstart guide][gcf_bot] first.

[cloud_sdk]: https://cloud.google.com/deployment-manager/docs/step-by-step-guide/installation-and-setup
[gcf_bot]: https://developers.google.com/hangouts/chat/quickstart/gcf-bot

## Set up instructions

1. Make a copy of the [data sheet][data_sheet] in your Google Drive.
1. Create a new Node.js project in your working directory with:

`npm init`

1. Copy the code in index.js to your working directory.
1. Install the googleapis library to access the Sheets API:

`npm install googleapis --save`

### Set up a Google Cloud Project (if needed)

1. [Create a new project][new_project] in the Google Cloud Developer Console.
Name it "AccountsBot", select a **Billing Account** if prompted, and
click **CREATE**. More information on how to setup billing [here][billing].
1. When the project creation is complete a notification appears in the
upper-right of the page. Click on the **Create Project: AccountsBot** entry
to open the project.
1. Open the [**OAuth consent screen**][consent_screen] settings page for the
project.
1. In the field **Application name** enter "AccountsBot" and click the
**Save** button at the bottom.
1. Open the [**Sheets API**][library_sheets] page in the API library and click
the **ENABLE** button.
1. Open the [**Project settings**][project_settings] page for the project.
1. Copy the value listed under **Project number**.

[new_project]: https://console.cloud.google.com/projectcreate
[billing]: https://cloud.google.com/free/docs/gcp-free-tier
[consent_screen]: https://console.cloud.google.com/apis/credentials/consent
[library_sheets]: https://console.cloud.google.com/apis/library/sheets
[project_settings]: https://console.cloud.google.com/iam-admin/settings

### Deploying the Cloud Function

1. In your working directory, deploy the Cloud function with the following command:
`gcloud functions deploy accountsBot --runtime nodejs8 --trigger-http`

### Set the permissions on the data

1. The Cloud Function at runtime will run as your GCP project's AppEngine Default
Service Account. Read more [here][functions_iam]. In the Cloud Console, navigate
to your project's [service accounts][service_accounts] and copy your AppEngine 
Service Account address which should be in this format: 

`PROJECT_ID@appspot.gserviceaccount.com`

  1. If one is not already present, trigger your Cloud Function from the Functions Console.
  1. Navigate back to your service accounts and it should be present.
1. Open your data sheet and give this address view-only permissions. 

[cloud_console]: https://console.cloud.google.com/
[service_accounts]: https://console.cloud.google.com/iam-admin/serviceaccounts
[functions_iam]: https://cloud.google.com/functions/docs/concepts/iam

### Publish the bot to Hangouts Chat

1.  Back in the Cloud Console, open the
    [**Hangouts Chat API**][library_chat] page in the API library and click the
    **ENABLE** button.
1.  Once the API is enabled, on click the **Configuration** tab.
1.  In the Configuration tab, do the following:
    1.  In the **Bot name** box, enter "AccountsBot".
    1.  In the **Avatar URL box**, enter `https://www.gstatic.com/images/icons/material/system_gm/1x/badge_black_18dp.png`.
    1.  In the **Description box**, enter "Easy account owners look up".
    1.  Under **Functionality**, select all options.
    1.  Under **Connection settings**, select **Bot Url** and paste
        your the URL for the Cloud Function trigger into the box.
    1.  Under **Permissions**, select **Specific people and group in your
        domain**. In the text box under the drop-down menu, enter your email
        address.
    1.  Click Save changes.
1.  After you save your changes, verify that the status on the Hangouts Chat API
    page shows the Bot Status to be **LIVE – available to users**.

[library_chat]: https://console.cloud.google.com/apis/library/chat.googleapis.com

## Test the bot

1.  Open [Hangouts Chat][hangouts_chat].
1.  Click **Find people, rooms, bots > Message a bot**.
1.  From the list, select the **AccountsBot** that you created.
1.  Send the message "Acme" to the bot, you should receive a card shown above.
1.  Send the message "foo", you should receive the default card:
![Foo-Lookup](https://github.com/googleworkspace/hangouts-chat-samples/blob/master/node/accounts-bot/assets/FooLookup.png)

[hangouts_chat]: https://chat.google.com
