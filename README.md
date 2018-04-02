# Hangouts Chat code samples

This repository contains the code samples for
[Hangouts Chat bots](https://developers.google.com/hangouts/chat/).
There are folders of samples dependent on language and platform. Generally
the Java and Python samples live in each respective directory, but JavaScript
has multiple form factors (client-side, server-side/Node.js, Google Apps
Script [also server side], and Cloud Functions [GCP or Firebase]).

Which JS platform you choose depends on the type of bot application you're
using/writing. Apps Script features tighter integration with G Suite data and
applications, while Google Cloud Functions has a tighter integration with Google
Cloud Platform services and APIs. Finally, mobile apps or mobile web apps are
more likely to want to take advantage of Cloud Functions for Firebase. It is
also generally straightforward to port from one JS implementation to another,
for example, to Node.js.

In each folder, you can find a language-specific implementation of the
one or more of the following code samples:

  - **Basic bot**: This bot receives event notices and messages from Hangouts
    Chat and responds synchronously with simple text responses. This sample
    demonstrates how to create an HTTP endpoint bot using
    [Google App Engine](https://cloud.google.com/appengine/).
  - **Basic async bot**: This bot receives event notices and messages from
    Hangouts Chat and responds asynchronously with simple text responses. The
    responses will appear in the same thread that raised the original event or
    message. This sample is an HTTP endpoint bot built upon
    [Google App Engine](https://cloud.google.com/appengine/).
  - **Pub/Sub bot**: This bot uses
    [Google Cloud Pub/Sub](https://cloud.google.com/pubsub/) to receive messages
    from Hangouts Chat. The bot responds back to Hangouts Chat asynchronously.
  - **Card bot**: This bot receives event notices and messages from Hangouts
    Chat and responds synchronously with a
    [card-formatted](https://developers.google.com/hangouts/chat/concepts/cards)
    response. This sample is an HTTP endpoint bot built upon
    [Google App Engine](https://cloud.google.com/appengine/).
  - **Vote bot**: This bot demonstrates updating interactive cards by providing
    a platform whereby users can vote on topics, such as who can do lunch today,
    who wants to play ball at lunch, etc. Samples can feature images or be
    text-only.

For additional details about how to set up and run each sample, consult the
README file included with the sample.

## Contributing changes

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licensing

This is not an official product.

This library is licensed under Apache 2.0. Full license text is available in
[LICENSE](LICENSE).
