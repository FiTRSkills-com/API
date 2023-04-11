import { Company } from "../Models/Company";
import { Profile } from "../Models/Profile";
import { JobDocument } from "./JobDocument";
import { TimeSlot } from "../Models/Employer";

export interface EmployerDocument {
  _id: string;
  dateCreated: Date;
  authID: string;
  companyListing: JobDocument;
  accessToken: string;
  company: Company;
  profile: Profile;
  interviewAvailability: TimeSlot[];
}
