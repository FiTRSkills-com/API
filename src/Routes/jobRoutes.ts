import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import JobModel, { Job } from "../Models/Job";
import CompanyModel from "../Models/Company";
import UserModel from "../Models/User";

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
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing all jobs || Error
 */
jobRoutes.get("/", (_: Request, res: Response): void => {
  JobModel.find({}, { __v: 0 })
    .populate({ path: "skills", select: "Skill -_id" })
    .populate({ path: "company", select: "-jobs -__v -_id" })
    .exec((err: CallbackError, jobs: any[]): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send(jobs);
    });
});

/**
 * Route for getting jobs for a user based on their skills.
 * @name GET /forme
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {Job[]} - Array of jobs
 */
jobRoutes.get("/forme", async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.user._id);
  const jobs: JobDocument[] = await JobModel.find({})
    .populate({ path: "skills", select: "Skill Date" })
    .populate({ path: "company", select: "-jobs -__v -_id" });

  // Filter jobs based on user's skills
  const filteredJobs = jobs.filter((job: JobDocument) => {
    const skills = job.skills;
    const userSkills = user.skills;
    const filteredSkills = skills.filter((skill: SkillDocument) => {
      return userSkills.includes(skill._id);
    });
    return filteredSkills.length > 0;
  });

  // Sort jobs based on number of skills matched
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

  res.status(200).send(sortedJobs);
});

/**
 * Route for getting a job by id.
 * @name GET /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing the job || Error
 */
jobRoutes.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  JobModel.findOne({ _id: id }, { __v: 0 })
    .populate({ path: "skills", select: "Skill -_id" })
    .populate({ path: "company", select: "-jobs -__v -_id" })
    .exec((err: CallbackError, job: Job): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send(job);
    });
});

/**
 * Route for creating a job.
 * @name POST /
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message || Error message || Error
 */
jobRoutes.post("/", (req: Request, res: Response): void => {
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
    res.status(400).send("Missing required fields");
  } else {
    JobModel.findOne(
      {
        title,
        company,
        type,
        location,
        isRemote,
        willSponsor,
        salary,
        skills,
        benefits,
      },
      (err: Error, job: Job): void => {
        if (err) {
          res.status(500).send(err);
        }

        if (job) {
          res.status(400).send("Job already exists");
        } else {
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

          try {
            newJob.save((err: Error): void => {
              if (err) {
                throw err;
              }
            });
            CompanyModel.findOneAndUpdate(
              { _id: company },
              { $push: { jobs: newJob._id } },
              (err: Error): void => {
                if (err) {
                  throw err;
                }
              }
            );
            res.status(201).send("Job created");
          } catch (err) {
            res.status(500).send(err);
          }
        }
      }
    );
  }
});

/**
 * Route for updating a job.
 * @name PATCH /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message || Error message || Error
 */
jobRoutes.patch("/:id", (req: Request, res: Response): void => {
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
    res.status(400).send("Missing required fields");
  } else {
    JobModel.findOneAndUpdate(
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
      (err: Error): void => {
        if (err) {
          res.status(500).send(err);
        }

        res.status(200).send("Job updated");
      }
    );
  }
});

/**
 * Route for delete a job.
 * @name DELETE /:id
 * @function
 * @alias module:Routes/jobRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Success message || Error message || Error
 */
jobRoutes.delete("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  JobModel.findOneAndDelete({ _id: id }, (err: Error, job: Job): void => {
    if (err) {
      res.status(500).send(err);
    }

    CompanyModel.findOneAndUpdate(
      { _id: job.company },
      { $pull: { jobs: id } },
      (err: Error): void => {
        if (err) {
          res.status(500).send(err);
        }
      }
    );
    res.status(200).send("Job deleted");
  });
});

export default jobRoutes;
