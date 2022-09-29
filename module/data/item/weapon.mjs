import { MappingField } from "../fields.mjs";
import { SystemDataMixin } from "../mixin.mjs";
import ActionTemplate from "./templates/action.mjs";
import ActivatedEffectTemplate from "./templates/activated-effect.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import MountableTemplate from "./templates/mountable.mjs";

/**
 * Data definition for Weapon items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 * @see ActivatedEffectTemplate
 * @see ActionTemplate
 * @see MountableTemplate
 *
 * @property {string} weaponType   Weapon category as defined in `DND5E.weaponTypes`.
 * @property {string} baseItem     Base weapon as defined in `DND5E.weaponIds` for determining proficiency.
 * @property {object} properties   Mapping of various weapon property booleans.
 * @property {boolean} proficient  Does the weapon's owner have proficiency?
 */
export default class WeaponData extends SystemDataMixin(
  ItemDescriptionTemplate, PhysicalItemTemplate, ActivatedEffectTemplate, ActionTemplate, MountableTemplate
) {
  static systemSchema() {
    return {
      weaponType: new foundry.data.fields.StringField({
        required: true, initial: "simpleM", choices: CONFIG.DND5E.weaponTypes, label: "DND5E.ItemWeaponType"
      }),
      baseItem: new foundry.data.fields.StringField({
        required: true, blank: true, choices: CONFIG.DND5E.weaponIds, label: "DND5E.ItemWeaponBase"
      }),
      properties: new MappingField(new foundry.data.fields.BooleanField(), {
        required: true, initialKeys: CONFIG.DND5E.weaponProperties, label: "DND5E.ItemWeaponProperties"
      }),
      proficient: new foundry.data.fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
    };
  }
}
