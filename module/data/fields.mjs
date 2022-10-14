/**
 * Data field that automatically selects the Activity-specific configuration data models.
 *
 * @param {DataModel} origin  Data Model class to which this field belongs. Should define a `metadata.dataModels`
 *                            object that indicates what data models should be fetched.
 */
export class AutoModelDataField extends foundry.data.fields.ObjectField {
  constructor(origin, options={}) {
    super(options);
    this.origin = origin;
  }

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {required: true});
  }

  getModel() {
    return this.origin.metadata?.dataModels?.[this.name];
  }

  _cleanType(value, options) {
    if ( !(typeof value === "object") ) value = {};

    // Use a defined DataModel
    const cls = this.getModel();
    if ( cls ) return cls.cleanData(value, options);

    return value;
  }

  initialize(value, model) {
    const cls = this.getModel();
    if ( cls ) return new cls(value, {parent: model});
    return foundry.utils.deepClone(value);
  }
}
