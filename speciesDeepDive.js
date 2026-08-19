(() => {
  "use strict";
  // Deeper, researched layer for each of the 24 species we have authentic NYC Parks
  // leaf art for. Community mode shows the full version; Kids mode shows kidVersion,
  // a distilled parent-and-kid-readable paragraph in the same tree-voice as the
  // existing short "kid" line in speciesProfiles.
  const DEEP = {
    "london planetree": {
      origin: "A hybrid between the American sycamore and the Oriental planetree, first grown in Europe in the 1600s — possibly an accident of two trees planted near each other in a garden.",
      seasons: { spring: "large maple-like leaves unfurl; ball-shaped flower clusters appear", summer: "broad, deeply lobed leaves give heavy shade", fall: "leaves turn golden-brown and drop late", winter: "bare branches show off the patchwork bark and dangling seed balls" },
      features: "Bark exfoliates in irregular puzzle-piece patches of cream, olive, and gray, exposing smooth new bark underneath — this is the single easiest way to identify it at any time of year.",
      facts: ["One of the most-planted street trees on Earth because it tolerates compacted soil, drought, and air pollution better than almost any other large shade tree.", "The seed balls that dangle in winter can persist on the tree for months, slowly breaking apart to release fuzzy seeds."],
      kidVersion: "I'm a mix of two different sycamore trees from two different continents! My bark peels off in patches because I grow faster than my bark can stretch — that's why I look like I'm wearing camouflage."
    },
    "honeylocust": {
      origin: "Native to the central United States, especially the Mississippi and Ohio river valleys, where it once grew alongside now-extinct giant ground sloths that ate its seed pods.",
      seasons: { spring: "tiny compound leaflets emerge late, giving a soft green haze", summer: "fine, feathery foliage lets dappled light through", fall: "leaves turn clear yellow and drop quickly, all at once", winter: "bare, airy branching; old seed pods may still hang on" },
      features: "Almost all street honeylocusts are thornless cultivars — the wild species has vicious branched thorns that once deterred giant Ice Age herbivores from stripping its bark.",
      facts: ["Its long, twisting seed pods contain a sweet, edible pulp — the name \"honey\" locust refers to that pulp, not to bees.", "Because its leaves are so finely divided, honeylocust casts light, dappled shade — grass and other plants often grow well underneath it, unlike under denser shade trees."],
      kidVersion: "My real wild cousins have giant branching thorns — scientists think they grew to scare off huge animals that lived thousands of years ago! The trees planted on your street are a gentler, thornless kind."
    },
    "pin oak": {
      origin: "Native to the eastern and central United States, especially in low, poorly drained soils near rivers and floodplains.",
      seasons: { spring: "reddish new leaves unfold with the flowers", summer: "glossy, deeply cut leaves form a dense pyramid-shaped crown", fall: "leaves turn bronze-red and often stay on the tree into winter", winter: "distinctive drooping lower branches and small round acorns" },
      features: "Its branching pattern is a giveaway: upper branches point up, middle branches stick out level, and lower branches often droop toward the ground — a three-tiered silhouette visible from a block away.",
      facts: ["One of the fastest-growing oaks, which is why it became such a popular street and park tree in the 20th century.", "Like other red oaks, its acorns take two full years to mature on the branch before falling."],
      kidVersion: "You can spot me from far away — my branches point up at the top, straight out in the middle, and droop down near the bottom, like three different trees stacked together!"
    },
    "ginkgo": {
      origin: "Native to a small region of southeastern China; wild ginkgo populations are so rare that the species survived mainly because it was cultivated in temple gardens for over 1,000 years.",
      seasons: { spring: "fan-shaped leaves unfurl bright green", summer: "leathery green leaves resist insects and disease almost completely", fall: "leaves turn a uniform brilliant gold and can drop within a single day or two", winter: "distinctive short, knobby spur twigs stand out on bare branches" },
      features: "Ginkgo has no close living relatives at all — it's the last surviving member of an entire ancient plant lineage that otherwise died out over 200 million years ago, making it one of the closest things to a living dinosaur-era plant you can touch.",
      facts: ["Female ginkgo trees produce seeds with a pulp that smells strongly unpleasant when it falls and is stepped on — nearly all city street ginkgos are male trees to avoid this.", "Ginkgos are famously tough: several trees within a mile of the 1945 Hiroshima bombing survived and are still alive today."],
      kidVersion: "I'm basically a living fossil! Trees almost exactly like me grew on Earth back when dinosaurs were still around, over 200 million years ago. No other tree has a leaf shaped quite like my fan."
    },
    "japanese zelkova": {
      origin: "Native to Japan, Taiwan, and parts of eastern China, often planted as a substitute for American elm because of its similar vase-shaped crown.",
      seasons: { spring: "small toothed leaves emerge along arching branches", summer: "dense, rounded-vase crown provides even shade", fall: "leaves turn yellow, orange, or reddish-bronze", winter: "gray bark with small horizontal lenticel marks is visible on bare branches" },
      features: "Its vase-shaped, upward-arching branch structure closely echoes the American elm's classic silhouette, which is exactly why cities began planting it widely after Dutch elm disease killed so many elms.",
      facts: ["Zelkova is in the elm family but is naturally resistant to Dutch elm disease, making it a reliable replacement species.", "In Japan, old zelkova trees are traditionally planted near shrines and are sometimes considered sacred."],
      kidVersion: "Cities started planting a lot of me after a disease hurt many elm trees — my branches arch up and out in a cup shape just like theirs did, but I don't catch the same sickness."
    },
    "norway maple": {
      origin: "Native to continental Europe and western Asia; brought to North America in the 1750s by botanist John Bartram and later planted extensively as a street tree.",
      seasons: { spring: "small yellow-green flower clusters bloom before the leaves fully open", summer: "dense, geometric five-lobed leaves create heavy, dark shade", fall: "leaves turn yellow, often later than native maples", winter: "sharp, pointed end buds are visible on gray twigs" },
      features: "Snap a leaf stem and look for a drop of milky white sap — this is one of the few reliable ways to distinguish Norway maple from native maples at a glance, alongside its wide, dense crown.",
      facts: ["It's now considered invasive in many parts of the northeastern US and Canada because its dense shade and heavy seed production can crowd out native forest seedlings.", "Its seeds are paired \"samaras\" set at a wide, nearly flat angle — a useful ID trait compared to the narrower angle of sugar maple seeds."],
      kidVersion: "If you gently snap my leaf stem, you might see a tiny drop of milky sap — that's one of my secret clues! I came from Europe a long time ago and now grow in cities all over America."
    },
    "callery pear": {
      origin: "Native to China and Vietnam; introduced to the US in 1917 by plant explorer Frank Meyer as rootstock to help fight a disease affecting European pear orchards.",
      seasons: { spring: "covered in clouds of white five-petaled flowers before leaves emerge", summer: "glossy, rounded leaves with wavy edges", fall: "leaves turn deep red-purple, often the last tree on the block to change color", winter: "tight, narrow branching pattern (in the 'Bradford' cultivar especially)" },
      features: "Its synchronized, all-at-once white spring bloom — often before any leaves appear — makes it one of the most visually striking street trees for about a week each April.",
      facts: ["The popular 'Bradford' cultivar was bred to be sterile, but when different callery pear cultivars grow near each other they can cross-pollinate and produce fertile seeds, which is why it's now considered invasive in parts of the eastern US.", "Despite the pretty flowers, they're known for smelling unpleasant — often compared to fish."],
      kidVersion: "In spring I burst into hundreds of white flowers all at once, almost overnight! Take a sniff, though — I don't smell as sweet as I look."
    },
    "littleleaf linden": {
      origin: "Native to Europe and western Asia, long planted along grand boulevards — Berlin's famous street \"Unter den Linden\" is named after this tree.",
      seasons: { spring: "small, uneven heart-shaped leaves emerge on a neat pyramidal crown", summer: "fragrant pale yellow flower clusters bloom in late June, buzzing with bees", fall: "leaves turn a soft yellow", winter: "small, round winter buds and pale seed-carrying wings may still hang on" },
      features: "The fruit hangs from a pale, papery bract that acts like a wing, letting the wind spin the whole cluster away from the parent tree — look up in late summer to spot them.",
      facts: ["Its flowers are one of the most important late-season nectar sources for city bees, and linden honey is prized for its distinct minty-floral flavor.", "European lindens have been planted as shade and ceremonial trees for over 500 years — many European town squares are still centered on one."],
      kidVersion: "In summer, follow your nose — my flowers smell sweet and bees love them! My leaves look like tiny, lopsided hearts."
    },
    "red maple": {
      origin: "Native to nearly the entire eastern half of North America, from Newfoundland to Florida — one of the most widely distributed trees on the continent.",
      seasons: { spring: "small red flowers bloom very early, often before other trees wake up", summer: "three-to-five-lobed green leaves", fall: "often the first tree on the block to turn — brilliant scarlet, orange, or yellow", winter: "reddish twigs and buds are visible even in the coldest months" },
      features: "True to its name, red maple shows red in nearly every season: red flowers in earliest spring, reddish leaf stalks in summer, red fall color, and red twigs in winter.",
      facts: ["Its paired winged seeds (samaras) spin like tiny helicopters and are one of the fastest-germinating tree seeds — some sprout within days of falling.", "Because it tolerates both wet and dry soils better than most maples, it's one of the most adaptable native trees planted in cities."],
      kidVersion: "I might be the most \"red\" tree around — red flowers in spring, red leaf stems in summer, and often the very first bright red leaves of fall. Watch for my seeds spinning down like little helicopters!"
    },
    "green ash": {
      origin: "Native to central and eastern North America, especially along rivers and floodplains, once one of the most commonly planted street trees in the US.",
      seasons: { spring: "compound leaves emerge in opposite pairs along the stem", summer: "leaflets give a soft, feathery green canopy", fall: "leaves turn yellow", winter: "distinct diamond-patterned bark ridges are visible on older trunks" },
      features: "Ash leaves and branches always grow in exact opposite pairs, not staggered — a quick and reliable way to rule in or rule out ash on any city block.",
      facts: ["Green ash populations have been devastated across North America since 2002 by the emerald ash borer, an invasive beetle accidentally introduced from Asia in shipping material.", "Because so many street ashes have died, many cities now avoid replanting ash at all to prevent repeating a single-species vulnerability."],
      kidVersion: "Check my branches — my leaves always grow in matching pairs across from each other, never staggered! Many of my ash cousins have gotten sick from a tiny invasive beetle, so scientists are working hard to protect the ones still here."
    },
    "silver maple": {
      origin: "Native to eastern North America, especially along rivers and floodplains, where its fast growth and flood tolerance make it well-suited to unstable soil.",
      seasons: { spring: "small red-tinged flowers bloom very early, among the first blooms of the year", summer: "deeply cut leaves flash silver-white undersides in the wind", fall: "pale yellow color, often less vivid than red maple", winter: "long, drooping branch tips with narrow, pointed buds" },
      features: "Its leaves are the most deeply lobed of the common street maples, cut almost to the midrib, and the pale undersides create a shimmering, two-toned effect whenever wind moves through the canopy.",
      facts: ["It's one of the fastest-growing large trees in North America, but that speed comes with weaker, more storm-prone wood than slower-growing maples.", "Its winged seeds are the largest of any North American maple, sometimes over two inches long."],
      kidVersion: "Wait for a windy day and watch my leaves flip — the undersides are silvery-white! I grow faster than almost any other big tree."
    },
    "cherry": {
      origin: "New York's street cherries are mostly cultivated ornamental varieties bred from Japanese and Asian wild cherry species, popularized worldwide after Japan gifted flowering cherries to Washington, D.C. in 1912.",
      seasons: { spring: "clouds of pink or white blossoms, often before leaves fully open", summer: "oval, toothed green leaves", fall: "leaves can turn orange to bronze", winter: "smooth bark with distinct horizontal lenticel lines is easy to spot" },
      features: "Look for horizontal dashes across smooth, reddish-brown bark — these lenticels (breathing pores) are one of the clearest identifying marks across almost all ornamental cherry varieties.",
      facts: ["Many ornamental street cherries are sterile or produce very little fruit, since they were bred for flowers rather than fruit production.", "Cherry blossom festivals, like the famous ones in Washington D.C. and Japan, celebrate blooms that typically last only about one to two weeks."],
      kidVersion: "In spring I might be covered in pink or white flowers almost overnight! Check my smooth bark for tiny horizontal dashes — that's how I breathe."
    },
    "northern red oak": {
      origin: "Native to eastern North America; one of the most commercially important hardwood trees on the continent and the state tree of New Jersey.",
      seasons: { spring: "reddish new leaves emerge alongside small yellow-green flower clusters", summer: "large, pointed-lobe leaves form a broad, rounded crown", fall: "leaves turn deep red to reddish-brown", winter: "thick, dark ridged bark with lighter streaks is visible on the trunk" },
      features: "Its leaf lobes end in sharp bristle-tips rather than rounded points — a defining trait of the entire \"red oak group,\" distinct from the rounded lobes of white oaks like swamp white oak.",
      facts: ["Its acorns are an important fall food source for squirrels, blue jays, deer, and wild turkeys — a single mature oak can produce thousands in a good year.", "It's one of the fastest-growing oaks and can live well over 200 years."],
      kidVersion: "My leaves have pointy, spiky tips — that's how you know I'm in the \"red oak\" family. Look under me in fall for acorns wearing tiny berets!"
    },
    "sophora": {
      origin: "Native to China and Korea, historically planted near temples and palaces; sometimes reclassified in scientific literature under the name Styphnolobium japonicum.",
      seasons: { spring: "compound leaves with smooth-edged leaflets emerge on green young twigs", summer: "creamy-white flower clusters bloom in late summer, unusually late for a street tree", fall: "leaves turn pale yellow", winter: "young twigs often stay noticeably green even in winter" },
      features: "It's one of the few street trees that flowers in August, when almost nothing else nearby is blooming — a useful clue for identifying it from a distance.",
      facts: ["Despite its common name \"Japanese pagoda tree,\" it's native to China, not Japan — it was simply introduced to Europe through Japanese trade ports.", "Its late-summer flowers are an important nectar source for bees when many spring bloomers have already finished."],
      kidVersion: "I bloom in late summer, when almost no other tree is flowering — that means the bees have me all to themselves! Look for my twigs; the young ones stay green."
    },
    "sweetgum": {
      origin: "Native to the southeastern and south-central United States, as well as parts of Mexico and Central America.",
      seasons: { spring: "star-shaped leaves emerge glossy green", summer: "deep green, star-shaped leaves and small round flower clusters", fall: "spectacular multicolor display — yellow, orange, red, and purple often on the same tree at once", winter: "spiky, round seed balls persist on bare branches for months" },
      features: "Its star-shaped leaves with five to seven pointed lobes are unmistakable, and the spiky, golf-ball-sized seed pods that litter the ground beneath it in winter are just as distinctive.",
      facts: ["Its fall color display is considered one of the most dramatic of any North American tree, because several different pigments break down at different rates in the same leaf.", "The name \"sweetgum\" comes from the fragrant resin the tree produces, historically chewed like gum and used in traditional medicine."],
      kidVersion: "My leaf is shaped like a star! In fall I can show yellow, orange, red, and purple all at the same time. Watch your step under me in winter — I drop spiky seed balls."
    },
    "american linden": {
      origin: "Native to eastern and central North America, also called American basswood; historically an important tree for Indigenous communities, who used its fibrous inner bark for cordage and its soft wood for carving.",
      seasons: { spring: "large, uneven heart-shaped leaves unfold on a dense, pyramidal crown", summer: "fragrant pale yellow flower clusters draw heavy bee activity in early summer", fall: "leaves turn a soft yellow", winter: "distinct asymmetrical leaf-bud shape is visible on bare twigs" },
      features: "Its leaves are the largest of the linden species commonly planted in cities, often four to six inches long, with a lopsided heart-shaped base that's easy to feel with your fingers.",
      facts: ["Its soft, light wood has long been favored by woodcarvers for detailed work because it carves cleanly along the grain.", "Basswood honey, made from its flowers, is prized by beekeepers for its light color and minty-floral taste."],
      kidVersion: "My leaves are some of the biggest lopsided hearts you'll find! In summer, smell my sweet flowers — bees definitely will."
    },
    "crimson king maple": {
      origin: "A cultivated variety of Norway maple first discovered as a chance red-leaved seedling around 1937 at a nursery in Limburg, Belgium, then introduced to the United States in the late 1940s.",
      seasons: { spring: "deep purple leaves unfurl, already colored from the very start of the season", summer: "foliage stays dark maroon-purple all season instead of turning green", fall: "color can deepen to an even darker purple-black before dropping", winter: "sharp-pointed buds on gray twigs, same structure as ordinary Norway maple" },
      features: "Unlike most trees, its purple color isn't a fall event — the leaves are purple from the moment they open in spring and stay that way all summer, making it easy to spot from blocks away.",
      facts: ["It was one of the earliest patented ornamental street trees in the US nursery trade, heavily promoted after its 1940s introduction.", "Its dark color comes from high levels of anthocyanin pigments that are normally only made in autumn in most trees — this cultivar makes them all year."],
      kidVersion: "I don't wait for fall to turn purple — my leaves come out purple in spring and stay that color all summer long! Grown-ups picked me out because of my unusual color."
    },
    "american elm": {
      origin: "Native to eastern North America; once the single most-planted street tree in the United States, forming iconic tree-lined \"elm tunnels\" over countless American streets before the mid-20th century.",
      seasons: { spring: "small red-green flowers bloom before leaves, followed by flat, round seed disks", summer: "large, toothed, lopsided leaves form the tree's signature arching vase shape", fall: "leaves turn bright yellow", winter: "the tall, arching, wineglass-shaped silhouette is most visible with leaves gone" },
      features: "Fold a leaf in half at its base — the two sides won't line up, because American elm leaves have distinctly uneven bases, a reliable ID trait year-round.",
      facts: ["Dutch elm disease, a fungus spread by bark beetles, killed the majority of America's mature street elms between the 1930s and 1980s, changing the look of American streets forever.", "A small number of naturally disease-tolerant elms survived and have since been used to breed newer, more resistant elm cultivars now being replanted in some cities."],
      kidVersion: "Fold one of my leaves in half at the stem — the two sides don't match! Long ago, trees like me covered whole streets like a green tunnel; a sickness hurt many of us, but some of my relatives are tougher and are being replanted today."
    },
    "silver linden": {
      origin: "Native to southeastern Europe and western Asia, valued as a street tree partly because it tolerates heat, drought, and urban pollution better than other lindens.",
      seasons: { spring: "heart-shaped leaves unfold with silvery-white undersides visible from the start", summer: "fragrant flowers bloom slightly later in summer than other lindens", fall: "leaves turn yellow", winter: "smooth gray bark and rounded crown are visible on bare branches" },
      features: "Every leaf has a felted, silvery-white underside caused by dense microscopic hairs — flip one over on a still day to see the contrast against the dark green top.",
      facts: ["It tends to bloom later in the summer than other linden species, extending the nectar season for city bees.", "Its silvery undersides make the whole canopy shimmer distinctly in wind, a trait beekeepers and gardeners have prized it for since it was first introduced to Western Europe in the 1700s."],
      kidVersion: "Flip one of my leaves over — the underside is silvery white and soft, like felt! When the wind blows, my whole canopy seems to shimmer."
    },
    "purple leaf plum": {
      origin: "Native to southeastern Europe and western Asia (the wild species is Prunus cerasifera); purple-leaved ornamental varieties were selectively bred and became popular street and yard trees in the 20th century.",
      seasons: { spring: "pale pink flowers bloom before or alongside the emerging purple leaves", summer: "deep purple-red foliage stands out against green neighboring trees", fall: "color deepens slightly before leaves drop, without a big color change", winter: "smooth bark with lenticel dashes on a compact, rounded form" },
      features: "Like Crimson King maple, its purple color is present all season rather than just in fall — a useful way to distinguish it from ordinary green-leaved cherry or plum trees at a glance.",
      facts: ["It's a compact, small-statured tree, which made it a popular choice for smaller city tree pits and yards where a large shade tree wouldn't fit.", "Its spring flowers, which open before most of the purple leaves, briefly turn the whole tree a soft pink before the leaf color takes over."],
      kidVersion: "My leaves are purple all spring and summer, not just in fall! Right before my leaves come out, I might be covered in soft pink flowers."
    },
    "schubert cherry": {
      origin: "Discovered growing wild along the Missouri River near Bismarck, North Dakota, and introduced as a cultivated variety by the Oscar H. Will Company nursery in 1943.",
      seasons: { spring: "small white flower clusters bloom while leaves are still green", summer: "leaves gradually shift from green to reddish-purple as the season goes on", fall: "leaves stay deep purple until they drop", winter: "smooth bark with lenticel dashes, similar to other ornamental cherries" },
      features: "It's one of the only street trees where a single tree can show both green and purple leaves at the same time, because new leaves emerge green and only turn purple as they mature through the season.",
      facts: ["It was found growing wild by a nurseryman named Schubert, which is where the name comes from — not a place or a person it was named after after the fact.", "Because it was selected from a naturally cold-hardy wild population, it tolerates much colder winters than many other ornamental cherries."],
      kidVersion: "Look closely — I might have both green and purple leaves on me at the same time! My new leaves start out green and slowly turn purple as summer goes on."
    },
    "japanese treelilac": {
      origin: "Native to Japan, Korea, and parts of northern China; despite its common name, it's more closely related to olive trees than to common lilac shrubs.",
      seasons: { spring: "smooth, pointed leaves emerge on a small, tidy crown", summer: "large clusters of creamy white flowers bloom in early summer, later than most lilac shrubs", fall: "leaves turn an unremarkable yellow-green", winter: "smooth, cherry-like bark with horizontal lenticels stands out on bare branches" },
      features: "It's the only true tree-sized member of the lilac group commonly planted on city streets — most other lilacs are large shrubs, not trees, which is what makes this one useful as a small street tree.",
      facts: ["Its flowers bloom later in early summer than shrub lilacs, extending the lilac-flowering season by several weeks in a city planted with both.", "Its smooth bark with horizontal lenticels closely resembles cherry tree bark, which is a common source of misidentification."],
      kidVersion: "I'm part of the lilac family, but I grow as a real tree instead of a bush! Smell my creamy white flowers in early summer — they bloom later than other lilacs."
    },
    "chinese elm": {
      origin: "Native to China, Korea, Japan, and Vietnam; introduced to the US in the early 1900s and increasingly planted as a naturally disease-resistant substitute after American elm losses.",
      seasons: { spring: "small, glossy toothed leaves emerge early", summer: "fine-textured, dense canopy of small leaves", fall: "leaves can turn yellow to reddish-purple, and it often holds leaves later than other elms", winter: "distinctive mottled, exfoliating bark is most visible on bare trunks" },
      features: "Its bark peels away in irregular patches of gray, green, orange, and brown, creating a mottled, camouflage-like pattern — a completely different look from the deeply furrowed bark of American elm.",
      facts: ["Unlike American elm, it's naturally resistant to Dutch elm disease, which is why it's become one of the most common elm replacements in cities.", "It's sometimes confused with Siberian elm, a less desirable, weaker-wooded species — the puzzle-piece bark pattern is the easiest way to tell true Chinese elm apart."],
      kidVersion: "My bark looks like a puzzle of gray, tan, and orange patches! I'm related to the American elm, but I don't get sick as easily."
    },
    "swamp white oak": {
      origin: "Native to the eastern and midwestern United States and southeastern Canada, especially in wet bottomlands, floodplains, and low-lying areas near rivers.",
      seasons: { spring: "leaves emerge with a fuzzy, silvery underside still visible", summer: "leaves are dark green on top with a pale, soft underside", fall: "leaves turn yellow-brown to russet, often later than other oaks", winter: "flaky, papery gray-brown bark separates it from other oaks" },
      features: "Turn a leaf over — the pale, softly fuzzy underside contrasts sharply with the dark green top, a trait most other street oaks don't share.",
      facts: ["It tolerates wet, poorly drained, low-oxygen soil better than almost any other oak, which is why cities increasingly plant it in stormwater tree pits and rain gardens.", "Its acorns mature in a single year (unlike red oak's two years) and are an important food source for wood ducks and other wetland wildlife."],
      kidVersion: "Turn one of my leaves over — the underside is soft and a little fuzzy! I like wet soil more than most trees, so you might find me near low, damp spots."
    }
  };

  const GENERIC_DEEP = {
    origin: "This tree's exact origin isn't in our records yet — every species has a story about where it naturally grows and how it ended up on a city street.",
    seasons: { spring: "new leaves and possibly flowers appear", summer: "full leaf canopy provides shade", fall: "leaf color changes before they drop", winter: "bark, branching pattern, and buds become the easiest way to identify it" },
    features: "Look closely at the leaf shape, bark texture, and branching pattern — those three clues identify almost any tree.",
    facts: ["Every street tree is part of a city's living infrastructure, filtering air, managing stormwater, and cooling the sidewalk.", "Trees you can't immediately identify are often the most interesting ones to document and learn about."],
    kidVersion: "I'm still a mystery tree! Look closely at my leaves and bark — what clues can you find to help figure out what kind of tree I am?"
  };

  function forSpecies(common) {
    const key = String(common || "").toLowerCase();
    return DEEP[key] || GENERIC_DEEP;
  }

  window.TREEWALK_DEEPDIVE = { forSpecies };
})();
