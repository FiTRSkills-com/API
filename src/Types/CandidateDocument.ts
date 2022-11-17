import { Location } from "../Models/Location";
import { Profile } from "../Models/Profile";
import Skill from "./Skills";

export interface CandidateDocument {
  _id: string;
  authID: string;
  bio: string;
  location: Location;
  dateCreated: Date;
  accessToken: string;
  skills: Skill[];
  settings: string;
  matches: string[];
  interviews: string[];
  matchThreshold: number;
  profile: Profile;
  __v: number;
}
