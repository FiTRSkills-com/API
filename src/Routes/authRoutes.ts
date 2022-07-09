import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CallbackError } from "mongoose";

// Types
import { UserDocument } from "../Types/UserDocument";

// Models
import UserModel from "../Models/User";

// Instantiate the router
const authRoutes = Router();

/**
 * Route for logging in a user.
 * Will create a new user if they don't exist.
 * Will return the user object if they do.
 * @name POST /login
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
authRoutes.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Request not formatted correctly");
    }

    const user = await UserModel.findOne({ userID: id }).exec();

    if (user) {
      if (user.accessToken) {
        return res.status(200).send(user);
      } else {
        updateAccessToken(user, generateAccessToken(user), res);
      }
    } else {
      const newUser = await new UserModel({
        userID: id,
      });

      await newUser.save();
      updateAccessToken(newUser, generateAccessToken(newUser), res);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for logging out a user.
 * @name DELETE /logout
 * @function
 * @alias module:Routes/authRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
authRoutes.delete("/logout", (req: Request, res: Response): any => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send("Request not formatted correctly");
  }

  return UserModel.updateOne(
    { userID: id },
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
 * @param {UserDocument} user The user to generate a token for
 * @return {string} Access token
 */
const generateAccessToken = (user: UserDocument): string => {
  return jwt.sign({ user }, process.env.JWT_SECRET!);
};

/**
 * Helper function for updating a user's access token
 *
 * @param {UserDocument} user The user that needs the token updated
 * @param {string} token The current token that is replacing the old token
 * @param {Response} res The express Response
 * @return {any} An express response type
 */
const updateAccessToken = (
  user: UserDocument,
  token: string,
  res: Response
): any => {
  return UserModel.findByIdAndUpdate(
    user._id,
    { $set: { accessToken: token } },
    (err: CallbackError, userObject: UserDocument): any => {
      if (err) {
        return res.status(500).send(err);
      } else {
        userObject.accessToken = token;
        return res.status(200).send(userObject);
      }
    }
  );
};

export default authRoutes;
