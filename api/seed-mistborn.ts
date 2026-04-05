import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

const now = new Date().toISOString();

// ═══════════════════════════════════════════════════════════════════════════
// MISTBORN: THE FINAL EMPIRE — Film Adaptation
// Based on Brandon Sanderson's novel
// ═══════════════════════════════════════════════════════════════════════════

// ── ELEMENTS ────────────────────────────────────────────────────────────────

const elements = [
  // Cast
  { id: 'el-vin', category: 'Cast', name: 'Vin', notes: 'Lead. 17-year-old street urchin turned Allomancer. Requires wirework training.' },
  { id: 'el-kelsier', category: 'Cast', name: 'Kelsier', notes: 'Lead. The Survivor of Hathsin. Charismatic revolutionary leader.' },
  { id: 'el-elend', category: 'Cast', name: 'Elend Venture', notes: 'Supporting. Nobleman, scholar, love interest. Noble bearing.' },
  { id: 'el-sazed', category: 'Cast', name: 'Sazed', notes: 'Supporting. Terrisman Keeper. Tall, bald, earrings. Prosthetic ears.' },
  { id: 'el-breeze', category: 'Cast', name: 'Breeze', notes: 'Supporting. Soother. Distinguished, well-dressed.' },
  { id: 'el-ham', category: 'Cast', name: 'Ham', notes: 'Supporting. Thug (Pewterarm). Muscular, philosophical.' },
  { id: 'el-clubs', category: 'Cast', name: 'Clubs', notes: 'Supporting. Smoker. Grumpy carpenter.' },
  { id: 'el-dockson', category: 'Cast', name: 'Dockson', notes: 'Supporting. Kelsier\'s right hand. Organizer.' },
  { id: 'el-marsh', category: 'Cast', name: 'Marsh', notes: 'Supporting. Kelsier\'s brother. Stern, becomes Steel Inquisitor.' },
  { id: 'el-lordruler', category: 'Cast', name: 'Lord Ruler', notes: 'Antagonist. The Sliver of Infinity. Immortal tyrant. Regal, terrifying presence.' },
  { id: 'el-inquisitor1', category: 'Cast', name: 'Steel Inquisitor', notes: 'Antagonist. Spike-eyed enforcer. Full prosthetic makeup (2h application).' },
  { id: 'el-straff', category: 'Cast', name: 'Straff Venture', notes: 'Day player. Elend\'s father. Cruel nobleman.' },
  { id: 'el-shan', category: 'Cast', name: 'Shan Elariel', notes: 'Day player. Mistborn noblewoman antagonist.' },

  // Stunts
  { id: 'el-stunt-allomancy', category: 'Stunts', name: 'Allomancy Wirework', notes: 'Steel/Iron Pushing and Pulling. Heavy wire rig work for Vin and Kelsier.' },
  { id: 'el-stunt-fights', category: 'Stunts', name: 'Mistborn Combat Choreography', notes: 'Coins as weapons, glass daggers, mid-air combat sequences.' },
  { id: 'el-stunt-fall', category: 'Stunts', name: 'High Falls', notes: 'Multiple falls from buildings and structures. Air ratchets.' },

  // Vehicles
  { id: 'el-carriages', category: 'Vehicles', name: 'Noble Carriages', notes: 'Period-style horse-drawn carriages. 4 hero vehicles, 8 background.' },
  { id: 'el-skaa-carts', category: 'Vehicles', name: 'Skaa Work Carts', notes: 'Rough wooden carts for plantation scenes.' },

  // Props
  { id: 'el-coins', category: 'Props', name: 'Metal Coins (Allomancy)', notes: 'Bag of coins for Pushing. Multiple hero and breakaway sets.' },
  { id: 'el-vials', category: 'Props', name: 'Metal Vials', notes: 'Allomantic vials with metal flake liquid. 20 hero props.' },
  { id: 'el-glass-daggers', category: 'Props', name: 'Obsidian Daggers', notes: 'Glass/obsidian weapons. Breakaway and hero versions.' },
  { id: 'el-atium', category: 'Props', name: 'Atium Bead', notes: 'Small glowing metal bead. Practical LED-embedded prop + CG enhancement.' },
  { id: 'el-logbook', category: 'Props', name: 'Lord Ruler\'s Logbook', notes: 'Aged leather journal with handwritten pages. 2 hero copies.' },
  { id: 'el-noble-jewelry', category: 'Props', name: 'Noble Jewelry', notes: 'Rings, bracelets, earrings for ball sequences. 40+ pieces.' },

  // Wardrobe
  { id: 'el-mistcloak', category: 'Wardrobe', name: 'Mistcloaks', notes: 'Iconic tasseled cloaks. 4 hero (Vin, Kelsier, Shan, stunt doubles). Flowing fabric for wirework.' },
  { id: 'el-noble-gowns', category: 'Wardrobe', name: 'Noble Ball Gowns', notes: 'Vin\'s transformation wardrobe. 3 hero gowns + 30 background noble costumes.' },
  { id: 'el-skaa-rags', category: 'Wardrobe', name: 'Skaa Clothing', notes: 'Worn, ash-stained peasant clothing. 50+ sets for extras.' },
  { id: 'el-noble-suits', category: 'Wardrobe', name: 'Noble Suits', notes: 'Period-style suits for Elend and nobleman scenes. 20 hero, 40 background.' },

  // Makeup/Hair
  { id: 'el-inquisitor-prosthetics', category: 'Makeup/Hair', name: 'Inquisitor Prosthetics', notes: 'Steel spikes through eye sockets. Full silicone prosthetic. 2hr application.' },
  { id: 'el-ash-makeup', category: 'Makeup/Hair', name: 'Ash/Soot Makeup', notes: 'Continuous ash falling. Everyone needs ash-dusted skin/hair. All scenes.' },
  { id: 'el-vin-transformation', category: 'Makeup/Hair', name: 'Vin Transformation Makeup', notes: 'Vin\'s look evolution from street urchin to noblewoman to Mistborn warrior.' },

  // Special Effects
  { id: 'el-mist', category: 'Special Effects', name: 'Atmospheric Mist', notes: 'Pervasive ground fog for night exteriors. 4 fog machines per setup minimum.' },
  { id: 'el-ash-fall', category: 'Special Effects', name: 'Ashfall Effect', notes: 'Continuous falling ash particles. Practical snow/ash machines + CG augmentation.' },
  { id: 'el-fire', category: 'Special Effects', name: 'Pyrotechnics', notes: 'Soothing/Rioting visual FX reference, fire at Hathsin, building fires.' },

  // Visual Effects
  { id: 'el-vfx-steelpush', category: 'Visual Effects', name: 'Steel/Iron Lines', notes: 'Blue lines connecting Allomancer to metal sources. Heavy VFX every Allomancy scene.' },
  { id: 'el-vfx-atium', category: 'Visual Effects', name: 'Atium Shadows', notes: 'Translucent future-shadows during Atium burning. Complex CG.' },
  { id: 'el-vfx-metalburn', category: 'Visual Effects', name: 'Metal Burning Internal FX', notes: 'Subtle internal glow when burning metals. Pewter strength, tin senses.' },
  { id: 'el-vfx-koloss', category: 'Visual Effects', name: 'Koloss (CG)', notes: 'Large blue creatures. Full CG or heavy prosthetic + CG hybrid.' },
  { id: 'el-vfx-city', category: 'Visual Effects', name: 'Luthadel City Extensions', notes: 'CG city extensions. Ash-covered skyline, Kredik Shaw spires, noble keeps.' },

  // Special Equipment
  { id: 'el-wire-rigs', category: 'Special Equipment', name: 'Wire Rigs (Allomancy Flight)', notes: '8-point flying rigs for Steelpushing. High-speed winches for rapid pulls.' },
  { id: 'el-rain-towers', category: 'Special Equipment', name: 'Rain/Ash Towers', notes: 'Overhead rigs for ash and mist effects.' },

  // Art Department
  { id: 'el-hathsin-set', category: 'Art Department', name: 'Pits of Hathsin Set Design', notes: 'Dark crystal caves. Geode-like interiors with atium crystals.' },
  { id: 'el-kredik-shaw', category: 'Art Department', name: 'Kredik Shaw Throne Room', notes: 'Lord Ruler\'s palace. Massive pillared throne room with stained glass.' },

  // Sound
  { id: 'el-allomancy-sounds', category: 'Sound Effects/Music', name: 'Allomancy Sound Design', notes: 'Unique audio signature for each metal: tin hum, pewter thrum, steel ring, iron groan.' },
];

// ── BREAKDOWN SHEETS (SCENES) ───────────────────────────────────────────────

