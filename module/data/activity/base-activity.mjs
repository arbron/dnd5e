import { AutoModelDataField } from "../fields.mjs";
import FollowupData from "./followup.mjs";

/**
 * Data model for activities.
 *
 * @property {string} _id    Unique ID for the activity on an item.
 * @property {string} type   Type name of the activity used to build a specific activity class.
 * @property {*} system      Type-specific data.
 * @property {string} title  Custom title to display instead of the default for this type.
 * @property {string} icon   Custom icon to display instead of the default for this type.
 * @property {Object<string, FollowupData}>  Additional followup activities to perform.
 * @property {boolean} forceDisabled         Should this activity always be disabled?
 * @property {boolean} requiresAttunement    Should this activity be disabled if the item isn't attuned?
 */
export default class BaseActivity extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      _id: new foundry.data.fields.DocumentIdField({initial: () => foundry.utils.randomID()}),
      type: new foundry.data.fields.StringField({
        required: true, initial: this.typeName, validate: v => v === this.typeName,
        validationError: `must be the same as the Activity type name ${this.typeName}`
      }),
      system: new AutoModelDataField(this),
      title: new foundry.data.fields.StringField({initial: undefined}),
      icon: new foundry.data.fields.FilePathField({initial: undefined, categories: ["IMAGE"]}),
      followup: new foundry.data.fields.SchemaField(this.followupSchema),
      forceDisabled: new foundry.data.fields.BooleanField(),
      requiresAttunement: new foundry.data.fields.BooleanField()
    };
  }

  /* -------------------------------------------- */

  /**
   * Name of this activity type that will be stored in config and used for lookups.
   * @type {string}
   * @protected
   */
  static get typeName() {
    return this.name.replace(/Activity$/, "");
  }

  /* -------------------------------------------- */

  /**
   * Prepare the schema for the followup property based on the type's followups defined in metadata.
   * @type {Object<string, FollowupData}}
   */
  static get followupSchema() {
    const followupKeys = ["always", ...Object.keys(this.metadata?.followups ?? {})];
    return followupKeys.reduce((schema, key) => {
      const Model = this.metadata?.followups[key]?.dataModel ?? FollowupData;
      schema[key] = new foundry.data.fields.ArrayField(new foundry.data.fields.EmbeddedDataField(Model));
      return schema;
    }, {});
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  toObject(source=true) {
    if ( !source ) return super.toObject(source);
    const clone = foundry.utils.deepClone(this._source);
    // Remove any undefined keys from the source data
    Object.keys(clone).filter(k => clone[k] === undefined).forEach(k => delete clone[k]);
    return clone;
  }
}
