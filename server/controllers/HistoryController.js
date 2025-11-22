const History = require("../models/HistoryModel");

exports.fetchSalesHistory = async (req, res, next) => {
    try {
        let criteria = req.body;
        let invoices = await History.fetchSalesHistory(criteria);
        res.status(200).send(invoices);
    } catch (error) {
        next(error);
    }
};

// fetch order items by order id
exports.fetchOrderItemsById = async (req, res, next) => {
    try {
        let ids = req.body;
        // console.log(ids);

        let results = await History.fetchOrderItemsById(ids);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};

// fetch return order items by id
exports.fetchReturnOrderItemsById = async (req, res, next) => {
    try {
        let ids = req.body;
        let results = await History.fetchReturnOrderItemsById(ids);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};

exports.fetchPaymentHistory = async (req, res, next) => {
    try {
        let criteria = req.body;
        let payments = await History.fetchPaymentHistory(criteria);
        res.status(200).send(payments);
    } catch (error) {
        next(error);
    }
};

exports.fetchUserMoneyTransferHistory = async (req, res, next) => {
    try {
        const criteria = req.body;
        let transfers = await History.fetchUserMoneyTransferHistory(criteria);
        res.status(200).send(transfers);
    } catch (error) {
        next(error);
    }
};

exports.fetchReturnHistory = async (req, res, next) => {
    try {
        const criteria = req.body;
        let returns = await History.fetchReturnHistory(criteria);
        res.status(200).send(returns);
    } catch (error) {
        next(error);
    }
};

// purchases
exports.fetchPurchaseHistory = async (req, res, next) => {
    try {
        const criteria = req.body;
        let supplies = await History.fetchPurchaseHistory(criteria);
        res.status(200).send(supplies);
    } catch (error) {
        next(error);
    }
};
// purchase details
exports.fetchPurchaseItemsById = async (req, res, next) => {
    try {
        let ids = req.body;
        let results = await History.fetchPurchaseItemsById(ids);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};

// returned purchases
exports.fetchReturnPurchaseHistory = async (req, res, next) => {
    try {
        const criteria = req.body;
        let supplies = await History.fetchReturnPurchaseHistory(criteria);
        res.status(200).send(supplies);
    } catch (error) {
        next(error);
    }
};
// returned purchase details
exports.fetchReturnPurchaseItemsById = async (req, res, next) => {
    try {
        let ids = req.body;
        let results = await History.fetchReturnPurchaseItemsById(ids);
        res.status(200).send(results);
    } catch (error) {
        next(error);
    }
};

exports.fetchReceiptHistory = async (req, res, next) => {
    try {
        const criteria = req.body;
        let receipts = await History.fetchReceiptHistory(criteria);
        res.status(200).send(receipts);
    } catch (error) {
        next(error);
    }
};
