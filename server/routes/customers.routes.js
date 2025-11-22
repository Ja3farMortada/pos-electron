const express = require("express");
const router = express.Router();
// const { admin } = require("../middleware/auth");

const CustomersController = require("../controllers/CustomersController");

router.get("/debts/:currency", CustomersController.getCustomerDebts);
router.post("/debts", CustomersController.addManualDebt);
router.get("/", CustomersController.getAllCustomers);
router.get("/:id", CustomersController.getCustomerById);
router.post("/", CustomersController.createCustomer);
router.put("/", CustomersController.updateCustomer);
router.delete("/:id", CustomersController.deleteCustomer);

router.get(
    "/transactions/:id&:start&:end&:currency",
    CustomersController.getCustomerBalance
);

router.get(
    "/:id/purchases/latest",
    CustomersController.getCustomerLatestPurchases
);
router.get(
    "/:id/balance/:currency",
    CustomersController.getCustomerTotalBalance
);

//admin routes
// router.use(admin);

module.exports = router;
