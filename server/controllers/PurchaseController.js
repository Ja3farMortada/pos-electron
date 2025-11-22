const PurchaseOrders = require("../models/PurchaseModel");

// add order
exports.addOrder = async (req, res, next) => {
    try {
        const order = req.body.invoice;
        const items = order.items;
        const payment = req.body.payment;
        const modify_cash = req.body.modify_cash;
        const user = req.user;

        delete order.items;

        const result = await PurchaseOrders.addOrder(
            order,
            items,
            payment,
            modify_cash,
            user.user_id
        );

        const new_order = await PurchaseOrders.getAddedOrderById(result.order);
        res.status(201).json(new_order);
    } catch (error) {
        next(error);
    }
};

// edit order
exports.editOrder = async (req, res, next) => {
    try {
        const order = req.body;
        const items = order.items;
        delete order.items;

        const user = req.user;

        const result = await PurchaseOrders.editOrder(
            order,
            items,
            user.user_id
        );
        const new_order = await PurchaseOrders.getAddedOrderById(
            result.insertId
        );
        res.status(201).json(new_order);
    } catch (error) {
        next(error);
    }
};

// delete order
exports.deleteOrder = async (req, res, next) => {
    try {
        const order_id = req.params.id;
        await PurchaseOrders.deleteOrder(order_id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// add return order
exports.addReturnOrder = async (req, res, next) => {
    try {
        const order = req.body.invoice;
        const items = order.items;
        const payment = req.body.payment;
        const modify_cash = req.body.modify_cash;
        const user = req.user;

        delete order.items;

        const result = await PurchaseOrders.addReturnOrder(
            order,
            items,
            payment,
            modify_cash,
            user.user_id
        );

        const new_order = await PurchaseOrders.getAddedReturnOrderById(
            result.order
        );
        res.status(201).json(new_order);
    } catch (error) {
        next(error);
    }
};

// edit return order
exports.editReturnOrder = async (req, res, next) => {
    try {
        const order = req.body;
        const items = order.items;
        delete order.items;

        const user = req.user;

        const result = await PurchaseOrders.editReturnOrder(
            order,
            items,
            user.user_id
        );
        const new_order = await PurchaseOrders.getAddedReturnOrderById(
            result.insertId
        );
        res.status(201).json(new_order);
    } catch (error) {
        next(error);
    }
};

// delete order
exports.deleteReturnOrder = async (req, res, next) => {
    try {
        const order_id = req.params.id;
        await PurchaseOrders.deleteReturnOrder(order_id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        next(error);
    }
};
