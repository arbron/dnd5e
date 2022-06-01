import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
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
    return {
      ...common.ItemDescriptionData.defineSchema(),
      ...common.ActivatedEffectData.defineSchema(),
      ...common.ActionData.defineSchema(),
      requirements: new fields.StringField({required: true, label: "DND5E.Requirements"}),
      recharge: new fields.SchemaField({
        value: new fields.NumberField({
          required: true, integer: true, minimum: 1, label: "DND5E.FeatureRechargeOn"
        }),
        charged: new fields.BooleanField({required: true, label: "DND5E.Charged"})
      }, {label: "DND5E.FeatureActionRecharge"})
    };
  }
}
