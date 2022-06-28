interface User {
  _id: string;
  userID: string;
  accessToken: string;
  skills: string[];
  __v: number;
}

declare namespace Express {
  export interface Request {
    user: User;
    userID: string;
  }
}
