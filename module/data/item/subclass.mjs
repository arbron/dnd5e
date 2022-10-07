import SystemDataModel from "../abstract.mjs";
import { IdentifierField } from "../fields.mjs";
import AdvancementTemplate from "./templates/advancement.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data definition for Subclass items.
 * @see ItemDescriptionTemplate
 * @see AdvancementTemplate
 *
 * @property {string} identifier       Identifier slug for this subclass.
 * @property {string} classIdentifier  Identifier slug for the class with which this subclass should be associated.
 * @property {object} spellcasting              Details on subclass's spellcasting ability.
 * @property {string} spellcasting.progression  Spell progression granted by class as from `DND5E.spellProgression`.
 * @property {string} spellcasting.ability      Ability score to use for spellcasting.
 */
export default class SubclassData extends SystemDataModel.mixin(ItemDescriptionTemplate, AdvancementTemplate) {
  static systemSchema() {
    return {
      identifier: new IdentifierField({required: true, label: "DND5E.Identifier"}),
      classIdentifier: new IdentifierField({
        required: true, label: "DND5E.ClassIdentifier", hint: "DND5E.ClassIdentifierHint"
      }),
      spellcasting: new foundry.data.fields.SchemaField({
        progression: new foundry.data.fields.StringField({
          required: true, initial: "none", label: "DND5E.SpellProgression"
        }),
        ability: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.SpellAbility"})
      }, {label: "DND5E.Spellcasting"})
    };
  }
}
