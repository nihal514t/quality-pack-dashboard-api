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

        const key = row[0].trim();
        const value = row[1];

        const number = Number(
            value.toString().replace(/[₹,%x]/g, "").replace(/,/g, "")
        );

        result[key] = isNaN(number) ? value : number;
    }

    return result;
}

async function getDashboardData() {

    const quality = await readSheet(SHEETS.quality);
    const fml = await readSheet(SHEETS.fml);

    const overallNetSales =
        (quality.NetSales || 0) +
        (fml.NetSales || 0);

    const overallExpenses =
        (quality.Expenses || 0) +
        (fml.Expenses || 0);

    const overallProfit =
        (quality.Profit || 0) +
        (fml.Profit || 0);

    const overallOrders =
        (quality.Orders || 0) +
        (fml.Orders || 0);

    const overallROAS =
        overallExpenses === 0
            ? 0
            : Number(
                  (overallNetSales / overallExpenses).toFixed(2)
              );

    const overallAvgSales =
        overallOrders === 0
            ? 0
            : Number(
                  (overallNetSales / overallOrders).toFixed(2)
              );

    return {
        quality,
        fml,
        overall: {
            NetSales: overallNetSales,
            Expenses: overallExpenses,
            Profit: overallProfit,
            Orders: overallOrders,
            ROAS: overallROAS,
            AvgSales: overallAvgSales
        }
    };
}

module.exports = {
    getDashboardData,
};