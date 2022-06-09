import { Schema } from "mongoose";

/**
 * @typedef {Object} User
 * @property {string} userID - The user's id. (Foreign key)
 * @property {string} skillID - The skill's id. (Foreign key)
 * @example { userID: "12345", skillID: "12345" }
 */
interface UserSkill {
  userID: string;
  skillID: string;
}

/**
 * @typedef {Object} UserSkillSchema<UserSkill>
 * @property {string} userID - The user's id. (Required)
 * @property {string} skillID - The skill's id. (Required)
 */
const UserSkillSchema: Schema = new Schema<UserSkill>({
  userID: {
    type: String,
    required: true,
  },
  skillID: {
    type: String,
    required: true,
  },
});

export default UserSkillSchema;
