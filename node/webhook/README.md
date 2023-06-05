# Incoming webhook

Complete the steps described in the rest of this page, and in about fifteen
minutes you'll have created a Chat app that sends messages to a Chat room.

## Step 1: Register the incoming webhook

  1. Open [Chat](https://chat.google.com/)
     in your browser.
  1. Go to the room to which you want to add an app.
  1. From the menu at the top of the page, select {{app_config_menu}}.
  1. Under **Incoming Webhooks**, click **ADD WEBHOOK**.
  1. Name the new webhook 'Quickstart Webhook' and click **SAVE**.
  1. Copy the URL listed next to your new webhook in the **Webhook Url** column.
  1. Click outside the dialog box to close.

## Step 2: Add your webhook

Replace your webhook URL placeholder in `index.js`.

## Step 3: Run the sample

Run the sample by running the following command from your working directory:

```
$ node .
```

For more information on webhooks, please read the guide on [incoming webhooks](https://developers.google.com/chat/how-tos/webhooks).
