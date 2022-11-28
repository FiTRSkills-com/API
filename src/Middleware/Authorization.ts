import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Models
import CandidateModel from "../Models/Candidate";
import EmployerModel from "../Models/Employer";

/**
 * Helper function for unauthorized request
 * @param {Response} res - Express Response
 * @returns {void};
 */
const unauthorized = (res: Response): any => {
  res.status(401).send("Not authorized");
  return;
};

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
  const bearer = header?.split(" ");
  const token = header && header.split(" ")[1];
  let id;
  let model;

  if (!bearer || bearer.length !== 4 || bearer[0] !== "Bearer") {
    return unauthorized(res);
  } else if (bearer[1] == "c") {
    model = CandidateModel; // Looks in Candidate for candidate bearer token
  } else if (bearer[1] == "e") {
    model = EmployerModel; // Looks in Employer for employer bearer token
  } else {
    return unauthorized(res);
  }

  model.findOne(
    { accessToken: bearer[2], _id: bearer[3] },
    (err: Error, user: any): any => {
      if (err) {
        return res.status(500).send(err);
      }

      if (!user) {
        return res.status(401).send("Not authorized");
      }

      jwt.verify(
        bearer[2],
        process.env.JWT_SECRET!,
        (err: Error | null, decoded: any): any => {
          if (err) {
            res.status(500).send(err);
            return;
          }

          if (decoded.candidate) {
            if (user.authID != decoded.candidate.authID) {
              return res.status(401).send("Not authorized");
            }
            req.candidate = user;
          } else {
            if (user.authID != decoded.employer.authID) {
              return res.status(401).send("Not authorized");
            }
            req.employer = user;
          }

          // Set user in request
          req.authID = user.authID;
          next();
        }
      );
    }
  );
};
