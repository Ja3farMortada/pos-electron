const express = require("express");
const router = express.Router();

const DatabaseController = require("../controllers/DatabaseController");

router.patch("/initialize", DatabaseController.initializeDatabase);
router.patch("/update", DatabaseController.updateDatabase);

module.exports = router;
