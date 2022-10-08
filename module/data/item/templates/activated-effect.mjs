import SystemDataModel from "../../abstract.mjs";
import { FormulaField } from "../../fields.mjs";

/**
 * Data model template for items that can be used as some sort of action.
 *
 * @property {object} activation            Effect's activation conditions.
 * @property {string} activation.type       Activation type as defined in `DND5E.abilityActivationTypes`.
 * @property {number} activation.cost       How much of the activation type is needed to use this item's effect.
 * @property {string} activation.condition  Special conditions required to activate the item.
 * @property {object} duration              Effect's duration.
 * @property {number} duration.value        How long the effect lasts.
 * @property {string} duration.units        Time duration period as defined in `DND5E.timePeriods`.
 * @property {object} target                Effect's valid targets.
 * @property {number} target.value          Length or radius of target depending on targeting mode selected.
 * @property {number} target.width          Width of line when line type is selected.
 * @property {string} target.units          Units used for value and width as defined in `DND5E.distanceUnits`.
 * @property {string} target.type           Targeting mode as defined in `DND5E.targetTypes`.
 * @property {object} range                 Effect's range.
 * @property {number} range.value           Regular targeting distance for item's effect.
 * @property {number} range.long            Maximum targeting distance for features that have a separate long range.
 * @property {string} range.units           Units used for value and long as defined in `DND5E.distanceUnits`.
 * @property {object} uses                  Effect's limited uses.
 * @property {number} uses.value            Current available uses.
 * @property {string} uses.max              Maximum possible uses or a formula to derive that number.
 * @property {string} uses.per              Recharge time for limited uses as defined in `DND5E.limitedUsePeriods`.
 * @property {object} consume               Effect's resource consumption.
 * @property {string} consume.type          Type of resource to consume as defined in `DND5E.abilityConsumptionTypes`.
 * @property {string} consume.target        Item ID or resource key path of resource to consume.
 * @property {number} consume.amount        Quantity of the resource to consume per use.
 */
export default class ActivatedEffectTemplate extends SystemDataModel {
  static systemSchema() {
    return {
      activation: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.ItemActivationType"}),
        cost: new foundry.data.fields.NumberField({
          required: true, nullable: false, initial: 0, label: "DND5E.ItemActivationCost"
        }),
        condition: new foundry.data.fields.StringField({required: true, label: "DND5E.ItemActivationCondition"})
      }, {label: "DND5E.ItemActivation"}),
      duration: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.Duration"}),
        units: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.DurationType"})
      }, {label: "DND5E.Duration"}),
      target: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.TargetValue"}),
        width: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.TargetWidth"}),
        units: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.TargetUnits"}),
        type: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.TargetType"})
      }, {label: "DND5E.Target"}),
      range: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.RangeNormal"}),
        long: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.RangeLong"}),
        units: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.RangeUnits"})
      }, {label: "DND5E.Range"}),
      uses: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.LimitedUsesAvailable"}),
        // Max uses cannot be FormulaField because it supports unconventional syntax
        max: new foundry.data.fields.StringField({required: true, label: "DND5E.LimitedUsesMax"}),
        per: new foundry.data.fields.StringField({
          required: true, blank: false, nullable: true, initial: null, label: "DND5E.LimitedUsesPer"
        }),
        recovery: new FormulaField({required: true, label: "DND5E.RecoveryFormula"})
      }, {label: "DND5E.LimitedUses"}),
      consume: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.ConsumeType"}),
        target: new foundry.data.fields.StringField({
          required: true, blank: false, nullable: true, initial: null, label: "DND5E.ConsumeTarget"
        }),
        amount: new foundry.data.fields.NumberField({required: true, label: "DND5E.ConsumeAmount"})
      }, {label: "DND5E.ConsumeTitle"})
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /**
   * Ensure a 0 in max uses is converted to an empty string rather than "0".
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateMaxUses(source) {
    if ( (source.uses?.max === 0) || (source.uses?.max === "0") ) source.uses.max = "";
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Chat properties for activated effects.
   * @type {string[]}
   */
  get activatedEffectChatProperties() {
    return [
      this.parent.labels.activation + (this.activation.condition ? ` (${this.activation.condition})` : ""),
      this.parent.labels.target,
      this.parent.labels.range,
      this.parent.labels.duration
    ];
  }

  /* -------------------------------------------- */

  /**
   * Does the Item have an area of effect target?
   * @type {boolean}
   */
  get hasAreaTarget() {
    return this.target.type in CONFIG.DND5E.areaTargetTypes;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item target one or more distinct targets.
   * @type {boolean}
   */
  get hasIndividualTarget() {
    return this.target.type in CONFIG.DND5E.individualTargetTypes;
  }

  /* -------------------------------------------- */

  /**
   * Is this Item limited in its ability to be used by charges or by recharge?
   * @type {boolean}
   */
  get hasLimitedUses() {
    return this.uses.per && (this.uses.max > 0);
  }

  /* -------------------------------------------- */

  /**
   * Does the Item have a target?
   * @type {boolean}
   */
  get hasTarget() {
    return !["none", ""].includes(this.target.type);
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /**
   * Reset certain values if their types or units don't accept values.
   */
  prepareBaseActivationData() {
    // Target values
    if ( ["none", "self"].includes(this.target.type) ) this.target.value = this.target.units = null;
    else if ( ["none", "touch", "self"].includes(this.target.units) ) this.target.value = null;

    // Range values
    if ( ["none", "touch", "self"].includes(this.range.units) ) this.range.value = this.range.long = null;

    // Duration values
    if ( ["inst", "perm"].includes(this.duration.units) ) this.duration.value = null;
  }

  /* -------------------------------------------- */

  /**
   * Prepare labels for activated effects.
   */
  prepareDerivedActivationLabels() {
    const labels = this.parent.labels ??= {};

    labels.activation = [
      this.activation.cost,
      CONFIG.DND5E.abilityActivationTypes[this.activation.type]
    ].filterJoin(" ");

    labels.target = [
      this.target.value,
      CONFIG.DND5E.distanceUnits[this.target.units],
      CONFIG.DND5E.targetTypes[this.target.type]
    ].filterJoin(" ");

    labels.range = [
      this.range.value,
      this.range.long ? `/ ${this.range.long}` : null,
      CONFIG.DND5E.distanceUnits[this.range.units]
    ].filterJoin(" ");

    labels.duration = [
      this.duration.value,
      CONFIG.DND5E.timePeriods[this.duration.units]
    ].filterJoin(" ");
  }
}
