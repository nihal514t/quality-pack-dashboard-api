const { google } = require("googleapis");
const auth = require("../config/google");

const SHEETS = {
    quality: process.env.QUALITY_SPREADSHEET_ID,
    fml: process.env.FML_SPREADSHEET_ID,
    bundle: process.env.BUNDLE_SPREADSHEET_ID,
    capcut: process.env.CAPCUT_SPREADSHEET_ID,
    notion: process.env.NOTION_SPREADSHEET_ID,
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
    const bundle = await readSheet(SHEETS.bundle);
    const capcut = await readSheet(SHEETS.capcut);
    const notion = await readSheet(SHEETS.notion);

    const overallNetSales =
        (quality.NetSales || 0) +
        (fml.NetSales || 0) +
        (bundle.NetSales || 0) +
        (capcut.NetSales || 0) +
        (notion.NetSales || 0);

    const overallExpenses =
        (quality.Expenses || 0) +
        (fml.Expenses || 0) +
        (bundle.Expenses || 0) +
        (capcut.Expenses || 0) +
        (notion.Expenses || 0);

    const overallProfit =
        (quality.Profit || 0) +
        (fml.Profit || 0) +
        (bundle.Profit || 0) +
        (capcut.Profit || 0) +
        (notion.Profit || 0);

    const overallOrders =
        (quality.Orders || 0) +
        (fml.Orders || 0) +
        (bundle.Orders || 0) +
        (capcut.Orders || 0) +
        (notion.Orders || 0);

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
//nihal514t
    return {
        quality,
        fml,
        bundle,
        capcut,
        notion, 
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