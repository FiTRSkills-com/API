import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import log from "../../utils/log";

// Middleware
import { verifyToken } from "../../Middleware/Authorization";

// Models
import CandidateModel, { Candidate } from "../../Models/Candidate";
import { Skill } from "../../Models/Skill";
import { JobSkill } from "../../Models/Job";

// Instantiate the router
const eCandidateRoutes = Router();

// Use Middleware
eCandidateRoutes.use(verifyToken);

/**
 * Route for getting candidates interested in a job of given id
 * @name GET /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
eCandidateRoutes.get(
  "/interested/:jobId",
  async (req: Request, res: Response): Promise<any> => {
    const { jobId } = req.params;

    try {
      const candidates = await CandidateModel.aggregate([
        {
          $lookup: {
            from: "matches",
            localField: "matches",
            foreignField: "_id",
            as: "matches",
          },
        },
        {
          $unwind: {
            path: "$matches",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.matchStatus",
            foreignField: "_id",
            as: "matches.matchStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.matchStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.candidateStatus",
            foreignField: "_id",
            as: "matches.candidateStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.candidateStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$matches.job", new mongoose.Types.ObjectId(jobId)],
                },
                {
                  $eq: ["$matches.matchStatus.matchStatus", "Pre Match"],
                },
                {
                  $eq: ["$matches.candidateStatus.generalStatus", "Interested"],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "jobs",
            localField: "matches.job",
            foreignField: "_id",
            as: "matches.job",
          },
        },
        {
          $unwind: {
            path: "$matches.job",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "skills",
            localField: "matches.job.jobSkills.skill",
            foreignField: "_id",
            as: "matches.job.jobSkills.skill",
          },
        },
        {
          $lookup: {
            from: "skills",
            localField: "skills",
            foreignField: "_id",
            as: "skills",
          },
        },
      ]);

      if (!candidates)
        return res
          .status(200)
          .send("No interested candidates found for this jobId");
      candidates.forEach((candidate) => {
        candidate.matches.matchPercentage = getMatchPercentage(
          candidate.skills,
          candidate.matches.job.jobSkills.skill
        ); //TODO document future improvement
      });
      return res.status(200).send(candidates);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for getting candidates matched with a job of given id
 * @name GET /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
eCandidateRoutes.get(
  "/matched/:jobId",
  async (req: Request, res: Response): Promise<any> => {
    const { jobId } = req.params;

    try {
      const candidates = await CandidateModel.aggregate([
        {
          $lookup: {
            from: "matches",
            localField: "matches",
            foreignField: "_id",
            as: "matches",
          },
        },
        {
          $unwind: {
            path: "$matches",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.matchStatus",
            foreignField: "_id",
            as: "matches.matchStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.matchStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.candidateStatus",
            foreignField: "_id",
            as: "matches.candidateStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.candidateStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$matches.job", new mongoose.Types.ObjectId(jobId)],
                },
                {
                  $eq: ["$matches.matchStatus.matchStatus", "Match"],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "jobs",
            localField: "matches.job",
            foreignField: "_id",
            as: "matches.job",
          },
        },
        {
          $unwind: {
            path: "$matches.job",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "skills",
            localField: "matches.job.jobSkills.skill",
            foreignField: "_id",
            as: "matches.job.jobSkills.skill",
          },
        },
        {
          $lookup: {
            from: "skills",
            localField: "skills",
            foreignField: "_id",
            as: "skills",
          },
        },
      ]);

      if (!candidates)
        return res
          .status(200)
          .send("No interested candidates found for this jobId");
      candidates.forEach((candidate) => {
        candidate.matches.matchPercentage = getMatchPercentage(
          candidate.skills,
          candidate.matches.job.jobSkills.skill
        ); //TODO document future improvement
      });
      return res.status(200).send(candidates);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// helper method to add calculated match percentage to returned candidate result
function getMatchPercentage(candidateSkills: Skill[], jobSkills: Skill[]) {
  const sharedSkills = candidateSkills.filter((skill: Skill) => {
    return skillArrContains(jobSkills, skill);
  });

  // Calculate the percentage of shared skills
  const percentageMatching = (sharedSkills.length / jobSkills.length) * 100;
  return percentageMatching;
}

//helper function for skill object comparison, 'includes' arr method
//will only check if two object have same ref in memory
function skillArrContains(skillArr: Skill[], skill: Skill) {
  for (let i = 0; i < skillArr.length; i++) {
    if (JSON.stringify(skill) === JSON.stringify(skillArr[i])) {
      return true;
    }
  }
  return false;
}

export default eCandidateRoutes;
