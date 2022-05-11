import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { REQUIRED_INTEGER } from "./common.mjs";
import * as creature from "./creature.mjs";


/**
 * Data definition for Non-Player Characters.
 *
 * @property {DetailsData} details      NPC type, environment, CR, and other extended details.
 * @property {ResourcesData} resources  NPC's legendary and lair resources.
 */
export default class ActorNPCData extends creature.CreatureData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      // TODO: Add hp.formula
      details: new fields.EmbeddedDataField(DetailsData, {label: "DND5E.Details"}),
      resources: new fields.EmbeddedDataField(ResourcesData, {label: "DND5E.Resources"})
    };
  }
}

/**
 * An embedded data structure for extra details data used by NPCs.
 * @see ActorNPCData
 *
 * @property {TypeData} type        Creature type of this NPC.
 * @property {string} type.value    NPC's type as defined in the system configuration.
 * @property {string} type.subtype  NPC's subtype usually displayed in parenthesis after main type.
 * @property {string} type.swarm    Size of the individual creatures in a swarm or blank if NPC isn't a swarm.
 * @property {string} type.custom   Custom type beyond what is available in the configuration.
 * @property {string} environment   Common environments in which this NPC is found.
 * @property {number} cr            NPC's challenge rating.
 * @property {number} spellLevel    Spellcasting level of this NPC.
 * @property {string} source        What book or adventure is this NPC from?
 */
export class DetailsData extends creature.DetailsData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new fields.SchemaField({
        value: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.creatureTypes, label: "DND5E.CreatureType"
        }),
        subtype: new fields.StringField({required: true, label: "DND5E.CreatureTypeSelectorSubtype"}),
        swarm: new fields.StringField({
          required: true, blank: true, choices: CONFIG.DND5E.actorSizes, label: "DND5E.CreatureSwarmSize"
        }),
        custom: new fields.StringField({required: true, label: "DND5E.CreatureTypeSelectorCustom"})
      }, {label: "DND5E.CreatureType"}),
      environment: new fields.StringField({required: true, label: "DND5E.Environment"}),
      cr: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 1, label: "DND5E.ChallengeRating"}),
      spellLevel: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.SpellcasterLevel"}),
      source: new fields.StringField({required: true, label: "DND5E.Source"})
    };
  }
}

/**
 * An embedded data structure for NPC resources.
 * @see ActorCharacterData
 *
 * @property {object} legact           NPC's legendary actions.
 * @property {number} legact.value     Currently available legendary actions.
 * @property {number} legact.max       Maximum number of legendary actions.
 * @property {object} legres           NPC's legendary resistances.
 * @property {number} legres.value     Currently available legendary resistances.
 * @property {number} legres.max       Maximum number of legendary resistances.
 * @property {object} lair             NPC's lair actions.
 * @property {boolean} lair.value      Does this NPC use lair actions.
 * @property {number} lair.initiative  Initiative count when lair actions are triggered.
 */
export class ResourcesData extends DataModel {
  static defineSchema() {
    return {
      legact: new fields.SchemaField({
        value: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.LegActRemaining"}),
        max: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.LegActMax"})
      }, {label: "DND5E.LegAct"}),
      legres: new fields.SchemaField({
        value: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.LegResRemaining"}),
        max: new fields.NumberField({...REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.LegResMax"})
      }, {label: "DND5E.LegRes"}),
      lair: new fields.SchemaField({
        value: new fields.BooleanField({required: true, label: "DND5E.LairAct"}),
        initiative: new fields.NumberField({required: true, integer: true, label: "DND5E.LairActionInitiative"})
      }, {label: "DND5E.LairActionLabel"})
    };
  }
}
