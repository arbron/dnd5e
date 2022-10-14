import FollowupData from "./followup.mjs";

/**
 * Damage configuration.
 *
 * @typedef {object} DamagePart
 * @property {string} formula   The damage formula.
 * @property {string} type      Type of damage.
 * @property {string} critical  Extra damage on a critical (applied after normal dice doubling).
 */

/**
 * Attack-specific configuration data.
 *
 * @property {object} type
 * @property {string} type.distance  Whether this is a "melee" or "ranged" attack.
 * @property {string} type.kind      Whether this is a "unarmed", "weapon", or "spell" attack.
 * @property {string} [type.method]  Special tag based on the item's properties (aka "oneHanded", "offHand", "thrown")
 * @property {string} ability        Ability modifier to use for the roll or "automatic" or "flat"
 * @property {string} bonus          Bonus added to the To Hit formula
 * @property {DamagePart[]} damage   Damage parts.
 */
export class AttackConfigurationData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      type: new foundry.data.fields.SchemaField({
        distance: new foundry.data.fields.StringField({blank: false, initial: "melee"}),
        kind: new foundry.data.fields.StringField({blank: false, initial: "weapon"}),
        method: new foundry.data.fields.StringField({initial: undefined})
      }),
      ability: new foundry.data.fields.StringField({initial: "automatic"}),
      bonus: new foundry.data.fields.StringField(),
      damage: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          formula: new foundry.data.fields.StringField(),
          type: new foundry.data.fields.StringField(),
          critical: new foundry.data.fields.StringField()
        })
      )
    };
  }
}


/**
 * Extended followup configuration data for a hit.
 */
export class AttackOnHitFollowupData extends FollowupData {

  /**
   * Type of conditions that can be used on hit.
   * - crit: To Hit roll is a critical hit.
   * - nat20: To Hit roll is a natural 20.
   * - exceedsAC: To Hill roll exceeds target AC by the amount specified in `condition.value`.
   * - special: Custom text condition specified in `condition.special`.
   * @enum {string}
   */
  static CONDITION_CHOICES = {
    crit: "On Critical Hit",
    nat20: "On Natural 20",
    exceedsAC: "Roll exceeds AC by",
    special: "Special"
  };

  /* -------------------------------------------- */

  static defineSchema() {
    return {
      ...super.defineSchema(),
      condition: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({blank: true, choices: this.CONDITION_CHOICES}),
        value: new foundry.data.fields.NumberField({integer: true, min: 1}),
        special: new foundry.data.fields.StringField()
      })
    };
  }
}


export class AttackOnMissFollowupData extends FollowupData {

  /**
   * Type of conditions that can be used on hit.
   * - nat1: To Hit roll is a natural 1.
   * - missesAC: To Hill roll misses target AC by the amount specified in `condition.value`.
   * - special: Custom text condition specified in `condition.special`.
   * @enum {string}
   */
  static CONDITION_CHOICES = {
    nat1: "On Natural 1",
    missesAC: "Roll misses AC by",
    special: "Special"
  };

  /* -------------------------------------------- */

  static defineSchema() {
    return {
      ...super.defineSchema(),
      condition: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({blank: true, choices: this.CONDITION_CHOICES}),
        value: new foundry.data.fields.NumberField({integer: true, min: 1}),
        special: new foundry.data.fields.StringField()
      })
    };
  }
}
