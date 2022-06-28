import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Models
import UserModel from "../Models/User";

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
): void => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token || header.split(" ")[0] !== "Bearer") {
    res.status(401).send("Not authorized");
    return;
  }

  // Verify token in the database
  UserModel.findOne({ accessToken: token }, (err: Error, user: any): void => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (!user) {
      res.status(401).send("Not authorized");
      return;
    }

    // Verify token in the request and check that decoded user is same as user in database
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      (err: Error | null, decoded: any): void => {
        if (err) {
          res.status(500).send(err);
          return;
        }

        if (decoded.user.userID !== user.userID) {
          res.status(401).send("Not authorized");
          return;
        }

        // Set user in request
        req.userID = user.userID;
        req.user = user;
        next();
      }
    );
  });
};
