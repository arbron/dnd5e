import { FormulaField } from "../../fields.mjs";
import { SystemDataModel } from "../../mixin.mjs";

/**
 * Data model template for item actions.
 *
 * @property {string} ability             Ability score to use when determining modifier.
 * @property {string} actionType          Action type as defined in `DND5E.itemActionTypes`.
 * @property {string} attackBonus         Numeric or dice bonus to attack rolls.
 * @property {string} chatFlavor          Extra text displayed in chat.
 * @property {object} critical            Information on how critical hits are handled.
 * @property {number} critical.threshold  Minimum number on the dice to roll a critical hit.
 * @property {string} critical.damage     Extra damage on critical hit.
 * @property {object} damage              Item damage formulas.
 * @property {string[][]} damage.parts    Array of damage formula and types.
 * @property {string} damage.versatile    Special versatile damage formula.
 * @property {string} formula             Other roll formula.
 * @property {object} save                Item saving throw data.
 * @property {string} save.ability        Ability required for the save.
 * @property {number} save.dc             Custom saving throw value.
 * @property {string} save.scaling        Method for automatically determining saving throw DC.
 */
export default class ActionTemplate extends SystemDataModel {
  static systemSchema() {
    return {
      ability: new foundry.data.fields.StringField({
        required: true, nullable: true, initial: null, choices: CONFIG.DND5E.abilities, label: ""
      }),
      actionType: new foundry.data.fields.StringField({
        required: true, nullable: true, initial: null, choices: CONFIG.DND5E.itemActionTypes,
        label: "DND5E.ItemActionType"
      }),
      attackBonus: new FormulaField({required: true, label: "DND5E.ItemAttackBonus"}),
      chatFlavor: new foundry.data.fields.StringField({required: true, label: "DND5E.ChatFlavor"}),
      critical: new foundry.data.fields.SchemaField({
        threshold: new foundry.data.fields.NumberField({
          required: true, integer: true, initial: null, positive: true, label: "DND5E.ItemCritThreshold"
        }),
        damage: new FormulaField({required: true, label: "DND5E.ItemCritExtraDamage"})
      }, {label: ""}),
      damage: new foundry.data.fields.SchemaField({
        parts: new foundry.data.fields.ArrayField(new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField()
        ), {required: true, label: ""}),
        versatile: new FormulaField({required: true, label: "DND5E.VersatileDamage"})
      }, {label: "DND5E.Damage"}),
      formula: new FormulaField({required: true, label: "DND5E.OtherFormula"}),
      save: new foundry.data.fields.SchemaField({
        ability: new foundry.data.fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilities, label: ""
        }),
        dc: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.AbbreviationDC"}),
        scaling: new foundry.data.fields.StringField({
          required: true, blank: false, initial: "spell", label: "DND5E.ScalingFormula"
        })
      }, {label: "DND5E.SavingThrow"})
    };
  }
}
