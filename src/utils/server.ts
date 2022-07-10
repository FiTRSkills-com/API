require("dotenv").config();
import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Routes
import {
  skillRoutes,
  authRoutes,
  userRoutes,
  jobRoutes,
  companyRoutes,
  interviewRoutes,
  applicationRoutes,
} from "../Routes/Routes";

import log from "./log";

const makeServer = (): Express => {
  // Create Express App
  const app = express();

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

  // Use Middleware if not testing
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "dev") {
    app.use(loggerMiddleware);
  }

  // Use cors, and parse JSON
  app.use(cors());
  app.use(bodyParser.json());

  // Setup Routes
  app.use("/api/v1/skills", skillRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/job", jobRoutes);
  app.use("/api/v1/company", companyRoutes);
  app.use("/api/v1/interview", interviewRoutes);
  app.use("/api/v1/application", applicationRoutes);

  // Hello World
  app.get("/", (_: Request, res: Response) => {
    res.status(200).send("Hello World!");
  });

  app.get("/api/v1", (_: Request, res: Response) => {
    res.status(200).send({
      status: "Connected",
      message: "This is a base url, not an actual API route",
    });
  });

  return app;
};

export default makeServer;
