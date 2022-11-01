import request from "supertest";

// Bring in exports
import { app } from "./TC01_index.test";

// Models
import CandidateModel from "../Models/Candidate";
import mongoose from "mongoose";

// Create Test Case
const testCase = {
  _id: "000000000000000000000000",
  oid: new mongoose.Types.ObjectId("000000000000000000000000"),
};

// Create Baseurl
const baseURL = "/api/v1/auth";

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
      bearerToken = `Bearer ${candidate.accessToken}`;

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
      expect(candidate._id).toEqual(testCase.oid);
    });
  });

  /**
   * Logout route cannot be automatically without
   * breaking all other tests (they would be considered unauthorized)
   */
});
