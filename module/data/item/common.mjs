import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { FormulaField } from "../fields.mjs";


/**
 * An embedded data structure for item description & source.
 *
 * @property {object} description               Various item descriptions.
 * @property {string} description.value         Full item description.
 * @property {string} description.chat          Description displayed in chat card.
 * @property {string} description.unidentified  Description displayed if item is unidentified.
 * @property {string} source                    Adventure or sourcebook where this item originated.
 */
export class ItemDescriptionData extends DataModel {
  static defineSchema() {
    return {
      description: new fields.SchemaField({
        value: new fields.StringField({required: true, label: "DND5E.Description"}),
        chat: new fields.StringField({required: true, label: ""}),
        unidentified: new fields.StringField({required: true, label: ""})
      }, {label: "DND5E.Description"}),
      source: new fields.StringField({required: true, label: "DND5E.Source"})
    };
  }
}

/**
 * An embedded data structure containing information on physical items.
 *
 * @property {number} quantity     Number of items in a stack.
 * @property {number} weight       Item's weight in pounds or kilograms (depending on system setting).
 * @property {number} price        Item's cost in GP.
 * @property {number} attunement   Attunement information as defined in `DND5E.attunementTypes`.
 * @property {boolean} equipped    Is this item equipped on its owning actor.
 * @property {string} rarity       Item rarity as defined in `DND5E.itemRarity`.
 * @property {boolean} identified  Has this item been identified?
 */
export class PhysicalItemData extends DataModel {
  static defineSchema() {
    return {
      quantity: new fields.NumberField({
        required: true, nullable: false, integer: true, positive: true, initial: 1, label: "DND5E.Quantity"
      }),
      weight: new fields.NumberField({
        required: true, nullable: false, initial: 0, min: 0, label: "DND5E.Weight"
      }),
      price: new fields.NumberField({
        required: true, nullable: false, initial: 0, min: 0, label: "DND5E.Price"
      }),
      attunement: new fields.NumberField({
        required: true, integer: true, initial: CONFIG.DND5E.attunementTypes.NONE,
        choices: Object.values(CONFIG.DND5E.attunementTypes), label: "DND5E.Attunement"
      }),
      equipped: new fields.BooleanField({required: true, label: "DND5E.Equipped"}),
      rarity: new fields.StringField({required: true, blank: true, choices: DND5E.itemRarity, label: "DND5E.Rarity"}),
      identified: new fields.BooleanField({required: true, initial: true, label: "DND5E.Identified"})
    };
  }

  /* -------------------------------------------- */

  /** @override */
  static migrateData(source) {
    this.migrateAttunementData(source);
    this.migrateRaritydata(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the item's attuned boolean to attunement string.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateAttunementData(source) {
    if ( (source.attuned === undefined) || (source.attunement !== undefined) ) return;
    source.attunement = source.attuned ? DND5E.attunementTypes.ATTUNED : DND5E.attunementTypes.NONE;
  }

  /* -------------------------------------------- */

  /**
   * Migrate the item's rarity from freeform string to enum value.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateRaritydata(source) {
    if ( !source.rarity ) return;
    const rarity = Object.keys(DND5E.itemRarity).find(key =>
      (DND5E.itemRarity[key].toLowerCase() === source.rarity.toLowerCase()) || (key === source.rarity)
    );
    if ( rarity ) source.rarity = rarity;
  }
}

/**
 * An embedded data structure for items that can be used as some sort of action.
 *
 * @property {object} activation            Effect's activation conditions.
 * @property {string} activation.type       Activation type as defined in `DND5E.abilityActivationTypes`.
 * @property {number} activation.cost       How much of the activation type is needed to use this item's effect.
 * @property {string} activation.condition  Special conditions required to activate the item.
 * @property {object} duration              Effect's duration.
 * @property {number} duration.value        How long the effect lasts.
 * @property {string} duration.units        Time duration period as defined in `DND5E.timePeriods`.
 * @property {object} target                Effect's valid targets.
 * @property {number} target.value          Length or radius of target depending on targeting mode selected.
 * @property {number} target.width          Width of line when line type is selected.
 * @property {string} target.units          Units used for value and width as defined in `DND5E.distanceUnits`.
 * @property {string} target.type           Targeting mode as defined in `DND5E.targetTypes`.
 * @property {object} range                 Effect's range.
 * @property {number} range.value           Regular targeting distance for item's effect.
 * @property {number} range.long            Maximum targeting distance for features that have a separate long range.
 * @property {string} range.units           Units used for value and long as defined in `DND5E.distanceUnits`.
 * @property {object} uses                  Effect's limited uses.
 * @property {number} uses.value            Current available uses.
 * @property {string} uses.max              Maximum possible uses or a formula to derive that number.
 * @property {string} uses.per              Recharge time for limited uses as defined in `DND5E.limitedUsePeriods`.
 * @property {object} consume               Effect's resource consumption.
 * @property {string} consume.type          Type of resource to consume as defined in `DND5E.abilityConsumptionTypes`.
 * @property {string} consume.target        Item ID or resource key path of resource to consume.
 * @property {number} consume.amount        Quantity of the resource to consume per use.
 */
export class ActivatedEffectData extends DataModel {
  static defineSchema() {
    return {
      activation: new fields.SchemaField({
        type: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilityActivationTypes, label: ""
        }),
        cost: new fields.NumberField({required: true, nullable: false, initial: 0, label: "DND5E.ItemActivationCost"}),
        condition: new fields.StringField({required: true, label: "DND5E.ItemActivationCondition"})
      }, {label: ""}),
      duration: new fields.SchemaField({
        value: new fields.NumberField({required: true, min: 0, label: ""}),
        units: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.timePeriods, label: ""
        })
      }, {label: ""}),
      target: new fields.SchemaField({
        value: new fields.NumberField({required: true, min: 0, label: ""}),
        width: new fields.NumberField({required: true, min: 0, label: ""}),
        units: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.distanceUnits, label: ""
        }),
        type: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.targetTypes, label: ""
        })
      }, {label: "DND5E.Target"}),
      range: new fields.SchemaField({
        value: new fields.NumberField({required: true, min: 0, label: "DND5E.RangeNormal"}),
        long: new fields.NumberField({required: true, min: 0, label: "DND5E.RangeLong"}),
        units: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.distanceUnits, label: "DND5E.RangeUnits"
        })
      }, {label: "DND5E.Range"}),
      uses: new fields.SchemaField({
        value: new fields.NumberField({required: true, min: 0, label: "DND5E.LimitedUsesAvailable"}),
        max: new FormulaField({required: true, deterministic: true, label: "DND5E.LimitedUsesMax"}),
        per: new fields.StringField({
          required: true, blank: false, nullable: true, initial: null, label: "DND5E.LimitedUsesPer"
        })
      }, {label: "DND5E.LimitedUses"}),
      consume: new fields.SchemaField({
        type: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilityConsumptionTypes, label: "DND5E.ConsumeType"
        }),
        target: new fields.StringField({
          required: true, blank: false, nullable: true, initial: null, label: "DND5E.ConsumeTarget"
        }),
        amount: new fields.NumberField({required: true, label: "DND5E.ConsumeAmount"})
      }, {label: "DND5E.ConsumeTitle"})
    };
  }
}

