import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";
import Skill from "../Types/Skills";

import SkillModel from "../Models/Skill";

// Create Test Case
const validTestCase = {
  skill: "Express Testing",
  category: "Testing",
  similarSkills: [],
};
// Create Baseurl
const baseURL = "/api/v1/skills";

afterAll(async () => {
  await SkillModel.deleteMany({}); // This will remove all skills from the test database
});

describe("Skills Routes", () => {
  describe("GET / - Get all skills", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create a skill", () => {
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

      expect(res.statusCode).toBe(201);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Skill created");
    });

    test("Invalid request - Skill already exists", async () => {
      const res = await request(app)
        .post(baseURL)
        .set("Authorization", bearerToken)
        .send(validTestCase);

      expect(res.statusCode).toBe(409);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Skill already exists");
    });
  });

  describe("GET /:name - Get a Skill by name", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${validTestCase.skill}`),
    });

    test("Invalid request - Skill doesn't exist", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/nonexistent`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("No skill found matching that name");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${validTestCase.skill}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  // describe("GET /in-demand-skills - Get in-demand skills in a location and radius", () => {
  //   UnauthorizedReq({
  //     applicationUrl: baseURL.concat("/in-demand-skills"),
  //   });

  //   test("Valid request", async () => {
  //     const location = {
  //       lat: 0,
  //       lng: 0,
  //     };
  //     const radius = 1000;
  //     const page = 0;

  //     const res = await request(app)
  //       .get(
  //         `${baseURL}/in-demand-skills?lat=${location.lat}&lng=${location.lng}&radius=${radius}&page=${page}`
  //       )
  //       .set("Authorization", bearerToken);
  //       console.log(res.text)

  //     expect(res.statusCode).toBe(200);
  //     expect(res.type).toEqual("application/json");
  //     expect(Array.isArray(res.body)).toBeTruthy();
  //     expect(res.body.length).toBeGreaterThan(0);

  //     // Check if skill objects have the correct properties
  //     res.body.forEach((skill: Skill) => {
  //       expect(skill).toHaveProperty("_id");
  //       expect(skill).toHaveProperty("skill");
  //       expect(skill).toHaveProperty("category");
  //       expect(skill).toHaveProperty("priority");
  //       expect(skill).toHaveProperty("count");
  //       expect(skill).toHaveProperty("similarSkills");
  //       expect(skill).toHaveProperty("dateAdded");
  //     });
  //   });
  // });
});
