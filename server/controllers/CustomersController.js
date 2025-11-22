const Customer = require("../models/CustomersModel");
const Accounts = require("../models/AccountsModel");

// get customers
exports.getAllCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        next(error);
    }
};

// get customer by id
exports.getCustomerById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const customer = await Customer.getCustomerById(id);
        res.status(200).json(customer);
    } catch (error) {
        next(error);
    }
};

// create customer
exports.createCustomer = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const data = req.body;

        const { insertId } = await Customer.createCustomer(data);
        const customer = await Customer.getCustomerById(insertId);

        // emit socket
        io.emit("customerCreated", [customer, user]);

        res.status(201).send(customer);
    } catch (error) {
        next(error);
    }
};

// update customer
exports.updateCustomer = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const data = req.body;
        await Customer.updateCustomer(data);

        const customer = await Customer.getCustomerById(data.account_id);

        // emit socket
        io.emit("customerUpdated", [customer, user]);

        res.status(201).send(customer);
    } catch (error) {
        next(error);
    }
};

// delete customer
exports.deleteCustomer = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const id = req.params.id;

        const customer = await Customer.getCustomerById(id);
        await Customer.deleteCustomer(id);

        // emit socket
        io.emit("customerDeleted", [customer, user]);

        res.status(201).json({ message: "Customer deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// get customer's debts
exports.getCustomerDebts = async (req, res, next) => {
    try {
        const { currency } = req.params;
        const result = await Customer.getCustomerDebts(currency);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// add manual customer debt
exports.addManualDebt = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        let data = req.body;
        const result = await Customer.addManualDebt(data);

        io.emit("addedCustomerDebt", user);

        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
};

// get customer balance
exports.getCustomerBalance = async (req, res, next) => {
    const { id, start, end, currency } = req.params;
    try {
        const balance = await Accounts.getAccountDetailsById(
            id,
            start,
            end,
            currency
        );
        res.status(200).json(balance);
    } catch (error) {
        next(error);
    }
};

exports.getCustomerLatestPurchases = async (req, res, next) => {
    const { id } = req.params;
    try {
        const purchases = await Customer.getCustomerLatestPurchases(id);
        res.status(200).json(purchases);
    } catch (error) {
        next(error);
    }
};

exports.getCustomerTotalBalance = async (req, res, next) => {
    const { id, currency } = req.params;
    try {
        const balance = await Customer.getCustomerTotalBalance(id, currency);
        res.status(200).json({ id, ...balance });
    } catch (error) {
        next(error);
    }
};
