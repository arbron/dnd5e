import { FormulaField } from "../fields.mjs";
import { SystemDataMixin } from "../mixin.mjs";
import { ItemDescriptionTemplate, PhysicalItemTemplate } from "./templates.mjs";

/**
 * Data definition for Tool items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 *
 * @property {string} toolType    Tool category as defined in `DND5E.toolTypes`.
 * @property {string} baseItem    Base tool as defined in `DND5E.toolIds` for determining proficiency.
 * @property {string} ability     Default ability when this tool is being used.
 * @property {string} chatFlavor  Additional text added to chat when this tool is used.
 * @property {number} proficient  Level of proficiency in this tool as defined in `DND5E.proficiencyLevels`.
 * @property {string} bonus       Bonus formula added to tool rolls.
 */
export default class ToolData extends SystemDataMixin(ItemDescriptionTemplate, PhysicalItemTemplate) {
  static defineSchema() {
    return {
      ...this.templateSchema(),
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
}
