import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import ApplicationModel from "../Models/Application";
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
    const applications = await ApplicationModel.find({}, { __v: 0 })
      .populate({ path: "job", select: "_id title type location" })
      .populate({ path: "user", select: "-_id userID" })
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
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      const application = await ApplicationModel.findById(id, { __v: 0 })
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
    const { _id: userID } = req.user;

    try {
      const applications = await ApplicationModel.find(
        { user: userID },
        { __v: 0 }
      )
        .populate({ path: "job", select: "_id title type location" })
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
    const { _id: userID } = req.user;

    try {
      const application = await ApplicationModel.findOne({
        job: jobID,
        user: userID,
      });

      if (application)
        return res
          .status(400)
          .send("You've already applied to this job posting");

      // Check if job posting exists
      const job = await JobModel.findById(jobID).exec();
      if (!job) return res.status(400).send("Job posting does not exist");

      // Create application
      const newApplication = new ApplicationModel({
        job: jobID,
        user: userID,
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
 * @name PATCH :/id
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

  return ApplicationModel.findOneAndUpdate(
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
