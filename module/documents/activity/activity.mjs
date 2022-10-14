import BaseActivity from "../../data/activity/base-activity.mjs";

/**
 * Abstract base class which various activities can subclass.
 * @param {Item5e} item
 * @param {object} [data={}]
 * @param {object} [options={}]
 */
export default class Activity extends BaseActivity {
  constructor(item, data={}, options={}) {
    options.parent = item;
    super(data, options);
  }

  /** @inheritdoc */
  _initialize(options) {
    super._initialize(options);
    if ( !game._documentsReady ) return;
    return this.prepareData();
  }

  /* -------------------------------------------- */

  /**
   * Information on how an activity type is configured.
   *
   * @typedef {object} ActivityMetadata
   * @property {object} dataModels
   * @property {*} dataModels.configuration  Data model used for validating configuration data.
   * @property {string} icon                 Icon used for this activity type if no user icon is specified.
   * @property {string} title                Title to be displayed if no user title is specified.
   * @property {string} hint                 Description of this type shown in the activity selection dialog.
   * @property {Object<string, FollowupMetadata>} followups
   */

  /**
   * Information on how an activity followup is configured.
   *
   * @typedef {object} FollowupMetadata
   * @property {string} label                 User displayed label.
   * @property {*} [dataModel=FollowupData]   Data model used for validating followup data.
   */

  /**
   * Configuration information for this activity type.
   * @type {ActivityMetadata}
   */
  static get metadata() {
    return {
      icon: "",
      title: "Activity",
      hint: ""
    };
  }

  /* -------------------------------------------- */
  /*  Instance Properties                         */
  /* -------------------------------------------- */

  /**
   * Unique identifier for this activity within its item.
   * @type {string}
   */
  get id() {
    return this._id;
  }

  /* -------------------------------------------- */

  /**
   * Globally unique identifier for this activity.
   * @type {string}
   */
  get uuid() {
    return `${this.item.uuid}.Activity.${this.id}`;
  }

  /* -------------------------------------------- */

  /**
   * Item to which this activity belongs.
   * @type {Item5e}
   */
  get item() {
    return this.parent;
  }

  /* -------------------------------------------- */

  /**
   * Actor to which this activity's item belongs, if the item is embedded.
   * @type {Actor5e|null}
   */
  get actor() {
    return this.item.parent ?? null;
  }

  /* -------------------------------------------- */
  /*  Preparation Methods                         */
  /* -------------------------------------------- */

  /**
   * Prepare data for the Advancement.
   */
  prepareData() {
    this.title = this.title || this.constructor.metadata.title;
    this.icon = this.icon || this.constructor.metadata.icon;
  }
}
