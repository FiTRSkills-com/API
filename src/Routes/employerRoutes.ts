import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import EmployerModel from "../Models/Company";

// Instantiate the router
const employerRoutes = Router();

// Use Middleware
employerRoutes.use(verifyToken);

/**
 * Route for getting all companies.
 * @name GET /
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
employerRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  console.log("TEST");
  try {
    const companies = await EmployerModel.find({}, { __v: 0 })
      .populate({ path: "jobs", select: "title type location" })
      .exec();
    console.log(companies);

    if (!companies) return res.status(200).send("No employers exist");

    return res.status(200).send(companies);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for getting a company by id.
 * @name GET /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
employerRoutes.get(
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      const company = await EmployerModel.findOne({ _id: id }, { __v: 0 })
        .populate({ path: "jobs", select: "title type location" })
        .exec();

      if (!company)
        return res.status(200).send("No employer exists with that ID");

      return res.status(200).send(company);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for updating a company by id.
 * @name PATCH /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
employerRoutes.patch("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  const { company, profile } = req.body;

  if (!company && !profile) {
    return res.status(400).send("Missing required fields");
  }

  return EmployerModel.findOneAndUpdate(
    { _id: id },
    { $set: { company, profile } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Employer updated");
    }
  );
});

/**
 * Route for deleting a company by id.
 * @name DELETE /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
employerRoutes.delete("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  return EmployerModel.findOneAndDelete(
    { _id: id },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Company deleted");
    }
  );
});

export default employerRoutes;
