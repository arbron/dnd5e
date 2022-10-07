import SystemDataModel from "../abstract.mjs";
import AdvancementTemplate from "./templates/advancement.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data definition for Background items.
 * @see ItemDescriptionTemplate
 * @see AdvancementTemplate
 */
export default class BackgroundData extends SystemDataModel.mixin(ItemDescriptionTemplate, AdvancementTemplate) {}
