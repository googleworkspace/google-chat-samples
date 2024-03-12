// This script contains utilities functions based on app authentication.

/**
 * Creates a new message by using the Advanced Chat Service.
 * 
 * @param {Object} message the message object to send to Google Chat
 * @param {string} spaceId the space ID where to create the message
 */
function createAppMessageUsingChatService(message, spaceId) {
  Chat.Spaces.Messages.create(message, spaceId, {}, {
    'Authorization': 'Bearer ' + getService_().getAccessToken()
  });
}

/**
 * Creates a new message by using the REST API.
 * 
 * @param {Object} message the message object to send to Google Chat
 * @param {string} spaceId the space ID where to create the message
 */
function createAppMessageUsingRest(message, spaceId) {
  UrlFetchApp.fetch(`https://chat.googleapis.com/v1/${spaceId}/messages`, {
    method: "POST",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + getService_().getAccessToken() },
    payload: JSON.stringify(message)
  });
}

/**
 * Authenticates the app service by using the OAuth2 library.
 * 
 * Warning: This example uses a service account private key for simplicity's sake, it should always
 * be stored in an secure location.
 * 
 * @return {Object} the authenticated app service
 */
function getService_() {
  const CHAT_CREDENTIALS = {
    // Replace with the Google Chat credentials to use for app authenticatio, the service account
    // private key's JSON.
  }

  return OAuth2.createService("chat-app@apps-script-chat-app-400918.iam.gserviceaccount.com")
    .setTokenUrl(CHAT_CREDENTIALS.token_uri)
    .setPrivateKey(CHAT_CREDENTIALS.private_key)
    .setIssuer(CHAT_CREDENTIALS.client_email)
    .setSubject(CHAT_CREDENTIALS.client_email)
    .setScope('https://www.googleapis.com/auth/chat.bot')
    .setPropertyStore(appProperties);
}
