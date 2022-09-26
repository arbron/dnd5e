import { FormulaField } from "../fields.mjs";
import * as common from "./common.mjs";

/**
 * Data definition for Tool items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 *
 * @property {string} toolType    Tool category as defined in `DND5E.toolTypes`.
 * @property {string} baseItem    Base tool as defined in `DND5E.toolIds` for determining proficiency.
 * @property {string} ability     Default ability when this tool is being used.
 * @property {string} chatFlavor  Additional text added to chat when this tool is used.
 * @property {number} proficient  Level of proficiency in this tool as defined in `DND5E.proficiencyLevels`.
 * @property {string} bonus       Bonus formula added to tool rolls.
 */
export default class ToolData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...common.ItemDescriptionData.defineSchema(),
      ...common.PhysicalItemData.defineSchema(),
      toolType: new foundry.data.fields.StringField({required: true, label: "DND5E.ItemToolType"}),
      baseItem: new foundry.data.fields.StringField({
        required: true, blank: true, choices: CONFIG.DND5E.toolIds, label: "DND5E.ItemToolBase"
      }),
      ability: new foundry.data.fields.StringField({
        required: true, initial: "int", choices: CONFIG.DND5E.abilities, label: "DND5E.DefaultAbilityCheck"
      }),
      chatFlavor: new foundry.data.fields.StringField({required: true, label: "DND5E.ChatFlavor"}),
      proficient: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.ItemToolProficiency"
      }),
      bonus: new FormulaField({required: true, label: "DND5E.ItemToolBonus"})
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    common.PhysicalItemData.migrateData(source);
    return super.migrateData(source);
  }
}
