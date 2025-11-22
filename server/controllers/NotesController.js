const Note = require("../models/NotesModel");
const Database = require("../models/DatabaseModel");

// get all notes
exports.getAllNotes = async (req, res, next) => {
    try {
        let notes = await Note.getAll();
        res.status(200).send(notes);
    } catch (error) {
        if (error.errno == 1146) {
            await Database.update();
            return;
        }
        next(error);
    }
};

// reorder notes
exports.sortNotes = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        let notes = req.body;
        await Note.sort(notes);
        let updatedNotes = await Note.getAll();

        // emit socket
        io.emit("notesSorted", user);

        res.status(201).send(updatedNotes);
    } catch (error) {
        next(error);
    }
};

// create note
exports.createNote = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        let data = req.body;
        let result = await Note.create(data);
        let createdNote = await Note.getById(result.insertId);

        // emit socket
        io.emit("noteCreated", user);

        res.status(201).send(createdNote);
    } catch (error) {
        next(error);
    }
};

// update note
exports.updateNote = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        let data = req.body;
        await Note.update(data);
        let updatedNote = await Note.getById(data.id);

        // emit socket
        io.emit("noteUpdated", user);

        res.status(201).send(updatedNote);
    } catch (error) {
        next(error);
    }
};

// delete note
exports.deleteNote = async (req, res, next) => {
    try {
        const io = req.io;
        const user = req.user;
        let id = req.params.id;
        await Note.delete(id);

        // emit socket
        io.emit("noteDeleted", user);

        res.status(202).json({
            message: "Note has been deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};
