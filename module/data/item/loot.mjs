import { DataModel } from "/common/abstract/module.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Loot items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 */
export class ItemLootData extends DataModel {
  static defineSchema() {
    return foundry.utils.mergeObject(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema()
    );
  }
}
