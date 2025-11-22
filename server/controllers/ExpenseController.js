const Expense = require("../models/ExpenseModel");

exports.getExpenseDetails = async (req, res, next) => {
    try {
        let { expense, start, end } = req.body;
        const expenses = await Expense.getExpenseDetails(expense, start, end);
        res.json(expenses);
    } catch (err) {
        next(err);
    }
};

exports.getExpenseAccounts = async (req, res, next) => {
    try {
        const accounts = await Expense.getExpenseAccounts();
        res.json(accounts);
    } catch (err) {
        next(err);
    }
};

// create
exports.createExpense = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const data = req.body;
        await Expense.createExpense(data, user.user_id);

        // emit socket
        io.emit("expenseCreated", user);

        res.json({ message: "Expense created successfully" });
    } catch (err) {
        next(err);
    }
};

// update
exports.updateExpense = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const data = req.body;
        await Expense.updateExpense(data);

        // emit socket
        io.emit("expenseUpdated", user);

        res.json({ message: "Expense updated successfully" });
    } catch (err) {
        next(err);
    }
};

// delete
exports.deleteExpense = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const payment_id = req.params.payment_id;
        const result = await Expense.deleteExpense(payment_id);

        // emit socket
        io.emit("expenseUpdated", user);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
