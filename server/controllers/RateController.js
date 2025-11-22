const Rate = require("../models/RateModel");

exports.getExchangeRate = async (req, res, next) => {
    try {
        const [rate] = await Rate.getRate();
        res.status(200).send(rate);
    } catch (error) {
        next(error);
    }
};

exports.addExchangeRate = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const rate = req.body;

        const result = await Rate.addRate(rate);
        const [addedRate] = await Rate.getById(result.insertId);

        // emit socket
        io.emit("exchangeRateUpdated", [addedRate, user]);

        res.status(202).send(addedRate);
    } catch (error) {
        next(error);
    }
};

exports.getRecentRates = async (req, res, next) => {
    try {
        const rates = await Rate.getAll();
        res.status(200).send(rates);
    } catch (error) {
        next(error);
    }
};

exports.getRatesGraph = async (req, res, next) => {
    try {
        const year = req.params.year;
        const results = await Rate.getByYear(year);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};
