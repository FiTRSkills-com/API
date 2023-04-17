import { Router, Request, Response } from "express";

import JobModel from "../../Models/Job";
import MatchModel, { Match } from "../../Models/Match";
import log from "../../utils/log";

const eInterviewRoutes = Router();

eInterviewRoutes.get(
  "/jobs/:employerID",
  async (req: Request, res: Response): Promise<any> => {
    const { employerID } = req.params;

    try {
      const jobs = await JobModel.find({ employer: employerID })
        .populate({
          path: "matches",
          populate: [{ path: "interview" }, { path: "candidate" }],
        })
        .sort({ updatedAt: -1 })
        .exec();

      if (!jobs) return res.status(200).send("No Jobs Exist.");

      jobs.forEach((job) => {
        job.matches.sort((a: any, b: any) => {
          if (!a.interview && !b.interview) {
            return 0;
          } else if (a.interview && !b.interview) {
            return -1;
          } else if (!a.interview && b.interview) {
            return 1;
          }
          const dateA = new Date(a.interview.interviewDate);
          const dateB = new Date(b.interview.interviewDate);

          let currentDate = new Date();

          // Subtract 20 minutes from the current date and time
          currentDate.setMinutes(currentDate.getMinutes() - 20);
          if (
            dateA.valueOf() >= currentDate.valueOf() &&
            dateB.valueOf() >= currentDate.valueOf()
          ) {
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return 0;
          } else if (
            dateA.valueOf() < currentDate.valueOf() &&
            dateB.valueOf() >= currentDate.valueOf()
          ) {
            return 1;
          } else if (
            dateA.valueOf() >= currentDate.valueOf() &&
            dateB.valueOf() < currentDate.valueOf()
          ) {
            return -1;
          } else {
            if (dateA < dateB) return 1;
            if (dateA > dateB) return -1;
            return 0;
          }
        });
      });

      return res.status(200).send(jobs);
    } catch (err) {
      log.error(err);
      return res.status(500).send(err);
    }
  }
);

eInterviewRoutes.get(
  "/home/:employerID",
  async (req: Request, res: Response): Promise<any> => {
    const { employerID } = req.params;
    try {
      const jobs = await JobModel.find({ employer: employerID }).exec();

      const matchIDs = jobs.flatMap((job) => job._id);

      const matches = await MatchModel.find({
        job: { $in: matchIDs },
        interview: { $exists: true },
      })
        .populate([
          { path: "interview" },
          { path: "candidate" },
          { path: "job" },
        ])
        .sort({ "interview.date": -1 })
        .limit(3);

      if (!matches) return res.status(200).send("No Interviews Exist.");
      return res.status(200).send(matches);
    } catch (err) {
      log.error(err);
      return res.status(500).send(err);
    }
  }
);

export default eInterviewRoutes;
