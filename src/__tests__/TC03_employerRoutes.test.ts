import request from "supertest";
import crypto from "crypto";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_authRoutes.test";

import mongoose, { Decimal128 } from "mongoose";

// Models
import EmployerModel from "../Models/Employer";
import { profile } from "console";

// Create Test Cases
const validTestCase = {
  company: {
    name: "Test",
    headquarters: {
      city: "nowhere",
      address: "000 nowhere ave",
      zipCode: "00000",
      state: "Alaska",
      geoCoordinates: {
        longitude: new mongoose.Types.Decimal128("0"),
        latitude: new mongoose.Types.Decimal128("0"),
      },
    },
    website: "www.com",
    logo: "blank.png",
  },
  profile: {
    firstName: "John",
    lastName: "Wick",
    email: "something@mail.com",
    phoneNumber: "000",
  },
};

const updateCompany = {
  name: "Volcano",
  headquarters: {
    city: "nowhere",
    address: "000 nowhere ave",
    zipCode: "00000",
    state: "Alaska",
    geoCoordinates: {
      longitude: new mongoose.Types.Decimal128("0"),
      latitude: new mongoose.Types.Decimal128("0"),
    },
  },
  website: "www.com",
  logo: "blank.png",
};

let employerID: string;
const randomID = crypto.randomBytes(12).toString("hex");

// Create Baseurl
const baseURL = "/api/v1/employer";

describe("Employer Routes", () => {
  describe("GET / - Get all employers", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create an Employer", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat("/"), method: "post" });

    test("Invalid request format", async () => {
      const res = await request(app)
        .post(baseURL.concat("/"))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .post(baseURL.concat("/"))
        .set("Authorization", bearerToken)
        .send(validTestCase);

      // Get Object Created
      const employer = await EmployerModel.findOne(validTestCase);
      employerID = employer._id;

      expect(res.statusCode).toBe(201);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Employer created");
    });

    test("Employer exists", async () => {
      const res = await request(app)
        .post(baseURL.concat("/"))
        .set("Authorization", bearerToken)
        .send(validTestCase);

      expect(res.statusCode).toBe(409);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Employer already exists");
    });
  });

  describe("PATCH /:id - Update an employer", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${employerID}`),
      method: "patch",
    });

    test("Invalid request format", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${employerID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${employerID}`))
        .set("Authorization", bearerToken)
        .send({
          company: updateCompany,
        });

      // Get Object Updated
      const employer = await EmployerModel.findById(employerID);

      expect(employer.company.name).toBe("Volcano");
      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Employer updated");
    });
  });

  describe("GET /:id - Get Employer by ID", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat(`/${employerID}`) });

    test("Invalid request - Employer ID doesn't exist", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${randomID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("No employer exists with that ID");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${employerID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("DELETE /:id - Delete an Employer", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${employerID}`),
      method: "delete",
    });

    test("Invalid request - Employer ID doesn't exist", async () => {
      const res = await request(app)
        .delete(baseURL.concat(`/randomID`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(500);
    });

    test("Valid request", async () => {
      const res = await request(app)
        .delete(baseURL.concat(`/${employerID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Employer deleted");
    });
  });
});
