import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Interview
 * @property {string} applicationID The application's unique ID
 * @property {Date} interviewDate The datetime of the interview
 * @property {InterviewDetails} interviewDetails The details of the interview
 */
export interface Interview {
  match: string;
  interviewDate: Date;
  twilloMeetingID: string;
}

/**
 * @typedef {Object} InterviewSchema<Interview>
 * @property {string} applicationID The application's unique ID (Required)
 * @property {Date} interviewDate The interview's datetime (Required)
 * @property {Object} interviewDetails The interview's details (Optional)
 */
const InterviewSchema: Schema = new Schema<Interview>({
  match: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  interviewDate: {
    type: Date,
    required: true,
  },
  twilloMeetingID: {
    type: String,
    required: true,
  },
});

// Create and export the model
const InterviewModel = model("Interview", InterviewSchema);
export default InterviewModel;
