import { Router, Request, Response } from "express";
import mongoose, { CallbackError } from "mongoose";

// Utils
import log from "../utils/log";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import EmployerModel from "../Models/Employer";

// Instantiate the router
const employerRoutes = Router();

// Use Middleware
employerRoutes.use(verifyToken);

/**
 * Route for getting all employers.
 * @name GET /
 * @function
 * @alias module:Routes/employerRoutes
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
employerRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  try {
    const employers = await EmployerModel.find({}, { __v: 0 })
      .populate({ path: "jobs", select: "title type location" })
      .exec();

    if (!employers) {
      log.info("No employers found");
      return res.status(200).send("No employers exist");
    }

    log.info("Employers fetched");
    return res.status(200).send(employers);
  } catch (err) {
    log.error(`Error fetching employers: ${err}`);
    return res.status(500).send(err);
  }
});

/**
 * Route for getting an employer by id.
 * @name GET /:id
 * @function
 * @alias module:Routes/employerRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
employerRoutes.get(
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      const employer = await EmployerModel.findOne({ _id: id }, { __v: 0 })
        .populate({ path: "jobs", select: "title type location" })
        .exec();

      if (!employer) {
        log.info(`No employer found with ID ${id}`);
        return res.status(200).send("No employer exists with that ID");
      }

      log.info(`Employer fetched with ID ${id}`);
      return res.status(200).send(employer);
    } catch (err) {
      log.error(`Error fetching employer: ${err}`);
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for creating an employer.
 * @name POST /
 * @function
 * @alias module:Routes/employerRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
employerRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  const { profile, company, authID } = req.body;

  if (!profile || !company || !authID) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const employer = await EmployerModel.findOne({
      profile,
      company,
    }).exec();

    if (employer) {
      log.info("Employer already exists");
      return res.status(409).send("Employer already exists");
    }

    const newEmployer = await new EmployerModel({
      dateCreated: Date.now(),
      profile: profile,
      company: company,
      authID: authID,
    });

    await newEmployer.save();

    log.info("Employer created");
    return res.status(201).send("Employer created");
  } catch (err) {
    log.error(`Error creating employer: ${err}`);
    return res.status(500).send(err);
  }
});

/**
 * Route for updating an employer by id.
 * @name PATCH /:id
 * @function
 * @alias module:Routes/employerRoutes
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
        log.error(`Error updating employer: ${err}`);
        return res.status(500).send(err);
      }

      log.info(`Employer updated with ID ${id}`);
      return res.status(200).send("Employer updated");
    }
  );
});

/**
 * Route for deleting an employer by id.
 * @name DELETE /:id
 * @function
 * @alias module:Routes/employerRoutes
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
        log.error(`Error deleting employer: ${err}`);
        return res.status(500).send(err);
      }

      log.info(`Employer deleted with ID ${id}`);
      return res.status(200).send("Employer deleted");
    }
  );
});

export default employerRoutes;
