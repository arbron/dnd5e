import * as common from "./common.mjs";

/**
 * Data definition for Background items.
 * @see common.ItemDescriptionData
 *
 * @property {object[]} advancement  Advancement objects for this background.
 */
export default class ItemBackgroundData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ...common.ItemDescriptionData.defineSchema(),
      // TODO: Convert to proper advancement data when #1812 is merged
      advancement: new foundry.data.fields.ArrayField(
        new foundry.data.fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
      )
    };
  }
}
