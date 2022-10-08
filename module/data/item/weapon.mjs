import SystemDataModel from "../abstract.mjs";
import { MappingField } from "../fields.mjs";
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
export default class WeaponData extends SystemDataModel.mixin(
  ItemDescriptionTemplate, PhysicalItemTemplate, ActivatedEffectTemplate, ActionTemplate, MountableTemplate
) {
  static systemSchema() {
    return {
      weaponType: new foundry.data.fields.StringField({
        required: true, initial: "simpleM", label: "DND5E.ItemWeaponType"
      }),
      baseItem: new foundry.data.fields.StringField({
        required: true, blank: true, label: "DND5E.ItemWeaponBase"
      }),
      properties: new MappingField(new foundry.data.fields.BooleanField(), {
        required: true, initialKeys: CONFIG.DND5E.weaponProperties, label: "DND5E.ItemWeaponProperties"
      }),
      proficient: new foundry.data.fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /**
   * Migrate the weapons's properties object to remove any old, non-boolean values.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migratePropertiesData(source) {
    if ( !source.properties ) return;
    for ( const [key, value] of Object.entries(source.properties) ) {
      if ( typeof value !== "boolean" ) delete source.properties[key];
    }
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [CONFIG.DND5E.weaponTypes[this.weaponType]];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get _typeAbilityMod() {
    const abilities = this.parent?.actor?.system.abilities;
    if ( !abilities ) return null;

    // Finesse weapons - Str or Dex (PHB pg. 147)
    if ( this.properties.fin === true ) {
      return (abilities.dex?.mod ?? 0) >= (abilities.str?.mod ?? 0) ? "dex" : "str";
    }

    // Ranged weapons - Dex (PH p.194)
    if ( ["simpleR", "martialR"].includes(this.weaponType) ) return "dex";

    return null;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get _typeCriticalThreshold() {
    return this.parent?.actor?.flags.dnd5e?.weaponCriticalThreshold ?? Infinity;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritdoc */
  _preCreate(data) {
    if ( !this.parent.isEmbedded || (this.parent.actor.type === "vehicle") ) return;
    const updates = {};

    // NPCs automatically equip items and are proficient with them
    if ( this.parent.actor.type === "npc" ) {
      if ( !foundry.utils.hasProperty(data, "system.equipped") ) updates.equipped = true;
      if ( !foundry.utils.hasProperty(data, "system.proficient") ) updates.proficient = true;
      this.updateSource(updates);
      return;
    }

    // If proficiency is explicitly specified, no further action is needed
    if ( foundry.utils.hasProperty(data, "system.proficient") ) return;

    // Some weapon types are always proficient
    const weaponProf = CONFIG.DND5E.weaponProficienciesMap[this.weaponType];
    if ( weaponProf === true ) updates.proficient = true;

    // Characters may have proficiency in this weapon type (or specific base weapon)
    else {
      // TODO: Change this to use a Set when actor data models are integrated
      const actorProfs = this.parent.actor.system.traits?.weaponProf?.value ?? [];
      updates.proficient = actorProfs.includes(weaponProf) || actorProfs.includes(this.baseItem);
    }

    this.updateSource(updates);
  }
}
