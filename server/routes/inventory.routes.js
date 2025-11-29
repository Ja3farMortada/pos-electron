const express = require("express");
const router = express.Router();

const InventoryController = require("../controllers/Inventory.controller");

router.get("/", InventoryController.getAll);
router.post('/', InventoryController.create);

router.put('/', InventoryController.update);

router.delete('/:inventory_id', InventoryController.delete)




module.exports = router;