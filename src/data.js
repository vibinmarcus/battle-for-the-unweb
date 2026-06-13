/* ═══════════════════════════════════════════════════════════
   CONSTANTS & STATIC DATA
   ═══════════════════════════════════════════════════════════ */

const SAVE_KEY = 'bftuw_v1';
const PROXY    = '/api/proxy?url=';

/* ─── Known sites ──────────────────────────────────────────── */
const KNOWN_SITES = {
  'google.com':        { siteTitle:'Google',      score:82, htmlDepth:60, cssComplexity:85, jsWeight:95, contentDensity:40, analysis:'Google serves a deceptively simple search interface backed by extraordinary JS complexity. Its front-end hides vast personalisation machinery, analytics, and A/B testing beneath a clean facade.' },
  'youtube.com':       { siteTitle:'YouTube',     score:91, htmlDepth:85, cssComplexity:88, jsWeight:98, contentDensity:90, analysis:'YouTube is one of the most JS-heavy properties on the web. Dynamic video loading, real-time comments, recommendation systems, and adaptive streaming make it a fortress of complexity.' },
  'facebook.com':      { siteTitle:'Facebook',    score:95, htmlDepth:90, cssComplexity:92, jsWeight:99, contentDensity:95, analysis:'Facebook deploys a bespoke React-based stack with thousands of dynamically loaded modules. Its DOM depth, custom event systems, and tracking infrastructure push complexity to the extreme.' },
  'twitter.com':       { siteTitle:'Twitter',     score:88, htmlDepth:80, cssComplexity:82, jsWeight:95, contentDensity:85, analysis:'Twitter runs on a dense React stack with infinite scroll, real-time updates, and a sophisticated media pipeline. The timeline rendering engine alone accounts for significant JS weight.' },
  'x.com':             { siteTitle:'X',           score:88, htmlDepth:80, cssComplexity:82, jsWeight:95, contentDensity:85, analysis:'X (formerly Twitter) carries the same complex React architecture with real-time feed updates and heavy media handling throughout.' },
  'reddit.com':        { siteTitle:'Reddit',      score:78, htmlDepth:72, cssComplexity:70, jsWeight:85, contentDensity:88, analysis:'Reddit has evolved from a simple link aggregator into a complex React application. Subreddit-specific styling, nested comment trees, and video embedding add significant weight.' },
  'github.com':        { siteTitle:'GitHub',      score:75, htmlDepth:68, cssComplexity:72, jsWeight:80, contentDensity:78, analysis:'GitHub blends server-rendered HTML with a growing React front-end. Code syntax highlighting, diff views, and real-time collaboration features add meaningful complexity.' },
  'wikipedia.org':     { siteTitle:'Wikipedia',   score:48, htmlDepth:55, cssComplexity:40, jsWeight:30, contentDensity:92, analysis:'Wikipedia is dense with content but relatively lean on JavaScript. Its MediaWiki stack produces deeply nested article markup but relies more on server rendering than client-side frameworks.' },
  'amazon.com':        { siteTitle:'Amazon',      score:93, htmlDepth:88, cssComplexity:85, jsWeight:97, contentDensity:96, analysis:'Amazon deploys hundreds of independent microservice-driven widgets on each page. The sheer number of personalisation, recommendation, and ad systems makes its pages among the heaviest on the web.' },
  'netflix.com':       { siteTitle:'Netflix',     score:89, htmlDepth:78, cssComplexity:88, jsWeight:96, contentDensity:82, analysis:'Netflix uses a sophisticated React stack with custom video player internals, extensive A/B testing, and a globally distributed CDN. Its client-side routing and prefetching add significant JS overhead.' },
  'apple.com':         { siteTitle:'Apple',       score:72, htmlDepth:65, cssComplexity:82, jsWeight:75, contentDensity:60, analysis:'Apple\'s marketing site is polished and animation-heavy, relying on CSS animations and scroll-driven effects. The HTML is clean but the visual fidelity demands significant CSS complexity.' },
  'microsoft.com':     { siteTitle:'Microsoft',   score:70, htmlDepth:65, cssComplexity:68, jsWeight:74, contentDensity:72, analysis:'Microsoft.com mixes a modern React-based CMS with legacy content systems. Multiple product verticals share a common design system but diverge in implementation.' },
  'nytimes.com':       { siteTitle:'New York Times', score:80, htmlDepth:74, cssComplexity:76, jsWeight:88, contentDensity:85, analysis:'The Times runs a sophisticated React front-end with paywall enforcement, ad auction systems, and rich media embeds. Article pages carry heavy analytics and personalization overhead.' },
  'cnn.com':           { siteTitle:'CNN',         score:82, htmlDepth:76, cssComplexity:74, jsWeight:90, contentDensity:88, analysis:'CNN\'s homepage assembles dozens of independently rendered content widgets. Live video streams, breaking news tickers, and aggressive ad loading make it a complex beast.' },
  'stackoverflow.com': { siteTitle:'Stack Overflow', score:58, htmlDepth:60, cssComplexity:52, jsWeight:62, contentDensity:82, analysis:'Stack Overflow is a well-structured Q&A platform with moderate JS usage. Its complexity comes from the voting, markdown rendering, and real-time notification systems.' },
  'twitch.tv':         { siteTitle:'Twitch',      score:90, htmlDepth:82, cssComplexity:85, jsWeight:97, contentDensity:88, analysis:'Twitch handles live video streams, real-time chat, gifted subscriptions, and alert overlays simultaneously. Its React app is one of the most real-time intensive on the consumer web.' },
  'linkedin.com':      { siteTitle:'LinkedIn',    score:86, htmlDepth:80, cssComplexity:78, jsWeight:92, contentDensity:90, analysis:'LinkedIn deploys a Ember.js-based stack with a complex feed algorithm, real-time messaging, and an extensive professional graph. Each page loads dozens of isolated microfrontend bundles.' },
  'instagram.com':     { siteTitle:'Instagram',   score:87, htmlDepth:78, cssComplexity:80, jsWeight:94, contentDensity:88, analysis:'Instagram\'s React Native web port is heavily optimised for mobile but carries significant JS weight. Stories, reels, and explore grids demand sophisticated media management.' },
  'example.com':            { siteTitle:'Example',            score:2,  htmlDepth:3,  cssComplexity:2,  jsWeight:1,  contentDensity:5,  analysis:'Example.com is the simplest site on the web — a single HTML file with minimal styling and no JavaScript. It barely registers as a creature at all.' },
  'motherfuckingwebsite.com':{ siteTitle:'motherfucking website', score:5, htmlDepth:5, cssComplexity:5, jsWeight:5, contentDensity:10, analysis:'A manifesto for minimalism — pure HTML, no CSS file, no JavaScript. One of the lowest-complexity pages you can encounter on the live web.' },
  'berkshirehathaway.com':  { siteTitle:'Berkshire Hathaway',  score:8,  htmlDepth:8,  cssComplexity:5,  jsWeight:5,  contentDensity:18, analysis:'Berkshire Hathaway\'s homepage is a deliberate statement of simplicity. Bare HTML links, no stylesheet, no JavaScript — unchanged for decades.' },
  'info.cern.ch':           { siteTitle:'CERN',                score:10, htmlDepth:10, cssComplexity:5,  jsWeight:5,  contentDensity:18, analysis:'The first website ever published, preserved at CERN. Pure HTML with no CSS or JavaScript — a fossil record of the early web.' },
  'ifconfig.me':            { siteTitle:'ifconfig',            score:16, htmlDepth:12, cssComplexity:8,  jsWeight:5,  contentDensity:20, analysis:'A minimal utility page showing your IP address and request headers. Clean HTML, light CSS, no JavaScript framework.' },
  'ascii.cl':               { siteTitle:'ASCII Table',         score:18, htmlDepth:15, cssComplexity:10, jsWeight:5,  contentDensity:35, analysis:'A reference table for ASCII character codes. Static HTML with a dense data table but minimal scripting or styling overhead.' },
  '68k.news':               { siteTitle:'68k News',            score:18, htmlDepth:14, cssComplexity:8,  jsWeight:5,  contentDensity:30, analysis:'A text-only news aggregator styled for old hardware. Intentionally lightweight with minimal CSS and no JavaScript.' },
  'xkcd.com':               { siteTitle:'XKCD',                score:22, htmlDepth:18, cssComplexity:12, jsWeight:8,  contentDensity:25, analysis:'A beloved webcomic site with intentionally sparse HTML. Minimal CSS, light JavaScript, image-forward layout.' },
  'text.npr.org':           { siteTitle:'NPR',                 score:22, htmlDepth:18, cssComplexity:10, jsWeight:5,  contentDensity:45, analysis:'NPR\'s text-only site, built for low-bandwidth access. Dense content with near-zero CSS and JavaScript overhead.' },
  'paulgraham.com':         { siteTitle:'Paul Graham',         score:20, htmlDepth:15, cssComplexity:8,  jsWeight:5,  contentDensity:50, analysis:'Paul Graham\'s personal site — raw HTML essays with no JavaScript and minimal CSS. High content density, zero framework overhead.' },
  'lite.cnn.com':           { siteTitle:'CNN Lite',            score:24, htmlDepth:20, cssComplexity:12, jsWeight:5,  contentDensity:40, analysis:'CNN\'s stripped-down text edition for slow connections. No JavaScript frameworks, no ads — just headline links.' },
  'cloudflare.com':    { siteTitle:'Cloudflare',  score:68, htmlDepth:62, cssComplexity:70, jsWeight:72, contentDensity:65, analysis:'Cloudflare\'s site is clean and well-engineered, naturally. Their own CDN and Workers platform means pages load fast but the marketing site carries moderate React complexity.' },
  'vercel.com':        { siteTitle:'Vercel',      score:65, htmlDepth:60, cssComplexity:68, jsWeight:70, contentDensity:62, analysis:'Vercel\'s site is a Next.js showcase — fitting for a deployment platform. Smooth animations and fast loading belie a moderately complex React application underneath.' },
  'cnet.com':          { siteTitle:'CNET',        score:68, htmlDepth:70, cssComplexity:72, jsWeight:80, contentDensity:85, analysis:'CNET is a major tech media site with heavy ad infrastructure, video embeds, and a React-based CMS. Its pages carry significant third-party script weight from advertising and analytics networks.' },
};

