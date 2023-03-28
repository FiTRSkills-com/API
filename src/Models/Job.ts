import { Schema, model } from "mongoose";
import { Skill } from "./Skill";
import { Location, LocationSchema } from "./Location";

/**
 * @typedef {Object} JobLength
 * @property {number} length Length of job
 * @property {string} unit Unit of measurement for length
 */
export interface JobLength {
  length: number;
  unit: string;
}

/**
 * @typedef {Object} TimeSlot
 * @property {Date} date Date of timeslot
 * @property {Date[]} times Date array of times
 */
export interface TimeSlot {
  date: Date;
  times: Date[];
}

/**
 * @typedef {Object} JobSkill
 * @property {string} skill a skill for the job
 * @property {number} priority the priority for the skill (int 1-5)
 */
export interface JobSkill {
  skill: string; //should this be a Skill type?
  priority: number;
}

/**
 * @typedef {Object} JobSkillsSchema<Job>
 * @property {ObjectId} skill The skill. (Required)
 * @property {number} priority The skills priority. (Required)
 */
const JobSkillsSchema: Schema = new Schema<JobSkill>({
  skill: {
    type: Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  priority: {
    type: Number,
    required: false,
  },
});

/**
 * @typedef {Object} Job
 * @property {string} title The job title.
 * @property {string} description The job description.
 * @property {string} company The company's ID.
 * @property {string} location The job's location.
 * @property {boolean} isRemote Whether the job is remote or not.
 * @property {boolean} willSponsor Whether the job will sponsor or not.
 * @property {number} salary The job's salary.
 * @property {JobSkill[]} jobSkills The job's skills, and their priorities
 * @property {string[]} benefits The job's benefits.
 * @property {Date} createdAt The date the job was created.
 * @property {Date} updatedAt The date the job was last updated.
 */
export interface Job {
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
  jobSkills: JobSkill[];
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
 * @property {JobSkill[]} jobSkills The job's skills. (Required)
 * @property {string[]} benefits The job's benefits. (Required)
 * @property {Date} createdAt The date the job was created. (Required)
 * @property {Date} updatedAt The date the job was last updated. (Required)
 */
export const JobSchema: Schema = new Schema<Job>({
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
    _id: false,
  },
  location: {
    type: LocationSchema,
    required: true,
    _id: false,
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
  jobSkills: [
    {
      type: JobSkillsSchema,
      required: true,
      _id: false,
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
        _id: false,
      },
      times: [
        {
          type: Date,
          _id: false,
        },
      ],
    },
  ],
});

// Create and export the model.
const JobModel = model("Job", JobSchema);
export default JobModel;
