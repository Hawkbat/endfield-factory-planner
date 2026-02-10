import { FacilityID, ItemID, RecipeID } from "../types/data.js";
export const recipes = {
    [RecipeID.COMPONENT_GLASS_CMPT_1]: {
        inputs: {
            [ItemID.AMETHYST_FIBER]: 1
        },
        outputs: {
            [ItemID.AMETHYST_PART]: 1
        },
        facilityID: FacilityID.FITTING_UNIT,
        time: 2,
    },
    [RecipeID.COMPONENT_GLASS_ENR_CMPT_1]: {
        inputs: {
            [ItemID.CRYSTON_FIBER]: 1
        },
        outputs: {
            [ItemID.CRYSTON_PART]: 1
        },
        facilityID: FacilityID.FITTING_UNIT,
        time: 2,
    },
    [RecipeID.COMPONENT_IRON_CMPT_1]: {
        inputs: {
            [ItemID.FERRIUM]: 1
        },
        outputs: {
            [ItemID.FERRIUM_PART]: 1
        },
        facilityID: FacilityID.FITTING_UNIT,
        time: 2,
    },
    [RecipeID.COMPONENT_IRON_ENR_CMPT_1]: {
        inputs: {
            [ItemID.STEEL]: 1
        },
        outputs: {
            [ItemID.STEEL_PART]: 1
        },
        facilityID: FacilityID.FITTING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASS_GRASS_1_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASS_GRASS_2_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASS_WATER_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASS_XIRANITE_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASSENR_GRASS_1_1]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASSENR_GRASS_2_1]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASSENR_WATER_1]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_GLASSENR_XIRANITE_1]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRON_GRASS_1_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRON_GRASS_2_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRON_WATER_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRON_XIRANITE_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRONENR_GRASS_1_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRONENR_GRASS_2_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRONENR_WATER_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.DISMANTLER_IRONENR_XIRANITE_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        facilityID: FacilityID.SEPARATING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_FOOD_1_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 5,
            [ItemID.CITROME_POWDER]: 5
        },
        outputs: {
            [ItemID.CANNED_CITROME_C]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FILLING_BOTTLED_FOOD_2_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 10,
            [ItemID.CITROME_POWDER]: 10
        },
        outputs: {
            [ItemID.CANNED_CITROME_B]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FILLING_BOTTLED_FOOD_3_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 10,
            [ItemID.GROUND_CITROME_POWDER]: 10
        },
        outputs: {
            [ItemID.CANNED_CITROME_A]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FILLING_BOTTLED_GLASS_GRASS_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASS_GRASS_2]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASS_WATER]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASS_XIRANITE]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASSENR_GRASS_1]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASSENR_GRASS_2]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASSENR_WATER]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_GLASSENR_XIRANITE]: {
        inputs: {
            [ItemID.CRYSTON_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRON_GRASS_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRON_GRASS_2]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRON_WATER]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRON_XIRANITE]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRONENR_GRASS_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.JINCAO_SOLUTION]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRONENR_GRASS_2]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRONENR_WATER]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_IRONENR_XIRANITE]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 2,
    },
    [RecipeID.FILLING_BOTTLED_REC_HP_1_1]: {
        inputs: {
            [ItemID.AMETHYST_BOTTLE]: 5,
            [ItemID.BUCKFLOWER_POWDER]: 5
        },
        outputs: {
            [ItemID.BUCK_CAPSULE_C]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FILLING_BOTTLED_REC_HP_2_1]: {
        inputs: {
            [ItemID.FERRIUM_BOTTLE]: 10,
            [ItemID.BUCKFLOWER_POWDER]: 10
        },
        outputs: {
            [ItemID.BUCK_CAPSULE_B]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FILLING_BOTTLED_REC_HP_3_1]: {
        inputs: {
            [ItemID.STEEL_BOTTLE]: 10,
            [ItemID.GROUND_BUCKFLOWER_POWDER]: 10
        },
        outputs: {
            [ItemID.BUCK_CAPSULE_A]: 1
        },
        facilityID: FacilityID.FILLING_UNIT,
        time: 10,
    },
    [RecipeID.FURNANCE_CARBON_ENR_1]: {
        inputs: {
            [ItemID.STABILIZED_CARBON]: 1
        },
        outputs: {
            [ItemID.STABILIZED_CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_ENR_POWDER_1]: {
        inputs: {
            [ItemID.GROUND_BUCKFLOWER_POWDER]: 1
        },
        outputs: {
            [ItemID.STABILIZED_CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_ENR_POWDER_2]: {
        inputs: {
            [ItemID.GROUND_CITROME_POWDER]: 1
        },
        outputs: {
            [ItemID.STABILIZED_CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_1]: {
        inputs: {
            [ItemID.BUCKFLOWER]: 1
        },
        outputs: {
            [ItemID.CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_2]: {
        inputs: {
            [ItemID.CITROME]: 1
        },
        outputs: {
            [ItemID.CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_3]: {
        inputs: {
            [ItemID.SANDLEAF]: 1
        },
        outputs: {
            [ItemID.CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_4]: {
        inputs: {
            [ItemID.WOOD]: 1
        },
        outputs: {
            [ItemID.CARBON]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_5]: {
        inputs: {
            [ItemID.JINCAO]: 1
        },
        outputs: {
            [ItemID.CARBON]: 2
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_MATERIAL_6]: {
        inputs: {
            [ItemID.YAZHEN]: 1
        },
        outputs: {
            [ItemID.CARBON]: 2
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_POWDER_1]: {
        inputs: {
            [ItemID.BUCKFLOWER_POWDER]: 1
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_POWDER_2]: {
        inputs: {
            [ItemID.CITROME_POWDER]: 1
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_POWDER_3]: {
        inputs: {
            [ItemID.SANDLEAF_POWDER]: 3
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 2
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_POWDER_4]: {
        inputs: {
            [ItemID.JINCAO_POWDER]: 1
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 2
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CARBON_POWDER_5]: {
        inputs: {
            [ItemID.YAZHEN_POWDER]: 1
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 2
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CRYSTAL_ENR_1]: {
        inputs: {
            [ItemID.PACKED_ORIGOCRUST]: 1
        },
        outputs: {
            [ItemID.PACKED_ORIGOCRUST]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CRYSTAL_ENR_POWDER_1]: {
        inputs: {
            [ItemID.DENSE_ORIGINIUM_POWDER]: 1
        },
        outputs: {
            [ItemID.PACKED_ORIGOCRUST]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CRYSTAL_POWDER_1]: {
        inputs: {
            [ItemID.ORIGINIUM_POWDER]: 1
        },
        outputs: {
            [ItemID.ORIGOCRUST_POWDER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CRYSTAL_SHELL_1]: {
        inputs: {
            [ItemID.ORIGINIUM_ORE]: 1
        },
        outputs: {
            [ItemID.ORIGOCRUST]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_CRYSTAL_SHELL_2]: {
        inputs: {
            [ItemID.ORIGOCRUST_POWDER]: 1
        },
        outputs: {
            [ItemID.ORIGOCRUST]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_IRON_ENR_1]: {
        inputs: {
            [ItemID.DENSE_FERRIUM_POWDER]: 1
        },
        outputs: {
            [ItemID.STEEL]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_IRON_NUGGET_1]: {
        inputs: {
            [ItemID.FERRIUM_ORE]: 1
        },
        outputs: {
            [ItemID.FERRIUM]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_IRON_NUGGET_2]: {
        inputs: {
            [ItemID.FERRIUM_POWDER]: 1
        },
        outputs: {
            [ItemID.FERRIUM]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_QUARTZ_ENR_1]: {
        inputs: {
            [ItemID.CRYSTON_POWDER]: 1
        },
        outputs: {
            [ItemID.CRYSTON_FIBER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_QUARTZ_GLASS_1]: {
        inputs: {
            [ItemID.AMETHYST_ORE]: 1
        },
        outputs: {
            [ItemID.AMETHYST_FIBER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.FURNANCE_QUARTZ_GLASS_2]: {
        inputs: {
            [ItemID.AMETHYST_POWDER]: 1
        },
        outputs: {
            [ItemID.AMETHYST_FIBER]: 1
        },
        facilityID: FacilityID.REFINING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_CARBON_POWDER_1]: {
        inputs: {
            [ItemID.CARBON]: 1
        },
        outputs: {
            [ItemID.CARBON_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_CRYSTAL_POWDER_1]: {
        inputs: {
            [ItemID.ORIGOCRUST]: 1
        },
        outputs: {
            [ItemID.ORIGOCRUST_POWDER]: 1
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_IRON_POWDER_1]: {
        inputs: {
            [ItemID.FERRIUM]: 1
        },
        outputs: {
            [ItemID.FERRIUM_POWDER]: 1
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_ORIGINIUM_POWDER_1]: {
        inputs: {
            [ItemID.ORIGINIUM_ORE]: 1
        },
        outputs: {
            [ItemID.ORIGINIUM_POWDER]: 1
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_BBFLOWER_POWDER_1_1]: {
        inputs: {
            [ItemID.AKETINE]: 1
        },
        outputs: {
            [ItemID.AKETINE_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_GRASS_POWDER_1_1]: {
        inputs: {
            [ItemID.JINCAO]: 1
        },
        outputs: {
            [ItemID.JINCAO_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_GRASS_POWDER_2_1]: {
        inputs: {
            [ItemID.YAZHEN]: 1
        },
        outputs: {
            [ItemID.YAZHEN_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_MOSS_POWDER_1_1]: {
        inputs: {
            [ItemID.BUCKFLOWER]: 1
        },
        outputs: {
            [ItemID.BUCKFLOWER_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_MOSS_POWDER_2_1]: {
        inputs: {
            [ItemID.CITROME]: 1
        },
        outputs: {
            [ItemID.CITROME_POWDER]: 2
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_PLANT_MOSS_POWDER_3_1]: {
        inputs: {
            [ItemID.SANDLEAF]: 1
        },
        outputs: {
            [ItemID.SANDLEAF_POWDER]: 3
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.GRINDER_QUARTZ_POWDER_1]: {
        inputs: {
            [ItemID.AMETHYST_FIBER]: 1
        },
        outputs: {
            [ItemID.AMETHYST_POWDER]: 1
        },
        facilityID: FacilityID.SHREDDING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_BBFLOWER_1]: {
        inputs: {
            [ItemID.AKETINE_SEED]: 1
        },
        outputs: {
            [ItemID.AKETINE]: 1
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_GRASS_1_1]: {
        inputs: {
            [ItemID.JINCAO_SEED]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.JINCAO]: 2
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_GRASS_2_1]: {
        inputs: {
            [ItemID.YAZHEN_SEED]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.YAZHEN]: 2
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_MOSS_1_1]: {
        inputs: {
            [ItemID.BUCKFLOWER_SEED]: 1
        },
        outputs: {
            [ItemID.BUCKFLOWER]: 1
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_MOSS_2_1]: {
        inputs: {
            [ItemID.CITROME_SEED]: 1
        },
        outputs: {
            [ItemID.CITROME]: 1
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.PLANTER_PLANT_MOSS_3_1]: {
        inputs: {
            [ItemID.SANDLEAF_SEED]: 1
        },
        outputs: {
            [ItemID.SANDLEAF]: 1
        },
        facilityID: FacilityID.PLANTING_UNIT,
        time: 2,
    },
    [RecipeID.POOL_LIQUID_LIQUID_XIRANITE_1]: {
        inputs: {
            [ItemID.XIRANITE]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.LIQUID_XIRANITE]: 1
        },
        facilityID: FacilityID.REACTOR_CRUCIBLE,
        time: 2,
    },
    [RecipeID.POOL_LIQUID_PLANT_GRASS_1_1]: {
        inputs: {
            [ItemID.JINCAO_POWDER]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.JINCAO_SOLUTION]: 1
        },
        facilityID: FacilityID.REACTOR_CRUCIBLE,
        time: 2,
    },
    [RecipeID.POOL_LIQUID_PLANT_GRASS_2_1]: {
        inputs: {
            [ItemID.YAZHEN_POWDER]: 1,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.YAZHEN_SOLUTION]: 1
        },
        facilityID: FacilityID.REACTOR_CRUCIBLE,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_BBFLOWER_1]: {
        inputs: {
            [ItemID.AKETINE]: 1
        },
        outputs: {
            [ItemID.AKETINE_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_GRASS_1_1]: {
        inputs: {
            [ItemID.JINCAO]: 1
        },
        outputs: {
            [ItemID.JINCAO_SEED]: 1
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_GRASS_2_1]: {
        inputs: {
            [ItemID.YAZHEN]: 1
        },
        outputs: {
            [ItemID.YAZHEN_SEED]: 1
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_MOSS_1_1]: {
        inputs: {
            [ItemID.BUCKFLOWER]: 1
        },
        outputs: {
            [ItemID.BUCKFLOWER_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_MOSS_2_1]: {
        inputs: {
            [ItemID.CITROME]: 1
        },
        outputs: {
            [ItemID.CITROME_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_MOSS_3_1]: {
        inputs: {
            [ItemID.SANDLEAF]: 1
        },
        outputs: {
            [ItemID.SANDLEAF_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_SP_1]: {
        inputs: {
            [ItemID.REED_RYE]: 1
        },
        outputs: {
            [ItemID.REED_RYE_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_SP_2]: {
        inputs: {
            [ItemID.TARTPEPPER]: 1
        },
        outputs: {
            [ItemID.TARTPEPPER_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_SP_3]: {
        inputs: {
            [ItemID.REDJADE_GINSENG]: 1
        },
        outputs: {
            [ItemID.REDJADE_GINSENG_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SEEDCOLLECTOR_PLANT_SP_4]: {
        inputs: {
            [ItemID.AMBER_RICE]: 1
        },
        outputs: {
            [ItemID.AMBER_RICE_SEED]: 2
        },
        facilityID: FacilityID.SEED_PICKING_UNIT,
        time: 2,
    },
    [RecipeID.SHAPER_GLASS_BOTTLE_1]: {
        inputs: {
            [ItemID.AMETHYST_FIBER]: 2
        },
        outputs: {
            [ItemID.AMETHYST_BOTTLE]: 1
        },
        facilityID: FacilityID.MOULDING_UNIT,
        time: 2,
    },
    [RecipeID.SHAPER_GLASS_ENR_BOTTLE_1]: {
        inputs: {
            [ItemID.CRYSTON_FIBER]: 2
        },
        outputs: {
            [ItemID.CRYSTON_BOTTLE]: 1
        },
        facilityID: FacilityID.MOULDING_UNIT,
        time: 2,
    },
    [RecipeID.SHAPER_IRON_BOTTLE_1]: {
        inputs: {
            [ItemID.FERRIUM]: 2
        },
        outputs: {
            [ItemID.FERRIUM_BOTTLE]: 1
        },
        facilityID: FacilityID.MOULDING_UNIT,
        time: 2,
    },
    [RecipeID.SHAPER_IRON_ENR_BOTTLE_1]: {
        inputs: {
            [ItemID.STEEL]: 2
        },
        outputs: {
            [ItemID.STEEL_BOTTLE]: 1
        },
        facilityID: FacilityID.MOULDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_CARBON_ENR_POWDER_1]: {
        inputs: {
            [ItemID.CARBON_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.DENSE_CARBON_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_CRYSTAL_ENR_POWDER_1]: {
        inputs: {
            [ItemID.ORIGOCRUST_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.DENSE_ORIGOCRUST_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_IRON_ENR_POWDER_1]: {
        inputs: {
            [ItemID.FERRIUM_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.DENSE_FERRIUM_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_ORIGINIUM_ENR_POWDER_1]: {
        inputs: {
            [ItemID.ORIGINIUM_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.DENSE_ORIGINIUM_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_PLANT_MOSS_ENR_POWDER_1_1]: {
        inputs: {
            [ItemID.BUCKFLOWER_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.GROUND_BUCKFLOWER_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_PLANT_MOSS_ENR_POWDER_2_1]: {
        inputs: {
            [ItemID.CITROME_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.GROUND_CITROME_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.THICKENER_QUARTZ_ENR_POWDER_1]: {
        inputs: {
            [ItemID.AMETHYST_POWDER]: 2,
            [ItemID.SANDLEAF_POWDER]: 1
        },
        outputs: {
            [ItemID.CRYSTON_POWDER]: 1
        },
        facilityID: FacilityID.GRINDING_UNIT,
        time: 2,
    },
    [RecipeID.TOOLS_PROC_BATTERY_1_1]: {
        inputs: {
            [ItemID.AMETHYST_PART]: 5,
            [ItemID.ORIGINIUM_POWDER]: 10
        },
        outputs: {
            [ItemID.LC_VALLEY_BATTERY]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_BATTERY_2_1]: {
        inputs: {
            [ItemID.FERRIUM_PART]: 10,
            [ItemID.ORIGINIUM_POWDER]: 15
        },
        outputs: {
            [ItemID.SC_VALLEY_BATTERY]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_BATTERY_3_1]: {
        inputs: {
            [ItemID.STEEL_PART]: 10,
            [ItemID.DENSE_ORIGINIUM_POWDER]: 15
        },
        outputs: {
            [ItemID.HC_VALLEY_BATTERY]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_BATTERY_4_1]: {
        inputs: {
            [ItemID.XIRANITE]: 5,
            [ItemID.DENSE_ORIGINIUM_POWDER]: 15
        },
        outputs: {
            [ItemID.LC_WULING_BATTERY]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_BOMB_1_1]: {
        inputs: {
            [ItemID.AMETHYST_PART]: 5,
            [ItemID.AKETINE_POWDER]: 1
        },
        outputs: {
            [ItemID.INDUSTRIAL_EXPLOSIVE]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_FOOD_4_1]: {
        inputs: {
            [ItemID.FERRIUM_PART]: 10,
            [ItemID.FERRIUM_BOTTLE]: 5
        },
        outputs: {
            [ItemID.JINCAO_DRINK]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.TOOLS_PROC_REC_HP_4_1]: {
        inputs: {
            [ItemID.FERRIUM_PART]: 10,
            [ItemID.FERRIUM_BOTTLE]: 5
        },
        outputs: {
            [ItemID.YAZHEN_SYRINGE_C]: 1
        },
        facilityID: FacilityID.PACKAGING_UNIT,
        time: 10,
    },
    [RecipeID.WINDER_EQUIP_SCRIPT_1]: {
        inputs: {
            [ItemID.ORIGOCRUST]: 5,
            [ItemID.AMETHYST_FIBER]: 5
        },
        outputs: {
            [ItemID.AMETHYST_COMPONENT]: 1
        },
        facilityID: FacilityID.GEARING_UNIT,
        time: 10,
    },
    [RecipeID.WINDER_EQUIP_SCRIPT_2]: {
        inputs: {
            [ItemID.ORIGOCRUST]: 10,
            [ItemID.FERRIUM]: 10
        },
        outputs: {
            [ItemID.FERRIUM_COMPONENT]: 1
        },
        facilityID: FacilityID.GEARING_UNIT,
        time: 10,
    },
    [RecipeID.WINDER_EQUIP_SCRIPT_3]: {
        inputs: {
            [ItemID.PACKED_ORIGOCRUST]: 10,
            [ItemID.CRYSTON_FIBER]: 10
        },
        outputs: {
            [ItemID.CRYSTON_COMPONENT]: 1
        },
        facilityID: FacilityID.GEARING_UNIT,
        time: 10,
    },
    [RecipeID.WINDER_EQUIP_SCRIPT_4]: {
        inputs: {
            [ItemID.PACKED_ORIGOCRUST]: 10,
            [ItemID.XIRANITE]: 10
        },
        outputs: {
            [ItemID.XIRANITE_COMPONENT]: 1
        },
        facilityID: FacilityID.GEARING_UNIT,
        time: 10,
    },
    [RecipeID.XIRANITE_OVEN_MUCK_XIRANITE_1]: {
        inputs: {
            [ItemID.BURDO_MUCK]: 1,
            [ItemID.LIQUID_XIRANITE]: 1
        },
        outputs: {
            [ItemID.BUMPER_RICH]: 1
        },
        facilityID: FacilityID.FORGE_OF_THE_SKY,
        time: 2,
    },
    [RecipeID.XIRANITE_OVEN_XIRANITE_POWDER_1]: {
        inputs: {
            [ItemID.STABILIZED_CARBON]: 2,
            [ItemID.CLEAN_WATER]: 1
        },
        outputs: {
            [ItemID.XIRANITE]: 1
        },
        facilityID: FacilityID.FORGE_OF_THE_SKY,
        time: 2,
    },
    [RecipeID.POWER_STA_ORIGINIUM_ORE]: {
        inputs: {
            [ItemID.ORIGINIUM_ORE]: 1
        },
        outputs: {},
        powerOutput: 50,
        facilityID: FacilityID.THERMAL_BANK,
        time: 8,
    },
    [RecipeID.POWER_STA_PROC_BATTERY_1]: {
        inputs: {
            [ItemID.LC_VALLEY_BATTERY]: 1
        },
        outputs: {},
        powerOutput: 220,
        facilityID: FacilityID.THERMAL_BANK,
        time: 40,
    },
    [RecipeID.POWER_STA_PROC_BATTERY_2]: {
        inputs: {
            [ItemID.SC_VALLEY_BATTERY]: 1
        },
        outputs: {},
        powerOutput: 420,
        facilityID: FacilityID.THERMAL_BANK,
        time: 40,
    },
    [RecipeID.POWER_STA_PROC_BATTERY_3]: {
        inputs: {
            [ItemID.HC_VALLEY_BATTERY]: 1
        },
        outputs: {},
        powerOutput: 1100,
        facilityID: FacilityID.THERMAL_BANK,
        time: 40,
    },
    [RecipeID.POWER_STA_PROC_BATTERY_4]: {
        inputs: {
            [ItemID.LC_WULING_BATTERY]: 1
        },
        outputs: {},
        powerOutput: 1600,
        facilityID: FacilityID.THERMAL_BANK,
        time: 40,
    },
};
