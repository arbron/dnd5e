import { DataModel } from "/common/abstract/module.mjs";
import * as fields from "/common/data/fields.mjs";
import { mergeObject } from "/common/utils/helpers.mjs";
import { FormulaField } from "../../fields.mjs";
import * as common from "./common.mjs";


/**
 * Data definition for Vehicles.
 *
 * @property {string} vehicleType                Type of vehicle as defined in `DND5E.vehicleTypes`.
 * @property {AttributeData} attributes          Extended attributes with additional vehicle information.
 * @property {TraitsData} traits                 Extended traits with vehicle dimensions.
 * @property {object} cargo                      Details on this vehicle's crew and cargo capacities.
 * @property {PassengerData[]} cargo.crew        Creatures responsible for operating the vehicle.
 * @property {PassengerData[]} cargo.passengers  Creatures just takin' a ride.
 */
export default class ActorVehicleData extends common.CommonData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      vehicleType: new fields.StringField({
        required: true, initial: "water", choices: CONFIG.DND5E.vehicleTypes, label: "DND5E.VehicleType"
      }),
      attributes: new fields.EmbeddedDataField(AttributeData, {label: "DND5E.Attributes"}),
      traits: new fields.EmbeddedDataField(TraitsData, {label: "DND5E.Traits"}),
      cargo: new fields.SchemaField({
        crew: new fields.ArrayField(
          new fields.EmbeddedDataField(PassengerData), {label: "DND5E.VehicleCrew"}
        ),
        passengers: new fields.ArrayField(
          new fields.EmbeddedDataField(PassengerData), {label: "DND5E.VehiclePassengers"}
        )
      }, {label: "DND5E.VehicleCrewPassengers"})
    });
  }
}

/**
 * An embedded data structure for extra attribute data used by vehicles.
 * @see ActorVehicleData
 *
 * @property {object} ac                    Data used to calculate vehicle's armor class.
 * @property {number} ac.flat               Flat value used for flat or natural armor calculation.
 * @property {string} ac.calc               Name of one of the built-in formulas to use.
 * @property {string} ac.formula            Custom formula to use.
 * @property {string} ac.motionless         Changes to vehicle AC when not moving.
 * @property {object} actions               Information on how the vehicle performs actions.
 * @property {boolean} actions.stations     Does this vehicle rely on action stations that required individual
 *                                          crewing rather than general crew thresholds?
 * @property {number} actions.value         Maximum number of actions available with full crewing.
 * @property {object} actions.thresholds    Crew thresholds needed to perform various actions.
 * @property {number} actions.thresholds.2  Minimum crew needed to take full action complement.
 * @property {number} actions.thresholds.1  Minimum crew needed to take reduced action complement.
 * @property {number} actions.thresholds.0  Minimum crew needed to perform any actions.
 * @property {object} hp                    Vehicle's hit point data.
 * @property {number} hp.value              Current hit points.
 * @property {number} hp.min                Minimum allowed HP value.
 * @property {number} hp.max                Maximum allowed HP value.
 * @property {number} hp.temp               Temporary HP applied on top of value.
 * @property {number} hp.tempmax            Temporary change to the maximum HP.
 * @property {number} hp.dt                 Damage threshold.
 * @property {number} hp.mt                 Mishap threshold.
 * @property {object} capacity              Information on the vehicle's carrying capacity.
 * @property {string} capacity.creature     Description of the number of creatures the vehicle can carry.
 * @property {number} capacity.cargo        Cargo carrying capacity measured in tons.
 */
export class AttributeData extends common.AttributeData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      ac: new fields.SchemaField({
        flat: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.ArmorClassFlat"}),
        calc: new fields.StringField({required: true, initial: "flat", label: "DND5E.ArmorClassCalculation"}),
        formula: new FormulaField({required: true, deterministic: true, label: "DND5E.ArmorClassFormula"}),
        motionless: new fields.StringField({required: true, label: "DND5E.ArmorClassMotionless"})
      }, { label: "DND5E.ArmorClass" }),
      action: new fields.SchemaField({
        stations: new fields.BooleanField({required: true, label: "DND5E.VehicleActionStations"}),
        value: new fields.NumberField({
          ...common.REQUIRED_INTEGER, initial: 0, min: 0, label: "DND5E.VehicleActionMax"
        }),
        thresholds: new fields.SchemaField({
          2: new fields.NumberField({
            required: true, integer: true, min: 0, label: "DND5E.VehicleActionThresholdsFull"
          }),
          1: new fields.NumberField({
            required: true, integer: true, min: 0, label: "DND5E.VehicleActionThresholdsMid"
          }),
          0: new fields.NumberField({
            required: true, integer: true, min: 0, label: "DND5E.VehicleActionThresholdsMin"
          })
        }, {label: "DND5E.VehicleActionThresholds"})
      }, {label: "DND5E.VehicleActions"}),
      hp: new fields.SchemaField({
        value: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.HitPointsCurrent"}),
        min: new fields.NumberField({...common.REQUIRED_INTEGER, min: 0, initial: 0, label: "DND5E.HitPointsMin"}),
        max: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.HitPointsMax"}),
        temp: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.HitPointsTemp"}),
        tempmax: new fields.NumberField({required: true, integer: true, label: "DND5E.HitPointsTempMax"}),
        dt: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.DamageThreshold"}),
        mt: new fields.NumberField({required: true, integer: true, min: 0, label: "DND5E.VehicleMishapThreshold"})
      }, {
        label: "DND5E.HitPoints", validate: d => d.min <= d.max,
        validationError: "HP minimum must be less than HP maximum"
      }),
      capacity: new fields.SchemaField({
        creature: new fields.StringField({required: true, label: "DND5E.VehicleCreatureCapacity"}),
        cargo: new fields.NumberField({
          ...common.REQUIRED_INTEGER, initial: 0, min: 0, label: "DND5E.VehicleCargoCapacity"
        })
      }, {label: "DND5E.VehicleCargoCrew"})
    });
  }
}

/**
 * An embedded data structure for extra trait data used by vehicles.
 * @see ActorVehicleData
 *
 * @property {string} dimensions  Description of the vehicle's size.
 */
export class TraitsData extends common.TraitsData {
  static defineSchema() {
    return mergeObject(super.defineSchema(), {
      dimensions: new fields.StringField({required: true, label: "DND5E.Dimensions"})
    });
  }
}

/**
 * An embedded data structure representing an entry in the crew or passenger lists.
 * @see CargoData
 *
 * @property {string} name      Name of individual or type of creature.
 * @property {number} quantity  How many of this creature are onboard?
 */
export class PassengerData extends DataModel {
  static defineSchema() {
    return {
      name: new fields.StringField({required: true, label: "DND5E.VehiclePassengerName"}),
      quantity: new fields.NumberField({
        ...common.REQUIRED_INTEGER, intial: 0, min: 0, label: "DND5E.VehiclePassengerQuantity"
      })
    };
  }
}
