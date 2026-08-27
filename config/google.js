const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly"
    ],
});

module.exports = auth;