const Product = require("../models/ProductModel");

// ###################################### items controllers ######################################

// get all
exports.getAllProducts = async (req, res, next) => {
    try {
        let {inventory_id} = req.params
        let products = await Product.getAll(inventory_id);
        res.status(200).send(products);
    } catch (error) {
        next(error);
    }
};

// create
exports.createProduct = async (req, res, next) => {
    const io = req.io;
    const user = req.user;
    const data = req.body;
    delete data.product_id;

    try {
        const result = await Product.create(data, user);
        const [createdProduct] = await Product.getById(result.insertId);

        // socket emit
        io.emit("productCreated", [createdProduct, user]);

        res.status(201).send(createdProduct);
    } catch (error) {
        next(error);
    }
};

// update
exports.updateProduct = async (req, res, next) => {
    const io = req.io;
    const user = req.user;
    const product = req.body;

    try {
        await Product.update(product, user);
        const [updatedProduct] = await Product.getById(product.product_id);

        // socket to push update
        io.emit("productUpdated", [updatedProduct, user]);

        res.status(201).send(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// delete
exports.deleteProduct = async (req, res, next) => {
    const io = req.io;
    const user = req.user;
    const product_id = req.params.id;
    try {
        // fetch product details before delete
        const [deletedProduct] = await Product.getById(product_id);

        await Product.delete(product_id);

        // emit socket for product delete
        io.emit("productDeleted", [deletedProduct, user]);

        res.status(202).json({
            message: "Item has been deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};

// correct stocki
exports.addStockCorrection = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const data = req.body;

        await Product.updateStock(data);

        // fetch updated product
        const [updatedProduct] = await Product.getById(data.product_id_fk, data.inventory_id);

        io.emit("productUpdated", [updatedProduct, user]);

        res.status(201).send(updatedProduct);
    } catch (error) {
        next(error);
    }
};

exports.getHistoryById = async (req, res, next) => {
    try {
        const { id, inventory_id } = req.params;
        const history = await Product.getHistoryById(id, inventory_id);
        res.status(200).send(history);
    } catch (error) {
        next(error);
    }
};

// generate barcode
exports.generateBarcode = async (req, res, next) => {
    try {
        const barcode = await Product.generateBarcode();
        res.status(201).send(barcode);
    } catch (error) {
        next(error);
    }
};
