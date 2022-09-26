import * as common from "./common.mjs";

/**
 * Data definition for Weapon items.
 * @see common.ItemDescriptionData
 * @see common.PhysicalItemData
 * @see common.ActivatedEffectData
 * @see common.ActionData
 * @see common.MountableData
 *
 * @property {string} weaponType   Weapon category as defined in `DND5E.weaponTypes`.
 * @property {string} baseItem     Base weapon as defined in `DND5E.weaponIds` for determining proficiency.
 * @property {object} properties   Mapping of various weapon property booleans.
 * @property {boolean} proficient  Does the weapon's owner have proficiency?
 */
export default class ItemWeaponData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...common.ItemDescriptionData.defineSchema(),
      ...common.PhysicalItemData.defineSchema(),
      ...common.ActivatedEffectData.defineSchema(),
      ...common.ActionData.defineSchema(),
      ...common.MountableData.defineSchema(),
      weaponType: new foundry.data.fields.StringField({
        required: true, initial: "simpleM", choices: CONFIG.DND5E.weaponTypes, label: "DND5E.ItemWeaponType"
      }),
      baseItem: new foundry.data.fields.StringField({
        required: true, blank: true, choices: CONFIG.DND5E.weaponIds, label: "DND5E.ItemWeaponBase"
      }),
      // TODO: Replace with MappingField
      properties: new foundry.data.fields.ObjectField({required: true, label: "DND5E.ItemWeaponProperties"}),
      proficient: new foundry.data.fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    common.PhysicalItemData.migrateData(source);
    return super.migrateData(source);
  }
}