const breakdowns = [
  {
    id: 'sc-1', sceneNumber: '1', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Slums', setName: 'Skaa Quarter Street',
    description: 'COLD OPEN. A skaa plantation worker watches the mists roll in at night. Terrified. The mists claim someone in the distance. Title card: MISTBORN.',
    scriptPage: 1, pageCount: '2/8',
    elements: ['el-mist', 'el-ash-fall', 'el-ash-makeup', 'el-skaa-rags', 'el-allomancy-sounds', 'el-skaa-carts', 'el-rain-towers'],
    notes: 'Establish the world. Mist is a character. Ash falls everywhere. Skaa carts in background. Rain/ash towers for atmosphere.',
    scriptContent: `EXT. SKAA QUARTER STREET - NIGHT\n\nAsh falls like gray snow through amber torchlight. It coats the cobblestones, the sagging rooftops, the hunched shoulders of men who have learned not to look up.\n\nA SKAA PLANTATION WORKER (40s, back bent by years of labor, eyes that never still) hurries down an empty street pulling a wooden cart. He glances at the sky.\n\nThe mists are coming.\n\nTendrils of white-gray vapor coil around the corner of a building — reaching, searching. The plantation worker freezes.\n\nSomething moves in the mist. A shape. Not the mist itself. Something inside it.\n\nThe worker drops the cart and runs.\n\nHe doesn't make it.\n\nA sound like wind through a hollow bone. Then silence.\n\nThe mist settles. The cart sits alone on the street, one wheel still slowly turning.\n\nA single ember of ash drifts down and dies.\n\n                    TITLE CARD: MISTBORN`
  },
  {
    id: 'sc-2', sceneNumber: '2', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Camon\'s Lair', setName: 'Underground Hideout',
    description: 'VIN hides in the corner of a thieving crew meeting. CAMON plans a scam against an obligator. Vin subtly Soothes the room without knowing what she\'s doing.',
    scriptPage: 2, pageCount: '3/8',
    elements: ['el-vin', 'el-vfx-metalburn', 'el-skaa-rags', 'el-ash-makeup'],
    notes: 'First introduction to Vin. She\'s small, scared, powerful without knowing it.',
    scriptContent: `INT. UNDERGROUND HIDEOUT - NIGHT\n\nA basement beneath a city street. The walls weep with damp. Stolen goods crowd wooden shelves — silks, grain sacks, ledgers bearing noble house seals.\n\nA dozen thieving crew members crowd around a rough table. At the center: CAMON (50s, thick neck, thick everything — a man who built his criminal empire on the certainty that he is always the most dangerous thing in any room).\n\nVIN (17, small enough to disappear into shadows, large eyes that miss nothing) is wedged into a corner behind a stack of crates. She has been here for hours. No one has noticed her.\n\nThat is the point.\n\n                    CAMON\n          Tomorrow we walk into the Canton of Finance\n          and we bleed those tattooed bastards dry.\n          Forty thousand boxings.\n               (slaps the table)\n          Our biggest score.\n\nMurmurs of assent. Greed is a smell in this room.\n\nVin watches. She is doing something — not consciously, not deliberately. Her hands are folded in her lap. Her breathing is slow.\n\nBut something flows out of her. Something invisible.\n\nThe tension in the room drops. Shoulders unknot. The man nearest her, who had been white-knuckling his cup, lets it go.\n\n                    CREW MEMBER #1\n               (relaxing)\n          Camon knows what he's doing.\n\n                    CREW MEMBER #2\n               (nodding slowly)\n          Best crew in Luthadel.\n\nCamon doesn't question the sudden loyalty. He never does.\n\n                    VIN\n               (barely a whisper, to herself)\n          That's not me.\n\nBut it is. She just doesn't know it yet.`
  },
  {
    id: 'sc-3', sceneNumber: '3', intExt: 'INT', dayNight: 'DAY',
    location: 'Canton of Finance', setName: 'Obligator Office',
    description: 'Camon\'s crew runs their scam. Vin sits quietly in the back. A STEEL INQUISITOR enters. Vin feels something terrifying. Kelsier intervenes, killing Camon\'s crew handler.',
    scriptPage: 4, pageCount: '4/8',
    elements: ['el-vin', 'el-kelsier', 'el-inquisitor1', 'el-inquisitor-prosthetics', 'el-vfx-steelpush', 'el-skaa-rags', 'el-coins'],
    notes: 'First Inquisitor appearance. Audience should feel Vin\'s terror. Kelsier entrance is the turn.',
    scriptContent: `INT. OBLIGATOR OFFICE - DAY\n\nThe Canton of Finance. High ceilings. The smell of wax seals and bureaucratic authority. OBLIGATORS (clergy of the Lord Ruler, facial tattoos mapping their rank) sit at desks reviewing documents with the efficiency of men who know they can never be wrong.\n\nCamon's crew files in — dressed as minor noble merchants. Expensive clothes worn badly, like costumes. Vin follows at the back, head down.\n\nA SENIOR OBLIGATOR (60s, tattoos spreading to his hairline) looks up.\n\n                    SENIOR OBLIGATOR\n          You claim a loan dispute with House Renoux?\n\n                    CAMON\n               (performing deference, badly)\n          Indeed, Your Grace. Forty thousand boxings,\n          documented.\n\nHe produces forged papers. Good forgeries. The Obligator's eyes move across them.\n\n                    SENIOR OBLIGATOR\n               (not looking up)\n          These will need verification with the\n          central archive.\n\nCamon's jaw tightens. That's not the plan.\n\nAnd then Vin feels it.\n\nSomething changes in the room — not sound, not temperature. A presence. Heavy as iron. Wrong in a way her body understands before her mind does.\n\nThe door opens.\n\nA STEEL INQUISITOR enters.\n\nSeven feet tall. Gray Ministry robes. Where eyes should be — iron spikes, driven through the skull from temple to temple, gleaming dully in the candlelight.\n\nIt moves without sound despite its size.\n\nEvery person in the room goes rigid. The Obligators don't look up — which means they know, and knowing, they are afraid.\n\nThe Inquisitor's spiked face turns slowly toward Vin.\n\n                    VIN\n               (internal)\n          He sees me.\n\nShe doesn't move. Doesn't breathe.\n\nThen KELSIER (late 30s, lean, white shirt with sleeves rolled to expose scarred forearms, grinning like this is funny) appears in the doorway behind the Inquisitor. In his hands: a fistful of coins.\n\nHe flicks his wrist. The coins streak upward, punching through the ceiling beams — and Kelsier launches himself after them like he was born for this.\n\nChaos.\n\nThe Inquisitor spins. The crew scatters. Someone grabs Vin's arm — Kelsier, landed behind her, still grinning.\n\n                    KELSIER\n          Time to go.\n\nThey run.`
  },
  {
    id: 'sc-4', sceneNumber: '4', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Rooftops', setName: 'Rooftop Set (Stage 2)',
    description: 'KELSIER takes Vin above the city. Teaches her to burn tin. The mists clear and she sees the city in vivid detail for the first time. He tells her she\'s Mistborn.',
    scriptPage: 7, pageCount: '3/8',
    elements: ['el-vin', 'el-kelsier', 'el-mistcloak', 'el-mist', 'el-vials', 'el-vfx-metalburn', 'el-vfx-city', 'el-wire-rigs', 'el-allomancy-sounds'],
    notes: 'Key scene. Vin\'s world opens up. Tin-burning = sensory overload VFX. Kelsier is magnetic.',
    scriptContent: `EXT. ROOFTOP SET (STAGE 2) - NIGHT\n\nThe rooftops of Luthadel. Ash-dusted slate and crumbling chimney stacks. The city spreads below like a smudged drawing — noble keeps lit by firelight, alleyways swallowed by mist.\n\nKELSIER stands at the edge of a roof, completely at ease with two hundred feet of nothing beneath him. His Mistcloak billows. He holds up a small glass vial; metal flakes float in the liquid.\n\nVIN stands three feet from the edge. Not looking down.\n\n                    KELSIER\n          Tin. Drink it. Focus on the sensation.\n          Let it burn.\n\n                    VIN\n          What does burning feel like?\n\n                    KELSIER\n          Like remembering something you've\n          always known.\n\nShe takes the vial. Drinks.\n\nFor a moment: nothing.\n\nThen —\n\nThe world tears itself open.\n\n                    VIN\n               (gasping)\n          I can hear — everything —\n\nShe covers her ears. The city is suddenly deafening — wagon wheels on stone, a couple arguing three streets away, the slow breath of sleeping skaa in a tenement below.\n\n                    KELSIER\n          Don't fight it. Control it. Dim it down.\n          Tin gives you the choice.\n\nShe breathes. The sound recedes to a manageable roar. She lowers her hands.\n\nAnd sees.\n\nThe mist is retreating — or rather she is seeing through it, tin burning in her belly like a coal, her eyes adjusting to impossible sharpness. The city unfolds. On the horizon, the Lord Ruler's palace, KREDIK SHAW, rises: a tower of black spires like a wound in the sky.\n\n                    VIN\n               (barely breathing)\n          It's beautiful.\n\n                    KELSIER\n               (quietly)\n          It's a cage. But yes.\n\nHe turns to look at her. The grin softens into something rarer.\n\n                    KELSIER (CONT'D)\n          Vin. Do you know what it means to burn\n          all the metals? Not one or two — all eight?\n\n                    VIN\n          No one can do that.\n\n                    KELSIER\n               (beat)\n          One kind of person can.\n\nShe already knows. She's been knowing without words.\n\n                    KELSIER (CONT'D)\n          You're Mistborn, Vin.`
  },
  {
    id: 'sc-5', sceneNumber: '5', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Clubs\' Shop', setName: 'Crew Headquarters',
    description: 'Kelsier introduces Vin to the crew: BREEZE, HAM, CLUBS, DOCKSON, SAZED. He reveals the plan: overthrow the Lord Ruler. Everyone thinks he\'s insane. Vin watches, fascinated.',
    scriptPage: 9, pageCount: '5/8',
    elements: ['el-vin', 'el-kelsier', 'el-breeze', 'el-ham', 'el-clubs', 'el-dockson', 'el-sazed', 'el-skaa-rags', 'el-vials', 'el-ash-makeup'],
    notes: 'Crew assembly scene. Each character needs a distinct introduction moment. Heist movie energy.',
    scriptContent: `INT. CREW HEADQUARTERS - NIGHT\n\nA carpenter's shop by day. The ground floor cleared of sawdust and replaced with maps, ledgers, and the complicated smell of people who distrust each other but need each other to survive.\n\nBREEZE (50s, immaculate waistcoat, the kind of man who treats condescension as an art form) occupies the best chair — already working his Allomancy, small invisible nudges that make everyone in the room slightly more agreeable toward him.\n\nHAM (40s, built like a wall that chose to become a person, currently eating) sits with his arms on his knees. Philosophical eyes in a bruiser's body.\n\nCLUBS (60s, perpetually sour, carpenter's shavings still in his collar) leans against his own workbench and looks like a man who resents being in his own building.\n\nDOCKSON (30s, organized, the only one taking notes) stands near Kelsier with a ledger already open.\n\nSAZED (6'5\", bald, multiple earrings, the quiet dignity of a man who contains multitudes — literally) stands apart, observing.\n\nVin is in the corner again. Watching.\n\nKelsier takes the center of the room.\n\n                    KELSIER\n          You know why I gathered you. The most\n          talented crew in the Final Empire. I have\n          a job worthy of you.\n\n                    BREEZE\n               (drily)\n          He's going to say something insane.\n\n                    KELSIER\n          We're going to take down the Lord Ruler.\n\nA beat.\n\n                    HAM\n               (slowly stops eating)\n\n                    CLUBS\n          Get out of my shop.\n\n                    KELSIER\n          His treasury. The Ministry. The noble houses.\n          We dismantle the whole system from inside.\n\n                    BREEZE\n          When you say "take down" — you mean his\n          government? His economy? Or are we committing\n          divine suicide and going after the man himself?\n\n                    KELSIER\n          Yes.\n\nHam whistles, low and long.\n\n                    CLUBS\n          The Lord Ruler killed the last man who tried.\n          Turned him into a Steel Inquisitor.\n\n                    KELSIER\n          The Lord Ruler hasn't met us.\n\n                    VIN\n               (from the corner, quiet but clear)\n          Why? You could steal anything. Any noble\n          house. Why this?\n\nThe room turns. Most of them forgot she was there.\n\n                    KELSIER\n          Because we can.\n\n                    VIN\n          That's not a reason.\n\nA pause. Kelsier looks at her — really looks at her.\n\n                    KELSIER\n          Because a thousand years of skaa suffering\n          requires an answer. And I am tired of watching\n          people starve because someone decided they\n          were born less than human.\n               (beat)\n          Also because we can.\n\nSazed steps forward and touches one of his earrings — a subtle gesture that means something to those who know.\n\n                    SAZED\n          I will assist. I have knowledge that could\n          prove relevant. Records of what came before.\n          Of what the Lord Ruler has tried to make\n          the world forget.\n\n                    KELSIER\n               (to the room)\n          Anyone who wants out, go now.\n\nNo one moves.`
  },
  {
    id: 'sc-6', sceneNumber: '6', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Streets', setName: 'City Street / Alley',
    description: 'Kelsier teaches Vin Steelpushing. She launches coins at targets, then pushes off metal to fly through the mists. First flight sequence.',
    scriptPage: 12, pageCount: '4/8',
    elements: ['el-vin', 'el-kelsier', 'el-mistcloak', 'el-coins', 'el-vfx-steelpush', 'el-wire-rigs', 'el-stunt-allomancy', 'el-mist', 'el-allomancy-sounds'],
    notes: 'MAJOR VFX SEQUENCE. Training montage energy but grounded. Wire rigs + CG steel lines. 2 days minimum.',
    scriptContent: `EXT. CITY STREET / ALLEY - NIGHT\n\nA deserted alley in Luthadel's warehouse district. Mist pools at knee height. A row of iron-reinforced wagon wheels leans against the far wall.\n\nKelsier stands with a handful of coins. Vin stands ten feet away, her vial belt new and stiff.\n\n                    KELSIER\n          Iron and steel. Two sides of the same metal,\n          two sides of the same instinct. Iron pulls.\n          Steel pushes. Feel the metal.\n\nHe tosses a coin at her feet. She looks at it.\n\n                    KELSIER (CONT'D)\n          Not with your eyes.\n\nShe closes them. Burns steel — and the world fills with blue lines. Thin filaments of light connecting her to every piece of metal within range. The coins in her pocket. Iron studs on a door thirty yards away. The wagon wheel rims.\n\nThe coin at her feet glows brightest.\n\nShe pushes.\n\nThe coin rockets into the wall hard enough to embed itself in the brick.\n\n                    VIN\n               (exhaling)\n          Oh.\n\n                    KELSIER\n               (grinning)\n          Now do it to yourself.\n\nShe drops a coin beneath her foot and pushes. She launches six feet into the air, yelps, overcorrects, and lands badly on a crate.\n\n                    KELSIER (CONT'D)\n               (not laughing)\n               (definitely laughing)\n          Again.\n\nA TRAINING SEQUENCE in the dark:\n\n— Vin launching too high, grabbing a chimney, sliding back down.\n\n— Kelsier vaulting between rooftops with inhuman ease, Mistcloak streaming, coins firing like weapons from his open hand.\n\n— Vin learning to read blue lines with her eyes open. The world suddenly made of physics she can touch.\n\n— A coin hits a wall. She pulls it back. It smacks her palm. She grins despite herself.\n\nThen:\n\nKelsier drops a coin and pushes. He rises fifteen feet in a single beat — and keeps going, arcing up and over the roofline.\n\n                    VIN\n               (looking up)\n          How far can you go?\n\n                    KELSIER\n               (from above, receding)\n          As far as you dare.\n\nShe breathes. Burns steel. Places the coin beneath her heel.\n\nShe pushes.\n\nThe mist parts around her as she rises — up past the first roofline, the second, the air growing cold and sharp. The city falls away beneath her.\n\nFor the first time in her life, Vin is not beneath the boot of anything.\n\nShe's flying.`
  },
  {
    id: 'sc-7', sceneNumber: '7', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Keep Venture', setName: 'Noble Ballroom',
    description: 'Vin\'s first noble ball, disguised as Lady Valette Renoux. She\'s overwhelmed by the opulence. Meets ELEND VENTURE reading in a corner. Instant chemistry. She Soothes guards to move through the crowd.',
    scriptPage: 15, pageCount: '6/8',
    elements: ['el-vin', 'el-elend', 'el-straff', 'el-vin-transformation', 'el-noble-gowns', 'el-noble-suits', 'el-noble-jewelry', 'el-vfx-metalburn', 'el-allomancy-sounds', 'el-carriages'],
    notes: 'Cinderella moment. Contrast street Vin with noble Vin. Elend is reading at a ball. Straff Venture present. 100+ extras in noble attire. Carriages arriving.',
    scriptContent: `INT. NOBLE BALLROOM - NIGHT\n\nKeep Venture. The ballroom is a cathedral of light — a thousand candles in iron chandeliers, marble floors polished to a mirror, the daughters and sons of the Final Empire's nobility dressed in a fortune each.\n\nAsh falls outside. In here it is summer forever.\n\nVIN steps out of a carriage and stops.\n\nShe is wearing silk for the first time. The deep blue gown fits like an argument she is winning. Her hair is pinned. She is Lady Valette Renoux, minor noble. She is seventeen and terrified.\n\nShe burns copper, then tin — muffling her own presence while sharpening her senses. The room opens before her like a test.\n\nNobles flow in patterns. She reads them the way she read alleyways — exits, threats, power. She burns brass, just a touch — soothing the suspicion from a nearby guard who is watching her too carefully.\n\n                    GUARD\n               (relaxing, to his partner)\n          Another new face from the outer houses.\n\nShe passes through.\n\nAcross the room, STRAFF VENTURE (50s, patrician cruelty refined into good manners) holds court at the center, receiving lesser nobles like petitions. Vin watches him and understands immediately why Elend always looks apologetic.\n\nShe moves toward the far wall — and stops.\n\nIn an alcove beside a pillar, with his back to the entire party and his nose in a book, is a young man who should not be at this party.\n\nELEND VENTURE (early 20s, shirt untucked despite the evening clothes, hair not quite successfully combed) reads with the focused pleasure of someone who has found the only interesting thing in the room.\n\nVin regards him. He is reading political philosophy at a ball.\n\n                    VIN\n          Is that Terris social theory?\n\n                    ELEND\n               (not looking up)\n          Galivan's Critique. Second edition.\n          You've read it?\n\n                    VIN\n          No. But if you're going to hide at a ball\n          you should pick something thicker.\n          Takes longer.\n\nHe looks up. A beat.\n\n                    ELEND\n               (re-evaluating)\n          You're not a noble.\n\n                    VIN\n          I am literally wearing three hundred\n          boxings of silk.\n\n                    ELEND\n          Noble clothing. But you looked at this room\n          like you were counting exits.\n\n                    VIN\n          Didn't everyone?\n\n                    ELEND\n               (turning fully toward her)\n          Most people look at this room like it owes\n          them something. You looked at it like you\n          were learning from it.\n\nHe closes the book.\n\n                    ELEND (CONT'D)\n          Elend Venture. And yes, I'm hiding.\n\n                    VIN\n          Valette Renoux. And you're very bad at it.\n\nHe laughs — surprised out of it, a real laugh, not a social one.\n\nAcross the ballroom, Vin feels it before she can name it. A subtle tug on the room's emotional fabric — not hers. Something smoother, more experienced. BREEZE is visible at the far end, working the crowd with practiced invisibility. He catches her eye and raises his glass fractionally.\n\nShe turns back to Elend.\n\n                    ELEND\n          What do you actually think of this place?\n\n                    VIN\n               (small pause)\n          I think it's very beautiful. And I think\n          everyone in it is afraid.\n\nElend looks around the room. For the first time, sees it the way she does.\n\n                    ELEND\n               (quietly)\n          Yes.\n\nOutside, through the great windows: ash, and mist, and the dark spires of Kredik Shaw on the horizon.`
  },
  {
    id: 'sc-8', sceneNumber: '8', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Kredik Shaw Exterior', setName: 'Lord Ruler\'s Palace (Ext)',
    description: 'Kelsier infiltrates Kredik Shaw. Confronted by a STEEL INQUISITOR. Brutal fight — Kelsier uses Allomancy creatively but is outmatched. Barely escapes.',
    scriptPage: 19, pageCount: '5/8',
    elements: ['el-kelsier', 'el-inquisitor1', 'el-mistcloak', 'el-coins', 'el-glass-daggers', 'el-vfx-steelpush', 'el-stunt-fights', 'el-stunt-allomancy', 'el-wire-rigs', 'el-mist', 'el-vfx-city', 'el-fire'],
    notes: 'Massive action set piece. Kelsier vs Inquisitor. Shows Inquisitors are nearly unbeatable. Heavy VFX + wirework.',
    scriptContent: `EXT. LORD RULER'S PALACE (EXT) - NIGHT\n\nKredik Shaw. A hundred spires of black stone, dense as a throne and sharp as spite. The Lord Ruler's palace is not meant to be beautiful. It is meant to be inevitable.\n\nThe mist wraps it like a shroud.\n\nKelsier lands on the outer wall without a sound. His Mistcloak settles. He carries no torch — his tin-sharpened eyes need none. He reads the guard patrol pattern in six seconds.\n\n                    KELSIER\n               (to himself, barely a breath)\n          Predictable.\n\nHe pushes off a wall bracket. Silent, fast — a shadow that forgets to fall.\n\nHe is ten yards from the inner doors when the Inquisitor appears.\n\nNot stepping from shadow. Not arriving. Simply present. One moment the space is empty, the next: the STEEL INQUISITOR stands between Kelsier and the entrance. Spike-eyed. Motionless.\n\n                    INQUISITOR\n          Survivor.\n\n                    KELSIER\n               (pleasant)\n          You know my name. I'm flattered.\n\nHe throws coins before the word is finished — a fistful, driven by steel at lethal velocity. They hit the Inquisitor's robes and bounce off. The Inquisitor doesn't flinch.\n\nThe Inquisitor reaches to the side. A wall bracket tears free and flies into its grip — a makeshift iron club. It swings.\n\nKelsier pushes off a mounted torch and vaults straight up. The club passes through where he was. He fires coins downward as he rises, forcing the Inquisitor to move.\n\nThey fight in the air as much as on the ground.\n\nKelsier is brilliant, fast, creative — every movement improvised genius. But the Inquisitor heals. Kelsier hits it with his glass dagger; the wound closes before the blade leaves its hand.\n\nKelsier takes a hit. A real one. He slams into a wall, slides down, gasps — burns pewter hard, feels the healing begin, knows it is not fast enough.\n\n                    KELSIER\n               (bleeding, still grinning)\n          You're better than the last one.\n\nHe fires his last coins into the courtyard torches. The light dies.\n\nIn the sudden dark, even an Inquisitor must adjust.\n\nKelsier is gone.\n\nThe Inquisitor stands alone in the dark courtyard. Blood on the stones. Not enough of it.\n\n                    INQUISITOR\n               (to the darkness, calm)\n          Next time, Survivor.\n\nThe mist closes back in.`
  },
  {
    id: 'sc-9', sceneNumber: '9', intExt: 'INT', dayNight: 'DAY',
    location: 'Clubs\' Shop', setName: 'Crew Headquarters',
    description: 'MARSH leaves to infiltrate the Steel Ministry as a spy. Tense goodbye between the brothers. Kelsier can\'t talk him out of it.',
    scriptPage: 22, pageCount: '2/8',
    elements: ['el-kelsier', 'el-marsh', 'el-dockson', 'el-ash-makeup'],
    notes: 'Emotional beat. Brothers may never see each other again.',
    scriptContent: `INT. CREW HEADQUARTERS - DAY\n\nMorning light through shuttered windows, gray as old ash. The shop is quiet. Dockson cleans ledgers at the far end. Ham sharpens a blade without looking at it.\n\nMARSH (mid-40s, taller than Kelsier and shaped by a different gravity — where Kelsier bends toward warmth, Marsh angles away from it) stands with a canvas pack over one shoulder. He is already leaving.\n\n                    KELSIER\n          You don't have to do this.\n\n                    MARSH\n          Someone has to. The Ministry needs to believe\n          it's receiving a genuine convert.\n\n                    KELSIER\n          You'll be surrounded by Steel Inquisitors.\n\n                    MARSH\n               (dry)\n          I've been surrounded by you.\n          I can handle anything.\n\nA beat.\n\n                    KELSIER\n          Marsh —\n\n                    MARSH\n          The job matters more than we do.\n          That's what you always said.\n\n                    KELSIER\n          I say a lot of things.\n\n                    MARSH\n          You mean this one.\n\nHe adjusts the pack. Doesn't offer a hand, doesn't embrace. That is not how they were built.\n\n                    MARSH (CONT'D)\n          If it works — I'll be positioned to know\n          things from inside. If it doesn't —\n\n                    KELSIER\n          It will work.\n\n                    MARSH\n               (beat; something almost fond)\n          Goodbye, Kell.\n\nHe walks out.\n\nKelsier doesn't watch him go. He looks at the table. At the map. At the plan he built from grief and spite and something that might be hope.\n\nHe wonders if his brother will recognize him when this is over.`
  },
  {
    id: 'sc-10', sceneNumber: '10', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Keep Venture', setName: 'Noble Ballroom',
    description: 'Second ball. Vin dances with Elend. Breeze works the crowd, Sooting nobles. Vin discovers Shan Elariel is also Mistborn when she senses her burning metals.',
    scriptPage: 23, pageCount: '4/8',
    elements: ['el-vin', 'el-elend', 'el-breeze', 'el-shan', 'el-noble-gowns', 'el-noble-suits', 'el-noble-jewelry', 'el-vfx-metalburn', 'el-allomancy-sounds', 'el-carriages'],
    notes: 'Political intrigue ramps up. Vin is getting better at the game. Shan is dangerous. Carriages in establishing shot.',
    scriptContent: `INT. NOBLE BALLROOM - NIGHT\n\nKeep Venture, second ball. More of the same opulence — but Vin moves through it differently now. Less counting exits. More reading faces.\n\nShe finds Elend near the same pillar. Different book.\n\n                    VIN\n          Galivan again?\n\n                    ELEND\n          His successor. Worse prose, better arguments.\n\nShe sits beside him without waiting to be invited. He doesn't seem to expect her to.\n\nThe orchestra shifts into something slower. Nobles arrange themselves on the floor.\n\n                    ELEND (CONT'D)\n          Would you —\n\n                    VIN\n          Yes.\n\nThey dance. She has been practicing with Sazed; it shows in her form but not yet in her ease. Elend is a decent dancer hiding it under terrible posture.\n\n                    ELEND\n          You're not from the outer houses.\n\n                    VIN\n               (focusing on the steps)\n          Everyone keeps saying that.\n\n                    ELEND\n          It's meant as a compliment. The outer\n          houses are performative. You say\n          what you think.\n\n                    VIN\n          Do I?\n\n                    ELEND\n          You agreed to dance before I finished\n          the question.\n\n                    VIN\n          Maybe I knew what you were going to say.\n\nHe almost smiles. She is almost caught by it.\n\nMeanwhile: BREEZE moves through the crowd with a glass of wine and an expression of mild boredom. He pauses near a cluster of Great House representatives. Applies pressure so subtle it barely exists — warmth here, confidence there. A trade negotiation stalled for six months comes unstuck. He drifts on.\n\nVin senses him working. And then senses something else.\n\nSomething sharp. Controlled and cold and aimed.\n\nShe glances across the room. SHAN ELARIEL (late 20s, beautiful in the way of things designed to cut) watches Elend with an expression that belongs in a ledger, not on a face.\n\nVin burns tin carefully.\n\nShe feels it: Shan is burning metals. Multiple metals. The way you breathe — without thinking.\n\n                    VIN\n               (quietly, still dancing)\n          She's Mistborn.\n\n                    ELEND\n               (distracted by the steps)\n          Sorry?\n\n                    VIN\n               (smooth cover)\n          She's watching you.\n\n                    ELEND\n               (sighing)\n          Shan. She's been watching me for two years.\n          Our houses have an arrangement.\n\n                    VIN\n          Do you have an arrangement?\n\n                    ELEND\n               (meeting her eyes)\n          I'm here talking to you.\n\nShans's gaze moves from Elend to Vin. Vin holds the look for a beat longer than is safe.`
  },
  {
    id: 'sc-11', sceneNumber: '11', intExt: 'INT', dayNight: 'DAY',
    location: 'Renoux Estate', setName: 'Renoux Study',
    description: 'Sazed teaches Vin about the Keepers and the old religions. She reads the Lord Ruler\'s logbook. Discovers the Lord Ruler may not be who everyone thinks.',
    scriptPage: 26, pageCount: '3/8',
    elements: ['el-vin', 'el-sazed', 'el-logbook', 'el-noble-gowns'],
    notes: 'Lore dump done as character bonding. Sazed is warm, wise. Vin begins trusting people.',
    scriptContent: `INT. RENOUX STUDY - DAY\n\nA well-appointed room in the estate Kelsier has established as Vin's cover. Bookshelves hold volumes that have no business existing in the Final Empire — old texts, pre-Ascension histories, things the Lord Ruler spent centuries trying to erase.\n\nSAZED sits across a low table from Vin. Between them: the logbook. A leather journal, old beyond reckoning. The handwriting inside is cramped and urgent.\n\n                    SAZED\n          The Keepers. We are librarians, in the\n          old sense. We memorize what the Ministry\n          burns. When they destroy a religion, we\n          learn it first. We become its vessel.\n\nHe touches one of his many earrings.\n\n                    SAZED (CONT'D)\n          Each ring holds a compressed record.\n          Thousands of pages. The histories of\n          forty-three faiths since extinguished.\n\n                    VIN\n          That's illegal.\n\n                    SAZED\n               (gently)\n          Yes. Almost everything worth preserving is.\n\nShe looks at the logbook.\n\n                    VIN\n          Whose is it?\n\n                    SAZED\n          We believe it belonged to the Lord Ruler\n          himself. From before the Ascension. Before\n          he became what he became.\n\n                    VIN\n               (opening it)\n          He was a person once.\n\n                    SAZED\n          He was a man. A frightened one, I think.\n          Read what he wrote.\n\nShe reads. On the page, in cramped and ancient handwriting:\n\n"I know what I must do. But I fear what I am becoming to do it. The Well is close. The power waits. And I do not know if the man who takes it will be the same man who came to find it."\n\n                    VIN\n               (looking up)\n          He was afraid of himself.\n\n                    SAZED\n          He was. And then something went wrong.\n          The man disappeared, and only the Lord\n          Ruler remained.\n               (beat)\n          What that means for his vulnerability —\n          what that means for the nature of what\n          he is — we do not yet know. But we\n          begin to suspect.\n\nVin reads on. Outside the window, ash falls on the garden.`
  },
  {
    id: 'sc-12', sceneNumber: '12', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Streets', setName: 'City Street / Alley',
    description: 'Vin vs SHAN ELARIEL. Rooftop Mistborn duel. Vin wins by improvising, using her street instincts. Kills Shan with an obsidian dagger.',
    scriptPage: 28, pageCount: '5/8',
    elements: ['el-vin', 'el-shan', 'el-mistcloak', 'el-glass-daggers', 'el-coins', 'el-vfx-steelpush', 'el-stunt-fights', 'el-stunt-allomancy', 'el-stunt-fall', 'el-wire-rigs', 'el-mist', 'el-allomancy-sounds'],
    notes: 'Vin proves herself. Fast, brutal, creative combat. Major wirework sequence.',
    scriptContent: `EXT. CITY STREET / ALLEY - NIGHT\n\nThe rooftops of a commercial district. Mist thick as smoke. Below: deserted night streets, a curfew respected by all skaa who want to see morning.\n\nVIN lands on a rooftop, coins raining out beneath her as she descends. Her Mistcloak fans. She burns tin and scans.\n\nShe feels SHAN before she sees her.\n\nSHAN ELARIEL drops from above, Mistcloak matching Vin's, an obsidian dagger in each hand.\n\n                    SHAN\n          I wondered how long before you stopped\n          hiding what you are.\n\n                    VIN\n          I wasn't hiding.\n\n                    SHAN\n          You were hiding at balls, behind a dress\n          and a borrowed name. Charming. But you've\n          been touching Elend Venture, and that\n          isn't something I can allow.\n\nShe throws a coin — not a warning, not a miss. Full speed, full power.\n\nVin pushes it off-course with a thought. The coin shatters a chimney pot ten feet to her left.\n\n                    VIN\n          I'm not doing this for Elend.\n\n                    SHAN\n               (advancing, burning steel)\n          Then what are you doing? Playing\n          revolutionary? Following Kelsier\n          like a pet?\n\n                    VIN\n          I'm here because you're trying to kill me.\n\nShe drops a coin and launches sideways — not up, sideways, fast, low — pushes off an iron window frame across the gap and cannons back toward Shan like a thrown stone.\n\nThe collision is brutal. They skid across the roof grappling, each trying to get a dagger clear.\n\nShan is stronger. Shan has years. Shan has been doing this since before Vin knew what Allomancy was.\n\nBut Vin grew up in alleys.\n\n                    VIN\n               (in the tangle)\n          You fight like a noble.\n\n                    SHAN\n               (pressing her advantage)\n          You fight like a street rat.\n\n                    VIN\n               (finding an angle)\n          Yes.\n\nShe doesn't go for the dagger. She pulls — iron on Shan's bracelet, hard. The snap of the wrist as the bracelet tears free gives her the half-second she needs.\n\nThe obsidian dagger finds its mark.\n\nShan is still. The mist folds in around her.\n\nVin stands alone on the rooftop, breathing hard. She looks at the dagger in her hand.\n\n                    VIN (CONT'D)\n               (to herself)\n          Street rat wins.\n\nShe pushes off into the dark, coins trailing beneath her like falling stars.`
  },
  {
    id: 'sc-13', sceneNumber: '13', intExt: 'EXT', dayNight: 'DAY',
    location: 'Luthadel City Square', setName: 'Central Square',
    description: 'Kelsier faces the LORD RULER publicly before the skaa masses. The Lord Ruler kills Kelsier. Kelsier dies smiling, having planned this all along. The skaa begin to revolt.',
    scriptPage: 32, pageCount: '6/8',
    elements: ['el-kelsier', 'el-lordruler', 'el-inquisitor1', 'el-inquisitor-prosthetics', 'el-ash-fall', 'el-vfx-steelpush', 'el-stunt-fights', 'el-wire-rigs', 'el-fire', 'el-coins', 'el-mistcloak', 'el-allomancy-sounds', 'el-ash-makeup', 'el-skaa-rags'],
    notes: 'THE pivotal scene. Kelsier\'s death is a sacrifice, not a defeat. 500+ extras. Massive staging. The Survivor becomes a martyr.',
    scriptContent: `EXT. CENTRAL SQUARE - DAY\n\nThe plaza before the Ministry's main Canton — the largest open space in Luthadel, designed for spectacle, for proclamations, for the calculated theater of divine authority.\n\nAsh falls harder than usual today.\n\nFIVE HUNDRED SKAA fill the square. Plantation workers, city laborers, the bent and the hungry. They have been told to come, and they came, because in the Final Empire you come when you are told.\n\nKelsier walks into the center of the square.\n\nHe is alone. No crew. No coins drawn. His Mistcloak is gone — he wears his white shirt, sleeves rolled, the SCARS on his forearms visible to anyone with eyes.\n\n                    SKAA WORKER #1\n               (recognizing something)\n          Is that —\n\n                    SKAA WORKER #2\n          The Survivor. Lord Ruler —\n\nA murmur moves through the crowd. The Survivor of Hathsin. A man who escaped the Lord Ruler's death pits. And laughed.\n\nKelsier stops in the middle of the square. He looks up.\n\nThe STEEL INQUISITOR steps from the Ministry entrance. Behind it, more Inquisitors. And then, moving with the unhurried certainty of a man who has forgotten what fear is:\n\nTHE LORD RULER.\n\nFlawless, ageless, garbed in white and gold. He radiates something that is not quite a human emotion but that every human body recognizes as immense and terrible power.\n\nThe skaa go silent.\n\n                    LORD RULER\n               (not raising his voice;\n               he doesn't need to)\n          The Survivor. Come to die\n          in front of witnesses.\n\n                    KELSIER\n               (smiling)\n          I've been meaning to talk to you.\n\n                    LORD RULER\n          You intend to use this as a symbol.\n\n                    KELSIER\n          I intend to use this as a fact.\n          I'm not afraid of you.\n\nThe Lord Ruler extends one hand. The force is invisible but the effect is not — Kelsier staggers, holds himself, drives himself back upright.\n\n                    KELSIER (CONT'D)\n               (still standing)\n          Look at that. I'm still here.\n\nHe turns to the crowd.\n\n                    KELSIER (CONT'D)\n          He's not a god. He's just a man who\n          figured out the right trick. And we\n          know the trick now.\n\nThe Lord Ruler applies more pressure. Kelsier goes to one knee.\n\nHe does not go further.\n\n                    KELSIER (CONT'D)\n               (through gritted teeth)\n          They can kill me. But they can't kill\n          what I've started.\n\nHe looks up at the Lord Ruler.\n\n                    KELSIER (CONT'D)\n               (quietly, just for him)\n          This is the part where you make me\n          into a legend.\n\nThe Lord Ruler holds his gaze for a long moment.\n\nThen he closes his fist.\n\nThe skaa watch.\n\nAnd something changes in the square that the Lord Ruler did not plan for, did not account for in a thousand years of rule.\n\nThe skaa worker who recognized Kelsier takes one step forward.\n\nThen another. Then the one beside him.\n\n                    SKAA WORKER #1\n               (barely a whisper —\n               then louder)\n          The Survivor.\n\n                    SKAA WORKER #2\n          The Survivor —\n\nThe Lord Ruler turns to look at the crowd. For the first time in this scene, something moves behind his perfect face.\n\nThe skaa are not running.\n\nThey're advancing.`
  },
  {
    id: 'sc-14', sceneNumber: '14', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Kredik Shaw Interior', setName: 'Lord Ruler\'s Throne Room',
    description: 'VIN confronts the LORD RULER in his throne room. Uses the Eleventh Metal. Discovers the truth: he\'s not the Hero of Ages. Draws on the mists, tears his Hemalurgic spikes free. The Lord Ruler ages and dies.',
    scriptPage: 36, pageCount: '7/8',
    elements: ['el-vin', 'el-lordruler', 'el-mistcloak', 'el-atium', 'el-vfx-steelpush', 'el-vfx-atium', 'el-vfx-metalburn', 'el-vfx-koloss', 'el-stunt-fights', 'el-stunt-allomancy', 'el-wire-rigs', 'el-kredik-shaw', 'el-hathsin-set', 'el-mist', 'el-fire', 'el-allomancy-sounds', 'el-rain-towers'],
    notes: 'CLIMAX. Biggest VFX sequence. Lord Ruler aging is major prosthetic/CG work. Vin draws on the mist itself. Koloss vision during Atium burn. Hathsin flashback insert. Rain/ash towers for throne room mist.',
    scriptContent: `INT. LORD RULER'S THRONE ROOM - NIGHT\n\nKredik Shaw. The throne room is built to make humans feel small — columns rising fifty feet, the ceiling lost in darkness above, the Lord Ruler's throne on a dais of white stone.\n\nAsh falls inside the throne room. Through cracks in the ancient walls, the mist seeps in.\n\nVIN lands in the center of the room. Her Mistcloak is torn, scored from fighting through the palace. She burns steel — blue lines everywhere, metal in the columns, the brackets, the fittings. An Allomancer's paradise and trap at once.\n\nThe LORD RULER sits on his throne. He has been expecting her.\n\n                    LORD RULER\n          A child.\n\n                    VIN\n          I'm not here to impress you.\n\n                    LORD RULER\n          You came here to die.\n\nHe stands. The room changes — not physically, not yet, but the weight of his presence increases. The air thickens. Every oldest instinct in Vin's body says: run. This is a predator.\n\nShe holds.\n\n                    VIN\n          I know what you are. I read your logbook.\n          You were afraid.\n\n                    LORD RULER\n               (still)\n          What do you know about fear?\n\n                    VIN\n          I grew up afraid. Afraid of my crew. Afraid\n          to eat. Afraid that if I trusted anyone\n          they'd use it to break me. That's what you\n          made the world into — a place where everyone\n          is afraid like you were afraid, and you get\n          to pretend you're above it.\n\nThe Lord Ruler descends the dais. He moves like he owns physics.\n\n                    LORD RULER\n          I saved the world. I bore what no one else\n          could bear. I gave everything —\n\n                    VIN\n          You took everything.\n\nShe throws coins — not to hurt, to force movement, to buy seconds. He deflects them with a gesture. They fight.\n\nIt is not a fair fight. She pushes; he counters. She burns pewter and he burns pewter back, and his reserves dwarf hers. He catches her with a steel-push that sends her into a column.\n\nShe rises. Burns tin. Burns steel. Burns iron. Reads the room in blue lines.\n\nHe reaches for her throat.\n\nShe pulls the vial with the ELEVENTH METAL.\n\nBurns it.\n\nThe world shifts.\n\nGhost images overlay the Lord Ruler — shadows of what he was, who he was. A young man, frightened, standing at the Well of Ascension. And that man is not the Lord Ruler.\n\nThat man is Rashek.\n\n                    VIN\n               (understanding flooding in)\n          You're not the Hero of Ages. You were\n          the packman. You killed him and took\n          the power yourself.\n\nSomething crosses his face. Something ancient.\n\n                    LORD RULER\n          You understand nothing about what\n          I preserved.\n\n                    VIN\n          But it means the power isn't complete.\n          You're held together with Hemalurgy.\n          Spikes. You're made of pieces that\n          don't belong to you.\n\nShe burns iron.\n\nShe reaches for the spikes.\n\n                    LORD RULER\n               (something finally breaking through)\n          Don't —\n\nThe mist pours through every crack and window. It wraps around Vin. Fills her. More than she has, more than she should be able to hold —\n\nShe pulls.\n\nThe spikes tear free.\n\nThe Lord Ruler sags. And begins to age.\n\nIt is not slow. A thousand years of suppressed time crashes back into his body in seconds. He ages decades with each heartbeat, white robes drooping, the gold tarnishing, the perfect face collapsing into what it always was: a man.\n\nHe reaches one hand toward her. Not in violence. In something closer to relief.\n\n                    LORD RULER\n               (crumbling)\n          You don't know what... the mist spirit...\n          what it wants...\n               (barely audible)\n          We're all just pieces... in something\n          larger...\n\nHe falls.\n\nThe throne room is silent except for the soft hiss of the mist and the settling of the ash.\n\nVin stands alone in the center of the room, still burning, holding more power than any human should.\n\nShe lets it go.\n\nShe breathes.`
  },
  {
    id: 'sc-15', sceneNumber: '15', intExt: 'EXT', dayNight: 'DAWN',
    location: 'Luthadel City', setName: 'City Overlook',
    description: 'Vin and Elend stand on a balcony overlooking Luthadel at dawn. The mists recede. For the first time, the sun looks a little less red. A new era begins. But the mists are still there.',
    scriptPage: 40, pageCount: '2/8',
    elements: ['el-vin', 'el-elend', 'el-sazed', 'el-vfx-city', 'el-mist', 'el-ash-fall'],
    notes: 'Denouement. Hopeful but ominous. Sequel hook. The ashfall hasn\'t stopped.',
    scriptContent: `EXT. CITY OVERLOOK - DAWN\n\nA balcony overlooking Luthadel. The city spreads below, waking into an era it doesn't have words for yet.\n\nVIN stands at the railing. She has been here for hours. Her battle-worn Mistcloak hangs from her shoulders.\n\nELEND approaches from behind — holding a book, of course. He stands beside her and doesn't try to find words, which is the correct thing to do.\n\nBelow: the skaa are in the streets. Not rioting. Standing. Looking around at a city without a god in it.\n\nSAZED comes to stand on her other side.\n\n                    SAZED\n          The ashfall continues. The mists have\n          not retreated. There is much the death\n          of the Lord Ruler has not solved.\n\n                    VIN\n          I know.\n\n                    SAZED\n          There are records I have kept for\n          this moment. Forty-three faiths.\n          Knowledge of what came before.\n          What might come again.\n\n                    VIN\n          We'll need it.\n\n                    ELEND\n               (quietly)\n          The sun looks different.\n\nThey look.\n\nHe's right. Barely. The sun on the horizon is red as always, choked through ash and mist. But there is something behind it — a quality of light that was not there yesterday.\n\nIt might be hope.\n\nIt might just be the angle.\n\n                    VIN\n               (soft)\n          It's still there.\n\n                    ELEND\n          What is?\n\n                    VIN\n          The mist.\n\nShe looks out at the city. Her city now, in whatever way she didn't ask for and doesn't know what to do with.\n\n                    VIN (CONT'D)\n          But it's ours. Whatever it means,\n          it's ours.\n\nThe ash falls.\n\nThe mist curls.\n\nThe sun comes up red and strange over a world that has to be rebuilt.\n\n                                                      FADE OUT.`
  },
];

