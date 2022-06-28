import axios from "axios";
import { Router, Request, Response } from "express";
import twilio from "twilio";
import AccessToken, { VideoGrant } from "twilio/lib/jwt/AccessToken";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Types
import type { VideoInterview } from "../Types/VideoInterview";

// Instantiate the Router
const interviewRoutes = Router();

// Use Middleware
// interviewRoutes.use(verifyToken);

// Setup Twilio Client
const { ACCOUNT_SID, AUTH_TOKEN, API_KEY, API_SECRET } = process.env;
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

/**
 * Route for creating an interview rooms
 * @name GET /:id
 * @function
 * @alias module:Routes/interviewRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {string || Error} - Room SID || Error Message
 */
interviewRoutes.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;

  // TODO: Verify Interview ID exists
  // TODO: Verify user is allowed to access interview
  // TODO: Get interview details from database

  client.video.rooms
    .create({
      type: "go",
      uniqueName: (Math.random() + 1).toString(36).substring(2), // Name from interview details database entry,
    })
    .then((room: any) => res.status(200).send({ id: room.sid }))
    .catch((err: any) => res.status(500).send(err));
});

interviewRoutes.get(
  "/:sid/:username",
  async (req: Request, res: Response): Promise<void> => {
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
      .catch(() => null);

    if (!uniqueName) {
      res.status(500).send("Interview does not exist");
      return;
    }

    const videoGrant = new VideoGrant({
      room: uniqueName,
    });

    const token = new AccessToken(ACCOUNT_SID!, API_KEY!, API_SECRET!, {
      identity: username,
    });

    token.addGrant(videoGrant);

    res.status(200).send({
      token: token.toJwt(),
    });
  }
);

export default interviewRoutes;
