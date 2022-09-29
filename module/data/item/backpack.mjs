import { SystemDataMixin } from "../mixin.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import { CurrencyData } from "../actor/common.mjs";


/**
 * Data definition for Backpack items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 *
 * @property {object} capacity              Information on container's carrying capacity.
 * @property {string} capacity.type         Method for tracking max capacity as defined in `DND5E.itemCapacityTypes`.
 * @property {number} capacity.value        Total amount of the type this container can carry.
 * @property {boolean} capacity.weightless  Does the weight of the items in the container carry over to the actor?
 * @property {CurrencyData} currency        Amount of currency currently held by the container.
 */
export default class BackpackData extends SystemDataMixin(ItemDescriptionTemplate, PhysicalItemTemplate) {
  static systemSchema() {
    return {
      capacity: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({
          required: true, initial: "weight", choices: CONFIG.DND5E.itemCapacityTypes,
          label: "DND5E.ItemContainerCapacityType"
        }),
        value: new foundry.data.fields.NumberField({
          required: true, nullable: false, initial: 0, min: 0, label: "DND5E.ItemContainerCapacityMax"
        }),
        weightless: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemContainerWeightless"})
      }, {label: "DND5E.ItemContainerCapacity"}),
      currency: new foundry.data.fields.EmbeddedDataField(CurrencyData, {label: "DND5E.Currency"})
    };
  }
}
