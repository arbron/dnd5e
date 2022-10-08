import SystemDataModel from "../../abstract.mjs";
import { FormulaField } from "../../fields.mjs";
import simplifyRollFormula from "../../../dice/simplify-roll-formula.mjs";

/**
 * Data model template for item actions.
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
export default class ActionTemplate extends SystemDataModel {
  static systemSchema() {
    return {
      ability: new foundry.data.fields.StringField({
        required: true, nullable: true, initial: null, label: "DND5E.AbilityModifier"
      }),
      actionType: new foundry.data.fields.StringField({
        required: true, nullable: true, initial: null, label: "DND5E.ItemActionType"
      }),
      attackBonus: new FormulaField({required: true, label: "DND5E.ItemAttackBonus"}),
      chatFlavor: new foundry.data.fields.StringField({required: true, label: "DND5E.ChatFlavor"}),
      critical: new foundry.data.fields.SchemaField({
        threshold: new foundry.data.fields.NumberField({
          required: true, integer: true, initial: null, positive: true, label: "DND5E.ItemCritThreshold"
        }),
        damage: new FormulaField({required: true, label: "DND5E.ItemCritExtraDamage"})
      }),
      damage: new foundry.data.fields.SchemaField({
        parts: new foundry.data.fields.ArrayField(new foundry.data.fields.ArrayField(
          new foundry.data.fields.StringField()
        ), {required: true}),
        versatile: new FormulaField({required: true, label: "DND5E.VersatileDamage"})
      }, {label: "DND5E.Damage"}),
      formula: new FormulaField({required: true, label: "DND5E.OtherFormula"}),
      save: new foundry.data.fields.SchemaField({
        ability: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.Ability"}),
        dc: new foundry.data.fields.NumberField({required: true, min: 0, label: "DND5E.AbbreviationDC"}),
        scaling: new foundry.data.fields.StringField({
          required: true, blank: false, initial: "spell", label: "DND5E.ScalingFormula"
        })
      }, {label: "DND5E.SavingThrow"})
    };
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /**
   * Ensure a 0 in attack bonus is converted to an empty string rather than "0".
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateAttackBonus(source) {
    if ( (source.attackBonus === 0) || (source.attackBonus === "0") ) source.attackBonus = "";
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Which ability score modifier is used by this item?
   * @type {string|null}
   */
  get abilityMod() {
    return this.ability || this._typeAbilityMod || {
      mwak: "str",
      rwak: "dex",
      msak: this.actor?.system?.attributes.spellcasting || "int",
      rsak: this.actor?.system?.attributes.spellcasting || "int"
    }[this.actionType] || null;
  }

  /* -------------------------------------------- */

  /**
   * Default ability key defined for this type.
   * @type {string|null}  Ability key.
   * @protected
   */
  get _typeAbilityMod() {
    return null;
  }

  /* -------------------------------------------- */

  /**
   * Retrieve an item's critical hit threshold. Uses the smallest value from among the following sources:
   * - item document
   * - item document's actor (if it has one)
   * - the constant '20'
   * @type {number|null}  The minimum value that must be rolled to be considered a critical hit.
   */
  get criticalThreshold() {
    if ( !this.hasAttack ) return null;
    const threshold = Math.min(this.critical.threshold ?? Infinity, this._typeCriticalThreshold);
    return threshold < Infinity ? threshold : 20;
  }

  /* -------------------------------------------- */

  /**
   * Default critical threshold for this type.
   * @type {number}  Critical threshold.
   * @protected
   */
  get _typeCriticalThreshold() {
    return Infinity;
  }

  /* --------------------------------------------- */

  /**
   * Does the Item implement an ability check as part of its usage?
   * @type {boolean}
   */
  get hasAbilityCheck() {
    return (this.actionType === "abil") && this.ability;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement an attack roll as part of its usage?
   * @type {boolean}
   */
  get hasAttack() {
    return ["mwak", "rwak", "msak", "rsak"].includes(this.actionType);
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement a damage roll as part of its usage?
   * @type {boolean}
   */
  get hasDamage() {
    return this.damage.parts.length > 0;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement a saving throw as part of its usage?
   * @type {boolean}
   */
  get hasSave() {
    return !!(this.save.ability && this.save.scaling);
  }

  /* -------------------------------------------- */

  /**
   * Does the item provide an amount of healing instead of conventional damage?
   * @type {boolean}
   */
  get isHealing() {
    return (this.actionType === "heal") && this.damage.parts.length;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement a versatile damage roll as part of its usage?
   * @type {boolean}
   */
  get isVersatile() {
    return !!(this.hasDamage && this.damage.versatile);
  }

  /* -------------------------------------------- */

  /**
   * Calculate the to hit formula from the following sources:
   * - item document's innate attack bonus
   * - item's actor's proficiency bonus if applicable
   * - item's actor's global bonuses to the given item type
   * - item's ammunition if applicable
   * @returns {{rollData: object, parts: string[]}|null}  Data used in the item's Attack roll.
   */
  get toHit() {
    if ( !this.hasAttack ) return null;
    const rollData = this.parent.getRollData();
    const parts = [];

    // Include the item's innate attack bonus as the initial value and label
    if ( this.attackBonus ) parts.push(this.attackBonus);

    // Take no further action for un-embedded items
    if ( !this.parent.isEmbedded ) return {rollData, parts};

    // Ability score modifier
    parts.push("@mod");

    // Add proficiency bonus if an explicit proficiency flag is present or for non-item features
    if ( !["weapon", "consumable"].includes(this.parent.type) || this.proficient ) {
      parts.push("@prof");
      if ( this.prof?.hasProficiency ) rollData.prof = this.prof.term;
    }

    // Actor-level global bonus to attack rolls
    const actorBonus = this.parent.actor.system.bonuses[this.actionType] ?? {};
    if ( actorBonus.attack ) parts.push(actorBonus.attack);

    // One-time bonus provided by consumed ammunition
    if ( (this.consume?.type === "ammo") && this.parent.actor.items ) {
      const ammoItem = this.actor.items.get(this.consume.target);
      if ( ammoItem ) {
        const ammoItemQuantity = ammoItem.system.quantity;
        const ammoCanBeConsumed = ammoItemQuantity && (ammoItemQuantity - (this.consume.amount ?? 0) >= 0);
        const ammoItemAttackBonus = ammoItem.system.attackBonus;
        const ammoIsTypeConsumable = (ammoItem.type === "consumable") && (ammoItem.system.consumableType === "ammo");
        if ( ammoCanBeConsumed && ammoItemAttackBonus && ammoIsTypeConsumable ) {
          parts.push("@ammo");
          rollData.ammo = ammoItemAttackBonus;
        }
      }
    }

    return {rollData, parts};
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /**
   * Prepare derived data and labels for items which have an action which deals damage.
   */
  prepareDerivedActionLabels() {
    const labels = this.parent.labels ??= {};

    const types = CONFIG.DND5E.damageTypes;
    labels.damage = this.damage.parts.map(d => d[0]).join(" + ").replace(/\+ -/g, "- ");
    labels.damageTypes = this.damage.parts.map(d => types[d[1]]).join(", ");

    labels.abilityCheck = game.i18n.format("DND5E.AbilityPromptTitle", {
      ability: CONFIG.DND5E.abilities[this.ability]
    });
  }

  /* -------------------------------------------- */

  /**
   * Populate a label with the compiled and simplified damage formula based on owned item
   * actor data. This is only used for display purposes and is not related to `Item5e#rollDamage`.
   */
  prepareFinalDamageLabel() {
    if ( !this.hasDamage ) return;
    const labels = this.parent.labels ??= {};
    const rollData = this.parent.getRollData();
    const damageLabels = { ...CONFIG.DND5E.damageTypes, ...CONFIG.DND5E.healingTypes };

    labels.derivedDamage = this.damage.parts.map(damagePart => {
      let formula;
      try {
        const roll = new Roll(damagePart[0], rollData);
        formula = simplifyRollFormula(roll.formula, { preserveFlavor: true });
      } catch(err) {
        console.warn(`Unable to simplify formula for ${this.parent.name}: ${err}`);
      }
      const damageType = damagePart[1];
      return { formula, damageType, label: `${formula} ${damageLabels[damageType] ?? ""}` };
    });
  }
  /* -------------------------------------------- */

  /**
   * Update the derived spell DC for an item that requires a saving throw.
   */
  prepareFinalSaveDC() {
    if ( !this.hasSave ) return;
    const labels = this.parent.labels ??= {};

    // Actor spell-DC based scaling
    if ( this.save.scaling === "spell" ) {
      this.save.dc = this.parent.actor?.system.attributes.spelldc ?? null;
    }

    // Ability-score based scaling
    else if ( this.save.scaling !== "flat" ) {
      this.save.dc = this.parent.actor?.system.abilities[this.save.scaling].dc ?? null;
    }

    // Update labels
    const ability = CONFIG.DND5E.abilities[this.save.ability] ?? "";
    labels.save = game.i18n.format("DND5E.SaveDC", {dc: this.save.dc || "", ability});
  }

  /* -------------------------------------------- */

  /**
   * Populate the label with the to hit value.
   */
  prepareFinalToHitLabel() {
    if ( !this.hasAttack || (!this.parent.isEmbedded && !this.attackBonus) ) return;
    const labels = this.parent.labels ??= {};

    let formula = this.attackBonus;
    if ( this.parent.isEmbedded ) {
      const {rollData, parts} = this.toHit;
      const roll = new Roll(parts.join("+"), rollData);
      formula = roll.formula;
    }

    formula = simplifyRollFormula(formula) || "0";
    labels.toHit = !/^[+-]/.test(formula) ? `+ ${formula}` : formula;
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Scale an array of damage parts according to a provided scaling formula and scaling multiplier.
   * @param {string[]} parts    The original parts of the damage formula.
   * @param {string} scaling    The scaling formula.
   * @param {number} times      A number of times to apply the scaling formula.
   * @param {object} rollData   A data object that should be applied to the scaled damage roll
   * @returns {string[]}        The parts of the damage formula with the scaling applied.
   */
  static scaleDamage(parts, scaling, times, rollData) {
    if ( times <= 0 ) return parts;
    const p0 = new Roll(parts[0], rollData);
    const s = new Roll(scaling, rollData).alter(times);

    // Attempt to simplify by combining like dice terms
    let simplified = false;
    if ( (s.terms[0] instanceof Die) && (s.terms.length === 1) ) {
      const d0 = p0.terms[0];
      const s0 = s.terms[0];
      if ( (d0 instanceof Die) && (d0.faces === s0.faces) && d0.modifiers.equals(s0.modifiers) ) {
        d0.number += s0.number;
        parts[0] = p0.formula;
        simplified = true;
      }
    }

    // Otherwise, add to the first part
    if ( !simplified ) parts[0] = `${parts[0]} + ${s.formula}`;
    return parts;
  }
}
