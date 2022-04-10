import { DataModel } from "/common/abstract/module.mjs";
import { ObjectField, StringField } from "/common/data/fields.mjs";


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
    if ( !isSubclass(model, DataModel) ) {
      throw new Error("An EmbeddedDataField must specify a DataModel class as its type");
    }
    /**
     * The embedded DataModel definition which is contained in this field.
     * @type {*}
     */
    this.model = model;
  }

  /** @override */
  clean(value, data, options) {
    value = this._cast(value);
    for ( let v of Object.values(value) ) {
      if ( this.options.clean instanceof Function ) v = this.options.clean.call(this, v);
      v = this.model.cleanData(this.model.schema, v, options);
    }
    return value;
  }

  /** @override */
  validate(value, options={}) {
    const errors = {};
    for ( const [k, v] of Object.entries(value) ) {
      const err = this.model.validateSchema(this.model.schema, v, options);
      if ( !foundry.utils.isEmpty(err) ) errors[k] = err;
    }
    if ( !foundry.utils.isEmpty(errors) ) throw new Error(DataModel.formatValidationErrors(errors));
    return super.validate(value, options);
  }

  /** @override */
  initialize(model, name, value) {
    if ( !value ) return value;
    value = foundry.utils.deepClone(value);
    for ( let v of Object.values(value) ) {
      v = new this.model(v, {parent: model});
    }
    return value;
  }

}
