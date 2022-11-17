interface Candidate {
  _id: string;
  authID: string;
  accessToken: string;
  skills: string[];
  __v: number;
}

declare namespace Express {
  export interface Request {
    candidate: Candidate;
    authID: string;
  }
}
