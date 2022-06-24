import { DataModel } from "/common/abstract/module.mjs";
import { DataField, ModelValidationError, ObjectField, StringField } from "/common/data/fields.mjs";


/**
 * @typedef {StringFieldOptions} FormulaFieldOptions
 * @property {boolean} [deterministic=false]  Is this formula not allowed to have dice values?
 */

/**
 * A subclass of StringField which represents a formula.
 * @param {FormulaFieldOptions} [options={}]  Options which configure the behavior of the field.
 *
 * @property {boolean} deterministic=false    Is this formula not allowed to have dice values?
 */
export class FormulaField extends StringField {

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      deterministic: false
    });
  }

  /** @inheritdoc */
  _validator(value) {
    const roll = new Roll(value);
    roll.evaluate({async: false});
    if ( this.deterministic && !roll.isDeterministic ) throw new Error("must not contain dice terms");
    super._validator(value);
  }

}

/* -------------------------------------------- */

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataModel type.
 * @param {DataModel} type                 The class of DataModel which should be embedded in this field
 * @param {DataFieldOptions} [options={}]  Options which configure the behavior of the field
 */
export class MappingField extends ObjectField {
  constructor(model, options) {
    // TODO: Should this also allow the validation of keys?
    super(options);
    if ( !(model instanceof DataField) ) {
      throw new Error(`${this.name} must have a DataField as its contained element`);
    }
    /**
     * The embedded DataModel definition which is contained in this field.
     * @type {*}
     */
    this.model = model;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _cleanType(value, options) {
    Object.values(value).forEach(v => this.model.clean(v, options));
    return value;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getInitialValue(data) {
    let keys = this.options.initialKeys;
    if ( !keys || !foundry.utils.isEmpty(this.initial) ) return super.getInitialValue(data);
    if ( !(keys instanceof Array) ) keys = Object.keys(keys);
    const initial = {};
    for ( const key of keys ) {
      initial[key] = {};
    }
    return initial;
  }

  /* -------------------------------------------- */

  /** @override */
  _validateType(value, options={}) {
    if ( typeof value !== "object" ) throw new Error("must by an Object");
    const errors = this._validateValues(value, options);
    if ( isEmpty(errors) ) throw new ModelValidationError(errors);
  }

  /* -------------------------------------------- */

  /**
   * Validate each value of the object.
   * @param {object} value    The object to validate.
   * @param {object} options  Validation options.
   * @returns {object}        An object of value-specific errors by key.
   */
  _validateValues(value, options) {
    const errors = {};
    for ( const [k, v] of Object.entries(value) ) {
      const error = this.model.validate(v, options);
      if ( error ) errors[k] = error;
    }
    return errors;
  }

  /* -------------------------------------------- */

  /** @override */
  initialize(model, name, value) {
    if ( !value ) return value;
    Object.values(value).forEach(v => this.model.initialize(model, name, v));
    return value;
  }

}
