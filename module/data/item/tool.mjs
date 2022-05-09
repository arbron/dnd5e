import { DocumentData } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { FORMULA_FIELD, NONNEGATIVE_NUMBER_FIELD } from "../fields.mjs";
import { defaultData, mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Tool items.
 * @extends DocumentData
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
export default class ItemToolData extends DocumentData {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema(),
      {
        toolType: fields.BLANK_STRING,
        baseItem: fields.BLANK_STRING,
        ability: fields.field(fields.REQUIRED_STRING, { default: defaultData("tool.ability") }),
        chatFlavor: fields.BLANK_STRING,
        proficient: fields.field(NONNEGATIVE_NUMBER_FIELD, fields.REQUIRED_NUMBER),
        bonus: FORMULA_FIELD
      }
    );
  }
}