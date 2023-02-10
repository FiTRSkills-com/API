require("dotenv").config();
import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Routes
import {
  skillRoutes,
  cAuthRoutes,
  jobRoutes,
  companyRoutes,
  interviewRoutes,
  matchRoutes,
  candidateRoutes,
  employerRoutes,
  eAuthRoutes,
  eJobRoutes,
} from "../Routes/Routes";

// Middleware
import loggerMiddleware from "../Middleware/Logging";

const makeServer = (): Express => {
  // Create Express App
  const app = express();

  // Use Middleware if not testing
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "dev") {
    app.use(loggerMiddleware);
  }

  // Use cors, and parse JSON
  app.use(cors());
  app.use(bodyParser.json());

  // Setup Routes

  app.use("/api/v1/candidate", candidateRoutes);

  app.use("/api/v1/skills", skillRoutes);
  app.use("/api/v1/job", jobRoutes);
  app.use("/api/v1/company", companyRoutes);
  app.use("/api/v1/interview", interviewRoutes);
  app.use("/api/v1/match", matchRoutes);
  app.use("/api/v1/employer", employerRoutes);

  app.use("/api/v1/c/auth", cAuthRoutes);

  app.use("/api/v1/e/auth", eAuthRoutes);
  app.use("/api/v1/e/job", eJobRoutes);

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
