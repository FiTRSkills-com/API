import { Router, Request, Response } from "express";
import { isValidObjectId } from "mongoose";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Models
import StatusModel from "../Models/Status";

// Instantiate the router
const statusRoutes = Router();

// Use Middleware
statusRoutes.use(verifyToken);

/**
 * Route for getting a status by ID
 * @name GET /:id
 * @function
 * @alias module:Routes/statusRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
statusRoutes.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const status = await StatusModel.findById(id, { __v: 0 }).exec();

    if (!status) return res.status(200).send("status not found for ID");

    return res.status(200).send(status);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/**
 * Route for patching a status with optional parameters for matchStatus or generalStatus
 * @name PATCH /:id
 * @function
 * @alias module:Routes/statusRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {any}
 */
statusRoutes.patch(
  "/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { matchStatus, generalStatus } = req.body;

    try {
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const status = await StatusModel.findById(id);

      if (!status) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (matchStatus) {
        status.matchStatus = matchStatus;
      }

      if (generalStatus) {
        status.generalStatus = generalStatus;
      }

      const updatedStatus = await status.save();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default statusRoutes;
