import { CharacterData } from "./character.mjs";
import { NPCData } from "./npc.mjs";
import { VehicleData } from "./vehicle.mjs";

export * from "./character.mjs";
export * from "./common.mjs";
export * from "./creature.mjs";
export * from "./npc.mjs";
export * from "./vehicle.mjs";

export const config = {
  character: CharacterData,
  npc: NPCData,
  vehicle: VehicleData
};
