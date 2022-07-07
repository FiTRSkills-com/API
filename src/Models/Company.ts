import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Headquarters
 * @property {string} city The headquarters city.
 * @property {string} state The headquarters state.
 */
interface Headquarters {
  city: string;
  state: string;
}

/**
 * @typedef {Object} Company
 * @property {string} name The company name.
 * @property {Headquarters} headquarters The company's headquarters.
 * @property {string} website The company's website.
 * @property {string} logo The company's logo.
 * @property {string[]} jobs The company's jobs.
 */
export interface Company {
  name: string;
  headquarters: Headquarters;
  website: string;
  logo: string;
  jobs: string[];
}

/**
 * @typedef {Object} CompanySchema<Company>
 * @property {string} name The company name. (Required)
 * @property {Headquarters} headquarters The company's headquarters. (Required)
 * @property {string} website The company's website. (Required)
 * @property {string} logo The company's logo. (Required)
 * @property {string[]} jobs The company's jobs. (Required)
 */
const CompanySchema: Schema = new Schema<Company>({
  name: {
    type: String,
    required: true,
  },
  headquarters: {
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  },
  website: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  jobs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  ],
});

// Create and export the model
const CompanyModel = model("Company", CompanySchema);
export default CompanyModel;
