/**
 * @typedef {StringFieldOptions} FormulaFieldOptions
 * @property {boolean} [deterministic=false]  Is this formula not allowed to have dice values?
 */

/**
 * Special case StringField which represents a formula.
 *
 * @param {FormulaFieldOptions} [options={}]  Options which configure the behavior of the field.
 * @property {boolean} deterministic=false    Is this formula not allowed to have dice values?
 */
export class FormulaField extends foundry.data.fields.StringField {

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      deterministic: false
    });
  }

  /** @inheritdoc */
  _validateType(value) {
    const roll = new Roll(value);
    roll.evaluate({async: false});
    if ( this.deterministic && !roll.isDeterministic ) throw new Error("must not contain dice terms");
    super._validateType(value);
  }
}

/* -------------------------------------------- */

/**
 * Special case StringField that includes automatic validation for identifiers.
 */
export class IdentifierField extends foundry.data.fields.StringField {

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      validationError: "is not a valid Identifier string"
    });
  }

  /** @override */
  _validateType(value) {
    if ( !dnd5e.utils.validators.isValidIdentifier(value) ) throw new Error(game.i18n.localize("DND5E.IdentifierError"));
  }
}

/* -------------------------------------------- */

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataField type.
 *
 * @param {DataField} type                 The class of DataField which should be embedded in this field.
 * @param {DataFieldOptions} [options={}]  Options which configure the behavior of the field.
 */
export class MappingField extends foundry.data.fields.ObjectField {
  constructor(model, options) {
    if ( !(model instanceof foundry.data.fields.DataField) ) {
      throw new Error("MappingField must have a DataField as its contained element");
    }
    super(options);

    /**
     * The embedded DataField definition which is contained in this field.
     * @type {DataField}
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
    if ( !keys || !foundry.utils.isEmpty(this.initial()) ) return super.getInitialValue(data);
    if ( !(keys instanceof Array) ) keys = Object.keys(keys);
    const initial = {};
    for ( const key of keys ) {
      initial[key] = this.model.getInitialValue();
    }
    return initial;
  }

  /* -------------------------------------------- */

  /** @override */
  _validateType(value, options={}) {
    if ( typeof value !== "object" ) throw new Error("must by an Object");
    const errors = this._validateValues(value, options);
    if ( !foundry.utils.isEmpty(errors) ) throw new foundry.data.fields.ModelValidationError(errors);
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
  initialize(value, model) {
    if ( !value ) return value;
    Object.values(value).forEach(v => this.model.initialize(v, model));
    return value;
  }
}
