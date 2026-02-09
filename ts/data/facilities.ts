import { type Direction, type Facility, FacilityCategory, FacilityID, RegionID, type FacilityPortMinimal } from "../types/data.ts"
import type { Immutable } from "../utils/types.ts"

export function definePorts(startX: number, startY: number, width: number, height: number, dir: Direction): FacilityPortMinimal[] {
  const ports: FacilityPortMinimal[] = []
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      ports.push([startX + x, startY + y, dir])
    }
  }
  return ports
}

export function defineSidePorts(facility: Facility, side: Direction): FacilityPortMinimal[] {
  switch (side) {
    case 'up': return definePorts(0, 0, facility.width, 1, 'up')
    case 'down': return definePorts(0, facility.height - 1, facility.width, 1, 'down')
    case 'left': return definePorts(0, 0, 1, facility.height, 'left')
    case 'right': return definePorts(facility.width - 1, 0, 1, facility.height, 'right')
  }
}

export const facilities: Immutable<Record<FacilityID, Facility>> = {
  [FacilityID.FITTING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 3,
    height: 3,
    power: 20,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.SEPARATING_UNIT]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 6,
    height: 4,
    power: 20,
    beltInputs: 'down',
    beltOutputs: 'up',
    pipeOutputs: [[0, 2, 'left']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.FLUID_SUPPLY_UNIT]: {
    category: FacilityCategory.MISC,
    width: 3,
    height: 3,
    power: 10,
    ports: [[1, 2, 'down', 'pipe', 'input', 'world']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.FILLING_UNIT]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 6,
    height: 4,
    power: 20,
    beltInputs: 'down',
    beltOutputs: 'up',
    pipeInputs: [[5, 2, 'right']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.REFINING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 3,
    height: 3,
    power: 5,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.SHREDDING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 3,
    height: 3,
    power: 5,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.FLUID_TANK]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 3,
    height: 3,
    pipeInputs: [[1, 0, 'down']],
    pipeOutputs: [[1, 2, 'up']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.DEPOT_LOADER]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 3,
    height: 1,
    depotInputs: [[1, 0, 'down']],
    depotBusConnectionSide: 'down',
  },
  [FacilityID.DEPOT_BUS_SECTION]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 8,
    height: 4,
    notImplementedYet: true,
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.DEPOT_BUS_PORT]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 4,
    height: 4,
    notImplementedYet: true,
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.REACTOR_CRUCIBLE]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 5,
    height: 5,
    power: 50,
    beltInputs: [[1, 4, 'down'], [3, 4, 'down']],
    beltOutputs: [[1, 0, 'up'], [3, 0, 'up']],
    pipeInputs: [[4, 1, 'right'], [4, 3, 'right']],
    pipeOutputs: [[0, 1, 'left'], [0, 3, 'left']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.PLANTING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 5,
    height: 5,
    power: 20,
    beltInputs: 'down',
    beltOutputs: 'up',
    pipeInputs: [[4, 2, 'right']],
    pipePortsAllowedRegions: [RegionID.WULING],
  },
  [FacilityID.ELECTRIC_NEXUS]: {
    category: FacilityCategory.MISC,
    width: 1,
    height: 1,
    notImplementedYet: true,
  },
  [FacilityID.THERMAL_BANK]: {
    category: FacilityCategory.POWER,
    width: 2,
    height: 2,
    beltInputs: 'down',
  },
  [FacilityID.SEED_PICKING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 5,
    height: 5,
    power: 10,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.MOULDING_UNIT]: {
    category: FacilityCategory.PRODUCTION_I,
    width: 3,
    height: 3,
    power: 10,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.AKETINE_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.JINCAO_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.YAZHEN_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.BUCKFLOWER_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.CITROME_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.SANDLEAF_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.REED_RYE_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.TARTPEPPER_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.REDJADE_GINSENG_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.AMBER_RICE_PLOT]: {
    category: FacilityCategory.FARMING,
    width: 3,
    height: 3,
    notImplementedYet: true,
  },
  [FacilityID.PROTOCOL_AUTOMATION_CORE_PAC]: {
    category: FacilityCategory.SPECIAL,
    width: 9,
    height: 9,
    depotInputs: [
      ...definePorts(1, 0, 7, 1, 'up'),
      ...definePorts(1, 8, 7, 1, 'down'),
    ],
    depotOutputs: [
      [0, 1, 'left'],
      [0, 4, 'left'],
      [0, 7, 'left'],
      [8, 1, 'right'],
      [8, 4, 'right'],
      [8, 7, 'right'],
    ],
  },
  [FacilityID.SUB_PAC]: {
    category: FacilityCategory.SPECIAL,
    width: 9,
    height: 9,
    depotInputs: [
      ...definePorts(1, 0, 7, 1, 'up'),
      ...definePorts(1, 8, 7, 1, 'down'),
    ],
    depotOutputs: [
      [0, 1, 'left'],
      [0, 4, 'left'],
      [0, 7, 'left'],
      [8, 1, 'right'],
      [8, 4, 'right'],
      [8, 7, 'right'],
    ],
  },
  [FacilityID.SPRINKLER]: {
    category: FacilityCategory.MISC,
    width: 3,
    height: 3,
    ports: [[1, 2, 'down', 'pipe', 'input', 'world']],
    irrigationArea: {
      side: 'up',
      width: 5,
      height: 4,
    },
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.PROTOCOL_STASH]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 3,
    height: 3,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.GRINDING_UNIT]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 6,
    height: 4,
    power: 50,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.PACKAGING_UNIT]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 6,
    height: 4,
    power: 20,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.DEPOT_UNLOADER]: {
    category: FacilityCategory.DEPOT_ACCESS,
    width: 3,
    height: 1,
    depotOutputs: [[1, 0, 'up']],
    depotBusConnectionSide: 'down'
  },
  [FacilityID.GEARING_UNIT]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 6,
    height: 4,
    power: 10,
    beltInputs: 'down',
    beltOutputs: 'up',
  },
  [FacilityID.FORGE_OF_THE_SKY]: {
    category: FacilityCategory.PRODUCTION_II,
    width: 5,
    height: 5,
    power: 50,
    beltInputs: 'down',
    beltOutputs: 'up',
    pipeInputs: [[4, 2, 'right']],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.GRENADE_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.HE_GRENADE_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.MARSH_GAS_MK_I]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.LN_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.BEAM_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.SURGE_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.MEDICAL_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.OMNIDIRECTIONAL_SONIC_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.SENTRY_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.GUN_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.HEAVY_GUN_TOWER]: {
    category: FacilityCategory.COMBAT,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.EASY_STASH]: {
    category: FacilityCategory.MISC,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.MEMO_BEACON]: {
    category: FacilityCategory.MISC,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.PORTABLE_ORIGINIUM_RIG]: {
    category: FacilityCategory.RESOURCING,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.ELECTRIC_MINING_RIG]: {
    category: FacilityCategory.RESOURCING,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.ELECTRIC_MINING_RIG_MK_II]: {
    category: FacilityCategory.RESOURCING,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.ELECTRIC_PYLON]: {
    category: FacilityCategory.POWER,
    width: 2,
    height: 2,
    powerArea: {
      width: 12,
      height: 12,
    }
  },
  [FacilityID.XIRANITE_PYLON]: {
    category: FacilityCategory.POWER,
    width: 2,
    height: 2,
    powerArea: {
      width: 12,
      height: 12,
    },
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.RELAY_TOWER]: {
    category: FacilityCategory.POWER,
    width: 3,
    height: 3,
    powerArea: {
      width: 7,
      height: 7,
    }
  },
  [FacilityID.XIRANITE_RELAY]: {
    category: FacilityCategory.POWER,
    width: 3,
    height: 3,
    powerArea: {
      width: 7,
      height: 7,
    },
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.ELECTRIC_NEXUS_TERMINAL]: {
    category: FacilityCategory.MISC,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.FLUID_PUMP]: {
    category: FacilityCategory.RESOURCING,
    width: 3,
    height: 3,
    ports: [
      [1, 2, 'down', 'pipe', 'output', 'world']
    ],
    allowedRegions: [RegionID.WULING],
  },
  [FacilityID.ZIPLINE_PYLON]: {
    category: FacilityCategory.MISC,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
  [FacilityID.ZIPLINE_TOWER]: {
    category: FacilityCategory.MISC,
    width: 2,
    height: 2,
    notImplementedYet: true,
  },
}
