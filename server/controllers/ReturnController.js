const ReturnOrder = require("../models/ReturnModel");

exports.addReturn = async (req, res, next) => {
    try {
        const order = req.body;
        const items = order.items;

        const io = req.io;
        const user = req.user;

        delete order.items;

        const order_id = await ReturnOrder.create(order, items, user);

        const createdOrder = await ReturnOrder.getById(order_id);

        // emit socket
        io.emit("returnOrderCreated", [createdOrder, user]);

        res.status(201).send(createdOrder);
    } catch (error) {
        next(error);
    }
};

// edit order
exports.editReturn = async (req, res, next) => {
    try {
        const order = req.body;
        const items = order.items;
        delete order.items;
        const io = req.io;
        const user = req.user;

        const result = await ReturnOrder.update(order, items, user);
        const updatedOrder = await ReturnOrder.getById(result.insertId);

        // emit socket
        io.emit("returnOrderUpdated", [updatedOrder, user]);

        res.status(201).send(updatedOrder);
    } catch (error) {
        next(error);
    }
};

exports.deleteReturn = async (req, res, next) => {
    try {
        const order_id = req.params.id;

        const io = req.io;
        const user = req.user;

        const deletedOrder = await ReturnOrder.getById(order_id);

        await ReturnOrder.delete(order_id);

        // emit socket
        io.emit("returnOrderDeleted", [deletedOrder, user]);

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        next(error);
    }
};
