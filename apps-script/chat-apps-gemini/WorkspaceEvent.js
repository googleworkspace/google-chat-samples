// This script contains the Google Workspace events-specific utilities functions.

/**
 * Creates a new subscription to Google Workspace Events associated to a Google Chat space.
 * 
 * The subscription scope includes message creation events and resources.
 * 
 * @param {string} spaceId the space ID to create a subscription for
 * @returns the ID of the newly created subscription
 */
function createSpaceSubscription(spaceId) {
  const response = UrlFetchApp.fetch(
    `https://workspaceevents.googleapis.com/v1beta/subscriptions`,
    {
      method: "POST",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({
        targetResource: `//chat.googleapis.com/${spaceId}`,
        eventTypes: ["google.workspace.chat.message.v1.created"],
        notificationEndpoint: { pubsubTopic: GWS_PUBSUB_TOPIC_ID },
        payloadOptions: { includeResource: true },
      })
    }
  );

  return JSON.parse(response.getContentText()).response.name;
}

/**
 * Processes events from subscription by using the Google Cloud PubSub API.
 * 
 * It pulls and acknowledges each event.
 */
function processSubscription() {
  const response = UrlFetchApp.fetch(
    `https://pubsub.googleapis.com/v1/${GWS_PUBSUB_SUBSCRIPTION_ID}:pull`,
    {
      method: "POST",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({ maxMessages: 10 })
    }
  );

  const messages = JSON.parse(response.getContentText()).receivedMessages;
  for (var messageIndex in messages) {
    const message = messages[messageIndex];
    const ceType = message.message.attributes["ce-type"];
    const dataStr =
      Utilities.newBlob(Utilities.base64Decode(message.message.data)).getDataAsString();
    if (ceType === "google.workspace.events.subscription.v1.expirationReminder") {
      // Renews subscription.
      renewSubscription(JSON.parse(dataStr).subscription.name);
    } else if (ceType === "google.workspace.chat.message.v1.created") {
      // Processes the message text when it's sent by an user with the inclusivity feature enabled.
      const chatMessage = JSON.parse(dataStr).message;
      if (
        chatMessage.sender.type !== "BOT"
        && shouldHelpWithInclusivity(chatMessage.space.name, chatMessage.sender.name)
      ) {
        const inclusivityCheck = provideInclusivityFeedback(chatMessage.text);
        if (inclusivityCheck !== "It's inclusive!") {
          createAppMessageUsingRest({
            cardsV2: [{ cardId: "1", card: { header: {
                title: "Inclusivity",
                subtitle: `The following words are not inclusive: ${inclusivityCheck}`
            }}}],
            accessoryWidgets: [{ buttonList: { buttons: [{
              icon: {
                iconUrl: "https://developers.google.com/chat/images/quickstart-app-avatar.png"
              },
              onClick: { action: {
                function: "disableInclusivityHelp",
                parameters: [{
                  key: "spaceId",
                  value: chatMessage.space.name
                }, {
                  key: "userId",
                  value: chatMessage.sender.name
                }]
              }}
            }]}}],
            privateMessageViewer: { name: chatMessage.sender.name }
          },
          chatMessage.space.name);
        }
      }
    }
    // Acknowledges successful processing to avoid getting it again next time.
    ackSubscription(message.ackId);
  }
}

/**
 * Acknowledges a subscription event by using the Google Cloud PubSub API.
 * 
 * @param {string} ackId the ID of the event acknowledgment to send
 * @returns 
 */
function ackSubscription(ackId) {
  UrlFetchApp.fetch(
    `https://pubsub.googleapis.com/v1/${GWS_PUBSUB_SUBSCRIPTION_ID}:acknowledge`,
    {
      method: "POST",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({
        ackIds: [ackId]
      })
    }
  );
}

/**
 * Renews a subscription to Google Workspace Events.
 * 
 * The default time to live option is used.
 * 
 * @param {string} subscriptionId the ID of the subscription to renew
 */
function renewSubscription(subscriptionId) {
  UrlFetchApp.fetch(`https://workspaceevents.googleapis.com/v1beta/${subscriptionId}`, {
    method: "PATCH",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ ttl: { seconds: 0 } })
  });
}

/**
 * Deletes a subscription to Google Workspace Events.
 * 
 * @param {string} subscriptionId the ID of the subscription to delete
 */
function deleteSubscription(subscriptionId) {
  UrlFetchApp.fetch(`https://workspaceevents.googleapis.com/v1beta/${subscriptionId}`, {
    method: "DELETE",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() }
  });
}
