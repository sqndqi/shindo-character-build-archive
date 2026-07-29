# Character portrait sources

The app stores normalized local copies of the lead character images returned by each community wiki's MediaWiki API. Images are resized and cropped for the portrait card layout; no remote image is loaded at runtime.

These images depict copyrighted characters and artwork from their respective manhwa or adaptations. They are included for identification in this non-commercial fan archive. Copyright remains with the original creators, artists, publishers, and other rights holders. Community-wiki page text and contributions may have separate licenses; consult each linked page for its terms.

| Character | Source page | Resolved asset |
| --- | --- | --- |
| James Lee | [Wiki page](https://lookism.fandom.com/wiki/Diego_Kang) | [Direct image](https://static.wikia.nocookie.net/lookism/images/c/c1/JL555.png/revision/latest?cb=20250617071143) |
| Seongji Yuk | [Wiki page](https://lookism.fandom.com/wiki/Seongji_Yuk) | [Direct image](https://static.wikia.nocookie.net/lookism/images/e/e9/Seongji_Yook.jpeg/revision/latest/scale-to-width-down/1028?cb=20240105100557) |
| Gun Park | [Wiki page](https://lookism.fandom.com/wiki/Gun_Park) | [Direct image](https://static.wikia.nocookie.net/lookism/images/7/76/Gun_wiki_pic.png/revision/latest?cb=20251112085000) |
| Little Daniel Park | [Wiki page](https://lookism.fandom.com/wiki/Daniel_Park) | [Direct image](https://static.wikia.nocookie.net/lookism/images/4/46/OBDP.png/revision/latest?cb=20260514173251) |
| Johan Seong | [Wiki page](https://lookism.fandom.com/wiki/Johan_Seong) | [Direct image](https://static.wikia.nocookie.net/lookism/images/5/55/Johan592.png/revision/latest?cb=20260601111005) |
| Kitae Kim | [Wiki page](https://lookism.fandom.com/wiki/Kitae_Kim) | [Direct image](https://static.wikia.nocookie.net/lookism/images/f/f8/KitaeKim%28Busan%29.png/revision/latest?cb=20250313161037) |
| Goo Kim | [Wiki page](https://lookism.fandom.com/wiki/Goo_Kim) | [Direct image](https://static.wikia.nocookie.net/lookism/images/d/dd/GooBusan546.png/revision/latest?cb=20251128072138) |
| Jake Kim | [Wiki page](https://lookism.fandom.com/wiki/Jake_Kim) | [Direct image](https://static.wikia.nocookie.net/lookism/images/d/d7/JK573.png/revision/latest?cb=20250918142511) |
| Eli Jang | [Wiki page](https://lookism.fandom.com/wiki/Eli_Jang) | [Direct image](https://static.wikia.nocookie.net/lookism/images/e/ea/Eli_Jang_%28Year_3%29.jpg/revision/latest?cb=20241128145719) |
| Zack Lee | [Wiki page](https://lookism.fandom.com/wiki/Zack_Lee) | [Direct image](https://static.wikia.nocookie.net/lookism/images/a/a1/ZL590.png/revision/latest?cb=20250619142007) |
| Jin Mori | [Wiki page](https://godofhighschool.fandom.com/wiki/Jin_Mori) | [Direct image](https://static.wikia.nocookie.net/godofhighschool/images/e/eb/G.O.H._Epilogue_Jin_Mori.png/revision/latest?cb=20221125115700) |
| Han Daewi | [Wiki page](https://godofhighschool.fandom.com/wiki/Han_Daewi) | [Direct image](https://static.wikia.nocookie.net/godofhighschool/images/1/1d/2019-03-16_%282%29.png/revision/latest?cb=20190316052234) |
| Sung Jinwoo | [Wiki page](https://solo-leveling.fandom.com/wiki/Sung_Jinwoo) | [Direct image](https://static.wikia.nocookie.net/solo-leveling/images/8/8b/Jinwoo4.jpg/revision/latest?cb=20250411080707) |
| Cheon Yeo-Woon | [Wiki page](https://nano-mashine.fandom.com/wiki/Cheon_Yeo_Woon) | [Direct image](https://static.wikia.nocookie.net/nano-mashine/images/d/d0/Cheon_Yeo_Woon.jpg/revision/latest/scale-to-width-down/623?cb=20230309231934) |
| Jin Mu-Won | [Wiki page](https://legend-of-the-northern-blade.fandom.com/wiki/Jin_Mu-Won) | [Direct image](https://static.wikia.nocookie.net/legend-of-the-northern-blade/images/d/d9/Jin_Mu-Won_Jeokam_2.jpg/revision/latest?cb=20221206190031) |
| Kayden Break | [Wiki page](https://eleceed.fandom.com/wiki/Kayden) | [Direct image](https://static.wikia.nocookie.net/eleceed/images/8/84/Kayden_Ep._384.png/revision/latest?cb=20260505015946) |
| Yu | [Wiki page](https://the-boxer.fandom.com/wiki/Yu) | [Direct image](https://static.wikia.nocookie.net/the_boxer/images/1/1c/Screenshot_13.png/revision/latest?cb=20230201054811) |
| Barolt | [Wiki page](https://survival-story-of-a-sword-king-in-a-fantasy-world.fandom.com/wiki/Barolt) | [Direct image](https://static.wikia.nocookie.net/survival-story-of-a-sword-king-in-a-fantasy-world/images/f/f6/Barolt_now.jpg/revision/latest?cb=20220703005029) |
| Arthur Leywin | [Wiki page](https://tbate.fandom.com/wiki/Arthur_Leywin) | [Direct image](https://static.wikia.nocookie.net/thebate/images/3/35/Arthur_Vol_10.png/revision/latest?cb=20250318204554) |
| Gray Yeon | [Wiki page](https://weakhero.fandom.com/wiki/Gray_Yeon) | [Direct image](https://static.wikia.nocookie.net/weakhero/images/6/6b/Yeon_Gray.jpg/revision/latest?cb=20201226154849) |

## Refreshing the local files

Run `npm run sync:portraits`. The script resolves the current lead image from each source page, writes a 700×920 JPEG to `public/characters/`, and regenerates this manifest.
