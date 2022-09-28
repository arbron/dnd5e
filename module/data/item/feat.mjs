import { SystemDataMixin } from "../mixin.mjs";
import { ActionTemplate, ActivatedEffectTemplate, ItemDescriptionTemplate } from "./templates.mjs";

/**
 * Data definition for Feature items.
 * @see ItemDescriptionTemplate
 * @see ActivatedEffectTemplate
 * @see ActionTemplate
 *
 * @property {string} requirements       Actor details required to use this feature.
 * @property {object} recharge           Details on how a feature can roll for recharges.
 * @property {number} recharge.value     Minimum number needed to roll on a d6 to recharge this feature.
 * @property {boolean} recharge.charged  Does this feature have a charge remaining?
 */
export default class FeatData extends SystemDataMixin(
  ItemDescriptionTemplate, ActivatedEffectTemplate, ActionTemplate) {
  static defineSchema() {
    return {
      ...this.templateSchema(),
      requirements: new foundry.data.fields.StringField({required: true, label: "DND5E.Requirements"}),
      recharge: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true, integer: true, minimum: 1, label: "DND5E.FeatureRechargeOn"
        }),
        charged: new foundry.data.fields.BooleanField({required: true, label: "DND5E.Charged"})
      }, {label: "DND5E.FeatureActionRecharge"})
    };
  }
}
