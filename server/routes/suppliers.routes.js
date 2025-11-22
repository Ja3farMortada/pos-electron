const express = require("express");
const router = express.Router();

const SuppliersController = require("../controllers/SuppliersController");

router.post("/debts", SuppliersController.addManualDebt);

router.get("/", SuppliersController.getAllSuppliers);
router.get("/:id", SuppliersController.getSupplierById);
router.post("/", SuppliersController.createSupplier);
router.put("/", SuppliersController.updateSupplier);
router.delete("/:id", SuppliersController.deleteSupplier);

router.get(
    "/transactions/:account_id&:start&:end",
    SuppliersController.getSupplierBalance
);

router.get("/:id/balance", SuppliersController.getSupplierTotalBalance);

module.exports = router;
