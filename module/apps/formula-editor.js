
/**
 * A popup editor to make editing fields that accept formulas (such as item max uses) easier.
 *
 * @extends {FormApplication}
 */
export default class FormulaEditor extends DocumentSheet {
  
  /** inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "formula-editor",
      classes: ["dnd5e", "formula-editor"],
      title: "Formula Editor",
      template: "systems/dnd5e/templates/apps/formula-editor.html",
      width: 450,
      height: "auto",
      rollData: {}
    });
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute.
   *
   * @type {string}
   */
  get attribute() {
    return this.options.name;
  }

  /* -------------------------------------------- */

  /** inheritdoc */
  getData(options) {
    const formula = foundry.utils.getProperty(this.object.data._source, this.attribute);

    return {
      formula
    }
  }

  /* -------------------------------------------- */

  /** @onheritdoc */
  async _updateObject(event, formData) {
    let updates = {};
    updates[this.attribute] = formData.formula;
    return this.object.update(updates);
  }
}
