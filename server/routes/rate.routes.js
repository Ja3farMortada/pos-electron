const express = require("express");
const router = express.Router();

const RateController = require("../controllers/RateController");

router.get("/", RateController.getExchangeRate);
router.post("/", RateController.addExchangeRate);
// router.get("/rates", RateController.getRecentRates);
// router.get("/rates/graph/:year", RateController.getRatesGraph);

module.exports = router;
