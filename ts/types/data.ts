
export enum RegionID {
    VALLEY_IV = 'valley_iv',
    WULING = 'wuling',
}

export enum FieldTemplateID {
    VALLEY_IV_MAIN = 'valley_iv_main',
    VALLEY_IV_OUTPOST = 'valley_iv_outpost',
    WULING_MAIN = 'wuling_main',
    WULING_OUTPOST = 'wuling_outpost',
}

export enum FactoryRole {
  CORE_AIC_AREA = 'core_aic_area',
  OUTPOST = 'outpost',
}

export enum RegionFieldID {
  VALLEY_IV_CORE_AIC_AREA = 'valley_iv_core_aic_area',
  VALLEY_IV_REFUGEE_CAMP = 'valley_iv_refugee_camp',
  VALLEY_IV_INFRA_STATION = 'valley_iv_infra_station',
  VALLEY_IV_RECONSTRUCTION_HQ = 'valley_iv_reconstruction_hq',
  WULING_CORE_AIC_AREA = 'wuling_core_aic_area',
  WULING_SKY_KING_FLATS = 'wuling_sky_king_flats',
}

export type DepotBusLayoutArrangement = 'bottom' | 'bottom-right'

export interface DepotBusLayout {
  arrangement: DepotBusLayoutArrangement
  bottomSections: number
  rightSections?: number
  hasPort: boolean
}

export interface FieldTemplate {
    width: number
    height: number
    region: RegionID
    depotBusPortLimit: number
    depotBusSectionLimit: number
  depotBusLayout?: DepotBusLayout
  initialFacilityType?: FacilityID
}

export interface RegionFieldDefinition {
  id: RegionFieldID
  region: RegionID
  template: FieldTemplateID
  role: FactoryRole
}

export interface Item {
  tier: number
  fluid?: boolean
}

