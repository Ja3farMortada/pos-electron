const Category = require("../models/CategoryModel");

// get categories
exports.getCategories = async (req, res, next) => {
    try {
        let categories = await Category.getAll();
        res.status(200).send(categories);
    } catch (error) {
        next(error);
    }
};

// create category
exports.createCategory = async (req, res, next) => {
    try {
        let category = req.body;
        const io = req.io;
        const user = req.user;
        let result = await Category.create(category);
        let createdCategory = await Category.getById(result.insertId);

        // socket emit
        io.emit("categoryCreated", [createdCategory, user]);

        res.status(201).send(createdCategory);
    } catch (error) {
        next(error);
    }
};

exports.sortCategories = async (req, res, next) => {
    let categories = req.body;
    const io = req.io;
    const user = req.user;
    try {
        await Category.sort(categories);
        let updatedCategories = await Category.getAll();

        // socket emit
        io.emit("categorySorted", user);

        res.status(201).send(updatedCategories);
    } catch (error) {
        next(error);
    }
};

// update category
exports.updateCategory = async (req, res, next) => {
    const io = req.io;
    const user = req.user;
    const category = req.body;
    try {
        await Category.update(category);
        const updatedCategory = await Category.getById(category.category_id);

        io.emit("categoryUpdated", [updatedCategory, user]);

        res.status(201).send(updatedCategory);
    } catch (error) {
        next(error);
    }
};

// delete category
exports.deleteCategory = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        const category_id = req.params.id;
        const deletedCategory = await Category.getById(category_id);

        await Category.delete(category_id);

        io.emit("categoryDeleted", [deletedCategory, user]);

        res.status(202).json({
            message: "Category has been deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};
