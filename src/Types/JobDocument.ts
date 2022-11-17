import { JobLength, TimeSlot } from "../Models/Job";
import { Location } from "../Models/Location";
import { EmployerDocument } from "./EmployerDocument";
import { SkillDocument } from "./SkillDocument";

export interface JobDocument {
  _id: string;
  title: string;
  description: string;
  isCompanyListing: boolean;
  employer: EmployerDocument;
  type: string;
  length: JobLength;
  location: Location;
  isRemote: boolean;
  willSponsor: boolean;
  salary: number;
  skills: SkillDocument[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
  matchThreshold: number;
  matches: String[];
  interviewAvailability: TimeSlot[];
  __v: number;
}
