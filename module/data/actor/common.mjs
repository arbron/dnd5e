import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { FormulaField, MappingField } from "../fields.mjs";


export const REQUIRED_INTEGER = {required: true, nullable: false, integer: true};

/**
 * Data definition for common data template.
 *
 * @property {Object<string, AbilityData>} abilities  Actor's ability scores.
 * @property {AttributeData} attributes               Armor class, hit points, movement, and initiative data.
 * @property {DetailsData} details                    Actor's biography.
 * @property {TraitsData} traits                      Actor's size, resistances, vulnerabilities, and immunities.
 * @property {CurrencyData} currency                  Currency being held by this actor.
 */
export class CommonData extends DataModel {
  static defineSchema() {
    return {
      abilities: new MappingField(AbilityData, {initialKeys: CONFIG.DND5E.abilities, label: "DND5E.Abilities"}),
      attributes: new fields.EmbeddedDataField(AttributeData, {label: "DND5E.Attributes"}),
      details: new fields.EmbeddedDataField(DetailsData, {label: "DND5E.Details"}),
      traits: new fields.EmbeddedDataField(TraitsData, {label: "DND5E.Traits"}),
      currency: new fields.EmbeddedDataField(CurrencyData, {label: "DND5E.Currency"})
    };
  }
}

/**
 * An embedded data structure for actor ability scores.
 * @see ActorData5e
 *
 * @property {number} value          Ability score.
 * @property {number} proficient     Proficiency value for saves.
 * @property {object} bonuses        Bonuses that modify ability checks and saves.
 * @property {string} bonuses.check  Numeric or dice bonus to ability checks.
 * @property {string} bonuses.save   Numeric or dice bonus to ability saving throws.
 */
export class AbilityData extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 10, label: "DND5E.AbilityScore"}),
      proficient: new fields.NumberField({
        required: true, initial: 0, choices: CONFIG.DND5E.proficiencyLevels, label: "DND5E.ProficiencyLevel"
      }),
      bonuses: new fields.SchemaField({
        check: new FormulaField({required: true, label: "DND5E.AbilityCheckBonus"}),
        save: new FormulaField({required: true, label: "DND5E.SaveBonus"})
      }, {label: "DND5E.AbilityBonuses"})
    };
  }
}

/**
 * An embedded data structure for actor attributes.
 * @see CommonData
 *
 * @property {object} ac               Data used to calculate actor's armor class.
 * @property {number} ac.flat          Flat value used for flat or natural armor calculation.
 * @property {string} ac.calc          Name of one of the built-in formulas to use.
 * @property {string} ac.formula       Custom formula to use.
 * @property {object} hp               Actor's hit point data.
 * @property {number} hp.value         Current hit points.
 * @property {number} hp.min           Minimum allowed HP value.
 * @property {number} hp.max           Maximum allowed HP value.
 * @property {number} hp.temp          Temporary HP applied on top of value.
 * @property {number} hp.tempmax       Temporary change to the maximum HP.
 * @property {object} init             Actor's initiative modifier and bonuses.
 * @property {number} init.value       Calculated initiative modifier.
 * @property {number} init.bonus       Fixed bonus provided to initiative rolls.
 * @property {object} movement         Various actor movement speeds.
 * @property {number} movement.burrow  Actor burrowing speed.
 * @property {number} movement.climb   Actor climbing speed.
 * @property {number} movement.fly     Actor flying speed.
 * @property {number} movement.swim    Actor swimming speed.
 * @property {number} movement.walk    Actor walking speed.
 * @property {string} movement.units   Movement used to measure the various speeds.
 * @property {boolean} movement.hover  Is this flying creature able to hover in place.
 */
