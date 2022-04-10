import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObject } from "/common/utils/helpers.mjs";
import { FormulaField, MappingField } from "../fields.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for creature data template used by Characters & NPCs.
 *
 * @property {AttributeData} attributes          Extended attributes with senses and spellcasting.
 * @property {DetailsData} details               Extended details with race and alignment.
 * @property {Object<string, SkillData>} skills  Creature's skills.
 * @property {TraitsData} traits                 Extended traits with languages.
 * @property {Object<string, SpellData>} spells  Creature's spell levels with slots.
 * @property {BonusesData} bonuses               Global bonuses to various rolls.
 */
export class CreatureData extends common.CommonData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      attributes: new fields.EmbeddedDataField(AttributeData, {label: "DND5E.Attributes"}),
      details: new fields.EmbeddedDataField(DetailsData, {label: "DND5E.Details"}),
      skills: new MappingField(SkillData, {label: "DND5E.Skills"}),
      traits: new fields.EmbeddedDataField(TraitsData, {label: "DND5E.Traits"}),
      spells: new MappingField(SpellData, {label: "DND5E.SpellLevels"}),
      bonuses: new fields.EmbeddedDataField(BonusesData, {label: "DND5E.Bonuses"})
    });
  }
}

/**
 * An embedded data structure for extra attribute data used by creatures.
 * @see CreatureData
 *
 * @property {object} attunement          Attunement data.
 * @property {number} attunement.max      Maximum number of attuned items.
 * @property {object} senses              Creature's senses.
 * @property {number} senses.darkvision   Creature's darkvision range.
 * @property {number} senses.blindsight   Creature's blindsight range.
 * @property {number} senses.tremorsense  Creature's tremorsense range.
 * @property {number} senses.truesight    Creature's truesight range.
 * @property {string} senses.units        Distance units used to measure senses.
 * @property {string} senses.special      Description of any special senses or restrictions.
 * @property {string} spellcasting        Primary spellcasting ability.
 */
export class AttributeData extends common.AttributeData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      attunement: new fields.SchemaField({
        max: new fields.NumberField({...common.REQUIRED_INTEGER, min: 0, initial: 3, label: "DND5E.AttunementMax"})
      }, {label: "DND5E.Attunement"}),
      senses: new fields.SchemaField({
        darkvision: new fields.NumberField({
          ...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SenseDarkvision"
        }),
        blindsight: new fields.NumberField({
          ...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SenseBlindsight"
        }),
        tremorsense: new fields.NumberField({
          ...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SenseTremorsense"
        }),
        truesight: new fields.NumberField({
          ...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SenseTruesight"
        }),
        units: new fields.StringField({
          required: true, initial: "ft", choices: CONFIG.DND5E.movementUnits, label: "DND5E.SenseUnits"
        }),
        special: new fields.StringField({required: true, label: "DND5E.SenseSpecial"})
      }, {label: "DND5E.Senses"}),
      spellcasting: new fields.StringField({
        required: true, blank: true, initial: "int", choices: CONFIG.DND5E.abilities, label: "DND5E.SpellAbility"
      })
    });
  }
}

/**
 * An embedded data structure for extra details data used by creatures.
 * @see CreatureData
 *
 * @property {string} alignment  Creature's alignment.
 * @property {string} race       Creature's race.
 */
export class DetailsData extends common.DetailsData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      alignment: new fields.StringField({required: true, label: "DND5E.Alignment"}),
      race: new fields.StringField({required: true, label: "DND5E.Race"})
    });
  }
}

/**
 * An embedded data structure for individual skill data.
 * @see CreatureData
 *
 * @property {number} value            Proficiency level creature has in this skill.
 * @property {string} ability          Default ability used for this skill.
 * @property {object} bonuses          Bonuses for this skill.
 * @property {string} bonuses.check    Numeric or dice bonus to skill's check.
 * @property {string} bonuses.passive  Numeric bonus to skill's passive check.
 */
