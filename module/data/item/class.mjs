import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Class items.
 * @see common.ItemDescriptionData
 *
 * @property {number} levels            Current number of levels in this class.
 * @property {string} subclass          Name of subclass chosen.
 * @property {string} hitDice           Denomination of hit dice available as defined in `DND5E.hitDieTypes`.
 * @property {number} hitDiceUsed       Number of hit dice consumed.
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
        identifier: new fields.StringField({required: true, label: ""}),
        levels: new fields.NumberField({
          required: true, nullable: false, integer: true, positive: true, initial: 1, label: ""
        }),
        subclass: new fields.StringField({required: true, label: ""}),
        hitDice: new fields.StringField({required: true, initial: "d6", choices: CONFIG.DND5E.hitDieTypes, label: ""}),
        hitDiceUsed: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, label: ""
        }),
        // TODO: Create advancement data
        advancement: new fields.ArrayField(
          new fields.ObjectField({label: ""}), {label: ""}
        ),
        saves: new fields.ArrayField(
          new fields.StringField({choices: CONFIG.DND5E.abilities, label: ""}), {label: ""}
        ),
        skills: new fields.SchemaField({
          number: new fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 2, label: ""
          }),
          choices: new fields.ArrayField(
            new fields.StringField({choices: CONFIG.DND5E.skills, label: ""}), {label: ""}
          ),
          value: new fields.ArrayField(
            new fields.StringField({choices: CONFIG.DND5E.skills, label: ""}), {label: ""}
          )
        }, {label: ""}),
        spellcasting: new fields.SchemaField({
          progression: new fields.StringField({
            required: true, initial: "none", choices: CONFIG.DND5E.spellProgression, label: ""
          }),
          ability: new fields.StringField({required: true, blank: true, choices: CONFIG.DND5E.abilities, label: ""})
        }, {label: ""})
      }
    );
  }
}
