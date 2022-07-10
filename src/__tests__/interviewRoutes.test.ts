import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./index.test";
import { bearerToken } from "./authRoutes.test";

// Models
import InterviewModel from "../Models/Interview";

// Create Test Case
const testCase = {
  Skill: "Express Testing",
};
// Create Baseurl
const baseURL = "/api/v1/interview";

describe("Interview Routes", () => {
  describe("GET /:name - Get a Skill by name", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat(`/${testCase.Skill}`) });

    test("Return true", async () => {
      expect(true);
    });
  });
});
