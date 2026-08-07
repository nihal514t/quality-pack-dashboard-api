const { google } = require("googleapis");
const auth = require("../config/google");

const SHEETS = {
    quality: process.env.QUALITY_SPREADSHEET_ID,
    fml: process.env.FML_SPREADSHEET_ID
};

const SHEET_NAME = "API";

async function readSheet(spreadsheetId) {

    const client = await auth.getClient();

    const sheets = google.sheets({
        version: "v4",
        auth: client,
    });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A:B`,
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

async function getDashboardData() {

    const quality = await readSheet(
        SHEETS.quality
    );

    const fml = await readSheet(
        SHEETS.fml
    );

    return {
        quality,
        fml,
        overall: {
            revenue:
                (quality.Revenue || 0) +
                (fml.Revenue || 0),

            profit:
                (quality.Profit || 0) +
                (fml.Profit || 0),

            orders:
                (quality.Orders || 0) +
                (fml.Orders || 0),

            adSpend:
                (quality["Ad Spend"] || 0) +
                (fml["Ad Spend"] || 0),

            roas:
                (
                    ((quality.ROAS || 0) +
                        (fml.ROAS || 0)) / 2
                ).toFixed(2)
        }
    };
}

module.exports = {
    getDashboardData,
};