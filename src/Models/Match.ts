import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Application
 * @property {string} job Job posting's unique ID
 * @property {string} user User's unique ID
 * @property {string} status Status of Application
 */
export interface Match {
  job: string;
  candidate: string;
  matchStatus: string;
  candidateStatus: string;
  employerStatus: string;
  interview: string;
}

/**
 * @typedef {Object} ApplicationSchema<Application>
 * @property {string} job Job's unique ID (Required)
 * @property {string} user User's unique ID (Required)
 * @property {string} status Status of application
 */
const MatchSchema: Schema = new Schema<Match>({
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  candidate: {
    type: Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  matchStatus: {
    type: Schema.Types.ObjectId,
    ref: "Status",
    required: true,
  },
  candidateStatus: {
    type: Schema.Types.ObjectId,
    ref: "Status",
    required: true,
  },
  employerStatus: {
    type: Schema.Types.ObjectId,
    ref: "Status",
    required: true,
  },
  interview: {
    type: Schema.Types.ObjectId,
    ref: "Interview",
    required: false,
  },
});

// Create and export the model
const MatchModel = model("Match", MatchSchema);
export default MatchModel;
