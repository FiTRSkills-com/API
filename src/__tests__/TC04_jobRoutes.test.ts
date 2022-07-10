import request from "supertest";
import crypto from "crypto";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_authRoutes.test";

// Models
import JobModel from "../Models/Job";

// Create Test Cases
const validTestCase = {
  title: "Software Engineer",
  description:
    "Seeking Software Engineers to design, code, and test real-time embedded software for a variety of products in the Rochester, NY area! Active Security Clearance is required for this role.",
  company: "62c65b0c3b3173edccf656b8",
  type: "Full Time",
  location: "Rochester, NY",
  isRemote: false,
  willSponsor: false,
  salary: 210000,
  skills: ["627092699d087d0e7db4f49a", "627092699d087d0e7db4f44d"],
  benefits: ["Paid Vacation"],
};

export let jobID: string;
const randomID = crypto.randomBytes(12).toString("hex");

// Create Baseurl
const baseURL = "/api/v1/job";

describe("Job Routes", () => {
  describe("GET / - Get all jobs", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("GET /forme - Jobs recommended for the user", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat("/forme") });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL.concat("/forme"))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create a Job posting", () => {
    UnauthorizedReq({ applicationUrl: baseURL, method: "post" });

    test("Invalid request format", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken)
        .send(validTestCase);

      // Get Object Created
      const job = await JobModel.findOne(validTestCase);
      jobID = job._id.toString();

      expect(res.statusCode).toBe(201);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job posting created");
    });

    test("Job posting exists", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken)
        .send(validTestCase);

      expect(res.statusCode).toBe(409);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job posting already exists");
    });
  });

  describe("PATCH /:id - Update a Job posting", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${jobID}`),
      method: "patch",
    });

    test("Invalid request format", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${jobID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${jobID}`))
        .set("Authorization", bearerToken)
        .send({
          title: "Senior Software Engineer",
        });

      // Get Object Updated
      const job = await JobModel.findById(jobID);

      expect(job.title).toBe("Senior Software Engineer");
      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job posting updated");
    });
  });

  describe("GET /:id - Get Job by ID", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat(`/${jobID}`) });

    test("Invalid request - Job ID doesn't exist", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${randomID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("No job found with that ID");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${jobID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("DELETE /:id - Delete a Job posting", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${jobID}`),
      method: "delete",
    });

    test("Invalid request - Job ID doesn't exist", async () => {
      const res = await request(app)
        .delete(baseURL.concat(`/randomID`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(500);
    });

    test("Valid request", async () => {
      const res = await request(app)
        .delete(baseURL.concat(`/${jobID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Job deleted");
    });
  });
});
