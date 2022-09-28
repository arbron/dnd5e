import { IdentifierField } from "../fields.mjs";
import { ItemDescriptionTemplate } from "./templates.mjs";

/**
 * Data definition for Class items.
 * @see ItemDescriptionTemplate
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
export default class ClassData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      identifier: new IdentifierField({required: true, label: "DND5E.Identifier"}),
      levels: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, positive: true, initial: 1, label: "DND5E.ClassLevels"
      }),
      hitDice: new foundry.data.fields.StringField({
        required: true, initial: "d6", choices: CONFIG.DND5E.hitDieTypes, label: "DND5E.HitDice"
      }),
      hitDiceUsed: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.HitDiceUsed"
      }),
      // TODO: Convert to proper advancement data when #1812 is merged
      advancement: new foundry.data.fields.ArrayField(
        new foundry.data.fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
      ),
      saves: new foundry.data.fields.ArrayField(
        new foundry.data.fields.StringField({choices: CONFIG.DND5E.abilities, label: "DND5E.Ability"}), {label: "DND5E.ClassSaves"}
      ),
      skills: new foundry.data.fields.SchemaField({
        number: new foundry.data.fields.NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 2, label: "DND5E.ClassSkillsNumber"
        }),
        choices: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({
            choices: CONFIG.DND5E.skills, label: "DND5E.Skill"
          }), {label: "DND5E.ClassSkillsEligible"}
        ),
        value: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({
            choices: CONFIG.DND5E.skills, label: "DND5E.Skill"
          }), {label: "DND5E.ClassSkillsChosen"}
        )
      }, {label: "DND5E.Skills"}),
      spellcasting: new foundry.data.fields.SchemaField({
        progression: new foundry.data.fields.StringField({
          required: true, initial: "none", choices: CONFIG.DND5E.spellProgression, label: "DND5E.SpellProgression"
        }),
        ability: new foundry.data.fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilities, label: "DND5E.SpellAbility"
        })
      }, {label: "DND5E.Spellcasting"})
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    this.migrateSpellcastingData(source);
    return super.migrateData(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the class's spellcasting string to object.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateSpellcastingData(source) {
    if ( typeof source.spellcasting !== "string" ) return;
    source.spellcasting = {
      progression: source.spellcasting,
      ability: ""
    };
  }
}
