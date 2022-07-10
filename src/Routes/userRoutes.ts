import { Router, Request, Response } from "express";
import { CallbackError } from "mongoose";

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
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
userRoutes.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await UserModel.findOne({ userID: req.userID }, { __v: 0 })
      .populate({ path: "skills", select: "Skill _id" })
      .exec();

    if (!user) return res.status(200).send("No user found with that ID");
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for updating a user's skills.
 * @name PATCH /
 * @function
 * @alias module:Routes/userRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
userRoutes.patch("/", (req: Request, res: Response): any => {
  const { skills, bio } = req.body;

  if (!skills && bio === undefined) {
    return res.status(400).send("No skills provided");
  }

  return UserModel.updateOne(
    { userID: req.userID },
    { $set: { skills, bio } },
    (err: CallbackError): any => {
      if (err) {
        return res.status(500).send(err);
      }

      return res.status(200).send("User updated successfully");
    }
  );
});

export default userRoutes;
