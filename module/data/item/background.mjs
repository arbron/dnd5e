import { SystemDataMixin } from "../mixin.mjs";
import { ItemDescriptionTemplate } from "./templates.mjs";

/**
 * Data definition for Background items.
 * @see ItemDescriptionTemplate
 *
 * @property {object[]} advancement  Advancement objects for this background.
 */
export default class BackgroundData extends SystemDataMixin(ItemDescriptionTemplate) {
  static defineSchema() {
    return {
      ...this.templateSchema(),
      // TODO: Convert to proper advancement data when #1812 is merged
      advancement: new foundry.data.fields.ArrayField(
        new foundry.data.fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
      )
    };
  }
}
