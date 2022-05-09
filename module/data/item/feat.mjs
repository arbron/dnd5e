import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Feature items.
 * @see common.ItemDescriptionData
 * @see common.ActivatedEffectData
 * @see common.ActionData
 *
 * @property {string} requirements       Actor details required to use this feature.
 * @property {object} recharge           Details on how a feature can roll for recharges.
 * @property {number} recharge.value     Minimum number needed to roll on a d6 to recharge this feature.
 * @property {boolean} recharge.charged  Does this feature have a charge remaining?
 */
export default class ItemFeatData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.ActivatedEffectData.defineSchema(),
      common.ActionData.defineSchema(),
      {
        requirements: new fields.StringField({required: true, label: ""}),
        recharge: new fields.SchemaField({
          value: new fields.NumberField({required: true, integer: true, positive: true, label: ""}),
          charged: new fields.BooleanField({required: true, label: ""})
        }, {label: ""})
      }
    );
  }
}