// ── STRIP BOARD ─────────────────────────────────────────────────────────────

const stripBoard = [
  { type: 'banner', id: 'ban-1', text: 'FIRST UNIT — PRINCIPAL PHOTOGRAPHY', color: '#DAA520' },
  { type: 'dayBreak', id: 'db-1', dayNumber: 1, label: 'Day 1 — Crew HQ Interior' },
  { type: 'scene', id: 'strip-5', breakdownId: 'sc-5' },
  { type: 'scene', id: 'strip-9', breakdownId: 'sc-9' },
  { type: 'dayBreak', id: 'db-2', dayNumber: 2, label: 'Day 2 — Crew HQ / Renoux Estate' },
  { type: 'scene', id: 'strip-11', breakdownId: 'sc-11' },
  { type: 'dayBreak', id: 'db-3', dayNumber: 3, label: 'Day 3 — Obligator Office / Underground' },
  { type: 'scene', id: 'strip-2', breakdownId: 'sc-2' },
  { type: 'scene', id: 'strip-3', breakdownId: 'sc-3' },
  { type: 'dayBreak', id: 'db-4', dayNumber: 4, label: 'Day 4 — Noble Ballroom (Ball 1)' },
  { type: 'scene', id: 'strip-7', breakdownId: 'sc-7' },
  { type: 'dayBreak', id: 'db-5', dayNumber: 5, label: 'Day 5 — Noble Ballroom (Ball 2)' },
  { type: 'scene', id: 'strip-10', breakdownId: 'sc-10' },
  { type: 'banner', id: 'ban-2', text: 'NIGHT SHOOTS — EXT LOCATIONS', color: '#4A90D9' },
  { type: 'dayBreak', id: 'db-6', dayNumber: 6, label: 'Day 6 — Night Ext (Slums / Rooftops)' },
  { type: 'scene', id: 'strip-1', breakdownId: 'sc-1' },
  { type: 'scene', id: 'strip-4', breakdownId: 'sc-4' },
  { type: 'dayBreak', id: 'db-7', dayNumber: 7, label: 'Day 7-8 — Allomancy Training (2 nights)' },
  { type: 'scene', id: 'strip-6', breakdownId: 'sc-6' },
  { type: 'dayBreak', id: 'db-8', dayNumber: 9, label: 'Day 9-10 — Vin vs Shan (2 nights)' },
  { type: 'scene', id: 'strip-12', breakdownId: 'sc-12' },
  { type: 'banner', id: 'ban-3', text: 'MAJOR SET PIECES', color: '#DE3163' },
  { type: 'dayBreak', id: 'db-9', dayNumber: 11, label: 'Day 11-12 — Kredik Shaw Exterior Fight' },
  { type: 'scene', id: 'strip-8', breakdownId: 'sc-8' },
  { type: 'dayBreak', id: 'db-10', dayNumber: 13, label: 'Day 13-15 — Kelsier\'s Death (3 days)' },
  { type: 'scene', id: 'strip-13', breakdownId: 'sc-13' },
  { type: 'dayBreak', id: 'db-11', dayNumber: 16, label: 'Day 16-18 — Throne Room Climax (3 days)' },
  { type: 'scene', id: 'strip-14', breakdownId: 'sc-14' },
  { type: 'dayBreak', id: 'db-12', dayNumber: 19, label: 'Day 19 — Dawn Epilogue' },
  { type: 'scene', id: 'strip-15', breakdownId: 'sc-15' },
];