/* ─── Starter site suggestions ────────────────────────────── */
const STARTER_SITES = [
  { url:'motherfuckingwebsite.com', label:'motherfucking…',    score:5  },
  { url:'berkshirehathaway.com',    label:'Berkshire Hathaway',score:8  },
  { url:'info.cern.ch',             label:'CERN (first site)', score:10 },
  { url:'ifconfig.me',              label:'ifconfig.me',        score:16 },
  { url:'ascii.cl',                 label:'ASCII Table',        score:18 },
  { url:'68k.news',                 label:'68k News',           score:18 },
  { url:'paulgraham.com',           label:'Paul Graham',        score:20 },
  { url:'xkcd.com',                 label:'XKCD',               score:22 },
  { url:'text.npr.org',             label:'NPR Text',           score:22 },
  { url:'lite.cnn.com',             label:'CNN Lite',           score:24 },
  { url:'gutenberg.org',            label:'Project Gutenberg',  score:27 },
  { url:'w3.org',                   label:'W3C',                score:28 },
  { url:'httpbin.org',              label:'httpbin',            score:31 },
  { url:'lobste.rs',                label:'Lobsters',           score:30 },
  { url:'ycombinator.com',          label:'Y Combinator',       score:30 },
  { url:'drudgereport.com',         label:'Drudge Report',      score:33 },
  { url:'craigslist.org',           label:'Craigslist',         score:36 },
  { url:'krebsonsecurity.com',      label:'Krebs on Security',  score:40 },
  { url:'slashdot.org',             label:'Slashdot',           score:40 },
  { url:'archive.org',              label:'Internet Archive',   score:45 },
  { url:'neal.fun',                 label:'Neal.fun',           score:48 },
  { url:'web.archive.org/web/20030601120000/zombo.com',                          label:'Zombo.com (2003)',        score:32 },
  { url:'web.archive.org/web/20031001120000/homestarrunner.com',                 label:'Homestar Runner (2003)',  score:42 },
  { url:'web.archive.org/web/20030601120000/hamsterdance.com',                   label:'Hamster Dance (2003)',    score:48 },
  { url:'web.archive.org/web/20040601120000/www.bash.org',                       label:'Bash.org (2004)',         score:51 },
  { url:'web.archive.org/web/20030601120000/www.gamefaqs.com',                   label:'GameFAQs (2003)',         score:55 },
  { url:'web.archive.org/web/20031001120000/maddox.xmission.com',                label:'Maddox (2003)',           score:60 },
  { url:'web.archive.org/web/20031201120000/spacejam.com',                       label:'Space Jam (2003)',        score:60 },
  { url:'web.archive.org/web/20031001120000/www.fark.com',                       label:'Fark (2003)',             score:65 },
  { url:'web.archive.org/web/20030601120000/www.neopets.com',                    label:'Neopets (2003)',          score:77 },
  { url:'web.archive.org/web/20030601120000/www.trillian.cc',                   label:'Trillian (2003)',          score:32 },
  { url:'web.archive.org/web/20030601120000/www.morpheus.com',                  label:'Morpheus (2003)',          score:32 },
  { url:'web.archive.org/web/20030601120000/www.circuitcity.com',               label:'Circuit City (2003)',      score:33 },
  { url:'web.archive.org/web/20040601120000/www.runescape.com',                 label:'RuneScape (2004)',         score:34 },
  { url:'web.archive.org/web/20030601120000/www.emule-project.net',             label:'eMule (2003)',             score:34 },
  { url:'web.archive.org/web/20030601120000/www.filefront.com',                 label:'FileFront (2003)',         score:34 },
  { url:'web.archive.org/web/20030601120000/www.valvesoftware.com',             label:'Valve (2003)',             score:35 },
  { url:'web.archive.org/web/20030601120000/www.kazaa.com',                     label:'Kazaa (2003)',             score:35 },
  { url:'web.archive.org/web/20030601120000/www.irc.org',                       label:'IRC.org (2003)',           score:38 },
  { url:'web.archive.org/web/20010601120000/www.looksmart.com',                 label:'LookSmart (2001)',         score:40 },
  { url:'web.archive.org/web/20030601120000/www.miniclip.com',                  label:'Miniclip (2003)',          score:42 },
  { url:'web.archive.org/web/20040601120000/www.ebaumsworld.com',               label:'eBaums World (2004)',      score:43 },
  { url:'web.archive.org/web/20030601120000/www.limewire.com',                  label:'LimeWire (2003)',          score:43 },
  { url:'web.archive.org/web/20040601120000/www.friendster.com',                label:'Friendster (2004)',        score:46 },
  { url:'web.archive.org/web/20030601120000/www.winmx.com',                     label:'WinMX (2003)',             score:48 },
  { url:'web.archive.org/web/20050601120000/www.hi5.com',                       label:'Hi5 (2005)',               score:49 },
  { url:'web.archive.org/web/20030601120000/www.mirc.com',                      label:'mIRC (2003)',              score:49 },
  { url:'web.archive.org/web/20030601120000/www.imesh.com',                     label:'iMesh (2003)',             score:49 },
  { url:'web.archive.org/web/20010601120000/www.webcrawler.com',                label:'WebCrawler (2001)',        score:50 },
  { url:'web.archive.org/web/20030601120000/www.illwillpress.com',              label:'Foamy (2003)',             score:50 },
  { url:'web.archive.org/web/20030601120000/www.efnet.org',                     label:'EFNet (2003)',             score:52 },
  { url:'web.archive.org/web/20030601120000/www.altavista.com',                 label:'AltaVista (2003)',         score:53 },
  { url:'web.archive.org/web/20010601120000/www.hotbot.com',                    label:'HotBot (2001)',            score:56 },
  { url:'web.archive.org/web/20010601120000/www.metacrawler.com',               label:'MetaCrawler (2001)',       score:57 },
  { url:'web.archive.org/web/20030601120000/www.askjeeves.com',                 label:'Ask Jeeves (2003)',        score:57 },
  { url:'web.archive.org/web/19990601120000/www.infoseek.com',                  label:'Infoseek (1999)',          score:59 },
  { url:'web.archive.org/web/20030601120000/www.livejournal.com',               label:'LiveJournal (2003)',       score:59 },
  { url:'web.archive.org/web/20030601120000/www.allmusic.com',                  label:'AllMusic (2003)',          score:59 },
  { url:'web.archive.org/web/20010601120000/www.dogpile.com',                   label:'Dogpile (2001)',           score:62 },
  { url:'web.archive.org/web/20030601120000/www.sourceforge.net',               label:'SourceForge (2003)',       score:64 },
  { url:'web.archive.org/web/20030601120000/www.addictinggames.com',            label:'AddictingGames (2003)',    score:66 },
  { url:'web.archive.org/web/20030601120000/www.majorgeeks.com',                label:'MajorGeeks (2003)',        score:67 },
  { url:'web.archive.org/web/20030601120000/www.aol.com',                       label:'AOL (2003)',               score:71 },
  { url:'web.archive.org/web/20030601120000/www.gnutella.com',                  label:'Gnutella (2003)',          score:72 },
  { url:'web.archive.org/web/20030601120000/www.yahoo.com',                     label:'Yahoo (2003)',             score:73 },
  { url:'web.archive.org/web/20030601120000/www.lycos.com',                     label:'Lycos (2003)',             score:74 },
  { url:'web.archive.org/web/20030601120000/www.rotten.com',                    label:'Rotten.com (2003)',        score:75 },
  { url:'web.archive.org/web/20030601120000/www.excite.com',                    label:'Excite (2003)',            score:78 },
  { url:'web.archive.org/web/20030601120000/www.msn.com',                       label:'MSN (2003)',               score:78 },
  { url:'web.archive.org/web/20010601120000/www.go.com',                        label:'Go.com (2001)',            score:79 },
  { url:'web.archive.org/web/20030601120000/www.overture.com',                  label:'Overture (2003)',          score:81 },
  { url:'web.archive.org/web/20050601120000/www.myspace.com',                   label:'MySpace (2005)',           score:82 },
  { url:'web.archive.org/web/20030601120000/www.boingboing.net',                label:'Boing Boing (2003)',       score:82 },
  { url:'web.archive.org/web/20030601120000/www.gateway.com',                   label:'Gateway (2003)',           score:83 },
  { url:'web.archive.org/web/20010601120000/www.iwon.com',                      label:'iWon (2001)',              score:86 },
  { url:'web.archive.org/web/20060601120000/www.bebo.com',                      label:'Bebo (2006)',              score:86 },
  { url:'web.archive.org/web/20030601120000/www.bearshare.com',                 label:'BearShare (2003)',         score:86 },
  { url:'web.archive.org/web/20030601120000/www.drugs.com',                     label:'Drugs.com (2003)',         score:87 },
  { url:'web.archive.org/web/20030601120000/www.netscape.com',                  label:'Netscape (2003)',          score:88 },
  { url:'web.archive.org/web/20060601120000/www.techcrunch.com',                label:'TechCrunch (2006)',        score:92 },
  { url:'web.archive.org/web/20030601120000/www.fileplanet.com',                label:'FilePlanet (2003)',        score:92 },
  { url:'web.archive.org/web/20030601120000/www.gamespy.com',                   label:'GameSpy (2003)',           score:93 },
  { url:'web.archive.org/web/20030601120000/www.zdnet.com',                     label:'ZDNet (2003)',             score:93 },
  { url:'web.archive.org/web/20030601120000/www.icq.com',                       label:'ICQ (2003)',               score:96 },
  { url:'web.archive.org/web/20030601120000/www.albinoblacksheep.com',          label:'AlbinoBlackSheep (2003)', score:99 },
];

