import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Skill
 * @property {string} Skill The name of the skill.
 * @property {Date} Date The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const ProfileSchema: Schema = new Schema<Profile>({
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
});

export const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};
