interface Candidate {
  _id: string;
  candidateID: string;
  accessToken: string;
  skills: string[];
  __v: number;
}

declare namespace Express {
  export interface Request {
    candidate: Candidate;
    candidateID: string;
  }
}
