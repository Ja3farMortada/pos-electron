const Payment = require("../models/PaymentModel");

exports.addCustomerPayment = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const paymentData = req.body;
        const result = await Payment.addCustomerPayment(
            paymentData,
            user.user_id
        );

        io.emit("addedCustomerPayment", user);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
exports.editCustomerPayment = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const paymentData = req.body;
        await Payment.editCustomerPayment(paymentData);
        // console.log(result);
        const result = await Payment.fetchPaymentById(paymentData.journal_id);

        io.emit("updatedCustomerPayment", user);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deletePayment = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const payment_id = req.params.payment_id;
        await Payment.deletePayment(payment_id);

        io.emit("deletedCustomerPayment", user);

        res.status(200).json(payment_id);
    } catch (error) {
        next(error);
    }
};

exports.addSupplierPayment = async (req, res, next) => {
    try {
        const paymentData = req.body;
        const user = req.user;

        const result = await Payment.addSupplierPayment(
            paymentData,
            user.user_id
        );
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.editSupplierPayment = async (req, res, next) => {
    try {
        const paymentData = req.body;
        await Payment.editSupplierPayment(paymentData);

        const result = await Payment.fetchPaymentById(paymentData.journal_id);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
