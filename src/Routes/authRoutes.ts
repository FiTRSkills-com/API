import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Types
import { User } from "../Models/User";

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

  UserModel.findOne({ userID: id }, (err: Error, user: User): void => {
    if (err) {
      res.status(500).send(err);
    }

    if (user) {
      jwt.sign(
        { id: user.userID },
        process.env.JWT_SECRET!,
        (err: Error | null, token: string | undefined): void => {
          if (err) {
            res.status(500).send(err);
          }

          res.status(200).send({ token });
        }
      );
    } else {
      const newUser = new UserModel({ userID: id });
      newUser.save((err: Error): void => {
        if (err) {
          res.status(500).send(err);
        }

        jwt.sign(
          { id },
          process.env.JWT_SECRET!,
          (err: Error | null, token: string | undefined): void => {
            if (err) {
              res.status(500).send(err);
            }

            res.status(200).send({ token });
          }
        );
      });
    }
  });
});

export default authRoutes;
