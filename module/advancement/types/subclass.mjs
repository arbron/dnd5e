import Advancement from "../advancement.mjs";
import AdvancementConfig from "../advancement-config.mjs";
import AdvancementFlow from "../advancement-flow.mjs";

import SubclassConfigurationData from "../../data/advancement/subclass.mjs";

/**
 * Advancement that allows the player to select a subclass for their class. Only allowed on class items
 * and can only be taken once.
 */
export class SubclassAdvancement extends Advancement {

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      dataModels: {
        configuration: SubclassConfigurationData
      },
      order: 70,
      icon: "systems/dnd5e/icons/svg/subclass.svg",
      title: game.i18n.localize("DND5E.AdvancementSubclassTitle"),
      hint: game.i18n.localize("DND5E.AdvancementSubclassHint"),
      validItemTypes: new Set(["class"]),
      apps: {
        config: SubclassConfig,
        flow: SubclassFlow
      }
    });
  }

  /* -------------------------------------------- */
  /*  Display Methods                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  configuredForLevel(level) {
    return !foundry.utils.isEmpty(this.value);
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  summaryforLevel(level, { configMode=false }={}) {
    const item = this.actor.items.get(Object.keys(this.value)[0]);
    if ( configMode || !item ) return "";
    return `<a class="content-link actor-item-link" data-actor="${this.actor.id}" data-id="${item.id}">`
      + `<i class="fas fa-suitcase"></i> ${item.name}</a>`;
  }

  /* -------------------------------------------- */
  /*  Editing Methods                             */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static availableForItem(item) {
    return !item.advancement.byType.Subclass?.length;
  }

  /* -------------------------------------------- */
  /*  Application Methods                         */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async apply(level, data, retainedData) {
    const useRetained = data.uuid === foundry.utils.getProperty(retainedData, "flags.dnd5e.sourceId");
    let itemData = useRetained ? retainedData : null;
    if ( !itemData ) {
      const source = await fromUuid(data.uuid);
      if ( !source ) return; // TODO: Something went wrong, throw an error?
      itemData = source.clone({
        _id: foundry.utils.randomID(),
        "flags.dnd5e.sourceId": data.uuid,
        "flags.dnd5e.advancementOrigin": `${this.item.id}.${this.id}`
      }, {keepId: true}).toObject();
    }
    this.actor.updateSource({ items: [itemData] });
    this.updateSource({ [`value.${itemData._id}`]: data.uuid });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async restore(level, data) {
    this.actor.updateSource({ items: [data] });
    this.updateSource({ [`value.${data._id}`]: data.flags.dnd5e.sourceId });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async reverse(level) {
    const id = Object.keys(this.value)[0];
    if ( !id ) return;
    const item = this.actor.items.get(id);
    this.actor.items.delete(id);
    this.updateSource({ [`value.-=${id}`]: null });
    return item?.toObject() ?? null;
  }

}


/**
 * Configuration application for subclasses.
 */
export class SubclassConfig extends AdvancementConfig {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "advancement", "subclass"],
      dragDrop: [{ dropSelector: ".drop-target" }],
      dropKeyPath: "pool",
      template: "systems/dnd5e/templates/advancement/subclass-config.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _validateDroppedItem(event, item) {
    if ( item.type === "subclass" ) return;
    throw new Error(game.i18n.localize("DND5E.AdvancementSubclassTypeWarning"));
  }

}


/**
 * Inline application that presents the player with a choice of subclass.
 *
 * @extends {AdvancementFlow}
 */
export class SubclassFlow extends AdvancementFlow {

  /**
   * The UUID of the selected subclass.
   * @type {string|false}
   */
  selected;

  /**
   * Cached items from the advancement's pool.
   * @type {Item5e[]}
   */
  pool;

  /**
   * Cached subclass dropped onto the advancement.
   * @type {Item5e|false}
   */
  dropped;

  /* -------------------------------------------- */

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      dragDrop: [{ dropSelector: ".drop-target" }],
      template: "systems/dnd5e/templates/advancement/subclass-flow.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData() {
    const retainedSourceId = this.retainedData?.flags?.dnd5e?.sourceId;
    this.selected ??= retainedSourceId ?? Object.values(this.advancement.value)[0] ?? false;
    this.pool ??= await Promise.all(this.advancement.configuration.pool.map(fromUuid));
    this.dropped ??= (retainedSourceId && !this.pool.find(i => i.uuid === retainedSourceId))
      ? await fromUuid(retainedSourceId) : false;

    const items = [...this.pool];
    if ( this.dropped ) {
      items.push(this.dropped);
      this.dropped.dropped = true;
    }
    items.forEach(i => {
      i.checked = i.uuid === this.selected;
      i.disabled = !i.checked && this.selected;
    });

    return foundry.utils.mergeObject(super.getData(), { items });
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
    this.selected = event.target.checked ? event.target.name : false;
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
    this.dropped = false;
    this.selected = false;
    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onDrop(event) {
    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch(err) {
      return false;
    }

    if ( data.type !== "Item" ) return false;
    const item = await Item.implementation.fromDropData(data);

    // Ensure the dropped item is a subclass
    if ( item.type !== "subclass" ) {
      return ui.notifications.warn(game.i18n.localize("DND5E.AdvancementSubclassTypeWarning"));
    }

    // TODO: Ensure this subclass doesn't already exist on the actor (maybe?)

    // If subclass is not in the pool, add it to the dropped
    if ( !this.pool.find(i => i.uuid === item.uuid) ) {
      item.dropped = true;
      this.dropped = item;
    } else {
      this.dropped = false;
    }

    this.selected = item.uuid;
    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _updateObject(event, formData) {
    if ( !this.selected ) {
      const message = game.i18n.localize("DND5E.AdvancementSubclassNotSelectedWarning");
      throw new AdvancementError(message);
    }
    await this.advancement.apply(this.level, { uuid: this.selected }, this.retainedData);
  }

}
