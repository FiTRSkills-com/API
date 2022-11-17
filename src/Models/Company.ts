import { Schema, model } from "mongoose";
import { Location, LocationSchema } from "./Location";

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
  headquarters: Location;
  website: string;
  logo: string;
}

/**
 * @typedef {Object} CompanySchema<Company>
 * @property {string} name The company name. (Required)
 * @property {Headquarters} headquarters The company's headquarters. (Required)
 * @property {string} website The company's website. (Required)
 * @property {string} logo The company's logo. (Required)
 * @property {string[]} jobs The company's jobs. (Required)
 */
export const CompanySchema: Schema = new Schema<Company>({
  name: {
    type: String,
    required: true,
  },
  headquarters: {
    type: LocationSchema,
    required: true,
    _id: false,
  },
  website: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
});

// Create and export the model
const CompanyModel = model("Company", CompanySchema);
export default CompanyModel;
