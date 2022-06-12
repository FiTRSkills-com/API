import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import CompanyModel, { Company } from "../Models/Company";

// Instantiate the router
const companyRoutes = Router();

// Use Middleware
companyRoutes.use(verifyToken);

/**
 * Route for getting all companies.
 * @name GET /
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing all companies || Error
 */
companyRoutes.get("/", (_: Request, res: Response): void => {
  CompanyModel.find({}, { __v: 0 })
    .populate({ path: "jobs", select: "title type location" })
    .exec((err: CallbackError, companies: any[]): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send(companies);
    });
});

/**
 * Route for getting a company by id.
 * @name GET /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing the company || Error
 */
companyRoutes.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  CompanyModel.findOne({ _id: id }, { __v: 0 })
    .populate({ path: "jobs", select: "title type location" })
    .exec((err: CallbackError, company: Company): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send(company);
    });
});

/**
 * Route for creating a company.
 * @name POST /add
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message or Error message || Error
 */
companyRoutes.post("/add", (req: Request, res: Response): void => {
  const { name, headquarters, website, logo } = req.body;

  if (!name || !headquarters || !website || !logo) {
    res.status(400).send("Missing required fields");
  } else {
    CompanyModel.findOne(
      {
        name,
        headquarters,
        website,
        logo,
      },
      (err: CallbackError, company: Company): void => {
        if (err) {
          res.status(500).send(err);
        }

        if (company) {
          res.status(400).send("Company already exists");
        } else {
          const newCompany = new CompanyModel({
            name,
            headquarters,
            website,
            logo,
          });

          newCompany.save((err: CallbackError): void => {
            if (err) {
              res.status(500).send(err);
            }

            res.status(200).send("Company created");
          });
        }
      }
    );
  }
});

/**
 * Route for updating a company by id.
 * @name PUT /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message || Error
 */
companyRoutes.patch("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  const { name, headquarters, website, logo } = req.body;

  if (!name || !headquarters || !website || !logo) {
    res.status(400).send("Missing required fields");
  }

  CompanyModel.findOneAndUpdate(
    { _id: id },
    { $set: { name, headquarters, website, logo } },
    (err: Error): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send("Company updated");
    }
  );
});

/**
 * Route for deleting a company by id.
 * @name DELETE /:id
 * @function
 * @alias module:Routes/companyRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message || Error
 */
companyRoutes.delete("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  CompanyModel.findOneAndDelete({ _id: id }, (err: Error): void => {
    if (err) {
      res.status(500).send(err);
    }

    res.status(200).send("Company deleted");
  });
});

export default companyRoutes;
