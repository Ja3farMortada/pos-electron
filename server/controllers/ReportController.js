const Reports = require("../models/ReportModel");

exports.getRevenue = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getRevenue(start, end, currency);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getReturns = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getReturns(start, end, currency);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getTotalOrders = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getTotalOrders(start, end, currency);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getDebts = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getDebts(start, end, currency);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

// get customer payments
exports.getCustomerPayments = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getCustomerPayments(start, end, currency);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

exports.getCashBalance = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getCashBalance(start, end, currency);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

exports.getManualCashTransactions = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getManualCashTransactions(
            start,
            end,
            currency
        );
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

exports.getExpenses = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getExpenses(start, end, currency);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getSupplierPayments = async (req, res, next) => {
    try {
        const { start, end, currency } = req.params;
        const result = await Reports.getSupplierPayments(start, end, currency);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getTopSales = async (req, res, next) => {
    try {
        const { start, end, id } = req.params;
        const result = await Reports.getTopSales(start, end, id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getTopCategories = async (req, res, next) => {
    let startDate = req.params.start;
    let endDate = req.params.end;
    try {
        let topCategories = await Reports.getTopCategories(startDate, endDate);
        res.status(200).send(topCategories);
    } catch (error) {
        next(error);
    }
};

// getSalesAnalytics
exports.getSalesAnalytics = async (req, res, next) => {
    try {
        let startDate = req.params.start;
        let endDate = req.params.end;
        let results = await Reports.getSalesAnalytics(startDate, endDate);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};

// stock value
exports.getStockValue = async (req, res, next) => {
    try {
        let stockValue = await Reports.getStockValue();
        res.status(200).send(stockValue);
    } catch (error) {
        next(error);
    }
};
