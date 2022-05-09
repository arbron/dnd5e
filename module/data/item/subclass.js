import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Subclass items.
 * @see common.ItemDescriptionData
 *
 * @property {string} identifier       Identifier slug for this subclass.
 * @property {string} classIdentifier  Identifier slug for the class with which this subclass should be associated.
 * @property {object[]} advancement    Advancement objects for this subclass.
 * @property {object} spellcasting              Details on subclass's spellcasting ability.
 * @property {string} spellcasting.progression  Spell progression granted by class as from `DND5E.spellProgression`.
 * @property {string} spellcasting.ability      Ability score to use for spellcasting.
 */
export default class ItemSubclassData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      {
        // TODO: Ensure this is a valid slug
        identifier: new fields.StringField({required: true, label: ""}),
        classIdentifier: new fields.StringField({required: true, label: ""}),
        // TODO: Create advancement data
        advancement: new fields.ArrayField(
          new fields.ObjectField({label: ""}), {label: ""}
        ),
        spellcasting: new fields.SchemaField({
          progression: new fields.StringField({
            required: true, initial: "none", choices: CONFIG.DND5E.spellProgression, label: ""
          }),
          ability: new fields.StringField({required: true, blank: true, choices: CONFIG.DND5E.abilities, label: ""})
        }, {label: ""})
      }
    );
  }
}