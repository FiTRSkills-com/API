"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
/**
 * @typedef {Object} UserSchema<User>
 * @property {string} userID - The unique id for the user. (Required)
 * @property {string} bio - The user's bio. (Optional)
 * @property {string} accessToken - The user's access token. (Optional)
 * @property {ObjectId[]} skills - The user's skills. (Optional)
 */
var UserSchema = new mongoose_1.Schema({
    userID: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    accessToken: {
        type: String,
        required: false
    },
    skills: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Skill"
        },
    ]
});
// Create and export the model.
var UserModel = (0, mongoose_1.model)("User", UserSchema);
exports["default"] = UserModel;
