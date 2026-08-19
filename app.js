const CITIES=window.TREEWALK_CITIES;
const NYC_FALLBACK=CITIES.NYC.fallback;
const $=id=>document.getElementById(id);
const state={map:null,clusters:null,user:null,userMarker:null,trees:[],selected:null,watchId:null,follow:true,lastLoaded:null,loading:false,found:new Set(JSON.parse(localStorage.getItem('nytree-found')||'[]')),walkPath:[],walkLine:null,walkStartedAt:null,walkStartFound:0,city:CITIES.NYC,previewCity:CITIES.NYC,sponsorClaimType:'individual',sponsorGuardClass:'diy',game:null,guessTree:null,pendingDocument:null};

const prompts={
  'london planetree':'Its patchy bark can look like camouflage. Can you spot cream, olive, and gray pieces?',
  honeylocust:'Look for many tiny leaflets and long, flat seed pods.',
  'pin oak':'Look for leaves with deep, pointed lobes—or tiny acorns beneath it.',
  ginkgo:'Its fan-shaped leaves are unlike almost any other street tree.',
  'japanese zelkova':'Look up at its vase-shaped branches spreading toward the sky.',
  'callery pear':'Notice its glossy oval leaves and neatly rounded crown.'
};

const speciesProfiles={
  'london planetree':{leaf:0,shape:'Hand-shaped leaf',story:'My white and tan bark peels away in patches, making my trunk look like urban camouflage.',kid:'My bark looks like camouflage! Look for cream, olive, and gray patches peeling from my trunk.',tags:['Hand-shaped leaf','Peeling bark','Very common in NYC']},
  'honeylocust':{leaf:1,shape:'Compound leaf',story:'My leaves are often doubly compound, with many small leaflets. My long seed pods can twist as they dry.',kid:'I have lots of tiny leaflets instead of one big leaf. Can you find one of my long, twisty seed pods?',tags:['Many tiny leaflets','Twisting seed pods','Light, dappled shade']},
  'thornless honeylocust':{leaf:1,shape:'Compound leaf',story:'My leaves are often doubly compound, with many small leaflets. My long seed pods can twist as they dry.',kid:'I have lots of tiny leaflets instead of one big leaf. Can you find one of my long, twisty seed pods?',tags:['Many tiny leaflets','Twisting seed pods','Light, dappled shade']},
  'pin oak':{leaf:2,shape:'Oak-shaped leaf',story:'My leaves have deep spaces and sharply pointed lobes. I am one of New York City\'s most common oak species.',kid:'My leaf has deep spaces and sharp, pointy tips. Look beneath me for a small, round acorn!',tags:['Pointed lobes','Small acorns','Common NYC oak']},
  'ginkgo':{leaf:3,shape:'Fan-shaped leaf',story:'My fan-shaped leaves are easy to recognize, and my short, knobby twigs can hold clusters of them.',kid:'No other street-tree leaf looks quite like my fan. In fall, my leaves can turn bright yellow together!',tags:['Fan-shaped leaf','Ancient species','Golden fall color']},
  'japanese zelkova':{leaf:4,shape:'Teardrop leaf',story:'My small toothed leaves and bark with tiny horizontal marks help identify me. My crown often grows in a gentle vase shape.',kid:'My leaf looks like a little toothed teardrop. Step back—do my branches make a wide vase shape?',tags:['Toothed edge','Vase-shaped crown','Bark lenticels']}
  ,'norway maple':{leaf:0,shape:'Hand-shaped leaf',story:'My geometric leaves have five pointed lobes. A broken leaf stalk may release a milky sap.',kid:'My leaf looks like a pointy hand. Grown-ups can check my leaf stem for a tiny drop of milky sap.',tags:['Five pointed lobes','Milky leaf-stem sap','Opposite leaves']}
  ,'callery pear':{leaf:4,shape:'Teardrop leaf',story:'My glossy, rounded leaves have gently wavy edges, and I often flower white in early spring.',kid:'My shiny leaf is shaped like a teardrop. In spring, look for bunches of white flowers.',tags:['Glossy leaf','Wavy edge','White spring flowers']}
  ,'littleleaf linden':{leaf:4,shape:'Uneven heart-shaped leaf',story:'My heart-shaped leaves have uneven bases. My small fruits hang from a pale, leaf-like wing.',kid:'My leaf looks like a tiny uneven heart. Can you find the pale wing that carries my little fruits?',tags:['Heart-shaped leaf','Winged fruit','Toothed edge']}
  ,'little-leaf linden':{leaf:4,shape:'Uneven heart-shaped leaf',story:'My heart-shaped leaves have uneven bases. My small fruits hang from a pale, leaf-like wing.',kid:'My leaf looks like a tiny uneven heart. Can you find the pale wing that carries my little fruits?',tags:['Heart-shaped leaf','Winged fruit','Toothed edge']}
  ,'red maple':{leaf:0,shape:'Hand-shaped leaf',story:'My leaves usually have three to five lobes and can turn vivid red, orange, or yellow in autumn.',kid:'My leaf is a small pointy hand. In fall, I may turn bright red before many of my neighbors.',tags:['3–5 lobes','Red fall color','Paired winged seeds']}
  ,'green ash':{leaf:1,shape:'Compound leaf',story:'Each of my leaves is made of several leaflets arranged along one central stalk.',kid:'What looks like many leaves is really one big compound leaf. Count the leaflets!',tags:['Compound leaf','Opposite twigs','Paddle-shaped seeds']}
  ,'silver maple':{leaf:0,shape:'Deeply lobed leaf',story:'My deeply cut leaves have pale, silvery undersides that flash when the wind turns them.',kid:'When the wind blows, look for the silvery undersides of my deeply cut leaves.',tags:['Silvery underside','Deep lobes','Fast growing']}
  ,'cherry':{leaf:4,shape:'Football-shaped leaf',story:'My oval leaves have toothed edges, and many cherries have horizontal marks called lenticels on their bark.',kid:'Look for tiny teeth around my oval leaf and little horizontal dashes on my bark.',tags:['Oval leaf','Toothed edge','Bark lenticels']}
  ,'northern red oak':{leaf:2,shape:'Oak-shaped leaf',story:'My leaves have pointed, bristle-tipped lobes. My acorns wear caps that cover only the top.',kid:'My leaf has pointy lobes, and my acorn wears a very small cap—like a tiny beret.',tags:['Pointed lobes','Shallow acorn cap','Large shade tree']}
  ,'japanese pagoda tree':{leaf:1,shape:'Compound leaf',story:'My compound leaves carry many smooth-edged leaflets, and my young twigs can appear green.',kid:'Count my smooth little leaflets. Can you spot a young twig that still looks green?',tags:['Compound leaf','Smooth leaflets','Green young twigs']}
  ,'sophora':{leaf:1,shape:'Compound leaf',story:'My compound leaves carry many smooth-edged leaflets, and my young twigs can appear green.',kid:'Count my smooth little leaflets. Can you spot a young twig that still looks green?',tags:['Compound leaf','Smooth leaflets','Green young twigs']}
  ,'sweetgum':{leaf:0,shape:'Star-shaped leaf',story:'My five-pointed, star-like leaves and round, spiky fruits make me easy to recognize.',kid:'My leaf is a star! Look on the ground for one of my round, spiky seed balls.',tags:['Star-shaped leaf','Spiky fruit','Colorful fall leaves']}
  ,'american linden':{leaf:4,shape:'Uneven heart-shaped leaf',story:'My large heart-shaped leaves have uneven bases, and my fragrant flowers hang from a pale wing.',kid:'My big leaf looks like a lopsided heart. Bees may visit my sweet-smelling summer flowers.',tags:['Large heart leaf','Fragrant flowers','Winged fruit']}
  ,'crimson king maple':{leaf:0,shape:'Hand-shaped leaf',story:'I am a dark purple-leaved form of Norway maple, with geometric lobes and milky sap in the leaf stalk.',kid:'My pointy hand-shaped leaves can be deep purple instead of green.',tags:['Purple leaf','Pointed lobes','Milky leaf-stem sap']}
  ,'american elm':{leaf:4,shape:'Uneven oval leaf',story:'My toothed leaves have uneven bases, and mature trees can form a tall, arching vase-shaped crown.',kid:'Fold my leaf at the stem—the two sides do not match! Then look up for my arching branches.',tags:['Uneven leaf base','Double-toothed edge','Vase-shaped crown']}
  ,'silver linden':{leaf:4,shape:'Uneven heart-shaped leaf',story:'My heart-shaped leaves have pale, silvery-white undersides that can shimmer in a breeze.',kid:'Wait for the wind and watch the silvery backs of my leaves flash.',tags:['Silvery underside','Heart-shaped leaf','Fragrant flowers']}
  ,'purple leaf plum':{leaf:4,shape:'Football-shaped leaf',story:'My oval leaves are often deep purple, and my bark shows small horizontal marks called lenticels.',kid:'My leaves may stay purple all summer. Look for tiny sideways dashes on my bark.',tags:['Purple leaf','Bark lenticels','Spring blossoms']}
  ,'schubert cherry':{leaf:4,shape:'Football-shaped leaf',story:'My oval leaves often mature from green to reddish purple, and my bark has horizontal lenticels.',kid:'Some of my leaves change from green to purple. Can you find both colors?',tags:['Color-changing leaf','Bark lenticels','Oval shape']}
  ,'japanese tree lilac':{leaf:4,shape:'Teardrop leaf',story:'My smooth-edged leaves taper to a point, and I can produce clusters of creamy flowers in early summer.',kid:'My leaf has a smooth edge and a pointy tip. In early summer, smell my creamy flower clusters.',tags:['Smooth leaf edge','Cream flowers','Small city tree']}
  ,'japanese treelilac':{leaf:4,shape:'Teardrop leaf',story:'My smooth-edged leaves taper to a point, and I can produce clusters of creamy flowers in early summer.',kid:'My leaf has a smooth edge and a pointy tip. In early summer, smell my creamy flower clusters.',tags:['Smooth leaf edge','Cream flowers','Small city tree']}
  ,'chinese elm':{leaf:4,shape:'Small toothed leaf',story:'My small leaves have uneven bases and toothed edges. My bark can form a colorful patchwork.',kid:'My little leaf has tiny teeth. My trunk may look like a puzzle of gray, tan, and orange patches.',tags:['Small toothed leaf','Uneven base','Patchwork bark']}
  ,'swamp white oak':{leaf:2,shape:'Oak-shaped leaf',story:'My rounded lobes are softer than a pin oak\'s points, and the undersides of my leaves can look pale and fuzzy.',kid:'My oak leaf has rounded bumps, not sharp points. Turn one over to look for a pale, fuzzy back.',tags:['Rounded lobes','Pale fuzzy underside','Acorns']}
};
const genericProfile={leaf:4,shape:'Leaf shape varies',story:'Every tree species has its own combination of leaves, bark, buds, fruit, and branching pattern.',kid:'Look closely at my leaf edge, veins, bark, and branches. Those clues can help you learn who I am!',tags:['Look at the leaf','Notice the bark','Check for seeds']};

