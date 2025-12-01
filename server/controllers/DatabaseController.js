const Database = require("../models/DatabaseModel");

exports.initializeDatabase = async (req, res, next) => {
    try {
        const result = await Database.initializeDatabase();
        res.status(result.status === "created" ? 201 : 409).json({
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

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
