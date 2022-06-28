import { Schema, model } from "mongoose";

/**
 * @typedef {Object} User
 * @property {string} userID - The unique id for the user.
 * @property {string} bio - The user's bio.
 * @property {string} accessToken - The user's access token.
 * @property {string[]} skills - The user's skills.
 * @example { userID: "12345", bio: "I am a user", accessToken: "eyJhbGciOiJIUzI1", skills: [{ ObjectId("123") }] }
 */
export interface User {
  userID: string;
  bio: string;
  accessToken: string;
  skills: string[];
}

/**
 * @typedef {Object} UserSchema<User>
 * @property {string} userID - The unique id for the user. (Required)
 * @property {string} bio - The user's bio. (Optional)
 * @property {string} accessToken - The user's access token. (Optional)
 * @property {ObjectId[]} skills - The user's skills. (Optional)
 */
const UserSchema: Schema = new Schema<User>({
  userID: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  accessToken: {
    type: String,
    required: false,
  },
  skills: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],
});

// Create and export the model.
const UserModel = model("User", UserSchema);
export default UserModel;