/* ─── Character classes ────────────────────────────────────── */
const CLASSES = [
  { id:'warrior', name:'Warrior', icon:'ti-shield', desc:'Fearless melee fighter. High defense, solid attack.', special:'15% chance to block incoming hits',              color:'#c05030', bg:'rgba(192,80,48,0.2)',  avatar:'W', atkBonus:8,  defBonus:5  },
  { id:'mage',    name:'Mage',    icon:'ti-wand',   desc:'Master of arcane arts. Highest attack, low defense.', special:'20% chance to crit for 1.75× damage',           color:'#7a6fd0', bg:'rgba(122,111,208,0.2)',avatar:'M', atkBonus:12, defBonus:2  },
  { id:'rogue',   name:'Rogue',   icon:'ti-eye',    desc:'Cunning and precise. Balanced offensive stats.',      special:'25% chance to dodge incoming attacks',           color:'#a09080', bg:'rgba(160,144,128,0.2)',avatar:'R', atkBonus:10, defBonus:4  },
  { id:'ranger',  name:'Ranger',  icon:'ti-target', desc:'Patient tracker. Good defense, ranged bonuses.',     special:'Free first strike at 60% ATK before round 1',    color:'#4a9e6a', bg:'rgba(74,158,106,0.2)', avatar:'Ra', atkBonus:9, defBonus:6  },
  { id:'paladin', name:'Paladin', icon:'ti-star',   desc:'Holy protector. Highest defense, lower attack.',     special:'Regenerate 2 HP at the end of each round',       color:'#c8941a', bg:'rgba(200,148,26,0.2)', avatar:'P', atkBonus:7,  defBonus:8  },
];

