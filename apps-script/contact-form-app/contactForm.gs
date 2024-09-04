/**
* The section of the contact card that contains the form input widgets. Used in a dialog and card message.
* To add and preview widgets, use the Card Builder: https://addons.gsuite.google.com/uikit/builder
*/
const contactFormWidgets = [
    {
      "textInput": {
        "name": "contactName",
        "label": "First and last name",
        "type": "SINGLE_LINE"
      }
    },
    {
      "dateTimePicker": {
        "name": "contactBirthdate",
        "label": "Birthdate",
        "type": "DATE_ONLY"
      }
    },
    {
      "selectionInput": {
        "name": "contactType",
        "label": "Contact type",
        "type": "RADIO_BUTTON",
        "items": [
          {
            "text": "Work",
            "value": "Work",
            "selected": false
          },
          {
            "text": "Personal",
            "value": "Personal",
            "selected": false
          }
        ]
      }
    }
  ];
