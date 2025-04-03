# Google Chat Incident Response app

> [!NOTE]  
> This tutorial uses Google Chat API app authentication, this feature is in [Developer Preview](https://developers.google.com/workspace/preview).

This code sample creates a Google Chat app that helps users respond to technical
incidents.

This example creates an Apps Script app with two parts: a web page and a Chat app.

The web page simulates an incident by asking users to enter some basic incident
information: title, description, and email addresses of the responders.
The information entered is passed on to the Chat app, which automatically creates
a [Chat space](https://developers.google.com/chat/api/reference/rest/v1/spaces),
adds the responders as members, and posts the incident description as a message.
This represents a starting point for an incident response in this example,
but it could be modified, for example, to respond automatically to an outage
detected by a monitoring agent or a high-priority case created in a CRM.

After the response team resolves the incident, they use a slash command to
automatically create a post-mortem in Google Docs.
The app adds a user-provided description of the incident resolution, a transcript
of the Chat conversation, and a summary of the conversation (automatically
generated using
[Vertex AI Gemini API](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal#send-text-only-request)
to the post-mortem.

## Tutorial

For detailed implementation instructions, follow the
[Incident Response Tutorial](https://developers.google.com/chat/tutorial-incident-response)
in the Google Chat developer documentation.

## Run the sample

To run this sample, you need a Google Cloud
[project](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy#projects)
in a Google Workspace account with billing enabled, required APIs turned on, and
authentication set up. You also need an Apps Script project connected with the
Google Cloud project. Once published, open the app's web page to start an
incident response.

To publish the Chat app:

### 1. Create a Google Cloud project

1. In the Google Cloud console, go to **Menu** > **IAM & Admin** >
   [**Create a Project**](https://console.cloud.google.com/projectcreate).
1. In the **Project Name** field, enter a descriptive name for your project.
   Optional: To edit the **Project ID**, click **Edit**. The project ID can't
   be changed after the project is created, so choose an ID that meets your
   needs for the lifetime of the project.
1. In the **Location** field, click **Browse** to display potential locations
   for your project. Then, click **Select**.
1. Click **Create**. The console navigates to the Dashboard page and your
   project is created within a few minutes.

For further information on Google Cloud projects, refer to [Creating and managing
projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

### 2. Enable billing for the Google Cloud project

1. In the Google Cloud console, go to [Billing](https://console.cloud.google.com/billing/projects).
   Click **Menu** > **Billing** > **My Projects**.
1. In **Select an organization**, choose the organization hosting your Google
   Cloud project.
1. In the project row, open the **Actions** menu, click **Change billing**,
   and choose the desired destination Cloud Billing account.
   <font size="1">Note: If you are not able to select Change billing, you do
   not have the permissions needed to make this change. See [Permissions
   required to enable billing](https://cloud.google.com/billing/docs/how-to/modify-project#required-permissions-enable)
   for more information.</font>
1. Click **Set account**.
1. (Optional) After you link a project to a billing account, you can [lock
   the link](https://cloud.google.com/billing/docs/how-to/secure-project-billing-account-link)
   to prevent the project from unintentionally being moved (linked) to a different
   billing account or the project link being deleted from the billing account.

### 3. Enable the APIs

1. To complete this tutorial, you must
[enable](https://console.cloud.google.com/flows/enableapi?apiid=chat.googleapis.com,%20docs.googleapis.com,%20admin.googleapis.com,%20aiplatform.googleapis.com)
the following APIs:
   - Google Chat API
   - Google Docs API
   - Apps Script API
   - Admin SDK API
   - Vertex AI API   
1. Confirm that you're enabling the APIs in the correct project, then click **Next**.
1. Confirm that you're enabling the correct APIs, then click **Enable**.
1. Optionally, to enable the APIs manually:
   1. In the Google Cloud console, click **Menu** > **APIs & Services** >
      [**Enabled APIs & Services**](https://console.cloud.google.com/apis/dashboard).
   1. Click **+ Enable APIs And Services**.
   1. Search for each required API, click it, then click **Enable**.

### 4. Set up authentication and authorization

Authentication and authorization lets the Google Chat app access resources in
Google Workspace and Google Cloud necessary to process an incident response,
including the ability to create spaces, add people to spaces, post messages to
spaces, and create Google Docs documents.

**Tip**: If you don't know required consent screen information, you can use
placeholder information prior to publicly releasing your Google Chat app. In this
tutorial, the app is published internally. When you publish it externally,
replace placeholder information with real information.

To learn more about authentication in Google Chat, see [Authenticate and authorize
Chat apps and Google Chat API requests](https://developers.devsite.corp.google.com/chat/api/guides/auth).

#### 4.1 Set up user authentication

1. In the Google Cloud console, go to **Menu** > **APIs & Services** >
   [**OAuth consent screen**](https://console.cloud.google.com/apis/credentials/consent).
1. Under **Audience**, select **Internal**, then click **Create**.
1. In **App name**, enter `Incident Response`.
1. In **User support email**, select your email address or an appropriate Google group.
1. Under Developer contact information, enter your email address.
1. Click **Save and Continue**.
1. In **Data Access** click **Add or Remove Scopes**. A panel appears with a list of scopes for each
   API you've enabled in your Google Cloud project.
1. Select the following scopes:
   1. `https://www.googleapis.com/auth/documents`
   1. `https://www.googleapis.com/auth/userinfo.email`
   1. `https://www.googleapis.com/auth/admin.directory.user.readonly`
   1. `https://www.googleapis.com/auth/script.external_request`
   1. `https://www.googleapis.com/auth/cloud-platform`
1. If you add these scopes manually, click **Add to Table**.
1. Click **Update**.
1. Click **Save and Continue**.
1. Review the app registration summary, then click **Back to Dashboard**.

#### 4.2 Set up authentication as an app

When calling Google Chat API, the application will its own credentials.

##### 4.2.1 Create a service account in Google Cloud console

1. In the Google Cloud console, to to **Menu** > **IAM & Admin** > **Service Accounts**.
1. Click **Create service account**
1. Fill in the service account details, then click **Create and continue**.
1. Optional: Assign roles to your service account to grant access to your Google Cloud project's resources. For more details, refer to [Granting, changing, and revoking access to resources](https://cloud.google.com/iam/docs/granting-changing-revoking-access).
1. Click **Continue**
1. Optional: Enter users or groups that can manage and perform actions with this service account. For more details, refer to [Managing service account impersonation](https://cloud.google.com/iam/docs/service-account-impersonation).
1. Click Done. Make a note of the email address for the service account.

The service account appears on the service account page. Next, create a private key for the service account.

##### 4.2.1 Create a private key
> This example uses an exported service account key for simplicity's sake.
> [!WARNING]  
> Exporting a private key is not recommended in production because it shouldn't be stored in an insecure location, such as source control.
> To learn more about secure service account implementations and best practices, see [Choose when to use service accounts](https://cloud.google.com/iam/docs/best-practices-service-accounts#choose-when-to-use).

To create and download a private key for the service account, follow these steps:

1. In the Google Cloud console, to to **Menu** > **IAM & Admin** > **Service Accounts**.
1. Select your service account.
1. Click **Keys** > **Add key** > **Create new key**.
1. Select **JSON**, then click **Create**.

Your new public/private key pair is generated and downloaded to your machine as a new file. Save the downloaded JSON file as credentials.json in your working directory. This file is the only copy of this key. For information about how to store your key securely, see [Managing service account keys](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys).

1. Click **Close**.

For more information about service accounts, see [service accounts](https://cloud.google.com/iam/docs/service-account-overview) in the Google Cloud IAM documentation.
Next, create a Google Workspace Marketplace-compatible OAuth client for this service account.

##### 4.2.2 Receive administrator approval

To use an authorization scope that begins with ``https://www.googleapis.com/auth/chat.app.*``, 
which are available as part of a Developer Preview, your Chat app must get a one-time 
[administrator approval](https://support.google.com/a/answer/15137461?visit_id=638783856097573816-203044261&p=chat-app-auth&rd=1).

To use the ``https://www.googleapis.com/auth/chat.bot`` authorization scope, no administrator approval is required.

To receive administrator approval, you must prepare your Chat app's service account with the following information:

- A Google Workspace Marketplace-compatible OAuth client.
- App configuration in the Google Workspace Marketplace SDK.

Create a Google Workspace Marketplace-compatible OAuth client

###### 4.2.2.1 Create a Google Workspace Marketplace-compatible OAuth client

To create a Google Workspace Marketplace-compatible OAuth client, follow these steps:

1. In the Google Cloud console, go to **Menu** > **IAM & Admin** > **Service Accounts**.
1. Go to **Service Accounts**
1. Click the service account you created for your Chat app.
1. Click **Advanced settings**.
1. Click **Create Google Workspace Marketplace-compatible OAuth client**.
1. Click **Continue**.

A confirmation message appears that says a Google Workspace Marketplace-compatible OAuth client has been created.

###### 4.2.2.2 Configure the Chat app in the Google Workspace Marketplace SDK

To configure the Chat app in the Google Workspace Marketplace SDK, follow these steps:

In the Google Cloud console, enable the Google Workspace Marketplace SDK.

1. In the Google Cloud console, go to go to **Menu** > **APIs & Services** > **Enabled APIs & services** >
**Google Workspace Marketplace SDK** > **App Configuration**.
1. Complete the App Configuration page. How you configure your Chat app depends on who your intended
audience is and other factors. For help completing the app configuration page, see Configure your app
in the Google Workspace Marketplace SDK. For the purposes of this guide, enter the following information:

- Under **App visibility**, select **Private**.
- Under **Installation settings**, select **Individual + admin install**.
- Under **App integrations**, select **Chat app**.
- Under **OAuth scopes**, enter all the [authentication scopes](https://developers.google.com/workspace/chat/authenticate-authorize#chat-api-scopes) your Chat app uses.

> [!WARNING]  
> Don't enter the https://www.googleapis.com/auth/chat.bot authorization scope, which doesn't
require configuration on this page. The example is this guide uses the scopes
``https://www.googleapis.com/auth/chat.app.memberships`` and ``https://www.googleapis.com/auth/chat.app.spaces.create``.
> Under Developer information, enter your Developer name, Developer website URL, and Developer email.

1. Click **Save draft**.

After configuring the app, The store listing should be updated.

1. In the Google Cloud console, go to go to **Menu** > **APIs & Services** > **Enabled APIs & services** >
**Google Workspace Marketplace SDK** > **Store Listing**.
1. Complete the Store Listing page.
1. Click **Publish**.

###### 4.2.2.3 Get administrator approval

Now that your service account is configured to receive administrator approval, 
obtain it from a Google Workspace administrator who can grant approval by
following the steps in [Set up authorization for Chat apps](https://support.google.com/a/answer/15137461?visit_id=638783856097573816-203044261&p=chat-app-auth&rd=1).

### 5. Create an Apps Script project and connect it to the Google Cloud project

Before creating the Apps Script project, copy your Google Cloud project number.
After creating an Apps Script project, you use your Google Cloud project number
to connect your Google Cloud project and Apps Script project.

Also, enable the [Admin SDK Directory service](https://developers.google.com/apps-script/advanced/admin-sdk-directory),
which the incident response app uses to get users' display names.

To connect the projects:

1. Copy your Cloud project number:
   1. Go to your Cloud project in the [Google Cloud console](https://console.cloud.google.com/).
   1. Click **Settings and Utilities** > **Project settings**.
   1. Copy the Project number.
1. Go to [Apps Script](https://script.google.com/).
1. Click **New project**. Apps Script creates an untitled project showing a file
   called `Code.gs`` which consists of a single function. Ignore this file for now.
1. Rename the Apps Script project:
   1. Click **Untitled project**.
   1. In **Project title**, enter `Incident Response Chat app`.
   1. Click **Rename**.
1. In the Chat app Apps Script project, click **Project Settings**
   ![](https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/settings/default/24px.svg).
1. Select **Show "appsscript.json" manifest file in editor**.
1. Under Google Cloud Platform (GCP) Project, click **Change project**.
1. In **GCP project number**, paste the Google Cloud project number.
1. Click **Set project**. The Google Cloud project and Apps Script project are now connected.

To enable the Admin SDK Directory service:

1. At the left, click **Editor** code.
1. At the left, next to **Services**, click **Add a service**.
1. Select **Admin SDK API**.
1. In **Identifier**, select **AdminDirectory**.
1. Click **Add**.

To enable [Oauth2 for Apps Script library](https://github.com/googleworkspace/apps-script-oauth2):

1. At the left, click **Editor** code.
1. At the left, next to **Libraries**, click **Add a library +**.
1. Enter the script ID `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`.
1. Click **Look up**, then click **Add**.

Now that you've created and configured a Google Cloud project and Apps Script project,
you're ready to copy the code into your project and run the sample.

### 6. Copy the code and deploy the Chat app

1. Rename the file `Code.gs` to `ChatApp.gs`.
1. Replace the template code in the editor with the contents of the files in this sample,
   including the file `appsscript.json`. Create new files as needed.
1. In the file `Consts.js`, replace the value of the `PROJECT_ID` with the ID
   (not the number) of your GCP Project, which you can copy from the
   [Google Cloud Console](https://console.cloud.google.com/).
1. In the file `Consts.js`, replace `APP_CREDENTIALS` with the content of the `credentials.json` that you created earlier.
1. Click **Deploy** > **New deployment**.
1. Click the icon besides **Select type** and select both **Wep app** and **Add-on**.
1. Name your deployment and click **Deploy**.
1. Copy the **Deployment ID** to use in your Chat app configuration.
   Copy the **Web app URL** to access your app later.

The Apps Script app is now deployed.

### 7. Configure the Chat API

1. In the [Google Cloud Console](https://console.cloud.google.com/), search for
   **Google Chat API**, and click **Google Chat API**.
1. Click **Manage**.
1. Click [**Configuration**](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat)
   and set up the Chat app:
   1. In the **App name** field, enter `Incident Response Chat app`.
   1. In the **Avatar URL** field, enter `https://developers.google.com/chat/images/quickstart-app-avatar.png`.
   1. In the **Description** field, enter `Incident Response Chat app`.
   1. Under **Functionality**, select **Enable interactive features**,
      **Receive 1:1 messages** and **Join spaces and group conversations**.
   1. Under **Connection settings**, select **Apps Script project** and paste
      the **Deployment ID** into the field.
   1. Under **Slash commands**, add a slash command with the name `/closeIncident`,
      the ID `1`, and give it a description.
   1. Under **Permissions**, select **Specific people and groups in your domain**,
      and enter your email.
   1. Click **Save** and refresh the page.
   1. On the configuration page, under **App status**, set the status to
      **Live - available to users**.
   1. Click **Save**.

The Chat app is ready to respond to messages.

### 8. Open the web page

Navigate to the **Web app URL** from the Apps Script deployment to test your app.