import { Request, Response, NextFunction } from "express";
import log from "../utils/log";

/**
 * Simple middleware function for logging request routes
 * @param {Request} req Express Request
 * @param {Response} _ Expess Response
 * @param {NextFunction} next Express NextFunction
 */
const loggerMiddleware = (req: Request, _: Response, next: NextFunction) => {
  log.info(`[${req.method}] ${req.url}`);
  next();
};

export default loggerMiddleware;