export class SkillData extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        required: true, initial: 0, choices: CONFIG.DND5E.proficiencyLevels, label: "DND5E.ProficiencyLevel"
      }),
      ability: new fields.StringField({
        required: true, initial: "dex", choices: CONFIG.DND5E.abilities, label: "DND5E.Ability"
      }),
      bonuses: new fields.SchemaField({
        check: new FormulaField({required: true, label: "DND5E.SkillBonusCheck"}),
        passive: new FormulaField({required: true, label: "DND5E.SkillBonusPassive"})
      }, {label: "DND5E.SkillBonuses"})
    };
  }
}

/**
 * An embedded data structure for extra traits data used by creatures.
 * @see CreatureData
 *
 * @property {object} languages          Languages known by this creature.
 * @property {string[]} languages.value  Currently selected languages.
 * @property {string} languages.custom   Semicolon-separated list of custom languages.
 */
export class TraitsData extends common.TraitsData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      languages: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({
          blank: false, choices: CONFIG.DND5E.languages
        }), {label: "DND5E.TraitsChosen"}),
        custom: new fields.StringField({required: true, label: "DND5E.Special"})
      }, {label: "DND5E.Languages"})
    });
  }
}

/**
 * An embedded data structure for individual spell levels.
 * @see CreatureData
 *
 * @property {number} value     Number of unused spell slots at this level.
 * @property {number} override  Manual override of total spell slot count for this level.
 */
export class SpellData extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        ...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SpellProgAvailable"
      }),
      override: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.SpellProgOverride"})
    };
  }
}

/**
 * An embedded data structure for global creature bonuses.
 * @see CreatureData
 *
 * @property {AttackBonusesData} mwak  Bonuses to melee weapon attacks.
 * @property {AttackBonusesData} rwak  Bonuses to ranged weapon attacks.
 * @property {AttackBonusesData} msak  Bonuses to melee spell attacks.
 * @property {AttackBonusesData} rsak  Bonuses to ranged spell attacks.
 * @property {object} abilities        Bonuses to ability scores.
 * @property {string} abilities.check  Numeric or dice bonus to ability checks.
 * @property {string} abilities.save   Numeric or dice bonus to ability saves.
 * @property {string} abilities.skill  Numeric or dice bonus to skill checks.
 * @property {object} spell            Bonuses to spells.
 * @property {string} spell.dc         Numeric bonus to spellcasting DC.
 */
export class BonusesData extends DataModel {
  static defineSchema() {
    return {
      mwak: new fields.EmbeddedDataField(AttackBonusesData, {label: "DND5E.BonusMWAttack"}),
      rwak: new fields.EmbeddedDataField(AttackBonusesData, {label: "DND5E.BonusRWAttack"}),
      msak: new fields.EmbeddedDataField(AttackBonusesData, {label: "DND5E.BonusMSAttack"}),
      rsak: new fields.EmbeddedDataField(AttackBonusesData, {label: "DND5E.BonusRSAttack"}),
      abilities: new fields.SchemaField({
        check: new FormulaField({required: true, label: "DND5E.BonusAbilityCheck"}),
        save: new FormulaField({required: true, label: "DND5E.BonusAbilitySave"}),
        skill: new FormulaField({required: true, label: "DND5E.BonusAbilitySkill"})
      }, {label: "DND5E.BonusAbility"}),
      spell: new fields.SchemaField({
        dc: new FormulaField({required: true, deterministic: true, label: "DND5E.BonusSpellDC"})
      }, {label: "DND5E.BonusSpell"})
    };
  }
}

/**
 * An embedded data structure for global attack bonuses.
 * @see BonusesData
 *
 * @property {string} attack  Numeric or dice bonus to attack rolls.
 * @property {string} damage  Numeric or dice bonus to damage rolls.
 */
export class AttackBonusesData extends DataModel {
  static defineSchema() {
    return {
      attack: new FormulaField({required: true, label: "DND5E.BonusAttack"}),
      damage: new FormulaField({required: true, label: "DND5E.BonusDamage"})
    };
  }
}
