const express = require("express");
const router = express.Router();

const DatabaseController = require("../controllers/DatabaseController");

router.patch("/", DatabaseController.updateDatabase);

module.exports = router;
