const express = require("express");
const router = express.Router();

const ReportController = require("../controllers/ReportController");

// top sales and categories
router.get("/categories/:start&:end", ReportController.getTopCategories);
router.get("/top-sales/:start&:end&:id", ReportController.getTopSales);
router.get("/sales-analytics/:start&:end", ReportController.getSalesAnalytics);

// stock value
router.get("/stock-value", ReportController.getStockValue);

// expenses
router.get("/expenses/:start&:end&:currency", ReportController.getExpenses);

// revenues
router.get("/revenue/:start&:end&:currency", ReportController.getRevenue);
router.get("/returns/:start&:end&:currency", ReportController.getReturns);

// total orders
router.get(
    "/total-orders/:start&:end&:currency",
    ReportController.getTotalOrders
);

// debts
router.get("/debts/:start&:end&:currency", ReportController.getDebts);

// customer payments
router.get(
    "/customer-payments/:start&:end&:currency",
    ReportController.getCustomerPayments
);

// supplier payments
router.get(
    "/supplier-payments/:start&:end&:currency",
    ReportController.getSupplierPayments
);

// get manual cash transactions
router.get(
    "/manual-cash/:start&:end&:currency",
    ReportController.getManualCashTransactions
);

// cash balance
router.get("/cash/:start&:end&:currency", ReportController.getCashBalance);

module.exports = router;
