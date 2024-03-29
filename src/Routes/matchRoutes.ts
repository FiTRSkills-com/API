import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import MatchModel from "../Models/Match";
import CandidateModel from "../Models/Candidate";
import JobModel from "../Models/Job";
import { Skill } from "../Models/Skill";
import { JobSkill } from "../Models/Job";
import {
  createDefaultCandidateMatchStatus,
  createDefaultEmployerPendingStatus,
  createDefaultMatchStatus,
} from "../Models/Status";

import EmployerModel from "../Models/Employer";
import log from "../utils/log";
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

      if (!match.interview) {
        match.interview = "";
      }
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
        { __v: 0 }
      )
        .populate({
          path: "job",
          populate: { path: "employer" },
        })
        .populate({
          path: "job",
          populate: { path: "jobSkills", populate: "skill" },
        })
        .populate({
          path: "candidateStatus matchStatus employerStatus interview",
        })
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
      });

      await newmatch.save();

      await JobModel.updateOne(
        { _id: jobID },
        { $push: { matches: newmatch._id } }
      );

      await CandidateModel.updateOne(
        { _id: candidateID },
        { $push: { matches: newmatch._id } }
      );

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

      const missingSkills = jobSkills.filter((skill: Skill) => {
        return !skillArrContains(candidateSkills, skill);
      });

      const otherSkills = candidateSkills.filter((skill: Skill) => {
        return !skillArrContains(jobSkills, skill);
      });

      // Calculate the percentage of shared skills
      let percent;
      if (jobSkills.length > 0) {
        percent = (sharedSkills.length / jobSkills.length) * 100;
      } else {
        percent = 0;
      }
      const percentageMatching = percent.toString(); // have to return as string to avoid incorrect status error

      return res
        .status(200)
        .send({ sharedSkills, missingSkills, otherSkills, percentageMatching });
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

// 1. Get API call to return candidates that have matched with the company
matchRoutes.get(
  "/matched/:companyId",
  async (req: Request, res: Response): Promise<any> => {
    const { companyId } = req.params;

    try {
      const companyEmployer = await EmployerModel.findOne({
        company: companyId,
      });
      if (!companyEmployer) {
        return res.status(404).send("Company not found");
      }

      const matches = await MatchModel.find({
        matchStatus: "Match",
        candidateStatus: "Interested",
        employerStatus: "Interested",
        "job.employer": companyEmployer._id,
      }).populate("candidate");
      return res.status(200).send(matches);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// 2. Get API call to return candidates that the company has reached out to
matchRoutes.get(
  "/waiting/:companyId",
  async (req: Request, res: Response): Promise<any> => {
    const { companyId } = req.params;

    try {
      const companyEmployer = await EmployerModel.findOne({
        company: companyId,
      });
      if (!companyEmployer) {
        return res.status(404).send("Company not found");
      }

      const matches = await MatchModel.find({
        matchStatus: "Pre Match",
        candidateStatus: "Pending",
        employerStatus: "Interested",
        "job.employer": companyEmployer._id,
      }).populate("candidate");
      return res.status(200).send(matches);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// 3. Update API call to accept a candidate from an employer or candidate perspective
matchRoutes.put(
  "/accept/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
      const match = await MatchModel.findByIdAndUpdate(
        id,
        {
          matchStatus: "Match",
          candidateStatus: "Interested",
          employerStatus: "Interested",
        },
        { new: true }
      );
      return res.status(200).send(match);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// 4. Update call to reject a candidate as an employer
matchRoutes.put(
  "/reject/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
      const match = await MatchModel.findByIdAndUpdate(
        id,
        {
          matchStatus: "Uninterested",
          employerStatus: "Uninterested",
        },
        { new: true }
      );
      return res.status(200).send(match);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// 5. Update call for an employer to reject a candidate after the match has already occurred
matchRoutes.put(
  "/retract/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
      const match = await MatchModel.findByIdAndUpdate(
        id,
        {
          matchStatus: "Retracted",
          employerStatus: "Retracted",
        },
        { new: true }
      );
      return res.status(200).send(match);
    } catch (err) {
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

      const jobSkills: string[] = match.job.jobSkills.map(
        (jobSkillObj: JobSkill) => jobSkillObj.skill
      );
      const candidateSkills: string[] = match.candidate.skills.map(
        (skillObj: Skill) => skillObj.skill
      );

      const sharedSkills = candidateSkills.filter((skill) =>
        jobSkills.includes(skill)
      );

      // Calculate the percentage of shared skills
      const percentageMatching = (sharedSkills.length / jobSkills.length) * 100;

      return res.status(200).send({
        sharedSkills,
        percentageMatching,
      });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

export default matchRoutes;