/**
 * An embedded data structure for item actions.
 *
 * @property {string} ability             Ability score to use when determining modifier.
 * @property {string} actionType          Action type as defined in `DND5E.itemActionTypes`.
 * @property {string} attackBonus         Numeric or dice bonus to attack rolls.
 * @property {string} chatFlavor          Extra text displayed in chat.
 * @property {object} critical            Information on how critical hits are handled.
 * @property {number} critical.threshold  Minimum number on the dice to roll a critical hit.
 * @property {string} critical.damage     Extra damage on critical hit.
 * @property {object} damage              Item damage formulas.
 * @property {string[][]} damage.parts    Array of damage formula and types.
 * @property {string} damage.versatile    Special versatile damage formula.
 * @property {string} formula             Other roll formula.
 * @property {object} save                Item saving throw data.
 * @property {string} save.ability        Ability required for the save.
 * @property {number} save.dc             Custom saving throw value.
 * @property {string} save.scaling        Method for automatically determining saving throw DC.
 */
export class ActionData extends DataModel {
  static defineSchema() {
    return {
      ability: new fields.StringField({
        required: true, nullable: true, initial: null, choices: CONFIG.DND5E.abilities, label: ""
      }),
      actionType: new fields.StringField({
        required: true, nullable: true, initial: null, choices: CONFIG.DND5E.itemActionTypes,
        label: "DND5E.ItemActionType"
      }),
      attackBonus: new FormulaField({required: true, label: "DND5E.ItemAttackBonus"}),
      chatFlavor: new fields.StringField({required: true, label: "DND5E.ChatFlavor"}),
      critical: new fields.SchemaField({
        threshold: new fields.NumberField({
          required: true, integer: true, initial: null, positive: true, label: "DND5E.ItemCritThreshold"
        }),
        damage: new FormulaField({required: true, label: "DND5E.ItemCritExtraDamage"})
      }, {label: ""}),
      damage: new fields.SchemaField({
        // TODO: This doesn't work correctly
        parts: new fields.ArrayField(new fields.StringField({label: ""}), {required: true, label: ""}),
        versatile: new FormulaField({required: true, label: "DND5E.VersatileDamage"})
      }, {label: "DND5E.Damage"}),
      formula: new FormulaField({required: true, label: "DND5E.OtherFormula"}),
      save: new fields.SchemaField({
        ability: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.abilities, label: ""
        }),
        dc: new fields.NumberField({required: true, min: 0, label: "DND5E.AbbreviationDC"}),
        scaling: new fields.StringField({
          required: true, blank: false, initial: "spell", label: "DND5E.ScalingFormula"
        })
      }, {label: "DND5E.SavingThrow"})
    };
  }
}

/**
 * An embedded data structure for equipment that can be mounted on a vehicle.
 *
 * @property {object} armor          Equipment's armor class.
 * @property {number} armor.value    Armor class value for equipment.
 * @property {object} hp             Equipment's hit points.
 * @property {number} hp.value       Current hit point value.
 * @property {number} hp.max         Max hit points.
 * @property {number} hp.dt          Damage threshold.
 * @property {string} hp.conditions  Conditions that are triggered when this equipment takes damage.
 */
export class MountableData extends DataModel {
  static defineSchema() {
    return {
      armor: new fields.SchemaField({
        value: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 10, min: 0, label: "DND5E.ArmorClass"
        })
      }, {label: "DND5E.ArmorClass"}),
      hp: new fields.SchemaField({
        value: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.HitPointsCurrent"
        }),
        max: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, label: "DND5E.HitPointsMax"
        }),
        dt: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.DamageThreshold"}),
        conditions: new fields.StringField({required: true, label: "DND5E.HealthConditions"})
      }, {label: "DND5E.HitPoints"})
    };
  }
}