// ── EXTRAS GROUPS ───────────────────────────────────────────────────────────

const extraGroups = [
  { id: 'eg-skaa-crowd', name: 'Skaa Crowd', category: 'Non-Union', defaultRate: 150, defaultOvertimeRate: 225, notes: 'Ash-covered peasant wardrobe. Scenes 1, 13.' },
  { id: 'eg-nobles', name: 'Noble Ball Attendees', category: 'SAG', defaultRate: 250, defaultOvertimeRate: 375, notes: 'Full noble wardrobe and makeup. Ball scenes 7, 10.' },
  { id: 'eg-skaa-rebels', name: 'Skaa Rebels', category: 'Non-Union', defaultRate: 175, defaultOvertimeRate: 262, notes: 'Rebellion scene. Some stunt work.' },
  { id: 'eg-guards', name: 'Noble House Guards', category: 'Non-Union', defaultRate: 175, defaultOvertimeRate: 262, notes: 'Uniformed guards for keeps and balls.' },
  { id: 'eg-obligators', name: 'Obligators', category: 'SAG', defaultRate: 200, defaultOvertimeRate: 300, notes: 'Robed ministry officials. Tattoo prosthetics.' },
];

const sceneExtras = [
  { sceneId: 'sc-7', groups: [{ groupId: 'eg-nobles', headcount: 100, callTime: '5:00 AM', wrapTime: '7:00 PM', wardrobe: 'Full noble attire — gowns, suits, jewelry' }, { groupId: 'eg-guards', headcount: 12, callTime: '5:00 AM', wrapTime: '7:00 PM', wardrobe: 'House Venture guard uniforms' }] },
  { sceneId: 'sc-10', groups: [{ groupId: 'eg-nobles', headcount: 80, callTime: '5:00 AM', wrapTime: '6:00 PM', wardrobe: 'Different noble attire from Sc. 7' }, { groupId: 'eg-guards', headcount: 8, callTime: '5:00 AM', wrapTime: '6:00 PM', wardrobe: 'House Venture guard uniforms' }] },
  { sceneId: 'sc-13', groups: [{ groupId: 'eg-skaa-crowd', headcount: 300, callTime: '4:00 AM', wrapTime: '8:00 PM', wardrobe: 'Skaa rags, ash-covered', mealPenalty: true }, { groupId: 'eg-skaa-rebels', headcount: 50, callTime: '4:00 AM', wrapTime: '8:00 PM', wardrobe: 'Armed skaa, improvised weapons' }, { groupId: 'eg-guards', headcount: 30, callTime: '4:00 AM', wrapTime: '8:00 PM', wardrobe: 'Lord Ruler\'s garrison soldiers' }, { groupId: 'eg-obligators', headcount: 6, callTime: '6:00 AM', wrapTime: '4:00 PM', wardrobe: 'Ministry robes, facial tattoos' }] },
  { sceneId: 'sc-1', groups: [{ groupId: 'eg-skaa-crowd', headcount: 20, callTime: '6:00 PM', wrapTime: '2:00 AM', wardrobe: 'Plantation workers, ash-covered' }] },
];

