import ActorCharacterData from "./character.mjs";
import ActorNPCData from "./npc.mjs";
import ActorVehicleData from "./vehicle.mjs";

export {
  ActorCharacterData,
  ActorNPCData,
  ActorVehicleData
};

export const config = {
  character: ActorCharacterData,
  npc: ActorNPCData,
  vehicle: ActorVehicleData
};
