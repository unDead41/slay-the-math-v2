(function(root){'use strict';
const data={
  "version": "economy-1.2-candidate.1",
  "status": "CANDIDATE_NOT_CALIBRATED",
  "baseCommit": "2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7",
  "specSha256": "90c7b23a224159d6fc9f6e038801f3414d4ff4328ed663be85e10bed6e7a796f",
  "combatInput": "NEEDS_INPUT; using legacy 2.24.0 card/enemy/artifact values and max HP 60",
  "profiles": {
    "easy": {
      "target_win_rate": 0.9,
      "starting_gold": 100,
      "rest_heal": 20,
      "stage_clear_heal": 20,
      "battle_gold": 30,
      "elite_gold": 50,
      "boss1_gold": 75,
      "shop_price_mult": 0.9,
      "event_gold_reward_mult": 1.2,
      "event_gold_cost_mult": 0.8,
      "event_heal_mult": 1.25,
      "event_hp_cost_mult": 0.6,
      "event_failure_hp_mult": 0,
      "event_max_hp_cost": 3,
      "event_time_mult": 2,
      "event_next_energy_loss": 0
    },
    "medium": {
      "target_win_rate": 0.7,
      "starting_gold": 80,
      "rest_heal": 15,
      "stage_clear_heal": 12,
      "battle_gold": 25,
      "elite_gold": 40,
      "boss1_gold": 60,
      "shop_price_mult": 1,
      "event_gold_reward_mult": 1,
      "event_gold_cost_mult": 1,
      "event_heal_mult": 1,
      "event_hp_cost_mult": 1,
      "event_failure_hp_mult": 1,
      "event_max_hp_cost": 5,
      "event_time_mult": 1.5,
      "event_next_energy_loss": -1
    },
    "hard": {
      "target_win_rate": 0.5,
      "starting_gold": 70,
      "rest_heal": 12,
      "stage_clear_heal": 8,
      "battle_gold": 22,
      "elite_gold": 36,
      "boss1_gold": 54,
      "shop_price_mult": 1.1,
      "event_gold_reward_mult": 0.9,
      "event_gold_cost_mult": 1.1,
      "event_heal_mult": 0.8,
      "event_hp_cost_mult": 1.2,
      "event_failure_hp_mult": 1.25,
      "event_max_hp_cost": 6,
      "event_time_mult": 1,
      "event_next_energy_loss": -1
    }
  },
  "economy": {
    "card_prices_by_rarity": {
      "common": 50,
      "uncommon": 75,
      "rare": 110
    },
    "upgraded_card_price_mult": 1.2,
    "artifact_prices": {
      "starting": 80,
      "elite_mystery": 140,
      "boss": 220
    },
    "removal_base": 50,
    "removal_growth": 15,
    "shop_card_count": 6,
    "shop_sale_count": 1,
    "sale_percent": 60,
    "shop_artifact_tier_slots": {
      "starting": 3,
      "elite_mystery": 2,
      "boss": 1
    },
    "boss_shop_unlock_stage": 2,
    "rarity_weights": {
      "normal_s1": {
        "common": 70,
        "uncommon": 25,
        "rare": 5
      },
      "normal_s2": {
        "common": 55,
        "uncommon": 35,
        "rare": 10
      },
      "elite_s1": {
        "common": 35,
        "uncommon": 50,
        "rare": 15
      },
      "elite_s2": {
        "common": 20,
        "uncommon": 55,
        "rare": 25
      },
      "shop_s1": {
        "common": 55,
        "uncommon": 35,
        "rare": 10
      },
      "shop_s2": {
        "common": 40,
        "uncommon": 40,
        "rare": 20
      }
    }
  },
  "alpha": {
    "easy": 0.25,
    "medium": 0.15,
    "hard": 0.1
  },
  "setupPassives": [
    "growing_flame",
    "battle_rhythm",
    "lasting_shield",
    "grimoire_ward",
    "ember_core",
    "clear_mind"
  ],
  "requirements": {
    "stm.attack.shield_shot": [
      "block"
    ],
    "stm.passive.blazing_spirit": [
      "attack"
    ],
    "stm.passive.growing_flame": [
      "attack"
    ],
    "stm.passive.swift_step": [
      "defend"
    ],
    "stm.passive.battle_rhythm": [
      "defend"
    ],
    "stm.passive.grimoire_ward": [
      "skill"
    ],
    "stm.passive.ember_core": [
      "focus"
    ],
    "stm.passive.lasting_shield": [
      "block"
    ],
    "stm.defend.hold_the_line": [
      "block"
    ],
    "stm.skill.recall": [
      "discardable_other"
    ],
    "stm.skill.last_page": [
      "zero_or_draw_selection"
    ],
    "stm.skill.card_search": [
      "searchable_category"
    ]
  }
};
if(typeof module!=='undefined')module.exports=data;else root.STMEconomyData=data;
})(typeof window!=='undefined'?window:globalThis);
