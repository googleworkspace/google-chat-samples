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
      res.send('Please provide an account to look up');
    }

    const accountName = JSON.stringify(message.text);
    const sheetsClient = getSheetsClient();
    res.send('finished');
}

/**
 * Looks up ownership information for the account.
 *
 * @param {String} accountName inbound message
 * @return {String} owner name
 */
async function accountLookup(client, accountName) {
    console.log(`account: ${accountName}`);
    let accountsSheet = await client.spreadsheets.values.get({
      spreadsheetId: ACCOUNTS_SHEET_ID,
      range: 'Sheet1!A:D',
    });
    let accountTable = accountsSheet.data.values;
    console.log(`accounts: ${JSON.stringify(accountTable, null, 4)}`);
    var exists = false;

    if (exists) {
        // return card with info
        return 'There is an owner';
    }
    // return card with please update message.
    return 'The account specified could not be found.';
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
