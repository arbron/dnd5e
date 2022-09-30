/**
 * Data Model variant with some extra methods to support template mix-ins.
 */
export default class SystemDataModel extends foundry.abstract.DataModel {

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

  /**
   * List of all template migrations to apply.
   * @type {string[]}
   */
  static _migrations;

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    this._migrations?.forEach(k => this[k](source));
    for ( const key of Object.getOwnPropertyNames(this) ) {
      if ( (key === "migrateData") || !key.startsWith("migrate") || this._migrations?.includes(key) ) continue;
      this[key](source);
    }
    return super.migrateData(source);
  }

  /* -------------------------------------------- */

  /**
   * Mix multiple templates with the base type.
   * @param {...*} templates     Template classes to mix.
   * @returns {SystemDataModel}  Final prepared type.
   */
  static mixin(...templates) {
    const Base = class extends this {};

    Base._templates = [];
    Base._migrations = [];
    for ( const template of templates ) {
      Base._templates.push(template.name);
      for ( const key of Object.getOwnPropertyNames(template) ) {
        if ( ["length", "migrateData", "mixed", "name", "prototype"].includes(key) ) continue;
        if ( key === "systemSchema" ) {
          Base[`${template.name}_systemSchema`] = template.systemSchema;
          continue;
        }
        if ( key.startsWith("migrate") ) Base._migrations.push(key);
        Base[key] = template[key];
      }
      for ( const key of Object.getOwnPropertyNames(template.prototype) ) {
        if ( ["constructor"].includes(key) ) continue;
        Base.prototype[key] = template.prototype[key];
      }
    }

    return Base;
  }
}
