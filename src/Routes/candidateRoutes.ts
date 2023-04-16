import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";
import log from "../utils/log"; // Import the logger

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import CandidateModel, { Candidate } from "../Models/Candidate";

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
  log.info(`GET user request received for candidate: ${req.candidate._id}`); // Log the request

  try {
    const candidate = await CandidateModel.findOne(
      { _id: req.candidate._id },
      { __v: 0 }
    )
      .populate({ path: "skills" })
      .exec();

    if (!candidate) {
      log.warn(`No user found with ID: ${req.candidate._id}`); // Log the warning
      return res.status(200).send("No user found with that ID");
    }

    log.info(`Candidate found: ${req.candidate._id}`); // Log the successful retrieval
    return res.status(200).send(candidate);
  } catch (err) {
    log.error(`Error retrieving candidate: ${err}`); // Log the error
    return res.status(500).send(err);
  }
});

candidateRoutes.patch("/patchProfile", (req: Request, res: Response): any => {
  let { candidate } = req.body;
  let candidateObj: Candidate = JSON.parse(candidate);

  log.info(
    `PATCH profile request received for candidate: ${req.candidate._id}`
  ); // Log the request

  if (candidateObj === undefined) {
    log.warn("No candidate provided"); // Log the warning
    return res.status(400).send("No candidate provided");
  }

  return CandidateModel.updateOne(
    { _id: req.candidate._id },
    {
      $set: {
        location: candidateObj.location,
        matchThreshold: candidateObj.matchThreshold,
        profile: candidateObj.profile,
        bio: candidateObj.bio,
      },
    },
    (err: CallbackError): any => {
      if (err) {
        log.error(`Error updating candidate: ${err}`); // Log the error
        return res.status(500).send(err);
      }

      log.info(`Candidate updated successfully: ${req.candidate._id}`); // Log the successful update
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
candidateRoutes.patch("/patchSkills", (req: Request, res: Response): any => {
  const { skills } = req.body;
  log.info(`PATCH skills request received for candidate: ${req.candidate._id}`); // Log the request

  if (!skills) {
    log.warn("No skills provided"); // Log the warning
    return res.status(400).send("No skills provided");
  }

  return CandidateModel.updateOne(
    { _id: req.candidate._id },
    { $set: { skills } },
    (err: CallbackError): any => {
      if (err) {
        log.error(`Error updating user's skills: ${err}`); // Log the error
        return res.status(500).send(err);
      }
      log.info(`User's skills updated successfully: ${req.candidate._id}`); // Log the successful update
      return res.status(200).send("User updated successfully");
    }
  );
});

export default candidateRoutes;
