import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";
import { jobID } from "./TC05_jobRoutes.test";

// Models
import MatchModel from "../Models/Match";

// Create Test Case
const testCase = {
  jobID: "",
};

let applicationID: string;

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

    /**
     * Valid Request and Application Exists tests
     * cannot be tested as they rely on the job to exist
     * which cannot be guarenteed do to the jest ordering
     */
  });
});
