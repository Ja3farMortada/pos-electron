const Database = require("../models/DatabaseModel");

exports.updateDatabase = async (req, res, next) => {
    try {
        await Database.update();
        res.status(201).json({
            message: "Database has been updated successfully!",
        });
    } catch (error) {
        next(error);
    }
};
