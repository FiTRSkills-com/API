import request from "supertest";
import makeServer from "../utils/server";
import { TestDatabase } from "../utils/database";

export const app = makeServer();

beforeAll(async () => await TestDatabase.connect());
afterAll(async () => await TestDatabase.closeDatabase());

export const UnauthorizedReq = ({
  applicationUrl,
  method = "get",
}: {
  applicationUrl: string;
  method?: string;
}) => {
  switch (method) {
    case "post":
      test("Unauthorized - Should respond with 401", async () => {
        const res = await request(app).get(applicationUrl);
        expect(res.statusCode).toBe(401);
      });
      break;

    case "patch":
      test("Unauthorized - Should respond with 401", async () => {
        const res = await request(app).patch(applicationUrl);
        expect(res.statusCode).toBe(401);
      });
      break;

    case "delete":
      test("Unauthorized - Should respond with 401", async () => {
        const res = await request(app).delete(applicationUrl);
        expect(res.statusCode).toBe(401);
      });
      break;

    default:
      test("Unauthorized - Should respond with 401", async () => {
        const res = await request(app).get(applicationUrl);
        expect(res.statusCode).toBe(401);
      });
      break;
  }
};

describe("Index Routes", () => {
  describe("GET /", () => {
    test("Should respond with Hello World!", async () => {
      const res = await request(app).get("/");

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Hello World!");
    });
  });

  describe("GET /api/v1", () => {
    test("Should respond with JSON", async () => {
      const res = await request(app).get("/api/v1");

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });
});
