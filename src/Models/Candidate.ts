import { Schema, model } from "mongoose";
import { Location, LocationSchema } from "./Location";
import { Profile, ProfileSchema } from "./Profile";

/**
 * @typedef {Object} User
 * @property {string} userID The unique id for the user.
 * @property {string} bio The user's bio.
 * @property {string} accessToken The user's access token.
 * @property {string[]} skills The user's skills.
 * @example { userID: "12345", bio: "I am a user", accessToken: "eyJhbGciOiJIUzI1", skills: [{ ObjectId("123") }] }
 */
export interface Candidate {
  bio: string;
  location: Location;
  dateCreated: Date;
  accessToken: string;
  skills: string[];
  settings: string;
  matches: string[];
  interviews: string[];
  matchTreshold: number;
  profile: Profile;
}

/**
 * @typedef {Object} UserSchema<User>
 * @property {string} userID The unique id for the user. (Required)
 * @property {string} bio The user's bio. (Optional)
 * @property {string} accessToken The user's access token. (Optional)
 * @property {ObjectId[]} skills The user's skills. (Optional)
 */
const CandidateSchema: Schema = new Schema<Candidate>({
  bio: {
    type: String,
    required: false,
  },
  location: {
    type: LocationSchema,
    required: false,
  },
  dateCreated: {
    type: Date,
    required: true,
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
  settings: {
    type: String,
    required: false,
  },
  interviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Interview",
    },
  ],
  matchTreshold: {
    type: Number,
    required: false,
  },
  profile: {
    type: ProfileSchema,
    required: false,
  },
});

// Create and export the model.
const CandidateModel = model("Candidate", CandidateSchema);
export default CandidateModel;
