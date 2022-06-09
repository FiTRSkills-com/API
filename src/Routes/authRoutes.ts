require("dotenv").config();

import { Router, Request, Response } from "express";
import { model } from "mongoose";

// Types
import { User } from "../Types/User";

// Schema
import UserSchema from "../Models/User";
const UserModel = model("User", UserSchema);

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
 * @returns {JSON || Error} User as JSON or Error
 */
authRoutes.post("/login", (req: Request, res: Response): void => {
  const { id } = req.body;

  if (!id) {
    res.status(400).send("No id provided");
  }

  UserModel.findOne({ userID: id }, (err: Error, user: User): void => {
    if (err) {
      res.status(500).send(err);
    }

    if (user) {
      res.status(200).send(user);
    } else {
      const newUser = new UserModel({ userID: id });
      newUser.save((err: Error) => {
        if (err) {
          res.status(500).send(err);
        }
        res.status(200).send(newUser);
      });
    }
  });
});

export default authRoutes;
