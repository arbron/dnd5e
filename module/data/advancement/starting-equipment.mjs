import { formatNumber } from "../../utils.mjs";

import { FormulaField } from "../fields.mjs";

const {
  ArrayField, BooleanField, DocumentIdField, EmbeddedDataField, IntegerSortField, NumberField, StringField
} = foundry.data.fields;

/**
 * Configuration data for the Starting Equipment advancement.
 *
 * @property {EquipmentEntryData[]} pool  Different equipment entries that will be granted.
 * @property {string} wealth              Formula used to determine starting wealth.
 */
export class StartingEquipmentConfigurationData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      pool: new ArrayField(new EmbeddedDataField(EquipmentEntryData), {required: true}),
      wealth: new FormulaField({label: "DND5E.Advancement.StartingEquipment.Wealth.Label"})
    };
  }
}


/**
 * Data for a single entry in the equipment list.
 *
 * @property {string} _id                     Unique ID of this entry.
 * @property {string|null} group              Parent entry that contains this one.
 * @property {number} sort                    Sorting order of this entry.
 * @property {string} type                    Entry type as defined in `EquipmentEntryData#TYPES`.
 * @property {number} [count]                 Number of items granted. If empty, assumed to be `1`.
 * @property {string} [key]                   Category or item key unless type is "linked", in which case it is a UUID.
 * @property {boolean} [requiresProficiency]  Is this only a valid item if character already has the
 *                                            required proficiency.
 */
export class EquipmentEntryData extends foundry.abstract.DataModel {

  /**
   * Equipment entry types.
   * @enum {string}
   */
  static TYPES = {
    // Grouped types
    AND: "DND5E.Advancement.StartingEquipment.Operator.AND",
    OR: "DND5E.Advancement.StartingEquipment.Operator.OR",

    // Category types
    armor: "DND5E.Advancement.StartingEquipment.Choice.Armor",
    tool: "DND5E.Advancement.StartingEquipment.Choice.Tool",
    weapon: "DND5E.Advancement.StartingEquipment.Choice.Weapon",
    focus: "DND5E.Advancement.StartingEquipment.Choice.Focus",

    // Generic item type
    linked: "DND5E.Advancement.StartingEquipment.SpecificItem"
  };

  /* -------------------------------------------- */

  /**
   * Where in `CONFIG.DND5E` to find the type category labels.
   * @enum {string}
   */
  static CATEGORY_LABELS = {
    armor: "armorTypes",
    focus: "focusTypes",
    tool: "toolTypes",
    weapon: "weaponProficiencies"
  };

  /* -------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      _id: new DocumentIdField({initial: () => foundry.utils.randomID()}),
      group: new StringField({nullable: true, initial: null}),
      sort: new IntegerSortField(),
      type: new StringField({required: true, initial: "AND", choices: this.TYPES}),
      count: new NumberField({initial: undefined}),
      key: new StringField({initial: undefined}),
      requiresProficiency: new BooleanField()
    };
  }

  /* -------------------------------------------- */

  /**
   * Get any children represented by this entry in order.
   * @returns {EquipmentEntryData[]}
   */
  get children() {
    if ( (this.type !== "AND") && (this.type !== "OR") ) return [];
    return this.parent.pool
      .filter(entry => entry.group === this._id)
      .sort((lhs, rhs) => lhs.sort - rhs.sort);
  }

  /* -------------------------------------------- */

  /**
   * Transform this entry into a human readable label.
   * @type {string}
   */
  get label() {
    let label;

    switch ( this.type ) {
      // For AND, use a simple conjunction list (e.g. "first, second, and third")
      case "AND":
        return game.i18n.getListFormatter({type: "conjunction", style: "long"})
          .format(this.children.map(c => c.label));

      // For OR, use a disjunction list with letter prefixes (e.g. "(a) something, or (b) else")
      case "OR":
        // TODO: Find localizable way to add letter prefixes
        return game.i18n.getListFormatter({type: "disjunction", style: "long"})
          .format(this.children.map(c => c.label));

      // For linked type, fetch the name using the index
      case "linked":
        const index = fromUuidSync(this.key);
        label = index.name;
        break;

      // For category types, grab category information from config
      default:
        label = this.categoryLabel;
        break;
    }

    if ( this.count > 1 ) label = `${formatNumber(this.count)} ${label}`;
    else if ( this.type !== "linked" ) label = game.i18n.format("DND5E.TraitConfigChooseAnyUncounted", { type: label });
    if ( (this.type === "linked") && this.requiresProficiency ) {
      label += ` (${game.i18n.localize("DND5E.Advancement.StartingEquipment.IfProficient").toLowerCase()})`;
    }
    return label;
  }

  /* -------------------------------------------- */

  /**
   * Get the label for a category.
   * @type {string}
   */
  get categoryLabel() {
    let config = CONFIG.DND5E[this.constructor.CATEGORY_LABELS[this.type]];
    let category = this.key;

    // For Weapons, check to see if it specifies melee/ranged
    if ( (this.type === "weapon") && (this.key in CONFIG.DND5E.weaponProficienciesMap) ) {
      config = CONFIG.DND5E.weaponTypes;
    }

    // Fetch the category label from config
    const configEntry = config[category];
    let label = configEntry?.label ?? configEntry ?? this.key;

    if ( this.type === "weapon" ) label = game.i18n.format("DND5E.WeaponCategory", { category: label });

    return label.toLowerCase();
  }
}
