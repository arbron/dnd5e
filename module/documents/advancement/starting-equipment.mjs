import Advancement from "./advancement.mjs";
import StartingEquipmentConfig from "../../applications/advancement/starting-equipment-config.mjs";
import { StartingEquipmentConfigurationData } from "../../data/advancement/starting-equipment.mjs";

/**
 * Advancement that stores information about starting equipment provided by classes & backgrounds.
 */
export default class StartingEquipmentAdvancement extends Advancement {

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      dataModels: {
        configuration: StartingEquipmentConfigurationData
      },
      order: 150,
      icon: "systems/dnd5e/icons/svg/starting-equipment.svg",
      title: game.i18n.localize("DND5E.Advancement.StartingEquipment.Title"),
      hint: game.i18n.localize("DND5E.Advancement.StartingEquipment.Hint"),
      validItemTypes: new Set(["class", "background"]),
      apps: {
        config: StartingEquipmentConfig
      }
    });
  }

  /* -------------------------------------------- */
  /*  Display Methods                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  summaryForLevel(level, { configMode=false }={}) {
    const topLevel = this.configuration.pool.filter(e => !e.group);
    if ( !topLevel.length ) return "";

    // If more than one entry, display as an unordered list (like for classes)
    if ( topLevel.length > 1 ) return `<ul>${topLevel.map(e => `<li>${e.label}</li>`).join("")}`;

    // Otherwise display as its own paragraph (like for backgrounds)
    return `<p>${game.i18n.getListFormatter().format(topLevel.map(e => e.label))}</p>`;
  }

  /* -------------------------------------------- */
  /*  Editing Methods                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static availableForItem(item) {
    return !item.advancement.byType.StartingEquipment?.length;
  }
}
