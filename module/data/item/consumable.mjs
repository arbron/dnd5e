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
export default class ConsumableData extends foundry.abstract.DataModel {
  static defineSchema() {
    const usesFields = foundry.utils.deepClone(common.ActivatedEffectData.schema.fields.uses.fields);
    Object.values(usesFields).forEach(v => v.parent = undefined);
    return {
      ...common.ItemDescriptionData.defineSchema(),
      ...common.PhysicalItemData.defineSchema(),
      ...common.ActivatedEffectData.defineSchema(),
      ...common.ActionData.defineSchema(),
      consumableType: new foundry.data.fields.StringField({
        required: true, initial: "potion", choices: CONFIG.DND5E.consumableTypes, label: "DND5E.ItemConsumableType"
      }),
      uses: new foundry.data.fields.SchemaField({
        ...usesFields,
        autoDestroy: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemDestroyEmpty"})
      }, {label: "DND5E.LimitedUses"})
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    common.PhysicalItemData.migrateData(source);
    return super.migrateData(source);
  }
}
