import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import log from "../../utils/log";

// Middleware
import { verifyToken } from "../../Middleware/Authorization";

// Models
import CandidateModel, { Candidate } from "../../Models/Candidate";
import JobModel from "../../Models/Job";
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
          .send("No matched candidates found for this jobId");
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

eCandidateRoutes.get(
  "/meetSkillThresh/:jobId",
  async (req: Request, res: Response): Promise<any> => {
    const { jobId } = req.params;

    //get candidates that dont have a match with this job
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
          $match: {
            matches: {
              $not: {
                $elemMatch: {
                  job: new mongoose.Types.ObjectId(jobId),
                },
              },
            },
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

      //get job for calculating matchPercentage
      const job = await JobModel.findById(jobId).populate([
        { path: "jobSkills.skill" },
      ]);

      if (!job) {
        return res.status(200).send("couldn't find job");
      }

      if (!candidates) {
        return res
          .status(200)
          .send("No interested candidates found for this jobId");
      }

      // calculate and attach match percentages to candidates
      candidates.forEach((candidate) => {
        candidate.matches = { matchPercentage: 0 }; //TODO document future improvement
        const jobSkills: Skill[] = job.jobSkills.map(
          (jobSkillObj: JobSkill) => jobSkillObj.skill
        );
        candidate.matches.matchPercentage = getMatchPercentage(
          candidate.skills,
          jobSkills
        );
      });

      //filter for candidates that match job's match threshold
      let filteredCandidates = candidates.filter((candidate) => {
        return candidate.matches.matchPercentage >= job.matchThreshold;
      });

      return res.status(200).send(filteredCandidates);
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
