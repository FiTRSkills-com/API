interface Candidate {
  _id: string;
  authID: string;
  accessToken: string;
  skills: string[];
}

interface Employer {
  _id: string;
  authID: string;
  accessToken: string;
}

declare namespace Express {
  export interface Request {
    candidate: Candidate;
    employer: Employer;
    authID: string;
  }
}
