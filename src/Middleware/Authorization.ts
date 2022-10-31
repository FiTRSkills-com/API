import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Models
import CandidateModel from "../Models/Candidate";

/**
 * Middleware function for checking if user is authorized
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @param {NextFunction} next - Express NextFunction
 * @returns {void}
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token || header.split(" ")[0] !== "Bearer") {
    res.status(401).send("Not authorized");
    return;
  }

  // Verify token in the database
  CandidateModel.findOne(
    { accessToken: token },
    (err: Error, user: any): any => {
      if (err) {
        return res.status(500).send(err);
      }

      if (!user) {
        return res.status(401).send("Not authorized");
      }

      // Verify token in the request and check that decoded user is same as user in database
      jwt.verify(
        token,
        process.env.JWT_SECRET!,
        (err: Error | null, decoded: any): any => {
          if (err) {
            res.status(500).send(err);
            return;
          }

          if (decoded.user.userID !== user.userID) {
            return res.status(401).send("Not authorized");
          }

          // Set user in request
          req.userID = user.userID;
          req.user = user;
          next();
        }
      );
    }
  );
};
