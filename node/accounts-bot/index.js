const {google} = require('googleapis');
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const ACCOUNTS_SHEET_ID = '1kxW15ZI48mh4KkvgsMpg7gInmEQmyKYRnZdbUOSMRnU';
const ACCOUNTS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kxW15ZI48mh4KkvgsMpg7gInmEQmyKYRnZdbUOSMRnU/edit#gid=0';
const ACCOUNT_IMAGE_URL = 'https://www.gstatic.com/images/icons/material/system_gm/1x/account_circle_black_18dp.png';

/**
 * Looks up the account owner for the company requested.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
*/
exports.accountsBot = async (req, res) => {
  const message = req.query.message || req.body.message;
  if (!message || !message.text) {
    console.log('invalid input');
    res.send(createTextResponse('Please provide an account to look up'));
  }

  const accountName = getAccountName(JSON.stringify(message.text));
  console.log(`accountName: ${accountName}`);
  const sheetsClient = await getSheetsClient();
  const ownerData = await accountLookup(sheetsClient, accountName);
  if (ownerData.length > 0) {
    res.send(createOwnerCard(ownerData));
  } else {
    res.send(createErrorCard(accountName));
  }
};

/**
 * Looks up ownership information for the account.
 *
 * @param {Object} client initialized Sheets API client.
 * @param {String} accountName inbound message
 * @return {String} owner data
 */
async function accountLookup(client, accountName) {
  const accountsSheet = await client.spreadsheets.values.get({
    spreadsheetId: ACCOUNTS_SHEET_ID,
    range: 'Sheet1!A:D',
  });
  const accountsTable = accountsSheet.data.values;
  console.log(`accounts: ${JSON.stringify(accountsTable, null, 4)}`);

  let data = [];

  accountsTable.forEach((entry) => {
    if (entry[0] == accountName) {
      data = entry;
    }
  });
  return data;
}

/**
 * Authenticates the Sheets API client for read-only access.
 *
 * @return {Object} sheets client
 */
async function getSheetsClient() {
  // Should change this to file.only probably
  const auth = await google.auth.getClient({
    scopes: [SHEETS_SCOPE],
  });
  return google.sheets({version: 'v4', auth});
}

/**
 * Creates JSON response for a simple text message for Hangouts.
 *
 * @param {String} message the text of message response
 * @return {JSON} the reponse data
*/
function createTextResponse(message) {
  const data = JSON.stringify({
    text: message,
  });
  return data;
}

/**
 * Gets the last word in the text and removes punctuation if present.
 *
 * @param {String} text the text to strip
 * @return {String} the last word in the input text
 */
function getAccountName(text) {
  const words = text.split(/[ ,]+/);
  // Remove trailing quote
  const name = words.pop().replace('"', '');
  // Remove the trailing ? if present
  return name.replace('?', '');
}

/**
 *
 *
 * @param {Array} data owner info
 * @return {Object} a card with the owner info
 */
function createOwnerCard(data) {
  const company = data[0];
  const name = data[1];
  const location = data[2];
  const email = data[3];

  const cardHeader = {
    title: company + ' Account Owner',
    subtitle: name,
    imageUrl: ACCOUNT_IMAGE_URL,
    imageStyle: 'IMAGE',
  };

  const emailWidget = {
    keyValue: {
      content: 'Email',
      bottomLabel: email,
    },
  };

  const locationWidget = {
    keyValue: {
      content: 'Location',
      bottomLabel: location,
    },
  };

  const infoSection = {widgets: [emailWidget, locationWidget]};

  const cards = [{
    name: 'Status Card',
    header: cardHeader,
    sections: [infoSection],
  }];

  return {cards: cards};
}

/**
 * Creates a card to respond if no account is found.
 *
 * @param {String} accountName the company that could not be found.
 * @return {Object} a card with default info.
 */
function createErrorCard(accountName) {
  const cardHeader = {
    title: 'Account Information Not Found',
    subtitle: 'Account requested: ' + accountName,
    imageUrl: ACCOUNT_IMAGE_URL,
    imageStyle: 'IMAGE',
  };

  const textWidget = {
    textParagraph: {
      text: 'Please check the account data is up to date',
    },
  };

  const buttonWidget = {
    buttons: [
      {
        textButton: {
          text: 'Account Data',
          onClick: {
            openLink: {
              url: ACCOUNTS_SHEET_URL,
            },
          },
        },
      },
    ],
  };

  const infoSection = {widgets: [textWidget, buttonWidget]};

  const cards = [{
    name: 'No Owner Found',
    header: cardHeader,
    sections: [infoSection],
  }];
  return {cards: cards};
}
