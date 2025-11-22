const Supplier = require("../models/SuppliersModel");
const Accounts = require("../models/AccountsModel");

// get suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.getAllSuppliers();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get supplier by id
exports.getSupplierById = async (req, res) => {
    const id = req.params.id;
    try {
        const supplier = await Supplier.getSupplierById(id);
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create supplier
exports.createSupplier = async (req, res) => {
    const data = req.body;
    try {
        const { insertId } = await Supplier.createSupplier(data);
        const supplier = await Supplier.getSupplierById(insertId);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update supplier
exports.updateSupplier = async (req, res) => {
    const data = req.body;
    try {
        const result = await Supplier.updateSupplier(data);

        const supplier = await Supplier.getSupplierById(data.account_id);
        res.status(201).send(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete supplier
exports.deleteSupplier = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Supplier.deleteSupplier(id);
        res.status(201).json({ message: "Supplier deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get supplier transactions by user id
exports.getSupplierBalance = async (req, res, next) => {
    const { account_id, start, end } = req.params;
    try {
        const balance = await Accounts.getSupplierStatement(
            account_id,
            start,
            end
        );
        res.status(200).json(balance);
    } catch (error) {
        next(error);
    }
};
//get supplier total balance
exports.getSupplierTotalBalance = async (req, res, next) => {
    const { id } = req.params;
    try {
        const balance = await Supplier.getSupplierTotalBalance(id);
        res.status(200).json({ id, ...balance });
    } catch (error) {
        next(error);
    }
};

// add manual customer debt
exports.addManualDebt = async (req, res, next) => {
    try {
        let data = req.body;
        const result = await Supplier.addManualDebt(data);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
};
