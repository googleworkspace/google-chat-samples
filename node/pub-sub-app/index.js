/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START chat_pub_sub_app]

const {ChatServiceClient} = require('@google-apps/chat');
const {MessageReplyOption} = require('@google-apps/chat').protos.google.chat.v1.CreateMessageRequest;
const {PubSub} = require('@google-cloud/pubsub');
const {SubscriberClient} = require('@google-cloud/pubsub/build/src/v1');

// Receives messages from a pull subscription.
function receiveMessages() {
  const chat = new ChatServiceClient({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/chat.bot'],
  });

  const subscriptionPath = new SubscriberClient()
    .subscriptionPath(process.env.PROJECT_ID, process.env.SUBSCRIPTION_ID)
  const subscription = new PubSub()
    .subscription(subscriptionPath);

  // Handle incoming message, then ack/nack the received message
  const messageHandler = message => {
    console.log(`Id : ${message.id}`);
    const event = JSON.parse(message.data);
    console.log(`Data : ${JSON.stringify(event)}`);

    // Post the response to Google Chat.
    const request = formatRequest(event);
    if (request != null) {
      chat.createMessage(request);
    }

    // Ack the message.
    message.ack();
  }

  subscription.on('message', messageHandler);
  console.log(`Listening for messages on ${subscriptionPath}`);

  // Keep main thread from exiting while waiting for messages
  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`Stopped listening for messages.`);
  }, 60 * 1000);
}

// Send message to Google Chat based on the type of event
function formatRequest(event) {
  const spaceName = event.space.name;
  const eventType = event.type;

  // If the app was removed, we don't respond.
  if (event.type == 'REMOVED_FROM_SPACE') {
    console.log(`App removed rom space ${spaceName}`);
    return null;
  } else if (eventType == 'ADDED_TO_SPACE' && !eventType.message) {
    // An app can also be added to a space by @mentioning it in a
    // message. In that case, we fall through to the message case
    // and let the app respond. If the app was added using the
    // invite flow, we just post a thank you message in the space.
    return {
      parent: spaceName,
      message: { text: 'Thank you for adding me!' }
    };
  } else if (eventType == 'ADDED_TO_SPACE' || eventType == 'MESSAGE') {
    // In case of message, post the response in the same thread.
    return {
      parent: spaceName,
      messageReplyOption: MessageReplyOption.REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD,
      message: {
        text: 'You said: `' + event.message.text + '`',
        thread: { name: event.message.thread.name }
      }
    };
  }
}

if (!process.env.PROJECT_ID) {
  console.log('Missing PROJECT_ID env var.');
  process.exit(1);
}
if (!process.env.SUBSCRIPTION_ID) {
  console.log('Missing SUBSCRIPTION_ID env var.');
  process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Missing GOOGLE_APPLICATION_CREDENTIALS env var.');
  process.exit(1);
}

receiveMessages();

// [END chat_pub_sub_app]
