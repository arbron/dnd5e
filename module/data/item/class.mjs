import SystemDataModel from "../abstract.mjs";
import { IdentifierField } from "../fields.mjs";
import AdvancementTemplate from "./templates/advancement.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data definition for Class items.
 * @see ItemDescriptionTemplate
 * @see AdvancementTemplate
 *
 * @property {string} identifier        Identifier slug for this class.
 * @property {number} levels            Current number of levels in this class.
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
export default class ClassData extends SystemDataModel.mixin(ItemDescriptionTemplate, AdvancementTemplate) {
  static systemSchema() {
    return {
      identifier: new IdentifierField({required: true, label: "DND5E.Identifier"}),
      levels: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, positive: true, initial: 1, label: "DND5E.ClassLevels"
      }),
      hitDice: new foundry.data.fields.StringField({required: true, initial: "d6", label: "DND5E.HitDice"}),
      hitDiceUsed: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.HitDiceUsed"
      }),
      saves: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {label: "DND5E.ClassSaves"}),
      skills: new foundry.data.fields.SchemaField({
        number: new foundry.data.fields.NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 2, label: "DND5E.ClassSkillsNumber"
        }),
        choices: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({label: "DND5E.Skill"}), {label: "DND5E.ClassSkillsEligible"}
        ),
        value: new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField({label: "DND5E.Skill"}), {label: "DND5E.ClassSkillsChosen"}
        )
      }, {label: "DND5E.Skills"}),
      spellcasting: new foundry.data.fields.SchemaField({
        progression: new foundry.data.fields.StringField({
          required: true, initial: "none", label: "DND5E.SpellProgression"
        }),
        ability: new foundry.data.fields.StringField({
          required: true, blank: true, label: "DND5E.SpellAbility"
        })
      }, {label: "DND5E.Spellcasting"})
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
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

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /**
   * Store the original class value within system data so it can be available when class is converted
   * to an object for display on the actor sheet.
   */
  prepareFinalOriginalClassData() {
    this.isOriginalClass = this.parent.isOriginalClass;
    // TODO: Unfortunately DataModel#toObject(false) doesn't retain any newly added fields so this no longer works
  }
}
