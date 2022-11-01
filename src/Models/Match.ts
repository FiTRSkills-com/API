import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Application
 * @property {string} job Job posting's unique ID
 * @property {string} user User's unique ID
 * @property {string} status Status of Application
 * @property {Timeslot[]} interviewTimeSlots Array of potential timeslots
 */
export interface Match {
  job: string;
  candidate: string;
  generalStatus: string;
  candidateStatus: string;
  employerStatus: string;
  interview: string;
}

/**
 * @typedef {Object} ApplicationSchema<Application>
 * @property {string} job Job's unique ID (Required)
 * @property {string} user User's unique ID (Required)
 * @property {string} status Status of application
 * @property {Object[]} interviewTimeSlots Array of interview time slots
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
  generalStatus: {
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
