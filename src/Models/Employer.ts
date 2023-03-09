import { Schema, model } from "mongoose";
import { Company, CompanySchema } from "./Company";
import { Profile, ProfileSchema } from "./Profile";

/**
 * @typedef {Object} Skill
 * @property {string} Skill The name of the skill.
 * @property {Date} Date The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
interface Employer {
  authID: string;
  dateCreated: Date;
  companyListing: string;
  accessToken: string;
  company: Company;
  profile: Profile;
  interviewAvailability: TimeSlot[];
}

/**
 * @typedef {Object} TimeSlot
 * @property {Date} date Date of timeslot
 * @property {Date[]} times Date array of times
 */
export interface TimeSlot {
  days: String[];
  start: number;
  end: number;
}

/**
 * @typedef {Object} TimeSlotSchema<Job>
 */
const TimeSlotSchema: Schema = new Schema<TimeSlot>({
  days: [
    {
      type: String,
      required: false,
    },
  ],
  start: {
    type: Number,
    required: false,
  },
  end: {
    type: Number,
    required: false,
  },
});

/**
 * @typedef {Object} SkillSchema<Skill>
 * @property {string} Skill The name of the skill. (Required)
 * @property {Date} Date The date the skill was added. (Required)
 */
const EmployerSchema: Schema = new Schema<Employer>({
  authID: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    required: true,
  },
  companyListing: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  accessToken: {
    type: String,
    required: false,
  },
  company: {
    type: CompanySchema,
    required: false,
    _id: false,
  },
  profile: {
    type: ProfileSchema,
    required: false,
    _id: false,
  },
  interviewAvailability: [
    {
      type: TimeSlotSchema,
      required: false,
      _id: false,
    },
  ],
});

const EmployerModel = model("Employer", EmployerSchema);
export default EmployerModel;
