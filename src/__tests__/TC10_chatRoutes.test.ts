import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";

// Models
import ChatModel from "../Models/Chat";

// Create Baseurl
const baseURL = "/api/v1/chat";

describe("Chat Routes", () => {
  describe("POST / - Create a new Chat", () => {
    UnauthorizedReq({ applicationUrl: baseURL, method: "post" });

    test("Invalid request format", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const payload = {
        match: "614f9e9aa06d672d01b0b0fb",
      };

      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken)
        .send(payload);

      // Get Object Created
      const chat = await ChatModel.findOne(payload);

      expect(res.statusCode).toBe(201);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("New chat created");
      expect(chat).toBeDefined();
    });

    test("Chat already exists", async () => {
      const payload = {
        match: "614f9e9aa06d672d01b0b0fb",
      };

      const res = await request(app)
        .post("/api/v1/chat")
        .set("Authorization", bearerToken)
        .send(payload);

      expect(res.statusCode).toBe(409);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Chat already exists");
    });
  });
});
