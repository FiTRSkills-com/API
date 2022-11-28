import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

import log from "../utils/log";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import CandidateModel from "../Models/Candidate";
import { profile } from "console";

// Instantiate the router
const candidateRoutes = Router();

// Use Middleware
candidateRoutes.use(verifyToken);

/**
 * Route for getting a user.
 * @name GET /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
candidateRoutes.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const candidate = await CandidateModel.findOne(
      { _id: req.candidate._id },
      { __v: 0 }
    )
      .populate({ path: "skills" })
      .exec();

    if (!candidate) return res.status(200).send("No user found with that ID");
    return res.status(200).send(candidate);
  } catch (err) {
    return res.status(500).send(err);
  }
});

candidateRoutes.patch("/patchProfile", (req: Request, res: Response): any => {
  const { candidate } = req.body;
  console.log(candidate);

  if (candidate === undefined) {
    return res.status(400).send("No candidate provided");
  }

  return CandidateModel.updateOne(
    { _id: req.candidate._id },
    {
      $set: {
        location: candidate.location,
        matchThreshold: candidate.matchThreshold,
        profile: candidate.profile,
        bio: candidate.bio,
      },
    },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Candidate updated successfully");
    }
  );
});

/**
 * Route for updating a user's skills.
 * @name PATCH /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
candidateRoutes.patch("/", (req: Request, res: Response): any => {
  const { skills, bio } = req.body;

  if (!skills && bio === undefined) {
    return res.status(400).send("No skills provided");
  }

  return CandidateModel.updateOne(
    { _id: req.candidate._id },
    { $set: { skills, bio } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("User updated successfully");
    }
  );
});

export default candidateRoutes;
