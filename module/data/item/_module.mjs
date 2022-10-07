import BackgroundData from "./background.mjs";
import BackpackData from "./backpack.mjs";
import ClassData from "./class.mjs";
import ConsumableData from "./consumable.mjs";
import EquipmentData from "./equipment.mjs";
import FeatData from "./feat.mjs";
import LootData from "./loot.mjs";
import SpellData from "./spell.mjs";
import SubclassData from "./subclass.mjs";
import ToolData from "./tool.mjs";
import WeaponData from "./weapon.mjs";

export {
  BackgroundData,
  BackpackData,
  ClassData,
  ConsumableData,
  EquipmentData,
  FeatData,
  LootData,
  SpellData,
  SubclassData,
  ToolData,
  WeaponData
};
export {default as ActionTemplate} from "./templates/action.mjs";
export {default as ActivatedEffectTemplate} from "./templates/activated-effect.mjs";
export {default as AdvancementTemplate} from "./templates/advancement.mjs";
export {default as ItemDescriptionTemplate} from "./templates/item-description.mjs";
export {default as MountableTemplate} from "./templates/mountable.mjs";
export {default as PhysicalItemTemplate} from "./templates/physical-item.mjs";

export const config = {
  background: BackgroundData,
  backpack: BackpackData,
  class: ClassData,
  consumable: ConsumableData,
  equipment: EquipmentData,
  feat: FeatData,
  loot: LootData,
  spell: SpellData,
  subclass: SubclassData,
  tool: ToolData,
  weapon: WeaponData
};
