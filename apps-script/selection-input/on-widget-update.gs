function onWidgetUpdate(event) {
  const actionName = event.common["invokedFunction"];
  if (actionName !== "getContacts") {
    return {};
  }

  return {
    actionResponse: {
      type: "UPDATE_WIDGET",
      updatedWidget: {
        suggestions: {
          items: [
            {
              value: "contact-1",
              start_icon_uri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 1",
              bottom_text: "Contact one description",
              selected: false
            },
            {
              value: "contact-2",
              start_icon_uri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 2",
              bottom_text: "Contact two description",
              selected: false
            },
            {
              value: "contact-3",
              start_icon_uri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 3",
              bottom_text: "Contact three description",
              selected: false
            },
            {
              value: "contact-4",
              start_icon_uri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 4",
              bottom_text: "Contact four description",
              selected: false
            },
            {
              value: "contact-5",
              start_icon_uri: "https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png",
              text: "Contact 5",
              bottom_text: "Contact five description",
              selected: false
            },
          ]
        }
      }
    }
  };
}
