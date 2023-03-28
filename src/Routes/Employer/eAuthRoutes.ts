import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { CallbackError } from "mongoose";

// Types
import { EmployerDocument } from "../../Types/EmployerDocument";

// Models
import EmployerModel from "../../Models/Employer";
import log from "../../utils/log";

// Instantiate the router
const eAuthRoutes = Router();

/**
 * Route for logging in a Employer.
 * Will create a new candidate if they don't exist.
 * Will return the candidate object if they do.
 * @name POST /login
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
eAuthRoutes.post(
  "/login",
  async (req: Request, res: Response): Promise<any> => {
    const { authID } = req.body;

    try {
      if (!authID) {
        return res.status(400).send("Request not formatted correctly");
      }

      const employer = await EmployerModel.findOne({ authID: authID }).exec();

      if (employer) {
        if (employer.accessToken) {
          log.info(employer.accessToken);
          return res.status(200).send(employer);
        } else {
          updateAccessToken(employer, generateAccessToken(employer), res);
        }
      } else {
        const newEmployer = await new EmployerModel({
          authID: authID,
          dateCreated: Date.now(),
        });

        await newEmployer.save();
        updateAccessToken(newEmployer, generateAccessToken(newEmployer), res);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
);

/**
 * Route for logging out a Employer.
 * @name DELETE /logout
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
eAuthRoutes.delete("/logout", (req: Request, res: Response): any => {
  const { authID } = req.body;

  if (!authID) {
    return res.status(400).send("Request not formatted correctly");
  }

  return EmployerModel.updateOne(
    { authID: authID },
    { $set: { accessToken: "" } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("Logged out");
    }
  );
});

/**
 * Helper function for generating access tokens
 * @param {EmployerDocument} Employer The employer to generate a token for
 * @return {string} Access token
 */
const generateAccessToken = (employer: EmployerDocument): string => {
  return jwt.sign({ employer }, process.env.JWT_SECRET!);
};

/**
 * Helper function for updating a employer's access token
 *
 * @param {EmployerDocument} employer The employer that needs the token updated
 * @param {string} token The current token that is replacing the old token
 * @param {Response} res The express Response
 * @return {any} An express response type
 */
const updateAccessToken = (
  employer: EmployerDocument,
  token: string,
  res: Response
): any => {
  return EmployerModel.findByIdAndUpdate(
    employer._id,
    { $set: { accessToken: token } },
    (err: CallbackError, employerObject: EmployerDocument): any => {
      if (err) {
        return res.status(500).send(err);
      } else {
        employerObject.accessToken = token;
        log.info(token);
        return res.status(200).send(employerObject);
      }
    }
  );
};

export default eAuthRoutes;
