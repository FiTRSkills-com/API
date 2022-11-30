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

// Create Baseurl
const baseURL = "/api/v1/match";

describe("match Routes", () => {
  describe("GET / - Get all matches", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create an match", () => {
    UnauthorizedReq({
      applicationUrl: baseURL + "/createMatch",
      method: "patch",
    });

    test("Invalid request format - Job doesn't exist", async () => {
      const res = await request(app)
        .post(baseURL.concat("/createMatch"))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job posting does not exist");
    });

    /**
     * Valid Request and match Exists tests
     * cannot be tested as they rely on the job to exist
     * which cannot be guarenteed do to the jest ordering
     */
  });
});
