import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import log from "../../utils/log";

// Middleware
import { verifyToken } from "../../Middleware/Authorization";

// Models
import CandidateModel, { Candidate } from "../../Models/Candidate";

// Instantiate the router
const eCandidateRoutes = Router();

// Use Middleware
eCandidateRoutes.use(verifyToken);

/**
 * Route for getting candidates interested in a job of given id
 * @name GET /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
eCandidateRoutes.get(
  "/:jobId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const candidates = await CandidateModel.aggregate([
        {
          $lookup: {
            from: "matches",
            localField: "matches",
            foreignField: "_id",
            as: "matches",
          },
        },
        {
          $unwind: {
            path: "$matches",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.matchStatus",
            foreignField: "_id",
            as: "matches.matchStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.matchStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "status",
            localField: "matches.candidateStatus",
            foreignField: "_id",
            as: "matches.candidateStatus",
          },
        },
        {
          $unwind: {
            path: "$matches.candidateStatus",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    "$matches.job",
                    new mongoose.Types.ObjectId("63eaa83e358168988e342296"),
                  ],
                },
                {
                  $eq: ["$matches.matchStatus.matchStatus", "Pre Match"],
                },
                {
                  $eq: ["$matches.candidateStatus.generalStatus", "Interested"],
                },
              ],
            },
          },
        },
      ]);

      if (!candidates)
        return res
          .status(200)
          .send("No interesed candidates found for this jobId");
      return res.status(200).send(candidates);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

export default eCandidateRoutes;
