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
   * Types that group together child entries.
   * @enum {string}
   */
  static GROUPING_TYPES = {
    AND: "DND5E.Advancement.StartingEquipment.Operator.AND",
    OR: "DND5E.Advancement.StartingEquipment.Operator.OR"
  };

  /**
   * Types that contain an option for the player.
   * @enum {string}
   */
  static OPTION_TYPES = {
    // Category types
    armor: "DND5E.Advancement.StartingEquipment.Choice.Armor",
    tool: "DND5E.Advancement.StartingEquipment.Choice.Tool",
    weapon: "DND5E.Advancement.StartingEquipment.Choice.Weapon",
    focus: "DND5E.Advancement.StartingEquipment.Choice.Focus",

    // Generic item type
    linked: "DND5E.Advancement.StartingEquipment.SpecificItem"
  };

  /**
   * Equipment entry types.
   * @type {Record<string, string>}
   */
  static get TYPES() {
    return { ...this.GROUPING_TYPES, ...this.OPTION_TYPES };
  }

  /* -------------------------------------------- */

  /**
   * Where in `CONFIG.DND5E` to find the type category labels.
   * @enum {{ label: string, config: string }}
   */
  static CATEGORIES = {
    armor: {
      label: "DND5E.Armor",
      config: "armorTypes"
    },
    focus: {
      label: "DND5E.Focus.Label",
      config: "focusTypes"
    },
    tool: {
      label: "TYPES.Item.tool",
      config: "toolTypes"
    },
    weapon: {
      label: "TYPES.Item.weapon",
      config: "weaponProficiencies"
    }
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
    if ( !(this.type in this.constructor.GROUPING_TYPES) ) return [];
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
      // For AND/OR, use a simple conjunction/disjunction list (e.g. "first, second, and third")
      case "AND":
      case "OR":
        return game.i18n.getListFormatter({type: this.type === "AND" ? "conjunction" : "disjunction", style: "long"})
          .format(this.children.map(c => c.label).filter(l => l));

      // For linked type, fetch the name using the index
      case "linked":
        const index = fromUuidSync(this.key);
        if ( index ) label = index.name;
        break;

      // For category types, grab category information from config
      default:
        label = this.categoryLabel;
        break;
    }

    if ( !label ) return;
    if ( this.count > 1 ) label = `${formatNumber(this.count)} ${label}`;
    else if ( this.type !== "linked" ) label = game.i18n.format("DND5E.TraitConfigChooseAnyUncounted", { type: label });
    if ( (this.type === "linked") && this.requiresProficiency ) {
      label += ` (${game.i18n.localize("DND5E.Advancement.StartingEquipment.IfProficient").toLowerCase()})`;
    }
    return label;
  }

  /* -------------------------------------------- */

  /**
   * Black label of no key is specified for a choice type.
   * @type {string}
   */
  get blankLabel() {
    return game.i18n.localize(this.constructor.CATEGORIES[this.type]?.label) ?? "";
  }

  /* -------------------------------------------- */

  /**
   * Get the label for a category.
   * @type {string}
   */
  get categoryLabel() {
    const configEntry = this.keyOptions[this.key];
    let label = configEntry?.label ?? configEntry;
    if ( !label ) return this.blankLabel.toLowerCase();

    if ( this.type === "weapon" ) label = game.i18n.format("DND5E.WeaponCategory", { category: label });
    return label.toLowerCase();
  }

  /* -------------------------------------------- */

  /**
   * Build a list of possible key options for this entry's type.
   * @returns {Record<string, string>}
   */
  get keyOptions() {
    const config = foundry.utils.deepClone(CONFIG.DND5E[this.constructor.CATEGORIES[this.type]?.config]);
    if ( this.type === "weapon" ) foundry.utils.mergeObject(config, CONFIG.DND5E.weaponTypes);
    return Object.entries(config).reduce((obj, [k, v]) => {
      obj[k] = foundry.utils.getType(v) === "Object" ? v.label : v;
      return obj;
    }, {});
  }
}
