import SystemDataModel from "../abstract.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";

/**
 * Data definition for Loot items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 */
export default class LootData extends SystemDataModel.mixed(ItemDescriptionTemplate, PhysicalItemTemplate) {}
