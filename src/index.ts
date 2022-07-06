require("dotenv").config();
import { createServer } from "https";
import { readFileSync } from 'fs';
import express, { NextFunction, Request, Response } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import bodyParser from "body-parser";

// Routes
import {
  skillRoutes,
  authRoutes,
  userRoutes,
  jobRoutes,
  companyRoutes,
  interviewRoutes,
  applicationRoutes
} from "./Routes/Routes";

// Import Logging
import log from "./utils/log";

// Create Express App
const app = express();

// Setup MongoDB
mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions
  )
  .then(() => {
    log.info("MongoDB Connected");
  })
  .catch((err: Error) => {
    log.error(err.message);
  });

// Setup Middleware

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

// Use Middleware and parse JSON
app.use(loggerMiddleware);
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

app.get('/api/v1', (_: Request, res: Response) => {
  res.status(200).send({
    'status': 'Connected',
    'message': 'This is a base url, not an actual API route'
  })
})

const server = createServer(
  {
    key: readFileSync('/etc/letsencrypt/live/fitrskills.wolfyy.me/privkey.pem'),
    cert: readFileSync('/etc/letsencrypt/live/fitrskills.wolfyy.me/fullchain.pem')
  },
  app
);

const port = process.env.PORT || 3005;

// Start Server and Log Port
server.listen(port, () => {
  log.info(`Server listening on port ${port}`);
});
