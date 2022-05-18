/**
 * Class to create a Skill object.
 */
export default class Skill {
  /**
   * @property {string} Skill - The name of the skill.
   * @example "JavaScript"
   */
  Skill: string;

  /**
   * @property {Date} Date - The date the skill was acquired.
   * @example new Date()
   */
  Date: Date;

  /**
   * Skill constructor.
   *
   * @param skill The name of the skill.
   * @param date The date the skill was acquired.
   */
  constructor(skill: string, date: Date) {
    this.Skill = skill;
    this.Date = date;
  }
}
