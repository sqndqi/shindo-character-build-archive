import type { CharacterBuild } from '../types'

export const freeBuilds = [
  {
    "id": "zack-lee",
    "characterId": "character-zack-lee",
    "versionId": "version-zack-lee",
    "buildName": "Most Accurate — Iron Fortress",
    "name": "Zack Lee",
    "series": "Lookism",
    "franchise": "PTJ / Street Action",
    "version": "Iron Fortress",
    "image": "/characters/zack-lee.jpg",
    "thumbnail": "/characters/thumbs/zack-lee.webp",
    "description": "Boxing pressure and durability with a reviewed speed-and-counter supporting set.",
    "archetype": [
      "Iron Fortress",
      "Boxing",
      "Counter"
    ],
    "combatTags": [
      "Hand-to-hand",
      "Martial arts"
    ],
    "customTags": [
      "Curated"
    ],
    "effectsIntensity": "Medium",
    "bloodlines": [
      {
        "id": "zack-lee-bloodline-1",
        "name": "Ryuji-Kenichi",
        "purpose": "Primary character identity and pressure engine.",
        "useMode": true
      },
      {
        "id": "zack-lee-bloodline-2",
        "name": "Bruce-Kenichi",
        "purpose": "Reviewed supporting match.",
        "useMode": false
      },
      {
        "id": "zack-lee-bloodline-3",
        "name": "Dio-Senko",
        "purpose": "Reviewed supporting match.",
        "useMode": false
      },
      {
        "id": "zack-lee-bloodline-4",
        "name": "Doku-Tengoku",
        "purpose": "Reviewed supporting match.",
        "useMode": false
      }
    ],
    "elements": [
      "Lightning",
      "Earth"
    ],
    "cMode": "Ryuji-Kenichi — Stage 1",
    "zMode": "None",
    "combatArt": "Boxing",
    "weapon": "None",
    "ninjaTool": "None",
    "consumable": "None",
    "mentor": "None",
    "race": "None",
    "hotbar": [
      {
        "id": "zack-lee-4x2-hotbar-1",
        "key": "1",
        "source": "Ryuji-Kenichi",
        "ability": "Fist Style: 3rd Stance",
        "purpose": "Primary character identity and pressure engine.",
        "comboRole": "Starter",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Primary character identity and pressure engine.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-2",
        "key": "2",
        "source": "Ryuji-Kenichi",
        "ability": "Fist Style: Dragon Demon Combo",
        "purpose": "Primary character identity and pressure engine.",
        "comboRole": "Extender",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Primary character identity and pressure engine.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-3",
        "key": "3",
        "source": "Ryuji-Kenichi",
        "ability": "Fist Style: Dragon Lotus",
        "purpose": "Primary character identity and pressure engine.",
        "comboRole": "Pressure",
        "blockBreak": false,
        "guardPressure": true,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Primary character identity and pressure engine.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-4",
        "key": "4",
        "source": "Bruce-Kenichi",
        "ability": "Fist Style: 6th Dance",
        "purpose": "Reviewed supporting match.",
        "comboRole": "Defense",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-5",
        "key": "5",
        "source": "Bruce-Kenichi",
        "ability": "Fist Style: 9th Dance",
        "purpose": "Reviewed supporting match.",
        "comboRole": "Finisher",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-T",
        "key": "T",
        "source": "None",
        "ability": "Not used in this variant",
        "purpose": "This control is intentionally empty for this prepared profile.",
        "comboRole": "Empty",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Unresolved",
        "sourceType": "None",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Intentionally empty; no filler ability is assigned.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-V",
        "key": "V",
        "source": "Bruce-Kenichi",
        "ability": "Fist Style: Tiger Lotus",
        "purpose": "Reviewed supporting match.",
        "comboRole": "Utility",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-B",
        "key": "B",
        "source": "Dio-Senko",
        "ability": "Ultimate Flash",
        "purpose": "Reviewed supporting match.",
        "comboRole": "Utility",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-N",
        "key": "N",
        "source": "Dio-Senko",
        "ability": "Time Style: Time Jump",
        "purpose": "Reviewed supporting match.",
        "comboRole": "Utility",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "sourceType": "Bloodline",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "characterAbility": "Reviewed supporting match.",
        "mobility": false
      },
      {
        "id": "zack-lee-4x2-hotbar-C",
        "key": "C",
        "source": "Ryuji-Kenichi",
        "ability": "Ryuji-Kenichi — Stage 1",
        "purpose": "Activates the selected C-mode.",
        "comboRole": "Mode",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": true,
        "accuracy": "Direct Match",
        "sourceType": "Mode",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "Ryuji-Kenichi — Stage 1",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing."
      },
      {
        "id": "zack-lee-4x2-hotbar-Z",
        "key": "Z",
        "source": "None",
        "ability": "Not used in this variant",
        "purpose": "No accurate Z-mode is prepared.",
        "comboRole": "Mode",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": true,
        "accuracy": "Unresolved",
        "sourceType": "None",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "Not used in this variant",
        "usageNotes": "Intentionally empty; no filler ability is assigned."
      },
      {
        "id": "zack-lee-4x2-hotbar-Q",
        "key": "Q",
        "source": "Boxing",
        "ability": "Boxing Q attack",
        "purpose": "Boxing guard pressure and counterpunch entry.",
        "comboRole": "Combat Art",
        "blockBreak": false,
        "guardPressure": false,
        "counter": false,
        "modeAbility": false,
        "accuracy": "Strong Match",
        "testingStatus": "Needs Retesting",
        "modeRequirement": "None",
        "usageNotes": "Exact source is authored; timing, resource cost, and current guard behavior still require live testing.",
        "sourceType": "Combat Art"
      }
    ],
    "combos": [
      {
        "name": "Iron-fortress counter boxer main testing route",
        "sequence": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ],
        "explanation": "Proposed Zack Lee route using this profile’s selected sources. Continue only after the first hit confirms; live timing remains unverified."
      },
      {
        "name": "Defensive reset route",
        "sequence": [
          "B",
          "N",
          "Q"
        ],
        "explanation": "Use the final prepared utility controls to reset pressure. This route is not claimed to be guaranteed."
      }
    ],
    "strengths": [
      "Preserves the iron-fortress counter boxer identity.",
      "4-slot selection has its own hotbar and mode plan."
    ],
    "weaknesses": [
      "Live combo timing remains unverified."
    ],
    "substitutions": [],
    "ratings": {
      "accuracy": 8.7,
      "pvp": 8.4,
      "mobility": 8.2,
      "combos": 8.1,
      "defense": 8,
      "visuals": 8.6,
      "aura": 8.8,
      "difficulty": 8.3
    },
    "slotAlternatives": {
      "twoSlots": [],
      "threeSlots": [],
      "fourSlots": []
    },
    "variations": {
      "beginner": "Use a prepared Beginner variant when available.",
      "meta": "Use a prepared Competitive variant when available.",
      "lore": "Use a prepared Lore Accurate variant when available."
    },
    "notes": "Reviewed static editorial build. Every selectable profile is prepared in archive data; no runtime build generation is used.",
    "status": "Needs Testing",
    "gameUpdate": "Live build reviewed 2026-07-29",
    "lastVerifiedUpdate": "Live build reviewed 2026-07-29",
    "verificationStatus": "Needs Retesting",
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z",
    "testing": {
      "status": "Untested",
      "contexts": [],
      "tester": "",
      "testDate": "",
      "notes": "Live-game combo timing still requires owner testing."
    },
    "changeHistory": [],
    "chapterRange": "Current Lookism continuity; exact chapter range needs editorial confirmation",
    "characterAbilities": [
      "Iron Fortress",
      "Boxing",
      "Counter"
    ],
    "knownCompromises": [
      "Shindo Life substitutions cannot reproduce the character one-to-one."
    ],
    "confidence": "Strong Match",
    "publicationStatus": "Reviewed",
    "variants": [
      {
        "id": "zack-lee-4x2",
        "name": "Most Accurate — Iron Fortress",
        "type": "Primary",
        "bloodlineSlotCount": 4,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "exactMovesUsed": [
              "Fist Style: 3rd Stance",
              "Fist Style: Dragon Demon Combo",
              "Fist Style: Dragon Lotus"
            ],
            "useMode": true,
            "reason": "Primary character identity and pressure engine.",
            "represents": "Primary character identity and pressure engine.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Fist Style: 6th Dance",
              "Fist Style: 9th Dance",
              "Fist Style: Tiger Lotus"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Dio-Senko",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Ultimate Flash",
              "Time Style: Time Jump",
              "Time Style: Time Stop"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Doku-Tengoku",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Tengoku Style: Concentrated Palm Blast",
              "Tengoku Style: Twin Dragon Barrage",
              "Tengoku Style: 128 Palm Counter"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Lightning",
            "exactMovesUsed": [
              "Shock Style: Stream",
              "Shock Style: Blast"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          },
          {
            "name": "Earth",
            "exactMovesUsed": [
              "Stone Style: Earth Wall",
              "Stone Style: Rage Trail"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          }
        ],
        "cMode": "Ryuji-Kenichi — Stage 1",
        "zMode": "None",
        "combatArt": "Boxing",
        "weapon": "None",
        "ninjaTool": "None",
        "consumable": "None",
        "mentor": "None",
        "race": "None",
        "hotbar": [
          {
            "id": "zack-lee-4x2-legal-1",
            "key": "1",
            "ability": "Shock Style: Stream",
            "source": "Lightning",
            "purpose": "Equipped from Lightning; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-stream"
          },
          {
            "id": "zack-lee-4x2-legal-2",
            "key": "2",
            "ability": "Shock Style: Blast",
            "source": "Lightning",
            "purpose": "Equipped from Lightning; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-blast"
          },
          {
            "id": "zack-lee-4x2-legal-3",
            "key": "3",
            "ability": "Stone Style: Earth Wall",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-earth-wall"
          },
          {
            "id": "zack-lee-4x2-legal-4",
            "key": "4",
            "ability": "Stone Style: Rage Trail",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-rage-trail"
          },
          {
            "id": "zack-lee-4x2-legal-5",
            "key": "5",
            "ability": "Intentionally unused",
            "source": "None",
            "purpose": "This profile does not need another general-row move and avoids filler.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This profile does not need another general-row move and avoids filler.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Intentionally unused"
          },
          {
            "id": "zack-lee-4x2-legal-T",
            "key": "T",
            "ability": "Reserved for player preference",
            "source": "None",
            "purpose": "This flexible general control is left open for the player’s preferred utility.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This flexible general control is left open for the player’s preferred utility.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Reserved for player preference"
          },
          {
            "id": "zack-lee-4x2-legal-V",
            "key": "V",
            "ability": "Fist Style: 3rd Stance",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Starter",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-3rd-stance"
          },
          {
            "id": "zack-lee-4x2-legal-B",
            "key": "B",
            "ability": "Fist Style: Dragon Demon Combo",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Extender",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-demon-combo"
          },
          {
            "id": "zack-lee-4x2-legal-N",
            "key": "N",
            "ability": "Fist Style: Dragon Lotus",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Pressure",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-lotus"
          },
          {
            "id": "zack-lee-4x2-legal-C",
            "key": "C",
            "ability": "Ryuji-Kenichi — Stage 1",
            "source": "Ryuji-Kenichi",
            "purpose": "Activates the selected C-mode.",
            "comboRole": "Mode",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": true,
            "accuracy": "Direct Match",
            "sourceType": "Mode",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CMode rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Activates the selected C-mode.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-mode-ryuji-kenichi-ryuji-kenichi-stage-1"
          },
          {
            "id": "zack-lee-4x2-legal-Z",
            "key": "Z",
            "ability": "No accurate option",
            "source": "None",
            "purpose": "No prepared Z-mode accurately fits this profile.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "No prepared Z-mode accurately fits this profile.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "No accurate option"
          },
          {
            "id": "zack-lee-4x2-legal-Q",
            "key": "Q",
            "ability": "Boxing basic action",
            "source": "Boxing",
            "purpose": "Equipped from Boxing; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Combat Art",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CombatArtQ rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-combat-art-boxing-boxing-basic-action"
          }
        ],
        "combos": [
          {
            "name": "Iron-fortress counter boxer main testing route",
            "sequence": [
              "1",
              "2",
              "3",
              "4"
            ],
            "explanation": "Proposed Zack Lee route using this profile’s selected sources. Continue only after the first hit confirms; live timing remains unverified. Live timing and escape windows remain unverified for 249/249.5."
          },
          {
            "name": "Defensive reset route",
            "sequence": [
              "B",
              "N",
              "Q"
            ],
            "explanation": "Use the final prepared utility controls to reset pressure. This route is not claimed to be expected. Live timing and escape windows remain unverified for 249/249.5."
          }
        ],
        "ratings": {
          "accuracy": 8.7,
          "pvp": 8.4,
          "mobility": 8.2,
          "combos": 8.1,
          "defense": 8,
          "visuals": 8.6,
          "aura": 8.8,
          "difficulty": 8.3
        },
        "strengths": [
          "Preserves the iron-fortress counter boxer identity.",
          "4-slot selection has its own hotbar and mode plan."
        ],
        "weaknesses": [
          "Live combo timing remains unverified."
        ],
        "usageGuide": [
          "Lead with Fist Style: 3rd Stance.",
          "Keep the defensive control available for reversals.",
          "Use Q only after confirming the weapon or fighting-system range."
        ],
        "verificationStatus": "Needs Retesting",
        "lastVerifiedUpdate": "Researched for 249/249.5; live test pending",
        "combatArtReason": "Boxing is Zack’s defining system and keeps every physical choice readable.",
        "kenjutsu": "None",
        "kenjutsuReason": "Zack has no sword identity.",
        "weaponReason": "The Iron Fortress build remains weaponless.",
        "qAction": {
          "source": "Combat Art",
          "name": "Boxing Q attack",
          "purpose": "Boxing guard pressure and counterpunch entry."
        },
        "fightingStyleNotes": [
          "Iron-fortress counter boxer is the organizing fighting identity for this profile.",
          "Every selected source keeps a documented character or role purpose."
        ],
        "equipment": {
          "ninjaTool": "None",
          "ninjaToolReason": "No character-specific ninja tool improves this setup.",
          "consumable": "None",
          "consumableReason": "No consumable is required for the character concept.",
          "mentor": "None",
          "mentorReason": "No mentor is assigned automatically; use one only after a stat-specific owner test.",
          "race": "None",
          "raceReason": "Race is left open because no available race is required for the character match."
        },
        "ownershipRequirements": [
          "Ryuji-Kenichi",
          "Bruce-Kenichi",
          "Dio-Senko",
          "Doku-Tengoku",
          "Lightning",
          "Earth",
          "Boxing"
        ],
        "compromises": [],
        "preparedHotbarProfileId": "zack-lee-4x2",
        "hotbarLegalityStatus": "Game Legal",
        "ownerTestingStatus": "Not tested",
        "researchedGameVersion": "249/249.5"
      },
      {
        "id": "zack-lee-3x2",
        "name": "Three-slot iron boxing",
        "type": "Three Slot",
        "bloodlineSlotCount": 3,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "exactMovesUsed": [
              "Fist Style: 3rd Stance",
              "Fist Style: Dragon Demon Combo",
              "Fist Style: Dragon Lotus"
            ],
            "useMode": true,
            "reason": "Primary character identity and pressure engine.",
            "represents": "Primary character identity and pressure engine.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Fist Style: 6th Dance",
              "Fist Style: 9th Dance",
              "Fist Style: Tiger Lotus"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Doku-Tengoku",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Tengoku Style: Concentrated Palm Blast",
              "Tengoku Style: Twin Dragon Barrage",
              "Tengoku Style: 128 Palm Counter"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Lightning",
            "exactMovesUsed": [
              "Shock Style: Stream",
              "Shock Style: Blast"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          },
          {
            "name": "Earth",
            "exactMovesUsed": [
              "Stone Style: Earth Wall",
              "Stone Style: Rage Trail"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          }
        ],
        "cMode": "Ryuji-Kenichi — Stage 1",
        "zMode": "None",
        "combatArt": "Boxing",
        "weapon": "None",
        "ninjaTool": "None",
        "consumable": "None",
        "mentor": "None",
        "race": "None",
        "hotbar": [
          {
            "id": "zack-lee-3x2-legal-1",
            "key": "1",
            "ability": "Shock Style: Stream",
            "source": "Lightning",
            "purpose": "Equipped from Lightning; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-stream"
          },
          {
            "id": "zack-lee-3x2-legal-2",
            "key": "2",
            "ability": "Shock Style: Blast",
            "source": "Lightning",
            "purpose": "Equipped from Lightning; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-blast"
          },
          {
            "id": "zack-lee-3x2-legal-3",
            "key": "3",
            "ability": "Stone Style: Earth Wall",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-earth-wall"
          },
          {
            "id": "zack-lee-3x2-legal-4",
            "key": "4",
            "ability": "Stone Style: Rage Trail",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-rage-trail"
          },
          {
            "id": "zack-lee-3x2-legal-5",
            "key": "5",
            "ability": "Intentionally unused",
            "source": "None",
            "purpose": "This profile does not need another general-row move and avoids filler.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This profile does not need another general-row move and avoids filler.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Intentionally unused"
          },
          {
            "id": "zack-lee-3x2-legal-T",
            "key": "T",
            "ability": "Reserved for player preference",
            "source": "None",
            "purpose": "This flexible general control is left open for the player’s preferred utility.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This flexible general control is left open for the player’s preferred utility.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Reserved for player preference"
          },
          {
            "id": "zack-lee-3x2-legal-V",
            "key": "V",
            "ability": "Fist Style: 3rd Stance",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Starter",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-3rd-stance"
          },
          {
            "id": "zack-lee-3x2-legal-B",
            "key": "B",
            "ability": "Fist Style: Dragon Demon Combo",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Extender",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-demon-combo"
          },
          {
            "id": "zack-lee-3x2-legal-N",
            "key": "N",
            "ability": "Fist Style: Dragon Lotus",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Pressure",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-lotus"
          },
          {
            "id": "zack-lee-3x2-legal-C",
            "key": "C",
            "ability": "Ryuji-Kenichi — Stage 1",
            "source": "Ryuji-Kenichi",
            "purpose": "Activates the selected C-mode.",
            "comboRole": "Mode",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": true,
            "accuracy": "Direct Match",
            "sourceType": "Mode",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CMode rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Activates the selected C-mode.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-mode-ryuji-kenichi-ryuji-kenichi-stage-1"
          },
          {
            "id": "zack-lee-3x2-legal-Z",
            "key": "Z",
            "ability": "No accurate option",
            "source": "None",
            "purpose": "No prepared Z-mode accurately fits this profile.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "No prepared Z-mode accurately fits this profile.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "No accurate option"
          },
          {
            "id": "zack-lee-3x2-legal-Q",
            "key": "Q",
            "ability": "Boxing basic action",
            "source": "Boxing",
            "purpose": "Equipped from Boxing; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Combat Art",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CombatArtQ rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-combat-art-boxing-boxing-basic-action"
          }
        ],
        "combos": [
          {
            "name": "Iron-fortress counter boxer main testing route",
            "sequence": [
              "1",
              "2",
              "3",
              "4"
            ],
            "explanation": "Proposed Zack Lee route using this profile’s selected sources. Continue only after the first hit confirms; live timing remains unverified. Live timing and escape windows remain unverified for 249/249.5."
          },
          {
            "name": "Defensive reset route",
            "sequence": [
              "B",
              "N",
              "Q"
            ],
            "explanation": "Use the final prepared utility controls to reset pressure. This route is not claimed to be expected. Live timing and escape windows remain unverified for 249/249.5."
          }
        ],
        "ratings": {
          "accuracy": 8.4,
          "pvp": 8.1,
          "mobility": 7.9,
          "combos": 7.8,
          "defense": 7.7,
          "visuals": 8.3,
          "aura": 8.5,
          "difficulty": 8.6
        },
        "strengths": [
          "Preserves the iron-fortress counter boxer identity.",
          "3-slot selection has its own hotbar and mode plan."
        ],
        "weaknesses": [
          "Live combo timing remains unverified."
        ],
        "usageGuide": [
          "Lead with Fist Style: 3rd Stance.",
          "Keep the defensive control available for reversals.",
          "Use Q only after confirming the weapon or fighting-system range."
        ],
        "verificationStatus": "Needs Retesting",
        "lastVerifiedUpdate": "Researched for 249/249.5; live test pending",
        "combatArtReason": "Boxing is Zack’s defining system and keeps every physical choice readable.",
        "kenjutsu": "None",
        "kenjutsuReason": "Zack has no sword identity.",
        "weaponReason": "The Iron Fortress build remains weaponless.",
        "qAction": {
          "source": "Combat Art",
          "name": "Boxing Q attack",
          "purpose": "Boxing guard pressure and counterpunch entry."
        },
        "fightingStyleNotes": [
          "Iron-fortress counter boxer is the organizing fighting identity for this profile.",
          "Every selected source keeps a documented character or role purpose."
        ],
        "equipment": {
          "ninjaTool": "None",
          "ninjaToolReason": "No character-specific ninja tool improves this setup.",
          "consumable": "None",
          "consumableReason": "No consumable is required for the character concept.",
          "mentor": "None",
          "mentorReason": "No mentor is assigned automatically; use one only after a stat-specific owner test.",
          "race": "None",
          "raceReason": "Race is left open because no available race is required for the character match."
        },
        "ownershipRequirements": [
          "Ryuji-Kenichi",
          "Bruce-Kenichi",
          "Doku-Tengoku",
          "Lightning",
          "Earth",
          "Boxing"
        ],
        "compromises": [],
        "preparedHotbarProfileId": "zack-lee-3x2",
        "hotbarLegalityStatus": "Game Legal",
        "ownerTestingStatus": "Not tested",
        "researchedGameVersion": "249/249.5"
      },
      {
        "id": "zack-lee-2x2",
        "name": "Two-slot boxing core",
        "type": "Two Slot",
        "bloodlineSlotCount": 2,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "exactMovesUsed": [
              "Fist Style: 3rd Stance",
              "Fist Style: Dragon Demon Combo",
              "Fist Style: Dragon Lotus"
            ],
            "useMode": true,
            "reason": "Primary character identity and pressure engine.",
            "represents": "Primary character identity and pressure engine.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Fist Style: 6th Dance",
              "Fist Style: 9th Dance",
              "Fist Style: Tiger Lotus"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Lightning",
            "exactMovesUsed": [
              "Shock Style: Stream",
              "Shock Style: Blast"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          },
          {
            "name": "Earth",
            "exactMovesUsed": [
              "Stone Style: Earth Wall",
              "Stone Style: Rage Trail"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          }
        ],
        "cMode": "Ryuji-Kenichi — Stage 1",
        "zMode": "None",
        "combatArt": "Boxing",
        "weapon": "None",
        "ninjaTool": "None",
        "consumable": "None",
        "mentor": "None",
        "race": "None",
        "hotbar": [
          {
            "id": "zack-lee-2x2-legal-1",
            "key": "1",
            "ability": "Shock Style: Stream",
            "source": "Lightning",
            "purpose": "Reviewed neutral or defensive support.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Reviewed neutral or defensive support.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-stream"
          },
          {
            "id": "zack-lee-2x2-legal-2",
            "key": "2",
            "ability": "Shock Style: Blast",
            "source": "Lightning",
            "purpose": "Reviewed neutral or defensive support.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Reviewed neutral or defensive support.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-blast"
          },
          {
            "id": "zack-lee-2x2-legal-3",
            "key": "3",
            "ability": "Stone Style: Earth Wall",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-earth-wall"
          },
          {
            "id": "zack-lee-2x2-legal-4",
            "key": "4",
            "ability": "Stone Style: Rage Trail",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-rage-trail"
          },
          {
            "id": "zack-lee-2x2-legal-5",
            "key": "5",
            "ability": "Intentionally unused",
            "source": "None",
            "purpose": "This profile does not need another general-row move and avoids filler.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This profile does not need another general-row move and avoids filler.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Intentionally unused"
          },
          {
            "id": "zack-lee-2x2-legal-T",
            "key": "T",
            "ability": "Reserved for player preference",
            "source": "None",
            "purpose": "This flexible general control is left open for the player’s preferred utility.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This flexible general control is left open for the player’s preferred utility.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Reserved for player preference"
          },
          {
            "id": "zack-lee-2x2-legal-V",
            "key": "V",
            "ability": "Fist Style: 3rd Stance",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Starter",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-3rd-stance"
          },
          {
            "id": "zack-lee-2x2-legal-B",
            "key": "B",
            "ability": "Fist Style: Dragon Demon Combo",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Extender",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-demon-combo"
          },
          {
            "id": "zack-lee-2x2-legal-N",
            "key": "N",
            "ability": "Fist Style: Dragon Lotus",
            "source": "Ryuji-Kenichi",
            "purpose": "Primary character identity and pressure engine.",
            "comboRole": "Pressure",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Primary character identity and pressure engine.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-ryuji-kenichi-fist-style-dragon-lotus"
          },
          {
            "id": "zack-lee-2x2-legal-C",
            "key": "C",
            "ability": "Ryuji-Kenichi — Stage 1",
            "source": "Ryuji-Kenichi",
            "purpose": "Activates the selected C-mode.",
            "comboRole": "Mode",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": true,
            "accuracy": "Direct Match",
            "sourceType": "Mode",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CMode rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Activates the selected C-mode.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-mode-ryuji-kenichi-ryuji-kenichi-stage-1"
          },
          {
            "id": "zack-lee-2x2-legal-Z",
            "key": "Z",
            "ability": "No accurate option",
            "source": "None",
            "purpose": "No prepared Z-mode accurately fits this profile.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "No prepared Z-mode accurately fits this profile.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "No accurate option"
          },
          {
            "id": "zack-lee-2x2-legal-Q",
            "key": "Q",
            "ability": "Boxing basic action",
            "source": "Boxing",
            "purpose": "Equipped from Boxing; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Combat Art",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CombatArtQ rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-combat-art-boxing-boxing-basic-action"
          }
        ],
        "combos": [
          {
            "name": "Iron-fortress counter boxer main testing route",
            "sequence": [
              "1",
              "2",
              "3",
              "4"
            ],
            "explanation": "Proposed Zack Lee route using this profile’s selected sources. Continue only after the first hit confirms; live timing remains unverified. Live timing and escape windows remain unverified for 249/249.5."
          },
          {
            "name": "Defensive reset route",
            "sequence": [
              "B",
              "N",
              "Q"
            ],
            "explanation": "Use the final prepared utility controls to reset pressure. This route is not claimed to be expected. Live timing and escape windows remain unverified for 249/249.5."
          }
        ],
        "ratings": {
          "accuracy": 8.1,
          "pvp": 7.8,
          "mobility": 7.6,
          "combos": 7.5,
          "defense": 7.4,
          "visuals": 8,
          "aura": 8.2,
          "difficulty": 8.9
        },
        "strengths": [
          "Preserves the iron-fortress counter boxer identity.",
          "2-slot selection has its own hotbar and mode plan."
        ],
        "weaknesses": [
          "Live combo timing remains unverified.",
          "Reduced role coverage requires more careful cooldown use."
        ],
        "usageGuide": [
          "Lead with Fist Style: 3rd Stance.",
          "Keep the defensive control available for reversals.",
          "Use Q only after confirming the weapon or fighting-system range."
        ],
        "verificationStatus": "Needs Retesting",
        "lastVerifiedUpdate": "Researched for 249/249.5; live test pending",
        "combatArtReason": "Boxing is Zack’s defining system and keeps every physical choice readable.",
        "kenjutsu": "None",
        "kenjutsuReason": "Zack has no sword identity.",
        "weaponReason": "The Iron Fortress build remains weaponless.",
        "qAction": {
          "source": "Combat Art",
          "name": "Boxing Q attack",
          "purpose": "Boxing guard pressure and counterpunch entry."
        },
        "fightingStyleNotes": [
          "Iron-fortress counter boxer is the organizing fighting identity for this profile.",
          "Every selected source keeps a documented character or role purpose."
        ],
        "equipment": {
          "ninjaTool": "None",
          "ninjaToolReason": "No character-specific ninja tool improves this setup.",
          "consumable": "None",
          "consumableReason": "No consumable is required for the character concept.",
          "mentor": "None",
          "mentorReason": "No mentor is assigned automatically; use one only after a stat-specific owner test.",
          "race": "None",
          "raceReason": "Race is left open because no available race is required for the character match."
        },
        "ownershipRequirements": [
          "Ryuji-Kenichi",
          "Bruce-Kenichi",
          "Lightning",
          "Earth",
          "Boxing"
        ],
        "compromises": [],
        "preparedHotbarProfileId": "zack-lee-2x2",
        "hotbarLegalityStatus": "Game Legal",
        "ownerTestingStatus": "Not tested",
        "researchedGameVersion": "249/249.5"
      },
      {
        "id": "zack-lee-accessible",
        "name": "Accessible counter boxer",
        "type": "Beginner",
        "bloodlineSlotCount": 2,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Kenichi",
            "exactMovesUsed": [
              "Fist Style: Dragon Strike",
              "Fist Style: Crane Demon"
            ],
            "purpose": "Accessible close-combat pressure.",
            "useMode": false,
            "reason": "Accessible substitute: a simpler martial route with no mode commitment.",
            "represents": "Close combat fundamentals",
            "replacements": {
              "lore": [],
              "competitive": [
                "Bruce-Kenichi"
              ],
              "accessible": []
            }
          },
          {
            "name": "Doku-Tengoku",
            "purpose": "Reviewed supporting match.",
            "exactMovesUsed": [
              "Tengoku Style: Concentrated Palm Blast",
              "Tengoku Style: Twin Dragon Barrage",
              "Tengoku Style: 128 Palm Counter"
            ],
            "useMode": false,
            "reason": "Reviewed supporting match.",
            "represents": "Reviewed supporting match.",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Lightning",
            "exactMovesUsed": [
              "Shock Style: Stream",
              "Shock Style: Blast"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          },
          {
            "name": "Earth",
            "exactMovesUsed": [
              "Stone Style: Earth Wall",
              "Stone Style: Rage Trail"
            ],
            "purpose": "Reviewed neutral or defensive support.",
            "replacements": []
          }
        ],
        "cMode": "None",
        "zMode": "None",
        "combatArt": "Boxing",
        "weapon": "None",
        "ninjaTool": "None",
        "consumable": "None",
        "mentor": "None",
        "race": "None",
        "hotbar": [
          {
            "id": "zack-lee-accessible-legal-1",
            "key": "1",
            "ability": "Shock Style: Stream",
            "source": "Lightning",
            "purpose": "Reviewed neutral or defensive support.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Reviewed neutral or defensive support.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-stream"
          },
          {
            "id": "zack-lee-accessible-legal-2",
            "key": "2",
            "ability": "Shock Style: Blast",
            "source": "Lightning",
            "purpose": "Reviewed neutral or defensive support.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Reviewed neutral or defensive support.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-lightning-shock-style-blast"
          },
          {
            "id": "zack-lee-accessible-legal-3",
            "key": "3",
            "ability": "Stone Style: Earth Wall",
            "source": "Earth",
            "purpose": "Reviewed neutral or defensive support.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Reviewed neutral or defensive support.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-earth-wall"
          },
          {
            "id": "zack-lee-accessible-legal-4",
            "key": "4",
            "ability": "Stone Style: Rage Trail",
            "source": "Earth",
            "purpose": "Equipped from Earth; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Element",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical ElementRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-element-earth-stone-style-rage-trail"
          },
          {
            "id": "zack-lee-accessible-legal-5",
            "key": "5",
            "ability": "Intentionally unused",
            "source": "None",
            "purpose": "This profile does not need another general-row move and avoids filler.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This profile does not need another general-row move and avoids filler.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Intentionally unused"
          },
          {
            "id": "zack-lee-accessible-legal-T",
            "key": "T",
            "ability": "Reserved for player preference",
            "source": "None",
            "purpose": "This flexible general control is left open for the player’s preferred utility.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This flexible general control is left open for the player’s preferred utility.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Reserved for player preference"
          },
          {
            "id": "zack-lee-accessible-legal-V",
            "key": "V",
            "ability": "Fist Style: Dragon Strike",
            "source": "Kenichi",
            "purpose": "Accessible close-combat pressure.",
            "comboRole": "Starter",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Close combat fundamentals",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-kenichi-fist-style-dragon-strike"
          },
          {
            "id": "zack-lee-accessible-legal-B",
            "key": "B",
            "ability": "Fist Style: Crane Demon",
            "source": "Kenichi",
            "purpose": "Accessible close-combat pressure.",
            "comboRole": "Extender",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Close combat fundamentals",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-kenichi-fist-style-crane-demon"
          },
          {
            "id": "zack-lee-accessible-legal-N",
            "key": "N",
            "ability": "Tengoku Style: Concentrated Palm Blast",
            "source": "Doku-Tengoku",
            "purpose": "Equipped from Doku-Tengoku; character mapping is documented in the source choice.",
            "comboRole": "Pressure",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Strong Match",
            "sourceType": "Bloodline",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical BloodlineRow rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-bloodline-doku-tengoku-tengoku-style-concentrated-palm-blast"
          },
          {
            "id": "zack-lee-accessible-legal-C",
            "key": "C",
            "ability": "Intentionally unused",
            "source": "None",
            "purpose": "This profile intentionally avoids a C-mode.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "This profile intentionally avoids a C-mode.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "Intentionally unused"
          },
          {
            "id": "zack-lee-accessible-legal-Z",
            "key": "Z",
            "ability": "No accurate option",
            "source": "None",
            "purpose": "No prepared Z-mode accurately fits this profile.",
            "comboRole": "Empty",
            "blockBreak": false,
            "usageNotes": "No prepared Z-mode accurately fits this profile.",
            "sourceType": "None",
            "modeAbility": false,
            "testingStatus": "Untested",
            "accuracy": "Unresolved",
            "emptyReason": "No accurate option"
          },
          {
            "id": "zack-lee-accessible-legal-Q",
            "key": "Q",
            "ability": "Boxing basic action",
            "source": "Boxing",
            "purpose": "Equipped from Boxing; character mapping is documented in the source choice.",
            "comboRole": "Utility",
            "blockBreak": false,
            "guardPressure": false,
            "modeAbility": false,
            "accuracy": "Unresolved",
            "sourceType": "Combat Art",
            "testingStatus": "Untested",
            "modeRequirement": "None",
            "usageNotes": "Placement follows the canonical CombatArtQ rule. Combat behavior remains unverified until an owner live test.",
            "characterAbility": "Character mapping requires editorial review.",
            "resourceNotes": "Cooldown and resource values are not shown without current corroboration.",
            "canonicalMoveId": "move-combat-art-boxing-boxing-basic-action"
          }
        ],
        "combos": [
          {
            "name": "Iron-fortress counter boxer main testing route",
            "sequence": [
              "1",
              "2",
              "3",
              "4"
            ],
            "explanation": "Proposed Zack Lee route using this profile’s selected sources. Continue only after the first hit confirms; live timing remains unverified. Live timing and escape windows remain unverified for 249/249.5."
          },
          {
            "name": "Defensive reset route",
            "sequence": [
              "B",
              "N",
              "Q"
            ],
            "explanation": "Use the final prepared utility controls to reset pressure. This route is not claimed to be expected. Live timing and escape windows remain unverified for 249/249.5."
          }
        ],
        "ratings": {
          "accuracy": 7.9,
          "pvp": 7.6,
          "mobility": 7.4,
          "combos": 7.3,
          "defense": 7.2,
          "visuals": 7.8,
          "aura": 8,
          "difficulty": 9.1
        },
        "strengths": [
          "Preserves the iron-fortress counter boxer identity.",
          "2-slot selection has its own hotbar and mode plan."
        ],
        "weaknesses": [
          "Loses some direct or limited Bloodline matches."
        ],
        "usageGuide": [
          "Lead with Fist Style: Dragon Strike.",
          "Keep Tengoku Style: 128 Palm Counter available for reversals.",
          "Use Q only after confirming the weapon or fighting-system range."
        ],
        "verificationStatus": "Needs Retesting",
        "lastVerifiedUpdate": "Researched for 249/249.5; live test pending",
        "combatArtReason": "Boxing is selected specifically for this prepared profile.",
        "kenjutsu": "None",
        "kenjutsuReason": "None is the prepared sword system for this profile.",
        "weaponReason": "None is the prepared weapon for this profile. Simpler counterpunch route.",
        "qAction": {
          "source": "Combat Art",
          "name": "Boxing Q attack",
          "purpose": "Simpler counterpunch route."
        },
        "fightingStyleNotes": [
          "Iron-fortress counter boxer is the organizing fighting identity for this profile.",
          "This profile trades some visual accuracy for easier ownership."
        ],
        "equipment": {
          "ninjaTool": "None",
          "ninjaToolReason": "No character-specific ninja tool improves this setup.",
          "consumable": "None",
          "consumableReason": "No consumable is required for the character concept.",
          "mentor": "None",
          "mentorReason": "No mentor is assigned automatically; use one only after a stat-specific owner test.",
          "race": "None",
          "raceReason": "Race is left open because no available race is required for the character match."
        },
        "ownershipRequirements": [
          "Kenichi",
          "Doku-Tengoku",
          "Lightning",
          "Earth",
          "Boxing"
        ],
        "compromises": [
          "Accessible choices are not the strongest visual match."
        ],
        "preparedHotbarProfileId": "zack-lee-accessible",
        "hotbarLegalityStatus": "Game Legal",
        "ownerTestingStatus": "Not tested",
        "researchedGameVersion": "249/249.5"
      }
    ],
    "evidence": [
      {
        "category": "Game",
        "claim": "Ryuji-Kenichi move names and mode availability",
        "sourceTitle": "Ryuji-Kenichi — Shindo Life Wiki",
        "sourceReference": "https://shindo-life-rell.fandom.com/wiki/Ryuji-Kenichi",
        "checkedAt": "2026-07-29",
        "notes": "Community wiki reference checked; live-game frame data still requires retesting."
      },
      {
        "category": "Game",
        "claim": "Bruce-Kenichi move names and mode availability",
        "sourceTitle": "Bruce-Kenichi — Shindo Life Wiki",
        "sourceReference": "https://shindo-life-rell.fandom.com/wiki/Bruce-Kenichi",
        "checkedAt": "2026-07-29",
        "notes": "Community wiki reference checked; live-game frame data still requires retesting."
      },
      {
        "category": "Game",
        "claim": "Dio-Senko move names and mode availability",
        "sourceTitle": "Dio-Senko — Shindo Life Wiki",
        "sourceReference": "https://shindo-life-rell.fandom.com/wiki/Dio-Senko",
        "checkedAt": "2026-07-29",
        "notes": "Community wiki reference checked; live-game frame data still requires retesting."
      },
      {
        "category": "Game",
        "claim": "Doku-Tengoku move names and mode availability",
        "sourceTitle": "Doku-Tengoku — Shindo Life Wiki",
        "sourceReference": "https://shindo-life-rell.fandom.com/wiki/Doku-Tengoku",
        "checkedAt": "2026-07-29",
        "notes": "Community wiki reference checked; live-game frame data still requires retesting."
      }
    ]
  },
  {
    "id": "jin-mori",
    "name": "Jin Mori",
    "series": "The God of High School",
    "version": "Monkey King Awakened",
    "description": "Staff rotations and renewal kicks escalate into a lightning-charged Monkey King transformation.",
    "archetype": [
      "Staff",
      "Martial Arts",
      "Transformation"
    ],
    "bloodlines": [
      {
        "id": "jin-mori-bloodline-1",
        "name": "Tetsuo-Kaijin",
        "purpose": "Core identity",
        "useMode": true
      },
      {
        "id": "jin-mori-bloodline-2",
        "name": "Raion-Gaiden",
        "purpose": "Combo routing",
        "useMode": false
      },
      {
        "id": "jin-mori-bloodline-3",
        "name": "Bruce-Kenichi",
        "purpose": "Mobility / pressure",
        "useMode": false
      },
      {
        "id": "jin-mori-bloodline-4",
        "name": "Dio-Senko",
        "purpose": "Counter / utility",
        "useMode": false
      }
    ],
    "elements": [
      "Lightning",
      "Air"
    ],
    "cMode": "Tetsuo-Kaijin",
    "zMode": "Kor Tailed Spirit",
    "combatArt": "Jeet Kune Do",
    "weapon": "Enra Staff",
    "ratings": {
      "accuracy": 9,
      "pvp": 9.4,
      "mobility": 9.5,
      "combos": 9.3,
      "defense": 8.6,
      "visuals": 9.8,
      "aura": 9.6,
      "difficulty": 8.6
    },
    "characterId": "character-jin-mori",
    "versionId": "version-jin-mori",
    "buildName": "Monkey King Awakened",
    "franchise": "The God of High School",
    "combatTags": [
      "Staff",
      "Lightning",
      "Martial arts"
    ],
    "customTags": [],
    "effectsIntensity": "High",
    "image": "/characters/jin-mori.jpg",
    "chapterRange": "Unresolved",
    "characterAbilities": [
      "Staff",
      "Martial Arts",
      "Transformation"
    ],
    "knownCompromises": [
      "Exact moves, resource costs, and combo timing are unresolved."
    ],
    "confidence": "Unverified",
    "publicationStatus": "Draft",
    "variants": [
      {
        "id": "jin-mori-restored-draft",
        "name": "Restored early draft",
        "type": "Primary",
        "bloodlineSlotCount": 4,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Tetsuo-Kaijin",
            "purpose": "Core identity",
            "exactMovesUsed": [],
            "useMode": true,
            "reason": "Core identity",
            "represents": "Core identity",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Raion-Gaiden",
            "purpose": "Combo routing",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Combo routing",
            "represents": "Combo routing",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Mobility / pressure",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Mobility / pressure",
            "represents": "Mobility / pressure",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Dio-Senko",
            "purpose": "Counter / utility",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Counter / utility",
            "represents": "Counter / utility",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Lightning",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          },
          {
            "name": "Air",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          }
        ],
        "cMode": "Tetsuo-Kaijin",
        "zMode": "Kor Tailed Spirit",
        "combatArt": "Jeet Kune Do",
        "weapon": "Enra Staff",
        "ninjaTool": "Health Stim",
        "consumable": "Chi Stim",
        "mentor": "Bruce Mentor",
        "race": "Human",
        "hotbar": [
          {
            "id": "jin-mori-unresolved-1",
            "key": "1",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-2",
            "key": "2",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-3",
            "key": "3",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-4",
            "key": "4",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-5",
            "key": "5",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-T",
            "key": "T",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-V",
            "key": "V",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-B",
            "key": "B",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-N",
            "key": "N",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-C",
            "key": "C",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-Z",
            "key": "Z",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "jin-mori-unresolved-Q",
            "key": "Q",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          }
        ],
        "combos": [],
        "ratings": {
          "accuracy": 9,
          "pvp": 9.4,
          "mobility": 9.5,
          "combos": 9.3,
          "defense": 8.6,
          "visuals": 9.8,
          "aura": 9.6,
          "difficulty": 8.6
        },
        "strengths": [
          "Clear character identity",
          "Flexible pressure routes",
          "Elite movement and chase"
        ],
        "weaknesses": [
          "Strict timing and resource management",
          "Mode-dependent defense",
          "Exact move selection and combo timing are not yet verified."
        ],
        "usageGuide": [
          "Use the Bloodline, element, mode, Combat Art, and weapon recommendations as an early concept only.",
          "Wait for a reviewed variant before treating any hotbar or combo route as exact."
        ],
        "verificationStatus": "Needs Research",
        "lastVerifiedUpdate": "Not yet verified"
      }
    ],
    "evidence": [],
    "ninjaTool": "Health Stim",
    "consumable": "Chi Stim",
    "mentor": "Bruce Mentor",
    "race": "Human",
    "hotbar": [
      {
        "id": "jin-mori-unresolved-1",
        "key": "1",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-2",
        "key": "2",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-3",
        "key": "3",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-4",
        "key": "4",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-5",
        "key": "5",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-T",
        "key": "T",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-V",
        "key": "V",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-B",
        "key": "B",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-N",
        "key": "N",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-C",
        "key": "C",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-Z",
        "key": "Z",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "jin-mori-unresolved-Q",
        "key": "Q",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      }
    ],
    "combos": [],
    "strengths": [
      "Clear character identity",
      "Flexible pressure routes",
      "Elite movement and chase"
    ],
    "weaknesses": [
      "Strict timing and resource management",
      "Mode-dependent defense"
    ],
    "substitutions": [
      "Tetsuo-Kaijin → a comparable mobility or pressure Bloodline",
      "Lightning → Fire for a simpler block-break"
    ],
    "slotAlternatives": {
      "twoSlots": [
        "Tetsuo-Kaijin",
        "Raion-Gaiden"
      ],
      "threeSlots": [
        "Tetsuo-Kaijin",
        "Raion-Gaiden",
        "Bruce-Kenichi"
      ],
      "fourSlots": [
        "Tetsuo-Kaijin",
        "Raion-Gaiden",
        "Bruce-Kenichi",
        "Dio-Senko"
      ]
    },
    "variations": {
      "beginner": "Keep Tetsuo-Kaijin + Raion-Gaiden and replace advanced counters with direct damage.",
      "meta": "Prioritize Tetsuo-Kaijin mode and the safest current guard-break tool.",
      "lore": "Keep the listed combat art and Enra Staff even when a stronger option exists."
    },
    "notes": "This build is available as an early draft and is still being researched for exact move accuracy.",
    "status": "Complete",
    "gameUpdate": "Unverified",
    "lastVerifiedUpdate": "",
    "verificationStatus": "Needs Retesting",
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z",
    "testing": {
      "status": "Untested",
      "contexts": [],
      "tester": "",
      "testDate": "",
      "notes": ""
    },
    "changeHistory": [],
    "thumbnail": "/characters/thumbs/jin-mori.webp"
  },
  {
    "id": "yu",
    "name": "Yu",
    "series": "The Boxer",
    "version": "Prime Lightweight",
    "description": "Almost no wasted movement: prediction, clean dodges, and single-hit boxing punish every commitment.",
    "archetype": [
      "Boxing",
      "Prediction",
      "Minimalism"
    ],
    "bloodlines": [
      {
        "id": "yu-bloodline-1",
        "name": "Doku-Tengoku",
        "purpose": "Core identity",
        "useMode": false
      },
      {
        "id": "yu-bloodline-2",
        "name": "Bruce-Kenichi",
        "purpose": "Combo routing",
        "useMode": false
      },
      {
        "id": "yu-bloodline-3",
        "name": "Dio-Senko",
        "purpose": "Mobility / pressure",
        "useMode": true
      },
      {
        "id": "yu-bloodline-4",
        "name": "Akuma",
        "purpose": "Counter / utility",
        "useMode": false
      }
    ],
    "elements": [
      "Air",
      "Order"
    ],
    "cMode": "Dio-Senko",
    "combatArt": "Boxing",
    "ratings": {
      "accuracy": 9.6,
      "pvp": 8.6,
      "mobility": 9.1,
      "combos": 7.9,
      "defense": 8,
      "visuals": 7.7,
      "aura": 8.2,
      "difficulty": 9
    },
    "characterId": "character-yu",
    "versionId": "version-yu",
    "buildName": "Prime Lightweight",
    "franchise": "The Boxer",
    "combatTags": [
      "Hand-to-hand",
      "Martial arts"
    ],
    "customTags": [],
    "effectsIntensity": "Low",
    "image": "/characters/yu.jpg",
    "chapterRange": "Unresolved",
    "characterAbilities": [
      "Boxing",
      "Prediction",
      "Minimalism"
    ],
    "knownCompromises": [
      "Exact moves, resource costs, and combo timing are unresolved."
    ],
    "confidence": "Unverified",
    "publicationStatus": "Draft",
    "variants": [
      {
        "id": "yu-restored-draft",
        "name": "Restored early draft",
        "type": "Primary",
        "bloodlineSlotCount": 4,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Doku-Tengoku",
            "purpose": "Core identity",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Core identity",
            "represents": "Core identity",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Combo routing",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Combo routing",
            "represents": "Combo routing",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Dio-Senko",
            "purpose": "Mobility / pressure",
            "exactMovesUsed": [],
            "useMode": true,
            "reason": "Mobility / pressure",
            "represents": "Mobility / pressure",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Akuma",
            "purpose": "Counter / utility",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Counter / utility",
            "represents": "Counter / utility",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Air",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          },
          {
            "name": "Order",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          }
        ],
        "cMode": "Dio-Senko",
        "zMode": "Demon Gate Spirit",
        "combatArt": "Boxing",
        "weapon": "None",
        "ninjaTool": "Shock Bomb",
        "consumable": "Chi Stim",
        "mentor": "Ryuji Mentor",
        "race": "Human",
        "hotbar": [
          {
            "id": "yu-unresolved-1",
            "key": "1",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-2",
            "key": "2",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-3",
            "key": "3",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-4",
            "key": "4",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-5",
            "key": "5",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-T",
            "key": "T",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-V",
            "key": "V",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-B",
            "key": "B",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-N",
            "key": "N",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-C",
            "key": "C",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-Z",
            "key": "Z",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "yu-unresolved-Q",
            "key": "Q",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          }
        ],
        "combos": [],
        "ratings": {
          "accuracy": 9.6,
          "pvp": 8.6,
          "mobility": 9.1,
          "combos": 7.9,
          "defense": 8,
          "visuals": 7.7,
          "aura": 8.2,
          "difficulty": 9
        },
        "strengths": [
          "Clear character identity",
          "Flexible pressure routes",
          "Elite movement and chase"
        ],
        "weaknesses": [
          "Strict timing and resource management",
          "Mode-dependent defense",
          "Exact move selection and combo timing are not yet verified."
        ],
        "usageGuide": [
          "Use the Bloodline, element, mode, Combat Art, and weapon recommendations as an early concept only.",
          "Wait for a reviewed variant before treating any hotbar or combo route as exact."
        ],
        "verificationStatus": "Needs Research",
        "lastVerifiedUpdate": "Not yet verified"
      }
    ],
    "evidence": [],
    "zMode": "Demon Gate Spirit",
    "weapon": "None",
    "ninjaTool": "Shock Bomb",
    "consumable": "Chi Stim",
    "mentor": "Ryuji Mentor",
    "race": "Human",
    "hotbar": [
      {
        "id": "yu-unresolved-1",
        "key": "1",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-2",
        "key": "2",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-3",
        "key": "3",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-4",
        "key": "4",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-5",
        "key": "5",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-T",
        "key": "T",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-V",
        "key": "V",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-B",
        "key": "B",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-N",
        "key": "N",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-C",
        "key": "C",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-Z",
        "key": "Z",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "yu-unresolved-Q",
        "key": "Q",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      }
    ],
    "combos": [],
    "strengths": [
      "Clear character identity",
      "Flexible pressure routes",
      "Elite movement and chase"
    ],
    "weaknesses": [
      "Strict timing and resource management",
      "Mode-dependent defense"
    ],
    "substitutions": [
      "Doku-Tengoku → a comparable mobility or pressure Bloodline",
      "Air → Fire for a simpler block-break"
    ],
    "slotAlternatives": {
      "twoSlots": [
        "Doku-Tengoku",
        "Bruce-Kenichi"
      ],
      "threeSlots": [
        "Doku-Tengoku",
        "Bruce-Kenichi",
        "Dio-Senko"
      ],
      "fourSlots": [
        "Doku-Tengoku",
        "Bruce-Kenichi",
        "Dio-Senko",
        "Akuma"
      ]
    },
    "variations": {
      "beginner": "Keep Doku-Tengoku + Bruce-Kenichi and replace advanced counters with direct damage.",
      "meta": "Prioritize Doku-Tengoku mode and the safest current guard-break tool.",
      "lore": "Keep the listed combat art and unarmed pressure even when a stronger option exists."
    },
    "notes": "This build is available as an early draft and is still being researched for exact move accuracy.",
    "status": "Complete",
    "gameUpdate": "Unverified",
    "lastVerifiedUpdate": "",
    "verificationStatus": "Needs Retesting",
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z",
    "testing": {
      "status": "Untested",
      "contexts": [],
      "tester": "",
      "testDate": "",
      "notes": ""
    },
    "changeHistory": [],
    "thumbnail": "/characters/thumbs/yu.webp"
  },
  {
    "id": "gray-yeon",
    "name": "Gray Yeon",
    "series": "Weak Hero",
    "version": "Eunjang Strategist",
    "description": "A deliberately low-effects tactical build using prediction, traps, and improvised tools.",
    "archetype": [
      "Prediction",
      "Traps",
      "Counter"
    ],
    "bloodlines": [
      {
        "id": "gray-yeon-bloodline-1",
        "name": "Doku-Tengoku",
        "purpose": "Core identity",
        "useMode": false
      },
      {
        "id": "gray-yeon-bloodline-2",
        "name": "Akuma",
        "purpose": "Combo routing",
        "useMode": true
      },
      {
        "id": "gray-yeon-bloodline-3",
        "name": "Minakaze",
        "purpose": "Mobility / pressure",
        "useMode": false
      },
      {
        "id": "gray-yeon-bloodline-4",
        "name": "Shiver-Akuma",
        "purpose": "Counter / utility",
        "useMode": false
      }
    ],
    "elements": [
      "Order",
      "Earth"
    ],
    "cMode": "Akuma",
    "combatArt": "Boxing",
    "weapon": "Improvised Pen",
    "ratings": {
      "accuracy": 9.2,
      "pvp": 7.9,
      "mobility": 7.4,
      "combos": 8.5,
      "defense": 6.8,
      "visuals": 7.4,
      "aura": 7.7,
      "difficulty": 8.9
    },
    "status": "Needs Testing",
    "characterId": "character-gray-yeon",
    "versionId": "version-gray-yeon",
    "buildName": "Eunjang Strategist",
    "franchise": "Weak Hero",
    "combatTags": [
      "Martial arts"
    ],
    "customTags": [],
    "effectsIntensity": "Low",
    "image": "/characters/gray-yeon.jpg",
    "chapterRange": "Unresolved",
    "characterAbilities": [
      "Prediction",
      "Traps",
      "Counter"
    ],
    "knownCompromises": [
      "Exact moves, resource costs, and combo timing are unresolved."
    ],
    "confidence": "Unverified",
    "publicationStatus": "Needs Retesting",
    "variants": [
      {
        "id": "gray-yeon-restored-draft",
        "name": "Restored early draft",
        "type": "Primary",
        "bloodlineSlotCount": 4,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Doku-Tengoku",
            "purpose": "Core identity",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Core identity",
            "represents": "Core identity",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Akuma",
            "purpose": "Combo routing",
            "exactMovesUsed": [],
            "useMode": true,
            "reason": "Combo routing",
            "represents": "Combo routing",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Minakaze",
            "purpose": "Mobility / pressure",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Mobility / pressure",
            "represents": "Mobility / pressure",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Shiver-Akuma",
            "purpose": "Counter / utility",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Counter / utility",
            "represents": "Counter / utility",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Order",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          },
          {
            "name": "Earth",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          }
        ],
        "cMode": "Akuma",
        "zMode": "Demon Gate Spirit",
        "combatArt": "Boxing",
        "weapon": "Improvised Pen",
        "ninjaTool": "Health Stim",
        "consumable": "Chi Stim",
        "mentor": "Ryuji Mentor",
        "race": "Human",
        "hotbar": [
          {
            "id": "gray-yeon-unresolved-1",
            "key": "1",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-2",
            "key": "2",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-3",
            "key": "3",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-4",
            "key": "4",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-5",
            "key": "5",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-T",
            "key": "T",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-V",
            "key": "V",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-B",
            "key": "B",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-N",
            "key": "N",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-C",
            "key": "C",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-Z",
            "key": "Z",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "gray-yeon-unresolved-Q",
            "key": "Q",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          }
        ],
        "combos": [],
        "ratings": {
          "accuracy": 9.2,
          "pvp": 7.9,
          "mobility": 7.4,
          "combos": 8.5,
          "defense": 6.8,
          "visuals": 7.4,
          "aura": 7.7,
          "difficulty": 8.9
        },
        "strengths": [
          "Clear character identity",
          "Flexible pressure routes",
          "Reliable neutral tools"
        ],
        "weaknesses": [
          "Strict timing and resource management",
          "Mode-dependent defense",
          "Exact move selection and combo timing are not yet verified."
        ],
        "usageGuide": [
          "Use the Bloodline, element, mode, Combat Art, and weapon recommendations as an early concept only.",
          "Wait for a reviewed variant before treating any hotbar or combo route as exact."
        ],
        "verificationStatus": "Needs Research",
        "lastVerifiedUpdate": "Not yet verified"
      }
    ],
    "evidence": [],
    "zMode": "Demon Gate Spirit",
    "ninjaTool": "Health Stim",
    "consumable": "Chi Stim",
    "mentor": "Ryuji Mentor",
    "race": "Human",
    "hotbar": [
      {
        "id": "gray-yeon-unresolved-1",
        "key": "1",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-2",
        "key": "2",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-3",
        "key": "3",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-4",
        "key": "4",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-5",
        "key": "5",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-T",
        "key": "T",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-V",
        "key": "V",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-B",
        "key": "B",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-N",
        "key": "N",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-C",
        "key": "C",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-Z",
        "key": "Z",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "gray-yeon-unresolved-Q",
        "key": "Q",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      }
    ],
    "combos": [],
    "strengths": [
      "Clear character identity",
      "Flexible pressure routes",
      "Reliable neutral tools"
    ],
    "weaknesses": [
      "Strict timing and resource management",
      "Mode-dependent defense"
    ],
    "substitutions": [
      "Doku-Tengoku → a comparable mobility or pressure Bloodline",
      "Order → Fire for a simpler block-break"
    ],
    "slotAlternatives": {
      "twoSlots": [
        "Doku-Tengoku",
        "Akuma"
      ],
      "threeSlots": [
        "Doku-Tengoku",
        "Akuma",
        "Minakaze"
      ],
      "fourSlots": [
        "Doku-Tengoku",
        "Akuma",
        "Minakaze",
        "Shiver-Akuma"
      ]
    },
    "variations": {
      "beginner": "Keep Doku-Tengoku + Akuma and replace advanced counters with direct damage.",
      "meta": "Prioritize Doku-Tengoku mode and the safest current guard-break tool.",
      "lore": "Keep the listed combat art and Improvised Pen even when a stronger option exists."
    },
    "notes": "This build is available as an early draft and is still being researched for exact move accuracy.",
    "gameUpdate": "Unverified",
    "lastVerifiedUpdate": "",
    "verificationStatus": "Needs Retesting",
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z",
    "testing": {
      "status": "Untested",
      "contexts": [],
      "tester": "",
      "testDate": "",
      "notes": ""
    },
    "changeHistory": [],
    "thumbnail": "/characters/thumbs/gray-yeon.webp"
  },
  {
    "id": "vasco",
    "name": "Vasco",
    "series": "Lookism",
    "version": "Hero of Burn Knuckles",
    "bloodlines": [
      {
        "id": "vasco-bloodline-1",
        "name": "Ryuji-Kenichi",
        "purpose": "Core identity",
        "useMode": true
      },
      {
        "id": "vasco-bloodline-2",
        "name": "Bruce-Kenichi",
        "purpose": "Combo routing",
        "useMode": false
      },
      {
        "id": "vasco-bloodline-3",
        "name": "Ashura-Shizen",
        "purpose": "Mobility / pressure",
        "useMode": false
      }
    ],
    "archetype": [
      "Strength",
      "Muay Thai",
      "Hero"
    ],
    "combatArt": "Muay Thai",
    "description": "Hero of Burn Knuckles translated into a strength, muay thai, hero loadout with character-first routing and practical PvP coverage.",
    "elements": [
      "Earth",
      "Fire"
    ],
    "ratings": {
      "accuracy": 9.2,
      "pvp": 8.8,
      "mobility": 8.1,
      "combos": 8.7,
      "defense": 7.9,
      "visuals": 8.8,
      "aura": 8.8,
      "difficulty": 8
    },
    "status": "Needs Testing",
    "characterId": "character-vasco",
    "versionId": "version-vasco",
    "buildName": "Hero of Burn Knuckles",
    "franchise": "PTJ / Street Action",
    "combatTags": [
      "Hand-to-hand",
      "Martial arts"
    ],
    "customTags": [],
    "effectsIntensity": "Medium",
    "image": "/characters/vasco.jpg",
    "chapterRange": "Unresolved",
    "characterAbilities": [
      "Strength",
      "Muay Thai",
      "Hero"
    ],
    "knownCompromises": [
      "Exact moves, resource costs, and combo timing are unresolved."
    ],
    "confidence": "Unverified",
    "publicationStatus": "Needs Retesting",
    "variants": [
      {
        "id": "vasco-restored-draft",
        "name": "Restored early draft",
        "type": "Primary",
        "bloodlineSlotCount": 3,
        "elementSlotCount": 2,
        "bloodlines": [
          {
            "name": "Ryuji-Kenichi",
            "purpose": "Core identity",
            "exactMovesUsed": [],
            "useMode": true,
            "reason": "Core identity",
            "represents": "Core identity",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Bruce-Kenichi",
            "purpose": "Combo routing",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Combo routing",
            "represents": "Combo routing",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          },
          {
            "name": "Ashura-Shizen",
            "purpose": "Mobility / pressure",
            "exactMovesUsed": [],
            "useMode": false,
            "reason": "Mobility / pressure",
            "represents": "Mobility / pressure",
            "replacements": {
              "lore": [],
              "competitive": [],
              "accessible": []
            }
          }
        ],
        "elements": [
          {
            "name": "Earth",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          },
          {
            "name": "Fire",
            "exactMovesUsed": [],
            "purpose": "Existing draft element recommendation; exact moves still require research.",
            "replacements": []
          }
        ],
        "cMode": "Ryuji-Kenichi",
        "zMode": "Demon Gate Spirit",
        "combatArt": "Muay Thai",
        "weapon": "None",
        "ninjaTool": "Shock Bomb",
        "consumable": "Chi Stim",
        "mentor": "Bruce Mentor",
        "race": "Human",
        "hotbar": [
          {
            "id": "vasco-unresolved-1",
            "key": "1",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-2",
            "key": "2",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-3",
            "key": "3",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-4",
            "key": "4",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-5",
            "key": "5",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-T",
            "key": "T",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-V",
            "key": "V",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-B",
            "key": "B",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-N",
            "key": "N",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-C",
            "key": "C",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-Z",
            "key": "Z",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          },
          {
            "id": "vasco-unresolved-Q",
            "key": "Q",
            "ability": "Unresolved — research required",
            "source": "Research pending",
            "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
            "comboRole": "Unresolved",
            "blockBreak": false,
            "usageNotes": "Not presented as an exact or tested move."
          }
        ],
        "combos": [],
        "ratings": {
          "accuracy": 9.2,
          "pvp": 8.8,
          "mobility": 8.1,
          "combos": 8.7,
          "defense": 7.9,
          "visuals": 8.8,
          "aura": 8.8,
          "difficulty": 8
        },
        "strengths": [
          "Clear character identity",
          "Flexible pressure routes",
          "Elite movement and chase"
        ],
        "weaknesses": [
          "Strict timing and resource management",
          "Mode-dependent defense",
          "Exact move selection and combo timing are not yet verified."
        ],
        "usageGuide": [
          "Use the Bloodline, element, mode, Combat Art, and weapon recommendations as an early concept only.",
          "Wait for a reviewed variant before treating any hotbar or combo route as exact."
        ],
        "verificationStatus": "Needs Research",
        "lastVerifiedUpdate": "Not yet verified"
      }
    ],
    "evidence": [],
    "cMode": "Ryuji-Kenichi",
    "zMode": "Demon Gate Spirit",
    "weapon": "None",
    "ninjaTool": "Shock Bomb",
    "consumable": "Chi Stim",
    "mentor": "Bruce Mentor",
    "race": "Human",
    "hotbar": [
      {
        "id": "vasco-unresolved-1",
        "key": "1",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-2",
        "key": "2",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-3",
        "key": "3",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-4",
        "key": "4",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-5",
        "key": "5",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-T",
        "key": "T",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-V",
        "key": "V",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-B",
        "key": "B",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-N",
        "key": "N",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-C",
        "key": "C",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-Z",
        "key": "Z",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      },
      {
        "id": "vasco-unresolved-Q",
        "key": "Q",
        "ability": "Unresolved — research required",
        "source": "Research pending",
        "purpose": "This slot is intentionally unresolved until a real current-update ability is reviewed.",
        "comboRole": "Unresolved",
        "blockBreak": false,
        "usageNotes": "Not presented as an exact or tested move."
      }
    ],
    "combos": [],
    "strengths": [
      "Clear character identity",
      "Flexible pressure routes",
      "Elite movement and chase"
    ],
    "weaknesses": [
      "Strict timing and resource management",
      "Mode-dependent defense"
    ],
    "substitutions": [
      "Ryuji-Kenichi → a comparable mobility or pressure Bloodline",
      "Earth → Fire for a simpler block-break"
    ],
    "slotAlternatives": {
      "twoSlots": [
        "Ryuji-Kenichi",
        "Bruce-Kenichi"
      ],
      "threeSlots": [
        "Ryuji-Kenichi",
        "Bruce-Kenichi",
        "Ashura-Shizen"
      ],
      "fourSlots": [
        "Ryuji-Kenichi",
        "Bruce-Kenichi",
        "Ashura-Shizen"
      ]
    },
    "variations": {
      "beginner": "Keep Ryuji-Kenichi + Bruce-Kenichi and replace advanced counters with direct damage.",
      "meta": "Prioritize Ryuji-Kenichi mode and the safest current guard-break tool.",
      "lore": "Keep the listed combat art and unarmed pressure even when a stronger option exists."
    },
    "notes": "This build is available as an early draft and is still being researched for exact move accuracy.",
    "gameUpdate": "Unverified",
    "lastVerifiedUpdate": "",
    "verificationStatus": "Needs Retesting",
    "createdAt": "2026-07-29T00:00:00.000Z",
    "updatedAt": "2026-07-29T00:00:00.000Z",
    "testing": {
      "status": "Untested",
      "contexts": [],
      "tester": "",
      "testDate": "",
      "notes": ""
    },
    "changeHistory": [],
    "thumbnail": "/characters/thumbs/vasco.webp"
  }
] satisfies CharacterBuild[]
