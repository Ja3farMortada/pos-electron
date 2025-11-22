const express = require("express");
const router = express.Router();

const HistoryController = require("../controllers/HistoryController");

router.post("/sales/search", HistoryController.fetchSalesHistory);

router.post("/sales/details", HistoryController.fetchOrderItemsById);
router.post("/returns/details", HistoryController.fetchReturnOrderItemsById);

router.post("/payment/search", HistoryController.fetchPaymentHistory);
router.post(
    "/money-transfer/search",
    HistoryController.fetchUserMoneyTransferHistory
);
router.post("/return/search", HistoryController.fetchReturnHistory);

// purchases
router.post("/purchase/search", HistoryController.fetchPurchaseHistory);
router.post("/purchases/details", HistoryController.fetchPurchaseItemsById);

// returned purchases
router.post(
    "/return-purchase/search",
    HistoryController.fetchReturnPurchaseHistory
);
router.post(
    "/return-purchases/details",
    HistoryController.fetchReturnPurchaseItemsById
);

router.post("/receipt/search", HistoryController.fetchReceiptHistory);

module.exports = router;
