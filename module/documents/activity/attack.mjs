import Activity from "./activity.mjs";
import * as dataModels from "../../data/activity/attack.mjs";
import { d20Roll } from "../../dice/dice.mjs";

export class AttackActivity extends Activity {

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      dataModels: {
        system: dataModels.AttackConfigurationData
      },
      icon: "",
      title: "Attack",
      followups: {
        onHit: {
          label: "On Hit",
          dataModel: dataModels.AttackOnHitFollowupData
        },
        onMiss: {
          label: "On Miss",
          dataModel: dataModels.AttackOnMissFollowupData
        }
      }
    });
  }

  /* -------------------------------------------- */
  /*  Instance Properties                         */
  /* -------------------------------------------- */

  /**
   * Calculate the to hit formula for this attack.
   * @returns {{rollData: object, parts: string[]}|null}  Data used to build an attack roll.
   */
  get toHit() {
    const rollData = this.parent?.getRollData() ?? {};
    const parts = [];

    if ( this.system.bonus ) {
      parts.push("@attackBonus");
      rollData.attackBonus = this.system.bonus;
    }

    // That's all for un-owned items
    if ( !this.actor ) return {rollData, parts};

    // Ability modifier if not a flat roll
    if ( this.system.ability !== "flat" ) {
      parts.splice(0, 0, "@mod");
    }

    // Proficiency bonus if available
    // TODO: Write the Activity#isProficient method
    if ( !["weapon", "consumable"].includes(this.item?.type) || this.item?.system.proficient ) {
      parts.splice(0, 0, "@prof");
      if ( this.item.system.prof?.hasProficiency ) rollData.prof = this.item.system.prof.term;
    }

    // Actor-level global attack bonus
    if ( this.actorBonuses?.attack ) {
      parts.push("@globalBonus");
      rollData.globalBonus = this.actorBonuses?.attack;
    }

    // Bonus provided by consumed ammunition
    if ( this.item?.system.consume?.type === "ammo" ) {
      const ammoItem = this.actor.items.get(this.item.system.consume.target);
      if ( (ammoItem?.type === "consumable") && (ammoItem.system.consumableType === "ammo")
        && (ammoItem.system.quantity - (this.system.consume.amount ?? 0) >= 0) && ammoItem.system.attackBonus ) {
        parts.push("@ammo");
        rollData.ammo = ammoItem.system.attackBonus;
      }
    }

    return {rollData, parts};
  }

  /* -------------------------------------------- */
  /*  Rolling                                     */
  /* -------------------------------------------- */

  async rollToHit(options) {
    const {rollData, parts} = this.toHit;

    // TODO: Add ammo handling

    const elvenAccuracy = (this.actor?.flags.dnd5e?.elvenAccuracy
      && CONFIG.DND5E.characterFlags.elvenAccuracy.abilities.includes(this.system.ability)) || undefined;

    const rollConfig = foundry.utils.mergeObject({
      parts,
      data: rollData,
      activity: this,
      actor: this.actor,
      item: this.item,
      critical: this.item?.criticalThreshold,
      title: "To Hit",
      flavor: "To Hit",
      elvenAccuracy,
      halflingLucky: this.actor?.flags.dnd5e?.halflingLucky
    });

    /**
     * A hook event that fires before an attack is rolled for an Item.
     * @function dnd5e.preRollAttack
     * @memberof hookEvents
     * @param {Item5e} item                  Item for which the roll is being performed.
     * @param {D20RollConfiguration} config  Configuration data for the pending roll.
     * @returns {boolean}                    Explicitly return false to prevent the roll from being performed.
     */
    if ( Hooks.call("dnd5e.preRollAttack", this.item, rollConfig) === false ) return;

    const roll = await d20Roll(rollConfig);
    if ( roll === null ) return null;

    /**
     * A hook event that fires after an attack has been rolled for an Item.
     * @function dnd5e.rollAttack
     * @memberof hookEvents
     * @param {Item5e} item          Item for which the roll was performed.
     * @param {D20Roll} roll         The resulting roll.
     * @param {object[]} ammoUpdate  Updates that will be applied to ammo Items as a result of this attack.
     */
    Hooks.callAll("dnd5e.rollAttack", this.item, roll);

    // TODO: Consume ammo
    return roll;
  }

  /* -------------------------------------------- */

  async rollDamage(configuration, options) {
    
  }

}
