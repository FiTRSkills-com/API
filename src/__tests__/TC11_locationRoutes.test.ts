import request from "supertest";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_cAuthRoutes.test";

// Create Baseurl
const baseURL = "/api/v1/location";

describe("GET /location", () => {
  UnauthorizedReq({ applicationUrl: baseURL, method: "post" });

  it("should return 400 if address is missing", async () => {
    const res = await request(app)
      .get(baseURL)
      .set("Authorization", bearerToken);

    expect(res.status).toBe(400);
    expect(res.text).toEqual("Address is required");
  });

  it("should return 400 if an invalid address is provided", async () => {
    const res = await request(app)
      .get(baseURL + "/?address=safawfwarwarwsas")
      .set("Authorization", bearerToken);

    expect(res.status).toBe(400);
    expect(res.text).toEqual("Invalid address");
  });

  it("should return 200 and the latitude and longitude for a valid address", async () => {
    const res = await request(app)
      .get(baseURL + "/?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA")
      .set("Authorization", bearerToken);

    expect(res.status).toBe(200);
    expect(res.type).toEqual("application/json");
    expect(res.body).toEqual({ latitude: 37.422, longitude: -122.08494 });
  });
});
