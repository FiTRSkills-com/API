import { Router, Request, Response } from "express";
import { model } from "mongoose";

// Types
import type Skill from "../Types/Skills";

// Schema
import SkillSchema from "../Models/Skill";
const SkillModel = model("Skill", SkillSchema);

// Instantiate the router
const skillRoutes = Router();

/**
 * Route for getting all skills
 * @name GET /
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} _ - Express Request
 * @property {Response} res - Express Response
 * @returns {json || Error} JSON object containing all skills or Error
 */
skillRoutes.get("/", (_: Request, res: Response): void => {
  SkillModel.find({}, { __v: 0 }, (err: Error, skills: Skill[]) => {
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
 * @returns {json || Error} JSON object containing the skill or Error
 */
skillRoutes.get("/:name", (req: Request, res: Response): void => {
  const { name } = req.params;

  SkillModel.findOne(
    { Skill: new RegExp("^" + name + "$", "i") },
    { __v: 0 },
    (err: Error, skill: Skill) => {
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
 * @returns {json} JSON object containing the skill or Error with message
 */
skillRoutes.post("/", (req: Request, res: Response): void => {
  const skill = new SkillModel(req.body);

  SkillModel.find({ Skill: skill.Skill }, (err: Error, skills: Skill[]) => {
    if (err) {
      res.status(500).send(err);
    }
    if (skills.length > 0) {
      res.status(400).json({
        message: "Skill already exists",
      });
    } else {
      skill.save((err: Error) => {
        if (err) {
          res.status(500).send(err);
        }
        res.status(201).json({
          message: "Skill successfully created",
        });
      });
    }
  });
});

export default skillRoutes;
