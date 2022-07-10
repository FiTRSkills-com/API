import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import CompanyModel from "../Models/Company";

// Instantiate the router
const companyRoutes = Router();

// Use Middleware
companyRoutes.use(verifyToken);

/**
 * Route for getting all companies.
 * @name GET /
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
companyRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  try {
    const companies = await CompanyModel.find({}, { __v: 0 })
      .populate({ path: "jobs", select: "title type location" })
      .exec();

    if (!companies) return res.status(200).send("No companies exist");

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
companyRoutes.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const company = await CompanyModel.findOne({ _id: id }, { __v: 0 })
      .populate({ path: "jobs", select: "title type location" })
      .exec();

    if (!company) return res.status(200).send("No company exists with that ID");

    return res.status(200).send(company);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for creating a company.
 * @name POST /
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
companyRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  const { name, headquarters, website, logo } = req.body;

  if (!name || !headquarters || !website || !logo) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const company = await CompanyModel.findOne({
      name,
      headquarters,
      website,
      logo,
    }).exec();

    if (company) return res.status(409).send("Company already exists");

    const newCompany = new CompanyModel({
      name,
      headquarters,
      website,
      logo,
    });

    await newCompany.save();
    return res.status(201).send("Company created");
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for updating a company by id.
 * @name PATCH /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
companyRoutes.patch("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  const { name, headquarters, website, logo } = req.body;

  if (!name && !headquarters && !website && !logo) {
    return res.status(400).send("Missing required fields");
  }

  return CompanyModel.findOneAndUpdate(
    { _id: id },
    { $set: { name, headquarters, website, logo } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Company updated");
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
companyRoutes.delete("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  return CompanyModel.findOneAndDelete(
    { _id: id },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Company deleted");
    }
  );
});

export default companyRoutes;
