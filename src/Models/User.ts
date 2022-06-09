import { Schema } from "mongoose";

/**
 * @typedef {Object} User
 * @property {string} userID - The unique id for the user.
 * @property {string} bio - The user's bio.
 * @example { userID: "12345", bio: "I am a user" }
 */
interface User {
  userID: string;
  bio: string;
}

/**
 * @typedef {Object} UserSchema<User>
 * @property {string} userID - The unique id for the user. (Required)
 * @property {string} bio - The user's bio. (Optional)
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
});

export default UserSchema;
