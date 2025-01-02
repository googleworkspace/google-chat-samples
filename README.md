# Google Chat apps code samples

This repository contains the [code samples](https://developers.google.com/workspace/chat/samples) for
[interactive Google Chat apps](https://developers.google.com/workspace/chat).
Most of them are featured in
[guides](https://developers.google.com/workspace/chat/overview) and
[tutorials](https://developers.google.com/workspace/chat/samples) hosted in the
Developer Website.

**Note:** Code samples for the
[Google Chat API](https://developers.google.com/workspace/chat/api-overview)
are located in the Git repositories dedicated to Google Workspace APIs (see
[Node.js](https://github.com/googleworkspace/node-samples/tree/main/chat),
[Python](https://github.com/googleworkspace/python-samples/tree/main/chat),
[Java](https://github.com/googleworkspace/java-samples/tree/main/chat),
[Apps Script](https://github.com/googleworkspace/apps-script-samples/tree/main/chat)).

In each folder, you can find language-specific implementations (Node.js,
Python, Java, Apps Script) of the following code samples and more:

  - **Basic app**: This app receives event notices and messages from Google
    Chat and responds synchronously with text responses after verifying the
    requests. This sample demonstrates how to create an HTTP endpoint app using
    [Google App Engine](https://cloud.google.com/appengine/).
  - **Avatar app**: This app receives messages from Google Chat and responds
    synchronously with
    [card-formatted](https://developers.google.com/chat/concepts)
    responses. This sample demonstrates how to create an HTTP endpoint app
    using [Google Cloud Run Function](https://cloud.google.com/functions/).
  - **Pub/Sub app**: This app uses
    [Google Cloud Pub/Sub](https://cloud.google.com/pubsub/) to receive messages
    from Google Chat. The app responds back to Google Chat asynchronously.
  - **Vote app**: This app demonstrates updating interactive cards by providing
    a platform whereby users can vote on topics, such as who can do lunch today,
    who wants to play ball at lunch, etc. Samples can feature images or be
    text-only.
  - **Contact form app**: This app demonstrates how to handle input forms and
    data using cards, dialogs, form inputs, and action parameters.
  - **Preview link app**: This app demonstrates how to use preview links to
    provide more information for links in messages from Google Chat.
  - **App home app**: This app handles app home event notices from Google Chat
    and responds synchronously with cards. Both initialization and updates are
    implemented.
  - **Selection input app**: This app demonstrates how to use external data
    sources to dynamically provide selection items in card widgets.
  - **User Auth app**: This app demonstrates how to obtain authorization to call
    Chat API with user credentials and store the user tokens in a database to be
    reused later.
  - **Webhook app**: This app demonstrates how to send messages to Google Chat
    with incoming webhooks.

For additional details about how to set up and run each sample, consult the
README file included with the sample.

**Note**: The Google Chat application, and the developer platform, are only
available to Google Workspace accounts. You will not be able to develop or test a app
with an @gmail.com account.

## Contributing changes

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licensing

This is not an official product.

This library is licensed under Apache 2.0. Full license text is available in
[LICENSE](LICENSE).
