# Incoming webhook

Complete the steps described in the rest of this page, and in about fifteen
minutes you'll have created a Hangouts Chat bot that sends messages to a
Hangouts Chat room.

## Step 1: Register the incoming webhook

  1. Open [Hangouts Chat](https://chat.google.com/)
     in your browser.
  1. Go to the room to which you want to add a bot.
  1. From the menu at the top of the page, select {{bot_config_menu}}.
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

For more information on webhooks, please read the guide on [incoming webhooks](https://developers.google.com/hangouts/chat/how-tos/webhooks).