const aliases={'thornless honeylocust':'honeylocust','little-leaf linden':'littleleaf linden','japanese pagoda tree':'sophora','japanese tree lilac':'japanese treelilac','purple-leaf plum':'purple leaf plum'};
const aboutProfiles={
  'london planetree':'A London planetree is a large, resilient shade tree that handles heat, compacted soil, and busy city streets unusually well. Its broad crown can cool an entire stretch of sidewalk.',
  'norway maple':'Originally from Europe, the Norway maple became a familiar city shade tree because it tolerates difficult urban conditions and forms a dense, rounded crown.',
  'callery pear':'This compact ornamental tree was widely planted for its clouds of white spring flowers and neat street-sized shape.',
  'honeylocust':'Honeylocusts make excellent city neighbors because their light, open crowns provide shade while still allowing sunlight to reach the sidewalk and plants below.',
  'pin oak':'A pin oak is a fast-growing native oak and one of New York City\'s most familiar street oaks. As it matures, it can become a major source of neighborhood shade.',
  'littleleaf linden':'Originally from Europe and western Asia, this linden becomes a stately shade tree. Its fragrant early-summer flowers are especially attractive to pollinators.',
  'japanese zelkova':'This East Asian tree develops a graceful vase-shaped crown. It became a popular city tree because it is adaptable and provides generous shade.',
  'red maple':'Red maple is native to eastern North America and lives up to its name in several seasons, from reddish spring flowers to brilliant autumn leaves.',
  'green ash':'Green ash is a native North American shade tree that was planted widely along city streets. Ash trees now face a serious threat from the emerald ash borer.',
  'ginkgo':'Ginkgo belongs to an ancient tree lineage and has no close living relatives. Originally from China, it is remarkably tolerant of pollution and city conditions.',
  'silver maple':'Silver maple is a fast-growing native tree named for the pale undersides of its leaves. Its wide crown can create substantial shade.',
  'cherry':'New York\'s street cherries include several cultivated varieties. They are generally smaller trees celebrated for spring blossoms and seasonal color.',
  'northern red oak':'Northern red oak is a large native canopy tree. Its broad crown provides deep shade, while its acorns provide food for urban wildlife.',
  'sophora':'Also called the Japanese pagoda tree, this adaptable East Asian species can produce creamy flowers in late summer when relatively few other street trees are blooming.',
  'sweetgum':'Sweetgum is a tall native North American tree with a straight trunk and a broad pyramidal crown. In autumn, one tree may display yellow, orange, red, and purple at once.',
  'american linden':'American linden is a large native shade tree whose fragrant summer flowers provide nectar for bees and other pollinators.',
  'crimson king maple':'Crimson King is a cultivated Norway maple selected for its deep purple foliage, bringing dark color to the streetscape throughout the growing season.',
  'american elm':'American elm is a native tree famous for its tall, arching, vase-shaped crown. Mature elms once formed green tunnels over many American streets.',
  'silver linden':'Silver linden is a sturdy shade tree from southeastern Europe and western Asia. A breeze reveals the pale undersides of its leaves and makes the crown shimmer.',
  'purple leaf plum':'Purple leaf plum is a small ornamental tree valued for early spring blossoms and dark foliage that brings color to compact city spaces.',
  'schubert cherry':'Schubert cherry is a cultivated chokecherry whose foliage changes from green to reddish purple as the season progresses.',
  'japanese treelilac':'Japanese tree lilac is a small East Asian tree that fits beneath utility lines and produces showy clusters of creamy flowers in early summer.',
  'chinese elm':'Chinese elm is an adaptable East Asian shade tree known for its finely branched crown and handsome mottled bark.',
  'swamp white oak':'Swamp white oak is a long-lived native tree associated with moist lowlands, yet it also adapts well to city streets and grows into a powerful shade tree.'
};
const lookProfiles={
  'london planetree':'Can you find a fallen hand-shaped leaf or a naturally shed flake of camouflage bark? Please do not pull bark from the tree.',
  'norway maple':'Find a fallen leaf and count its pointed lobes. Does it look like a geometric hand?',
  'callery pear':'Look for a glossy fallen leaf with a gently wavy edge. Can you also find one of last season\'s tiny round fruits?',
  'honeylocust':'Can you find a fallen compound leaf with many tiny leaflets—or an old, long, twisting seedpod?',
  'pin oak':'Look for a fallen leaf with deep spaces and sharp, pointed lobes. Is there an old acorn nearby?',
  'littleleaf linden':'Find a small heart-shaped leaf. Can you spot a pale wing with tiny fruits hanging beneath it?',
  'japanese zelkova':'Find a small toothed leaf, then step back and see whether the branches form a wide vase shape.',
  'red maple':'Count the lobes on a fallen leaf. Can you find a paired, winged seed that spins like a helicopter?',
  'green ash':'Find a fallen compound leaf and count its leaflets. Look for a narrow, paddle-shaped seed.',
  'ginkgo':'Can you find a fan-shaped leaf on the ground? In autumn, look for a bright yellow one.',
  'silver maple':'Turn over a fallen, deeply lobed leaf. Is its underside noticeably paler or silver?',
  'cherry':'Look for a fallen oval leaf with tiny teeth, then examine the trunk for small horizontal marks.',
  'northern red oak':'Find a fallen leaf with pointed lobes or an acorn wearing a shallow cap.',
  'sophora':'Count the smooth leaflets on a fallen compound leaf. Can you see a green young twig or an old seedpod?',
  'sweetgum':'Can you find a fallen star-shaped leaf? Look carefully for an old round, spiky fruit beneath the tree.',
  'american linden':'Find a large, lopsided heart-shaped leaf. Can you spot a pale wing carrying tiny fruits?',
  'crimson king maple':'Look for a fallen dark purple, hand-shaped leaf and count its pointed lobes.',
  'american elm':'Compare the two sides of a fallen leaf near its base. Do they begin at different heights?',
  'silver linden':'Wait for a breeze and watch the leaf undersides flash silver—or find a fallen leaf and turn it over.',
  'purple leaf plum':'Can you find a fallen purple oval leaf? Look at the trunk for little horizontal lines.',
  'schubert cherry':'Can you find both green and reddish-purple leaves on the same tree or beneath it?',
  'japanese treelilac':'Look for a smooth-edged leaf with a pointed tip. In early summer, can you find an old flower cluster?',
  'chinese elm':'Find one of the tree\'s small toothed leaves, then look for gray, tan, or orange patches on the bark.',
  'swamp white oak':'Find a fallen oak leaf with rounded lobes. Turn it over and look for a pale, softly fuzzy underside.'
};
const leafFiles={'london planetree':'london-planetree','norway maple':'norway-maple','callery pear':'callery-pear','honeylocust':'honeylocust','pin oak':'pin-oak','littleleaf linden':'littleleaf-linden','japanese zelkova':'japanese-zelkova','red maple':'red-maple','green ash':'green-ash','ginkgo':'ginkgo','silver maple':'silver-maple','cherry':'cherry','northern red oak':'northern-red-oak','sophora':'sophora','sweetgum':'sweetgum','american linden':'american-linden','crimson king maple':'crimson-king-maple','american elm':'american-elm','silver linden':'silver-linden','purple leaf plum':'purple-leaf-plum','schubert cherry':'schubert-cherry','japanese treelilac':'japanese-treelilac','chinese elm':'chinese-elm','swamp white oak':'swamp-white-oak'};
function canonicalName(common){const key=String(common||'').toLowerCase();return aliases[key]||key}
function profileFor(common){const key=canonicalName(common),base=speciesProfiles[key]||genericProfile;return {...base,key,about:aboutProfiles[key],look:lookProfiles[key],leafFile:leafFiles[key]}}
function setMode(mode){
  document.body.dataset.mode=mode;
  localStorage.setItem('nytree-mode',mode);
  $('community-mode').classList.toggle('active',mode==='community');
  $('kids-mode').classList.toggle('active',mode==='kids');
  document.querySelectorAll('.welcome-mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  if(state.selected)openTree(state.selected);
}

function initMap(){
  state.map=L.map('map',{zoomControl:false,minZoom:10}).setView([NYC_FALLBACK.lat,NYC_FALLBACK.lng],16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
  L.control.zoom({position:'bottomright'}).addTo(state.map);
  state.clusters=L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:42,disableClusteringAtZoom:19});
  state.map.addLayer(state.clusters);
  state.map.on('dragstart',()=>{state.follow=false});
}

function start(useLocation=true){
  $('welcome').classList.add('hidden');
  document.body.classList.remove('onboarding');
  if(useLocation&&navigator.geolocation){
    showStatus('Finding you…');
    navigator.geolocation.getCurrentPosition(
      p=>{setUser(p.coords.latitude,p.coords.longitude);startTracking()},
      err=>{
        const f=state.previewCity.fallback;
        const reason=err&&err.code===1?'denied':err&&err.code===3?'timeout':'unavailable';
        setUser(f.lat,f.lng,true,reason);
      },
      {enableHighAccuracy:true,timeout:10000,maximumAge:30000}
    );
  }else{const f=state.previewCity.fallback;setUser(f.lat,f.lng,true)}
}

