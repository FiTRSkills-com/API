import Skill from "./Skills";

export interface UserDocument {
  _id: string;
  userID: string;
  accessToken: string;
  skills: Skill[];
  __v: number;
}
