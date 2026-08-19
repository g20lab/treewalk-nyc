(() => {
  "use strict";
  // Original, age-banded STEAM content spanning K–12, grounded in real botany,
  // ecology, and art technique for each species already in speciesProfiles.
  // The science strand (k2/g35/g68/g912) is scaffolded the way Project Learning
  // Tree's place-based model works (observe a real tree, connect it to real
  // science) and progresses in rigor toward Next Generation Science Standards
  // (NGSS) high-school life-science and ecosystems expectations — written fresh
  // rather than reproducing PLT's own activities.
  // The art strand is banded the same way and progresses toward the National
  // Core Arts Standards (Visual Arts) Creating and Responding anchor standards,
  // from simple sensory activities in K–2 to technique- and research-grounded
  // work in 9–12 — free arts-integrated content for classrooms where arts
  // programming is often underfunded, so the "A" in STEAM is substantive here,
  // not cosmetic.
  const BANDS = [
    { id: "k2", label: "K–2" },
    { id: "g35", label: "3–5" },
    { id: "g68", label: "6–8" },
    { id: "g912", label: "9–12" }
  ];

  const SPECIES = {
    "london planetree": {
      k2: "Bark peek-a-boo: trees shed old bark like you outgrow old shoes. Count how many colors of bark you can find.",
      g35: "Bark can't stretch as fast as the trunk grows underneath, so London planetree sheds it in patches instead. Measure how big one peeling patch is.",
      g68: "Concept: bark physiology. The trunk widens via a growth layer called the cambium; inflexible bark cracks and sheds to keep up — which also helps shed pollution particles. Why might shedding bark help a tree survive in a polluted city?",
      g912: "Concept: phytoremediation and particulate capture. City trees intercept airborne particulates on leaf and bark surfaces; measure this tree's trunk circumference and estimate canopy area, then research how canopy size correlates with pollution-interception capacity in urban forestry studies.",
      art: {
        k2: "Rub a crayon over paper on the bark to catch its patchwork colors. Count the colors you find.",
        g35: "Do a bark rubbing with paper and the side of a crayon — the patchy colors show up like a painting. Which colors did you find?",
        g68: "Make a bark-rubbing collage using at least 4 different patches, then arrange them like camouflage — sketch how the pattern might help the tree blend into a stormy sky or a brick wall.",
        g912: "Sketch a cross-section of one peeling bark patch like a geologist logging rock strata — layer by layer, oldest to newest — then research which bark layer is actively alive and label it."
      }
    },
    "honeylocust": {
      k2: "Count the tiny leaflets on one leaf, like counting candies in a row.",
      g35: "A honeylocust's \"leaf\" is really many small leaflets — that's a compound leaf. Count leaflets on 3 different leaves and compare.",
      g68: "Concept: compound leaves and water loss. Honeylocust's finely divided leaves reduce wind and water stress. Its dry seed pods twist as they lose water unevenly — the same physics as a wooden ruler warping when only one side dries out.",
      g912: "Concept: biomechanics of seed dispersal and coevolution. The pod's helical warping stores mechanical energy from uneven moisture loss; researchers also think this species' huge thorns and tough pods evolved as defenses against now-extinct Ice Age megafauna. Research this hypothesis and explain why a tree might still carry defenses against animals that no longer exist.",
      art: {
        k2: "Count the tiny leaflets in a row, then draw the same number of dots in a row.",
        g35: "Draw the pattern of tiny leaflets along one leaf, then invent your own repeating pattern using the same idea — lots of small shapes making one big shape.",
        g68: "Design a fabric or wallpaper pattern based on the leaflet's repeating rhythm — use at least two colors and a consistent repeat unit.",
        g912: "Study the seed pod's twisting curve as a natural helix — sketch it using directional cross-hatching to show the twist, then research torsion in dried plant fiber and why uneven drying causes the spiral."
      }
    },
    "pin oak": {
      k2: "Leaf shape hunt: does it look pointy, almost like a star?",
      g35: "Pin oaks are named for their thin, pin-like twigs. Their acorns feed squirrels and blue jays — look for a cap on the ground.",
      g68: "Concept: masting. Oaks produce huge acorn crops some years and very few in others, overwhelming seed-eating animals so more acorns survive to sprout. Why might \"boom and bust\" years help the tree more than steady yearly output?",
      g912: "Concept: masting economics and predator satiation. If a fixed local squirrel population can only eat a limited number of acorns per season, model how a boom year increases the fraction of acorns that survive to germinate compared to steady yearly output — the same math behind predator-satiation strategies in insects and fish.",
      art: {
        k2: "Trace a leaf's pointy edges with your finger, then draw the same points on paper.",
        g35: "Trace a leaf's pointy outline, then color it three different ways to show spring green, summer green, and fall red.",
        g68: "Create a 3-panel seasonal color study of the same leaf shape — spring, summer, fall — and write one word under each panel describing the mood of that color.",
        g912: "Produce a botanical illustration of the leaf using graphite cross-hatching to show lobe depth and vein structure, following field-guide illustration conventions (include a scale bar)."
      }
    },
    "ginkgo": {
      k2: "No other leaf looks like this fan — compare it to a real paper fan.",
      g35: "Ginkgo trees are \"living fossils\" — nearly identical trees grew alongside dinosaurs over 200 million years ago.",
      g68: "Concept: living fossils and dioecy. Ginkgo has no close living relatives and comes in separate male and female trees; female trees make smelly seeds, so cities usually plant only males. Why would a city deliberately plant just one sex of a species?",
      g912: "Concept: evolutionary conservatism and clonal propagation. Ginkgo's genome has changed remarkably little in 200 million years; research why cities plant only male cultivars propagated by grafted clones, and evaluate the tradeoff between preserving genetic diversity and minimizing maintenance in urban tree selection.",
      art: {
        k2: "Fold a paper fan shape like the leaf, then color it yellow-gold.",
        g35: "Fold paper into a fan shape like a ginkgo leaf, then paint it gold — the color ginkgo trees turn in autumn.",
        g68: "Research one plant or animal alive during the dinosaur era, then illustrate the ginkgo leaf next to a simple timeline showing how old this leaf shape really is.",
        g912: "Create a botanical print using a real fallen leaf, ink, and paper, capturing the leaf's parallel vein pattern — a venation style rare in modern trees but common in ancient plants."
      }
    },
    "japanese zelkova": {
      k2: "Step back and look up — does the tree's shape remind you of a cup?",
      g35: "Zelkova trunks have tiny horizontal lines called lenticels — small pores the tree uses to breathe.",
      g68: "Concept: lenticels are gas-exchange structures in bark. Zelkova's vase-shaped crown is also a light-competition strategy for trees planted close together along streets.",
      g912: "Concept: crown architecture as a light-competition strategy. Measure the tree's diameter at breast height (DBH) and estimate age using a species growth-factor formula, then compare its growth rate to a same-age tree with a different crown shape and explain how vase-shaped branching reduces self-shading among crowded street trees.",
      art: {
        k2: "Look up at the branches and draw their shape with one continuous line.",
        g35: "Sketch just the outline of the tree's branches against the sky, no leaves — vase-shaped branches make a great line drawing.",
        g68: "Sketch the tree's vase-shaped silhouette, then compare it to a nearby tree's silhouette — label which shape captures more sunlight and why.",
        g912: "Produce a contour-line study of the branching structure, marking each major fork, then measure the branching angle at two forks with a protractor and note whether it stays consistent."
      }
    },
    "norway maple": {
      k2: "Check if the leaf looks like a hand with pointy fingers.",
      g35: "Snap a leaf stem gently — a grown-up can check for a drop of milky sap, one way to tell this maple apart from others.",
      g68: "Concept: opposite vs. alternate branching. Most trees branch in a zigzag (alternate); maples, ashes, and a few others branch in exact pairs (opposite) — a real field-ID shortcut arborists use (mnemonic: MAD Horse — Maple, Ash, Dogwood, Horsechestnut).",
      g912: "Concept: invasive competitive advantage via phenology. Norway maple leafs out earlier and holds leaves later than many native trees, extending its photosynthetic season; design a simple field study comparing leaf-out dates between this tree and a native oak on the same block over several weeks.",
      art: {
        k2: "Trace your own hand next to a leaf — count the fingers and points on each.",
        g35: "Trace around a fallen leaf, then color each of its five points a different color, like a pinwheel.",
        g68: "Create a leaf-shape stencil and use it to make a repeated print pattern, alternating colors to echo the plant's opposite-branching rhythm.",
        g912: "Do a comparative botanical sketch of Norway maple next to a native maple leaf, annotating differences in lobe shape and sinus depth using precise line work."
      }
    },
    "callery pear": {
      k2: "Look for a shiny leaf shaped like a teardrop.",
      g35: "In spring, callery pears burst into white flowers all at once — that attracts every nearby pollinator on the same days.",
      g68: "Concept: mass flowering as pollinator strategy — and unintended consequences. Different callery pear cultivars can cross-pollinate into fertile, spreading offspring, which is why this once-popular street tree is now considered invasive in parts of the US.",
      g912: "Concept: cultivar cross-pollination and ecological invasiveness. Callery pear cultivars were bred to be individually sterile, but different cultivars planted near each other cross-pollinate into fertile, weedy offspring; research why this makes the species a case study in unintended consequences in ornamental horticulture, and propose a native tree that could responsibly replace it.",
      art: {
        k2: "Draw a teardrop shape, then add dots all around it for flowers.",
        g35: "In spring, sketch the tree covered in flowers using only small dots — hundreds of white dots for hundreds of small blossoms.",
        g68: "Create a pointillist-style painting of the tree in bloom using only dabs of white and cream paint — no lines.",
        g912: "Research Georges Seurat's pointillism technique, then apply it to a study of this tree's mass-flowering display, using color theory to explain how dots of paint blend optically at a distance, the way individual blossoms blend into a cloud of white from afar."
      }
    },
    "littleleaf linden": {
      k2: "Find a leaf shaped like a lopsided heart.",
      g35: "Linden flowers smell sweet and draw bees on warm days — follow your nose before you find the tree.",
      g68: "Concept: dual dispersal. A pale bract \"wing\" carries the fruit on wind like a tiny helicopter, while the flowers below rely on scent and nectar to recruit pollinators — two different strategies from one tree.",
      g912: "Concept: nectar economics and pollinator specialization. Linden produces enough nectar to support single-source \"linden honey\"; research documented reports of bee die-offs beneath heavily blooming lindens in some cities, and evaluate competing hypotheses (nectar toxicity vs. simple overexertion) using primary sources.",
      art: {
        k2: "Trace a heart-shaped leaf and draw a small bee next to it.",
        g35: "Draw the lopsided heart-shaped leaf, then write one line inside it about something you love about trees.",
        g68: "Write a short poem or song about the smell of linden flowers in summer, then illustrate it with the heart-shaped leaf as a border.",
        g912: "Design a scent-inspired abstract color study — choose colors and shapes that represent the smell of linden blossoms without drawing the flower literally, then explain your color choices in one paragraph."
      }
    },
    "red maple": {
      k2: "Look for a small pointy-hand leaf that might turn red.",
      g35: "Find a paired winged seed and toss it — watch it spin like a helicopter on the way down.",
      g68: "Concept: samara aerodynamics and fall color chemistry. Spinning increases a seed's time aloft so wind carries it farther. Red fall color comes from anthocyanins the leaf actively makes as chlorophyll breaks down — unlike yellow, which was there all along.",
      g912: "Concept: autorotation dispersal and active senescence chemistry. Time a seed's fall from a known height to estimate its descent rate, then relate spin-induced autorotation to dispersal distance; separately, explain why making anthocyanin in fall costs the tree energy even though the leaf is about to drop, and propose a hypothesis for why that investment might still be worthwhile.",
      art: {
        k2: "Toss a winged seed and watch it spin, then draw its spinning path with a swirl.",
        g35: "Collect fallen leaves in red, orange, and yellow and arrange them into a color gradient from lightest to darkest.",
        g68: "Create a color-wheel-inspired leaf mandala using collected leaves in a gradient, then label which pigment (chlorophyll, carotenoid, or anthocyanin) is responsible for each color band.",
        g912: "Extract natural pigment from a red maple leaf using isopropyl alcohol and paper chromatography, then mount and label the resulting pigment bands as a scientific illustration plate."
      }
    },
    "green ash": {
      k2: "Count the little leaflets that make up one big leaf.",
      g35: "Green ash leaflets grow in exact opposite pairs along the twig — check if the pattern lines up.",
      g68: "Concept: invasive pest ecology. The emerald ash borer, an invasive beetle from Asia, has killed hundreds of millions of North American ash trees since 2002 by tunneling under the bark and cutting off nutrient flow.",
      g912: "Concept: invasive pest population dynamics. Emerald ash borer larvae tunnel through the phloem, cutting off nutrient transport; research the estimated ecological and economic cost of ash mortality in North America since 2002, and evaluate one proposed management strategy — biocontrol wasps, systemic insecticide, or preemptive removal — for its tradeoffs.",
      art: {
        k2: "Count the little leaflets, then draw the same number of leaf shapes in a row.",
        g35: "Draw one compound leaf, counting and drawing each individual leaflet along the row.",
        g68: "Illustrate the leaflets' opposite-pair pattern as a symmetrical design, then research and add small drawings of the emerald ash borer's D-shaped exit holes as a border motif.",
        g912: "Create an infographic-style illustration mapping the emerald ash borer's spread across North America since 2002, paired with a labeled botanical sketch of the compound leaf it targets."
      }
    },
    "silver maple": {
      k2: "Wait for the wind — do the leaves flash silver?",
      g35: "Turn a leaf over — the pale underside reflects more light than the green top.",
      g68: "Concept: growth-strategy tradeoffs. Silver maple grows fast with wide, weak wood; oaks grow slowly with dense, strong wood — a useful comparison to make on the same walk.",
      g912: "Concept: growth-strategy tradeoffs and wood density risk. Silver maple prioritizes fast growth with low-density wood, making it more prone to storm breakage than slower-growing oaks; research a real municipal tree-risk assessment framework and evaluate what risk factors an arborist would flag for this species versus a mature oak on the same street.",
      art: {
        k2: "Turn a leaf over and color one side green, one side silver.",
        g35: "Paint or draw one leaf with two colors — green on one side, silvery-white on the other, just like the real thing in the wind.",
        g68: "Create a two-tone flip-art piece: green on one side, silver on the other, mounted so both sides are visible — write a caption explaining why the underside is pale.",
        g912: "Photograph the leaf from both sides under the same lighting, then create a composite diptych analyzing how light reflectance differs, citing the physical mechanism (waxy cuticle vs. trichome density) responsible."
      }
    },
    "cherry": {
      k2: "Find the tiny teeth along the edge of a leaf.",
      g35: "Look for tiny dashes on the bark — lenticels, like little pores.",
      g68: "Concept: bloom synchrony and bark gas exchange. Compare cherry's lenticels to zelkova's — same structure, different species, good side-by-side observation.",
      g912: "Concept: phenology as a climate signal. Cherry bloom dates are among the most precisely recorded phenological indicators worldwide, with records from Kyoto spanning over 1,200 years; research how earlier bloom dates are used as evidence of urban and global warming, and log this tree's bloom date if you're documenting it in spring.",
      art: {
        k2: "Feel the tiny teeth on a leaf's edge, then draw a zigzag line to show them.",
        g35: "Sketch a branch of blossoms using only pink and white paint dabbed on with a fingertip or cotton swab.",
        g68: "Study Japanese hanami (cherry blossom viewing) traditions, then create a short ink-wash-style painting of a blossoming branch using only water and one color of paint.",
        g912: "Research ukiyo-e woodblock print conventions used by artists like Hokusai for depicting blossoming trees, then create your own print-style composition of this tree using bold outlines and flat color fields."
      }
    },
    "northern red oak": {
      k2: "Look for pointy lobes on the leaf.",
      g35: "Find an acorn and compare its cap to a pin oak's — bigger or smaller?",
      g68: "Concept: red oak vs. white oak groups. Red oaks have bristle-tipped leaves and acorns that take two years to mature; white oaks have rounded lobes and one-year acorns — a real dichotomy botanists use for field ID.",
      g912: "Concept: reproductive strategy and phylogeny. Red oaks take two years to mature acorns while white oaks take one; research how this difference relates to the deeper evolutionary split between the two oak subgenera, and explain why acorn maturation time affects a squirrel's caching — and accidental planting — behavior differently for each group.",
      art: {
        k2: "Draw an acorn wearing its cap like a tiny hat, then give it a silly face.",
        g35: "Draw an acorn wearing its little cap like a hat, then invent a tiny character who lives inside it.",
        g68: "Create a labeled botanical sketch comparing a red oak leaf (pointed, bristle-tipped lobes) to a white oak leaf (rounded lobes) side by side.",
        g912: "Produce a detailed graphite illustration of the acorn and cap using stippling to show texture, following the conventions of 19th-century natural history illustration."
      }
    },
    "sophora": {
      k2: "Count the smooth little leaflets on one leaf.",
      g35: "Check if a young twig still looks green — that means it's still making food through its bark.",
      g68: "Concept: bark photosynthesis and niche flowering timing. Blooming in late summer, when fewer competitors are still flowering, means more pollinator attention for this species.",
      g912: "Concept: niche flowering phenology and horticultural history. Blooming in late summer reduces competition for pollinators; research this species' origin as an 18th-century botanical introduction from China, and evaluate how bloom timing can function as a competitive strategy independent of a plant's native range.",
      art: {
        k2: "Count the smooth little leaflets, then draw a row of matching ovals.",
        g35: "This tree blooms late, when almost nothing else is flowering — write a few lines about being different from the crowd, like this tree's late blooms.",
        g68: "Create a still-life sketch of a sophora flower cluster in late summer, paired with one sentence about a time you did something on a different timeline than everyone else.",
        g912: "Research botanical illustration plates from 18th-century plant-hunting expeditions (sophora was introduced to Europe this way), then create your own field-notebook-style page with sketch, notes, and location data."
      }
    },
    "sweetgum": {
      k2: "The leaf is shaped like a star! Find a spiky ball on the ground.",
      g35: "Sweetgum can show yellow, orange, red, and purple all on one tree in fall.",
      g68: "Concept: independent pigment breakdown. Chlorophyll, carotenoids, and anthocyanins fade at different rates, producing multi-color canopies. The spiky fruit is many capsules fused together, releasing seeds through small pores.",
      g912: "Concept: independent pigment degradation pathways. Chlorophyll, carotenoids, and anthocyanins break down or synthesize at different rates and are influenced by different environmental triggers — temperature, sunlight, and sugar accumulation. Design a simple observational log tracking this tree's color change over several weeks and hypothesize which pigment pathway dominates first.",
      art: {
        k2: "Trace the star-shaped leaf, then color it like a nighttime sky.",
        g35: "Trace a star-shaped leaf and turn it into a five-pointed star drawing — add a face or a night sky around it.",
        g68: "Create a fall-color study of the same star-shaped leaf outline, painted three different ways to show yellow, red, and purple variants — research why one tree can show all three.",
        g912: "Do a botanical cross-section sketch of the spiky seed capsule (many fused capsules), labeling the small pores seeds are released through, following scientific illustration conventions."
      }
    },
    "american linden": {
      k2: "Find the biggest heart-shaped leaf you can.",
      g35: "Smell a linden flower cluster in summer — bees love the scent.",
      g68: "Concept: nectar reward economics. Linden nectar is productive enough to be a prized single-source honey — a good entry point into pollinator-plant mutualism.",
      g912: "Concept: single-source nectar economics. Linden honey is prized enough to be sold as a distinct varietal; research how nectar volume and sugar concentration are measured in pollination-ecology studies, and explain why a single tree species blooming in mass can support a specialized honey market.",
      art: {
        k2: "Find the biggest heart-shaped leaf and trace it.",
        g35: "Press a real fallen leaf between two pieces of paper and rub the side of a crayon over it to reveal its veins.",
        g68: "Create a leaf-vein rubbing series from 3 leaves, then research and label the vein pattern type (pinnate) and what it tells you about how nutrients move through the leaf.",
        g912: "Photograph or sketch the vein network at close range and compare its branching pattern to a river delta or lung bronchi — write a short reflection on convergent branching patterns in nature."
      }
    },
    "crimson king maple": {
      k2: "Find a purple hand-shaped leaf instead of a green one.",
      g35: "This tree is a Norway maple bred to stay purple all summer instead of just in fall.",
      g68: "Concept: cultivar selection. Crimson King keeps high anthocyanin levels all season by human selection, not just at leaf-drop — a real example of selective breeding for an ornamental trait.",
      g912: "Concept: cultivar selection and horticultural genetics. Crimson King is a clonally propagated cultivar selected for consistently high anthocyanin expression; research how cultivars are propagated by grafting rather than seed to preserve a specific genetic trait, and explain why seed-grown offspring of this tree would likely not stay purple.",
      art: {
        k2: "Find a purple leaf and color a small tree using only purple.",
        g35: "This tree stays purple all year — paint a small tree using only purple, testing how many different shades you can mix.",
        g68: "Create a monochromatic purple painting of the tree, mixing at least 5 distinct shades from red, blue, and white — label which mix ratio made each shade.",
        g912: "Research color theory around anthocyanin-rich cultivars in ornamental horticulture, then create a color-mixing chart documenting the exact ratios used to replicate this leaf's specific shade of purple."
      }
    },
    "american elm": {
      k2: "Fold the leaf at the stem — do the two sides match up?",
      g35: "Old American elms used to form green \"tunnels\" over city streets before a disease hurt many of them.",
      g68: "Concept: monoculture risk. Dutch elm disease, spread by bark beetles, nearly wiped out American elm as a street tree in the 1900s — a real case for why cities now plant many different species instead of one.",
      g912: "Concept: monoculture vulnerability and epidemiology. Dutch elm disease spreads via bark beetles and root grafts between neighboring trees of the same species; research how modern urban forestry departments use species-diversity targets (for example, no more than 10% of one species) to prevent a repeat of the 20th-century elm collapse, and evaluate this street's own species diversity.",
      art: {
        k2: "Fold a leaf at the stem and see if the two sides match.",
        g35: "Draw the tall, arching branches of an elm forming a tunnel shape, like a cathedral made of branches.",
        g68: "Research historic photos of elm-lined American streets before Dutch elm disease, then illustrate a \"before and after\" comparison of a tree-tunnel street.",
        g912: "Design a public-awareness illustration or poster about the importance of species diversity in urban forestry, using this tree's near-loss to Dutch elm disease as the central case study."
      }
    },
    "silver linden": {
      k2: "Wait for wind and watch the leaf flash silver.",
      g35: "Compare this leaf's underside to a silver maple's — which one is silvery, and why might that be?",
      g68: "Concept: reflective adaptations. Silver linden's silvery underside comes from tiny hairs (trichomes); silver maple's comes from a waxy coating — same visual effect, two different mechanisms.",
      g912: "Concept: convergent reflective adaptations. Silver linden's pale underside comes from dense trichomes, while silver maple's comes from a waxy cuticle — two unrelated structural solutions to the same problem of reducing water loss and reflecting heat. Research one other example of convergent evolution in plants and compare the underlying mechanisms.",
      art: {
        k2: "Feel the fuzzy underside of a leaf, then draw a fuzzy texture with dots.",
        g35: "Draw a two-toned leaf — dark green marker on top, silver or white crayon on the bottom.",
        g68: "Create a textured mixed-media leaf piece, using a rubbing technique for the fuzzy underside and smooth marker for the top — write one sentence on why the two sides might feel different.",
        g912: "Examine the leaf's underside with a hand lens or phone macro camera and sketch the trichome (hair) structure you observe, comparing it to a reference image of silver maple's smooth waxy underside."
      }
    },
    "purple leaf plum": {
      k2: "Find a purple leaf shaped like a football.",
      g35: "Check the trunk for little sideways lines — lenticels again.",
      g68: "Concept: convergent horticultural selection. Purple-leaf cultivars exist in both the maple family (Crimson King) and the rose family (this tree) — unrelated plants bred independently for the same anthocyanin-rich look.",
      g912: "Concept: convergent horticultural selection across unrelated families. Purple-leaf cultivars exist independently in the maple family (Sapindaceae) and the rose family (Rosaceae); research the specific anthocyanin genes involved in each case and evaluate whether this counts as true convergent evolution or simply parallel human selection pressure.",
      art: {
        k2: "Find a purple leaf shaped like a football and trace it.",
        g35: "Sketch a small purple tree in springtime with pink blossoms just opening — try mixing red and blue paint to make your own purple.",
        g68: "Paint a spring study of the tree in bloom, layering pink blossoms over a purple-leaf background — research complementary colors and explain your color choice.",
        g912: "Research the rose family's horticultural history of ornamental purple-leaf cultivars, then create a comparative color-swatch study of this tree's purple against Crimson King maple's purple, noting any visible difference in hue or saturation."
      }
    },
    "schubert cherry": {
      k2: "Find both green and purple leaves on the same tree.",
      g35: "Some leaves start green and shift to purple as summer goes on — try watching one leaf over a few weeks.",
      g68: "Concept: developmental pigment shift. New leaves start green because chlorophyll masks anthocyanin that's already forming; the balance shifts visibly as the season goes on.",
      g912: "Concept: developmental pigment masking. New leaves start green because chlorophyll's green color masks anthocyanin pigments already being produced; research the biochemical process by which chlorophyll degrades faster than anthocyanin in this cultivar, unlike most trees, where anthocyanin appears only in fall.",
      art: {
        k2: "Find a green leaf and a purple leaf on the same tree and draw both.",
        g35: "Draw one branch that's half green leaves, half purple leaves, showing the tree changing right before your eyes.",
        g68: "Create a time-lapse-style triptych — 3 panels — showing the same leaf transitioning from green to purple over the season, based on your own observations.",
        g912: "Design a data-driven color-change chart, photographing or sampling the same leaf weekly and plotting a rough color-intensity trend over several weeks."
      }
    },
    "japanese treelilac": {
      k2: "Find a smooth-edged leaf with a pointed tip.",
      g35: "Smell the cream-colored flower clusters in early summer.",
      g68: "Concept: this tree really is a true lilac (genus Syringa) — just grown as a small tree instead of a multi-stemmed shrub, with flat-topped white flower clusters instead of purple ones. It's a cousin of ash trees in the olive family (Oleaceae); compare its bark and leaf shape to a green ash's.",
      g912: "Concept: family-level relationships in Oleaceae. Japanese tree lilac, common lilac, ash, forsythia, and privet are all in the olive family — a useful case for why plant classification is based on shared floral and fruit structure rather than overall size or growth habit. Research one shared floral trait (such as opposite leaves or four-petaled tubular flowers) that unites this family and check it against a nearby ash tree.",
      art: {
        k2: "Smell the flowers, then draw swirls to show what the smell feels like.",
        g35: "This tree smells sweet in early summer — draw what that smell might look like as swirls of color and lines around the flowers.",
        g68: "Create a synesthesia-inspired painting translating the scent of the flowers into color and shape, then write a short explanation of your choices.",
        g912: "Research Wassily Kandinsky's color-sound theories, a real synesthetic approach used in early abstract art, then apply a similar cross-sensory translation method to this tree's scent, documenting your process and color choices."
      }
    },
    "chinese elm": {
      k2: "Find the smallest toothed leaf you can.",
      g35: "Look for a patchwork of gray, tan, and orange bark colors.",
      g68: "Concept: disease-resistant substitution. Chinese elm's exfoliating bark and natural resistance to Dutch elm disease made it a common replacement species after American elm losses — connects directly to the elm case study above.",
      g912: "Concept: disease-resistant substitution and urban forestry risk management. Chinese elm's natural resistance to Dutch elm disease made it a common post-epidemic replacement species; research how urban foresters balance disease resistance against invasiveness concerns when selecting a substitute species, and evaluate whether this species carries any documented ecological tradeoffs of its own.",
      art: {
        k2: "Find the smallest leaf you can and trace it.",
        g35: "Trace the puzzle-piece pattern of the bark and color each \"puzzle piece\" a different shade of brown, tan, and gray.",
        g68: "Create a mosaic-style artwork using cut paper in bark-inspired colors — gray, tan, orange, cream — to recreate the patchwork bark pattern.",
        g912: "Photograph a section of bark and create a value study — a grayscale drawing showing only light and shadow — capturing how the patchwork pattern reads without color."
      }
    },
    "swamp white oak": {
      k2: "Feel a leaf's underside — is it soft and fuzzy?",
      g35: "This oak likes wet soil more than most street trees — that's why \"swamp\" is in its name.",
      g68: "Concept: flood tolerance. Swamp white oak's roots have adaptations for surviving low-oxygen, waterlogged soil, which is why cities increasingly plant it in stormwater and rain-garden tree pits.",
      g912: "Concept: flood-tolerance physiology. Waterlogged, low-oxygen soil kills most tree roots by suffocation; research how swamp white oak's roots develop specialized tissue (aerenchyma) to transport oxygen downward, and explain why this makes it a preferred species for stormwater and rain-garden tree pits in modern green-infrastructure design.",
      art: {
        k2: "Feel a leaf's underside and draw a fuzzy line where it's soft.",
        g35: "Draw a leaf from both sides on the same page — dark green on top, pale and fuzzy on the bottom — like a leaf with two different outfits.",
        g68: "Create a two-sided leaf illustration, front and back, using different textures — smooth marker on top, stippled dots on the bottom — and label why the underside might need to be different.",
        g912: "Sketch the leaf's cross-section as a scientific illustration, showing the fuzzy underside (trichome layer) and labeling it alongside the smooth upper cuticle, referencing real leaf-anatomy diagrams."
      }
    }
  };

  const GENERIC = {
    k2: "Look closely at the leaves, bark, and shape. What's different about this tree from the last one you visited?",
    g35: "Every tree species has its own combination of leaf shape, bark texture, seeds, and branching pattern. What three clues would you use to describe this one to a friend?",
    g68: "Concept: dichotomous identification. Professional botanists narrow down a species using a series of either/or traits (leaf shape, arrangement, bark, fruit). Try building your own 3-question ID key for this tree.",
    g912: "Concept: taxonomic identification as applied science. Professional botanists narrow down species using dichotomous keys built on measurable, either/or traits; build your own 3-to-5-question identification key for this tree using only features you can observe and measure right now — leaf shape, bark texture, branching pattern, fruit or seed type.",
    art: {
      k2: "Sketch this tree exactly as you see it right now.",
      g35: "Sketch this tree exactly as you see it right now — its shape, its colors, anything unique. No two of your drawings will ever look the same, just like no two trees do.",
      g68: "Create a field-journal page for this tree: a sketch, three observed details, and one question you still have about it.",
      g912: "Produce a formal botanical illustration plate of this tree following field-guide conventions — a labeled sketch, a scale reference, and a short observational caption — the same format professional botanical illustrators use."
    }
  };

  function forSpecies(common) {
    const key = String(common || "").toLowerCase();
    return SPECIES[key] || GENERIC;
  }

  window.TREEWALK_CURRICULUM = { BANDS, forSpecies };
})();
