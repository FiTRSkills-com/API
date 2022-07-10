import request from "supertest";

// Bring in exports
import { app } from "./index.test";

// Models
import UserModel from "../Models/User";

// Create Test Case
const testCase = {
  id: "1",
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

      // Get User Created
      const user = await UserModel.findOne(testCase);
      bearerToken = `Bearer ${user.accessToken}`;

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
      expect(user.userID).toBe("1");
    });
  });

  // describe("Logout", () => {
  //   test("Invalid request format", async () => {
  //     const res = await request(app).delete(baseURL.concat("/logout"));

  //     expect(res.statusCode).toBe(400);
  //     expect(res.type).toEqual("text/html");
  //     expect(res.text).toBe("Request not formatted correctly");
  //   })

  //   test("Valid request", async () => {
  //     const res = await request(app).delete(baseURL.concat("/logout")).send(testCase);

  //     // Get User Created
  //     const user = await UserModel.findOne(testCase);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("text/html");
  //     expect(res.text).toBe("Logged out");
  //     expect(user.accessToken).toBe('');
  //   })
  // })
});
