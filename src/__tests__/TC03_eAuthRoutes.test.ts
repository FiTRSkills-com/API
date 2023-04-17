import request from "supertest";

// Bring in exports
import { app } from "./TC01_index.test";

// Models
import EmployerModel from "../Models/Employer";
import mongoose from "mongoose";

// Create Test Case
const testCase = {
  authID: "000000000000000000000000",
};

// Create Baseurl
const baseURL = "/api/v1/e/auth";

// Export BearerToken
export let bearerToken: string;

export let employerId: string;

describe("eAuth Routes", () => {
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
      const employer = await EmployerModel.findOne(testCase);
      bearerToken = `Bearer e ${employer.accessToken}`;
      employerId = employer._id;

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
      expect(employer.authID).toEqual(testCase.authID);
    });
  });

  /**
   * Logout route cannot be automatically without
   * breaking all other tests (they would be considered unauthorized)
   */
});