// ── EXTRAS VOUCHERS ─────────────────────────────────────────────────────────

const extrasVouchers = [
  { id: 'ev-1', date: '2026-06-04', sceneId: 'sc-7', groupId: 'eg-nobles', name: 'Sarah Mitchell', callTime: '5:00 AM', wrapTime: '7:00 PM', hoursWorked: 14, mealPenalty: false, rate: 250, totalPay: 437.50, notes: 'Noble ballroom, Table 3' },
  { id: 'ev-2', date: '2026-06-04', sceneId: 'sc-7', groupId: 'eg-nobles', name: 'James Rodriguez', callTime: '5:00 AM', wrapTime: '7:30 PM', hoursWorked: 14.5, mealPenalty: true, rate: 250, totalPay: 475.00, notes: 'Noble ballroom, Dance floor' },
  { id: 'ev-3', date: '2026-06-04', sceneId: 'sc-7', groupId: 'eg-guards', name: 'Mike Chen', callTime: '5:00 AM', wrapTime: '6:00 PM', hoursWorked: 13, mealPenalty: false, rate: 175, totalPay: 292.50, notes: 'Guard post, main entrance' },
  { id: 'ev-4', date: '2026-06-13', sceneId: 'sc-13', groupId: 'eg-skaa-crowd', name: 'Ana Torres', callTime: '4:00 AM', wrapTime: '8:00 PM', hoursWorked: 16, mealPenalty: true, rate: 150, totalPay: 337.50, notes: 'Front row of crowd, reaction shots' },
  { id: 'ev-5', date: '2026-06-13', sceneId: 'sc-13', groupId: 'eg-skaa-crowd', name: 'David Kim', callTime: '4:00 AM', wrapTime: '7:00 PM', hoursWorked: 15, mealPenalty: true, rate: 150, totalPay: 318.75, notes: 'Crowd surge group' },
  { id: 'ev-6', date: '2026-06-13', sceneId: 'sc-13', groupId: 'eg-skaa-rebels', name: 'Chris Palmer', callTime: '4:00 AM', wrapTime: '8:00 PM', hoursWorked: 16, mealPenalty: true, rate: 175, totalPay: 393.75, notes: 'Rebel leader, featured in wide shot' },
  { id: 'ev-7', date: '2026-06-05', sceneId: 'sc-10', groupId: 'eg-nobles', name: 'Rebecca Stein', callTime: '5:00 AM', wrapTime: '6:00 PM', hoursWorked: 13, mealPenalty: false, rate: 250, totalPay: 406.25, notes: 'Seated at head table with Elend' },
  { id: 'ev-8', date: '2026-06-13', sceneId: 'sc-13', groupId: 'eg-obligators', name: 'Thomas Weir', ssn_last4: '4821', callTime: '6:00 AM', wrapTime: '4:00 PM', hoursWorked: 10, mealPenalty: false, rate: 200, totalPay: 250.00, notes: 'SAG. Obligator with speaking proximity.' },
];

