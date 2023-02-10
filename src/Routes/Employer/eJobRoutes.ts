import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../../Middleware/Authorization";

// Models
import JobModel, { Job } from "../../Models/Job";
import EmployerModel from "../../Models/Employer";
import CandidateModel from "../../Models/Candidate";

// Types
import { JobDocument } from "../../Types/JobDocument";
import { SkillDocument } from "../../Types/SkillDocument";
import log from "../../utils/log";
import { ObjectId } from "mongoose";

// Instantiate the router
const eJobRoutes = Router();

// Use Middleware
eJobRoutes.use(verifyToken);

/**
 * Route for Getting Employer Jobes
 */
eJobRoutes.get(
  "/homeJobs/:employerId",
  async (req: Request, res: Response): Promise<any> => {
    const { employerId } = req.params;

    try {
      const jobs = await JobModel.find({ employer: employerId })
        .sort("updatedAt")
        .limit(3)
        .populate({ path: "jobSkills" })
        .exec();
      if (!jobs) return res.status(200).send("No Joçbs Exist.");
      return res.status(200).send(jobs);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

export default eJobRoutes;
