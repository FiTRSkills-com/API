/**
 * Class to create a Skill object.
 */
export default class UserSkill {
  /**
   * @property {string} UserID - The unique id for the user.
   * @example "12345"
   */
  UserID: string;

  /**
   * @property {string} SkillID - The unique id for the skill.
   * @example "12345"
   */
  SkillID: string;

  /**
   * UserSkill constructor.
   *
   * @param UserID The unique id for the user.
   * @param SkillID The unique id for the skill.
   */
  constructor(userID: string, skillID: string) {
    this.UserID = userID;
    this.SkillID = skillID;
  }
}
