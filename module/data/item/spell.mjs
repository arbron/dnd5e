import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { FormulaField } from "../fields.mjs";
import { mergeObjects } from "./base.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Spell items.
 * @see common.ItemDescriptionData
 * @see common.ActivatedEffectData
 * @see common.ActionData
 *
 * @property {number} level                      Base level of the spell.
 * @property {string} school                     Magical school to which this spell belongs.
 * @property {object} components                 General components and tags for this spell.
 * @property {boolean} components.vocal          Does this spell require vocal components?
 * @property {boolean} components.somatic        Does this spell require somatic components?
 * @property {boolean} components.material       Does this spell require material components?
 * @property {boolean} components.ritual         Can this spell be cast as a ritual?
 * @property {boolean} components.concentration  Does this spell require concentration?
 * @property {object} materials                  Details on material components required for this spell.
 * @property {string} materials.value            Description of the material components required for casting.
 * @property {boolean} materials.consumed        Are these material components consumed during casting?
 * @property {number} materials.cost             GP cost for the required components.
 * @property {number} materials.supply           Quantity of this component available.
 * @property {object} preparation                Details on how this spell is prepared.
 * @property {string} preparation.mode           Spell preparation mode as defined in `DND5E.spellPreparationModes`.
 * @property {boolean} preparation.prepared      Is the spell currently prepared?
 * @property {object} scaling                    Details on how casting at higher levels affects this spell.
 * @property {string} scaling.mode               Spell scaling mode as defined in `DND5E.spellScalingModes`.
 * @property {string} scaling.formula            Dice formula used for scaling.
 */
export default class ItemSpellData extends DataModel {
  static defineSchema() {
    return mergeObjects(
      common.ItemDescriptionData.defineSchema(),
      common.ActivatedEffectData.defineSchema(),
      common.ActionData.defineSchema(),
      {
        level: new fields.NumberField({required: true, integer: true, initial: 1, min: 0, label: "DND5E.SpellLevel"}),
        school: new fields.StringField({required: true, label: "DND5E.SpellSchool"}),
        components: new fields.SchemaField({ // TODO: This should be a MappingField to support custom components
          vocal: new fields.BooleanField({required: true, label: ""}),
          somantic: new fields.BooleanField({required: true, label: ""}),
          material: new fields.BooleanField({required: true, label: ""}),
          ritual: new fields.BooleanField({required: true, label: ""}),
          concentration: new fields.BooleanField({required: true, label: ""})
        }, {label: "DND5E.SpellComponents"}),
        materials: new fields.SchemaField({
          value: new fields.StringField({required: true, label: "DND5E.SpellMaterialsDescription"}),
          consumed: new fields.BooleanField({required: true, label: "DND5E.SpellMaterialsConsumed"}),
          cost: new fields.NumberField({required: true, initial: 0, min: 0, label: "DND5E.SpellMaterialsCost"}),
          supply: new fields.NumberField({required: true, initial: 0, min: 0, label: "DND5E.SpellMaterialsSupply"})
        }, {label: "DND5E.SpellMaterials"}),
        preparation: new fields.SchemaField({
          mode: new fields.StringField({
            required: true, initial: "prepared", choices: DND5E.spellPreparationModes,
            label: "DND5E.SpellPreparationMode"
          }),
          prepared: new fields.BooleanField({required: true, label: "DND5E.SpellPrepared"})
        }, {label: "DND5E.SpellPreparation"}),
        scaling: new fields.SchemaField({
          mode: new fields.StringField({
            required: true, initial: "none", choices: DND5E.spellScalingModes, label: "DND5E.ScalingMode"
          }),
          formula: new FormulaField({required: true, nullable: true, initial: null, label: "DND5E.ScalingFormula"})
        }, {label: "DND5E.LevelScaling"})
      }
    );
  }
}
