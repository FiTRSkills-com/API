import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import ApplicationModel from "../Models/Application";
import UserModel from "../Models/User";

// Types
// import { JobDocument } from "../Types/JobDocument";
// import { SkillDocument } from "../Types/SkillDocument";

// Instantiate the router
const applicationRoutes = Router();

// Use Middleware
applicationRoutes.use(verifyToken);

/**
 * Route for getting all applications.
 * @name GET /
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing all applications || Error
 */
applicationRoutes.get("/", (_: Request, res: Response): any => {
  ApplicationModel.find({}, { __v: 0 })
    .populate({ path: "job", select: "_id title type location" })
    .populate({ path: "user", select: "-_id userID" })
    .exec((err: CallbackError, applications: any[]): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send(applications);
    })
});

/**
 * Route for getting a user's applictions
 * @name GET /user/:id
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {any}
 */
applicationRoutes.get('/user/:id', (req: Request, res: Response): any => {
  const { id } = req.params

  UserModel.findOne({ userID: id }, { __v: 0 })
    .exec((err: CallbackError, user: any): any => {
      if (err) {
        return res.status(500).send(err);
      }

      if (!user) {
        return res.status(400).send("User not found");
      }

      ApplicationModel.find({ user: user._id }, { __v: 0 })
        .populate({ path: "job", select: "_id title type location" })
        .populate({ path: "user", select: "-_id userID" })
        .exec((err: CallbackError, applications: any[]): any => {
          if (err) {
            return res.status(500).send(err);
          }

          return res.status(200).send(applications);
        })
    })
})

/**
 * Route for applying to a job
 * @name POST /
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {any}
 */
applicationRoutes.post("/", (req: Request, res: Response): any => {
  const { jobID } = req.body;
  const { _id: userID } = req.user;

  ApplicationModel.findOne({
    job: jobID,
    user: userID,
  }, (err: CallbackError, application: any): any => {
    if (err) {
      return res.status(500).send(err);
    }

    if (application) {
      return res.status(400).send("Application for user for this job exists");
    } else {
      const newApplication = new ApplicationModel({
        job: jobID,
        user: userID,
        status: "Applied",
      });

      newApplication.save((err: CallbackError): any => {
        if (err) {
          return res.status(500).send(err);
        }

        return res.status(200).send("Application created");
      })
    }
  })
})

/**
 * Route for updating an application by id
 * @name PATCH :/id
 * @function
 * @alias module:Routes/applicationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
applicationRoutes.patch('/:id', (req: Request, res: Response): any => {
  const { id } = req.params;
  const { status, timeslots } = req.body;

  if (!status || !timeslots) {
    return res.status(400).send("Missing required fields");
  }

  ApplicationModel.findOneAndUpdate({ _id: id }, { $set: { status, interviewTimeSlots: timeslots } },
    (err: Error): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Interview Updated")
    }
  )
})

export default applicationRoutes;
