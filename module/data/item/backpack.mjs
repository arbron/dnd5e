import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";
import { CurrencyData } from "../actor/common.mjs";


/**
 * Data definition for Backpack items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 *
 * @property {object} capacity              Information on container's carrying capacity.
 * @property {string} capacity.type         Method for tracking max capacity as defined in `DND5E.itemCapacityTypes`.
 * @property {number} capacity.value        Total amount of the type this container can carry.
 * @property {boolean} capacity.weightless  Does the weight of the items in the container carry over to the actor?
 * @property {CurrencyData} currency        Amount of currency currently held by the container.
 */
export class ItemBackpackData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema(),
      {
        capacity: new fields.SchemaField({
          type: new fields.StringField({
            required: true, initial: "weight", choices: CONFIG.DND5E.itemCapacityTypes,
            label: "DND5E.ItemContainerCapacityType"
          }),
          value: new fields.NumberField({
            required: true, nullable: false, initial: 0, min: 0, label: "DND5E.ItemContainerCapacityMax"
          }),
          weightless: new fields.BooleanField({required: true, label: "DND5E.ItemContainerWeightless"})
        }, {label: "DND5E.ItemContainerCapacity"}),
        currency: new fields.EmbeddedDataField(CurrencyData, {label: "DND5E.Currency"})
      }
    );
  }
}
