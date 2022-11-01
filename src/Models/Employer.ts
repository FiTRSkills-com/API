import { Schema, model } from "mongoose";
import { Profile, ProfileSchema } from "./Profile";

/**
 * @typedef {Object} Skill
 * @property {string} Skill The name of the skill.
 * @property {Date} Date The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
interface Employer {
  dateCreated: Date;
  companyListing: string;
  jobs: string[];
  accessToken: string;
  company: string;
  profile: Profile;
}

/**
 * @typedef {Object} SkillSchema<Skill>
 * @property {string} Skill The name of the skill. (Required)
 * @property {Date} Date The date the skill was added. (Required)
 */
const EmployerSchema: Schema = new Schema<Employer>({
  dateCreated: {
    type: Date,
    required: true,
  },
  companyListing: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  jobs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  ],
  accessToken: {
    type: String,
    required: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  profile: {
    type: ProfileSchema,
    required: true,
  },
});

const EmployerModel = model("Employer", EmployerSchema);
export default EmployerModel;
