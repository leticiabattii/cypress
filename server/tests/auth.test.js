const request = require("supertest");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../index"); 
const User = require("../models/model").User;

// Mock das funções do Mongoose
jest.mock("../models/model");

describe("Auth Routes", () => {
  describe("POST /signup", () => {
    it("should create a user and return 200", async () => {

      User.prototype.save = jest.fn().mockResolvedValue(true);

      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app).post("/signup").send(userData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User Created");


      expect(User.prototype.save).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if fields are missing", async () => {
      const response = await request(app).post("/signup").send({
        name: "John Doe",
        email: "",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 409 if email already exists", async () => {
      // Mockar o comportamento de User.findOne para simular que o email já existe
      User.findOne = jest.fn().mockResolvedValue({
        email: "john@example.com",
      });

      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app).post("/signup").send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Email already exists");
    });
  });

  describe("POST /signin", () => {
    it("should login a user and return token", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // Mockando o comportamento de User.findOne para retornar um usuário válido
      User.findOne = jest.fn().mockResolvedValue({
        _id: "123",
        email: userData.email,
        name: userData.name,
        password: bcryptjs.hashSync(userData.password, 10),
      });

      const response = await request(app).post("/signin").send({
        email: userData.email,
        password: userData.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name", userData.name);
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.headers["set-cookie"]).toBeDefined(); // Verifica se o token foi enviado no cookie
    });

    it("should return 400 if fields are missing", async () => {
      const response = await request(app).post("/signin").send({
        email: "",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 404 if user not found", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app).post("/signin").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not Found.");
    });

    it("should return 401 if invalid password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      User.findOne = jest.fn().mockResolvedValue({
        _id: "123",
        email: userData.email,
        name: userData.name,
        password: bcryptjs.hashSync("wrongpassword", 10),
      });

      const response = await request(app).post("/signin").send({
        email: userData.email,
        password: userData.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid Email or Password!");
    });
  });

  describe("POST /logout", () => {
    it("should logout the user and clear the cookie", async () => {
      const response = await request(app).post("/logout");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User logged out successfully");
      expect(response.headers["set-cookie"]).toBeDefined(); // Verifica se o cookie foi limpo
    });
  });

  describe("POST /google", () => {
    it("should sign in a user with Google OAuth", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
      };

      // Mockando o comportamento de User.findOne para simular um login via Google
      User.findOne = jest.fn().mockResolvedValue({
        _id: "123",
        email: userData.email,
        name: userData.name,
        password: bcryptjs.hashSync("password123", 10),
      });

      const response = await request(app).post("/google").send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name", userData.name);
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.headers["set-cookie"]).toBeDefined(); // Verifica se o token foi enviado no cookie
    });

    it("should create a new user if email does not exist", async () => {
      const userData = {
        name: "John Doe",
        email: "newuser@example.com",
      };

      // Mockando o comportamento de User.findOne para simular que o email não existe
      User.findOne = jest.fn().mockResolvedValue(null);

      // Mockar o comportamento de User.save()
      User.prototype.save = jest.fn().mockResolvedValue(true);

      const response = await request(app).post("/google").send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name", userData.name);
      expect(response.body).toHaveProperty("email", userData.email);
      expect(User.prototype.save).toHaveBeenCalledTimes(1); // Verifica se o método save foi chamado
    });
  });
});
