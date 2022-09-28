/**
 * Data Model variant with some extra methods to support template mixins.
 */
export class BaseSystemDataModel extends foundry.abstract.DataModel {

  /**
   * Name of the base templates used for construction.
   * @type {string[]}
   */
  static _templates;

  /* -------------------------------------------- */

  /**
   * Return the merged template schema.
   * @returns {object}
   */
  static templateSchema() {
    const template = {};
    this._templates?.forEach(t => foundry.utils.mergeObject(template, this[`${t}_templateSchema`]()));
    return template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    for ( const key of Object.getOwnPropertyNames(this) ) {
      if ( (key === "migrateData") || !key.startsWith("migrate") ) continue;
      this[key](source);
    }
    return super.migrateData(source);
  }
}

/**
 * Mixin for system data models to allow merging multiple templates into a single model.
 * @param {...*} templates  Template classes to merge.
 * @returns {DataModel}
 */
export function SystemDataMixin(...templates) {
  const Base = class extends BaseSystemDataModel {};

  Base._templates = [];
  for ( const template of templates ) {
    Base._templates.push(template.name);
    for ( const key of Object.getOwnPropertyNames(template) ) {
      if ( ["length", "migrateData", "name", "prototype"].includes(key) ) continue;
      if ( key === "templateSchema" ) {
        Base[`${template.name}_templateSchema`] = template.templateSchema;
        continue;
      }
      Base[key] = template[key];
    }
    for ( const key of Object.getOwnPropertyNames(template.prototype) ) {
      if ( ["constructor"].includes(key) ) continue;
      Base.prototype[key] = template.prototype[key];
    }
  }

  return Base;
}
