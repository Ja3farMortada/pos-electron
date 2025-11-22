const express = require("express");
const router = express.Router();

const PrintController = require("../controllers/PrintController");

router.post("/", PrintController.print);

router.post("/print-report", PrintController.printReport);

router.get("/open-cash-drawer/:name", PrintController.openCashDrawer);

module.exports = router;
