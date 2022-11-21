import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";

// Create Baseurl
const baseURL = "/api/v1/interview";

describe("Interview Routes", () => {
  describe("GET /:id - Get Interview by ID", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat(`/1`) });

    test("Invalid request - Interview ID doesn't exist", async () => {
      const res = await request(app)
        .get(baseURL.concat("/1"))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(500);
    });

    /**
     * The rest of possible tests cannot be guarenteed
     * due to jest's ordering and can be done manually
     * in postman or insomnia
     */
  });
});
