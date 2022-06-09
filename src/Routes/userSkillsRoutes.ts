import { Router, Request, Response } from "express";
import { model } from "mongoose";

// Types
import type UserSkill from "../Types/UserSkill";

// Schema
import UserSkillSchema from "../Models/UserSkills";
const UserSkillModel = model("UserSkills", UserSkillSchema);

// Instantiate the router
const userSkillRoutes = Router();

/**
 * Route for adding skills to a user.
 * @name POST /
 * @function
 * @alias module:Routes/userSkillsRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} Success message or Error
 */
userSkillRoutes.post("/", (req: Request, res: Response): void => {
  const { userID, skills } = req.body;

  if (!userID || !skills || skills.length === 0) {
    res.status(400).send("No userID or skills provided");
  }

  skills.forEach((skillID: string) => {
    UserSkillModel.findOne(
      { userID, skillID },
      (err: Error, userSkill: UserSkill) => {
        if (err) {
          res.status(500).send(err);
        }
        if (!userSkill) {
          const newUserSkill = new UserSkillModel({ userID, skillID });
          newUserSkill.save((err: Error) => {
            if (err) {
              res.status(500).send(err);
            }
          });
        }
      }
    );
  });

  res.status(200).send(`Added skills ${skills.join(", ")} to user ${userID}`);
});

/**
 * Route for removing skills from a user.
 * @name DELETE /
 * @function
 * @alias module:Routes/userSkillsRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} Success message or Error
 */
userSkillRoutes.delete("/", (req: Request, res: Response): void => {
  const { userID, skills } = req.body;

  if (!userID || !skills || skills.length === 0) {
    res.status(400).send("No userID or skills provided");
  }

  skills.forEach((skillID: string) => {
    UserSkillModel.findOneAndDelete({ userID, skillID }, (err: Error) => {
      if (err) {
        res.status(500).send(err);
      }
    });
  });

  res
    .status(200)
    .send(`Removed skills ${skills.join(", ")} from user ${userID}`);
});

export default userSkillRoutes;
