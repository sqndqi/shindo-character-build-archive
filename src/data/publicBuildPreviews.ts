import type { PublicBuildPreview } from '../repositories/BuildRepository'

export const publicBuildPreviews = [
  {
    "id": "james-lee",
    "name": "James Lee",
    "series": "Lookism",
    "version": "Current — Explosive Path",
    "image": "/characters/james-lee.jpg",
    "thumbnail": "/characters/thumbs/james-lee.webp",
    "archetype": [
      "Speed threshold",
      "Explosive kicks",
      "Counter"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "seongji-yuk",
    "name": "Seongji Yuk",
    "series": "Lookism",
    "version": "Cheonliang — Three Thresholds",
    "image": "/characters/seongji-yuk.jpg",
    "thumbnail": "/characters/thumbs/seongji-yuk.webp",
    "archetype": [
      "Three thresholds",
      "Grappling",
      "Power"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "gun-park",
    "name": "Gun Park",
    "series": "Lookism",
    "version": "Mastered Ultra Instinct",
    "image": "/characters/gun-park.jpg",
    "thumbnail": "/characters/thumbs/gun-park.webp",
    "archetype": [
      "Ultra Instinct approximation",
      "Pressure",
      "Durability"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "little-daniel-park",
    "name": "Little Daniel Park",
    "series": "Lookism",
    "version": "UI and Path",
    "image": "/characters/little-daniel-park.jpg",
    "thumbnail": "/characters/thumbs/little-daniel-park.webp",
    "archetype": [
      "Copy approximation",
      "Prediction",
      "Counter"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "johan-seong",
    "name": "Johan Seong",
    "series": "Lookism",
    "version": "Infinite Technique",
    "image": "/characters/johan-seong.jpg",
    "thumbnail": "/characters/thumbs/johan-seong.webp",
    "archetype": [
      "Copy approximation",
      "Speed",
      "Technique"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "kitae-kim",
    "name": "Kitae Kim",
    "series": "Lookism",
    "version": "King of Seoul",
    "image": "/characters/kitae-kim.jpg",
    "thumbnail": "/characters/thumbs/kitae-kim.webp",
    "archetype": [
      "Power",
      "Brutality",
      "Endurance"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "goo-kim",
    "name": "Goo Kim",
    "series": "Lookism",
    "version": "Weapon Genius",
    "image": "/characters/goo-kim.jpg",
    "thumbnail": "/characters/thumbs/goo-kim.webp",
    "archetype": [
      "Weapon genius",
      "Technique",
      "Unpredictability"
    ],
    "variantCount": 6,
    "free": false
  },
  {
    "id": "jake-kim",
    "name": "Jake Kim",
    "series": "Lookism",
    "version": "Conviction",
    "image": "/characters/jake-kim.jpg",
    "thumbnail": "/characters/thumbs/jake-kim.webp",
    "archetype": [
      "Conviction",
      "Power",
      "Defense"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "eli-jang",
    "name": "Eli Jang",
    "series": "Lookism",
    "version": "Wildness",
    "image": "/characters/eli-jang.jpg",
    "thumbnail": "/characters/thumbs/eli-jang.webp",
    "archetype": [
      "Wildness",
      "Grappling",
      "Mobility"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "zack-lee",
    "name": "Zack Lee",
    "series": "Lookism",
    "version": "Iron Fortress",
    "image": "/characters/zack-lee.jpg",
    "thumbnail": "/characters/thumbs/zack-lee.webp",
    "archetype": [
      "Iron Fortress",
      "Boxing",
      "Counter"
    ],
    "variantCount": 4,
    "free": true
  },
  {
    "id": "anime-naruto-uzumaki",
    "name": "Naruto Uzumaki",
    "series": "Naruto Shippūden",
    "version": "Six Paths Sage Mode / Fourth Great Ninja War",
    "image": "/characters/anime/naruto-uzumaki.jpg",
    "thumbnail": "/characters/thumbs/naruto-uzumaki.webp",
    "archetype": [
      "Six Paths",
      "Clone Pressure",
      "Rasengan",
      "Brawler"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "anime-sasuke-uchiha",
    "name": "Sasuke Uchiha",
    "series": "Boruto: Naruto Next Generations",
    "version": "Adult Sasuke / Rinnegan Era",
    "image": "/characters/anime/sasuke-uchiha.jpg",
    "thumbnail": "/characters/thumbs/sasuke-uchiha.webp",
    "archetype": [
      "Rinnegan",
      "Sword",
      "Inferno",
      "Space Swap"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "anime-madara-uchiha",
    "name": "Madara Uchiha",
    "series": "Naruto Shippūden",
    "version": "Ten-Tails Jinchūriki",
    "image": "/characters/anime/madara-uchiha.jpg",
    "thumbnail": "/characters/thumbs/madara-uchiha.webp",
    "archetype": [
      "Ten-Tails",
      "Rinnegan",
      "Susanoo",
      "Area Control"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "anime-minato-namikaze",
    "name": "Minato Namikaze",
    "series": "Naruto Shippūden",
    "version": "Fourth Hokage / Kurama Link Mode",
    "image": "/characters/anime/minato-namikaze.jpg",
    "thumbnail": "/characters/thumbs/minato-namikaze.webp",
    "archetype": [
      "Flying Raijin",
      "Rasengan",
      "Teleport",
      "Kurama Link"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "anime-itachi-uchiha",
    "name": "Itachi Uchiha",
    "series": "Naruto Shippūden",
    "version": "Akatsuki / Mangekyō Sharingan",
    "image": "/characters/anime/itachi-uchiha.jpg",
    "thumbnail": "/characters/thumbs/itachi-uchiha.webp",
    "archetype": [
      "Mangekyō",
      "Genjutsu",
      "Counter",
      "Susanoo"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "anime-boruto-uzumaki",
    "name": "Boruto Uzumaki",
    "series": "Boruto: Two Blue Vortex",
    "version": "Two Blue Vortex / Karma",
    "image": "/characters/anime/boruto-uzumaki.jpg",
    "thumbnail": "/characters/thumbs/boruto-uzumaki.webp",
    "archetype": [
      "Karma",
      "Portal",
      "Rasengan",
      "Sword"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "anime-ichigo-kurosaki",
    "name": "Ichigo Kurosaki",
    "series": "Bleach",
    "version": "True Bankai / Horn of Salvation",
    "image": "/characters/anime/ichigo-kurosaki.jpg",
    "thumbnail": "/characters/thumbs/ichigo-kurosaki.webp",
    "archetype": [
      "True Bankai",
      "Getsuga",
      "Hollow",
      "Sword"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "anime-sosuke-aizen",
    "name": "Sōsuke Aizen",
    "series": "Bleach",
    "version": "Hōgyoku Evolution",
    "image": "/characters/anime/sosuke-aizen.jpg",
    "thumbnail": "/characters/thumbs/sosuke-aizen.webp",
    "archetype": [
      "Hōgyoku",
      "Hypnosis",
      "Regeneration",
      "Sword"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "anime-monkey-d-luffy-snakeman",
    "name": "Monkey D. Luffy",
    "series": "One Piece",
    "version": "Gear 4 Snakeman",
    "image": "/characters/anime/monkey-d-luffy-snakeman.jpg",
    "thumbnail": "/characters/thumbs/monkey-d-luffy-snakeman.webp",
    "archetype": [
      "Snakeman",
      "Rubber",
      "Brawler",
      "Pursuit"
    ],
    "variantCount": 5,
    "free": false
  },
  {
    "id": "anime-jotaro-kujo",
    "name": "Jotaro Kujo",
    "series": "JoJo’s Bizarre Adventure",
    "version": "Stardust Crusaders",
    "image": "/characters/anime/jotaro-kujo.jpg",
    "thumbnail": "/characters/thumbs/jotaro-kujo.webp",
    "archetype": [
      "Stand",
      "Time Stop",
      "Boxing",
      "Counter"
    ],
    "variantCount": 4,
    "free": false
  },
  {
    "id": "jin-mori",
    "name": "Jin Mori",
    "series": "The God of High School",
    "version": "Monkey King Awakened",
    "image": "/characters/jin-mori.jpg",
    "thumbnail": "/characters/thumbs/jin-mori.webp",
    "archetype": [
      "Staff",
      "Martial Arts",
      "Transformation"
    ],
    "variantCount": 1,
    "free": true
  },
  {
    "id": "han-daewi",
    "name": "Han Daewi",
    "series": "The God of High School",
    "version": "Sage of the East",
    "image": "/characters/han-daewi.jpg",
    "thumbnail": "/characters/thumbs/han-daewi.webp",
    "archetype": [
      "Karate",
      "Gravity",
      "Control"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "sung-jinwoo",
    "name": "Sung Jinwoo",
    "series": "Solo Leveling",
    "version": "Shadow Monarch",
    "image": "/characters/sung-jinwoo.jpg",
    "thumbnail": "/characters/thumbs/sung-jinwoo.webp",
    "archetype": [
      "Shadow",
      "Summoner",
      "Assassin"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "cheon-yeo-woon",
    "name": "Cheon Yeo-Woon",
    "series": "Nano Machine",
    "version": "Heavenly Demon",
    "image": "/characters/cheon-yeo-woon.jpg",
    "thumbnail": "/characters/thumbs/cheon-yeo-woon.webp",
    "archetype": [
      "Sword",
      "Precision",
      "Demon"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jin-mu-won",
    "name": "Jin Mu-Won",
    "series": "Legend of the Northern Blade",
    "version": "Northern Heavenly Sect",
    "image": "/characters/jin-mu-won.jpg",
    "thumbnail": "/characters/thumbs/jin-mu-won.webp",
    "archetype": [
      "Shadow",
      "Sword",
      "Discipline"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "kayden-break",
    "name": "Kayden Break",
    "series": "Eleceed",
    "version": "Top Ten Awakener",
    "image": "/characters/kayden-break.jpg",
    "thumbnail": "/characters/thumbs/kayden-break.webp",
    "archetype": [
      "Lightning",
      "Speed",
      "Destruction"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "yu",
    "name": "Yu",
    "series": "The Boxer",
    "version": "Prime Lightweight",
    "image": "/characters/yu.jpg",
    "thumbnail": "/characters/thumbs/yu.webp",
    "archetype": [
      "Boxing",
      "Prediction",
      "Minimalism"
    ],
    "variantCount": 1,
    "free": true
  },
  {
    "id": "barolt",
    "name": "Barolt",
    "series": "Latna Saga",
    "version": "Sword King",
    "image": "/characters/barolt.jpg",
    "thumbnail": "/characters/thumbs/barolt.webp",
    "archetype": [
      "Power",
      "Durability",
      "Berserker"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "arthur-leywin",
    "name": "Arthur Leywin",
    "series": "The Beginning After the End",
    "version": "Realmheart",
    "image": "/characters/arthur-leywin.jpg",
    "thumbnail": "/characters/thumbs/arthur-leywin.webp",
    "archetype": [
      "Elements",
      "Sword",
      "Dragon"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "gray-yeon",
    "name": "Gray Yeon",
    "series": "Weak Hero",
    "version": "Eunjang Strategist",
    "image": "/characters/gray-yeon.jpg",
    "thumbnail": "/characters/thumbs/gray-yeon.webp",
    "archetype": [
      "Prediction",
      "Traps",
      "Counter"
    ],
    "variantCount": 1,
    "free": true
  },
  {
    "id": "tom-lee",
    "name": "Tom Lee",
    "series": "Lookism",
    "version": "Ultimate King",
    "image": "/characters/tom-lee.jpg",
    "thumbnail": "/characters/thumbs/tom-lee.webp",
    "archetype": [
      "Strength",
      "Instinct",
      "Grappling"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "gapryong-kim",
    "name": "Gapryong Kim",
    "series": "Lookism",
    "version": "Conviction",
    "image": "/characters/gapryong-kim.jpg",
    "thumbnail": "/characters/thumbs/gapryong-kim.webp",
    "archetype": [
      "Conviction",
      "Power",
      "Durability"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jinyoung-park",
    "name": "Jinyoung Park",
    "series": "Lookism",
    "version": "Copy Genius",
    "image": "/characters/jinyoung-park.jpg",
    "thumbnail": "/characters/thumbs/jinyoung-park.webp",
    "archetype": [
      "Copy",
      "Intelligence",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "charles-choi",
    "name": "Charles Choi",
    "series": "Lookism",
    "version": "Elite",
    "image": "/characters/charles-choi.jpg",
    "thumbnail": "/characters/thumbs/charles-choi.webp",
    "archetype": [
      "Speed",
      "Technique",
      "Intelligence"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "shingen-yamazaki",
    "name": "Shingen Yamazaki",
    "series": "Lookism",
    "version": "Yamazaki Head",
    "image": "/characters/shingen-yamazaki.jpg",
    "thumbnail": "/characters/thumbs/shingen-yamazaki.webp",
    "archetype": [
      "UI",
      "Strength",
      "Final Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "shintaro-yamazaki",
    "name": "Shintaro Yamazaki",
    "series": "Lookism",
    "version": "Controlled UI",
    "image": "/characters/shintaro-yamazaki.jpg",
    "thumbnail": "/characters/thumbs/shintaro-yamazaki.webp",
    "archetype": [
      "UI",
      "Technique",
      "Discipline"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "samuel-seo",
    "name": "Samuel Seo",
    "series": "Lookism",
    "version": "Heat Mode",
    "image": "/characters/samuel-seo.jpg",
    "thumbnail": "/characters/thumbs/samuel-seo.webp",
    "archetype": [
      "Heat",
      "Brutality",
      "Durability"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "vasco",
    "name": "Vasco",
    "series": "Lookism",
    "version": "Hero of Burn Knuckles",
    "image": "/characters/vasco.jpg",
    "thumbnail": "/characters/thumbs/vasco.webp",
    "archetype": [
      "Strength",
      "Muay Thai",
      "Hero"
    ],
    "variantCount": 1,
    "free": true
  },
  {
    "id": "vin-jin",
    "name": "Vin Jin",
    "series": "Lookism",
    "version": "Cheonliang Kudo",
    "image": "/characters/vin-jin.jpg",
    "thumbnail": "/characters/thumbs/vin-jin.webp",
    "archetype": [
      "Grappling",
      "Power",
      "Speed"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jaegyeon-na",
    "name": "Jaegyeon Na",
    "series": "Lookism",
    "version": "King of Incheon",
    "image": "/characters/jaegyeon-na.jpg",
    "thumbnail": "/characters/thumbs/jaegyeon-na.webp",
    "archetype": [
      "Speed",
      "Mobility",
      "Evasion"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jichang-kwak",
    "name": "Jichang Kwak",
    "series": "Lookism",
    "version": "White Snake",
    "image": "/characters/jichang-kwak.jpg",
    "thumbnail": "/characters/thumbs/jichang-kwak.webp",
    "archetype": [
      "Precision",
      "Power",
      "Strategy"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "taesoo-ma",
    "name": "Taesoo Ma",
    "series": "Lookism",
    "version": "One Fist",
    "image": "/characters/taesoo-ma.jpg",
    "thumbnail": "/characters/thumbs/taesoo-ma.webp",
    "archetype": [
      "Power",
      "Conviction",
      "One-Hit"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "gongseob-ji",
    "name": "Gongseob Ji",
    "series": "Lookism",
    "version": "Iron Boxer",
    "image": "/characters/gongseob-ji.jpg",
    "thumbnail": "/characters/thumbs/gongseob-ji.webp",
    "archetype": [
      "Defense",
      "Boxing",
      "Counter"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "sinu-han",
    "name": "Sinu Han",
    "series": "Lookism",
    "version": "Boy of Promise",
    "image": "/characters/sinu-han.jpg",
    "thumbnail": "/characters/thumbs/sinu-han.webp",
    "archetype": [
      "Speed",
      "Technique",
      "Pressure"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "warren-chae",
    "name": "Warren Chae",
    "series": "Lookism",
    "version": "New CQC",
    "image": "/characters/warren-chae.jpg",
    "thumbnail": "/characters/thumbs/warren-chae.webp",
    "archetype": [
      "CQC",
      "Technique",
      "Endurance"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "manager-kim",
    "name": "Manager Kim",
    "series": "Manager Kim",
    "version": "Black Ops Father",
    "image": "/characters/manager-kim.jpg",
    "thumbnail": "/characters/thumbs/manager-kim.webp",
    "archetype": [
      "CQC",
      "Assassin",
      "Tactical"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "hansu-seong",
    "name": "Hansu Seong",
    "series": "Manager Kim",
    "version": "Technique Release",
    "image": "/characters/hansu-seong.jpg",
    "thumbnail": "/characters/thumbs/hansu-seong.webp",
    "archetype": [
      "Kicks",
      "Technique",
      "Power"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jincheol-park",
    "name": "Jincheol Park",
    "series": "Manager Kim",
    "version": "War Mode",
    "image": "/characters/jincheol-park.jpg",
    "thumbnail": "/characters/thumbs/jincheol-park.webp",
    "archetype": [
      "Soldier",
      "Power",
      "Endurance"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "hobin-yoo",
    "name": "Hobin Yoo",
    "series": "Viral Hit",
    "version": "How to Fight",
    "image": "/characters/hobin-yoo.jpg",
    "thumbnail": "/characters/thumbs/hobin-yoo.webp",
    "archetype": [
      "Counter",
      "Adaptation",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "taehoon-seong",
    "name": "Taehoon Seong",
    "series": "Viral Hit",
    "version": "Taekwondo Prodigy",
    "image": "/characters/taehoon-seong.jpg",
    "thumbnail": "/characters/thumbs/taehoon-seong.webp",
    "archetype": [
      "Kicks",
      "Speed",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "suhyeon-kim",
    "name": "Suhyeon Kim",
    "series": "Questism",
    "version": "Card Master",
    "image": "/characters/suhyeon-kim.jpg",
    "thumbnail": "/characters/thumbs/suhyeon-kim.webp",
    "archetype": [
      "System",
      "Copy",
      "Versatility"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "choyun",
    "name": "Choyun",
    "series": "Questism",
    "version": "System Overlord",
    "image": "/characters/choyun.jpg",
    "thumbnail": "/characters/thumbs/choyun.webp",
    "archetype": [
      "System",
      "Control",
      "Final Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "daniel-questism",
    "name": "Daniel",
    "series": "Questism",
    "version": "Northern No. 2",
    "image": "/characters/daniel-questism.jpg",
    "thumbnail": "/characters/thumbs/daniel-questism.webp",
    "archetype": [
      "Speed",
      "Technique",
      "Strategy"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "hajun-gu",
    "name": "Hajun Gu",
    "series": "Questism",
    "version": "Overlord",
    "image": "/characters/hajun-gu.jpg",
    "thumbnail": "/characters/thumbs/hajun-gu.webp",
    "archetype": [
      "Strength",
      "Pressure",
      "Durability"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "dowan-ha",
    "name": "Dowan Ha",
    "series": "Reality Quest",
    "version": "Reality System",
    "image": "/characters/dowan-ha.jpg",
    "thumbnail": "/characters/thumbs/dowan-ha.webp",
    "archetype": [
      "System",
      "Speed",
      "Growth"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "sung-il-hwan",
    "name": "Sung Il-Hwan",
    "series": "Solo Leveling",
    "version": "Ruler Vessel",
    "image": "/characters/sung-il-hwan.jpg",
    "thumbnail": "/characters/thumbs/sung-il-hwan.webp",
    "archetype": [
      "Ruler",
      "Strength",
      "Speed"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "thomas-andre",
    "name": "Thomas Andre",
    "series": "Solo Leveling",
    "version": "Goliath",
    "image": "/characters/thomas-andre.jpg",
    "thumbnail": "/characters/thumbs/thomas-andre.webp",
    "archetype": [
      "Tank",
      "Power",
      "Destruction"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "liu-zhigang",
    "name": "Liu Zhigang",
    "series": "Solo Leveling",
    "version": "National Hunter",
    "image": "/characters/liu-zhigang.jpg",
    "thumbnail": "/characters/thumbs/liu-zhigang.webp",
    "archetype": [
      "Sword",
      "Speed",
      "Aura"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "beru",
    "name": "Beru",
    "series": "Solo Leveling",
    "version": "Shadow General",
    "image": "/characters/beru.jpg",
    "thumbnail": "/characters/thumbs/beru.webp",
    "archetype": [
      "Monster",
      "Speed",
      "Regeneration",
      "Shadow"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "igris",
    "name": "Igris",
    "series": "Solo Leveling",
    "version": "Blood-Red Commander",
    "image": "/characters/igris.jpg",
    "thumbnail": "/characters/thumbs/igris.webp",
    "archetype": [
      "Knight",
      "Sword",
      "Shadow"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "kim-dokja",
    "name": "Kim Dokja",
    "series": "Omniscient Reader",
    "version": "Demon King of Salvation",
    "image": "/characters/kim-dokja.jpg",
    "thumbnail": "/characters/thumbs/kim-dokja.webp",
    "archetype": [
      "Scenario",
      "Prediction",
      "Control"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "yoo-joonghyuk",
    "name": "Yoo Joonghyuk",
    "series": "Omniscient Reader",
    "version": "Regressor",
    "image": "/characters/yoo-joonghyuk.jpg",
    "thumbnail": "/characters/thumbs/yoo-joonghyuk.webp",
    "archetype": [
      "Regression",
      "Sword",
      "Endurance"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "secretive-plotter",
    "name": "Secretive Plotter",
    "series": "Omniscient Reader",
    "version": "Outer God",
    "image": "/characters/secretive-plotter.jpg",
    "thumbnail": "/characters/thumbs/secretive-plotter.webp",
    "archetype": [
      "Cosmic",
      "Shadow",
      "Final Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "kyrgios-rodgraim",
    "name": "Kyrgios Rodgraim",
    "series": "Omniscient Reader",
    "version": "Electrification",
    "image": "/characters/kyrgios-rodgraim.jpg",
    "thumbnail": "/characters/thumbs/kyrgios-rodgraim.webp",
    "archetype": [
      "Lightning",
      "Speed",
      "Martial Arts"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jiwoo-seo",
    "name": "Jiwoo Seo",
    "series": "Eleceed",
    "version": "Kayden Force Control",
    "image": "/characters/jiwoo-seo.jpg",
    "thumbnail": "/characters/thumbs/jiwoo-seo.webp",
    "archetype": [
      "Speed",
      "Lightning",
      "Close Combat"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "kartein",
    "name": "Kartein",
    "series": "Eleceed",
    "version": "Divine Healer",
    "image": "/characters/kartein.jpg",
    "thumbnail": "/characters/thumbs/kartein.webp",
    "archetype": [
      "Healing",
      "Defense",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "andrei",
    "name": "Andrei",
    "series": "Eleceed",
    "version": "World Awakener",
    "image": "/characters/andrei.jpg",
    "thumbnail": "/characters/thumbs/andrei.webp",
    "archetype": [
      "Lightning",
      "Destruction",
      "Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "blade-god",
    "name": "Blade God",
    "series": "Nano Machine",
    "version": "Space-Cutting Demon",
    "image": "/characters/blade-god.jpg",
    "thumbnail": "/characters/thumbs/blade-god.webp",
    "archetype": [
      "Sword",
      "Demon",
      "Precision"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "heavenly-demon-mmm",
    "name": "Heavenly Demon",
    "series": "Myst, Might, Mayhem",
    "version": "First Heavenly Demon",
    "image": "/characters/heavenly-demon-mmm.jpg",
    "thumbnail": "/characters/thumbs/heavenly-demon-mmm.webp",
    "archetype": [
      "Demon",
      "Sword",
      "Final Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "mok-gyeong-woon",
    "name": "Mok Gyeong-Woon",
    "series": "Myst, Might, Mayhem",
    "version": "Demonic Sovereign",
    "image": "/characters/mok-gyeong-woon.jpg",
    "thumbnail": "/characters/thumbs/mok-gyeong-woon.webp",
    "archetype": [
      "Dark",
      "Sword",
      "Necromancy"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "chung-myung",
    "name": "Chung Myung",
    "series": "Return of the Mount Hua Sect",
    "version": "Plum Blossom Sword Saint",
    "image": "/characters/chung-myung.jpg",
    "thumbnail": "/characters/thumbs/chung-myung.webp",
    "archetype": [
      "Sword",
      "Speed",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jinhyeok-murim",
    "name": "Jinhyeok",
    "series": "Murim Login",
    "version": "System Ascendant",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "System",
      "Martial Arts",
      "Growth"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jin-tae-kyung",
    "name": "Jin Tae-Kyung",
    "series": "Murim Login",
    "version": "Fire King Disciple",
    "image": "/characters/jin-tae-kyung.jpg",
    "thumbnail": "/characters/thumbs/jin-tae-kyung.webp",
    "archetype": [
      "Spear",
      "Power",
      "Martial Arts"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "lee-gwak",
    "name": "Lee Gwak",
    "series": "Martial Artist Lee Gwak",
    "version": "Quiet Master",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Technique",
      "Shadow",
      "Counter"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "lee-geon",
    "name": "Lee Geon",
    "series": "Return of the Disaster-Class Hero",
    "version": "Serpent Bearer",
    "image": "/characters/lee-geon.jpg",
    "thumbnail": "/characters/thumbs/lee-geon.webp",
    "archetype": [
      "Divine",
      "Power",
      "Summoner"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "dam-soo-cheon",
    "name": "Dam Soo-Cheon",
    "series": "Legend of the Northern Blade",
    "version": "Cerulean Dragon",
    "image": "/characters/dam-soo-cheon.jpg",
    "thumbnail": "/characters/thumbs/dam-soo-cheon.webp",
    "archetype": [
      "Spear",
      "Lightning",
      "Power"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "jo-cheon-woo",
    "name": "Jo Cheon-Woo",
    "series": "Legend of the Northern Blade",
    "version": "Great Four",
    "image": "/characters/jo-cheon-woo.jpg",
    "thumbnail": "/characters/thumbs/jo-cheon-woo.webp",
    "archetype": [
      "Power",
      "Tank",
      "Brutality"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "gang-ryong",
    "name": "Gang Ryong",
    "series": "Gosu",
    "version": "Heavenly Destroyer Disciple",
    "image": "/characters/gang-ryong.jpg",
    "thumbnail": "/characters/thumbs/gang-ryong.webp",
    "archetype": [
      "Martial Arts",
      "Power",
      "Energy"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "yongbi",
    "name": "Yongbi",
    "series": "Gosu",
    "version": "Veteran Spearmaster",
    "image": "/characters/yongbi.jpg",
    "thumbnail": "/characters/thumbs/yongbi.webp",
    "archetype": [
      "Spear",
      "Technique",
      "Speed"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "arthur-leywin-king-grey",
    "name": "Arthur Leywin",
    "series": "The Beginning After the End",
    "version": "King Grey",
    "image": "/characters/arthur-leywin-king-grey.jpg",
    "thumbnail": "/characters/thumbs/arthur-leywin-king-grey.webp",
    "archetype": [
      "Elemental",
      "Dragon",
      "Sword"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "regis",
    "name": "Regis",
    "series": "The Beginning After the End",
    "version": "Destruction Companion",
    "image": "/characters/regis.jpg",
    "thumbnail": "/characters/thumbs/regis.webp",
    "archetype": [
      "Destruction",
      "Shadow",
      "Companion"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "agrona-vritra",
    "name": "Agrona Vritra",
    "series": "The Beginning After the End",
    "version": "Vritra Sovereign",
    "image": "/characters/agrona-vritra.jpg",
    "thumbnail": "/characters/thumbs/agrona-vritra.webp",
    "archetype": [
      "Dragon",
      "Control",
      "Final Boss"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "zephyr",
    "name": "Zephyr",
    "series": "Doom Breaker",
    "version": "Dragon Slayer Regressor",
    "image": "/characters/zephyr.jpg",
    "thumbnail": "/characters/thumbs/zephyr.webp",
    "archetype": [
      "Dragon",
      "Sword",
      "Regression"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "vikir",
    "name": "Vikir",
    "series": "Revenge of the Iron-Blooded Sword Hound",
    "version": "Iron-Blooded Hound",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Assassin",
      "Sword",
      "Revenge"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "cale-henituse",
    "name": "Cale Henituse",
    "series": "Trash of the Count’s Family",
    "version": "Ancient Powers",
    "image": "/characters/cale-henituse.jpg",
    "thumbnail": "/characters/thumbs/cale-henituse.webp",
    "archetype": [
      "Ancient Power",
      "Defense",
      "Strategy"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "seo-gangrim",
    "name": "Seo Gangrim",
    "series": "SSS-Class Suicide Hunter",
    "version": "Death Copy",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Copy",
      "Death",
      "Sword"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "lucas-traumen",
    "name": "Lucas Traumen",
    "series": "The Great Mage Returns",
    "version": "Nine-Star Mage",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Mage",
      "Elemental",
      "Destruction"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "desir-arman",
    "name": "Desir Arman",
    "series": "A Returner’s Magic Should Be Special",
    "version": "Magic Analyst",
    "image": "/characters/desir-arman.jpg",
    "thumbnail": "/characters/thumbs/desir-arman.webp",
    "archetype": [
      "Mage",
      "Analysis",
      "Counter"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "ijin-yu",
    "name": "Ijin Yu",
    "series": "Mercenary Enrollment",
    "version": "Teenage Mercenary",
    "image": "/characters/ijin-yu.jpg",
    "thumbnail": "/characters/thumbs/ijin-yu.webp",
    "archetype": [
      "Soldier",
      "CQC",
      "Assassin"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "teenage-mercenary-002",
    "name": "002",
    "series": "Mercenary Enrollment",
    "version": "Numbers Assassin",
    "image": "/characters/teenage-mercenary-002.jpg",
    "thumbnail": "/characters/thumbs/teenage-mercenary-002.webp",
    "archetype": [
      "Assassin",
      "Speed",
      "Tactical"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "gray-yeon-tools",
    "name": "Gray Yeon",
    "series": "Weak Hero",
    "version": "Environmental Weapons",
    "image": "/characters/gray-yeon-tools.jpg",
    "thumbnail": "/characters/thumbs/gray-yeon-tools.webp",
    "archetype": [
      "Intelligence",
      "Counter",
      "Tools"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "donald-na",
    "name": "Donald Na",
    "series": "Weak Hero",
    "version": "Union Head",
    "image": "/characters/donald-na.jpg",
    "thumbnail": "/characters/thumbs/donald-na.webp",
    "archetype": [
      "Strategy",
      "Power",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "ben-park",
    "name": "Ben Park",
    "series": "Weak Hero",
    "version": "Big Ben",
    "image": "/characters/ben-park.jpg",
    "thumbnail": "/characters/thumbs/ben-park.webp",
    "archetype": [
      "Power",
      "Durability",
      "Brawler"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "nagyuun",
    "name": "Nagyuun",
    "series": "The Ember Knight",
    "version": "False Knight",
    "image": "/characters/nagyuun.jpg",
    "thumbnail": "/characters/thumbs/nagyuun.webp",
    "archetype": [
      "Strategy",
      "Prediction",
      "Trickery"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "rania",
    "name": "Rania",
    "series": "The Ember Knight",
    "version": "Knight of Speed",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Knight",
      "Sword",
      "Speed"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "hanbin-ryu",
    "name": "Hanbin Ryu",
    "series": "Latna Saga",
    "version": "Survival Sword King",
    "image": "/characters/hanbin-ryu.jpg",
    "thumbnail": "/characters/thumbs/hanbin-ryu.webp",
    "archetype": [
      "Berserker",
      "Strength",
      "Tank"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "barolt-aura",
    "name": "Barolt",
    "series": "Latna Saga",
    "version": "Aura Sword King",
    "image": "/characters/barolt-aura.jpg",
    "thumbnail": "/characters/thumbs/barolt-aura.webp",
    "archetype": [
      "Aura",
      "Strength",
      "Warrior"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "karsia",
    "name": "Karsia",
    "series": "The Great Mage Returns",
    "version": "Archmage",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Mage",
      "Light",
      "Control"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "joo-seoh-cheon",
    "name": "Joo Seoh-Cheon",
    "series": "Volcanic Age",
    "version": "Regressed Plum Blossom",
    "image": "/characters/joo-seoh-cheon.jpg",
    "thumbnail": "/characters/thumbs/joo-seoh-cheon.webp",
    "archetype": [
      "Sword",
      "Regression",
      "Technique"
    ],
    "variantCount": 1,
    "free": false
  },
  {
    "id": "yi-zaha",
    "name": "Yi Zaha",
    "series": "Return of the Mad Demon",
    "version": "Mad Demon",
    "image": "",
    "thumbnail": "",
    "archetype": [
      "Madness",
      "Martial Arts",
      "Dark"
    ],
    "variantCount": 1,
    "free": false
  }
] satisfies PublicBuildPreview[]
