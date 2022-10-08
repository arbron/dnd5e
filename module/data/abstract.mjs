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
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Helper methods to get all enumerable methods, inherited or own, for the provided object.
   * @param {object} object          Source of the methods to fetch.
   * @param {string} [startingWith]  Optional filtering string.
   * @returns {string[]}             Array of method keys.
   */
  static _getMethods(object, startingWith) {
    let keys = [];
    for ( const key in object ) { keys.push(key); }
    keys.push(...Object.getOwnPropertyNames(object));
    if ( startingWith ) keys = keys.filter(key => key.startsWith(startingWith));
    return keys;
  }

  /* -------------------------------------------- */

  /**
   * Mix multiple templates with the base type.
   * @param {...*} templates     Template classes to mix.
   * @returns {SystemDataModel}  Final prepared type.
   */
  static mixin(...templates) {
    const Base = class extends this {};
    // TODO: This causes an error when the "+ Add" buttons are used to create an item on the actor sheet
    // saying: "TypeError: can't prevent extensions on this proxy object"

    Base._templates = [];
    Base._migrations = [];
    for ( const template of templates ) {
      Base._templates.push(template.name);
      for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template)) ) {
        if ( ["length", "migrateData", "mixed", "name", "prototype"].includes(key) ) continue;
        if ( key === "systemSchema" ) {
          Object.defineProperty(Base, `${template.name}_systemSchema`, descriptor);
          continue;
        }
        Object.defineProperty(Base, key, {...descriptor, enumerable: true});
      }
      for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template.prototype)) ) {
        if ( ["constructor"].includes(key) ) continue;
        Object.defineProperty(Base.prototype, key, {...descriptor, enumerable: true});
      }
    }

    return Base;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    this._getMethods(this, "migrate").forEach(k => this[k](source));
    return super.migrateData(source);
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /**
   * Prepare data related to this DataModel itself, before any embedded Documents or derived data is computed.
   */
  prepareBaseData() {
    this.constructor._getMethods(this.constructor.prototype, "prepareBase").forEach(k => this[k]());
  }

  /* -------------------------------------------- */

  /**
   * Apply transformations or derivations to the values of the source data object.
   */
  prepareDerivedData() {
    this.constructor._getMethods(this.constructor.prototype, "prepareDerived").forEach(k => this[k]());
  }

  /* -------------------------------------------- */

  /**
   * Final data preparation steps performed on Items after parent actor has been fully prepared.
   */
  prepareFinalData() {
    this.constructor._getMethods(this.constructor.prototype, "prepareFinal").forEach(k => this[k]());
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Pre-creation logic for this system data.
   * @param {object} data     The initial data object provided to the document creation request
   * @param {object} options  Additional options which modify the creation request
   * @param {User} user       The User requesting the document creation
   * @protected
   */
  async _preCreate(data, options, user) {}

  /* -------------------------------------------- */

  /**
   * Pre-update logic for this system data.
   * @param {object} changed  The differential data that is changed relative to the documents prior values
   * @param {object} options  Additional options which modify the update request
   * @param {User} user       The User requesting the document update
   * @protected
   */
  async _preUpdate(changed, options, user) {}

  /* -------------------------------------------- */

  /**
   * Pre-deletion logic for this system data.
   * @param {object} options  Additional options which modify the deletion request
   * @param {User} user       The User requesting the document deletion
   * @protected
   */
  async _preDelete(options, user) {}

}
