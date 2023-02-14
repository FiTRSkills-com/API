import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import SkillModel from "../Models/Skill";
import JobModel from "../Models/Job";

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
skillRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  try {
    const skills = await SkillModel.find({}, { __v: 0 }).exec();

    if (!skills) return res.status(200).send("No skills exist");
    return res.status(200).send(skills);
  } catch (err) {
    return res.status(500).send(err);
  }
});

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

/**
 * Route for getting a list of in-demand skills
 * @name GET /in-demand-skills
 * @function
 * @alias module:Routes/skillRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
skillRoutes.get(
  "/in-demand-skills",
  async (req: Request, res: Response): Promise<any> => {
    const { page = 1, limit = 10, candidate, radius } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    try {
      const jobs = await JobModel.find({
        "location.geoCoordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [
                candidate.location.geoCoordinates.longitude,
                candidate.location.geoCoordinates.latitude,
              ],
            },
            $maxDistance: radius,
          },
        },
      })
        .populate("jobSkills.skill", "skill")
        .select("jobSkills")
        .exec();

      const skillCounts = {};
      for (const job of jobs) {
        for (const jobSkill of job.jobSkills) {
          const { skill, priority } = jobSkill;
          const skillName = skill.skill;
          if (!skillCounts[skillName]) {
            skillCounts[skillName] = { count: 0, prioritySum: 0 };
          }
          skillCounts[skillName].count += 1;
          skillCounts[skillName].prioritySum += priority;
        }
      }

      const sortedSkills = Object.entries(skillCounts).sort(
        (a, b) => b[1].count - a[1].count || b[1].prioritySum - a[1].prioritySum
      );

      const paginatedSkills = sortedSkills.slice(
        (options.page - 1) * options.limit,
        options.page * options.limit
      );

      const result = paginatedSkills.map(([skill, { count, prioritySum }]) => ({
        skill,
        count,
        prioritySum,
      }));

      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).send(err);
    }

    describe("Skill Routes", () => {
      describe("GET /in-demand-skills - Get all in demand skills", () => {
        UnauthorizedReq({ applicationUrl: baseURL });

        test("Valid request", async () => {
          const res = await request(app)
            .get(`${baseURL}/in-demand-skills`)
            .set("Authorization", bearerToken)
            .query({
              candidate: "60e7f03ccaa63f1b82e9d2a2",
              radius: 10,
              limit: 10,
              page: 1,
            });

          expect(res.statusCode).toBe(200);
          expect(res.type).toEqual("application/json");
          expect(res.body).toHaveLength(10);
          expect(res.body[0]).toHaveProperty("skill");
          expect(res.body[0]).toHaveProperty("count");
          expect(res.body[0]).toHaveProperty("priority");
        });
      });
    });
  }
);

export default skillRoutes;