// ── COSTUMES ────────────────────────────────────────────────────────────────

const costumes = [
  { id: 'cos-vin-street', characterId: 'el-vin', name: 'Vin — Street Urchin', description: 'Dirty, oversized clothing. Hair matted. Ash-stained.', pieces: ['Oversized brown tunic', 'Torn trousers', 'Rope belt', 'Worn boots'], condition: 'Distressed', color: '#8B7355', notes: 'Scenes 2-5. Gradually cleaner as she joins the crew.' },
  { id: 'cos-vin-training', characterId: 'el-vin', name: 'Vin — Mistborn Training', description: 'Dark, practical clothing for rooftop scenes.', pieces: ['Black fitted tunic', 'Dark trousers', 'Leather belt with vial pouches', 'Soft boots', 'Mistcloak'], condition: 'New', color: '#2C2C2C', notes: 'Night training scenes. Must work with wire harness.' },
  { id: 'cos-vin-ball1', characterId: 'el-vin', name: 'Vin — First Ball Gown', description: 'Stunning transformation. Deep blue gown with silver embroidery.', pieces: ['Blue silk gown', 'Silver hair pins', 'Pearl necklace', 'Satin slippers'], condition: 'New', color: '#1E3A5F', notes: 'Scene 7. The Cinderella moment.' },
  { id: 'cos-vin-ball2', characterId: 'el-vin', name: 'Vin — Second Ball Gown', description: 'More confident. Burgundy and gold.', pieces: ['Burgundy velvet gown', 'Gold earrings', 'Jeweled bracelet', 'Heeled boots (hidden)'], condition: 'New', color: '#722F37', notes: 'Scene 10. She owns the room now.' },
  { id: 'cos-vin-final', characterId: 'el-vin', name: 'Vin — Final Battle', description: 'Practical Mistborn gear for the climax.', pieces: ['Dark fitted armor', 'Mistcloak (battle-worn)', 'Vial belt', 'Obsidian daggers'], condition: 'Distressed', color: '#1a1a1a', notes: 'Scenes 14-15. Starts clean, gets destroyed during fight.' },
  { id: 'cos-kelsier', characterId: 'el-kelsier', name: 'Kelsier — The Survivor', description: 'Charismatic thief leader. Distinctive scarred arms.', pieces: ['White shirt (sleeves rolled)', 'Dark vest', 'Trousers', 'Mistcloak', 'Arm scar prosthetics'], condition: 'Aged', color: '#F5F5DC', notes: 'Consistent look throughout. Hathsin scars always visible on arms.' },
  { id: 'cos-elend', characterId: 'el-elend', name: 'Elend — Disheveled Noble', description: 'Expensive clothes worn carelessly. Always slightly rumpled.', pieces: ['Wrinkled white shirt', 'Untucked waistcoat', 'Fine but scuffed boots', 'Book (always carrying one)'], condition: 'New', color: '#E8E0D0', notes: 'Contrast with other perfect nobles. He doesn\'t care about appearance.' },
  { id: 'cos-lordruler', characterId: 'el-lordruler', name: 'Lord Ruler — Divine Tyrant', description: 'Godlike presence. White and gold robes.', pieces: ['White silk robes with gold trim', 'Golden breastplate', 'Jeweled crown/circlet', 'Bare feet (deliberate)'], condition: 'New', color: '#FFD700', notes: 'Scenes 13-14. Must convey immortal power. Bare feet = he doesn\'t need armor.' },
];

// ── SCENE COSTUMES (Costume Plot assignments) ───────────────────────────