/* ─── Hunter ranks ─────────────────────────────────────────── */
const HUNTER_RANKS = [
  { xp:0,     lvl:1,  name:'Novice Hunter',     icon:'ti-user'           },
  { xp:500,   lvl:5,  name:'Apprentice Hunter', icon:'ti-sword'          },
  { xp:1500,  lvl:10, name:'Journeyman Hunter', icon:'ti-shield'         },
  { xp:3500,  lvl:20, name:'Veteran Hunter',    icon:'ti-shield-chevron' },
  { xp:7000,  lvl:35, name:'Elite Hunter',      icon:'ti-flame'          },
  { xp:14000, lvl:50, name:'Master Hunter',     icon:'ti-crown'          },
  { xp:28000, lvl:70, name:'Legendary Hunter',  icon:'ti-star'           },
  { xp:50000, lvl:99, name:'Mythic Hunter',     icon:'ti-sparkles'       },
];

/* ─── Rarity colors ────────────────────────────────────────── */
const RC = {
  Normal: { color:'#9a9080', bg:'rgba(154,144,128,0.12)' },
  Magic:  { color:'#5a8fd0', bg:'rgba(90,143,208,0.12)'  },
  Rare:   { color:'#c8941a', bg:'rgba(200,148,26,0.12)'  },
  Set:    { color:'#4a9e6a', bg:'rgba(74,158,106,0.12)'  },
  Unique: { color:'#c8941a', bg:'rgba(200,148,26,0.15)'  },
  Charm:  { color:'#c05080', bg:'rgba(192,80,128,0.12)'  },
};

