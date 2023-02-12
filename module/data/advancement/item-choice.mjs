import { MappingField } from "../fields.mjs";
import SpellConfigurationData from "./spell-config.mjs";

/**
 * Data model for the Item Choice advancement configuration.
 *
 * @property {string} hint                     Brief hint text displayed when the choice is presented.
 * @property {Object<number, number>} choices  Number of choices presented at specific levels.
 * @property {boolean} allowDrops              Is the player allowed to drop their own items?
 * @property {string} type                     Item type restriction (e.g. `spell`, `feat`, etc.).
 * @property {Array<string>} pool              List of item UUIDs to present as choices.
 * @property {SpellConfigurationData} spell    Spell configuration if the spell item type is chosen.
 * @property {object} restriction
 * @property {string} restriction.type         Item system type restriction (e.g. `classfeature`).
 * @property {string} restriction.subtype      Item subtype restriction (e.g. `invocation`, `fightingstyle`).
 * @property {string} restriction.level        Level that a spell must be to be chosen, or "available" to only allow
 *                                             selection of spells that the character can currently cast.
 * @property {object} table
 * @property {boolean} table.show              Is the choice displayed as a scale value column on the class table?
 * @property {string} table.header             The column header text, otherwise advancement name is used.
 */
export default class ItemChoiceConfigurationData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      hint: new foundry.data.fields.StringField({label: "DND5E.AdvancementHint"}),
      choices: new MappingField(new foundry.data.fields.NumberField(), {
        hint: "DND5E.AdvancementItemChoiceLevelsHint"
      }),
      allowDrops: new foundry.data.fields.BooleanField({
        initial: true, label: "DND5E.AdvancementConfigureAllowDrops",
        hint: "DND5E.AdvancementConfigureAllowDropsHint"
      }),
      type: new foundry.data.fields.StringField({
        blank: false, nullable: true, initial: null,
        label: "DND5E.AdvancementItemChoiceType", hint: "DND5E.AdvancementItemChoiceTypeHint"
      }),
      pool: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {label: "DOCUMENT.Items"}),
      spell: new foundry.data.fields.EmbeddedDataField(SpellConfigurationData, {nullable: true, initial: null}),
      restriction: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({label: "DND5E.Type"}),
        subtype: new foundry.data.fields.StringField({label: "DND5E.Subtype"}),
        level: new foundry.data.fields.StringField({label: "DND5E.SpellLevel"})
      }),
      table: new foundry.data.fields.SchemaField({
        show: new foundry.data.fields.BooleanField({
          label: "DND5E.AdvancementItemChoiceColumnDisplay", hint: "DND5E.AdvancementItemChoiceColumnDisplayHint"
        }),
        header: new foundry.data.fields.StringField({label: "DND5E.AdvancementItemChoiceColumnHeader"})
      })
    };
  }
}
