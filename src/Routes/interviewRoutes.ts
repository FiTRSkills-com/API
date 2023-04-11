import axios from "axios";
import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";
import twilio from "twilio";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";
import log from "../utils/log";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Types
import type { VideoInterview } from "../Types/VideoInterview";

// Models
import InterviewModel from "../Models/Interview";
import MatchModel from "../Models/Match";
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
      const interview = await InterviewModel.findOne({ match: id }, { __v: 0 })
        .populate({
          path: "match",
          select: "job -_id",
          populate: { path: "job", select: "title description -_id" },
        })
        .populate({
          path: "interviewDetails",
          populate: { path: "company", select: "name logo -_id" },
        })
        .exec();

      if (!interview)
        return res.status(200).send("No interview found with that ID");

      return res.status(200).send(interview);
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
      const match = await MatchModel.findOne({ _id: id })
        .populate({ path: "interview" })
        .exec();

      if (!match) {
        return res.status(200).send("No match exists with this id");
      } else if (match.interview?.id != null) {
        return res.status(200).send("Interview already requested");
      }

      const newInterview = new InterviewModel({
        match: id,
        interviewDate: interviewDate,
        twilloMeetingID: "",
      });

      await newInterview.save();

      // Update Match
      match.interview = newInterview._id;
      await match.save();

      return res.status(201).send(newInterview);
    } catch (err) {
      console.log(err);
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
      const interview = await InterviewModel.findById(id)
        .select("twilloMeetingID")
        .exec();

      if (!interview) return res.status(200).send("Interview not found for ID");

      if (interview.twilloMeetingID != "") {
        return res.status(200).send(interview.twilloMeetingID);
      }

      // Create Interview Room
      return client.video.rooms
        .create({
          emptyRoomTimeout: 5,
          maxParticipantDuration: 600,
          maxParticipants: 2,
          type: "go",
          uniqueName: Math.random().toString(36).substr(2, 11),
          unusedRoomTimeout: 5,
        })
        .then((room: any) => {
          InterviewModel.findOneAndUpdate(
            { _id: id },
            { $set: { twilloMeetingID: room.sid } },
            (err: Error): any => {
              log.info(room);
              if (err) {
                throw err;
              }

              return res.status(200).send(room.sid);
            }
          );
        });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  }
);

interviewRoutes.get(
  "/test/test/test",
  async (_: Request, res: Response): Promise<any> => {
    try {
      return client.video.rooms
        .create({
          emptyRoomTimeout: 5,
          maxParticipantDuration: 600,
          maxParticipants: 2,
          type: "go",
          uniqueName: Math.random().toString(36).substr(2, 11),
          unusedRoomTimeout: 5,
        })
        .then((room: any) => {
          return res.status(200).send({ id: room.sid, name: room.unique_name });
        });
    } catch (err) {
      log.info(err);
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
  "/join/:sid/:username",
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

    return res.status(200).send(token.toJwt());
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