function setUser(lat,lng,fallback=false,reason=null){
  state.user={lat,lng};
  state.city=fallback?state.previewCity:CITIES.cityFor(lat,lng);
  if(state.follow)state.map.setView([lat,lng],17);
  if(!state.userMarker)state.userMarker=L.marker([lat,lng],{icon:L.divIcon({className:'user-pin',html:'<div class="user-dot"></div>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(state.map);
  else state.userMarker.setLatLng([lat,lng]);
  if(!state.lastLoaded||metersBetween(state.lastLoaded,{lat,lng})>200)loadTrees(lat,lng);
  if($('sample-banner'))$('sample-banner').hidden=!fallback;
  if(fallback&&reason==='denied'){
    showStatus('Location is blocked for this site — open your browser\'s site settings, allow location, then tap ◎ again.',0);
  }else if(fallback&&reason){
    showStatus(`Couldn't get your location (${reason==='timeout'?'took too long':'signal unavailable'}) — showing a sample ${state.city.name} area. Tap ◎ to retry.`,6000);
  }else if(fallback){
    showStatus(`Showing a sample ${state.city.name} neighborhood — tap ◎ to try your location`,4200);
  }else{
    showStatus(`You're in ${state.city.name} — loading nearby trees…`,3000);
  }
}

function startTracking(){
  if(!navigator.geolocation||state.watchId!==null)return;
  state.watchId=navigator.geolocation.watchPosition(p=>{
    const next={lat:p.coords.latitude,lng:p.coords.longitude};
    state.user=next;
    if(state.userMarker)state.userMarker.setLatLng([next.lat,next.lng]);
    if(state.follow)state.map.panTo([next.lat,next.lng],{animate:true,duration:.5});
    if(!state.lastLoaded||metersBetween(state.lastLoaded,next)>200)loadTrees(next.lat,next.lng);
    if(!state.walkLine){
      state.walkStartedAt=state.walkStartedAt||Date.now();
      state.walkStartFound=state.found.size;
      state.walkPath=[next];
      state.walkLine=L.polyline([[next.lat,next.lng]],{className:'walk-path'}).addTo(state.map);
      updateWalkHud();
    }else{
      state.walkPath.push(next);
      state.walkLine.addLatLng([next.lat,next.lng]);
    }
  },()=>showStatus('Live location paused — tap ◎ to reconnect',4000),{enableHighAccuracy:true,maximumAge:10000,timeout:20000});
}

function metersBetween(a,b){const p=Math.PI/180,r=6371000;const x=(b.lng-a.lng)*p*Math.cos((a.lat+b.lat)*p/2),y=(b.lat-a.lat)*p;return Math.sqrt(x*x+y*y)*r}

function resetWalkTracking(){
  if(state.walkLine){state.map.removeLayer(state.walkLine);state.walkLine=null;}
  state.walkPath=[];
  state.walkStartedAt=null;
  state.walkStartFound=state.found.size;
  updateWalkHud();
}

function showWalkSummary(){
  const treesRemembered=Math.max(0,state.found.size-state.walkStartFound);
  $('walk-summary-title').textContent=treesRemembered?`You've remembered ${treesRemembered} tree${treesRemembered===1?'':'s'}`:'No trees remembered yet';
  $('walk-summary-copy').textContent=treesRemembered?`Save today's trees to find them again, or share this walk for someone else to follow.`:`Tap ★ Remember this tree on any tree you meet — they'll show up here.`;
  $('walk-summary-name').value='';
  $('walk-summary').classList.add('open');
}

// Seeds represent participation in the living forest, not currency.
// Documentation is weighted above simple finding, because documenting is
// the action that actually adds information to the shared record —
// finding a tree only tells TreeWalk something about you.
const SEED_VALUES={
  found:1,
  care:2,
  added:3,
  sponsor:3,
  missing:4,
  pollinator:3,'noticed-pollinator':2,
  bloom:2,'noticed-bloom':1,
  bird:2,'noticed-bird':1,
  fruit:2,
  waterneeded:2,standingwater:2,
  unexpected:2,
  stewardcheckin:2,
  bud:1,colorchange:1,bare:1,lichen:1,leafshapes:1,
  tree:1,water:1,other:1
};
function seedValueFor(type){return SEED_VALUES[type]!=null?SEED_VALUES[type]:1}
function computeSeeds(){
  const obs=observationRecords();
  const added=addedTreeRecords();
  const sponsors=sponsorRecords();
  const care=careRecords();
  let total=state.found.size*SEED_VALUES.found;
  obs.forEach(o=>{total+=seedValueFor(o.type)});
  total+=added.length*SEED_VALUES.added;
  total+=Object.keys(sponsors).length*SEED_VALUES.sponsor;
  total+=Object.keys(care).length*SEED_VALUES.care;
  return total;
}

function renderNotebook(){
  const obs=observationRecords();
  const added=addedTreeRecords();
  const sponsors=sponsorRecords();
  const byType={};
  obs.forEach(o=>{byType[o.type]=(byType[o.type]||0)+1});
  const days=new Set(obs.map(o=>new Date(o.timestamp).toDateString())).size;
  if($('nb-seeds-count'))$('nb-seeds-count').textContent=computeSeeds();
  if($('nb-species-count'))$('nb-species-count').textContent=`${state.found.size} / 24`;
  if($('nb-observations-count'))$('nb-observations-count').textContent=obs.length;
  if($('nb-added-count'))$('nb-added-count').textContent=added.length;
  if($('nb-sponsor-count'))$('nb-sponsor-count').textContent=Object.keys(sponsors).length;
  if($('nb-type-breakdown')){
    const keys=Object.keys(byType).sort((a,b)=>byType[b]-byType[a]).slice(0,6);
    $('nb-type-breakdown').innerHTML=keys.length?keys.map(t=>{
      const def=iconForObservationType(t);
      return `<div class="nb-chip">${def.icon} <b>${byType[t]}</b><span>${def.label}</span></div>`;
    }).join(''):'<p class="nb-empty">No observations logged yet — play today\'s challenge to start.</p>';
  }
  const pollinatorSeen=(byType.pollinator||0)+(byType['noticed-pollinator']||0);
  const bloomSeen=(byType.bloom||0)+(byType['noticed-bloom']||0);
  const badges=[
    {icon:'🌳',label:'First Tree',earned:state.found.size>=1},
    {icon:'🌲',label:'Ten Species',earned:state.found.size>=10},
    {icon:'🍁',label:'Every Species',earned:state.found.size>=24},
    {icon:'🐝',label:'First Pollinator',earned:pollinatorSeen>=1},
    {icon:'🌸',label:'First Bloom',earned:bloomSeen>=1},
    {icon:'📍',label:'Map Builder',earned:added.length>=1},
    {icon:'🛡️',label:'Tree Bed Steward',earned:Object.keys(sponsors).length>=1},
    {icon:'🔍',label:'Field Scientist',earned:obs.length>=10},
    {icon:'🔄',label:'Returning Naturalist',earned:days>=2}
  ];
  if($('nb-badges')){
    $('nb-badges').innerHTML=badges.map(b=>`<div class="nb-badge${b.earned?' earned':''}"><span>${b.icon}</span><small>${b.label}</small></div>`).join('');
  }
  const signedIn=!!window.TREEWALK_PROFILE;
  if($('nb-sync-cta'))$('nb-sync-cta').hidden=signedIn;
  if($('nb-synced-note'))$('nb-synced-note').hidden=!signedIn;
  if(signedIn&&$('nb-synced-name')){
    const name=window.TREEWALK_PROFILE.displayName;
    $('nb-synced-name').textContent=name?`Synced as ${name}`:'Synced to your account';
  }
  if($('nb-title')){
    const name=signedIn&&window.TREEWALK_PROFILE.displayName;
    $('nb-title').textContent=name?`${name}'s Forest`:'Your Forest';
  }
}
function openNotebook(){renderNotebook();if($('notebook'))$('notebook').classList.add('open')}
function closeNotebook(){if($('notebook'))$('notebook').classList.remove('open')}
function refreshNotebookIfOpen(){if($('notebook')&&$('notebook').classList.contains('open'))renderNotebook()}

function savedWalks(){return JSON.parse(localStorage.getItem('treewalk-walks')||'[]')}

function saveWalk(){
  const walks=savedWalks();
  walks.unshift({
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
    name:$('walk-summary-name').value.trim()||'Untitled TreeWalk',
    startedAt:state.walkStartedAt,
    finishedAt:Date.now(),
    treesMet:Math.max(0,state.found.size-state.walkStartFound),
    path:state.walkPath.map(p=>[Number(p.lat.toFixed(5)),Number(p.lng.toFixed(5))])
  });
  localStorage.setItem('treewalk-walks',JSON.stringify(walks.slice(0,50)));
  $('walk-summary').classList.remove('open');
  showStatus('Saved to My TreeWalks',3000);
  resetWalkTracking();
}

function discardWalk(){
  $('walk-summary').classList.remove('open');
  resetWalkTracking();
}

// If someone opened an "Invite a neighbor" link, jump straight to that tree
// bed once it loads nearby (only works if the recipient is actually near
// it, which is the point — it's a neighbor invite, not a general share).
let pendingDeepLinkId=(location.hash||'').indexOf('#tree-')===0?location.hash.slice(6):null;

async function loadTrees(lat,lng){
  if(state.loading)return;
  state.loading=true;
  showStatus(`Looking for nearby trees in ${state.city.name}…`);
  try{
    const data=await state.city.fetchTrees(lat,lng);
    const known=new Set(state.trees.map(t=>t.id));
    const additions=data.filter(t=>!known.has(t.id));
    state.trees.push(...additions);
    drawTrees(additions);
    let sharedCount=0;
    if(window.fetchSharedTrees){
      const shared=await window.fetchSharedTrees(lat,lng);
      const knownNow=new Set(state.trees.map(t=>t.id));
      const sharedAdditions=shared.filter(t=>!knownNow.has(t.id));
      if(sharedAdditions.length){
        state.trees.push(...sharedAdditions);
        drawTrees(sharedAdditions);
        sharedCount=sharedAdditions.length;
      }
    }
    state.lastLoaded={lat,lng};
    const total=additions.length+sharedCount;
    showStatus(total?`${total} more tree${total===1?'':'s'} discovered along your walk`:`You're still inside the explored area`,3000);
    if(pendingDeepLinkId){
      const match=state.trees.find(t=>t.id===pendingDeepLinkId);
      if(match){pendingDeepLinkId=null;state.map.setView([match.lat,match.lng],18);openTree(match);}
    }
  }catch(e){showStatus(`The ${state.city.name} tree map could not load. Check your connection.`,5000)}finally{state.loading=false}
}

function drawTrees(trees=state.trees){
  trees.forEach(tree=>{
    // Only draggable while still mid-placement (before "Plant this tree
    // bed" is tapped). Once planted, a tree is permanently fixed — nobody,
    // including whoever added it, can move it. confirmPlant() also
    // explicitly disables dragging on the live marker instance, since
    // Leaflet's draggable option is fixed at marker creation and changing
    // tree.pending afterward doesn't retroactively affect it.
    const marker=L.marker([tree.lat,tree.lng],{icon:markerIconFor(tree),draggable:tree.source==='community'&&tree.mine===true&&tree.pending===true});
    marker.on('click',()=>{
      if(tree.pending&&state.pendingPlant===tree){confirmPlant();return}
      if(state.game&&state.game.active&&state.game.mode==='species'&&tree.speciesCommon&&!state.game.results.has(tree.id)){openGuess(tree);return}
      openTree(tree);
    });
    if(tree.source==='community'&&tree.mine===true&&tree.pending===true){
      marker.on('dragend',e=>{
        const pos=e.target.getLatLng();
        tree.lat=pos.lat;tree.lng=pos.lng;
        updateAddedTree(tree);
      });
    }
    tree.marker=marker;
    state.clusters.addLayer(marker);
  });
}

const TIER_ICONS=['🌱','🛡️','🌿','🌸','🦋'];
const TIER_LABELS=['Founding round','Guard funded','Soil & plants funded','Pollinator garden funded','Thriving ecosystem — fully funded'];

function sponsorRecords(){return JSON.parse(localStorage.getItem('nytree-sponsor')||'{}')}
function sponsorFor(id){return sponsorRecords()[id]||null}
function tierFor(rec){
  if(!rec)return 0;
  const unit=Math.max(20,Number(rec.threshold)||150);
  const raised=Math.max(0,Number(rec.raised)||0);
  return Math.min(4,Math.floor(raised/unit));
}
function nextGoalFor(rec){
  const unit=Math.max(20,Number(rec.threshold)||150);
  const tier=tierFor(rec);
  return unit*Math.min(4,tier+1);
}
function markerIconFor(tree){
  if(state.game&&state.game.mode==='species'&&tree.speciesCommon){
    if(state.game.active){
      const result=state.game.results.get(tree.id);
      if(!result)return L.divIcon({className:'',html:'<div class="tree-marker mystery">?</div>',iconSize:[30,30],iconAnchor:[15,15]});
      const cls=result==='correct'?'guess-correct':'guess-wrong';
      const glyph=result==='correct'?'✓':'✗';
      return L.divIcon({className:'',html:`<div class="tree-marker ${cls}">${glyph}</div>`,iconSize:[30,30],iconAnchor:[15,15]});
    }
    if(state.game.missed&&state.game.missed.has(tree.id)){
      return L.divIcon({className:'',html:'<div class="tree-marker missed-tree">!</div>',iconSize:[32,32],iconAnchor:[16,16]});
    }
  }
  const rec=sponsorFor(tree.id);
  const tier=tierFor(rec);
  const isCommunity=tree.source==='community';
  const hasObservation=observationsFor(tree.id).length>0;
  // A tree someone has "gotten involved" with (rec exists) but that hasn't
  // raised any money yet (tier 0) used to fall through to the same plain
  // dot as an untouched tree — clicking "Get involved" produced no visible
  // change at all. isClaimed keeps that distinct from here on.
  const isClaimed=!!rec;
  if(tier<=0&&!isCommunity&&!hasObservation&&!isClaimed)return L.divIcon({className:'',html:'<div class="tree-marker">●</div>',iconSize:[30,30],iconAnchor:[15,15]});
  const isPark=tree.locationType==='park';
  const isGarden=tree.locationType==='garden';
  const awaitingVerification=isCommunity&&tree.verificationStatus==='pending';
  const classes=['tree-marker'];
  if(isCommunity)classes.push('community-added');
  if(isCommunity&&isPark)classes.push('park-added');
  if(isCommunity&&isGarden)classes.push('garden-added');
  if(tier>0)classes.push('tier-'+tier);
  if(isClaimed&&tier<=0)classes.push('claimed');
  if(hasObservation)classes.push('observed');
  if(tree.pending)classes.push('pending-plant');
  if(awaitingVerification)classes.push('unverified');
  const communityBadge=isPark?'🌳':(isGarden?'🏡':'🌱');
  const badge=tree.pending?'📍':(awaitingVerification?'⏳':(tier>0?TIER_ICONS[tier]:(isClaimed?'🤝':(isCommunity?communityBadge:''))));
  const html=`<div class="${classes.join(' ')}">${badge?`<span class="tier-badge">${badge}</span>`:''}</div>`;
  return L.divIcon({className:'',html,iconSize:[34,34],iconAnchor:[17,17]});
}
function refreshTreeMarker(tree){
  if(tree&&tree.marker)tree.marker.setIcon(markerIconFor(tree));
}

function addedTreeRecords(){return JSON.parse(localStorage.getItem('nytree-added')||'[]')}
function saveAddedTree(tree){
  const list=addedTreeRecords();
  list.push({id:tree.id,lat:tree.lat,lng:tree.lng,speciesCommon:tree.speciesCommon,address:tree.address,addedAt:tree.addedAt,locationType:tree.locationType||'street',placeName:tree.placeName||'',verificationStatus:tree.verificationStatus||null,dbId:tree.dbId||null});
  localStorage.setItem('nytree-added',JSON.stringify(list));
}
function updateAddedTree(tree){
  const list=addedTreeRecords().map(t=>t.id===tree.id?{...t,lat:tree.lat,lng:tree.lng,speciesCommon:tree.speciesCommon,address:tree.address,locationType:tree.locationType||'street',placeName:tree.placeName||'',verificationStatus:tree.verificationStatus||t.verificationStatus||null,dbId:tree.dbId||t.dbId||null}:t);
  localStorage.setItem('nytree-added',JSON.stringify(list));
  refreshTreeMarker(tree);
  if(!tree.pending)window.dispatchEvent(new CustomEvent('treewalk-tree-planted',{detail:{id:tree.id,lat:tree.lat,lng:tree.lng,speciesCommon:tree.speciesCommon,address:tree.address,locationType:tree.locationType||'street',placeName:tree.placeName||''}}));
}
function loadAddedTrees(){
  const list=addedTreeRecords();
  if(!list.length)return;
  const trees=list.map(t=>({...t,speciesScientific:'',city:state.city,source:'community',mine:true,locationType:t.locationType||'street',placeName:t.placeName||'',verificationStatus:t.verificationStatus||null,dbId:t.dbId||null}));
  state.trees.push(...trees);
  drawTrees(trees);
}

// Server confirms (via a trigger, never trusting the client) whether a
// newly-planted tree is auto-verified (founder / Tree Care Captain) or
// needs a second neighbor to confirm it. cloud-sync.js dispatches this
// after every successful upsert of a community tree.
window.addEventListener('treewalk-tree-verification-status',e=>{
  const {id,dbId,status}=e.detail;
  const tree=state.trees.find(t=>t.id===id);
  if(tree){
    tree.verificationStatus=status;
    if(dbId)tree.dbId=dbId;
    refreshTreeMarker(tree);
  }
  const list=addedTreeRecords().map(t=>t.id===id?{...t,verificationStatus:status,dbId:dbId||t.dbId||null}:t);
  localStorage.setItem('nytree-added',JSON.stringify(list));
  if(state.selected&&state.selected.id===id)openTree(tree||state.selected);
});

// Any signed-in neighbor (other than whoever added the tree) can confirm a
// pending tree's pin location and photos match. One confirmation is enough
// to flip it to verified — the DB trigger enforces this server-side, this
// is just the UI trigger.
async function verifyThisTree(){
  const tree=state.selected;
  if(!tree||tree.source!=='community'||!tree.dbId)return;
  if(!window.submitTreeVerification){showStatus('Sign in to confirm trees.',3000);return}
  const btn=$('verify-tree-button');
  if(btn){btn.disabled=true;btn.textContent='Confirming…'}
  const result=await window.submitTreeVerification(tree.dbId);
  if(result&&result.error){
    showStatus(result.error,3500);
    if(btn){btn.disabled=false;btn.textContent='✓ Confirm this tree'}
    return;
  }
  tree.verificationStatus='verified';
  refreshTreeMarker(tree);
  showStatus('Thanks — this tree is now verified.',3000);
  openTree(tree);
}

// Type/park-name picker on the plant-confirm sheet. Remembers the last
// choice in localStorage so documenting many trees in the same park (the
// "map this whole park" use case) doesn't require re-picking every time.
function lastPlantType(){return localStorage.getItem('nytree-last-plant-type')||'street'}
function lastPlantPlace(){return localStorage.getItem('nytree-last-plant-place')||''}
const PLACE_FIELD_COPY={
  park:{label:'Which park?',placeholder:'e.g. Blue Playground'},
  garden:{label:'Name this space (optional)',placeholder:'e.g. My backyard garden'}
};
function updatePlaceFieldCopy(type){
  const copy=PLACE_FIELD_COPY[type];
  if(!copy)return;
  if($('plant-place-label'))$('plant-place-label').textContent=copy.label;
  if($('plant-place-name'))$('plant-place-name').placeholder=copy.placeholder;
}
function setPlantType(type){
  const tree=state.pendingPlant;
  if(!tree)return;
  tree.locationType=type;
  document.querySelectorAll('.plant-type-option').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  if($('plant-place-field'))$('plant-place-field').hidden=type==='street';
  updatePlaceFieldCopy(type);
  if(type!=='street'&&$('plant-place-name')&&!$('plant-place-name').value&&type===lastPlantType())$('plant-place-name').value=lastPlantPlace();
}
function updatePlantPlaceName(value){
  const tree=state.pendingPlant;
  if(!tree)return;
  tree.placeName=value.trim();
}

function addMissingTree(){
  const place=(lat,lng)=>{
    const id='community-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
    const type=lastPlantType();
    const tree={id,lat,lng,speciesCommon:'',speciesScientific:'',address:'',city:state.city,source:'community',dbh:null,health:null,addedAt:Date.now(),pending:true,mine:true,locationType:type,placeName:type==='park'?lastPlantPlace():''};
    state.trees.push(tree);
    drawTrees([tree]);
    saveAddedTree(tree);
    state.map.setView([lat,lng],18);
    showPlantConfirm(tree);
  };
  if(state.user){place(state.user.lat,state.user.lng);return}
  if(!navigator.geolocation){showStatus('Location is not available on this device.',4000);return}
  showStatus('Finding your exact spot…');
  navigator.geolocation.getCurrentPosition(
    pos=>place(pos.coords.latitude,pos.coords.longitude),
    ()=>showStatus('Turn on location access so TreeWalk can drop the pin exactly where you are.',5000),
    {enableHighAccuracy:true,timeout:15000,maximumAge:10000}
  );
}

function showPlantConfirm(tree){
  state.pendingPlant=tree;
  const type=tree.locationType||'street';
  document.querySelectorAll('.plant-type-option').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
  if($('plant-place-field'))$('plant-place-field').hidden=type==='street';
  updatePlaceFieldCopy(type);
  if($('plant-place-name'))$('plant-place-name').value=tree.placeName||'';
  if($('plant-confirm')){
    $('plant-confirm').classList.add('show');
    $('plant-confirm').setAttribute('aria-hidden','false');
  }
}
function hidePlantConfirm(){
  if($('plant-confirm')){
    $('plant-confirm').classList.remove('show');
    $('plant-confirm').setAttribute('aria-hidden','true');
  }
}
function confirmPlant(){
  const tree=state.pendingPlant;
  if(!tree)return;
  tree.pending=false;
  state.pendingPlant=null;
  hidePlantConfirm();
  // Permanently fixed once planted — the marker option that made it
  // draggable was set at creation time and doesn't update on its own, so
  // explicitly turn dragging off on the live instance too.
  if(tree.marker&&tree.marker.dragging)tree.marker.dragging.disable();
  localStorage.setItem('nytree-last-plant-type',tree.locationType||'street');
  if(tree.locationType==='park')localStorage.setItem('nytree-last-plant-place',tree.placeName||'');
  refreshTreeMarker(tree);
  window.dispatchEvent(new CustomEvent('treewalk-tree-planted',{detail:{id:tree.id,lat:tree.lat,lng:tree.lng,speciesCommon:tree.speciesCommon,address:tree.address,locationType:tree.locationType||'street',placeName:tree.placeName||''}}));
  showSeedReward(SEED_VALUES.added);
  const plantStatus=tree.locationType==='park'?`🌳 Tree planted in ${tree.placeName||'the park'} — added to the living forest.`
    :tree.locationType==='garden'?`🏡 ${tree.placeName?`Garden tree planted in ${tree.placeName}`:'Garden tree planted'} — added to the living forest.`
    :'🌱 Tree bed planted — added to the living forest.';
  showStatus(plantStatus,3000);
  showPlantReward(tree);
}

// A brief floating "+N 🌱" moment — the actual reward, not just a status
// line buried in the corner. Reusable anywhere a seed-earning action
// completes.
function showSeedReward(amount){
  const el=document.createElement('div');
  el.className='seed-reward-toast';
  el.textContent=`+${amount} 🌱`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{
    el.classList.remove('show');
    setTimeout(()=>el.remove(),350);
  },1300);
}

// After planting, the tree already exists and already earned its seeds —
// documentation is a bonus, not a gate. This is a light, easy-to-dismiss
// nudge rather than dropping straight into the full tree card.
function showPlantReward(tree){
  state.pendingDocument=tree;
  if($('plant-reward')){
    $('plant-reward').classList.add('show');
    $('plant-reward').setAttribute('aria-hidden','false');
  }
  clearTimeout(state.plantRewardTimer);
  state.plantRewardTimer=setTimeout(dismissPlantReward,7000);
}
function hidePlantRewardPanel(){
  if($('plant-reward')){
    $('plant-reward').classList.remove('show');
    $('plant-reward').setAttribute('aria-hidden','true');
  }
  clearTimeout(state.plantRewardTimer);
}
function dismissPlantReward(){
  hidePlantRewardPanel();
  state.pendingDocument=null;
}
function documentPlantedNow(){
  const tree=state.pendingDocument;
  hidePlantRewardPanel();
  state.pendingDocument=null;
  if(!tree)return;
  state.selected=tree;
  if($('document-tree-button'))$('document-tree-button').click();
}
function applyDocumentedSpecies(treeId,species){
  const tree=state.trees.find(t=>t.id===treeId);
  if(!tree||tree.speciesCommon)return;
  tree.speciesCommon=species;
  if(tree.source==='community')updateAddedTree(tree);else refreshTreeMarker(tree);
  if(state.selected&&state.selected.id===treeId)openTree(tree);
}
window.addEventListener('treewalk-species-documented',e=>applyDocumentedSpecies(e.detail.treeId,e.detail.species));

function cancelPlant(){
  const tree=state.pendingPlant;
  if(!tree)return;
  state.pendingPlant=null;
  hidePlantConfirm();
  if(tree.marker){state.clusters.removeLayer(tree.marker)}
  state.trees=state.trees.filter(t=>t.id!==tree.id);
  const list=addedTreeRecords().filter(t=>t.id!==tree.id);
  localStorage.setItem('nytree-added',JSON.stringify(list));
  showStatus('Pin removed.',2500);
}

function removeTree(){
  const tree=state.selected;
  if(!tree||tree.source!=='community')return;
  const isFounder=!!(window.TREEWALK_PROFILE&&window.TREEWALK_PROFILE.isFounder);
  if(!(tree.mine===true||isFounder))return;
  if(!confirm('Remove this tree bed from the map? This can\'t be undone.'))return;
  if(tree.marker)state.clusters.removeLayer(tree.marker);
  state.trees=state.trees.filter(t=>t.id!==tree.id);
  if(tree.mine===true){
    const list=addedTreeRecords().filter(t=>t.id!==tree.id);
    localStorage.setItem('nytree-added',JSON.stringify(list));
  }
  // Dispatched by client_id regardless of who's deleting — the server-side
  // RLS policy decides whether it actually goes through: owners can delete
  // their own trees, and the founder can delete any tree.
  window.dispatchEvent(new CustomEvent('treewalk-tree-removed',{detail:{id:tree.id}}));
  $('tree-sheet').classList.remove('open');
  $('tree-sheet').setAttribute('aria-hidden','true');
  state.selected=null;
  showStatus('Tree bed removed.',2500);
}

function openTree(tree){
  state.selected=tree;
  const common=tree.speciesCommon||'mystery street tree';
  const profile=profileFor(common);
  $('tree-name').textContent=common;
  $('tree-latin').textContent=tree.speciesScientific||'';
  $('tree-intro').textContent=profile.about||`This tree is part of ${tree.city==='philly'?'Philadelphia':'New York City'}'s living urban forest. Its complete species story is being prepared.`;
  $('leaf-art').style.backgroundImage=profile.leafFile?`url('assets/leaves/${profile.leafFile}.png')`:'none';
  $('leaf-art').classList.toggle('missing',!profile.leafFile);
  $('leaf-art').textContent=profile.leafFile?'':'Leaf guide coming soon';
  $('leaf-art').setAttribute('aria-label',`${profile.shape} of a ${common}`);
  $('species-tags').innerHTML='';
  $('tree-size').textContent=tree.dbh?`${tree.dbh} inches`:'Unknown';
  $('tree-health').textContent=tree.health||'Not listed';
  $('tree-distance').textContent=distanceLabel(tree);
  $('tree-prompt').textContent=profile.look||'Look closely at the leaves, bark, buds, fruit, and branching pattern. This species activity is still being prepared.';
  const addressParts=[tree.address,tree.region].filter(Boolean);
  if(tree.locationType==='park'&&tree.placeName)addressParts.push(`🌳 ${tree.placeName}`);
  if(tree.locationType==='garden'&&tree.placeName)addressParts.push(`🏡 ${tree.placeName}`);
  if(tree.source==='community'){
    const plantedIcon=tree.locationType==='park'?'🌳':(tree.locationType==='garden'?'🏡':'🌱');
    addressParts.push(tree.mine===false?`${plantedIcon} Planted by a TreeWalk neighbor`:`${plantedIcon} Planted by you`);
  }
  $('tree-address').textContent=addressParts.join(' · ');
  const isFounder=!!(window.TREEWALK_PROFILE&&window.TREEWALK_PROFILE.isFounder);
  if($('remove-tree-button'))$('remove-tree-button').hidden=!(tree.source==='community'&&(tree.mine===true||isFounder));
  if($('tree-verification-status')){
    const vs=tree.source==='community'?tree.verificationStatus:null;
    if(!vs){
      $('tree-verification-status').hidden=true;
    }else{
      $('tree-verification-status').hidden=false;
      $('tree-verification-status').textContent=vs==='pending'
        ?'⏳ Awaiting a second neighbor to confirm this tree.'
        :'✓ Verified';
    }
  }
  if($('verify-tree-button')){
    const canVerify=tree.source==='community'&&tree.verificationStatus==='pending'&&tree.mine!==true&&!!window.TREEWALK_PROFILE&&!!tree.dbId;
    $('verify-tree-button').hidden=!canVerify;
    $('verify-tree-button').disabled=false;
    $('verify-tree-button').textContent='✓ Confirm this tree';
  }
  $('found-button').textContent=state.found.has(tree.id)?'✓ Tree found!':'I found this tree!';
  if($('remember-tree-button')){
    const remembered=state.found.has(tree.id);
    $('remember-tree-button').textContent=remembered?'★ Remembered':'★ Remember this tree';
    $('remember-tree-button').classList.toggle('remembered',remembered);
  }
  updateCare(tree);
  renderStem(profile.key);
  renderDeepDive(profile.key);
  renderSponsor(tree);
  $('tree-sheet').classList.add('open');
  $('tree-sheet').setAttribute('aria-hidden','false');
}

function renderDeepDive(canonicalKey){
  if(!window.TREEWALK_DEEPDIVE)return;
  const dd=TREEWALK_DEEPDIVE.forSpecies(canonicalKey);
  if($('dd-origin'))$('dd-origin').textContent=dd.origin||'';
  if($('dd-features'))$('dd-features').textContent=dd.features||'';
  if($('dd-seasons')){
    const order=['spring','summer','fall','winter'];
    const labels={spring:'Spring',summer:'Summer',fall:'Fall',winter:'Winter'};
    $('dd-seasons').innerHTML=order.filter(s=>dd.seasons&&dd.seasons[s]).map(s=>`<div class="dd-season"><b>${labels[s]}</b><span>${dd.seasons[s]}</span></div>`).join('');
  }
  if($('dd-facts'))$('dd-facts').innerHTML=(dd.facts||[]).map(f=>`<li>${f}</li>`).join('');
  if($('kid-story-text'))$('kid-story-text').textContent=dd.kidVersion||'';
}

function renderStem(canonicalKey){
  if(!window.TREEWALK_CURRICULUM||!$('stem-bands'))return;
  const activity=TREEWALK_CURRICULUM.forSpecies(canonicalKey);
  const band=localStorage.getItem('treewalk-stem-band')||'k2';
  $('stem-bands').innerHTML=TREEWALK_CURRICULUM.BANDS.map(b=>`<button class="stem-band${b.id===band?' active':''}" data-band="${b.id}">${b.label}</button>`).join('');
  $('stem-text').textContent=activity[band]||activity.k2;
  if($('stem-art'))$('stem-art').textContent=(activity.art&&(activity.art[band]||activity.art.k2))||'';
  $('stem-bands').querySelectorAll('[data-band]').forEach(btn=>btn.onclick=()=>{
    localStorage.setItem('treewalk-stem-band',btn.dataset.band);
    $('stem-bands').querySelectorAll('[data-band]').forEach(b=>b.classList.toggle('active',b===btn));
    $('stem-text').textContent=activity[btn.dataset.band]||activity.k2;
    if($('stem-art'))$('stem-art').textContent=(activity.art&&(activity.art[btn.dataset.band]||activity.art.k2))||'';
  });
  renderStemDownloads(leafFiles[canonicalKey]);
}

// Links the 72 pre-made curriculum PDFs (coloring sheet, ID sheet, full
// lesson plan) in 07-treewalk-build-CURRENT-LIVE-SOURCE/curriculum/ — only
// exists for the 24 curated species that also have real leaf art.
function renderStemDownloads(slug){
  const el=$('stem-downloads');
  if(!el)return;
  if(!slug){el.hidden=true;return}
  el.hidden=false;
  if($('stem-dl-coloring'))$('stem-dl-coloring').href=`curriculum/${slug}-coloring-sheet.pdf`;
  if($('stem-dl-id'))$('stem-dl-id').href=`curriculum/${slug}-id-sheet.pdf`;
  if($('stem-dl-lesson'))$('stem-dl-lesson').href=`curriculum/${slug}-lesson-plan.pdf`;
}

function careRecords(){return JSON.parse(localStorage.getItem('nytree-care')||'{}')}
function updateCare(tree){
  const record=careRecords()[tree.id];
  if(!record){$('care-days').textContent='—';$('care-title').textContent='No watering reported yet';$('care-copy').textContent='Be the first neighbor to care for this tree.';return}
  const days=Math.max(0,Math.floor((Date.now()-record.date)/86400000));
  $('care-days').textContent=days;
  $('care-title').textContent=days===0?'Watered today':`Watered ${days} day${days===1?'':'s'} ago`;
  $('care-copy').textContent=`${record.gallons} gallons reported through TreeWalk on this device.`;
}

function waterTree(){
  if(!state.selected)return;
  const records=careRecords();
  records[state.selected.id]={date:Date.now(),gallons:15};
  localStorage.setItem('nytree-care',JSON.stringify(records));
  updateCare(state.selected);
  $('water-button').textContent='✓ 15 gallons reported today';
}

function renderSponsor(tree){
  const rec=sponsorFor(tree.id);
  // Collapsed by default every time a tree is opened — stewardship shouldn't
  // compete with discovering the tree itself. Tap the summary row to expand.
  if($('sponsor-detail'))$('sponsor-detail').hidden=true;
  if($('sponsor-claim-form'))$('sponsor-claim-form').hidden=true;
  const stewardCount=rec?(rec.stewards&&rec.stewards.length?rec.stewards.length:1):0;
  if($('sponsor-summary-icon'))$('sponsor-summary-icon').textContent=rec?TIER_ICONS[tierFor(rec)]:'🌱';
  if($('sponsor-summary-text'))$('sponsor-summary-text').textContent=rec
    ?`${stewardCount} neighbor${stewardCount===1?'':'s'} involved — help this tree bed grow`
    :'No one\'s gotten involved with this tree bed yet';
  if(!rec){
    if($('sponsor-unclaimed'))$('sponsor-unclaimed').hidden=false;
    if($('sponsor-claimed'))$('sponsor-claimed').hidden=true;
    return;
  }
  if($('sponsor-unclaimed'))$('sponsor-unclaimed').hidden=true;
  if($('sponsor-claimed'))$('sponsor-claimed').hidden=false;
  const tier=tierFor(rec);
  const raised=Math.max(0,Number(rec.raised)||0);
  const goal=nextGoalFor(rec);
  const pct=tier>=4?100:Math.max(0,Math.min(100,Math.round((raised/goal)*100)));
  if($('sponsor-tier-badge'))$('sponsor-tier-badge').textContent=TIER_ICONS[tier];
  if($('sponsor-tier-label'))$('sponsor-tier-label').textContent=TIER_LABELS[tier];
  const typeLabel=rec.claimType==='business'?'Sponsored by':rec.claimType==='open'?'Started by':'Involved:';
  if($('sponsor-claimant'))$('sponsor-claimant').textContent=`${typeLabel} ${rec.claimantName||'a neighbor'}`;
  if($('sponsor-progress-fill'))$('sponsor-progress-fill').style.width=pct+'%';
  if($('sponsor-progress-label'))$('sponsor-progress-label').textContent=tier>=4?`$${raised} raised — fully funded!`:`$${raised} of $${goal} raised toward the next milestone`;
  if($('sponsor-stewards-list'))$('sponsor-stewards-list').textContent=(rec.stewards&&rec.stewards.length)?rec.stewards.join(', '):'—';
  if($('sponsor-gofundme-link')){
    if(rec.gofundmeUrl){$('sponsor-gofundme-link').href=rec.gofundmeUrl;$('sponsor-gofundme-link').hidden=false;}
    else $('sponsor-gofundme-link').hidden=true;
  }
  // Getting involved (joining the stewards list) is open to anyone on any
  // tree bed, not just ones explicitly marked "open" — that gate belonged
  // to the old claim-ownership model, not the get-involved one.
  if($('sponsor-join-button'))$('sponsor-join-button').hidden=false;
  updateCaptainGating();
}

// Starting a funding campaign (the guard-cost/threshold/GoFundMe fields) is
// reserved for verified Tree Care Captains — see 10-profiles-care-captain-
// migration.sql. Everyone else can still get involved; they just can't set
// up the campaign fields themselves yet.
function updateCaptainGating(){
  const isCaptain=!!(window.TREEWALK_PROFILE&&window.TREEWALK_PROFILE.isCareCaptain);
  if($('sponsor-campaign-fields'))$('sponsor-campaign-fields').hidden=!isCaptain;
  if($('sponsor-captain-note'))$('sponsor-captain-note').hidden=isCaptain;
  if($('sponsor-claim-submit'))$('sponsor-claim-submit').textContent=isCaptain?'Start the founding round':'Get involved';
}
window.addEventListener('treewalk-profile-loaded',updateCaptainGating);
window.addEventListener('treewalk-profile-loaded',refreshNotebookIfOpen);

function inviteNeighbor(){
  if(!state.selected)return;
  const common=state.selected.speciesCommon||'this tree';
  const url=new URL(location.href);
  url.hash=`tree-${state.selected.id}`;
  const text=`I'm getting involved with a ${common} tree bed on TreeWalk — want to join in?`;
  if(navigator.share){
    navigator.share({title:'TreeWalk NYC',text,url:url.toString()}).catch(()=>{});
  }else if(navigator.clipboard){
    navigator.clipboard.writeText(`${text} ${url}`).then(()=>showStatus('Link copied — paste it anywhere to invite someone.',3500));
  }else{
    showStatus(url.toString(),6000);
  }
}

function submitClaim(){
  if(!state.selected)return;
  const type=state.sponsorClaimType||'individual';
  const name=($('sponsor-name-input')&&$('sponsor-name-input').value.trim())||(type==='business'?'A local business':'A neighbor');
  const threshold=Math.max(20,Number($('sponsor-threshold-input')&&$('sponsor-threshold-input').value)||150);
  const url=($('sponsor-url-input')&&$('sponsor-url-input').value.trim())||'';
  const records=sponsorRecords();
  records[state.selected.id]={
    claimType:type,claimantName:name,guardClass:state.sponsorGuardClass||'diy',
    threshold,raised:0,gofundmeUrl:url,stewards:[name],claimedAt:Date.now(),touchedAt:Date.now()
  };
  localStorage.setItem('nytree-sponsor',JSON.stringify(records));
  renderSponsor(state.selected);
  refreshTreeMarker(state.selected);
  showStatus('Tree bed claimed — the founding round has started.',4000);
}

function joinFounding(){
  if(!state.selected)return;
  const records=sponsorRecords();
  const rec=records[state.selected.id];
  if(!rec)return;
  const name=(prompt('Add your name to this bed\'s founding stewards list:')||'').trim();
  if(!name)return;
  rec.stewards=rec.stewards||[];
  if(!rec.stewards.includes(name))rec.stewards.push(name);
  records[state.selected.id]=rec;
  localStorage.setItem('nytree-sponsor',JSON.stringify(records));
  renderSponsor(state.selected);
}

function updateRaised(){
  if(!state.selected)return;
  const records=sponsorRecords();
  const rec=records[state.selected.id];
  if(!rec)return;
  const val=prompt(`Update the total raised so far on this bed's GoFundMe (current: $${rec.raised||0}):`,rec.raised||0);
  if(val===null)return;
  rec.raised=Math.max(0,Number(val)||0);
  rec.touchedAt=Date.now();
  records[state.selected.id]=rec;
  localStorage.setItem('nytree-sponsor',JSON.stringify(records));
  renderSponsor(state.selected);
  refreshTreeMarker(state.selected);
}

function updateGofundmeLink(){
  if(!state.selected)return;
  const records=sponsorRecords();
  const rec=records[state.selected.id];
  if(!rec)return;
  const val=(prompt('Paste this bed\'s GoFundMe link:',rec.gofundmeUrl||'https://www.gofundme.com/f/')||'').trim();
  if(val===null)return;
  rec.gofundmeUrl=val;
  records[state.selected.id]=rec;
  localStorage.setItem('nytree-sponsor',JSON.stringify(records));
  renderSponsor(state.selected);
}

function printActivity(){
  if(!state.selected)return;
  const common=state.selected.speciesCommon||'street tree';
  const profile=profileFor(common);
  const leafUrl=profile.leafFile?new URL(`assets/leaves/${profile.leafFile}.png`,location.href):'';
  const band=localStorage.getItem('treewalk-stem-band')||'k2';
  const curriculum=window.TREEWALK_CURRICULUM?TREEWALK_CURRICULUM.forSpecies(profile.key):null;
  const bandMeta=window.TREEWALK_CURRICULUM?TREEWALK_CURRICULUM.BANDS.find(b=>b.id===band):null;
  const bandLabel=bandMeta?bandMeta.label:'K–2';
  const scienceText=curriculum?(curriculum[band]||curriculum.k2||''):'';
  const artText=curriculum?((curriculum.art&&(curriculum.art[band]||curriculum.art.k2))||''):'';
  const standardsByBand={
    k2:'Touches on NGSS K-LS1-1 (patterns in living things) and National Core Arts Standards VA:Cr1 (grades K–2).',
    g35:'Touches on NGSS 3-LS4 / 5-LS2 (traits and ecosystems) and National Core Arts Standards VA:Cr2 (grades 3–5).',
    g68:'Touches on NGSS MS-LS1 / MS-LS2 (structure, function, and ecosystems) and National Core Arts Standards VA:Cr2 / Re7 (grades 6–8).',
    g912:'Touches on NGSS HS-LS2 (ecosystems) and HS-LS4 (evolution), and National Core Arts Standards Proficient-level Creating and Responding anchor standards (grades 9–12).'
  };
  const standardsLine=standardsByBand[band]||standardsByBand.k2;
  const youngBand=band==='k2'||band==='g35';
  const heading=youngBand?'Color the leaf. Then find the real tree.':'Observe the real tree, then complete this record.';
  const box1Label=youngBand?'What colors, textures, or shapes did you notice?':'Field notes: record your observations below.';
  const box2Label=youngBand?'Draw something living on or near this tree.':'Sketch or notes for the art activity above.';
  const page=`<!doctype html><html><head><title>${common} activity — grade band ${bandLabel}</title><style>body{font-family:Arial,sans-serif;color:#173126;margin:40px}h1{font-size:34px;margin-bottom:4px;text-transform:capitalize}.latin{font-style:italic;color:#647268}.band-tag{display:inline-block;background:#eef3ea;color:#173126;border-radius:99px;padding:3px 12px;font-size:12px;font-weight:700;margin:6px 0}.leaf{width:280px;height:245px;object-fit:contain;display:block;margin:20px auto;filter:grayscale(1);border:2px dashed #aab5a6;border-radius:24px}.section{border:2px solid #173126;border-radius:16px;margin:16px 0;padding:14px}.box{border:2px solid #173126;border-radius:16px;height:100px;margin:16px 0;padding:14px}.line{border-bottom:1px solid #9aa69c;height:30px}small{color:#637166}.standards{font-size:11px;color:#647268;border-top:1px solid #d7ded3;padding-top:10px;margin-top:20px}@media print{button{display:none}}</style></head><body><small>TREEWALK • MEET YOUR TREE NEIGHBORS</small><div class="band-tag">Grade band ${bandLabel}</div><h1>${common}</h1><div class="latin">${state.selected.speciesScientific||''}</div><p><b>Leaf clue:</b> ${profile.shape}</p>${leafUrl?`<img class="leaf" src="${leafUrl}">`:''}<div class="section"><b>Science</b><p>${scienceText}</p></div><div class="section"><b>🎨 Art activity</b><p>${artText}</p></div><h2>${heading}</h2><div class="box"><b>${box1Label}</b><div class="line"></div><div class="line"></div></div><div class="box"><b>${box2Label}</b></div><p><b>Tree address:</b> ${state.selected.address||'________________'}</p><p class="standards">${standardsLine}</p><button onclick="print()">Print this sheet</button></body></html>`;
  const win=open('','_blank');win.document.write(page);win.document.close();
}

function distanceLabel(tree){
  if(!state.user)return 'Nearby';
  const r=3959, p=Math.PI/180;
  const a=Math.sin((tree.lat-state.user.lat)*p/2)**2+Math.cos(state.user.lat*p)*Math.cos(tree.lat*p)*Math.sin((tree.lng-state.user.lng)*p/2)**2;
  const feet=2*r*Math.asin(Math.sqrt(a))*5280;
  return feet<1000?`${Math.round(feet/10)*10} ft`:`${(feet/5280).toFixed(1)} mi`;
}

function foundTree(){
  if(!state.selected)return;
  state.found.add(state.selected.id);
  localStorage.setItem('nytree-found',JSON.stringify([...state.found]));
  updateScore();
  $('found-button').textContent='✓ Tree found!';
  $('found-button').style.background='#35a853';
  if($('remember-tree-button')){
    $('remember-tree-button').textContent='★ Remembered';
    $('remember-tree-button').classList.add('remembered');
  }
}

function updateScore(){
  updateWalkHud();
  renderChallengeCard();
}

// The walk-session HUD is the connective spine: while walking, it's a live
// thread ("12 min • 5 trees • 3 obs") tying together every found-tree and
// observation event into one visible session, instead of a static lifetime
// count. Deliberately no distance/steps — engagement with the environment,
// not a fitness stat.
let walkHudTimer=null;
function updateWalkHud(){
  const active=!!state.walkStartedAt;
  const timeEl=$('walk-hud-time'),sep1=$('walk-hud-sep1'),sep2=$('walk-hud-sep2'),obsEl=$('walk-hud-obs'),label=$('found-count-label'),countEl=$('found-count');
  if(active){
    const mins=Math.max(0,Math.round((Date.now()-state.walkStartedAt)/60000));
    if(timeEl){timeEl.hidden=false;timeEl.textContent=`${mins} min`;}
    if(sep1)sep1.hidden=false;
    if(sep2)sep2.hidden=false;
    const obsCount=observationRecords().filter(o=>o.timestamp>=state.walkStartedAt).length;
    if(obsEl){obsEl.hidden=false;obsEl.textContent=`${obsCount} obs`;}
    if(label)label.textContent='trees';
    if(countEl)countEl.textContent=Math.max(0,state.found.size-state.walkStartFound);
    if(!walkHudTimer)walkHudTimer=setInterval(updateWalkHud,20000);
  }else{
    if(timeEl)timeEl.hidden=true;
    if(sep1)sep1.hidden=true;
    if(sep2)sep2.hidden=true;
    if(obsEl)obsEl.hidden=true;
    if(label)label.textContent='trees found';
    if(countEl)countEl.textContent=state.found.size;
    if(walkHudTimer){clearInterval(walkHudTimer);walkHudTimer=null;}
  }
}

const CHALLENGE_TYPES={
  pollinator:{icon:'🐝',label:'Pollinator spotted',prompt:'Find a pollinator visiting a tree or plant',cooldown:2},
  bloom:{icon:'🌸',label:'Bloom documented',prompt:'Find a tree or plant in bloom',cooldown:4,months:[1,2,3,4,5,6,7]},
  fruit:{icon:'🍒',label:'Fruit found',prompt:'Find a tree with fruit or seed pods',cooldown:4,months:[4,5,6,7,8,9,10]},
  bud:{icon:'🌱',label:'Bud spotted',prompt:'Find an unopened bud',cooldown:4,months:[0,1,2,3]},
  colorchange:{icon:'🍂',label:'Color change noted',prompt:'Find a leaf that\'s starting to change color',cooldown:4,months:[7,8,9,10]},
  bare:{icon:'🌳',label:'Bare tree noted',prompt:'Find a bare, leafless tree',cooldown:5,months:[10,11,0,1,2]},
  lichen:{icon:'🍃',label:'Lichen found',prompt:'Find a tree with lichen or moss on its bark',cooldown:5},
  leafshapes:{icon:'🔎',label:'Leaf shapes compared',prompt:'Find three different leaf shapes on your walk',cooldown:3},
  waterneeded:{icon:'💧',label:'Dry tree bed flagged',prompt:'Find a tree bed that looks dry and needs water',cooldown:2},
  standingwater:{icon:'🌊',label:'Standing water noted',prompt:'Find a tree bed with standing water after rain',cooldown:2},
  unexpected:{icon:'🌿',label:'Surprise tree found',prompt:'Find a tree growing somewhere unexpected',cooldown:6},
  missing:{icon:'📍',label:'Missing tree flagged',prompt:'Find a tree that\'s missing from the map',cooldown:6},
  bird:{icon:'🐦',label:'Bird sighting logged',prompt:'Find evidence of a bird using a street tree',cooldown:3},
  stewardcheckin:{icon:'🛡️',label:'Steward check-in',prompt:'Check in on a claimed tree bed',cooldown:5}
};
const NOTICE_TAGS={
  tree:{icon:'🌳',label:'Tree that stood out'},
  bloom:{icon:'🌸',label:'Bloom noticed'},
  pollinator:{icon:'🐝',label:'Pollinator noticed'},
  bird:{icon:'🐦',label:'Bird noticed'},
  water:{icon:'💧',label:'Water/soil noticed'},
  other:{icon:'✨',label:'Something interesting'}
};
function iconForObservationType(type){
  if(CHALLENGE_TYPES[type])return CHALLENGE_TYPES[type];
  if(type.indexOf('noticed-')===0){const k=type.slice(8);return NOTICE_TAGS[k]||{icon:'✨',label:type}}
  return {icon:'✨',label:type};
}

function observationRecords(){return JSON.parse(localStorage.getItem('nytree-observations')||'[]')}
function logObservation(type,treeId=null){
  const list=observationRecords();
  const tree=treeId?state.trees.find(t=>t.id===treeId):null;
  const record={
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
    type,treeId,timestamp:Date.now(),
    lat:(tree&&tree.lat)||(state.user&&state.user.lat)||null,
    lng:(tree&&tree.lng)||(state.user&&state.user.lng)||null,
    treeSource:tree?(tree.source==='community'?'community':`${tree.city||'nyc'}-open-data`):null
  };
  list.push(record);
  localStorage.setItem('nytree-observations',JSON.stringify(list.slice(-500)));
  if(tree)refreshTreeMarker(tree);
  refreshNotebookIfOpen();
  updateWalkHud();
  window.dispatchEvent(new CustomEvent('treewalk-observation',{detail:record}));
}
function observationsFor(treeId){return treeId?observationRecords().filter(o=>o.treeId===treeId):[]}

function challengeLog(){return JSON.parse(localStorage.getItem('nytree-challenge-log')||'{}')}
function markChallengeCooldown(type,key){
  const log=challengeLog();
  log[`${type}|${key}`]=Date.now();
  localStorage.setItem('nytree-challenge-log',JSON.stringify(log));
}
function isOnCooldown(type,key,days){
  const t=challengeLog()[`${type}|${key}`];
  return t?(Date.now()-t)<days*86400000:false;
}

function nearestTreeToUser(maxMeters=30){
  if(!state.user)return null;
  let best=null,bestDist=Infinity;
  state.trees.forEach(t=>{
    const d=metersBetween(state.user,{lat:t.lat,lng:t.lng});
    if(d<bestDist){bestDist=d;best=t;}
  });
  return (best&&bestDist<=maxMeters)?best:null;
}

function renderChallengeCard(){
  const el=$('challenge');
  if(!el)return;
  const label=el.querySelector('span'),title=el.querySelector('b'),dots=el.querySelector('.challenge-dots');
  const reportBtn=$('challenge-report-btn');
  if(state.game&&state.game.active&&state.game.mode==='species'){
    if(reportBtn)reportBtn.hidden=true;
    if(dots)dots.hidden=false;
    label.textContent='Mystery nearby — tap to end the search';
    title.textContent=`One of the trees ahead might be a ${state.game.target}. Can you find it?`;
    const total=state.game.correct+state.game.wrong;
    const slots=Math.max(3,total);
    dots.innerHTML=Array.from({length:slots}).map((_,i)=>{
      if(i<state.game.correct)return '<i class="done"></i>';
      if(i<total)return '<i class="miss"></i>';
      return '<i></i>';
    }).join('');
  }else if(state.game&&state.game.active&&(state.game.mode==='report'||state.game.mode==='steward')){
    if(dots)dots.hidden=true;
    if(reportBtn)reportBtn.hidden=false;
    const def=CHALLENGE_TYPES[state.game.reportType]||{icon:'🔍',prompt:'Find it'};
    label.textContent=state.game.mode==='steward'?'Steward check-in — tap card to skip':'Today\'s find — tap card to skip';
    title.textContent=`${def.icon} ${state.game.mode==='steward'?`Check on ${state.game.stewardCommon||'this tree bed'}`:def.prompt}`;
    if(reportBtn)reportBtn.textContent='Found it! ✓';
  }else{
    if(reportBtn)reportBtn.hidden=true;
    if(dots)dots.hidden=false;
    label.textContent='Today\'s challenge — tap to play';
    title.textContent='Find 3 different trees';
    dots.innerHTML='<i></i><i></i><i></i>';
    [...dots.querySelectorAll('i')].forEach((dot,i)=>dot.classList.toggle('done',i<Math.min(3,state.found.size)));
  }
}

function candidateSpeciesNearby(){
  const counts={};
  state.trees.forEach(t=>{
    if(!t.speciesCommon)return;
    const key=t.speciesCommon.toLowerCase();
    counts[key]=(counts[key]||0)+1;
  });
  return Object.keys(counts);
}

function buildChallengeCandidates(){
  const list=[];
  const speciesCandidates=candidateSpeciesNearby();
  if(speciesCandidates.length){
    list.push({kind:'species',id:speciesCandidates[Math.floor(Math.random()*speciesCandidates.length)]});
  }
  const month=new Date().getMonth();
  Object.keys(CHALLENGE_TYPES).forEach(type=>{
    if(type==='stewardcheckin')return;
    const def=CHALLENGE_TYPES[type];
    if(def.months&&def.months.indexOf(month)===-1)return;
    if(isOnCooldown(type,'any',def.cooldown))return;
    list.push({kind:'report',type});
  });
  const sponsors=sponsorRecords();
  Object.keys(sponsors).forEach(treeId=>{
    const rec=sponsors[treeId];
    const tree=state.trees.find(t=>t.id===treeId);
    if(!tree)return;
    const lastTouch=Math.max(rec.claimedAt||0,rec.touchedAt||0);
    if(Date.now()-lastTouch<7*86400000)return;
    if(isOnCooldown('stewardcheckin',treeId,CHALLENGE_TYPES.stewardcheckin.cooldown))return;
    list.push({kind:'steward',treeId,common:tree.speciesCommon});
  });
  return list;
}

function startChallenge(){
  const candidates=buildChallengeCandidates();
  if(!candidates.length){showStatus('No new challenges nearby right now — try exploring a bit further.',4000);return}
  const choice=candidates[Math.floor(Math.random()*candidates.length)];
  if(choice.kind==='species'){
    state.game={active:true,mode:'species',target:choice.id,correct:0,wrong:0,results:new Map(),missed:null};
    state.trees.forEach(t=>refreshTreeMarker(t));
    renderChallengeCard();
    showStatus(`Mystery nearby — one of the trees on your walk might be a ${choice.id}. Keep an eye out.`,4500);
  }else if(choice.kind==='report'){
    state.game={active:true,mode:'report',reportType:choice.type};
    renderChallengeCard();
    showStatus(CHALLENGE_TYPES[choice.type].prompt,4500);
  }else if(choice.kind==='steward'){
    state.game={active:true,mode:'steward',reportType:'stewardcheckin',target:choice.treeId,stewardCommon:choice.common};
    renderChallengeCard();
    showStatus(`Walk past ${choice.common||'this tree'} and check in on it.`,4500);
  }
}

// The "Leaf → Find It" bridge (2026-08-19 night): a lesson just taught a
// specific species — send the kid straight into the existing species-guess
// Mystery game, targeted at that species instead of a random pick. Reuses
// every bit of the already-shipped find/guess mechanic (? markers, tap to
// guess, ✓/✗ feedback, round summary) — this is the "close the loop with the
// map" bridge flagged in curriculum-foundation-tier-draft.md as the actual
// next thing worth building, not a new game. Called from kidsLessons.js via
// window.TREEWALK_START_SPECIES_CHALLENGE. Returns true if a hunt actually
// started, false if there's nothing of that species mapped nearby yet (the
// caller shows its own message in that case so it can stay in-context of the
// lesson rather than relying on the map's toast).
function beginSpeciesChallenge(speciesKey){
  const target=String(speciesKey||'').toLowerCase();
  if(!target)return false;
  const nearby=candidateSpeciesNearby();
  if(nearby.indexOf(target)===-1)return false;
  state.game={active:true,mode:'species',target,correct:0,wrong:0,results:new Map(),missed:null};
  state.trees.forEach(t=>refreshTreeMarker(t));
  renderChallengeCard();
  showStatus(`Mystery nearby — one of the trees ahead might be a ${target}. Keep an eye out for the ? markers.`,5200);
  return true;
}
window.TREEWALK_START_SPECIES_CHALLENGE=beginSpeciesChallenge;

function completeReportChallenge(){
  if(!state.game||!state.game.active)return;
  const type=state.game.reportType;
  const isSteward=state.game.mode==='steward';
  const tree=isSteward?state.trees.find(t=>t.id===state.game.target):nearestTreeToUser();
  const treeId=tree?tree.id:(isSteward?state.game.target:null);
  const def=CHALLENGE_TYPES[type]||{label:'Observation',prompt:'Document what you found'};
  // "Found it" doesn't complete anything by itself — a photo is the only
  // thing that actually verifies an observation happened. The challenge
  // only completes (seeds, cooldown, notebook) once that photo is saved.
  const finish=()=>{
    logObservation(type,treeId);
    markChallengeCooldown(type,isSteward?state.game.target:'any');
    if(isSteward){
      const records=sponsorRecords();
      if(records[state.game.target]){records[state.game.target].touchedAt=Date.now();localStorage.setItem('nytree-sponsor',JSON.stringify(records));}
    }
    showStatus(`${def.label} verified — thanks for adding to the living forest record!`,4200);
    state.game=null;
    renderChallengeCard();
  };
  if(window.openChallengeCapture){
    window.openChallengeCapture(tree||null,{label:def.prompt,onComplete:finish});
  }else{
    finish();
  }
}

function cancelChallenge(){
  state.game=null;
  renderChallengeCard();
}

function endRound(){
  if(!state.game||!state.game.active||state.game.mode!=='species')return;
  const target=state.game.target;
  const missedTrees=state.trees.filter(t=>t.speciesCommon&&t.speciesCommon.toLowerCase()===target&&!state.game.results.has(t.id));
  const totalTarget=state.trees.filter(t=>t.speciesCommon&&t.speciesCommon.toLowerCase()===target).length;
  state.game.active=false;
  state.game.missed=new Set(missedTrees.map(t=>t.id));
  if($('round-summary-title'))$('round-summary-title').textContent=`You found ${state.game.correct} of ${totalTarget} ${target}${totalTarget===1?'':'s'}`;
  if($('round-summary-copy'))$('round-summary-copy').textContent=missedTrees.length?`You may have walked past ${missedTrees.length} more — they're marked with ! on the map.`:'You got every one we know about near your walk!';
  if($('round-summary'))$('round-summary').classList.add('open');
  state.trees.forEach(t=>refreshTreeMarker(t));
  renderChallengeCard();
}

function dismissRoundSummary(){
  if($('round-summary'))$('round-summary').classList.remove('open');
}

function openGuess(tree){
  if(!state.game||!state.game.active)return;
  state.guessTree=tree;
  const profile=profileFor(tree.speciesCommon||'');
  if($('guess-heading'))$('guess-heading').textContent=`Is this a ${state.game.target}?`;
  if($('guess-clue'))$('guess-clue').textContent=profile.look||'Look closely at its leaves, bark, and shape.';
  if($('guess-feedback'))$('guess-feedback').hidden=true;
  if($('guess-panel'))$('guess-panel').classList.add('open');
}

function answerGuess(saysYes){
  const tree=state.guessTree;
  if(!tree||!state.game||!state.game.active)return;
  const isMatch=(tree.speciesCommon||'').toLowerCase()===state.game.target;
  const correct=(saysYes&&isMatch)||(!saysYes&&!isMatch);
  state.game.results.set(tree.id,correct?'correct':'wrong');
  if(correct)state.game.correct++; else state.game.wrong++;
  if($('guess-feedback')){
    $('guess-feedback').hidden=false;
    $('guess-feedback').textContent=isMatch?`Yes — that's a ${tree.speciesCommon}.`:`Not quite — that's a ${tree.speciesCommon||'different species'}.`;
  }
  refreshTreeMarker(tree);
  renderChallengeCard();
  setTimeout(()=>{if($('guess-panel'))$('guess-panel').classList.remove('open')},1600);
}

let statusTimer;
function showStatus(message,hideAfter=0){clearTimeout(statusTimer);$('status').textContent=message;$('status').classList.remove('hide');if(hideAfter)statusTimer=setTimeout(()=>$('status').classList.add('hide'),hideAfter)}

function cyclePreviewCity(){
  const i=CITIES.ADAPTERS.indexOf(state.previewCity);
  state.previewCity=CITIES.ADAPTERS[(i+1)%CITIES.ADAPTERS.length];
  if($('preview-city-name'))$('preview-city-name').textContent=state.previewCity.short||state.previewCity.name;
}

initMap();loadAddedTrees();updateScore();setMode(localStorage.getItem('nytree-mode')||'community');
if($('preview-city-name'))$('preview-city-name').textContent=state.previewCity.short||state.previewCity.name;
if($('preview-city-switch'))$('preview-city-switch').onclick=cyclePreviewCity;
if($('start-button'))$('start-button').onclick=()=>start(true);
if($('locate-button'))$('locate-button').onclick=()=>{state.follow=true;start(true)};
if($('close-sheet'))$('close-sheet').onclick=()=>{$('tree-sheet').classList.remove('open');$('tree-sheet').setAttribute('aria-hidden','true')};
if($('found-button'))$('found-button').onclick=foundTree;
if($('remember-tree-button'))$('remember-tree-button').onclick=foundTree;
if($('plant-confirm-button'))$('plant-confirm-button').onclick=confirmPlant;
if($('plant-cancel-button'))$('plant-cancel-button').onclick=cancelPlant;
if($('plant-reward-document'))$('plant-reward-document').onclick=documentPlantedNow;
if($('plant-reward-later'))$('plant-reward-later').onclick=dismissPlantReward;
document.querySelectorAll('.plant-type-option').forEach(b=>b.onclick=()=>setPlantType(b.dataset.type));
if($('plant-place-name'))$('plant-place-name').addEventListener('input',e=>updatePlantPlaceName(e.target.value));
if($('remove-tree-button'))$('remove-tree-button').onclick=removeTree;
if($('verify-tree-button'))$('verify-tree-button').onclick=verifyThisTree;
window.confirmPlant=confirmPlant;window.cancelPlant=cancelPlant;
if($('water-button'))$('water-button').onclick=waterTree;
if($('activity-button'))$('activity-button').onclick=printActivity;
if($('community-mode'))$('community-mode').onclick=()=>setMode('community');
if($('kids-mode'))$('kids-mode').onclick=()=>setMode('kids');
document.querySelectorAll('.welcome-mode').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
if($('walk-score'))$('walk-score').onclick=showWalkSummary;
if($('walk-save'))$('walk-save').onclick=saveWalk;
if($('walk-discard'))$('walk-discard').onclick=discardWalk;
document.querySelectorAll('.sponsor-type-btn').forEach(btn=>btn.onclick=()=>{
  state.sponsorClaimType=btn.dataset.type;
  document.querySelectorAll('.sponsor-type-btn').forEach(b=>b.classList.toggle('active',b===btn));
});
document.querySelectorAll('.sponsor-guard-btn').forEach(btn=>btn.onclick=()=>{
  state.sponsorGuardClass=btn.dataset.guard;
  document.querySelectorAll('.sponsor-guard-btn').forEach(b=>b.classList.toggle('active',b===btn));
  if($('sponsor-threshold-input'))$('sponsor-threshold-input').value=btn.dataset.cost;
});
if($('sponsor-summary'))$('sponsor-summary').onclick=()=>{if($('sponsor-detail'))$('sponsor-detail').hidden=false};
if($('claim-bed-button'))$('claim-bed-button').onclick=()=>{if($('sponsor-claim-form'))$('sponsor-claim-form').hidden=false};
if($('sponsor-claim-cancel'))$('sponsor-claim-cancel').onclick=()=>{if($('sponsor-claim-form'))$('sponsor-claim-form').hidden=true};
if($('sponsor-claim-submit'))$('sponsor-claim-submit').onclick=submitClaim;
if($('sponsor-join-button'))$('sponsor-join-button').onclick=joinFounding;
if($('sponsor-invite-button'))$('sponsor-invite-button').onclick=inviteNeighbor;
if($('sponsor-update-button'))$('sponsor-update-button').onclick=updateRaised;
if($('sponsor-link-button'))$('sponsor-link-button').onclick=updateGofundmeLink;
if($('challenge'))$('challenge').onclick=(e)=>{
  if(e.target&&e.target.id==='challenge-report-btn')return;
  if(state.game&&state.game.active){
    if(state.game.mode==='species')endRound();else cancelChallenge();
  }else{
    startChallenge();
  }
};
if($('challenge-report-btn'))$('challenge-report-btn').onclick=(e)=>{e.stopPropagation();completeReportChallenge();};
if($('guess-yes'))$('guess-yes').onclick=()=>answerGuess(true);
if($('guess-no'))$('guess-no').onclick=()=>answerGuess(false);
if($('guess-skip'))$('guess-skip').onclick=()=>{$('guess-panel').classList.remove('open')};
if($('round-summary-close'))$('round-summary-close').onclick=dismissRoundSummary;
if($('notebook-button'))$('notebook-button').onclick=openNotebook;
if($('notebook-close'))$('notebook-close').onclick=closeNotebook;
if($('nb-sync-button'))$('nb-sync-button').onclick=()=>{if(window.openAccountTab)window.openAccountTab();};
document.querySelectorAll('.notice-chip').forEach(btn=>btn.onclick=()=>{
  logObservation('noticed-'+btn.dataset.type,nearestTreeToUser()?.id||null);
  btn.classList.add('tapped');
  setTimeout(()=>btn.classList.remove('tapped'),1200);
  showStatus('Logged — thanks for noticing!',1800);
});
