import SystemDataModel from "../abstract.mjs";
import ActionTemplate from "./templates/action.mjs";
import ActivatedEffectTemplate from "./templates/activated-effect.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

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
export default class FeatData extends SystemDataModel.mixin(
  ItemDescriptionTemplate, ActivatedEffectTemplate, ActionTemplate
) {
  static systemSchema() {
    return {
      requirements: new foundry.data.fields.StringField({required: true, label: "DND5E.Requirements"}),
      recharge: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true, integer: true, minimum: 1, label: "DND5E.FeatureRechargeOn"
        }),
        charged: new foundry.data.fields.BooleanField({required: true, label: "DND5E.Charged"})
      }, {label: "DND5E.FeatureActionRecharge"})
    };
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [this.requirements];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get hasLimitedUses() {
    return !!this.recharge.value || super.hasLimitedUses;
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedFeatLabels() {
    const labels = this.parent.labels ??= {};

    switch ( this.activation.type ) {
      case "legendary":
        labels.featType = game.i18n.localize("DND5E.LegendaryActionLabel");
        break;
      case "lair":
        labels.featType = game.i18n.localize("DND5E.LairActionLabel");
        break;
      case "":
        labels.featType = game.i18n.localize("DND5E.Passive");
        break;
      default:
        labels.featType = game.i18n.localize(this.damage.length ? "DND5E.Attack" : "DND5E.Action");
        break;
    }

    // Recharge Label
    const chgSuffix = `${this.recharge.value}${parseInt(this.recharge.value) < 6 ? "+" : ""}`;
    labels.recharge = `${game.i18n.localize("DND5E.Recharge")} [${chgSuffix}]`;
  }
}
