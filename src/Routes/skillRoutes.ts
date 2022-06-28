import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Types
import type Skill from "../Types/Skills";

// Models
import SkillModel from "../Models/Skill";

// Instantiate the router
const skillRoutes = Router();

// Use Middleware
skillRoutes.use(verifyToken);

/**
 * Route for getting all skills
 * @name GET /
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} _ - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} JSON object containing all skills || Error
 */
skillRoutes.get("/", (_: Request, res: Response): void => {
  SkillModel.find({}, { __v: 0 }, (err: Error, skills: Skill[]): void => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).send(skills);
  });
});

/**
 * Route for getting a single skill by name
 * @name GET /:name
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} JSON object containing the skill || Error
 */
skillRoutes.get("/:name", (req: Request, res: Response): void => {
  const { name } = req.params;

  SkillModel.findOne(
    { Skill: new RegExp("^" + name + "$", "i") },
    { __v: 0 },
    (err: Error, skill: Skill): void => {
      if (err) {
        res.status(500).send(err);
      }
      res.status(200).send(skill);
    }
  );
});

/**
 * Route for creating new skill.
 * @name POST /
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} JSON object containing success or error message || Error
 */
skillRoutes.post("/", (req: Request, res: Response): void => {
  const skill = new SkillModel(req.body);

  SkillModel.find(
    { Skill: skill.Skill },
    (err: Error, skills: Skill[]): void => {
      if (err) {
        res.status(500).send(err);
      }
      if (skills.length > 0) {
        res.status(400).json({
          message: "Skill already exists",
        });
      } else {
        skill.save((err: Error): void => {
          if (err) {
            res.status(500).send(err);
          }
          res.status(201).json({
            message: "Skill successfully created",
          });
        });
      }
    }
  );
});

export default skillRoutes;
