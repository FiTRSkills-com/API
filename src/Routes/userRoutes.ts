import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import CandidateModel from "../Models/Candidate";

// Instantiate the router
const candidateRoutes = Router();

// Use Middleware
candidateRoutes.use(verifyToken);

/**
 * Route for getting a candidate.
 * @name GET /
 * @function
 * @alias module:Routes/candidateRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
candidateRoutes.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const candidate = await CandidateModel.findOne(
      { candidateID: req.user._id },
      { __v: 0 }
    )
      .populate({ path: "skills", select: "Skill _id" })
      .exec();

    if (!candidate)
      return res.status(200).send("No candidate found with that ID");
    return res.status(200).send(candidate);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for updating a candidate's skills.
 * @name PATCH /
 * @function
 * @alias module:Routes/candidateRoutes
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
    { candidateID: req.user._id },
    { $set: { skills, bio } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Candidate updated successfully");
    }
  );
});

export default candidateRoutes;
