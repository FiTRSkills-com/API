import request from "supertest";
import crypto from "crypto";

// Bring in exports
import { app, UnauthorizedReq } from "./TC01_index.test";
import { bearerToken } from "./TC02_authRoutes.test";

// Models
import CompanyModel from "../Models/Company";

// Create Test Cases
const validTestCase = {
  name: "Actalent",
  headquarters: {
    city: "Hanover",
    state: "MD",
  },
  website: "www.actalentservices.com",
  logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAC0AOAMBEQACEQEDEQH/xAAaAAACAwEBAAAAAAAAAAAAAAADBQAEBgIH/8QAMRAAAgEDAwIDBgUFAAAAAAAAAQIDBAURABIhBhMxQYEUIjJRYZEVQlJxsQcWI3KS/8QAGQEBAQADAQAAAAAAAAAAAAAAAAECAwUE/8QAKxEAAgEDAgQFBAMAAAAAAAAAAAERAgMhEjEEQXGhEyJhgdEyscHSUZGS/9oADAMBAAIRAxEAPwD3HQE0AGrlaKAlMdxvdQH9R8Nab9boo8u7wurAlDSGUQCpkC57YbH5AfdbP+3GuMqq9XhqtxtPotn/AKx6lHdNL3oFcjDeDL8mHBH312rNzxKFU9+fXmQLraCaAmgJoBXcKlfaCgkCtGNqDxO9vPH0X+dczir68TSnlYXV849F9ylbdDt7mJRCw7XEbYEXgCDjHjz668+q21qzpfl2f08nMRvmfUFu3VKtOULqWlGWA8nXg8fUYI/Y69PCX064nL36rD/tZXuBlrpEJoCaAHUTLTwSTP8ACiknWu7dptW3XVsgIlimmfAYlnYrvGUwx5Y/MgDjnXDVu5ccJ5eJysvLf8uFhSyjE24mPYTDtxjGxvD5fFrovg26dOI6P9hIuKzQPuY++jY3t7+XUZH1G5fTXNdNy25bynvvld1qp6pAfQyrNEksZyrgEa71u5TcoVdOzId6zBNAAqYnlMYXbtU7iD5keA/bPPprTet1VxGyz8d8+wB0tK0ThnYMVTAPzJOWPqcfbWuzw7oqmpzC7vLfuwW9eoFSqpWkkZ4mCllHj5MDlT/OdeS9w9VdTqpcSu6yn8gJTRNDvU7dhbcoH5c+I++fvrbZtu3K5cvz3AfW4GK6x61ew36ho4KfvUkIE93mAz7NA7dtD/0dx88L9eMksSSRpeeraS23OO109DcLnXtF3mgoIlcxx5wGYsygAnw5zqQUoUvWNXP1pLZPwWtFMtPFIJO2oZC5PvPl+E8uBnIPGrGJJIT+9oZKoW+e2XW2VdRBK9G1dAqrMUXcQMMeQOcEDUgC6xddiLp2z+209wut0mty1lStFArMifrYZUDJBwBzx4aQBg/X9ueojgtlBdLo8lGlansUCtuiYkZ95hggjkHB58+cIEi+L+ovt16tMNptVbWW6uo3nEkcS9wkMF4y4GFOQ31xjOrpElKy9E03UsFyu90ul0Wa6zyCeOlqTFG0akqkbKPiCrxz8zq6msESM8lTdOjqKivtNWQ1c8gW1VMc8B2yiNiI5MhsghSARznGr9TEwaG9T19s62stZFURF+oKOOhqMREdorlu4h3cfEcA5x8zqJJphsynSdtE16pQRTpNaKiqppqhIm7lazQP/kcljyPXWTwgtzu8WqLp2y9PXnt01f3qKG3yU9TE23g8SAqwIPOMc6lOcBs2/SdqSh6tSWIQxp+BQx9mCIoinuFiVBYkDJPGT++sW8FMfSRVXSHT/SV3op4ppYWnoGSWE7XWWUtu4bIIx6/TWT8zZJhH/9k=",
};

let companyID: string;
const randomID = crypto.randomBytes(12).toString("hex");

// Create Baseurl
const baseURL = "/api/v1/company";

describe("Company Routes", () => {
  describe("GET / - Get all companies", () => {
    UnauthorizedReq({ applicationUrl: baseURL });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL)
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("POST / - Create a Company", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat("/add"), method: "post" });

    test("Invalid request format", async () => {
      const res = await request(app)
        .post(baseURL.concat("/add"))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .post(baseURL.concat("/add"))
        .set("Authorization", bearerToken)
        .send(validTestCase);

      // Get Object Created
      const company = await CompanyModel.findOne(validTestCase);
      companyID = company._id.toString();

      expect(res.statusCode).toBe(201);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Company created");
    });

    test("Company exists", async () => {
      const res = await request(app)
        .post(baseURL.concat("/add"))
        .set("Authorization", bearerToken)
        .send(validTestCase);

      expect(res.statusCode).toBe(409);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Company already exists");
    });
  });

  describe("PATCH /:id - Update a Job posting", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${companyID}`),
      method: "patch",
    });

    test("Invalid request format", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${companyID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(400);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Missing required fields");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .patch(baseURL.concat(`/${companyID}`))
        .set("Authorization", bearerToken)
        .send({
          name: "Actalent Test",
        });

      // Get Object Updated
      const company = await CompanyModel.findById(companyID);

      expect(company.name).toBe("Actalent Test");
      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Company updated");
    });
  });

  describe("GET /:id - Get Company by ID", () => {
    UnauthorizedReq({ applicationUrl: baseURL.concat(`/${companyID}`) });

    test("Invalid request - Company ID doesn't exist", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${randomID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("No company exists with that ID");
    });

    test("Valid request", async () => {
      const res = await request(app)
        .get(baseURL.concat(`/${companyID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("application/json");
    });
  });

  describe("DELETE /:id - Delete a Job posting", () => {
    UnauthorizedReq({
      applicationUrl: baseURL.concat(`/${companyID}`),
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
        .delete(baseURL.concat(`/${companyID}`))
        .set("Authorization", bearerToken);

      expect(res.statusCode).toBe(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toBe("Company deleted");
    });
  });
});
