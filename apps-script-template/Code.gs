/**
 * Responds to a MESSAGE event triggered in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
  var name = "";

  if (event.space.type == "DM") {
    name = "You";
  } else {
    name = event.sender.displayName;
  }
  var message = name + " said \"" + event.message.text + "\"";

  return { "text": message };
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  var message = "";

  if (event.space.type == "DM") {
    message = "Thank you for adding me to a DM, " + event.user.displayName + "!";
  } else {
    message = "Thank you for adding me to " + event.space.displayName;
  }

  return { "text": message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  console.info("Bot removed from ", event.space.name);
}
