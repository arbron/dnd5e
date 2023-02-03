/**
 * Data model for the Hit Points advancement configuration.
 *
 * @property {string} hitDie  Denomination of hit die available as defined in `DND5E.hitDieTypes`.
 */
export default class HitPointsConfigurationData extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      hitDie: new foundry.data.fields.StringField({
        required: true, blank: false, initial: "d6", label: "DND5E.HitDice",
        validate: v => /d\d+/.test(v), validationError: "must be a dice value in the format d#"
      })
    };
  }
}
