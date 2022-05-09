import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Background items.
 * @see common.ItemDescriptionData
 *
 * @property {object[]} advancement  Advancement objects for this background.
 */
export default class ItemBackgroundData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      {
        // TODO: Create advancement data
        advancement: new fields.ArrayField(
          new fields.ObjectField({label: ""}), {label: ""}
        )
      }
    );
  }
}
