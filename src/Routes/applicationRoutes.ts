import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import MatchModel from "../Models/Match";
import JobModel from "../Models/Job";

// Instantiate the router
const applicationRoutes = Router();

// Use Middleware
applicationRoutes.use(verifyToken);

/**
 * Route for getting all applications.
 * @name GET /
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} _ Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
applicationRoutes.get("/", async (_: Request, res: Response): Promise<any> => {
  try {
    const applications = await MatchModel.find({}, { __v: 0 })
      .populate({ path: "job", select: "_id title type location" })
      .populate({ path: "candidate", select: "-_id candidateID" })
      .exec();

    if (!applications) return res.status(400).send("Failed to fetch data");

    return res.status(200).send(applications);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for getting an application by ID
 * @name GET /:id
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
applicationRoutes.get(
  "/id/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      const application = await MatchModel.findById(id, { __v: 0 })
        .populate({ path: "job", select: "_id title type location" })
        .populate({ path: "user", select: "-_id userID" })
        .exec();

      if (!application)
        return res.status(200).send("Application not found for ID");

      return res.status(200).send(application);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for getting a user's applictions
 * @name GET /user
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
applicationRoutes.get(
  "/user",
  async (req: Request, res: Response): Promise<any> => {
    const { _id: candidateID } = req.candidate;

    try {
      const applications = await MatchModel.find(
        { candidate: candidateID },
        { __v: 0 }
      )
        .populate({
          path: "job",
          select: "_id title location company",
          populate: { path: "company", select: "-jobs -__v" },
        })
        .populate({ path: "user", select: "-_id userID" })
        .exec();

      if (!applications)
        return res.status(200).send("You have no applications");

      return res.status(200).send(applications);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for applying to a job
 * @name POST /
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
applicationRoutes.post(
  "/",
  async (req: Request, res: Response): Promise<any> => {
    const { jobID } = req.body;
    const { _id: candidateID } = req.candidate;

    try {
      const application = await MatchModel.findOne({
        job: jobID,
        candidate: candidateID,
      });

      if (application)
        return res
          .status(400)
          .send("You've already applied to this job posting");

      // Check if job posting exists
      const job = await JobModel.findById(jobID).exec();
      if (!job) return res.status(400).send("Job posting does not exist");

      // Create application
      const newApplication = new MatchModel({
        job: jobID,
        candidate: candidateID,
        status: "Applied",
      });

      await newApplication.save();
      return res.status(200).send("Application created");
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for updating an application by id
 * @name PATCH /:id
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
applicationRoutes.patch("/:id", (req: Request, res: Response): any => {
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

export default applicationRoutes;
