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
    const userNotes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .exec();
    const sharedNotes = await Note.find({ shared: req.user._id })
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).json({
      message: "Notes retrieved successfully",
      data: { userNotes: userNotes, sharedNotes: sharedNotes },
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
    // Check if the note is owned by or shared with current user
    if (note.shared.includes(req.user._id) || note.user == req.user.id) {
      return res.status(200).json({
        message: "Note retrieved successfully",
        data: { note: note },
      });
    }
    return res.status(403).json({ message: "Unauthorized" });
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

const shareNoteById = async (req, res) => {
  try {
    const noteId = req.params.id;
    console.log(noteId);
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    // Users to share the notes with
    const { sharedUserEmail } = req.body;

    // Check if the email address is provided
    if (!sharedUserEmail) {
      return res
        .status(400)
        .json({ message: "Missing sharedUserEmail in the request body" });
    }

    // Find the user
    const sharedUser = await User.findOne({ email: sharedUserEmail });

    if (!sharedUser) {
      return res
        .status(404)
        .json({ message: "User with the provided email not found" });
    }

    // Check if the note is already shared with the user
    if (note.shared.includes(sharedUser._id)) {
      return res
        .status(400)
        .json({ message: "Note is already shared with this user" });
    }

    // Add the user's ID to the shared array
    note.shared.push(sharedUser._id);

    // Save the updated note
    await note.save();

    return res.status(200).json({
      message: "Note shared successfully",
      data: { note: note },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const searchNotes = async (req, res) => {
  try {
    const searchText = req.query.q;
    if (!searchText) {
      return res
        .status(400)
        .json({ message: "Missing search query parameter" });
    }

    const searchResult = await Note.find()
      .or([{ user: req.user._id }, { shared: req.user._id }])
      .and([{ $text: { $search: searchText } }])
      .sort({ score: { $meta: "textScore" } })
      .exec();

    return res.status(200).json({
      message: "Search results retrieved successfully",
      data: { searchResult: searchResult },
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
  shareNoteById,
  searchNotes,
};
