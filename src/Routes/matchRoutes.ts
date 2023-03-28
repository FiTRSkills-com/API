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
        .populate({ path: "user", select: "-_id userID" })
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

/**
 * Route for updating an match by id
 * @name PATCH /:id
 * @function
 * @alias module:Routes/matchRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
matchRoutes.patch("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;
  const { status, timeslots } = req.body;

  if (!status || !timeslots) {
    return res.status(400).send("Missing required fields");
  }

  return MatchModel.findOneAndUpdate(
    { _id: id },
    { $set: { status, interviewTimeSlots: timeslots } },
    (err: Error): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Interview Updated");
    }
  );
});

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
        (jobSkillObj: JobSkill) => jobSkillObj.skill.skill
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
