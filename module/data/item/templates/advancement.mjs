import SystemDataModel from "../../abstract.mjs";

/**
 * Data model template for item advancement.
 *
 * @property {object[]} advancement  Advancement definitions for this item.
 */
export default class AdvancementTemplate extends SystemDataModel {
  static systemSchema() {
    return {
      // TODO: Convert to proper advancement data when #1812 is merged
      advancement: new foundry.data.fields.ArrayField(
        new foundry.data.fields.ObjectField(), {label: "DND5E.AdvancementTitle"}
      )
    };
  }

  /* -------------------------------------------- */
  /*  Preparation                                 */
  /* -------------------------------------------- */

  /**
   * Prepare advancement objects from stored advancement data.
   */
  prepareBaseAdvancementData() {
    const minAdvancementLevel = ["class", "subclass"].includes(this.parent.type) ? 1 : 0;
    this.parent.advancement = {
      byId: {},
      byLevel: Object.fromEntries(
        Array.fromRange(CONFIG.DND5E.maxLevel + 1).slice(minAdvancementLevel).map(l => [l, []])
      ),
      byType: {},
      needingConfiguration: []
    };
    for ( const advancementData of this.advancement ?? [] ) {
      const Advancement = dnd5e.advancement.types[`${advancementData.type}Advancement`];
      if ( !Advancement ) continue;
      const advancement = new Advancement(this, advancementData);
      this.parent.advancement.byId[advancement.id] = advancement;
      this.parent.advancement.byType[advancementData.type] ??= [];
      this.parent.advancement.byType[advancementData.type].push(advancement);
      advancement.levels.forEach(l => this.parent.advancement.byLevel[l].push(advancement));
      if ( !advancement.levels.length ) this.parent.advancement.needingConfiguration.push(advancement);
    }
    Object.entries(this.parent.advancement.byLevel).forEach(([lvl, data]) => data.sort((a, b) => {
      return a.sortingValueForLevel(lvl).localeCompare(b.sortingValueForLevel(lvl));
    }));
  }
}
