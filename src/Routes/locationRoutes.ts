import { Router, Request, Response } from "express";
import { Document } from "mongoose";
import axios from "axios";

import log from "../utils/log";

// Middleware
import { verifyToken } from "../Middleware/Authorization";

// Instantiate the router
const locationRoutes = Router();

// Use Middleware
locationRoutes.use(verifyToken);

const apiKey =
  "pk.eyJ1IjoibWFjOTk5MyIsImEiOiJjbGV4Nm1vbjEwMnY5M3hxa2J0a2Zjb3UyIn0.-uPQvPNvxqZDo0hQl2isYg";

/**
 * Route for geocoding an address and returning its latitude and longitude.
 * @name GET /location
 * @function
 * @alias module:Routes/locationRoutes
 * @property {Request} req Express Request
 * @property {Response} res Express Response
 * @returns {Promise<any>}
 */
locationRoutes.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const address = req.query.address as string;

    // Validate input
    if (!address) {
      return res.status(400).send("Address is required");
    }

    // Make request to Mapbox API
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${apiKey}`
    );
    // Extract latitude and longitude from response
    if (response.data.features.length === 0) {
      return res.status(400).send("Invalid address");
    }

    const { center } = response.data.features[0];
    const [longitude, latitude] = center;
    const location = {
      longitude: {
        $numberDecimal: longitude.toString(),
      },
      latitude: {
        $numberDecimal: latitude.toString(),
      },
    };

    return res.status(200).send(location);
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      return res.status(400).send(err.response.data.message);
    }
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

export default locationRoutes;
