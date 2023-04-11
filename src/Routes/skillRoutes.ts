import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import SkillModel from "../Models/Skill";
import JobModel from "../Models/Job";
import Skill from "../Types/Skills";
import { JobSkill } from "../Models/Job";

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

skillRoutes.get(
  "/in-demand-skills",
  async (req: Request, res: Response): Promise<any> => {
    const location = req.query.location as string;
    const radius = parseFloat(req.query.radius as string) || 10;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    if (!location || !radius || !page || !limit) {
      return res.status(400).send("Missing required parameters");
    }

    try {
      // Fetch job postings within the specified location and radius
      const jobPostings = await JobModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: JSON.parse(location),
            },
            distanceField: "dist.calculated",
            maxDistance: radius * 1000,
            spherical: true,
          },
        },
      ]).exec();

      // Calculate the in-demand skills from the job postings
      const skillCounts: { [key: string]: number } = {};
      jobPostings.forEach((job: any) => {
        job.skills.forEach((skill: string) => {
          if (skillCounts[skill]) {
            skillCounts[skill]++;
          } else {
            skillCounts[skill] = 1;
          }
        });
      });

      // Fetch full skill objects
      const skillObjects: { [key: string]: any } = {};
      for (const skillId in skillCounts) {
        const skill = await SkillModel.findById(skillId).exec();
        if (skill) {
          skillObjects[skillId] = skill.toObject();
          skillObjects[skillId].count = skillCounts[skillId];
        }
      }

      // Sort skills by count and priority
      const sortedSkills = Object.values(skillObjects).sort(
        (a: any, b: any) => b.count * b.priority - a.count * a.priority
      );

      // Apply pagination
      const paginatedSkills = sortedSkills.slice(
        (page - 1) * limit,
        page * limit
      );

      return res.status(200).json(paginatedSkills);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }
  }
);

export default skillRoutes;
