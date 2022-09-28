import { SystemDataMixin } from "../mixin.mjs";
import {
  ActionTemplate, ActivatedEffectTemplate, ItemDescriptionTemplate, PhysicalItemTemplate
} from "./templates.mjs";

/**
 * Data definition for Consumable items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 * @see ActivatedEffectTemplate
 * @see ActionTemplate
 *
 * @property {string} consumableType     Type of consumable as defined in `DND5E.consumableTypes`.
 * @property {object} uses               Information on how the consumable can be used and destroyed.
 * @property {boolean} uses.autoDestroy  Should this item be destroyed when it runs out of uses.
 */
export default class ConsumableData extends SystemDataMixin(
  ItemDescriptionTemplate, PhysicalItemTemplate, ActivatedEffectTemplate, ActionTemplate) {
  static defineSchema() {
    const usesFields = foundry.utils.deepClone(ActivatedEffectTemplate.templateSchema().uses.fields);
    Object.values(usesFields).forEach(v => v.parent = undefined);
    return {
      ...this.templateSchema(),
      consumableType: new foundry.data.fields.StringField({
        required: true, initial: "potion", choices: CONFIG.DND5E.consumableTypes, label: "DND5E.ItemConsumableType"
      }),
      uses: new foundry.data.fields.SchemaField({
        ...usesFields,
        autoDestroy: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemDestroyEmpty"})
      }, {label: "DND5E.LimitedUses"})
    };
  }
}
