const User = require("../../models/user.model");
const Note = require("../../models/note.model");

const createNote = async (req, res) => {
  try {
    const note = await Note.create({
      content: req.body.content,
      user: req.user._id,
    });
    return res.status(200).json({
      data: {
        note: note,
      },
      message: "Note created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({})
      .where("user")
      .equals(req.user._id)
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).json({
      message: "Notes retrieved successfully",
      data: { notes: notes },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    return res.status(200).json({
      message: "Notes retrieved successfully",
      data: { note: note },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the note content
    note.content = req.body.content;
    await note.save();

    return res.status(200).json({
      message: "Note updated successfully",
      data: { note: note },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Note.deleteOne({ _id: req.params.id });
    return res.status(200).json({
      message: "Note deleted successfully",
      data: { note: note },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNoteById,
  deleteNoteById,
};
