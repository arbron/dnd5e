import ItemBackpackData from "./backpack.mjs";
import ItemClassData from "./class.mjs";
import ItemConsumableData from "./consumable.mjs";
import ItemEquipmentData from "./equipment.mjs";
import ItemFeatData from "./feat.mjs";
import ItemLootData from "./loot.mjs";
import ItemSpellData from "./spell.mjs";
import ItemToolData from "./tool.mjs";
import ItemWeaponData from "./weapon.mjs";

export {
  ItemBackpackData,
  ItemClassData,
  ItemConsumableData,
  ItemEquipmentData,
  ItemFeatData,
  ItemLootData,
  ItemSpellData,
  ItemToolData,
  ItemWeaponData
};

export const config = {
  backpack: ItemBackpackData,
  class: ItemClassData,
  consumable: ItemConsumableData,
  equipment: ItemEquipmentData,
  feat: ItemFeatData,
  loot: ItemLootData,
  spell: ItemSpellData,
  tool: ItemToolData,
  weapon: ItemWeaponData
};

/**
 * Method for checking to ensure data definition properly matches document data.
 * @param {Document} document         Document to use for comparison.
 * @param {DocumentData} definition   Data definition to compare against.
 * @param {boolean} compareToDefault  Compare document against defaults.
 * @returns {object}
 */
export function _checkData(document, definition, compareToDefault=false) {
  const otherData = compareToDefault ? {} : foundry.utils.deepClone(document.data._source.data);
  return foundry.utils.diffObject(document.data._source.data, (new definition(otherData)).toObject(false));
}
