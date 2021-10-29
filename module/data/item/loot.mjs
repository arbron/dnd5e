import { DocumentData } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObject } from "/common/utils/helpers.mjs";
import { defaultData } from "./base.mjs";
import * as common from "./common.mjs";


export class ItemLootData extends DocumentData {
  static defineSchema() {
    return mergeObject(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema()
    );
  }
}
