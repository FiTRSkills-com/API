import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Timeslot
 * @property {Date} date Date of timeslot
 * @property {Date[]} times Date array of times
 */
interface Timeslot {
  date: Date;
  times: Date[];
}

/**
 * @typedef {Object} Application
 * @property {string} job Job posting's unique ID
 * @property {string} user User's unique ID
 * @property {string} status Status of Application
 * @property {Timeslot[]} interviewTimeSlots Array of potential timeslots
 */
export interface Application {
  job: string;
  user: string;
  status: string;
  interviewTimeSlots: Timeslot[];
}

/**
 * @typedef {Object} ApplicationSchema<Application>
 * @property {string} job Job's unique ID (Required)
 * @property {string} user User's unique ID (Required)
 * @property {string} status Status of application
 * @property {Object[]} interviewTimeSlots Array of interview time slots
 */
const ApplicationSchema: Schema = new Schema<Application>({
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  interviewTimeSlots: [
    {
      date: {
        type: Date,
      },
      times: [
        {
          type: Date,
        },
      ],
    },
  ],
});

// Create and export the model
const ApplicationModel = model("Application", ApplicationSchema);
export default ApplicationModel;
