import { SystemDataMixin } from "../mixin.mjs";
import { ItemDescriptionTemplate, PhysicalItemTemplate } from "./templates.mjs";

/**
 * Data definition for Loot items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 */
export default class LootData extends SystemDataMixin(ItemDescriptionTemplate, PhysicalItemTemplate) {
  static defineSchema() {
    return this.templateSchema();
  }
}
