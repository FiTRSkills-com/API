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
  beforeAll(async () => {
    const newMatch = new MatchModel({
      _id: "63cdd3966e3dd99990455cb1",
      job: "63ec11f56780dca535b65a42",
      candidate: "637c258d12fda28d1e2aef58",
      matchStatus: "63cdd3966e3dd99990455cab",
      candidateStatus: "63cdd3966e3dd99990455cad",
      employerStatus: "63cdd3966e3dd99990455caf",
      __v: 0,
    });
    await newMatch.save();
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

  // describe("GET /matched/:employerId - Get matched candidates for a specific employer", () => {
  //   UnauthorizedReq({ applicationUrl: baseURL + "/matched/:employerId" });

  //   test("Valid request", async () => {
  //     const employerId = "63c6fa6c5d98d0fa72bb1dd2";

  //     const res = await request(app)
  //       .get(baseURL + "/matched/" + employerId)
  //       .set("Authorization", bearerToken);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //   });
  // });

  // describe("GET /waiting/:employerId - Get candidates waiting for response for a specific employer", () => {
  //   UnauthorizedReq({ applicationUrl: baseURL + "/waiting/:employerId" });

  //   test("Valid request", async () => {
  //     const employerId = "63c6fa6c5d98d0fa72bb1dd2";

  //     const res = await request(app)
  //       .get(baseURL + "/waiting/" + employerId)
  //       .set("Authorization", bearerToken);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //   });
  // });

  // describe("PUT /accept/:id - Accept a candidate", () => {
  //   UnauthorizedReq({ applicationUrl: baseURL + "/accept/:id", method: "put" });

  //   test("Valid request", async () => {
  //     const match = await MatchModel.findOne();
  //     const res = await request(app)
  //       .put(baseURL + "/accept/" + match._id)
  //       .set("Authorization", bearerToken);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //   });
  // });

  // describe("PUT /reject/:id - Reject a candidate as an employer", () => {
  //   UnauthorizedReq({ applicationUrl: baseURL + "/reject/:id", method: "put" });

  //   test("Valid request", async () => {
  //     const match = await MatchModel.findOne();
  //     const res = await request(app)
  //       .put(baseURL + "/reject/" + match._id)
  //       .set("Authorization", bearerToken);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //   });
  // });

  // describe("PUT /retract/:id - Retract a candidate after match", () => {
  //   UnauthorizedReq({ applicationUrl: baseURL + "/retract/:id", method: "put" });

  //   test("Valid request", async () => {
  //     const match = await MatchModel.findOne();
  //     const res = await request(app)
  //       .put(baseURL + "/retract/" + match._id)
  //       .set("Authorization", bearerToken);

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //   });
  // });
});
