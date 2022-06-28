import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || string || Error} - Bearer Token as JSON || Error Message || Error
 */
authRoutes.post("/login", (req: Request, res: Response): void => {
  const { id } = req.body;

  if (!id) {
    res.status(400).send("Request not formatted correctly");
  }

  UserModel.findOne({ userID: id }, (err: Error, user: UserDocument): void => {
    if (err) {
      res.status(500).send(err);
    }

    if (user) {
      if (user.accessToken) {
        res.status(200).send(user);
      } else {
        updateAccessToken(user, generateAccessToken(user), res);
      }
    } else {
      const newUser = new UserModel({ userID: id });
      newUser.save((err: Error): void => {
        if (err) {
          res.status(500).send(err);
        }

        updateAccessToken(newUser, generateAccessToken(newUser), res);
      });
    }
  });
});

authRoutes.delete("/logout", (req: Request, res: Response): void => {
  const { id } = req.body;

  if (!id) {
    res.status(400).send("Request not formatted correctly");
  }

  UserModel.updateOne(
    { userID: id },
    { $set: { accessToken: "" } },
    (err: Error): void => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send("Logged out");
    }
  );
});

const generateAccessToken = (user: UserDocument): string => {
  return jwt.sign({ user }, process.env.JWT_SECRET!);
};

const updateAccessToken = (
  user: UserDocument,
  token: string,
  res: Response
): void => {
  UserModel.findByIdAndUpdate(
    user._id,
    { $set: { accessToken: token } },
    (err: Error, userObject: UserDocument): void => {
      if (err) {
        res.status(500).send(err);
      } else {
        userObject.accessToken = token;
        res.status(200).send(userObject);
      }
    }
  );
};

export default authRoutes;
