const express = require("express");
const router = express.Router();

const SettingsController = require("../controllers/SettingsController");

router.get("/printpage-settings", SettingsController.getPrintPageSettings);
router.put("/printpage-settings", SettingsController.updatePrintPageSettings);

module.exports = router;