/* ─── D2 item bases ────────────────────────────────────────── */
const D2A = {
  normal:      [{name:'Quilted Armor',type:'Light Armor',def:'8-11',str:0,lv:0,slot:'chest'},{name:'Cap',type:'Helm',def:'3-5',str:0,lv:0,slot:'helmet'},{name:'Light Gauntlets',type:'Gloves',def:'5-7',str:0,lv:0,slot:'gloves'},{name:'Boots',type:'Boots',def:'2-3',str:0,lv:0,slot:'boots'}],
  exceptional: [{name:'Sharktooth Armor',type:'Light Armor',def:'103-115',str:25,lv:20,slot:'chest'},{name:'Basinet',type:'Helm',def:'30-40',str:50,lv:25,slot:'helmet'},{name:'Gauntlets',type:'Gloves',def:'15-18',str:60,lv:21,slot:'gloves'},{name:'War Boots',type:'Boots',def:'34-39',str:125,lv:45,slot:'boots'}],
  elite:       [{name:'Archon Plate',type:'Light Armor',def:'410-524',str:103,lv:63,slot:'chest'},{name:'Shako',type:'Helm',def:'98-141',str:50,lv:43,slot:'helmet'},{name:"Griffon's Eye",type:'Helm',def:'150-212',str:78,lv:76,slot:'helmet'},{name:'Myrmidon Greaves',type:'Boots',def:'67-78',str:125,lv:66,slot:'boots'}],
};
const D2MISC = [
  {name:'Grand Charm',type:'Charm'},{name:'Small Charm',type:'Charm'},
];
const D2UA = [
  {name:'Tarnhelm',base:'Skull Cap',slot:'helmet',props:['+1 to All Skills','25-50% Magic Find']},
  {name:'Harlequin Crest',base:'Shako',slot:'helmet',props:['+2 to All Skills','+Life/Mana per Level']},
  {name:'Skin of the Vipermagi',base:'Mage Plate',slot:'chest',props:['+1 to All Skills','All Resistances +20-35%']},
  {name:'Vampire Gaze',base:'Grim Helm',slot:'helmet',props:['Adds 6-22 Cold Damage','6-8% Life Stolen/Hit']},
];
const D2SET = [
  {name:"Civerb's Icon",set:"Civerb's",type:'Amulet',slot:'amulet',props:['+20 to Life']},
  {name:"Hsaru's Iron Heel",set:"Hsaru's",type:'Boots',slot:'boots',props:['Fire Resist +25%']},
  {name:"Aldur's Stony Gaze",set:"Aldur's",type:'Helm',slot:'helmet',props:['+2 Druid Skills','Cold Resist +40%']},
];
const MPRE = [{n:'Savage',s:'max dmg',r:[5,10]},{n:'Vicious',s:'% Enh. Dmg',r:[41,60]},{n:'Brutal',s:'% Enh. Dmg',r:[61,80]},{n:'Merciless',s:'% Enh. Dmg',r:[81,100]},{n:'Cobalt',s:'Cold Resist %',r:[11,20]},{n:'Russet',s:'Fire Resist %',r:[11,20]},{n:'Fine',s:'+Atk Rating',r:[11,20]},{n:'Sturdy',s:'+Defense',r:[10,20]},{n:'Glorious',s:'+Defense',r:[31,40]}];
const MSUF = [{n:'of the Magus',s:'+All Skills',r:[1,3]},{n:'of Strength',s:'+Strength',r:[1,10]},{n:'of the Mammoth',s:'+Life',r:[61,80]},{n:'of Greed',s:'% Magic Find',r:[5,15]},{n:'of Fortune',s:'% Magic Find',r:[31,40]},{n:'of Gore',s:'% Deadly Strike',r:[5,10]},{n:'of Swiftness',s:'% Faster Run',r:[10,20]},{n:'of the Leech',s:'Life Stolen/Hit %',r:[3,5]}];
