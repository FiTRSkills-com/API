export interface JobDocument {
  _id: string;
  title: string;
  description: string;
  company: Company;
  type: string;
  location: string;
  isRemote: boolean;
  willSponsor: boolean;
  salary: number;
  skills: SkillDocument[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface Company {
  headquarters: Headquarters;
  name: string;
  website: string;
  logo: string;
}

interface Headquarters {
  city: string;
  state: string;
}

export interface SkillDocument {
  _id: string;
  Skill: string;
  Date: Date;
}
