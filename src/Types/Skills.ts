/**
 * Class to create a Skill object.
 */
export default class Skill {
  /**
   * @property {string} Skill - The name of the skill.
   * @example "JavaScript"
   */
  skill: string;

  /**
   * @property {Date} Date - The date the skill was acquired.
   * @example new Date()
   */

  category: string;

  similarSkills: Skill[];

  dateAdded: Date;

  addedBy: string;

  /**
   * Skill constructor.
   *
   * @param skill The name of the skill.
   * @param date The date the skill was acquired.
   */
  constructor(
    skill: string,
    dateAdded: Date,
    category: string,
    addedBy: string,
    similarSkills: Skill[]
  ) {
    this.skill = skill;
    this.dateAdded = dateAdded;
    this.category = category;
    this.similarSkills = similarSkills;
    this.addedBy = addedBy;
  }
}
