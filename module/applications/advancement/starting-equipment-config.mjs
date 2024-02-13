import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for Starting Equipment.
 */
export default class StartingEquipmentConfig extends AdvancementConfig {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "advancement", "starting-equipment"],
      template: "systems/dnd5e/templates/advancement/starting-equipment-config.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData(options={}) {
    const context = super.getData(options);
    return context;
  }
}
