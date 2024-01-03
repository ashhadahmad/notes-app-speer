const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/user.model");
const Note = require("../models/note.model");

let server;
let authToken;
let noteId;

beforeAll(async () => {
  server = app.listen(3001); // Start the server on port 3000 with test db (configured in index.js)

  // Create two user for testing
  await request(app).post("/api/auth/signup").send({
    name: "testuser",
    email: "testuser@example.com",
    password: "testpassword",
  });
  const auth = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "testpassword",
  });
  authToken = auth.body.data.token;

  // Create a sample note
  const note = await request(app)
    .post("/api/notes")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      content: "New test note content",
    });
  noteId = note.body.data.note._id;
});

afterAll(async () => {
  // Clean up test data after tests
  await User.deleteMany({});
  await Note.deleteMany({});

  await mongoose.connection.close(); // Close the MongoDB connection
  await server.close(); // Close the server after all tests
});

describe("Notes Controller", () => {
  describe("createNote", () => {
    it("should create a new note", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "New test note content",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note created successfully");
      expect(res.body.data.note).toHaveProperty("_id");
    });

    it("should not create a note without content", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.message).toContain("Missing: Notes content");
    });
  });

  describe("getNotes", () => {
    it("should get user notes", async () => {
      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Notes retrieved successfully");
      expect(res.body.data).toHaveProperty("userNotes");
      expect(res.body.data).toHaveProperty("sharedNotes");
    });
  });

  describe("getNoteById", () => {
    it("should get a specific note by ID", async () => {
      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note retrieved successfully");
      expect(res.body.data).toHaveProperty("note");
      expect(res.body.data.note._id).toBe(noteId.toString());
    });

    it("should return 404 for a non-existing note", async () => {
      const nonExistingNoteId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/notes/${nonExistingNoteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Note not found");
    });

    it("should return 403 for an unauthorized user trying to access a note", async () => {
      const anotherUserNote = await Note.create({
        content: "Another user note content",
        user: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .get(`/api/notes/${anotherUserNote._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("updateNoteById", () => {
    it("should update a note by ID", async () => {
      const updatedContent = "Updated test note content";

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: updatedContent,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note updated successfully");
      expect(res.body.data.note.content).toBe(updatedContent);
    });

    it("should return 404 for updating a non-existing note", async () => {
      const nonExistingNoteId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/notes/${nonExistingNoteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Updated content for non-existing note",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Note not found");
    });

    it("should return 403 for an unauthorized user trying to update a note", async () => {
      const anotherUserNote = await Note.create({
        content: "Another user note content",
        user: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .put(`/api/notes/${anotherUserNote._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Updated content for unauthorized user",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("shareNoteById", () => {
    it("should share a note with another user", async () => {
      // Create a second user for sharing
      const secondUser = await User.create({
        name: "seconduser",
        email: "seconduser@example.com",
        password: "secondpassword",
      });

      const res = await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "seconduser@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note shared successfully");
      expect(res.body.data.note.shared).toContain(secondUser.id);
    });

    it("should return 404 for sharing a non-existing note", async () => {
      const nonExistingNoteId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/notes/${nonExistingNoteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "seconduser@example.com",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Note not found");
    });

    it("should return 403 for an unauthorized user trying to share a note", async () => {
      const anotherUserNote = await Note.create({
        content: "Another user note content",
        user: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .post(`/api/notes/${anotherUserNote._id}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "seconduser@example.com",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should return 404 for sharing with a non-existing user", async () => {
      const res = await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "nonexistinguser@example.com",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User with the provided email not found");
    });

    it("should return 400 for sharing a note already shared with the user", async () => {
      // Share the test note with another user
      await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "seconduser@example.com",
        });

      // Attempt to share it again
      const res = await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sharedUserEmail: "seconduser@example.com",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Note is already shared with this user");
    });

    it("should return 400 for sharing without providing an email address", async () => {
      const res = await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Missing sharedUserEmail in the request body"
      );
    });
  });

  describe("searchNotes", () => {
    it("should search for notes based on the provided query", async () => {
      // Create a note for searching
      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Searchable test note content",
        });

      const res = await request(app)
        .get("/api/search?q=Searchable")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Search results retrieved successfully");
      expect(res.body.data).toHaveProperty("searchResult");
      expect(res.body.data.searchResult.length).toBeGreaterThan(0);
    });

    it("should return 400 for missing search query parameter", async () => {
      const res = await request(app)
        .get("/api/search")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Missing search query parameter");
    });
  });

  describe("deleteNoteById", () => {
    it("should delete a note by ID", async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Note deleted successfully");
      expect(res.body.data.note._id).toBe(noteId.toString());
    });

    it("should return 404 for deleting a non-existing note", async () => {
      const nonExistingNoteId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/notes/${nonExistingNoteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Note not found");
    });

    it("should return 403 for an unauthorized user trying to delete a note", async () => {
      const anotherUserNote = await Note.create({
        content: "Another user note content",
        user: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .delete(`/api/notes/${anotherUserNote._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Unauthorized");
    });
  });
});