export class AttributeData extends DataModel {
  static defineSchema() {
    return {
      ac: new fields.SchemaField({
        flat: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.ArmorClassFlat"}),
        calc: new fields.StringField({required: true, initial: "default", label: "DND5E.ArmorClassCalculation"}),
        formula: new FormulaField({required: true, deterministic: true, label: "DND5E.ArmorClassFormula"})
      }, { label: "DND5E.ArmorClass" }),
      hp: new fields.SchemaField({
        value: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 10, label: "DND5E.HitPointsCurrent"}),
        min: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.HitPointsMin"}),
        max: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 10, label: "DND5E.HitPointsMax"}),
        temp: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.HitPointsTemp"}),
        tempmax: new fields.NumberField({required: true, integer: true, label: "DND5E.HitPointsTempMax"})
      }, {
        label: "DND5E.HitPoints", validate: d => d.min <= d.max,
        validationError: "HP minimum must be less than HP maximum"
      }),
      init: new fields.SchemaField({
        value: new fields.NumberField({...REQUIRED_INTEGER, initial: 0, label: "DND5E.Initiative"}),
        bonus: new fields.NumberField({...REQUIRED_INTEGER, initial: 0, label: "DND5E.InitiativeBonus"})
      }, { label: "DND5E.Initiative" }),
      movement: new fields.SchemaField({
        burrow: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.MovementBurrow"}),
        climb: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.MovementClimb"}),
        fly: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.MovementFly"}),
        swim: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.MovementSwim"}),
        walk: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 30, label: "DND5E.MovementWalk"}),
        units: new fields.StringField({
          required: true, initial: "ft", choices: CONFIG.DND5E.movementUnits, label: "DND5E.MovementUnits"
        }),
        hover: new fields.BooleanField({label: "DND5E.MovementHover"})
      }, { label: "DND5E.Movement" })
    };
  }
}

/**
 * An embedded data structure for actor details.
 * @see CommonData
 *
 * @property {object} biography         Actor's biography data.
 * @property {string} biography.value   Full HTML biography information.
 * @property {string} biography.public  Biography that will be displayed to players with only observer privileges.
 */
export class DetailsData extends DataModel {
  static defineSchema() {
    return {
      biography: new fields.SchemaField({
        value: new fields.StringField({ blank: true, label: "DND5E.Biography" }),
        public: new fields.StringField({ blank: true, label: "DND5E.BiographyPublic" })
      }, { label: "DND5E.Biography" })
    };
  }
}

/**
 * An embedded data structure representing shared traits.
 * @see CommonData
 *
 * @property {string} size        Actor's size.
 * @property {object} di          Damage immunities.
 * @property {string[]} di.value  Currently selected damage immunities.
 * @property {string} di.custom   Semicolon-separated list of custom damage immunities.
 * @property {object} dr          Damage resistances.
 * @property {string[]} dr.value  Currently selected damage resistances.
 * @property {string} dr.custom   Semicolon-separated list of custom damage resistances.
 * @property {object} dv          Damage vulnerabilities.
 * @property {string[]} dv.value  Currently selected damage vulnerabilities.
 * @property {string} dv.custom   Semicolon-separated list of custom damage vulnerabilities.
 * @property {object} ci          Condition immunities.
 * @property {string[]} ci.value  Currently selected condition immunities.
 * @property {string} ci.custom   Semicolon-separated list of custom condition immunities.
 */
export class TraitsData extends DataModel {
  static defineSchema() {
    return {
      size: new fields.StringField({
        required: true, initial: "med", choices: CONFIG.DND5E.actorSizes, label: "DND5E.Size"
      }),
      di: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({
          blank: false, choices: CONFIG.DND5E.damageResistanceTypes
        }), {label: "DND5E.TraitsChosen"}),
        custom: new fields.StringField({required: true, label: "DND5E.Special"})
      }, {label: "DND5E.DamImm"}),
      dr: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({
          blank: false, choices: CONFIG.DND5E.damageResistanceTypes
        }), {label: "DND5E.TraitsChosen"}),
        custom: new fields.StringField({required: true, label: "DND5E.Special"})
      }, {label: "DND5E.DamRes"}),
      dv: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({
          blank: false, choices: CONFIG.DND5E.damageResistanceTypes
        }), {label: "DND5E.TraitsChosen"}),
        custom: new fields.StringField({required: true, label: "DND5E.Special"})
      }, {label: "DND5E.DamVuln"}),
      ci: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({
          blank: false, choices: CONFIG.DND5E.conditionTypes
        }), {label: "DND5E.TraitsChosen"}),
        custom: new fields.StringField({required: true, label: "DND5E.Special"})
      }, {label: "DND5E.ConImm"})
    };
  }
}

/**
 * An embedded data structure for currently held currencies.
 * @see DetailsData
 *
 * @property {number} pp  Platinum pieces.
 * @property {number} gp  Gold pieces.
 * @property {number} ep  Electrum pieces.
 * @property {number} sp  Silver pieces.
 * @property {number} cp  Copper pieces.
 */
export class CurrencyData extends DataModel {
  static defineSchema() {
    return {
      pp: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.CurrencyPP"}),
      gp: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.CurrencyGP"}),
      ep: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.CurrencyEP"}),
      sp: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.CurrencySP"}),
      cp: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.CurrencyCP"})
    };
  }
}
