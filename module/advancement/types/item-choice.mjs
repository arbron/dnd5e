import Advancement from "../advancement.mjs";
import AdvancementConfig from "../advancement-config.mjs";
import AdvancementFlow from "../advancement-flow.mjs";

/**
 * Advancement that presents the player with a choice of multiple items that they can take. Keeps track of which
 * items were selected at which levels.
 *
 * @extends {Advancement}
 */
export class ItemChoiceAdvancement extends Advancement {

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      defaults: {
        configuration: {
          hint: "",
          choices: {},
          allowDrops: true,
          type: null,
          pool: []
        }
      },
      order: 50,
      icon: "systems/dnd5e/icons/svg/item-choice.svg",
      title: game.i18n.localize("DND5E.AdvancementItemChoiceTitle"),
      hint: game.i18n.localize("DND5E.AdvancementItemChoiceHint"),
      multiLevel: true,
      apps: {
        config: ItemChoiceConfig,
        flow: ItemChoiceFlow
      }
    });
  }

  /* -------------------------------------------- */

  /**
   * The item types that are supported in Item Choice. This order will be how they are displayed
   * in the configuration interface.
   * @type {Set<string>}
   */
  static VALID_TYPES = new Set(["feat", "spell", "consumable", "backpack", "equipment", "loot", "tool", "weapon"]);

  /* -------------------------------------------- */
  /*  Instance Properties                         */
  /* -------------------------------------------- */

  /** @inheritdoc */
  get levels() {
    return Array.from(Object.keys(this.data.configuration.choices));
  }

  /* -------------------------------------------- */
  /*  Display Methods                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  configuredForLevel(level) {
    return this.data.value[level] !== undefined;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  titleForLevel(level) {
    return `${this.title} <em>(${game.i18n.localize("DND5E.AdvancementChoices")})</em>`;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  summaryForLevel(level) {
    const items = this.data.value[level];
    if ( !items ) return "";
    return Object.values(items).reduce((html, uuid) => html + game.dnd5e.utils.linkForUuid(uuid), "");
  }

  /* -------------------------------------------- */
  /*  Application Methods                         */
  /* -------------------------------------------- */

  /**
   * Locally apply this advancement to the actor.
   * @param {number} level              Level being advanced.
   * @param {object} data               Data from the advancement form.
   * @param {object} [retainedData={}]  Item data grouped by UUID. If present, this data will be used rather than
   *                                    fetching new data from the source.
   */
  async apply(level, data, retainedData={}) {
    const items = [];
    const updates = {};
    for ( const [uuid, selected] of Object.entries(data) ) {
      if ( !selected ) continue;
      const item = retainedData[uuid] ? new Item.implementation(retainedData[uuid]) : (await fromUuid(uuid))?.clone();
      if ( !item ) continue;
      item.updateSource({
        _id: retainedData[uuid]?._id ?? foundry.utils.randomID(),
        "flags.dnd5e.sourceId": uuid,
        "flags.dnd5e.advancementOrigin": `${this.item.id}.${this.id}`
      });
      items.push(item.toObject());
      updates[item.id] = uuid;
    }
    this.actor.updateSource({items});
    this.updateSource({[`value.${level}`]: updates});
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  restore(level, data) {
    const updates = {};
    for ( const item of data.items ) {
      this.actor.updateSource({items: [item]});
      updates[item._id] = item.flags.dnd5e.sourceId;
    }
    this.updateSource({[`value.${level}`]: updates});
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  reverse(level) {
    const items = [];
    for ( const id of Object.keys(this.data.value[level] ?? {}) ) {
      const item = this.actor.items.get(id);
      if ( item ) items.push(item.toObject());
      this.actor.items.delete(id);
    }
    this.updateSource({[`value.-=${level}`]: null });
    return { items };
  }

}


/**
 * Configuration application for item choices.
 *
 * @extends {AdvancementConfig}
 */
export class ItemChoiceConfig extends AdvancementConfig {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "advancement", "item-choice", "two-column"],
      dragDrop: [{ dropSelector: ".drop-target" }],
      dropKeyPath: "pool",
      template: "systems/dnd5e/templates/advancement/item-choice-config.hbs",
      width: 540
    });
  }

  /* -------------------------------------------- */

  getData() {
    const data = { ...super.getData(), validTypes: {} };
    for ( const type of this.advancement.constructor.VALID_TYPES ) {
      data.validTypes[type] = game.i18n.localize(`ITEM.Type${type.capitalize()}`);
    }
    return data;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareConfigurationUpdate(configuration) {
    if ( configuration.choices ) configuration.choices = this.constructor._cleanedObject(configuration.choices);
    return configuration;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _verifyDroppedItem(event, item) {
    const type = this.advancement.data.configuration.type;
    if ( !type || (type === item.type) ) return;
    const typeName = game.i18n.localize(`ITEM.Type${type.capitalize()}`);
    throw new Error(game.i18n.format("DND5E.AdvancementItemChoiceTypeWarning", { type: typeName }));
  }

}


/**
 * Inline application that presents the player with a choice of items.
 *
 * @extends {AdvancementFlow}
 */
export class ItemChoiceFlow extends AdvancementFlow {

  /**
   * Set of selected UUIDs.
   * @type {Set<string>}
   */
  selected;

  /**
   * Cached items from the advancement's pool.
   * @type {Array<Item5e>}
   */
  pool;

  /**
   * List of dropped items.
   * @type {Array<Item5e>}
   */
  dropped;

  /* -------------------------------------------- */

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      dragDrop: [{ dropSelector: ".drop-target" }],
      template: "systems/dnd5e/templates/advancement/item-choice-flow.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData() {
    // Prepare initial data
    this.selected ??= new Set(
      this.retainedData?.items.map(i => foundry.utils.getProperty(i, "flags.dnd5e.sourceId"))
        ?? Object.values(this.advancement.data.value[this.level] ?? {})
    );
    this.pool ??= await Promise.all(this.advancement.data.configuration.pool.map(fromUuid));
    this.dropped ??= await (this.retainedData?.items ?? []).reduce(async (arrP, data) => {
      const arr = await arrP;
      const uuid = foundry.utils.getProperty(data, "flags.dnd5e.sourceId");
      if ( !this.pool.find(i => uuid === i.uuid) ) {
        const item = await fromUuid(uuid);
        item.dropped = true;
        arr.push(item);
      }
      return arr;
    }, []);

    const max = this.advancement.data.configuration.choices[this.level];
    const choices = { max, current: this.selected.size, full: this.selected.size >= max };

    const previousLevels = {};
    const previouslySelected = new Set();
    for ( const [level, data] of Object.entries(this.advancement.data.value) ) {
      if ( level > this.level ) continue;
      previousLevels[level] = await Promise.all(Object.values(data).map(fromUuid));
      Object.values(data).forEach(uuid => previouslySelected.add(uuid));
    }

    const items = [...this.pool, ...this.dropped].reduce((items, i) => {
      i.checked = this.selected.has(i.uuid);
      i.disabled = !i.checked && choices.full;
      if ( !previouslySelected.has(i.uuid) ) items.push(i);
      return items;
    }, []);

    return foundry.utils.mergeObject(super.getData(), { choices, items, previousLevels });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a[data-uuid]").click(this._onClickFeature.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _onChangeInput(event) {
    if ( event.target.checked ) this.selected.add(event.target.name);
    else this.selected.delete(event.target.name);
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking on a feature during item grant to preview the feature.
   * @param {MouseEvent} event  The triggering event.
   * @protected
   */
  async _onClickFeature(event) {
    event.preventDefault();
    const uuid = event.currentTarget.dataset.uuid;
    const item = await fromUuid(uuid);
    item?.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting a dropped item.
   * @param {Event} event  The originating click event.
   * @protected
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const uuidToDelete = event.currentTarget.closest(".item-name")?.querySelector("input")?.name;
    if ( !uuidToDelete ) return;
    this.dropped.findSplice(i => i.uuid === uuidToDelete);
    this.selected.delete(uuidToDelete);
    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onDrop(event) {
    if ( this.selected.size >= this.advancement.data.configuration.choices[this.level] ) return false;

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch(err) {
      return false;
    }

    if ( data.type !== "Item" ) return false;
    const item = await Item.implementation.fromDropData(data);

    // If there is a type restriction, verify it against the dropped type
    const type = this.advancement.data.configuration.type;
    if ( type && (type !== item.type) ) {
      const typeName = game.i18n.localize(`ITEM.Type${type.capitalize()}`);
      return ui.notifications.warn(game.i18n.format("DND5E.AdvancementItemChoiceTypeWarning", { type: typeName }));
    }

    // If the item is already been marked as selected, no need to go further
    if ( this.selected.has(item.uuid) ) return false;

    // TODO: Check to ensure the dropped item hasn't been selected at a lower level

    // Mark the item as selected
    this.selected.add(item.uuid);

    // If the item doesn't already exist in the pool, add it
    if ( !this.pool.find(i => i.uuid === item.uuid) ) {
      this.dropped.push(item);
      item.dropped = true;
    }

    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _updateObject(event, formData) {
    const retainedData = this.retainedData?.items.reduce((obj, i) => {
      obj[foundry.utils.getProperty(i, "flags.dnd5e.sourceId")] = i;
      return obj;
    }, {});
    await this.advancement.apply(this.level, formData, retainedData);
  }

}
