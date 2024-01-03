const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/user.model");

let server;
let tempUser;

beforeAll(async () => {
  server = app.listen(3000); // Start the server on port 3000 with test db (configured in index.js)

  // Create a user for testing
  await request(app).post("/api/auth/signup").send({
    name: "testuser",
    email: "testuser@example.com",
    password: "testpassword",
  });
});

afterAll(async () => {
  // Clean up test data after tests
  await User.deleteMany({});

  await mongoose.connection.close(); // Close the MongoDB connection
  await server.close(); // Close the server after all tests
});

describe("User Routes", () => {
  describe("POST /signup", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "newuser",
        email: "newuser@example.com",
        password: "newpassword",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User created successfully");
      expect(res.body.data.user).toHaveProperty("_id");
    });

    it("should not register a user with an existing email", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "testuser",
        email: "testuser@example.com",
        password: "newpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("User already exists.");
    });

    it("should not register a user without an email or password", async () => {
      const res = await request(app).post("/api/auth/signup").send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Missing details");
    });
  });

  describe("POST /login", () => {
    it("should login an existing user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "testpassword",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Authentication successful");
      expect(res.body.data).toHaveProperty("token");
    });

    it("should not login with incorrect credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Invalid credentials");
    });

    it("should not login without an email or password", async () => {
      const res = await request(app).post("/api/auth/login").send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Missing email or password");
    });
  });
});
