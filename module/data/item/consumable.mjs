import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Consumable items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 * @see common.ActivatedEffectData
 * @see common.ActionData
 *
 * @property {string} consumableType     Type of consumable as defined in `DND5E.consumableTypes`.
 * @property {object} uses               Information on how the consumable can be used and destroyed.
 * @property {boolean} uses.autoDestroy  Should this item be destroyed when it runs out of uses.
 */
export default class ItemConsumableData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema(),
      common.ActivatedEffectData.defineSchema(),
      common.ActionData.defineSchema(),
      {
        consumableType: new fields.StringField({
          required: true, initial: "potion", choices: CONFIG.DND5E.consumableTypes, label: ""
        }),
        uses: new fields.SchemaField({
          ...common.ActivatedEffectData.schema.uses.schema,
          autoDestroy: new fields.BooleanField({required: true, label: ""})
        })
      }
    );
  }
}
