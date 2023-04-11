import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { CallbackError } from "mongoose";

// Types
import { SkillDocument } from "../../Types/SkillDocument";

// Models
import SkillModel from "../../Models/Skill";
import JobModel, { JobSkill } from "../../Models/Job";
import log from "../../utils/log";
import { verifyToken } from "../../Middleware/Authorization";

// Instantiate the router
const eSkillRoutes = Router();

eSkillRoutes.use(verifyToken);

/**
 * Route for logging in a Employer.
 * Will create a new candidate if they don't exist.
 * Will return the candidate object if they do.
 * @name POST /login
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
eSkillRoutes.get(
  "/:rpp/:page/:sort",
  async (req: Request, res: Response): Promise<any> => {
    const { rpp, page, sort, jobID } = req.params;

    try {
      const skills = await SkillModel.find()
        .sort(sort)
        .limit(Number(rpp))
        .skip(Number(page))
        .exec();

      if (!skills) return res.status(200).send("No Skills Exist.");
      return res.status(200).send(skills);
    } catch (err) {
      log.error(err);
      return res.status(500).send(err);
    }
  }
);

eSkillRoutes.get(
  "/:rpp/:page/:sort/:jobID",
  async (req: Request, res: Response): Promise<any> => {
    const { rpp, page, sort, jobID } = req.params;

    try {
      const jobs = await JobModel.findOne({ _id: jobID })
        .select("jobSkills.skill")
        .exec();
      const excludedSkillIDs = jobs.jobSkills.map((js: JobSkill) => js.skill);

      const skills = await SkillModel.find({ _id: { $nin: excludedSkillIDs } })
        .sort(sort)
        .limit(Number(rpp))
        .skip(Number(page))
        .exec();

      if (!skills) return res.status(200).send("No Skills Exist.");
      return res.status(200).send(skills);
    } catch (err) {
      log.error(err);
      return res.status(500).send(err);
    }
  }
);

eSkillRoutes.get(
  "/searchBy/:rpp/:page/:sort/:jobID/:search",
  async (req: Request, res: Response): Promise<any> => {
    const { rpp, page, sort, jobID, search } = req.params;

    try {
      const jobs = await JobModel.findOne({ _id: jobID })
        .select("jobSkills.skill")
        .exec();
      const excludedSkillIDs = jobs.jobSkills.map((js: JobSkill) => js.skill);
      log.info(excludedSkillIDs);

      const skills = await SkillModel.find({
        _id: { $nin: excludedSkillIDs },
        skill: { $regex: new RegExp(search, "i") },
      })
        .sort(sort)
        .limit(Number(rpp))
        .skip(Number(page))
        .exec();
      log.info(skills);

      if (!skills) return res.status(200).send("No Skills Exist.");
      return res.status(200).send(skills);
    } catch (err) {
      log.error(err);
      return res.status(500).send(err);
    }
  }
);

export default eSkillRoutes;
