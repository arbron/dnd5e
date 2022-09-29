/**
 * Data Model variant with some extra methods to support template mixins.
 */
export class SystemDataModel extends foundry.abstract.DataModel {

  /**
   * Name of the base templates used for construction.
   * @type {string[]}
   */
  static _templates;

  /* -------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    let schema = {};
    this._templates?.forEach(t => schema = { ...schema, ...this[`${t}_systemSchema`]() });
    return { ...schema, ...this.systemSchema() };
  }

  /* -------------------------------------------- */

  /**
   * Specific schema that will be merged with template schema.
   * @returns {object}
   */
  static systemSchema() {
    return {};
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
  const Base = class extends SystemDataModel {};

  Base._templates = [];
  for ( const template of templates ) {
    Base._templates.push(template.name);
    for ( const key of Object.getOwnPropertyNames(template) ) {
      if ( ["length", "migrateData", "name", "prototype"].includes(key) ) continue;
      if ( key === "systemSchema" ) {
        Base[`${template.name}_systemSchema`] = template.systemSchema;
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
