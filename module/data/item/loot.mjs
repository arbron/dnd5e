import { SystemDataMixin } from "../mixin.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";

/**
 * Data definition for Loot items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 */
export default class LootData extends SystemDataMixin(ItemDescriptionTemplate, PhysicalItemTemplate) {}
