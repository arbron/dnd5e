import SystemDataModel from "../abstract.mjs";
import { FormulaField } from "../fields.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";

/**
 * Data definition for Tool items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 *
 * @property {string} toolType    Tool category as defined in `DND5E.toolTypes`.
 * @property {string} baseItem    Base tool as defined in `DND5E.toolIds` for determining proficiency.
 * @property {string} ability     Default ability when this tool is being used.
 * @property {string} chatFlavor  Additional text added to chat when this tool is used.
 * @property {number} proficient  Level of proficiency in this tool as defined in `DND5E.proficiencyLevels`.
 * @property {string} bonus       Bonus formula added to tool rolls.
 */
export default class ToolData extends SystemDataModel.mixin(ItemDescriptionTemplate, PhysicalItemTemplate) {
  static systemSchema() {
    return {
      toolType: new foundry.data.fields.StringField({required: true, label: "DND5E.ItemToolType"}),
      baseItem: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.ItemToolBase"}),
      ability: new foundry.data.fields.StringField({
        required: true, initial: "int", label: "DND5E.DefaultAbilityCheck"
      }),
      chatFlavor: new foundry.data.fields.StringField({required: true, label: "DND5E.ChatFlavor"}),
      proficient: new foundry.data.fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.ItemToolProficiency"
      }),
      bonus: new FormulaField({required: true, label: "DND5E.ItemToolBonus"})
    };
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [CONFIG.DND5E.abilities[this.ability]];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get physicalItemChatProperties() {
    const req = CONFIG.DND5E.attunementTypes.REQUIRED;
    return [
      this.attunement === req ? CONFIG.DND5E.attunements[req] : null,
      game.i18n.localize(this.equipped ? "DND5E.Equipped" : "DND5E.Unequipped"),
      CONFIG.DND5E.proficiencyLevels[this.proficient || 0]
    ];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get _typeAbilityMod() {
    return "int";
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritdoc */
  _preCreate(data) {
    if ( !this.parent.isEmbedded ) return;

    // If proficiency is explicitly specified, no further action is needed
    if ( foundry.utils.hasProperty(data, "system.proficient") ) return;

    switch (this.parent.actor.type) {
      case "character":
        // TODO: Change this to use a Set when actor data models are integrated
        const actorProfs = this.parent.actor.system.traits.toolProf.value ?? [];
        const proficient = actorProfs.includes(this.toolType) || actorProfs.includes(this.baseItem);
        this.updateSource({ proficient: Number(proficient) });
        return;
      case "npc":
        this.updateSource({ proficient: 1 });
    }
  }
}
