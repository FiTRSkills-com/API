import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";
import log from "../utils/log";
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

// Route for getting all jobs
jobRoutes.get("/:page", async (req: Request, res: Response): Promise<any> => {
  const { page } = req.params;
  const limit = 20;
  try {
    log.info("Fetching all jobs");

    const jobs = await JobModel.find({}, { __v: 0 })
      .populate({ path: "jobSkills.skill" })
      .populate({ path: "employer" })
      .skip(limit * Number(page))
      .exec();

    if (!jobs) {
      log.warn("No jobs exist");
      return res.status(200).send("No jobs exist");
    }

    log.info("Jobs fetched successfully");
    return res.status(200).send(jobs);
  } catch (err) {
    log.error("Error fetching jobs:", err);
    return res.status(500).send(err);
  }
});

// Route for getting a job by id
jobRoutes.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    log.info(`Fetching job with ID: ${id}`);

    const job = await JobModel.findOne({ _id: id }, { __v: 0 })
      .populate({ path: "jobSkills.skills" })
      .populate({ path: "employer", select: "-jobs -__v -_id" })
      .exec();

    if (!job) {
      log.warn(`No job found with ID: ${id}`);
      return res.status(200).send("No job found with that ID");
    }

    log.info(`Job with ID: ${id} fetched successfully`);
    return res.status(200).send(job);
  } catch (err) {
    log.error(`Error fetching job with ID: ${id}`, err);
    return res.status(500).send(err);
  }
});

// Route for creating a job
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
    log.info("Creating a new job");

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

    if (job) {
      log.warn("Job posting already exists");
      return res.status(409).send("Job posting already exists");
    }

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

    log.info("Job posting created successfully");
    return res.status(201).send("Job posting created");
  } catch (err) {
    log.error("Error creating job posting:", err);
    return res.status(500).send(err);
  }
});

// Route for updating a job
jobRoutes.patch("/:id", async (req: Request, res: Response): Promise<any> => {
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

  try {
    const updatedJob = await JobModel.findOneAndUpdate(
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
      { new: true }
    ).exec();

    if (!updatedJob) {
      log.warn(`No job found with ID: ${id}`);
      return res.status(404).send("No job found with that ID");
    }

    log.info(`Job with ID: ${id} updated successfully`);
    return res.status(200).send(updatedJob);
  } catch (err) {
    log.error(`Error updating job with ID: ${id}`, err);
    return res.status(500).send(err);
  }
});

// Route for deleting a job
jobRoutes.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    log.info(`Deleting job with ID: ${id}`);

    const job = await JobModel.findByIdAndDelete(id).exec();

    if (!job) {
      log.warn(`No job found with ID: ${id}`);
      return res.status(404).send("No job found with that ID");
    }

    log.info(`Job with ID: ${id} deleted successfully`);
    return res.status(200).send("Job deleted");
  } catch (err) {
    log.error(`Error deleting job with ID: ${id}`, err);
    return res.status(500).send(err);
  }
});

export default jobRoutes;
