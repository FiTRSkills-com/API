import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Interviewer
 * @property {string} name - Interviewer's name
 * @property {string} position - Interviewer's position
 */
interface Interviewer {
  name: string;
  position: string;
}

/**
 * @typedef {Object} InterviewDetails
 * @property {string} companyID - The company's ID
 * @property {Interviewer} interviewer - The interviewer's name and position
 * @property {string} notes - Any notes from the interviewer
 */
interface InterviewDetails {
  companyID: string;
  interviewer: Interviewer;
  notes: string;
}

/**
 * @typedef {Object} Interview
 * @property {string} employerID - The employees ID
 * @property {string} userID - The job seekers ID
 * @property {Date} interviewDate - The datetime of the interview
 * @property {InterviewDetails} interviewDetails - The details of the interview
 */
export interface Interview {
  employerID: string;
  userID: string;
  interviewDate: Date;
  interviewDetails: InterviewDetails
}

/**
 * @typedef {Object} InterviewModel
 * @property {string} employerID - The employee's ID (Required)
 * @property {string} userID - The user's ID (Required)
 * @property {Date} interviewDate - The interview's datetime (Required)
 * @property {Object} interviewDetails - The interview's details (Required except notes)
 */
const InterviewSchema: Schema = new Schema<Interview>({
  employerID: {
    type: String,
    required: true,
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  interviewDate: {
    type: Date,
    required: true,
  },
  interviewDetails: {
    companyID: {
      type: String,
      required: true,
    },
    interviewer: {
      name: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
    },
    notes: {
      type: String,
      required: false,
    },
  }
})

// Create and export the model
const InterviewModel = model("Interview", InterviewSchema);
export default InterviewModel;
