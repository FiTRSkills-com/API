"use strict";
exports.__esModule = true;
exports.verifyToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
// Models
var User_1 = require("../Models/User");
/**
 * Middleware function for checking if user is authorized
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @param {NextFunction} next - Express NextFunction
 * @returns {void}
 */
var verifyToken = function (req, res, next) {
    var header = req.headers["authorization"];
    var token = header && header.split(" ")[1];
    if (!token || header.split(" ")[0] !== "Bearer") {
        res.status(401).send("Not authorized");
        return;
    }
    // Verify token in the database
    User_1["default"].findOne({ accessToken: token }, function (err, user) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (!user) {
            res.status(401).send("Not authorized");
            return;
        }
        // Verify token in the request and check that decoded user is same as user in database
        jsonwebtoken_1["default"].verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (decoded.user.userID !== user.userID) {
                res.status(401).send("Not authorized");
                return;
            }
            // Set user in request
            req.userID = user.userID;
            req.user = user;
            next();
        });
    });
    // jwt.verify(
    //   token,
    //   process.env.JWT_SECRET!,
    //   (err: Error | null, decoded: any): void => {
    //     if (err) {
    //       res.status(403).send("Invalid token");
    //       return;
    //     }
    //     req.userID = decoded.user.userID;
    //     req.user = decoded.user;
    //     next();
    //   }
    // );
};
exports.verifyToken = verifyToken;
