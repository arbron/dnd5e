import * as common from "./common.mjs";

/**
 * Data definition for Loot items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 */
export default class LootData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...common.ItemDescriptionData.defineSchema(),
      ...common.PhysicalItemData.defineSchema()
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    common.PhysicalItemData.migrateData(source);
    return super.migrateData(source);
  }
}
