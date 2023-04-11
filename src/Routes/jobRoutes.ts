import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import JobModel, { Job } from "../Models/Job";
import EmployerModel from "../Models/Employer";
import SkillModel from "../Models/Skill";

// Instantiate the router
const jobRoutes = Router();

// Use Middleware
jobRoutes.use(verifyToken);

/**
 * Route for getting all jobs.
 * @name GET /
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
jobRoutes.get("/:page", async (req: Request, res: Response): Promise<any> => {
  const { page } = req.params;
  const filters = req.query;
  const limit = 20;
  try {
    const skill = filters.skill;
    const threshold = filters.matchThreshold;
    const isRemote = filters.isRemote;

    let jobs;
    if (skill != "" || threshold || isRemote) {
      let skillIds = [];
      if (skill != "") {
        const queriedSkills = await SkillModel.find({
          skill: { $regex: skill, $options: "i" },
        });
        skillIds = queriedSkills.map((qSkill) => {
          return qSkill._id;
        });
      }
      const craftedFilters = [
        skill != "" ? { "jobSkills.skill": { $in: skillIds } } : {},
        { matchThreshold: { $gt: threshold } },
        { isRemote: isRemote },
      ];
      jobs = await JobModel.find(
        {
          $or: craftedFilters,
        },
        { __v: 0 }
      )
        .populate({ path: "jobSkills.skill" })
        .populate({ path: "employer" })
        .skip(limit * Number(page))
        .exec();
    } else {
      jobs = await JobModel.find({}, { __v: 0 })
        .populate({ path: "jobSkills.skill" })
        .populate({ path: "employer" })
        .skip(limit * Number(page))
        .exec();
    }

    if (!jobs) return res.status(200).send("No jobs exists");

    return res.status(200).send(jobs);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

/**
 * Route for getting a job by id.
 * @name GET /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
jobRoutes.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const job = await JobModel.findOne({ _id: id }, { __v: 0 })
      .populate({ path: "jobSkills.skills" })
      .populate({ path: "employer", select: "-jobs -__v -_id" })
      .exec();

    if (!job) return res.status(200).send("No job found with that ID");

    return res.status(200).send(job);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

/**
 * Route for creating a job.
 * @name POST /
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
jobRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
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
    matches,
  } = req.body;

  if (
    !title ||
    !description ||
    isCompanyListing === undefined ||
    !employer ||
    !type ||
    !location ||
    isRemote === undefined ||
    willSponsor === undefined ||
    !salary ||
    !matchThreshold ||
    !jobSkills ||
    !benefits ||
    !matches
  ) {
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
      matches,
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
      matches,
    });

    await newJob.save();

    return res.status(201).send("Job posting created");
  } catch (err) {
    console.log(err);
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
jobRoutes.patch("/:id", (req: Request, res: Response): any => {
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
jobRoutes.delete("/:id", (req: Request, res: Response): any => {
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

export default jobRoutes;
