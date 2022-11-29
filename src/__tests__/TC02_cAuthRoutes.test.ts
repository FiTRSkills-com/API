import request from "supertest";

// Bring in exports
import { app } from "./TC01_index.test";

// Models
import CandidateModel from "../Models/Candidate";
import mongoose from "mongoose";

// Create Test Case
const testCase = {
  authID: "000000000000000000000000",
  firstName: "Jeff",
};

// Create Baseurl
const baseURL = "/api/v1/c/auth";

// Export BearerToken
export let bearerToken: string;

describe("Auth Routes", () => {
  describe("Login", () => {
    test("Invalid request format", async () => {
      const res = await request(app).post(baseURL.concat("/login"));

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Request not formatted correctly");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .post(baseURL.concat("/login"))
        .send(testCase);

      // Get Candidate Created
      const candidate = await CandidateModel.findOne(testCase);
      bearerToken = `Bearer c ${candidate.accessToken}`;

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
      expect(candidate.authID).toEqual(testCase.authID);
    });
  });

  /**
   * Logout route cannot be automatically without
   * breaking all other tests (they would be considered unauthorized)
   */
});
