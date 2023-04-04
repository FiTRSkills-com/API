import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

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
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
skillRoutes.get(
  "/:searchBy/:searchTerm/:page",
  async (req: Request, res: Response): Promise<any> => {
    const { searchBy, searchTerm, page } = req.params;
    const limit = 50;
    try {
      let filter;
      if (searchTerm != "nil" && searchBy == "skill") {
        filter = { skill: { $regex: searchTerm, $options: "i" }, __v: 0 };
      } else if (searchTerm != "nil" && searchBy == "category") {
        filter = { category: { $regex: searchTerm, $options: "i" }, __v: 0 };
      } else {
        filter = { __v: 0 };
      }
      const skills = await SkillModel.find(filter)
        .skip(limit * Number(page))
        .limit(limit)
        .exec();

      if (!skills) return res.status(200).send("No skills exist");
      return res.status(200).send(skills);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for getting a single skill by name
 * @name GET /:name
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
skillRoutes.get("/:name", async (req: Request, res: Response): Promise<any> => {
  const { name } = req.params;

  try {
    const skill = await SkillModel.findOne(
      { skill: new RegExp("^" + name + "$", "i") },
      { __v: 0 }
    ).exec();

    if (!skill)
      return res.status(200).send("No skill found matching that name");

    return res.status(200).send(skill);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for creating new skill.
 * @name POST /
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
skillRoutes.post("/", async (req: Request, res: Response): Promise<any> => {
  const { skill, similarSkills } = req.body;

  if (!skill || !similarSkills)
    return res.status(400).send("Missing required fields");

  try {
    const Skill = await SkillModel.findOne({ skill, similarSkills }).exec();

    if (Skill) return res.status(409).send("Skill already exists");

    const newSkill = new SkillModel({
      skill,
      similarSkills,
      dateAdded: Date.now(),
    });

    await newSkill.save();
    return res.status(201).send("Skill created");
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default skillRoutes;
