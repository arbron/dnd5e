import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Class items.
 * @see common.ItemDescriptionData
 *
 * @property {string} identifier        Identifier slug for this class.
 * @property {number} levels            Current number of levels in this class.
 * @property {string} hitDice           Denomination of hit dice available as defined in `DND5E.hitDieTypes`.
 * @property {number} hitDiceUsed       Number of hit dice consumed.
 * @property {object[]} advancement     Advancement objects for this class.
 * @property {string[]} saves           Savings throws in which this class grants proficiency.
 * @property {object} skills            Available class skills and selected skills.
 * @property {number} skills.number     Number of skills selectable by the player.
 * @property {string[]} skills.choices  List of skill keys that are valid to be chosen.
 * @property {string[]} skills.value    List of skill keys the player has chosen.
 * @property {object} spellcasting      Details on class's spellcasting ability.
 * @property {string} spellcasting.progression  Spell progression granted by class as from `DND5E.spellProgression`.
 * @property {string} spellcasting.ability      Ability score to use for spellcasting.
 */
export default class ItemClassData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      {
        // TODO: Ensure this is a valid slug
        identifier: new fields.StringField({required: true, label: "DND5E.Identifier"}),
        levels: new fields.NumberField({
          required: true, nullable: false, integer: true, positive: true, initial: 1, label: "DND5E.ClassLevels"
        }),
        hitDice: new fields.StringField({
          required: true, initial: "d6", choices: CONFIG.DND5E.hitDieTypes, label: "DND5E.HitDice"
        }),
        hitDiceUsed: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.HitDiceUsed"
        }),
        // TODO: Create advancement data
        advancement: new fields.ArrayField(
          new fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
        ),
        saves: new fields.ArrayField(
          new fields.StringField({choices: CONFIGDND5E.abilities, label: "DND5E.Ability"}), {label: "DND5E.ClassSaves"}
        ),
        skills: new fields.SchemaField({
          number: new fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 2, label: "DND5E.ClassSkillsNumber"
          }),
          choices: new fields.ArrayField(
            new fields.StringField({
              choices: CONFIG.DND5E.skills, label: "DND5E.Skill"
            }), {label: "DND5E.ClassSkillsEligible"}
          ),
          value: new fields.ArrayField(
            new fields.StringField({
              choices: CONFIG.DND5E.skills, label: "DND5E.Skill"
            }), {label: "DND5E.ClassSkillsChosen"}
          )
        }, {label: "DND5E.Skills"}),
        spellcasting: new fields.SchemaField({
          progression: new fields.StringField({
            required: true, initial: "none", choices: CONFIG.DND5E.spellProgression, label: "DND5E.SpellProgression"
          }),
          ability: new fields.StringField({
            required: true, blank: true, choices: CONFIG.DND5E.abilities, label: "DND5E.SpellAbility"
          })
        }, {label: "DND5E.Spellcasting"})
      }
    );
  }
}
