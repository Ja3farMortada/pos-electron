const Unit = require("../models/UnitModel");

// *************************** units of measure
exports.getUnits = async (req, res, next) => {
    try {
        let units = await Unit.getAll();
        res.status(200).send(units);
    } catch (error) {
        next(error);
    }
};

// create unit
exports.createUnit = async (req, res, next) => {
    let unit = req.body;
    try {
        let result = await Unit.create(unit);
        let createdUnit = await Unit.getById(result.insertId);
        res.status(201).send(createdUnit);
    } catch (error) {
        next(error);
    }
};

// update unit
exports.updateUnit = async (req, res, next) => {
    let unit = req.body;
    try {
        await Unit.update(unit);
        res.status(201).json({
            message: "Unit has been updated successfully!",
        });
    } catch (error) {
        next(error);
    }
};

// delete category
exports.deleteUnit = async (req, res, next) => {
    let unit_id = req.params.id;
    try {
        await Unit.delete(unit_id);
        res.status(202).json({
            message: "Unit has been deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};
