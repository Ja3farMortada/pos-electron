const express = require("express");
const router = express.Router();

const NotesController = require("../controllers/NotesController");

router.get("/", NotesController.getAllNotes);
router.post("/", NotesController.createNote);
router.put("/", NotesController.updateNote);
router.delete("/:id", NotesController.deleteNote);
router.patch("/sort", NotesController.sortNotes);

module.exports = router;
