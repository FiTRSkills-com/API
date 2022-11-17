import { Schema, model } from "mongoose";

/**
 * @typedef {Object} Skill
 * @property {string} Skill The name of the skill.
 * @property {Date} Date The date the skill was added.
 * @example { Skill: "JavaScript", Date: "2020-01-01T00:00:00.000Z" }
 */
interface Skill {
  skill: string;
  category: string;
  similarSkills: string[];
  dateAdded: Date;
  addedBy: string;
}

/**
 * @typedef {Object} SkillSchema<Skill>
 * @property {string} Skill The name of the skill. (Required)
 * @property {Date} Date The date the skill was added. (Required)
 */
const SkillSchema: Schema = new Schema<Skill>({
  skill: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  similarSkills: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      _id: false,
    },
  ],
  dateAdded: {
    type: Date,
    required: true,
    defaul: Date.now,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "Employer",
    required: false,
  },
});

// Create and export the model.
const SkillModel = model("Skill", SkillSchema);
export default SkillModel;
