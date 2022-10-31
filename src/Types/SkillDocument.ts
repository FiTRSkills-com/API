import { EmployerDocument } from "./EmployerDocument";

export interface SkillDocument {
  _id: string;
  skill: string;
  category: string;
  similarSkills: SkillDocument[];
  dateAdded: Date;
  addedBy: EmployerDocument;
}
