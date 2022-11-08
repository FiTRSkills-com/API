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
  dateCreated: Date;
  companyListing: string;
  jobs: string[];
  accessToken: string;
  company: Company;
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
    required: false,
  },
  company: {
    type: CompanySchema,
    required: true,
    _id: false,
  },
  profile: {
    type: ProfileSchema,
    required: true,
    _id: false,
  },
});

const EmployerModel = model("Employer", EmployerSchema);
export default EmployerModel;
