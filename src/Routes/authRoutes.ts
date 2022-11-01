import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CallbackError } from "mongoose";

// Types
import { CandidateDocument } from "../Types/CandidateDocument";

// Models
import CandidateModel from "../Models/Candidate";

// Instantiate the router
const authRoutes = Router();

/**
 * Route for logging in a candidate.
 * Will create a new candidate if they don't exist.
 * Will return the candidate object if they do.
 * @name POST /login
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
authRoutes.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Request not formatted correctly");
    }

    const candidate = await CandidateModel.findOne({ candidateID: id }).exec();

    if (candidate) {
      if (candidate.accessToken) {
        return res.status(200).send(candidate);
      } else {
        updateAccessToken(candidate, generateAccessToken(candidate), res);
      }
    } else {
      const newCandidate = await new CandidateModel({
        candidateID: id,
        dateCreated: Date.now(),
      });

      await newCandidate.save();
      updateAccessToken(newCandidate, generateAccessToken(newCandidate), res);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for logging out a candidate.
 * @name DELETE /logout
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
authRoutes.delete("/logout", (req: Request, res: Response): any => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send("Request not formatted correctly");
  }

  return CandidateModel.updateOne(
    { candidateID: id },
    { $set: { accessToken: "" } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Logged out");
    }
  );
});

/**
 * Helper function for generating access tokens
 * @param {CandidateDocument} candidate The candidate to generate a token for
 * @return {string} Access token
 */
const generateAccessToken = (candidate: CandidateDocument): string => {
  return jwt.sign({ candidate }, process.env.JWT_SECRET!);
};

/**
 * Helper function for updating a candidate's access token
 *
 * @param {CandidateDocument} candidate The candidate that needs the token updated
 * @param {string} token The current token that is replacing the old token
 * @param {Response} res The express Response
 * @return {any} An express response type
 */
const updateAccessToken = (
  candidate: CandidateDocument,
  token: string,
  res: Response
): any => {
  return CandidateModel.findByIdAndUpdate(
    candidate._id,
    { $set: { accessToken: token } },
    (err: CallbackError, candidateObject: CandidateDocument): any => {
      if (err) {
        return res.status(500).send(err);
      } else {
        candidateObject.accessToken = token;
        return res.status(200).send(candidateObject);
      }
    }
  );
};

export default authRoutes;
