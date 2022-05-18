import { Schema } from "mongoose";

/**
 * @typedef {Object} Skill
 * @property {string} Skill - The name of the skill.
 * @property {Date} Date - The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
interface Skill {
  Skill: string;
  Date: Date;
}

/**
 * @typedef {Object} SkillSchema<Skill>
 * @property {string} Skill - The name of the skill. (Required)
 * @property {Date} Date - The date the skill was added. (Required)
 */
const SkillSchema: Schema = new Schema<Skill>({
  Skill: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
});

export default SkillSchema;
