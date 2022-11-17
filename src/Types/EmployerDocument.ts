import { Company } from "../Models/Company";
import { Profile } from "../Models/Profile";
import { JobDocument } from "./JobDocument";

export interface EmployerDocument {
  _id: string;
  dateCreated: Date;
  companyListing: JobDocument;
  jobs: JobDocument[];
  accessToken: string;
  company: Company;
  profile: Profile;
}
