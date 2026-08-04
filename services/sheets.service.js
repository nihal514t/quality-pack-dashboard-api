const { google } = require("googleapis");
const auth = require("../config/google");

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "API";

async function getDashboardData() {
    const client = await auth.getClient();

    const sheets = google.sheets({
        version: "v4",
        auth: client,
    });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:B`,
    });

    const rows = response.data.values || [];

    const result = {};

    for (const row of rows) {
        if (row.length < 2) continue;

        const key = row[0];
        const value = row[1];

        const number = Number(
            value.toString().replace(/[₹,x%]/g, "")
        );

        result[key] = isNaN(number) ? value : number;
    }

    return result;
}

module.exports = {
    getDashboardData,
};