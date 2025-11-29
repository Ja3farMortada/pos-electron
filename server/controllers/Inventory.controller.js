const Inventory = require('../models/InventoryModel');

exports.getAll = async (req, res, next) => {
    try {
        let results = await Inventory.getAll();
        res.status(200).send(results)
    } catch (error) {
        next(error)
    }
}

// create
exports.create = async (req, res, next) => {
    try {
        const {inventory_name} = req.body;
        const io = req.io;
        const user = req.user;
        
        const result = await Inventory.create(inventory_name);

        const createdData = await Inventory.getById(result.insertId)

        io.emit('inventoryCreated', [createdData, user]);

        res.status(201).send(createdData)
    } catch (error) {
        next(error)
    }
}

// update
exports.update = async (req, res, next) => {
    try {
        const data = req.body;

        const io = req.io;
        const user = req.user;
        let result = await Inventory.update(data);
        
        const updatedData = await Inventory.getById(data.inventory_id)
        
        io.emit('inventoryUpdated', [updatedData, user]);

        res.status(202).send(updatedData)

    } catch (error) {
        next(error)
    }
}


exports.delete = async (req, res, next) => {
    try {
        const { inventory_id } = req.params;
        //
        // to be continued ...
        //
    } catch (error) {
        next(error)
    }
}