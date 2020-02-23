const {google} = require('googleapis');
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const ACCOUNTS_SHEET_ID = '1kxW15ZI48mh4KkvgsMpg7gInmEQmyKYRnZdbUOSMRnU';

/**
 * Looks up the account owner for the company requested.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
*/
exports.accountsBot = async (req, res) => {
    const bodyJSON = JSON.stringify(req.body, null, 4);
    console.log(`req body: ${bodyJSON}`);
    const message = req.query.message || req.body.message;
    if (!message || !message.text) {
      console.log('invalid input');
      res.send(createTextResponse('Please provide an account to look up'));
    }

    const accountName = getAccountName(JSON.stringify(message.text));
    console.log('accountName: ' + accountName);
    const sheetsClient = await getSheetsClient();
    var ownerData = await accountLookup(sheetsClient, accountName);
    if (ownerData.length > 0) {

    }
    res.send(createTextResponse(ownerData));
}

/**
 * Looks up ownership information for the account.
 *
 * @param {String} accountName inbound message
 * @return {String} owner data
 */
async function accountLookup(client, accountName) {
    console.log(`account: ${accountName}`);
    let accountsSheet = await client.spreadsheets.values.get({
      spreadsheetId: ACCOUNTS_SHEET_ID,
      range: 'Sheet1!A:D',
    });
    let accountsTable = accountsSheet.data.values;
    console.log(`accounts: ${JSON.stringify(accountsTable, null, 4)}`);

    var data = [];

    accountsTable.forEach(entry => {
        console.log('entry: ' + entry);
        if (entry[0] == accountName) {
            exists = true;
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
      'text': message,
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
    console.log(`text to parse: ${text}`);
    const words = text.split(/[ ,]+/);
    console.log(`words: ${words}`);
    // TODO: fix this string ugliness later
    const name = words.pop().replace('\"', '');
    // Remove the trailing ? if present
    return name.replace('?', '');
  }