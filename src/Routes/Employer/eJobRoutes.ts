import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../../Middleware/Authorization";

// Models
import JobModel, { Job } from "../../Models/Job";
import EmployerModel from "../../Models/Employer";
import log from "../../utils/log";

// Instantiate the router
const eJobRoutes = Router();

// Use Middleware
eJobRoutes.use(verifyToken);

/**
 * Route for Getting Employer Home Jobs
 */
eJobRoutes.get(
  "/homeJobs/:employerId",
  async (req: Request, res: Response): Promise<any> => {
    const { employerId } = req.params;

    try {
      const jobs = await JobModel.find({ employer: employerId })
        .sort("updatedAt")
        .limit(3)
        .populate({ path: "jobSkills.skill" })
        .exec();
      if (!jobs) return res.status(200).send("No Jobs Exist.");
      return res.status(200).send(jobs);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for Getting Employer Jobs, Paginated
 */
eJobRoutes.get(
  "/:employerId/:rpp/:page",
  async (req: Request, res: Response): Promise<any> => {
    const { employerId, rpp, page } = req.params;

    try {
      const jobs = await JobModel.find({ employer: employerId })
        .sort("updatedAt")
        .limit(Number(rpp))
        .skip(Number(rpp) * Number(page))
        .populate({ path: "jobSkills.skill" })
        .exec();

      if (!jobs) return res.status(200).send("No Jobs Exist.");
      return res.status(200).send(jobs);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for creating a Job
 */
eJobRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  const {
    title,
    description,
    isCompanyListing,
    employer,
    type,
    length,
    location,
    isRemote,
    willSponsor,
    salary,
    matchThreshold,
    jobSkills,
    benefits,
  } = req.body;

  log.info(req.body);

  if (
    !title ||
    !description ||
    isCompanyListing === undefined ||
    !employer ||
    type === undefined ||
    !location ||
    isRemote === undefined ||
    willSponsor === undefined ||
    !salary ||
    !matchThreshold ||
    !jobSkills ||
    !benefits
  ) {
    log.info("Incorrect Feilds");
    return res.status(400).send("Missing required fields");
  }
  try {
    const job = await JobModel.findOne({
      title,
      isCompanyListing,
      employer,
      type,
      location,
      isRemote,
      willSponsor,
      salary,
      matchThreshold,
      jobSkills,
      benefits,
    }).exec();

    if (job) return res.status(409).send("Job posting already exists");

    const newJob = new JobModel({
      title,
      description,
      isCompanyListing,
      employer,
      type,
      length,
      location,
      isRemote,
      willSponsor,
      salary,
      matchThreshold,
      jobSkills,
      benefits,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      matches: [],
    });

    await newJob.save();

    return res.status(201).send("Job posting created");
  } catch (err) {
    log.error(err);
    return res.status(500).send(err);
  }
});

/**
 * Route for updating a job.
 * @name PATCH /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
eJobRoutes.patch("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  const {
    title,
    description,
    company,
    type,
    length,
    location,
    isRemote,
    willSponsor,
    salary,
    jobSkills,
    benefits,
  } = req.body;

  if (
    !title &&
    !description &&
    !company &&
    !type &&
    !location &&
    isRemote === undefined &&
    willSponsor === undefined &&
    !salary &&
    !jobSkills &&
    !benefits
  ) {
    return res.status(400).send("Missing required fields");
  }

  log.info(salary);

  return JobModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        title,
        description,
        company,
        type,
        length,
        location,
        isRemote,
        willSponsor,
        salary,
        jobSkills,
        benefits,
        updatedAt: new Date(),
      },
    },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Job posting updated");
    }
  );
});

/**
 * Route for delete a job.
 * @name DELETE /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
eJobRoutes.delete("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  return JobModel.findOneAndDelete(
    { _id: id },
    (err: CallbackError, job: Job): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return EmployerModel.findOneAndUpdate(
        { _id: job.employer },
        { $pull: { jobs: id } },
        (err: CallbackError): any => {
          if (err) {
            return res.status(500).send(err);
          }

          return res.status(200).send("Job deleted");
        }
      );
    }
  );
});

export default eJobRoutes;
