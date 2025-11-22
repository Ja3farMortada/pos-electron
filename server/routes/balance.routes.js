const express = require("express");
const router = express.Router();
const { admin } = require("../middleware/auth");

const BalanceController = require("../controllers/BalanceController");

router.get("/:currency", BalanceController.getBalance);
router.get("/all", admin, BalanceController.getAllUsersBalance);

// get cash transactions history
router.get(
    "/transactions/:start&:end&:currency",
    BalanceController.getCashTransactions
);

router.post("/correct", BalanceController.correctBalance);

module.exports = router;
