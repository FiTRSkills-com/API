import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import JobModel, { Job } from "../Models/Job";
import EmployerModel from "../Models/Employer";
import CandidateModel from "../Models/Candidate";

// Types
import { JobDocument } from "../Types/JobDocument";
import { SkillDocument } from "../Types/SkillDocument";

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
jobRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  try {
    const jobs = await JobModel.find({}, { __v: 0 })
      .populate({ path: "skills", select: "Skill -_id" })
      .populate({ path: "company", select: "-jobs -__v -_id" })
      .exec();

    if (!jobs) return res.status(200).send("No jobs exists");
    return res.status(200).send(jobs);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for getting jobs for a candidate based on their skills.
 * @name GET /forme
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
jobRoutes.get("/forme", async (req: Request, res: Response): Promise<any> => {
  try {
    const candidate = await CandidateModel.findById(req.user._id).exec();
    const jobs: JobDocument[] = (await JobModel.find({})
      .populate({ path: "skills", select: "Skill Date" })
      .populate({ path: "company", select: "-jobs -__v -_id" })
      .exec()) as JobDocument[];

    if (!candidate || !jobs) {
      throw Error("An error occured");
    }

    // Filter jobs based on candidate's skills
    const filteredJobs = jobs.filter((job: JobDocument) => {
      const skills = job.skills;
      const candidateSkills = candidate.skills;
      const filteredSkills = skills.filter((skill: SkillDocument) => {
        return candidateSkills.includes(skill._id);
      });
      return filteredSkills.length > 0;
    });

    // Sort jobs based on number of matching skills
    const sortedJobs = filteredJobs.sort((a: JobDocument, b: JobDocument) => {
      const aSkills = a.skills;
      const bSkills = b.skills;
      const aSkillsLength = aSkills.length;
      const bSkillsLength = bSkills.length;
      if (aSkillsLength > bSkillsLength) {
        return -1;
      } else if (aSkillsLength < bSkillsLength) {
        return 1;
      } else {
        return 0;
      }
    });

    return res.status(200).send(sortedJobs);
  } catch (err) {
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
      .populate({ path: "skills", select: "Skill -_id" })
      .populate({ path: "company", select: "-jobs -__v -_id" })
      .exec();

    if (!job) return res.status(200).send("No job found with that ID");

    return res.status(200).send(job);
  } catch (err) {
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
    company,
    type,
    length,
    location,
    isRemote,
    willSponsor,
    salary,
    skills,
    benefits,
  } = req.body;

  if (
    !title ||
    !description ||
    !company ||
    !type ||
    !location ||
    isRemote === undefined ||
    willSponsor === undefined ||
    !salary ||
    !skills ||
    !benefits
  ) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const job = await JobModel.findOne({
      title,
      company,
      type,
      location,
      isRemote,
      willSponsor,
      salary,
      skills,
      benefits,
    }).exec();

    if (job) return res.status(409).send("Job posting already exists");

    const newJob = new JobModel({
      title,
      description,
      company,
      type,
      length,
      location,
      isRemote,
      willSponsor,
      salary,
      skills,
      benefits,
    });

    await newJob.save();
    return res.status(201).send("Job posting created");
  } catch (err) {
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
    skills,
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
    !skills &&
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
        skills,
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
