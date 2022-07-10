import axios from "axios";
import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";
import twilio from "twilio";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Types
import type { VideoInterview } from "../Types/VideoInterview";

// Models
import InterviewModel from "../Models/Interview";
import ApplicationModel from "../Models/Application";
import CompanyModel from "../Models/Company";

// Instantiate the Router
const interviewRoutes = Router();

// Use Middleware
interviewRoutes.use(verifyToken);

// Setup Twilio Client
const { ACCOUNT_SID, AUTH_TOKEN, API_KEY, API_SECRET } = process.env;
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

/**
 * Route for getting an interview's details
 * @name GET /:id
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
interviewRoutes.get(
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      // Get Interview
      const interview = await InterviewModel.findOne({ applicationID: id })
        .populate({ path: "applicationID" })
        .exec();

      if (!interview)
        return res.status(200).send("No interview found with that ID");

      // Get Application
      const application = await ApplicationModel.findById(
        interview.applicationID
      )
        .populate({ path: "job" })
        .exec();

      // Get Company
      const company = await CompanyModel.findById(
        application.job.company
      ).exec();

      // Format Response
      return res.status(200).send({
        Interview: interview.interviewDate,
        Job: {
          title: application.job.title,
          description: application.job.description,
        },
        Company: {
          name: company.name,
          logo: company.logo,
        },
      });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for creating an interview
 * @name POST /:id
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
interviewRoutes.post(
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { interviewDate } = req.body;

    if (!interviewDate || !isValidDate(interviewDate)) {
      return res.status(400).send("Missing required fields");
    }

    try {
      const interview = await InterviewModel.findOne({
        applicationID: id,
      }).exec();

      if (interview)
        return res.status(200).send("Interview already exists with that ID");

      const application = await ApplicationModel.findOne(
        { _id: id },
        { __v: 0 }
      )
        .populate({ path: "job" })
        .exec();

      if (!application)
        return res.status(200).send("No job applicaiton exists for ID");
      if (application.status !== "Accepted")
        return res
          .status(200)
          .send("Cannot create interview for this job posting");

      const newInterview = new InterviewModel({
        applicationID: id,
        interviewDate,
      });

      await newInterview.save();

      // Update Application
      application.interviewTimeSlots = [];
      application.status = "Interview Scheduled";
      await application.save();

      return res.status(201).send("Interview Created");
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for creating an interview rooms
 * @name GET /join/:id
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
interviewRoutes.get(
  "/join/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
      // Verify Interview ID exists
      const interview = await InterviewModel.findOne({
        applicationID: id,
      }).exec();
      if (!interview) return res.status(200).send("Interview not found for ID");

      // Verify user is allowed to access interview
      const application = await ApplicationModel.findById(
        interview.applicationID
      )
        .populate({ path: "user" })
        .exec();
      if (!application || application.user.userID !== req.userID)
        return res
          .status(403)
          .send("User not authorized to access this interview");

      // Create Interview Room
      return client.video.rooms
        .create({
          type: "go",
          uniqueName: interview._id,
        })
        .then((room: any) => res.status(200).send({ id: room.sid }))
        .catch((err: any) => res.status(500).send(err));
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for joining an interview room
 * @name GET /join/:sid/:username
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
interviewRoutes.get(
  "join/:sid/:username",
  async (req: Request, res: Response): Promise<any> => {
    const { sid, username } = req.params;

    let uniqueName;

    await axios
      .get<VideoInterview>(`https://video.twilio.com/v1/Rooms/${sid}`, {
        auth: {
          username: ACCOUNT_SID!,
          password: AUTH_TOKEN!,
        },
      })
      .then((response) => (uniqueName = response.data.unique_name))
      .catch((err) => {
        return res.status(500).send(err);
      });

    if (!uniqueName) {
      return res.status(500).send("Interview does not exist");
    }

    const videoGrant = new VideoGrant({
      room: uniqueName,
    });

    const token = new AccessToken(ACCOUNT_SID!, API_KEY!, API_SECRET!, {
      identity: username,
    });

    token.addGrant(videoGrant);

    return res.status(200).send({
      token: token.toJwt(),
    });
  }
);

/**
 * Route for deleting an interview room
 * @name DELETE /:id
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
interviewRoutes.delete("/:id", (req: Request, res: Response): any => {
  const { id } = req.params;

  return InterviewModel.findOneAndDelete(
    { _id: id },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Interview room deleted successfully");
    }
  );
});

/**
 * Helper function to check if date string is valid
 *
 * @param {string} dateString Date String
 * @return {boolean} True if valid, false otherwise
 */
const isValidDate = (dateString: string): boolean => {
  const date = Date.parse(dateString);

  return isNaN(date) ? false : true;
};

export default interviewRoutes;
