import SystemDataModel from "../abstract.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";

/**
 * Data definition for Loot items.
 * @see ItemDescriptionTemplate
 * @see PhysicalItemTemplate
 */
export default class LootData extends SystemDataModel.mixin(ItemDescriptionTemplate, PhysicalItemTemplate) {

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [
      game.i18n.localize("DND5E.ItemTypeLoot"),
      this.weight ? `${this.weight} ${game.i18n.localize("DND5E.AbbreviationLbs")}` : null
    ];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get physicalItemChatProperties() {
    return [this.equipped ? game.i18n.localize("DND5E.Equipped") : null];
  }
}
