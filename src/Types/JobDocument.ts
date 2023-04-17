import { JobLength, JobSkill } from "../Models/Job";
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
  jobSkills: JobSkill[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
  matchThreshold: number;
  matches: String[];
  __v: number;
}
