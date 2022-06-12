import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
  const token = req.headers["authorization"];

  if (
    !token ||
    token.split(" ")[0] !== "Bearer" ||
    token.split(" ")[1] === undefined
  ) {
    res.status(401).send("Not authorized");
    return;
  }

  jwt.verify(
    token.split(" ")[1],
    process.env.JWT_SECRET!,
    (err: Error | null, decoded: any): void => {
      if (err) {
        res.status(403).send("Invalid token");
        return;
      }

      req.userID = decoded.user.userID;
      req.user = decoded.user;
      next();
    }
  );
};
