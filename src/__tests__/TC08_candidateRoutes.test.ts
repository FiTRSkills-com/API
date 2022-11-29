import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";

// Create Test Case
const testCase = {
  bio: "",
};
// Create Baseurl
const baseURL = "/api/v1/candidate";

describe("User Routes", () => {
  describe("GET / - Get Candidate", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("PATCH / - Update Candidate", () => {
    UnauthorizedReq({ applicationUrl: baseURL, method: "patch" });

    test("Invalid request format", async () => {
      const res = await request(app)
        .patch(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("No skills provided");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .patch(baseURL)
        .set("Authorization", bearerToken)
        .send(testCase);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("User updated successfully");
    });
  });
});
