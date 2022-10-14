/**
 * Model for a followup to an activity.
 *
 * @property {string} target  ID of another activity to perform.
 * @property {string} label   Label that will be displayed on the followup's button.
 */
export default class FollowupData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      target: new foundry.data.fields.DocumentIdField(),
      label: new foundry.data.fields.StringField()
    };
  }
}
