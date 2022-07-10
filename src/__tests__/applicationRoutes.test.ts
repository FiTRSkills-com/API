import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./index.test";
import { bearerToken } from "./authRoutes.test";

// Models
import ApplicationModel from "../Models/Application";

// Create Test Case
const testCase = {
  jobID: "",
};

// Create Baseurl
const baseURL = "/api/v1/application";

describe("Application Routes", () => {
  describe("GET / - Get all applications", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create an application", () => {
    UnauthorizedReq({ applicationUrl: baseURL, method: "post" });

    test("Invalid request format - Job doesn't exist", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job posting does not exist");
    });
  });
});
