const Settings = require("../models/SettingsModel");

exports.getPrintPageSettings = async (req, res, next) => {
    try {
        let settings = await Settings.getPrintPageSettings();
        res.status(200).send(settings);
    } catch (error) {
        next(error);
    }
};

exports.updatePrintPageSettings = async (req, res, next) => {
    try {
        let data = req.body;
        await Settings.updatePrintPageSettings(data);
        res.status(201).json({
            message: "Data updated successfully!",
        });
    } catch (error) {
        next(error);
    }
};
