const express = require("express");
const router = express.Router();

const PurchaseController = require("../controllers/PurchaseController");
//orders
router.post("", PurchaseController.addOrder);
router.put("", PurchaseController.editOrder);
router.delete("/:id", PurchaseController.deleteOrder);

router.post("/return", PurchaseController.addReturnOrder);
router.put("/return", PurchaseController.editReturnOrder);
router.delete("/return/:id", PurchaseController.deleteReturnOrder);

module.exports = router;
