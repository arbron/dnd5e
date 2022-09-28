import { ItemDescriptionTemplate, PhysicalItemTemplate } from "./templates.mjs";

/**
 * Data definition for Loot items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 */
export default class LootData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...ItemDescriptionTemplate.defineSchema(),
      ...PhysicalItemTemplate.defineSchema()
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    PhysicalItemTemplate.migrateData(source);
    return super.migrateData(source);
  }
}
