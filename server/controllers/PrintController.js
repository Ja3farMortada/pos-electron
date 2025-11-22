const Print = require("../models/PrintModel");

exports.openCashDrawer = async (req, res, next) => {
    try {
        let name = req.params.name;
        const message = await Print.openCashDrawer(name);
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

exports.printReport = async (req, res, next) => {
    try {
        const data = req.body;

        await Print.printReport(data);
        res.status(200).send("");
    } catch (error) {
        next(error);
    }
};

exports.print = async (req, res, next) => {
    try {
        let data = req.body;
        const message = await Print.print(data);
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};
