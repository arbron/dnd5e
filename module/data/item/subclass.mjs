import { IdentifierField } from "../fields.mjs";
import { SystemDataMixin } from "../mixin.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data definition for Subclass items.
 * @see ItemDescriptionTemplate
 *
 * @property {string} identifier       Identifier slug for this subclass.
 * @property {string} classIdentifier  Identifier slug for the class with which this subclass should be associated.
 * @property {object[]} advancement    Advancement objects for this subclass.
 * @property {object} spellcasting              Details on subclass's spellcasting ability.
 * @property {string} spellcasting.progression  Spell progression granted by class as from `DND5E.spellProgression`.
 * @property {string} spellcasting.ability      Ability score to use for spellcasting.
 */
export default class SubclassData extends SystemDataMixin(ItemDescriptionTemplate) {
  static systemSchema() {
    return {
      identifier: new IdentifierField({required: true, label: "DND5E.Identifier"}),
      classIdentifier: new IdentifierField({
        required: true, label: "DND5E.ClassIdentifier", hint: "DND5E.ClassIdentifierHint"
      }),
      // TODO: Convert to proper advancement data when #1812 is merged
      advancement: new foundry.data.fields.ArrayField(
        new foundry.data.fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
      ),
      spellcasting: new foundry.data.fields.SchemaField({
        progression: new foundry.data.fields.StringField({
          required: true, initial: "none", choices: CONFIG.DND5E.spellProgression, label: "DND5E.SpellProgression"
        }),
        ability: new foundry.data.fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilities, label: "DND5E.SpellAbility"
        })
      }, {label: "DND5E.Spellcasting"})
    };
  }
}
