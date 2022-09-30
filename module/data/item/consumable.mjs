import SystemDataModel from "../abstract.mjs";
import ActionTemplate from "./templates/action.mjs";
import ActivatedEffectTemplate from "./templates/activated-effect.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";

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
export default class ConsumableData extends SystemDataModel.mixed(
  ItemDescriptionTemplate, PhysicalItemTemplate, ActivatedEffectTemplate, ActionTemplate
) {
  static systemSchema() {
    const usesFields = foundry.utils.deepClone(ActivatedEffectTemplate.systemSchema().uses.fields);
    Object.values(usesFields).forEach(v => v.parent = undefined);

    return {
      consumableType: new foundry.data.fields.StringField({
        required: true, initial: "potion", label: "DND5E.ItemConsumableType"
      }),
      uses: new foundry.data.fields.SchemaField({
        ...usesFields,
        autoDestroy: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemDestroyEmpty"})
      }, {label: "DND5E.LimitedUses"})
    };
  }
}
