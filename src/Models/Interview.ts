import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Interviewer
 * @property {string} name Interviewer's name
 * @property {string} position Interviewer's position
 */
interface Interviewer {
  name: string;
  position: string;
}

/**
 * @typedef {Object} InterviewDetails
 * @property {string} companyID The company's unique ID
 * @property {Interviewer} interviewer The interviewer's name and position
 * @property {string} notes Any notes from the interviewer
 */
interface InterviewDetails {
  companyID: string;
  interviewer: Interviewer;
  notes: string;
}

/**
 * @typedef {Object} Interview
 * @property {string} applicationID The application's unique ID
 * @property {Date} interviewDate The datetime of the interview
 * @property {InterviewDetails} interviewDetails The details of the interview
 */
export interface Interview {
  applicationID: string;
  interviewDate: Date;
  interviewDetails: InterviewDetails;
}

/**
 * @typedef {Object} InterviewSchema<Interview>
 * @property {string} applicationID The application's unique ID (Required)
 * @property {Date} interviewDate The interview's datetime (Required)
 * @property {Object} interviewDetails The interview's details (Optional)
 */
const InterviewSchema: Schema = new Schema<Interview>({
  applicationID: {
    type: Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  interviewDate: {
    type: Date,
    required: true,
  },
  interviewDetails: {
    companyID: {
      type: String,
      required: false,
    },
    interviewer: {
      name: {
        type: String,
        required: false,
      },
      position: {
        type: String,
        required: false,
      },
    },
    notes: {
      type: String,
      required: false,
    },
  },
});

// Create and export the model
const InterviewModel = model("Interview", InterviewSchema);
export default InterviewModel;
