import { Schema, model } from "mongoose";
import { Location, LocationSchema, defaultLocation } from "./Location";
import { Profile, ProfileSchema, defaultProfile } from "./Profile";

/**
 * @typedef {Object} User
 * @property {string} userID The unique id for the user.
 * @property {string} bio The user's bio.
 * @property {string} accessToken The user's access token.
 * @property {string[]} skills The user's skills.
 * @example { userID: "12345", bio: "I am a user", accessToken: "eyJhbGciOiJIUzI1", skills: [{ ObjectId("123") }] }
 */
export interface Candidate {
  authID: string;
  bio: string;
  location: Location;
  dateCreated: Date;
  accessToken: string;
  skills: string[];
  settings: string;
  matches: string[];
  interviews: string[];
  matchThreshold: number;
  profile: Profile;
}

/**
 * @typedef {Object} UserSchema<User>
 * @property {string} userID The unique id for the user. (Required)
 * @property {string} bio The user's bio. (Optional)
 * @property {string} accessToken The user's access token. (Optional)
 * @property {string[]} skills The user's skills. (Optional)
 */
const CandidateSchema: Schema = new Schema<Candidate>({
  authID: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  location: {
    type: LocationSchema,
    required: false,
    default: defaultLocation,
    _id: false,
  },
  dateCreated: {
    type: Date,
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
    default: "",
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
    default: "",
  },
  interviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Interview",
    },
  ],
  matches: [
    {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
  ],
  matchThreshold: {
    type: Number,
    required: false,
    default: -1,
  },
  profile: {
    type: ProfileSchema,
    required: false,
    default: defaultProfile,
    _id: false,
  },
});

// Create and export the model.
const CandidateModel = model("Candidate", CandidateSchema);
export default CandidateModel;
