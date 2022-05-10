import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Equipment items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 * @see common.ActivatedEffectData
 * @see common.ActionData
 * @see common.MountableData
 *
 * @property {object} armor             Armor details and equipment type information.
 * @property {string} armor.type        Equipment type as defined in `DND5E.equipmentTypes`.
 * @property {number} armor.value       Base armor class or shield bonus.
 * @property {number} armor.dex         Maximum dex bonus added to armor class.
 * @property {string} baseItem          Base armor as defined in `DND5E.armorIds` for determining proficiency.
 * @property {object} speed             Speed granted by a piece of vehicle equipment.
 * @property {number} speed.value       Speed granted by this piece of equipment measured in feet or meters
 *                                      depending on system setting.
 * @property {string} speed.conditions  Conditions that may affect item's speed.
 * @property {number} strength          Minimum strength required to use a piece of armor.
 * @property {boolean} stealth          Does this equipment grant disadvantage on stealth checks when used?
 * @property {boolean} proficient       Does the owner have proficiency in this piece of equipment?
 */
export default class ItemEquipmentData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.PhysicalItemData.defineSchema(),
      common.ActivatedEffectData.defineSchema(),
      common.ActionData.defineSchema(),
      common.MountableData.defineSchema(),
      {
        armor: new fields.SchemaField({
          type: new fields.StringField({
            required: true, initial: "light", choices: CONFIG.DND5E.equipmentTypes, label: "DND5E.ItemEquipmentType"
          }),
          value: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.ArmorClass"}),
          dex: new fields.NumberField({required: true, integer: true, label: "DND5E.ItemEquipmentDexMod"})
        }, {label: ""}),
        baseItem: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.armorIds, label: "DND5E.ItemEquipmentBase"
        }),
        speed: new fields.SchemaField({
          value: new fields.NumberField({required: true, min: 0, label: "DND5E.Speed"}),
          conditions: new fields.StringField({required: true, label: "DND5E.SpeedConditions"})
        }, {label: "DND5E.Speed"}),
        strength: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.ItemRequiredStr"
        }),
        stealth: new fields.BooleanField({required: true, label: "DND5E.ItemEquipmentStealthDisav"}),
        proficient: new fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
      }
    );
  }
}
