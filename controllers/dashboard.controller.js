const { getDashboardData } = require("../services/sheets.service");

async function dashboard(req, res) {
    try {
        const data = await getDashboardData();

        res.json(data);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Unable to fetch dashboard"
        });
    }
}

module.exports = {
    dashboard,
};