const sceneCostumes = [
  // Vin - Street Urchin
  { sceneId: 'sc-2', characterId: 'el-vin', costumeId: 'cos-vin-street', changeNumber: 1, notes: 'Dirty, hiding in corner' },
  { sceneId: 'sc-3', characterId: 'el-vin', costumeId: 'cos-vin-street', changeNumber: 1, notes: 'Same outfit from Sc. 2 — continuous' },
  { sceneId: 'sc-5', characterId: 'el-vin', costumeId: 'cos-vin-street', changeNumber: 1, notes: 'Slightly cleaner than Sc. 2-3' },
  // Vin - Training
  { sceneId: 'sc-4', characterId: 'el-vin', costumeId: 'cos-vin-training', changeNumber: 1, notes: 'First time in Mistcloak' },
  { sceneId: 'sc-6', characterId: 'el-vin', costumeId: 'cos-vin-training', changeNumber: 1, notes: 'Continuity: vial belt visible' },
  { sceneId: 'sc-12', characterId: 'el-vin', costumeId: 'cos-vin-training', changeNumber: 1, notes: 'Battle-worn by end of fight' },
  // Vin - Ball Gowns
  { sceneId: 'sc-7', characterId: 'el-vin', costumeId: 'cos-vin-ball1', changeNumber: 1, notes: 'Cinderella moment — first time in finery' },
  { sceneId: 'sc-10', characterId: 'el-vin', costumeId: 'cos-vin-ball2', changeNumber: 1, notes: 'More confident, owns the look' },
  { sceneId: 'sc-11', characterId: 'el-vin', costumeId: 'cos-vin-ball2', changeNumber: 1, notes: 'At Renoux estate, still in noble attire' },
  // Vin - Final Battle
  { sceneId: 'sc-14', characterId: 'el-vin', costumeId: 'cos-vin-final', changeNumber: 1, notes: 'Pristine at start, progressively destroyed' },
  { sceneId: 'sc-15', characterId: 'el-vin', costumeId: 'cos-vin-final', changeNumber: 1, notes: 'Torn Mistcloak, ash-covered. Continuity from Sc. 14.' },
  // Kelsier
  { sceneId: 'sc-3', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Dramatic entrance, sleeves rolled' },
  { sceneId: 'sc-4', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Full Mistcloak for rooftop' },
  { sceneId: 'sc-5', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Relaxed, vest unbuttoned' },
  { sceneId: 'sc-6', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Full Mistcloak, training mode' },
  { sceneId: 'sc-8', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Mistcloak gets torn in Inquisitor fight' },
  { sceneId: 'sc-9', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'No Mistcloak, daytime' },
  { sceneId: 'sc-13', characterId: 'el-kelsier', costumeId: 'cos-kelsier', changeNumber: 1, notes: 'Full Mistcloak. Hero wardrobe for death scene.' },
  // Elend
  { sceneId: 'sc-7', characterId: 'el-elend', costumeId: 'cos-elend', changeNumber: 1, notes: 'Notably rumpled compared to other nobles' },
  { sceneId: 'sc-10', characterId: 'el-elend', costumeId: 'cos-elend', changeNumber: 1, notes: 'Different waistcoat, same energy' },
  { sceneId: 'sc-15', characterId: 'el-elend', costumeId: 'cos-elend', changeNumber: 1, notes: 'Ash-dusted, post-revolution' },
  // Lord Ruler
  { sceneId: 'sc-13', characterId: 'el-lordruler', costumeId: 'cos-lordruler', changeNumber: 1, notes: 'Full divine regalia. Immaculate.' },
  { sceneId: 'sc-14', characterId: 'el-lordruler', costumeId: 'cos-lordruler', changeNumber: 1, notes: 'Robes become ragged as he ages and dies' },
];

// ── LOCKED PAGES ────────────────────────────────────────────────────────

const lockedPages = [
  { pageNumber: '1', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '2', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '3', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '4', lockedAtRevision: 1, cannotChange: false },
  { pageNumber: '5', lockedAtRevision: 1, cannotChange: false },
  { pageNumber: '6', lockedAtRevision: 1, cannotChange: false },
  { pageNumber: '9', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '10', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '11', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '12', lockedAtRevision: 2, cannotChange: false },
  { pageNumber: '19', lockedAtRevision: 2, cannotChange: true },
  { pageNumber: '20', lockedAtRevision: 2, cannotChange: true },
  { pageNumber: '21', lockedAtRevision: 2, cannotChange: true },
  { pageNumber: '22', lockedAtRevision: 1, cannotChange: true },
];

// ── SCRIPT REVISIONS ────────────────────────────────────────────────────────

const revisions = [
  { id: 'rev-1', revisionNumber: 1, color: 'White', date: '2026-01-15', author: 'Screenplay Team', description: 'First draft. Adapted from Brandon Sanderson\'s novel.', pagesChanged: ['1-42'], scenesAffected: ['1-15'], isLocked: true },
  { id: 'rev-2', revisionNumber: 2, color: 'Blue', date: '2026-02-28', author: 'Screenplay Team', description: 'Studio notes. Streamlined Act 2, added Elend subplot beats, clarified Allomancy mechanics for audience.', pagesChanged: ['7', '15-16', '23-24', '26-27'], scenesAffected: ['4', '7', '10', '11'], isLocked: true },
  { id: 'rev-3', revisionNumber: 3, color: 'Pink', date: '2026-03-20', author: 'Director', description: 'Director\'s pass. Enhanced Kelsier death scene, added Vin/Elend balcony moment, restructured final battle.', pagesChanged: ['32-35', '36-40', '40-42'], scenesAffected: ['13', '14', '15'], isLocked: false },
];

const scriptChanges = [
  { id: 'chg-1', revisionId: 'rev-2', sceneNumber: '7', changeType: 'Modified', description: 'Extended Vin/Elend first meeting. Added book discussion dialogue.', oldContent: 'Vin notices a young nobleman reading alone. Brief exchange of names before she moves on.', newContent: 'ELEND sits reading "Erta\'s Treatise on Social Collapse" at a ball. Extended dialogue where Vin is drawn to his irreverence. He asks what she thinks of the political situation — she answers honestly, surprising them both.', impactedElements: ['el-elend', 'el-vin'], impactedDepartments: ['Wardrobe', 'Props'] },
  { id: 'chg-2', revisionId: 'rev-2', sceneNumber: '11', changeType: 'Added', description: 'New scene: Sazed teaches Vin about the Keepers. Previously this was exposition in scene 5.', oldContent: 'Keeper history delivered as Kelsier dialogue during crew meeting (Sc. 5).', newContent: 'Standalone scene: Sazed opens his metalminds, shows Vin the stored religions. She reads the Lord Ruler\'s logbook — discovers he may not be the Hero of Ages. Emotional bonding as Sazed admits the Keepers preserve what the Lord Ruler tried to destroy.', impactedElements: ['el-sazed', 'el-vin', 'el-logbook'], impactedDepartments: ['Art', 'Props', 'Set Dressing'] },
  { id: 'chg-3', revisionId: 'rev-3', sceneNumber: '13', changeType: 'Modified', description: 'Kelsier death scene extended. Added his final words to the crowd. Slow-motion ash fall as he dies.', oldContent: 'Kelsier fights the Lord Ruler. Dies quickly. Crowd disperses.', newContent: 'Extended: Kelsier walks into the square alone, addresses the skaa directly ("I am the thing the Lord Ruler cannot kill"). After the Lord Ruler strikes him down, Kelsier SMILES. Ash falls in slow motion. The crowd doesn\'t run — they stand. VIN watches from a rooftop, tears cutting through ash on her face. The revolution ignites.', impactedElements: ['el-kelsier', 'el-lordruler', 'el-ash-fall'], impactedDepartments: ['VFX', 'Stunts', 'SFX', 'Camera'] },
  { id: 'chg-4', revisionId: 'rev-3', sceneNumber: '14', changeType: 'Modified', description: 'Restructured throne room fight. Vin now draws on the mists before removing spikes (was simultaneous).', oldContent: 'Vin pulls the Lord Ruler\'s bracelets off while simultaneously drawing on the mists. Single action.', newContent: 'Two-beat climax: First, Vin reaches for the mist itself — it responds, flooding into her. THEN she tears the bracers free. The Lord Ruler ages: young face cracks, hair whitens, body collapses through centuries in seconds. Separated beats give the audience time to understand what she discovered.', impactedElements: ['el-vin', 'el-lordruler', 'el-mist'], impactedDepartments: ['VFX', 'Stunts', 'SFX'] },
];

// ── PRODUCTION SETS ─────────────────────────────────────────────────────────

const sets = [
  { id: 'set-crew-hq', name: 'Crew Headquarters (Clubs\' Shop)', type: 'Studio Build', location: 'Stage 1', status: 'Ready', buildDate: '2026-04-01', readyDate: '2026-04-20', estimatedCost: 180000, actualCost: 195000, sqFootage: 3200, linkedScenes: ['5', '9'], linkedLocationName: 'Crew Headquarters', departments: { art: 'Cluttered carpenter workshop. Hidden basement meeting room.', construction: 'Two-level set: shop above, meeting room below.', props: 'Woodworking tools, allomantic metal samples on shelves.', setDressing: 'Maps of Luthadel on walls. Stolen noble items.' }, photos: [], notes: 'Primary recurring set. Needs to feel lived-in.' },
  { id: 'set-ballroom', name: 'Keep Venture Ballroom', type: 'Studio Build', location: 'Stage 3', status: 'In Construction', buildDate: '2026-04-10', readyDate: '2026-05-01', estimatedCost: 450000, actualCost: null, sqFootage: 8000, linkedScenes: ['7', '10'], linkedLocationName: 'Noble Ballroom', departments: { art: 'Grand Scadrian architecture. Stained glass depicting the Lord Ruler. Massive chandeliers.', construction: 'Pillared hall. Marble flooring. Balcony level.', electric: '200+ practical chandeliers. Programmable LED for mood shifts.', setDressing: 'Noble house banners. Flower arrangements (all in muted ash-world colors).' }, photos: [], notes: 'Biggest interior set. Two full ball sequences. Must support 120+ extras.' },
  { id: 'set-throne', name: 'Kredik Shaw Throne Room', type: 'Studio Build', location: 'Stage 4', status: 'Planned', buildDate: '2026-05-01', readyDate: '2026-05-20', strikeDate: '2026-06-15', estimatedCost: 600000, linkedScenes: ['14'], linkedLocationName: 'Lord Ruler\'s Throne Room', departments: { art: 'Towering spired interior. Obsidian and steel. Throne on raised platform.', construction: 'Multi-level. Flying rig anchor points in ceiling grid.', electric: 'Dramatic uplighting. Practical fire elements.', grip: 'Wire rig mounting points rated for high-speed pulls. Safety netting.', setDressing: 'Atium displays. Ministry tapestries. Intimidation architecture.' }, photos: [], notes: 'Climax set. 3 shoot days. Heavy VFX integration. Must support full wire rig system.' },
  { id: 'set-rooftops', name: 'Luthadel Rooftops', type: 'Studio Build', location: 'Stage 2', status: 'Ready', buildDate: '2026-03-20', readyDate: '2026-04-10', estimatedCost: 280000, actualCost: 265000, sqFootage: 4500, linkedScenes: ['4', '6', '12'], linkedLocationName: 'Rooftop Set (Stage 2)', departments: { art: 'Ash-covered rooftops at various heights. Metal anchor points for Steelpushing.', construction: 'Modular rooftop sections. Reconfigurable for different scenes.', grip: 'Overhead wire grid. 8-point flying rig.', setDressing: 'Chimney pots. Metal fixtures (Pushing targets). Ash layer on everything.' }, photos: [], notes: 'Used for all rooftop Allomancy sequences. Reconfigured between scenes.' },
  { id: 'set-slums', name: 'Skaa Quarter Street', type: 'Practical Location', location: 'Backlot / Location TBD', status: 'Planned', buildDate: '2026-04-15', readyDate: '2026-04-25', estimatedCost: 150000, linkedScenes: ['1', '6', '12'], linkedLocationName: 'City Street / Alley', departments: { art: 'Impoverished neighborhood. Ash-covered everything. Low buildings.', construction: 'Dress existing backlot street with ash world overlay.', greens: 'Dead/brown vegetation. No green — the world has no green plants.' }, photos: [], notes: 'Multiple night shoots. Heavy atmospheric effects (mist + ash).' },
  { id: 'set-square', name: 'Luthadel Central Square', type: 'Hybrid', location: 'Backlot + CG Extension', status: 'Planned', estimatedCost: 350000, linkedScenes: ['13'], linkedLocationName: 'Central Square', departments: { art: 'Large public square with execution platform. Lord Ruler\'s banners.', construction: 'Raised platform/stage. Crowd barriers. 270-degree build, CG completes.', electric: 'Daylight scene but atmospheric haze requires fill lighting.' }, photos: [], notes: 'Kelsier\'s death scene. 500+ extras. Massive logistics day.' },
];

// ── BUDGETING ───────────────────────────────────────────────────────────────

const budgetProject = {
  id: 'budget-mistborn',
  name: 'Mistborn: The Final Empire',
  globals: {
    currency: 'USD', currencySymbol: '$',
    prepWeeks: 12, shootWeeks: 10, wrapWeeks: 6,
    payDaysPerWeek: 5, overtimeRate: 1.5, taxRate: 0.23, contingencyPercent: 10,
  },
  fringes: [
    { id: 'fr-1', name: 'Payroll Tax', type: 'percentage', value: 22, appliesTo: ['a-1100', 'a-1200', 'a-1300', 'a-1400', 'a-2100', 'a-2200', 'a-2300'], enabled: true },
    { id: 'fr-2', name: 'SAG Pension & Health', type: 'percentage', value: 19.1, appliesTo: ['a-1100', 'a-1200'], enabled: true },
    { id: 'fr-3', name: 'DGA Pension & Health', type: 'percentage', value: 17.5, appliesTo: ['a-1300'], enabled: true },
    { id: 'fr-4', name: 'IATSE Benefits', type: 'percentage', value: 14, appliesTo: ['a-2100', 'a-2200', 'a-2300', 'a-2400', 'a-2500'], enabled: true },
    { id: 'fr-5', name: 'Workers Comp', type: 'percentage', value: 5.2, appliesTo: ['a-1100', 'a-1200', 'a-1300', 'a-1400', 'a-2100', 'a-2200', 'a-2300', 'a-2400', 'a-2500', 'a-2600'], enabled: true },
    { id: 'fr-6', name: 'Vacation/Holiday', type: 'percentage', value: 8.33, cap: 2000, appliesTo: ['a-2100', 'a-2200', 'a-2300', 'a-2400', 'a-2500'], enabled: true },
  ],
  accountGroups: [
    {
      id: 'ag-above', code: '1000', name: 'Above The Line', subtotal: 14700000,
      accounts: [
        { id: 'a-1100', code: '1100', name: 'Story & Rights', subtotal: 2500000, lineItems: [
          { id: 'li-1', description: 'Novel Rights (Brandon Sanderson)', units: 1, unitType: 'Allow', rate: 2000000, quantity: 1, subtotal: 2000000, fringeTotal: 0, total: 2000000 },
          { id: 'li-2', description: 'Screenplay', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-3', description: 'Script Polish', units: 1, unitType: 'Allow', rate: 100000, quantity: 1, subtotal: 100000, fringeTotal: 0, total: 100000 },
        ]},
        { id: 'a-1200', code: '1200', name: 'Producers', subtotal: 2200000, lineItems: [
          { id: 'li-4', description: 'Executive Producer', units: 1, unitType: 'Allow', rate: 800000, quantity: 1, subtotal: 800000, fringeTotal: 0, total: 800000 },
          { id: 'li-5', description: 'Producer', units: 2, unitType: 'Allow', rate: 500000, quantity: 1, subtotal: 1000000, fringeTotal: 0, total: 1000000 },
          { id: 'li-6', description: 'Co-Producer', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
        ]},
        { id: 'a-1300', code: '1300', name: 'Director', subtotal: 3500000, lineItems: [
          { id: 'li-7', description: 'Director Fee', units: 1, unitType: 'Allow', rate: 3500000, quantity: 1, subtotal: 3500000, fringeTotal: 0, total: 3500000 },
        ]},
        { id: 'a-1400', code: '1400', name: 'Cast', subtotal: 6500000, lineItems: [
          { id: 'li-8', description: 'Vin (Lead)', units: 1, unitType: 'Allow', rate: 2000000, quantity: 1, subtotal: 2000000, fringeTotal: 0, total: 2000000 },
          { id: 'li-9', description: 'Kelsier (Lead)', units: 1, unitType: 'Allow', rate: 3000000, quantity: 1, subtotal: 3000000, fringeTotal: 0, total: 3000000 },
          { id: 'li-10', description: 'Elend Venture', units: 1, unitType: 'Allow', rate: 500000, quantity: 1, subtotal: 500000, fringeTotal: 0, total: 500000 },
          { id: 'li-11', description: 'Lord Ruler', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-12', description: 'Sazed', units: 1, unitType: 'Allow', rate: 300000, quantity: 1, subtotal: 300000, fringeTotal: 0, total: 300000 },
          { id: 'li-13', description: 'Supporting Cast (Breeze, Ham, Clubs, Dockson, Marsh)', units: 5, unitType: 'Allow', rate: 60000, quantity: 1, subtotal: 300000, fringeTotal: 0, total: 300000 },
        ]},
      ],
    },
    {
      id: 'ag-below', code: '2000', name: 'Below The Line — Production', subtotal: 18900000,
      accounts: [
        { id: 'a-2100', code: '2100', name: 'Production Staff', subtotal: 1800000, lineItems: [
          { id: 'li-14', description: 'Unit Production Manager', units: 28, unitType: 'Weeks', rate: 6500, quantity: 1, subtotal: 182000, fringeTotal: 0, total: 182000 },
          { id: 'li-15', description: '1st Assistant Director', units: 24, unitType: 'Weeks', rate: 5500, quantity: 1, subtotal: 132000, fringeTotal: 0, total: 132000 },
          { id: 'li-16', description: '2nd AD', units: 22, unitType: 'Weeks', rate: 3800, quantity: 1, subtotal: 83600, fringeTotal: 0, total: 83600 },
          { id: 'li-17', description: 'Production Office Staff', units: 28, unitType: 'Weeks', rate: 35000, quantity: 1, subtotal: 980000, fringeTotal: 0, total: 980000 },
          { id: 'li-18', description: 'Script Supervisor', units: 14, unitType: 'Weeks', rate: 3500, quantity: 1, subtotal: 49000, fringeTotal: 0, total: 49000 },
        ]},
        { id: 'a-2200', code: '2200', name: 'Camera', subtotal: 2200000, lineItems: [
          { id: 'li-19', description: 'Director of Photography', units: 16, unitType: 'Weeks', rate: 25000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-20', description: 'Camera Operators (2)', units: 14, unitType: 'Weeks', rate: 8000, quantity: 2, subtotal: 224000, fringeTotal: 0, total: 224000 },
          { id: 'li-21', description: 'Camera Package (ARRI Alexa 65 + Anamorphic)', units: 14, unitType: 'Weeks', rate: 45000, quantity: 1, subtotal: 630000, fringeTotal: 0, total: 630000 },
          { id: 'li-22', description: 'Steadicam Operator + Rig', units: 10, unitType: 'Weeks', rate: 12000, quantity: 1, subtotal: 120000, fringeTotal: 0, total: 120000 },
        ]},
        { id: 'a-2300', code: '2300', name: 'Art Department', subtotal: 3500000, lineItems: [
          { id: 'li-23', description: 'Production Designer', units: 28, unitType: 'Weeks', rate: 12000, quantity: 1, subtotal: 336000, fringeTotal: 0, total: 336000 },
          { id: 'li-24', description: 'Art Director', units: 26, unitType: 'Weeks', rate: 7000, quantity: 1, subtotal: 182000, fringeTotal: 0, total: 182000 },
          { id: 'li-25', description: 'Set Construction', units: 1, unitType: 'Allow', rate: 2200000, quantity: 1, subtotal: 2200000, fringeTotal: 0, total: 2200000 },
          { id: 'li-26', description: 'Set Dressing & Props', units: 1, unitType: 'Allow', rate: 500000, quantity: 1, subtotal: 500000, fringeTotal: 0, total: 500000 },
        ]},
        { id: 'a-2400', code: '2400', name: 'Wardrobe & Makeup', subtotal: 2400000, lineItems: [
          { id: 'li-27', description: 'Costume Designer', units: 24, unitType: 'Weeks', rate: 8000, quantity: 1, subtotal: 192000, fringeTotal: 0, total: 192000 },
          { id: 'li-28', description: 'Costume Manufacturing', units: 1, unitType: 'Allow', rate: 800000, quantity: 1, subtotal: 800000, fringeTotal: 0, total: 800000, notes: 'Mistcloaks, noble gowns, 500+ skaa costumes' },
          { id: 'li-29', description: 'Makeup/Hair Department', units: 16, unitType: 'Weeks', rate: 35000, quantity: 1, subtotal: 560000, fringeTotal: 0, total: 560000 },
          { id: 'li-30', description: 'Prosthetics (Inquisitor, Lord Ruler aging)', units: 1, unitType: 'Allow', rate: 600000, quantity: 1, subtotal: 600000, fringeTotal: 0, total: 600000 },
        ]},
        { id: 'a-2500', code: '2500', name: 'Special Effects & Stunts', subtotal: 4500000, lineItems: [
          { id: 'li-31', description: 'Stunt Coordinator', units: 16, unitType: 'Weeks', rate: 12000, quantity: 1, subtotal: 192000, fringeTotal: 0, total: 192000 },
          { id: 'li-32', description: 'Wire Rig Systems (Allomancy)', units: 1, unitType: 'Allow', rate: 1500000, quantity: 1, subtotal: 1500000, fringeTotal: 0, total: 1500000 },
          { id: 'li-33', description: 'Stunt Performers', units: 10, unitType: 'Weeks', rate: 80000, quantity: 1, subtotal: 800000, fringeTotal: 0, total: 800000 },
          { id: 'li-34', description: 'SFX — Atmospheric (Mist/Ash Machines)', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-35', description: 'SFX — Pyrotechnics', units: 1, unitType: 'Allow', rate: 300000, quantity: 1, subtotal: 300000, fringeTotal: 0, total: 300000 },
        ]},
        { id: 'a-2600', code: '2600', name: 'Locations & Transport', subtotal: 1800000, lineItems: [
          { id: 'li-36', description: 'Stage Rental (4 stages x 16 weeks)', units: 4, unitType: 'Stages', rate: 15000, quantity: 16, subtotal: 960000, fringeTotal: 0, total: 960000 },
          { id: 'li-37', description: 'Location Fees', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-38', description: 'Transportation', units: 1, unitType: 'Allow', rate: 440000, quantity: 1, subtotal: 440000, fringeTotal: 0, total: 440000 },
        ]},
        { id: 'a-2700', code: '2700', name: 'Extras', subtotal: 1200000, lineItems: [
          { id: 'li-39', description: 'Noble Ball Extras (180 x 2 days)', units: 180, unitType: 'Man-days', rate: 250, quantity: 2, subtotal: 90000, fringeTotal: 0, total: 90000 },
          { id: 'li-40', description: 'Skaa Crowd (300 x 3 days)', units: 300, unitType: 'Man-days', rate: 150, quantity: 3, subtotal: 135000, fringeTotal: 0, total: 135000 },
          { id: 'li-41', description: 'Extras Casting & Management', units: 1, unitType: 'Allow', rate: 120000, quantity: 1, subtotal: 120000, fringeTotal: 0, total: 120000 },
          { id: 'li-42', description: 'Extras Wardrobe', units: 1, unitType: 'Allow', rate: 350000, quantity: 1, subtotal: 350000, fringeTotal: 0, total: 350000 },
        ]},
        { id: 'a-2800', code: '2800', name: 'Production Misc', subtotal: 1500000, lineItems: [
          { id: 'li-43', description: 'Catering & Craft Services', units: 60, unitType: 'Days', rate: 8000, quantity: 1, subtotal: 480000, fringeTotal: 0, total: 480000 },
          { id: 'li-44', description: 'Production Insurance', units: 1, unitType: 'Allow', rate: 600000, quantity: 1, subtotal: 600000, fringeTotal: 0, total: 600000 },
          { id: 'li-45', description: 'Legal & Accounting', units: 1, unitType: 'Allow', rate: 250000, quantity: 1, subtotal: 250000, fringeTotal: 0, total: 250000 },
        ]},
      ],
    },
    {
      id: 'ag-post', code: '3000', name: 'Post Production', subtotal: 22000000,
      accounts: [
        { id: 'a-3100', code: '3100', name: 'Editing', subtotal: 1200000, lineItems: [
          { id: 'li-46', description: 'Editor', units: 30, unitType: 'Weeks', rate: 8000, quantity: 1, subtotal: 240000, fringeTotal: 0, total: 240000 },
          { id: 'li-47', description: 'Assistant Editors (2)', units: 30, unitType: 'Weeks', rate: 3500, quantity: 2, subtotal: 210000, fringeTotal: 0, total: 210000 },
          { id: 'li-48', description: 'Editing Systems & Facility', units: 30, unitType: 'Weeks', rate: 5000, quantity: 1, subtotal: 150000, fringeTotal: 0, total: 150000 },
        ]},
        { id: 'a-3200', code: '3200', name: 'Visual Effects', subtotal: 18000000, lineItems: [
          { id: 'li-49', description: 'VFX Supervisor (On Set + Post)', units: 40, unitType: 'Weeks', rate: 15000, quantity: 1, subtotal: 600000, fringeTotal: 0, total: 600000 },
          { id: 'li-50', description: 'Allomancy VFX (Steel Lines, Metal Burns)', units: 800, unitType: 'Shots', rate: 8000, quantity: 1, subtotal: 6400000, fringeTotal: 0, total: 6400000 },
          { id: 'li-51', description: 'Atium Shadow VFX', units: 50, unitType: 'Shots', rate: 25000, quantity: 1, subtotal: 1250000, fringeTotal: 0, total: 1250000 },
          { id: 'li-52', description: 'City Extensions / Environment', units: 120, unitType: 'Shots', rate: 30000, quantity: 1, subtotal: 3600000, fringeTotal: 0, total: 3600000 },
          { id: 'li-53', description: 'Wire Removal & Enhancement', units: 400, unitType: 'Shots', rate: 3000, quantity: 1, subtotal: 1200000, fringeTotal: 0, total: 1200000 },
          { id: 'li-54', description: 'Atmospheric Enhancement (Ash/Mist CG)', units: 600, unitType: 'Shots', rate: 2500, quantity: 1, subtotal: 1500000, fringeTotal: 0, total: 1500000 },
          { id: 'li-55', description: 'Lord Ruler Aging Sequence', units: 30, unitType: 'Shots', rate: 50000, quantity: 1, subtotal: 1500000, fringeTotal: 0, total: 1500000 },
        ]},
        { id: 'a-3300', code: '3300', name: 'Sound & Music', subtotal: 2800000, lineItems: [
          { id: 'li-56', description: 'Composer', units: 1, unitType: 'Allow', rate: 1200000, quantity: 1, subtotal: 1200000, fringeTotal: 0, total: 1200000 },
          { id: 'li-57', description: 'Orchestra Recording (80-piece)', units: 6, unitType: 'Sessions', rate: 120000, quantity: 1, subtotal: 720000, fringeTotal: 0, total: 720000 },
          { id: 'li-58', description: 'Sound Design (Allomancy)', units: 1, unitType: 'Allow', rate: 400000, quantity: 1, subtotal: 400000, fringeTotal: 0, total: 400000 },
          { id: 'li-59', description: 'Re-recording Mix', units: 1, unitType: 'Allow', rate: 300000, quantity: 1, subtotal: 300000, fringeTotal: 0, total: 300000 },
        ]},
      ],
    },
  ],
  grandTotal: 55600000,
  contingency: 5560000,
  totalWithContingency: 61160000,
  createdAt: now,
  updatedAt: now,
};

// ── CAST MEMBERS ─────────────────────────────────────────────────────────────

const castMembers = [
  { id: 'cast-vin', elementId: 'el-vin', role: 'Vin', actor: '', status: 'Uncast', category: 'Lead', union: 'SAG-AFTRA', weeklyRate: 125000, guaranteedDays: 45, notes: 'Requires 6 weeks wirework training pre-production. Age range 17-22. Must do own stunts where possible.', fittingDates: ['2026-05-15', '2026-05-20', '2026-05-25'], rehearsalDates: ['2026-05-18', '2026-05-22', '2026-05-26', '2026-05-28'] },
  { id: 'cast-kelsier', elementId: 'el-kelsier', role: 'Kelsier', actor: '', status: 'Uncast', category: 'Lead', union: 'SAG-AFTRA', weeklyRate: 187500, guaranteedDays: 35, notes: 'Charismatic, athletic. Heavy wirework. Hathsin arm scars every day.', fittingDates: ['2026-05-15', '2026-05-22'], rehearsalDates: ['2026-05-18', '2026-05-26'] },
  { id: 'cast-elend', elementId: 'el-elend', role: 'Elend Venture', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 35000, guaranteedDays: 15, notes: 'Bookish, aristocratic. Scenes 7, 10, 11, 15.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-22'] },
  { id: 'cast-sazed', elementId: 'el-sazed', role: 'Sazed', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 25000, guaranteedDays: 10, notes: 'Tall, bald. Prosthetic ears. Terrisman accent work needed.', fittingDates: ['2026-05-18'], rehearsalDates: ['2026-05-22'] },
  { id: 'cast-breeze', elementId: 'el-breeze', role: 'Breeze', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 8, notes: 'Distinguished, well-dressed. Soother — subtle performance.' },
  { id: 'cast-ham', elementId: 'el-ham', role: 'Ham', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 6, notes: 'Muscular build required. Philosophical delivery.' },
  { id: 'cast-clubs', elementId: 'el-clubs', role: 'Clubs', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 5, notes: 'Older, grumpy. Carpenter hands.' },
  { id: 'cast-dockson', elementId: 'el-dockson', role: 'Dockson', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 6, notes: 'Kelsier right hand. Organized, practical.' },
  { id: 'cast-marsh', elementId: 'el-marsh', role: 'Marsh', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 4, notes: 'Stern. Becomes Steel Inquisitor — needs to work with prosthetics team.' },
  { id: 'cast-lordruler', elementId: 'el-lordruler', role: 'Lord Ruler', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 50000, guaranteedDays: 8, notes: 'Commanding presence. Ages rapidly in climax — prosthetic/CG work. Bare feet deliberate.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-28'] },
  { id: 'cast-inquisitor', elementId: 'el-inquisitor1', role: 'Steel Inquisitor', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 3500, guaranteedDays: 8, notes: '2hr prosthetic application per day. Spike eyes. Heavy stunt work.' },
  { id: 'cast-straff', elementId: 'el-straff', role: 'Straff Venture', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 3000, guaranteedDays: 2, notes: 'Elend father. Cruel nobleman. Ball scene only.' },
  { id: 'cast-shan', elementId: 'el-shan', role: 'Shan Elariel', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 6, notes: 'Mistborn antagonist. Major fight scene (Sc. 12). Wirework required.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-26'] },
];

// ── SCHEDULING PROJECT ──────────────────────────────────────────────────────

const schedulingProject = {
  id: 'sched-mistborn',
  name: 'Mistborn: The Final Empire',
  elements,
  breakdowns,
  stripBoard,
  shootStartDate: '2026-06-01',
  extraGroups,
  sceneExtras,
  extrasVouchers,
  costumes,
  sceneCostumes,
  revisions,
  scriptChanges,
  lockedPages,
  sets,
  castMembers,
  createdAt: now,
  updatedAt: now,
};

// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Create the project
    const result = await sql`
      INSERT INTO projects (name, scheduling_data, budgeting_data)
      VALUES (
        'Mistborn: The Final Empire',
        ${JSON.stringify(schedulingProject)}::jsonb,
        ${JSON.stringify(budgetProject)}::jsonb
      )
      RETURNING id, name, created_at
    `;

    return res.status(200).json({ ok: true, project: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
