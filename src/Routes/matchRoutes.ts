import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import MatchModel from "../Models/Match";
import JobModel from "../Models/Job";
import { Skill } from "../Models/Skill";
import { JobSkill } from "../Models/Job";
import {
  createDefaultCandidateMatchStatus,
  createDefaultEmployerPendingStatus,
  createDefaultMatchStatus,
} from "../Models/Status";
import mongoose from "mongoose";

// Instantiate the router
const matchRoutes = Router();

// Use Middleware
matchRoutes.use(verifyToken);

/**
 * Route for getting an match by ID
 * @name GET /:id
 * @function
 * @alias module:Routes/matchRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
matchRoutes.get(
  "/id/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      const match = await MatchModel.findById(id, { __v: 0 })
        .populate({ path: "job", select: "_id title type location" })
        .exec();

      if (!match) return res.status(200).send("match not found for ID");

      return res.status(200).send(match);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for getting a candidate's matches
 * @name GET /user
 * @function
 * @alias module:Routes/matchRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
matchRoutes.get(
  "/candidate",
  async (req: Request, res: Response): Promise<any> => {
    const { _id: candidateID } = req.candidate;

    try {
      const matches = await MatchModel.find(
        { candidate: candidateID },
        { candidate: 0 },
        { __v: 0 }
      )
        .populate({
          path: "job",
          populate: { path: "employer jobSkills", populate: "company" },
        })
        .populate({ path: "candidateStatus matchStatus employerStatus" })
        .exec();
      if (!matches) return res.status(200).send("You have no matches");

      return res.status(200).send(matches);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for getting every match with a given employer
 * @name GET /user
 * @function
 * @alias module:Routes/matchRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
matchRoutes.get(
  "/employerMatches/:employerId",
  async (req: Request, res: Response): Promise<any> => {
    const { employerId } = req.params;

    try {
      const matches = await MatchModel.aggregate([
        {
          $lookup: {
            from: "jobs",
            localField: "job",
            foreignField: "_id",
            as: "job",
          },
        },
        {
          $unwind: {
            path: "$job",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "employers",
            localField: "job.employer",
            foreignField: "_id",
            as: "job.employer",
          },
        },
        {
          $unwind: {
            path: "$job.employer",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matchStatus",
            foreignField: "_id",
            as: "matchStatus",
          },
        },
        {
          $unwind: {
            path: "$matchStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "job.employer._id": new mongoose.Types.ObjectId(employerId),
            "matchStatus.matchStatus": "Match",
          },
        },
        {
          $lookup: {
            from: "candidates",
            localField: "candidate",
            foreignField: "_id",
            as: "candidate",
          },
        },
        {
          $unwind: {
            path: "$candidate",
            preserveNullAndEmptyArrays: false,
          },
        },
      ]);

      if (!matches) return res.status(200).send("You have no matches");

      return res.status(200).send(matches);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for creating a new match for candidate
 * @name POST /
 * @function
 * @alias module:Routes/matchRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
matchRoutes.post(
  "/createMatch",
  async (req: Request, res: Response): Promise<any> => {
    const { jobID } = req.body;
    const { _id: candidateID } = req.candidate;

    try {
      const match = await MatchModel.findOne({
        job: jobID,
        candidate: candidateID,
      });

      if (match)
        return res
          .status(400)
          .send("You've already applied to this job posting");

      // Check if job posting exists
      const job = await JobModel.findById(jobID).exec();
      if (!job) return res.status(400).send("Job posting does not exist");

      // Create match
      const newmatch = new MatchModel({
        job: jobID,
        candidate: candidateID,
        matchStatus: await createDefaultMatchStatus(),
        candidateStatus: await createDefaultCandidateMatchStatus(),
        employerStatus: await createDefaultEmployerPendingStatus(),
        interviews: [],
      });

      await newmatch.save();
      return res.status(200).send("Match successfully created");
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
);

matchRoutes.get(
  "/shared-skills/:matchId",
  async (req: Request, res: Response): Promise<any> => {
    const { matchId } = req.params;

    try {
      const match = await MatchModel.findById(matchId).populate([
        { path: "job", populate: { path: "jobSkills.skill" } },
        { path: "candidate", populate: { path: "skills" } },
      ]);

      if (!match) {
        return res.status(404).send("Match not found");
      }

      const jobSkills: Skill[] = match.job.jobSkills.map(
        (jobSkillObj: JobSkill) => jobSkillObj.skill
      );

      const candidateSkills: Skill[] = match.candidate.skills;

      const sharedSkills = candidateSkills.filter((skill: Skill) => {
        return skillArrContains(jobSkills, skill);
      });

      // Calculate the percentage of shared skills
      const percentageMatching = (sharedSkills.length / jobSkills.length) * 100;

      return res.status(200).send({
        percentageMatching,
      });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

//helper function for skill object comparison, 'includes' arr method
//will only check if two object have same ref in memory
function skillArrContains(skillArr: Skill[], skill: Skill) {
  for (let i = 0; i < skillArr.length; i++) {
    if (JSON.stringify(skill) === JSON.stringify(skillArr[0])) {
      return true;
    }
  }
  return false;
}

export default matchRoutes;
