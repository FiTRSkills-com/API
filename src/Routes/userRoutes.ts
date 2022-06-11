import { Router, Request, Response } from "express";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import UserModel from "../Models/User";

// Instantiate the router
const userRoutes = Router();

// Use Middleware
userRoutes.use(verifyToken);

/**
 * Route for getting a user.
 * @name GET /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {JSON || Error} - JSON object containing the user || Error
 */
userRoutes.get("/", (req: Request, res: Response): void => {
  // @ts-ignore
  const userID = req.userID;

  UserModel.find({ userID }, { __v: 0 })
    .populate({ path: "skills", select: "Skill -_id" })
    .exec((err, user) => {
      if (err) {
        res.status(500).send(err);
      }

      res.status(200).send(user);
    });
});

/**
 * Route for updating a user's skills.
 * @name PATCH /skills
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req - Express Request
 * @property {Response} res - Express Response
 * @returns {String || Error} - Success message || Error message || Error
 */
userRoutes.patch("/skills", (req: Request, res: Response): void => {
  // @ts-ignore
  const userID = req.userID;
  const { skills } = req.body;

  if (!skills) {
    res.status(400).send("No skills provided");
  }

  UserModel.updateOne({ userID }, { $set: { skills } }, (err: Error) => {
    if (err) {
      res.status(500).send(err);
    }

    res.status(200).send(`Added skills ${skills.join(", ")} to user ${userID}`);
  });
});

export default userRoutes;