export interface Recipe {
  inputs: Partial<Record<ItemID, number>>
  outputs: Partial<Record<ItemID, number>>
  powerOutput?: number
  facilityID: FacilityID
  time: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type FacilityPortMinimal = [x: number, y: number, dir: Direction]

export type FacilityPortFull = [x: number, y: number, dir: Direction, type: 'belt' | 'pipe', subType: 'input' | 'output', external?: 'depot' | 'world']

export interface Facility {
  category: FacilityCategory
  width: number
  height: number
  power?: number
  powerArea?: {
    width: number
    height: number
  }
  irrigationArea?: {
    side: Direction
    width: number
    height: number
  }
  beltInputs?: Direction | FacilityPortMinimal[]
  beltOutputs?: Direction | FacilityPortMinimal[]
  pipeInputs?: Direction | FacilityPortMinimal[]
  pipeOutputs?: Direction | FacilityPortMinimal[]
  depotInputs?: FacilityPortMinimal[]
  depotOutputs?: FacilityPortMinimal[]
  ports?: FacilityPortFull[]
  allowedRegions?: RegionID[]
  pipePortsAllowedRegions?: RegionID[]
  depotBusConnectionSide?: Direction
  notImplementedYet?: boolean
}

export interface Localization {
  interface: {
    factorySummary: string
    factoryLabel: string
    depot: string
    world: string
    facilities: string
    paths: string
    fixtures: string
    facility: string
    path: string
    fixture: string
    port: string
    selection: string
    type: string
    item: string
    direction: string
    connection: string
    setRecipe: string
    actualRecipe: string
    recipeOutputs: string
    inputs: string
    outputs: string
    time: string
    productionRate: string
    selectRecipe: string
    clearRecipe: string
    clearRecipeDescription: string
    clearItem: string
    clearItemDescription: string
    jumpStartRecipe: string
    jumpStartDescription: string
    errors: string
    errorInvalidPlacement: string
    errorOutOfBounds: string
    errorNoValidRecipe: string
    errorUnpowered: string
    errorInvalidLayout: string
    errorInvalidConnection: string
    errorInvalidTemplate: string
    errorInvalidDepotBusConnection: string
    errorNoItemAssigned: string
    errorNothingConnected: string
    errorBothInputs: string
    errorBothOutputs: string
    errorCongested: string
    errorDisconnected: string
    errorBlocked: string
    powerGenerated: string
    powerConsumed: string
    itemFlowUnits: string
    powerFlowUnits: string
    inputFlows: string
    outputFlows: string
    none: string
    powered: string
    noPower: string
    flow: string
    flows: string
    productionAt: string
    ofTheoreticalMaximum: string
    flowPartiallyObstructed: string
    primaryBottleneck: string
    insufficientFlowRate: string
    undo: string
    redo: string
    delete: string
    placeFacility: string
    rotateClockwise: string
    rotateCounterClockwise: string
    copy: string
    paste: string
    duplicate: string
    placeBridge: string
    placeSplitter: string
    placeConverger: string
    placeControlPort: string
    undoTooltip: string
    redoTooltip: string
    deleteTooltip: string
    placeFacilityTooltip: string
    rotateClockwiseTooltip: string
    rotateCounterClockwiseTooltip: string
    copyTooltip: string
    pasteTooltip: string
    duplicateTooltip: string
    placeBeltPath: string
    placeBeltPathTooltip: string
    placePipePath: string
    placePipePathTooltip: string
    placeBridgeTooltip: string
    placeSplitterTooltip: string
    placeConvergerTooltip: string
    placeControlPortTooltip: string
    returnToOnboardingTooltip: string
    projectSettings: string
    projectExport: string
    projectExportTooltip: string
    templateSelectionTitle: string
    templateSelectionDescription: string
    projectSettingsTitle: string
    projectSettingsDescription: string
    projectNameLabel: string
    projectNamePlaceholder: string
    templatePresetValleyIVMain: string
    templatePresetValleyIVOutpost: string
    templatePresetWulingMain: string
    templatePresetWulingOutpost: string
    templatePresetCustom: string
    templateCustomSettings: string
    templateWidth: string
    templateHeight: string
    templateRegion: string
    templateDepotBusPortLimit: string
    templateDepotBusSectionLimit: string
    templateApply: string
    templateCancel: string
    templateContinue: string
    onboardingTitle: string
    onboardingDescription: string
    onboardingCreateNew: string
    regionPlanOnboardingTitle: string
    regionPlanAssignedLabel: string
    regionPlanUnassignedLabel: string
    regionPlanLoadAssigned: string
    regionPlanCreateAndAssign: string
    onboardingLoadExisting: string
    onboardingLoadLocalStorage: string
    onboardingLoadFile: string
    onboardingLoadComingSoon: string
    projectDefaultName: string
    projectImportTitle: string
    projectImportDescription: string
    projectImportButton: string
    projectImportDrop: string
    projectListEmpty: string
    projectListEmptyDeleted: string
    projectLoad: string
    projectDelete: string
    projectRestore: string
    projectHiddenLabel: string
    projectLastUpdated: string
    projectRecoverDeleted: string
    projectHideDeleted: string
    fieldControlsGroupProject: string
    fieldControlsGroupEdit: string
    fieldControlsGroupTransform: string
    fieldControlsGroupBuild: string
    fieldControlsGroupFixtures: string
    regionPlanOpen: string
    regionPlanTitle: string
    regionPlanDescription: string
    regionPlanRegionLabel: string
    regionPlanFactoriesLabel: string
    regionPlanAssignmentsTitle: string
    regionPlanSummaryTitle: string
    regionPlanNetFlow: string
    regionPlanAssignPlaceholder: string
    regionPlanNoProjects: string
    itemFlowUnitsPerMinute: string
    search: string
    portTypeBelt: string
    portTypePipe: string
    portTypeDepot: string
    portSubTypeInput: string
    portSubTypeOutput: string
    directionUp: string
    directionDown: string
    directionLeft: string
    directionRight: string
    pathEditingInstructions: string
    pathEditingDoubleClickToFinish: string
    pathEditingDoubleClickPortToConnect: string
    pathEditingBackspaceToUndo: string
    pathEditingEscapeToCancel: string
    pathEditingResumeFromEnd: string
    fixtureEditingInstructions: string
    fixtureEditingClickToPlace: string
    fixtureEditingEscapeToCancel: string
    bugReportTitle: string
    bugReportDescription: string
    bugReportDetailsLabel: string
    bugReportCopyButton: string
    bugReportOpenIssueButton: string
    bugReportReloadButton: string
    bugReportCopySuccess: string
    bugReportCopyFailure: string
    reportIssue: string
    reportIssueTooltip: string
  }
  regions: Record<RegionID, string>
  factoryRoles: Record<FactoryRole, string>
  regionFields: Record<RegionFieldID, string>
  facilityCategories: Record<FacilityCategory, string>
  items: Record<ItemID, string>
}

export enum ItemID {
  CANNED_CITROME_C = "item_bottled_food_1",
  CANNED_CITROME_B = "item_bottled_food_2",
  CANNED_CITROME_A = "item_bottled_food_3",
  JINCAO_DRINK = "item_bottled_food_4",
  BUCK_CAPSULE_C = "item_bottled_rec_hp_1",
  BUCK_CAPSULE_B = "item_bottled_rec_hp_2",
  BUCK_CAPSULE_A = "item_bottled_rec_hp_3",
  YAZHEN_SYRINGE_C = "item_bottled_rec_hp_4",
  STABILIZED_CARBON = "item_carbon_enr",
  DENSE_CARBON_POWDER = "item_carbon_enr_powder",
  CARBON = "item_carbon_mtl",
  CARBON_POWDER = "item_carbon_powder",
  PACKED_ORIGOCRUST = "item_crystal_enr",
  DENSE_ORIGOCRUST_POWDER = "item_crystal_enr_powder",
  ORIGOCRUST_POWDER = "item_crystal_powder",
  ORIGOCRUST = "item_crystal_shell",
  AMETHYST_COMPONENT = "item_equip_script_1",
  FERRIUM_COMPONENT = "item_equip_script_2",
  CRYSTON_COMPONENT = "item_equip_script_3",
  XIRANITE_COMPONENT = "item_equip_script_4",
  AMETHYST_BOTTLE = "item_glass_bottle",
  AMETHYST_PART = "item_glass_cmpt",
  CRYSTON_BOTTLE = "item_glass_enr_bottle",
  CRYSTON_PART = "item_glass_enr_cmpt",
  FERRIUM_BOTTLE = "item_iron_bottle",
  FERRIUM_PART = "item_iron_cmpt",
  STEEL = "item_iron_enr",
  STEEL_BOTTLE = "item_iron_enr_bottle",
  STEEL_PART = "item_iron_enr_cmpt",
  DENSE_FERRIUM_POWDER = "item_iron_enr_powder",
  FERRIUM = "item_iron_nugget",
  FERRIUM_ORE = "item_iron_ore",
  FERRIUM_POWDER = "item_iron_powder",
  JINCAO_SOLUTION = "item_liquid_plant_grass_1",
  YAZHEN_SOLUTION = "item_liquid_plant_grass_2",
  CLEAN_WATER = "item_liquid_water",
  LIQUID_XIRANITE = "item_liquid_xiranite",
  TRANSPORT_BELT = "item_log_belt_01",
  ITEM_CONTROL_PORT = "item_log_conditioner",
  BELT_BRIDGE = "item_log_connector",
  CONVERGER = "item_log_converger",
  PIPE = "item_log_pipe_01",
  PIPE_CONTROL_PORT = "item_log_pipe_conditioner",
  PIPE_BRIDGE = "item_log_pipe_connector",
  PIPE_CONVERGER = "item_log_pipe_converger",
  PIPE_SPLITTER = "item_log_pipe_splitter",
  SPLITTER = "item_log_splitter",
  BURDO_MUCK = "item_muck_feces_1",
  BUMPER_RICH = "item_muck_xiranite_1",
  DENSE_ORIGINIUM_POWDER = "item_originium_enr_powder",
  ORIGINIUM_ORE = "item_originium_ore",
  ORIGINIUM_POWDER = "item_originium_powder",
  AKETINE = "item_plant_bbflower_1",
  AKETINE_POWDER = "item_plant_bbflower_powder_1",
  AKETINE_SEED = "item_plant_bbflower_seed_1",
  JINCAO = "item_plant_grass_1",
  YAZHEN = "item_plant_grass_2",
  JINCAO_POWDER = "item_plant_grass_powder_1",
  YAZHEN_POWDER = "item_plant_grass_powder_2",
  JINCAO_SEED = "item_plant_grass_seed_1",
  YAZHEN_SEED = "item_plant_grass_seed_2",
  BUCKFLOWER = "item_plant_moss_1",
  CITROME = "item_plant_moss_2",
  SANDLEAF = "item_plant_moss_3",
  GROUND_BUCKFLOWER_POWDER = "item_plant_moss_enr_powder_1",
  GROUND_CITROME_POWDER = "item_plant_moss_enr_powder_2",
  BUCKFLOWER_POWDER = "item_plant_moss_powder_1",
  CITROME_POWDER = "item_plant_moss_powder_2",
  SANDLEAF_POWDER = "item_plant_moss_powder_3",
  BUCKFLOWER_SEED = "item_plant_moss_seed_1",
  CITROME_SEED = "item_plant_moss_seed_2",
  SANDLEAF_SEED = "item_plant_moss_seed_3",
  REED_RYE = "item_plant_sp_1",
  TARTPEPPER = "item_plant_sp_2",
  REDJADE_GINSENG = "item_plant_sp_3",
  AMBER_RICE = "item_plant_sp_4",
  REED_RYE_SEED = "item_plant_sp_seed_1",
  TARTPEPPER_SEED = "item_plant_sp_seed_2",
  REDJADE_GINSENG_SEED = "item_plant_sp_seed_3",
  AMBER_RICE_SEED = "item_plant_sp_seed_4",
  WOOD = "item_plant_tundra_wood",
  LC_VALLEY_BATTERY = "item_proc_battery_1",
  SC_VALLEY_BATTERY = "item_proc_battery_2",
  HC_VALLEY_BATTERY = "item_proc_battery_3",
  LC_WULING_BATTERY = "item_proc_battery_4",
  INDUSTRIAL_EXPLOSIVE = "item_proc_bomb_1",
  CRYSTON_FIBER = "item_quartz_enr",
  CRYSTON_POWDER = "item_quartz_enr_powder",
  AMETHYST_FIBER = "item_quartz_glass",
  AMETHYST_POWDER = "item_quartz_powder",
  AMETHYST_ORE = "item_quartz_sand",
  XIRANITE = "item_xiranite_powder",
  CONDUCTIVE_EFFIGY_STONE = "item_drop_agdisk_1",
  HOLLOW_AGGAGRIT = "item_drop_agfly_1",
  HARD_AGGAGRIT = "item_drop_agmelee_1",
  ENERGIZED_AGGAGRIT = "item_drop_agrange_1",
  NATURAL_CHRYSOPOLIS_INGOT = "item_drop_agshield_1",
  FILLET = "item_drop_dog_1",
  PUNGENT_JERKY = "item_drop_erhound_1",
  CHROMATIC_LIPIDS = "item_drop_firebat_1",
  GROVENYMPH_PUPA = "item_drop_hscrane_1",
  WATERLAMP_GLOWBULB = "item_drop_hsfly_1",
  QUILLBEAST_LIVER = "item_drop_hshog_1",
  QINGBO_BAMBOO_CHIMES = "item_drop_hsmino_1",
  YOUNG_BAMBOO_SPROUT = "item_drop_hsmob_1",
  RAKERBEAST_LONGFUR = "item_drop_hstiger_1",
  HAZE_SOAKED_BALLISTA = "item_drop_hvybow_1",
  POWDERED_GRASS_SEED = "item_drop_lbmob_1",
  SIEGEBREAKER_GAUNTLETS = "item_drop_lbroshan_1",
  CARTILAGE_BIT = "item_drop_lbshamman_1",
  BITTER_FLOUR = "item_drop_lbshield_1",
  SHATTERED_AXE_BLADE = "item_drop_lbtough_1",
  NIDWYRM_WHISKERS = "item_drop_mimicw_1",
  AXEHORN = "item_drop_sandb_1",
  SLUG_MEAT = "item_drop_slimeml_1",
  INSTANT_VINTAGE = "item_drop_wgabyss_1",
  BLACK_TREACLE = "item_drop_wgshoal_1",
  RESILIENT_WATER = "item_drop_wgslime_1",
  NATURAL_SPARKLING_WATER = "item_drop_wgthorns_1",
  CRYSTON_BOTTLE_LIQUID = "item_galss_enr_bottle_liquid",
  AMETHYST_BOTTLE_LIQUID = "item_glass_bottle_liquid",
  FERRIUM_BOTTLE_LIQUID = "item_iron_bottle_liquid",
  STEEL_BOTTLE_LIQUID = "item_iron_enr_bottle_liquid",
  KALKODENDRA = "item_plant_crylplant_1_1",
  CHRYSODENDRA = "item_plant_crylplant_1_2",
  VITRODENDRA = "item_plant_crylplant_1_3",
  BLIGHTED_JADELEAF = "item_plant_crylplant_2_1",
  FALSE_AGGELA = "item_plant_crylplant_2_2",
  FLUFFED_JINCAO = "item_plant_grass_spc_1",
  THORNY_YAZHEN = "item_plant_grass_spc_2",
  FIREBUCKLE = "item_plant_moss_spc_1",
  UMBRALINE = "item_plant_moss_spc_2",
  PINK_BOLETE = "item_plant_mushroom_1_1",
  RED_BOLETE = "item_plant_mushroom_1_2",
  RUBY_BOLETE = "item_plant_mushroom_1_3",
  BLOODCAP = "item_plant_mushroom_2_1",
  COSMAGARIC = "item_plant_mushroom_2_2",
  KALKONYX = "item_plant_spcstone_1_1",
  AURONYX = "item_plant_spcstone_1_2",
  UMBRONYX = "item_plant_spcstone_1_3",
  IGNEOSITE = "item_plant_spcstone_2_1",
  WULINGSTONE = "item_plant_spcstone_2_2",
  PLANT_MATTER = "item_plant_tundra_impts",
  GLOWBUG = "item_plant_tundra_insect_1",
  SCORCHBUG = "item_plant_tundra_insect_2",
  GLOWBUG_POWDER = "item_plant_tundra_insect_powder_1",
  SCORCHBUG_POWDER = "item_plant_tundra_insect_powder_2",
  FITTING_UNIT = "item_port_cmpt_mc_1",
  SEPARATING_UNIT = "item_port_dismantler_1",
  FLUID_SUPPLY_UNIT = "item_port_dumper_1",
  FILLING_UNIT = "item_port_filling_pd_mc_1",
  REFINING_UNIT = "item_port_furnance_1",
  SHREDDING_UNIT = "item_port_grinder_1",
  FLUID_TANK = "item_port_liquid_storager_1",
  DEPOT_LOADER = "item_port_loader_1",
  DEPOT_BUS_SECTION = "item_port_log_hongs_bus",
  DEPOT_BUS_PORT = "item_port_log_hongs_bus_source",
  REACTOR_CRUCIBLE = "item_port_mix_pool_1",
  PLANTING_UNIT = "item_port_planter_1",
  ELECTRIC_NEXUS = "item_port_power_port_1",
  THERMAL_BANK = "item_port_power_sta_1",
  SEED_PICKING_UNIT = "item_port_seedcol_1",
  MOULDING_UNIT = "item_port_shaper_1",
  AKETINE_PLOT = "item_port_soil_bbflower_1",
  JINCAO_PLOT = "item_port_soil_grass_1",
  YAZHEN_PLOT = "item_port_soil_grass_2",
  BUCKFLOWER_PLOT = "item_port_soil_moss_1",
  CITROME_PLOT = "item_port_soil_moss_2",
  SANDLEAF_PLOT = "item_port_soil_moss_3",
  REED_RYE_PLOT = "item_port_soil_sp_1",
  TARTPEPPER_PLOT = "item_port_soil_sp_2",
  REDJADE_GINSENG_PLOT = "item_port_soil_sp_3",
  AMBER_RICE_PLOT = "item_port_soil_sp_4",
  PROTOCOL_AUTOMATION_CORE_PAC = "item_port_sp_hub_1",
  SUB_PAC = "item_port_sp_sub_hub_1",
  SPRINKLER = "item_port_squirter_1",
  PROTOCOL_STASH = "item_port_storager_1",
  GRINDING_UNIT = "item_port_thickener_1",
  PACKAGING_UNIT = "item_port_tools_asm_mc_1",
  DEPOT_UNLOADER = "item_port_unloader_1",
  GEARING_UNIT = "item_port_winder_1",
  FORGE_OF_THE_SKY = "item_port_xiranite_oven_1",
  ORIPATHY_SUPPRESSANT = "item_quest_e1m5_inhibit",
  AEROSPACE_MATERIAL_I = "item_spaceship_cmpt_1",
  AEROSPACE_MATERIAL_II = "item_spaceship_cmpt_2",
  BUCKPILL_S = "item_bottled_flower1spc_1",
  BUCKPILL_L = "item_bottled_flower1spc_2",
  BUCKPILL_RF = "item_bottled_flower1spc_3",
  CITROMIX_S = "item_bottled_flower2spc_1",
  CITROMIX_L = "item_bottled_flower2spc_2",
  CITROMIX_RF = "item_bottled_flower2spc_3",
  JINCAO_TISANE = "item_bottled_grass1spc_1",
  JINCAO_INFUSION = "item_bottled_grass1spc_2",
  YAZHEN_SPRAY_S = "item_bottled_grass2spc_1",
  YAZHEN_SPRAY_L = "item_bottled_grass2spc_2",
  ARTS_VIAL = "item_bottled_insec1_1",
  ARTS_TUBE = "item_bottled_insec1_2",
  BIZARRO_CHILL = "item_bottled_moss_2_animal_1",
  VALLEY_PIE = "item_corp1_animal_1",
  MEAT_STIR_FRY = "item_corp2_animal_1",
  GARDEN_FRIED_RICE = "item_corp4_grass2_1",
  FLUFFED_JINCAO_POWDER = "item_plant_grass_spc_powder_1",
  THORNY_YAZHEN_POWDER = "item_plant_grass_spc_powder_2",
  FIREBUCKLE_POWDER = "item_plant_moss_spc_powder_1",
  CITROMIX = "item_plant_moss_spc_powder_2",
  COSMO_MELTO_JELLY = "item_agfly_1_agmelee_1_moss_2_1",
  MEATY_BUCKFLOWER_STEW = "item_agmelee_1_moss_1_lbmob_1_1",
  SUPERHOT_SLUG_GRATIN = "item_agmelee_1_sp_2_slimeml_1_1",
  JAKUBS_LEGACY = "item_agrange_1_erhound_1_sp_1_1",
  SIMPLE_PAIN_RELIEF_SALVE = "item_agrange_1_lbshamman_bottled_1",
  HANDMADE_WEIRDROP = "item_agrange_1_moss_2_lbmob_1_1",
  KUNST_VIAL = "item_bottled_insec2_1",
  KUNST_TUBE = "item_bottled_insec2_2",
  PERPLEXING_MEDICATION = "item_bottled_moss_1_2_1",
  GINSENG_MEAT_STEW = "item_corp3_animal_1",
  FORTIFYING_INFUSION = "item_corp3_grass1_1",
  WULING_FRIED_RICE = "item_corp4_animal_1",
  STEW_MEETING = "item_dog_1_slimeml_1_1",
  HAZEFYRE_BLOSSOM = "item_erhound_1_agmelee_1_moss_1_1",
  EDIBLE_DENSTACK = "item_firebat_1_agrange_1_1",
  SIMMERED_XIRANITE_BALL = "item_hsfly_1_slimeml_1_hsmob_1_1",
  WULING_FLAME_BOYANCE = "item_hshog_1_hsmob_1_slimeml_1_1",
  SESQA_STYLE_FILLET = "item_lbmob_1_dog_1_moss_1_1",
  CARTILAGE_TACK = "item_lbmob_1_lbshamman_1_sp_1_1",
  SECRET_STIMULATING_TISANE = "item_lbmob_1_moss_2_bottled_1",
  INSTANT_BONE_SOUP = "item_lbshamman_1_agmelee_1_1",
  OLD_MAN_JOHNS_BURGER = "item_lbshield_1_slimeml_1_dog_1_1",
  SOD_TURNING_MEAT_SOUP = "item_mimicw_1_moss_1_moss_2_1",
  MINI_HONEY_SLUGPUDDING = "item_slimeml_1_agrange_1_moss_2_1",
  PULLED_SLUG_MEAT = "item_slimeml_1_erhound_1_agfly_1_1",
  HUB_EMERGENCY_RATION = "item_sp_1_moss_1_agmelee_1_1",
  SUPERHOT_FRUIT_PRESERVES = "item_sp_2_moss_2_agrange_1_1",
  MINI_SUGAR_PAINTING = "item_wgshoal_1_grass_1_grass_2_1",
  CHUBBY_LUNG_JELLIED_GREENS = "item_wgslime_1_hsmob_1_grass_2_1",
  MYSTERY_SODA = "item_wgslime_1_wgthorns_1_1",
  PAN_FRIED_DOUBLE_CRISP = "item_wgthorns_1_hshog_1_hsmob_1_1",
  GRENADE_TOWER = "item_port_battle_cannon_1",
  HE_GRENADE_TOWER = "item_port_battle_cannon_2",
  MARSH_GAS_MK_I = "item_port_battle_fog_1",
  LN_TOWER = "item_port_battle_frost_1",
  BEAM_TOWER = "item_port_battle_laser_1",
  SURGE_TOWER = "item_port_battle_lightning_1",
  MEDICAL_TOWER = "item_port_battle_medic_1",
  OMNIDIRECTIONAL_SONIC_TOWER = "item_port_battle_shockwave_1",
  SENTRY_TOWER = "item_port_battle_sniper_1",
  GUN_TOWER = "item_port_battle_turret_1",
  HEAVY_GUN_TOWER = "item_port_battle_turret_2",
  EASY_STASH = "item_port_carrier_1",
  MEMO_BEACON = "item_port_marker_1",
  PORTABLE_ORIGINIUM_RIG = "item_port_miner_1",
  ELECTRIC_MINING_RIG = "item_port_miner_2",
  ELECTRIC_MINING_RIG_MK_II = "item_port_miner_3",
  ELECTRIC_PYLON = "item_port_power_diffuser_1",
  XIRANITE_PYLON = "item_port_power_diffuser_2",
  RELAY_TOWER = "item_port_power_pole_2",
  XIRANITE_RELAY = "item_port_power_pole_3",
  ELECTRIC_NEXUS_TERMINAL = "item_port_power_terminal_1",
  FLUID_PUMP = "item_port_pump_1",
  ZIPLINE_PYLON = "item_port_travel_pole_1",
  ZIPLINE_TOWER = "item_port_travel_pole_2",
}

export enum FacilityID {
  FITTING_UNIT = "item_port_cmpt_mc_1",
  SEPARATING_UNIT = "item_port_dismantler_1",
  FLUID_SUPPLY_UNIT = "item_port_dumper_1",
  FILLING_UNIT = "item_port_filling_pd_mc_1",
  REFINING_UNIT = "item_port_furnance_1",
  SHREDDING_UNIT = "item_port_grinder_1",
  FLUID_TANK = "item_port_liquid_storager_1",
  DEPOT_LOADER = "item_port_loader_1",
  DEPOT_BUS_SECTION = "item_port_log_hongs_bus",
  DEPOT_BUS_PORT = "item_port_log_hongs_bus_source",
  REACTOR_CRUCIBLE = "item_port_mix_pool_1",
  PLANTING_UNIT = "item_port_planter_1",
  ELECTRIC_NEXUS = "item_port_power_port_1",
  THERMAL_BANK = "item_port_power_sta_1",
  SEED_PICKING_UNIT = "item_port_seedcol_1",
  MOULDING_UNIT = "item_port_shaper_1",
  AKETINE_PLOT = "item_port_soil_bbflower_1",
  JINCAO_PLOT = "item_port_soil_grass_1",
  YAZHEN_PLOT = "item_port_soil_grass_2",
  BUCKFLOWER_PLOT = "item_port_soil_moss_1",
  CITROME_PLOT = "item_port_soil_moss_2",
  SANDLEAF_PLOT = "item_port_soil_moss_3",
  REED_RYE_PLOT = "item_port_soil_sp_1",
  TARTPEPPER_PLOT = "item_port_soil_sp_2",
  REDJADE_GINSENG_PLOT = "item_port_soil_sp_3",
  AMBER_RICE_PLOT = "item_port_soil_sp_4",
  PROTOCOL_AUTOMATION_CORE_PAC = "item_port_sp_hub_1",
  SUB_PAC = "item_port_sp_sub_hub_1",
  SPRINKLER = "item_port_squirter_1",
  PROTOCOL_STASH = "item_port_storager_1",
  GRINDING_UNIT = "item_port_thickener_1",
  PACKAGING_UNIT = "item_port_tools_asm_mc_1",
  DEPOT_UNLOADER = "item_port_unloader_1",
  GEARING_UNIT = "item_port_winder_1",
  FORGE_OF_THE_SKY = "item_port_xiranite_oven_1",
  GRENADE_TOWER = "item_port_battle_cannon_1",
  HE_GRENADE_TOWER = "item_port_battle_cannon_2",
  MARSH_GAS_MK_I = "item_port_battle_fog_1",
  LN_TOWER = "item_port_battle_frost_1",
  BEAM_TOWER = "item_port_battle_laser_1",
  SURGE_TOWER = "item_port_battle_lightning_1",
  MEDICAL_TOWER = "item_port_battle_medic_1",
  OMNIDIRECTIONAL_SONIC_TOWER = "item_port_battle_shockwave_1",
  SENTRY_TOWER = "item_port_battle_sniper_1",
  GUN_TOWER = "item_port_battle_turret_1",
  HEAVY_GUN_TOWER = "item_port_battle_turret_2",
  EASY_STASH = "item_port_carrier_1",
  MEMO_BEACON = "item_port_marker_1",
  PORTABLE_ORIGINIUM_RIG = "item_port_miner_1",
  ELECTRIC_MINING_RIG = "item_port_miner_2",
  ELECTRIC_MINING_RIG_MK_II = "item_port_miner_3",
  ELECTRIC_PYLON = "item_port_power_diffuser_1",
  XIRANITE_PYLON = "item_port_power_diffuser_2",
  RELAY_TOWER = "item_port_power_pole_2",
  XIRANITE_RELAY = "item_port_power_pole_3",
  ELECTRIC_NEXUS_TERMINAL = "item_port_power_terminal_1",
  FLUID_PUMP = "item_port_pump_1",
  ZIPLINE_PYLON = "item_port_travel_pole_1",
  ZIPLINE_TOWER = "item_port_travel_pole_2",
}

export enum FacilityCategory {
  SPECIAL = "special",
  LOGISTICS = "logistics",
  RESOURCING = "resourcing",
  DEPOT_ACCESS = "depot_access",
  PRODUCTION_I = "production_i",
  PRODUCTION_II = "production_ii",
  POWER = "power",
  MISC = "misc",
  FARMING = "farming",
  COMBAT = "combat",
}

export enum PathTypeID {
  BELT = "item_log_belt_01",
  PIPE = "item_log_pipe_01",
}

export enum PathFixtureID {
  ITEM_CONTROL_PORT = "item_log_conditioner",
  BELT_BRIDGE = "item_log_connector",
  CONVERGER = "item_log_converger",
  SPLITTER = "item_log_splitter",
  PIPE_CONTROL_PORT = "item_log_pipe_conditioner",
  PIPE_BRIDGE = "item_log_pipe_connector",
  PIPE_CONVERGER = "item_log_pipe_converger",
  PIPE_SPLITTER = "item_log_pipe_splitter",
}

export enum RecipeID {
  COMPONENT_GLASS_CMPT_1 = "component_glass_cmpt_1",
  COMPONENT_GLASS_ENR_CMPT_1 = "component_glass_enr_cmpt_1",
  COMPONENT_IRON_CMPT_1 = "component_iron_cmpt_1",
  COMPONENT_IRON_ENR_CMPT_1 = "component_iron_enr_cmpt_1",
  DISMANTLER_GLASS_GRASS_1_1 = "dismantler_glass_grass_1_1",
  DISMANTLER_GLASS_GRASS_2_1 = "dismantler_glass_grass_2_1",
  DISMANTLER_GLASS_WATER_1 = "dismantler_glass_water_1",
  DISMANTLER_GLASS_XIRANITE_1 = "dismantler_glass_xiranite_1",
  DISMANTLER_GLASSENR_GRASS_1_1 = "dismantler_glassenr_grass_1_1",
  DISMANTLER_GLASSENR_GRASS_2_1 = "dismantler_glassenr_grass_2_1",
  DISMANTLER_GLASSENR_WATER_1 = "dismantler_glassenr_water_1",
  DISMANTLER_GLASSENR_XIRANITE_1 = "dismantler_glassenr_xiranite_1",
  DISMANTLER_IRON_GRASS_1_1 = "dismantler_iron_grass_1_1",
  DISMANTLER_IRON_GRASS_2_1 = "dismantler_iron_grass_2_1",
  DISMANTLER_IRON_WATER_1 = "dismantler_iron_water_1",
  DISMANTLER_IRON_XIRANITE_1 = "dismantler_iron_xiranite_1",
  DISMANTLER_IRONENR_GRASS_1_1 = "dismantler_ironenr_grass_1_1",
  DISMANTLER_IRONENR_GRASS_2_1 = "dismantler_ironenr_grass_2_1",
  DISMANTLER_IRONENR_WATER_1 = "dismantler_ironenr_water_1",
  DISMANTLER_IRONENR_XIRANITE_1 = "dismantler_ironenr_xiranite_1",
  FILLING_BOTTLED_FOOD_1_1 = "filling_bottled_food_1_1",
  FILLING_BOTTLED_FOOD_2_1 = "filling_bottled_food_2_1",
  FILLING_BOTTLED_FOOD_3_1 = "filling_bottled_food_3_1",
  FILLING_BOTTLED_GLASS_GRASS_1 = "filling_bottled_glass_grass_1",
  FILLING_BOTTLED_GLASS_GRASS_2 = "filling_bottled_glass_grass_2",
  FILLING_BOTTLED_GLASS_WATER = "filling_bottled_glass_water",
  FILLING_BOTTLED_GLASS_XIRANITE = "filling_bottled_glass_xiranite",
  FILLING_BOTTLED_GLASSENR_GRASS_1 = "filling_bottled_glassenr_grass_1",
  FILLING_BOTTLED_GLASSENR_GRASS_2 = "filling_bottled_glassenr_grass_2",
  FILLING_BOTTLED_GLASSENR_WATER = "filling_bottled_glassenr_water",
  FILLING_BOTTLED_GLASSENR_XIRANITE = "filling_bottled_glassenr_xiranite",
  FILLING_BOTTLED_IRON_GRASS_1 = "filling_bottled_iron_grass_1",
  FILLING_BOTTLED_IRON_GRASS_2 = "filling_bottled_iron_grass_2",
  FILLING_BOTTLED_IRON_WATER = "filling_bottled_iron_water",
  FILLING_BOTTLED_IRON_XIRANITE = "filling_bottled_iron_xiranite",
  FILLING_BOTTLED_IRONENR_GRASS_1 = "filling_bottled_ironenr_grass_1",
  FILLING_BOTTLED_IRONENR_GRASS_2 = "filling_bottled_ironenr_grass_2",
  FILLING_BOTTLED_IRONENR_WATER = "filling_bottled_ironenr_water",
  FILLING_BOTTLED_IRONENR_XIRANITE = "filling_bottled_ironenr_xiranite",
  FILLING_BOTTLED_REC_HP_1_1 = "filling_bottled_rec_hp_1_1",
  FILLING_BOTTLED_REC_HP_2_1 = "filling_bottled_rec_hp_2_1",
  FILLING_BOTTLED_REC_HP_3_1 = "filling_bottled_rec_hp_3_1",
  FURNANCE_CARBON_ENR_1 = "furnance_carbon_enr_1",
  FURNANCE_CARBON_ENR_POWDER_1 = "furnance_carbon_enr_powder_1",
  FURNANCE_CARBON_ENR_POWDER_2 = "furnance_carbon_enr_powder_2",
  FURNANCE_CARBON_MATERIAL_1 = "furnance_carbon_material_1",
  FURNANCE_CARBON_MATERIAL_2 = "furnance_carbon_material_2",
  FURNANCE_CARBON_MATERIAL_3 = "furnance_carbon_material_3",
  FURNANCE_CARBON_MATERIAL_4 = "furnance_carbon_material_4",
  FURNANCE_CARBON_MATERIAL_5 = "furnance_carbon_material_5",
  FURNANCE_CARBON_MATERIAL_6 = "furnance_carbon_material_6",
  FURNANCE_CARBON_POWDER_1 = "furnance_carbon_powder_1",
  FURNANCE_CARBON_POWDER_2 = "furnance_carbon_powder_2",
  FURNANCE_CARBON_POWDER_3 = "furnance_carbon_powder_3",
  FURNANCE_CARBON_POWDER_4 = "furnance_carbon_powder_4",
  FURNANCE_CARBON_POWDER_5 = "furnance_carbon_powder_5",
  FURNANCE_CRYSTAL_ENR_1 = "furnance_crystal_enr_1",
  FURNANCE_CRYSTAL_ENR_POWDER_1 = "furnance_crystal_enr_powder_1",
  FURNANCE_CRYSTAL_POWDER_1 = "furnance_crystal_powder_1",
  FURNANCE_CRYSTAL_SHELL_1 = "furnance_crystal_shell_1",
  FURNANCE_CRYSTAL_SHELL_2 = "furnance_crystal_shell_2",
  FURNANCE_IRON_ENR_1 = "furnance_iron_enr_1",
  FURNANCE_IRON_NUGGET_1 = "furnance_iron_nugget_1",
  FURNANCE_IRON_NUGGET_2 = "furnance_iron_nugget_2",
  FURNANCE_QUARTZ_ENR_1 = "furnance_quartz_enr_1",
  FURNANCE_QUARTZ_GLASS_1 = "furnance_quartz_glass_1",
  FURNANCE_QUARTZ_GLASS_2 = "furnance_quartz_glass_2",
  GRINDER_CARBON_POWDER_1 = "grinder_carbon_powder_1",
  GRINDER_CRYSTAL_POWDER_1 = "grinder_crystal_powder_1",
  GRINDER_IRON_POWDER_1 = "grinder_iron_powder_1",
  GRINDER_ORIGINIUM_POWDER_1 = "grinder_originium_powder_1",
  GRINDER_PLANT_BBFLOWER_POWDER_1_1 = "grinder_plant_bbflower_powder_1_1",
  GRINDER_PLANT_GRASS_POWDER_1_1 = "grinder_plant_grass_powder_1_1",
  GRINDER_PLANT_GRASS_POWDER_2_1 = "grinder_plant_grass_powder_2_1",
  GRINDER_PLANT_MOSS_POWDER_1_1 = "grinder_plant_moss_powder_1_1",
  GRINDER_PLANT_MOSS_POWDER_2_1 = "grinder_plant_moss_powder_2_1",
  GRINDER_PLANT_MOSS_POWDER_3_1 = "grinder_plant_moss_powder_3_1",
  GRINDER_QUARTZ_POWDER_1 = "grinder_quartz_powder_1",
  PLANTER_PLANT_BBFLOWER_1 = "planter_plant_bbflower_1",
  PLANTER_PLANT_GRASS_1_1 = "planter_plant_grass_1_1",
  PLANTER_PLANT_GRASS_2_1 = "planter_plant_grass_2_1",
  PLANTER_PLANT_MOSS_1_1 = "planter_plant_moss_1_1",
  PLANTER_PLANT_MOSS_2_1 = "planter_plant_moss_2_1",
  PLANTER_PLANT_MOSS_3_1 = "planter_plant_moss_3_1",
  POOL_LIQUID_LIQUID_XIRANITE_1 = "pool_liquid_liquid_xiranite_1",
  POOL_LIQUID_PLANT_GRASS_1_1 = "pool_liquid_plant_grass_1_1",
  POOL_LIQUID_PLANT_GRASS_2_1 = "pool_liquid_plant_grass_2_1",
  SEEDCOLLECTOR_PLANT_BBFLOWER_1 = "seedcollector_plant_bbflower_1",
  SEEDCOLLECTOR_PLANT_GRASS_1_1 = "seedcollector_plant_grass_1_1",
  SEEDCOLLECTOR_PLANT_GRASS_2_1 = "seedcollector_plant_grass_2_1",
  SEEDCOLLECTOR_PLANT_MOSS_1_1 = "seedcollector_plant_moss_1_1",
  SEEDCOLLECTOR_PLANT_MOSS_2_1 = "seedcollector_plant_moss_2_1",
  SEEDCOLLECTOR_PLANT_MOSS_3_1 = "seedcollector_plant_moss_3_1",
  SEEDCOLLECTOR_PLANT_SP_1 = "seedcollector_plant_sp_1",
  SEEDCOLLECTOR_PLANT_SP_2 = "seedcollector_plant_sp_2",
  SEEDCOLLECTOR_PLANT_SP_3 = "seedcollector_plant_sp_3",
  SEEDCOLLECTOR_PLANT_SP_4 = "seedcollector_plant_sp_4",
  SHAPER_GLASS_BOTTLE_1 = "shaper_glass_bottle_1",
  SHAPER_GLASS_ENR_BOTTLE_1 = "shaper_glass_enr_bottle_1",
  SHAPER_IRON_BOTTLE_1 = "shaper_iron_bottle_1",
  SHAPER_IRON_ENR_BOTTLE_1 = "shaper_iron_enr_bottle_1",
  THICKENER_CARBON_ENR_POWDER_1 = "thickener_carbon_enr_powder_1",
  THICKENER_CRYSTAL_ENR_POWDER_1 = "thickener_crystal_enr_powder_1",
  THICKENER_IRON_ENR_POWDER_1 = "thickener_iron_enr_powder_1",
  THICKENER_ORIGINIUM_ENR_POWDER_1 = "thickener_originium_enr_powder_1",
  THICKENER_PLANT_MOSS_ENR_POWDER_1_1 = "thickener_plant_moss_enr_powder_1_1",
  THICKENER_PLANT_MOSS_ENR_POWDER_2_1 = "thickener_plant_moss_enr_powder_2_1",
  THICKENER_QUARTZ_ENR_POWDER_1 = "thickener_quartz_enr_powder_1",
  TOOLS_PROC_BATTERY_1_1 = "tools_proc_battery_1_1",
  TOOLS_PROC_BATTERY_2_1 = "tools_proc_battery_2_1",
  TOOLS_PROC_BATTERY_3_1 = "tools_proc_battery_3_1",
  TOOLS_PROC_BATTERY_4_1 = "tools_proc_battery_4_1",
  TOOLS_PROC_BOMB_1_1 = "tools_proc_bomb_1_1",
  TOOLS_PROC_FOOD_4_1 = "tools_proc_food_4_1",
  TOOLS_PROC_REC_HP_4_1 = "tools_proc_rec_hp_4_1",
  WINDER_EQUIP_SCRIPT_1 = "winder_equip_script_1",
  WINDER_EQUIP_SCRIPT_2 = "winder_equip_script_2",
  WINDER_EQUIP_SCRIPT_3 = "winder_equip_script_3",
  WINDER_EQUIP_SCRIPT_4 = "winder_equip_script_4",
  XIRANITE_OVEN_MUCK_XIRANITE_1 = "xiranite_oven_muck_xiranite_1",
  XIRANITE_OVEN_XIRANITE_POWDER_1 = "xiranite_oven_xiranite_powder_1",
  POWER_STA_ORIGINIUM_ORE = "power_sta_originium_ore",
  POWER_STA_PROC_BATTERY_1 = "power_sta_proc_battery_1",
  POWER_STA_PROC_BATTERY_2 = "power_sta_proc_battery_2",
  POWER_STA_PROC_BATTERY_3 = "power_sta_proc_battery_3",
  POWER_STA_PROC_BATTERY_4 = "power_sta_proc_battery_4",
}
