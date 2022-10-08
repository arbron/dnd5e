import SystemDataModel from "../abstract.mjs";
import ActionTemplate from "./templates/action.mjs";
import ActivatedEffectTemplate from "./templates/activated-effect.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import MountableTemplate from "./templates/mountable.mjs";

/**
 * Data definition for Equipment items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 * @see ActivatedEffectTemplate
 * @see ActionTemplate
 * @see MountableTemplate
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
export default class EquipmentData extends SystemDataModel.mixin(
  ItemDescriptionTemplate, PhysicalItemTemplate, ActivatedEffectTemplate, ActionTemplate, MountableTemplate
) {
  static systemSchema() {
    return {
      armor: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({
          required: true, initial: "light", label: "DND5E.ItemEquipmentType"
        }),
        value: new foundry.data.fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.ArmorClass"}),
        dex: new foundry.data.fields.NumberField({required: true, integer: true, label: "DND5E.ItemEquipmentDexMod"})
      }, {label: ""}),
      baseItem: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.ItemEquipmentBase"}),
      speed: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.Speed"}),
        conditions: new foundry.data.fields.StringField({required: true, label: "DND5E.SpeedConditions"})
      }, {label: "DND5E.Speed"}),
      strength: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.ItemRequiredStr"
      }),
      stealth: new foundry.data.fields.BooleanField({required: true, label: "DND5E.ItemEquipmentStealthDisav"}),
      proficient: new foundry.data.fields.BooleanField({required: true, initial: true, label: "DND5E.Proficient"})
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /**
   * Migrate "bonus" armor subtypes to "trinket".
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateArmorTypeData(source) {
    if ( source.armor?.type !== "bonus" ) return;
    source.armor ??= {};
    source.armor.type = "trinket";
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [
      CONFIG.DND5E.equipmentTypes[this.armor.type],
      this.parent.labels?.armor ?? null,
      this.stealth ? game.i18n.localize("DND5E.StealthDisadvantage") : null
    ];
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedEquipmentLabels() {
    const labels = this.parent.labels ??= {};
    labels.armor = this.armor.value ? `${this.armor.value} ${game.i18n.localize("DND5E.AC")}` : "";
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritdoc */
  _preCreate(data) {
    if ( !this.parent.isEmbedded ) return;
    const updates = {};

    // NPCs automatically equip equipment and are proficient with them
    if ( this.parent.actor.type === "npc" ) {
      if ( !foundry.utils.hasProperty(data, "system.equipped") ) updates.equipped = true;
      if ( !foundry.utils.hasProperty(data, "system.proficient") ) updates.proficient = true;
      this.updateSource(updates);
      return;
    }

    // If proficiency is explicitly specified, no further action is needed
    if ( foundry.utils.hasProperty(data, "system.proficient") ) return;

    // Some armor types are always proficient
    const armorProf = CONFIG.DND5E.armorProficienciesMap[this.armor.type];
    if ( armorProf === true ) updates.proficient = true;

    // Characters may have proficiency in this armor type (or specific base armor)
    else {
      // TODO: Change this to use a Set when actor data models are integrated
      const actorProfs = this.parent.actor.system.traits?.armorProf?.value ?? [];
      updates.proficient = actorProfs.includes(armorProf) || actorProfs.includes(this.baseItem);
    }

    this.updateSource(updates);
  }
}
