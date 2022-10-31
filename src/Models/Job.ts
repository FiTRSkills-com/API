import { Schema, model } from "mongoose";
import { Location, LocationSchema } from "./Location";

/**
 * @typedef {Object} JobLength
 * @property {number} length Length of job
 * @property {string} unit Unit of measurement for length
 */
interface JobLength {
  length: number;
  unit: string;
}

/**
 * @typedef {Object} TimeSlot
 * @property {Date} date Date of timeslot
 * @property {Date[]} times Date array of times
 */
interface TimeSlot {
  date: Date;
  times: Date[];
}

/**
 * @typedef {Object} Job
 * @property {string} title The job title.
 * @property {string} description The job description.
 * @property {string} company The company's ID.
 * @property {string} location The job's location.
 * @property {boolean} isRemote Whether the job is remote or not.
 * @property {boolean} willSponsor Whether the job will sponsor or not.
 * @property {number} salary The job's salary.
 * @property {string[]} skills The job's skills.
 * @property {string[]} benefits The job's benefits.
 * @property {Date} createdAt The date the job was created.
 * @property {Date} updatedAt The date the job was last updated.
 */
export interface Job {
  jobID: string;
  title: string;
  description: string;
  isCompanyListing: boolean;
  employer: string;
  type: string;
  length: JobLength;
  location: Location;
  isRemote: boolean;
  willSponsor: boolean;
  salary: number;
  skills: string[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
  matchThreshold: number;
  matches: String[];
  interviewAvailability: TimeSlot[];
}

/**
 * @typedef {Object} JobSchema<Job>
 * @property {string} title The job title. (Required)
 * @property {string} description The job description. (Required)
 * @property {string} company The company's ID. (Required)
 * @property {string} location The job's location. (Required)
 * @property {string} type The job's type. (Required)
 * @property {JobLength} length The job's length. (Optional)
 * @property {boolean} isRemote Whether the job is remote or not. (Required)
 * @property {boolean} willSponsor Whether the job will sponsor or not. (Required)
 * @property {number} salary The job's salary. (Required)
 * @property {ObjectId[]} skills The job's skills. (Required)
 * @property {string[]} benefits The job's benefits. (Required)
 * @property {Date} createdAt The date the job was created. (Required)
 * @property {Date} updatedAt The date the job was last updated. (Required)
 */
const JobSchema: Schema = new Schema<Job>({
  jobID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isCompanyListing: {
    type: Boolean,
    required: true,
  },
  employer: {
    type: Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  length: {
    length: {
      type: Number,
      required: false,
    },
    unit: {
      type: String,
      required: false,
    },
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  isRemote: {
    type: Boolean,
    required: true,
  },
  willSponsor: {
    type: Boolean,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  skills: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
  ],
  benefits: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  matchThreshold: {
    type: Number,
    required: true,
  },
  matches: [
    {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
  ],
  interviewAvailability: [
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

// Create and export the model.
const JobModel = model("Job", JobSchema);
export default JobModel;
