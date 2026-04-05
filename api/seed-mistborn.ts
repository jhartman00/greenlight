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
    notes: 'Establish the world. Mist is a character. Ash falls everywhere. Skaa carts in background. Rain/ash towers for atmosphere.'
  },
  {
    id: 'sc-2', sceneNumber: '2', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Camon\'s Lair', setName: 'Underground Hideout',
    description: 'VIN hides in the corner of a thieving crew meeting. CAMON plans a scam against an obligator. Vin subtly Soothes the room without knowing what she\'s doing.',
    scriptPage: 2, pageCount: '3/8',
    elements: ['el-vin', 'el-vfx-metalburn', 'el-skaa-rags', 'el-ash-makeup'],
    notes: 'First introduction to Vin. She\'s small, scared, powerful without knowing it.'
  },
  {
    id: 'sc-3', sceneNumber: '3', intExt: 'INT', dayNight: 'DAY',
    location: 'Canton of Finance', setName: 'Obligator Office',
    description: 'Camon\'s crew runs their scam. Vin sits quietly in the back. A STEEL INQUISITOR enters. Vin feels something terrifying. Kelsier intervenes, killing Camon\'s crew handler.',
    scriptPage: 4, pageCount: '4/8',
    elements: ['el-vin', 'el-kelsier', 'el-inquisitor1', 'el-inquisitor-prosthetics', 'el-vfx-steelpush', 'el-skaa-rags', 'el-coins'],
    notes: 'First Inquisitor appearance. Audience should feel Vin\'s terror. Kelsier entrance is the turn.'
  },
  {
    id: 'sc-4', sceneNumber: '4', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Rooftops', setName: 'Rooftop Set (Stage 2)',
    description: 'KELSIER takes Vin above the city. Teaches her to burn tin. The mists clear and she sees the city in vivid detail for the first time. He tells her she\'s Mistborn.',
    scriptPage: 7, pageCount: '3/8',
    elements: ['el-vin', 'el-kelsier', 'el-mistcloak', 'el-mist', 'el-vials', 'el-vfx-metalburn', 'el-vfx-city', 'el-wire-rigs', 'el-allomancy-sounds'],
    notes: 'Key scene. Vin\'s world opens up. Tin-burning = sensory overload VFX. Kelsier is magnetic.'
  },
  {
    id: 'sc-5', sceneNumber: '5', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Clubs\' Shop', setName: 'Crew Headquarters',
    description: 'Kelsier introduces Vin to the crew: BREEZE, HAM, CLUBS, DOCKSON, SAZED. He reveals the plan: overthrow the Lord Ruler. Everyone thinks he\'s insane. Vin watches, fascinated.',
    scriptPage: 9, pageCount: '5/8',
    elements: ['el-vin', 'el-kelsier', 'el-breeze', 'el-ham', 'el-clubs', 'el-dockson', 'el-sazed', 'el-skaa-rags', 'el-vials', 'el-ash-makeup'],
    notes: 'Crew assembly scene. Each character needs a distinct introduction moment. Heist movie energy.'
  },
  {
    id: 'sc-6', sceneNumber: '6', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Streets', setName: 'City Street / Alley',
    description: 'Kelsier teaches Vin Steelpushing. She launches coins at targets, then pushes off metal to fly through the mists. First flight sequence.',
    scriptPage: 12, pageCount: '4/8',
    elements: ['el-vin', 'el-kelsier', 'el-mistcloak', 'el-coins', 'el-vfx-steelpush', 'el-wire-rigs', 'el-stunt-allomancy', 'el-mist', 'el-allomancy-sounds'],
    notes: 'MAJOR VFX SEQUENCE. Training montage energy but grounded. Wire rigs + CG steel lines. 2 days minimum.'
  },
  {
    id: 'sc-7', sceneNumber: '7', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Keep Venture', setName: 'Noble Ballroom',
    description: 'Vin\'s first noble ball, disguised as Lady Valette Renoux. She\'s overwhelmed by the opulence. Meets ELEND VENTURE reading in a corner. Instant chemistry. She Soothes guards to move through the crowd.',
    scriptPage: 15, pageCount: '6/8',
    elements: ['el-vin', 'el-elend', 'el-straff', 'el-vin-transformation', 'el-noble-gowns', 'el-noble-suits', 'el-noble-jewelry', 'el-vfx-metalburn', 'el-allomancy-sounds', 'el-carriages'],
    notes: 'Cinderella moment. Contrast street Vin with noble Vin. Elend is reading at a ball. Straff Venture present. 100+ extras in noble attire. Carriages arriving.'
  },
  {
    id: 'sc-8', sceneNumber: '8', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Kredik Shaw Exterior', setName: 'Lord Ruler\'s Palace (Ext)',
    description: 'Kelsier infiltrates Kredik Shaw. Confronted by a STEEL INQUISITOR. Brutal fight — Kelsier uses Allomancy creatively but is outmatched. Barely escapes.',
    scriptPage: 19, pageCount: '5/8',
    elements: ['el-kelsier', 'el-inquisitor1', 'el-mistcloak', 'el-coins', 'el-glass-daggers', 'el-vfx-steelpush', 'el-stunt-fights', 'el-stunt-allomancy', 'el-wire-rigs', 'el-mist', 'el-vfx-city', 'el-fire'],
    notes: 'Massive action set piece. Kelsier vs Inquisitor. Shows Inquisitors are nearly unbeatable. Heavy VFX + wirework.'
  },
  {
    id: 'sc-9', sceneNumber: '9', intExt: 'INT', dayNight: 'DAY',
    location: 'Clubs\' Shop', setName: 'Crew Headquarters',
    description: 'MARSH leaves to infiltrate the Steel Ministry as a spy. Tense goodbye between the brothers. Kelsier can\'t talk him out of it.',
    scriptPage: 22, pageCount: '2/8',
    elements: ['el-kelsier', 'el-marsh', 'el-dockson', 'el-ash-makeup'],
    notes: 'Emotional beat. Brothers may never see each other again.'
  },
  {
    id: 'sc-10', sceneNumber: '10', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Keep Venture', setName: 'Noble Ballroom',
    description: 'Second ball. Vin dances with Elend. Breeze works the crowd, Sooting nobles. Vin discovers Shan Elariel is also Mistborn when she senses her burning metals.',
    scriptPage: 23, pageCount: '4/8',
    elements: ['el-vin', 'el-elend', 'el-breeze', 'el-shan', 'el-noble-gowns', 'el-noble-suits', 'el-noble-jewelry', 'el-vfx-metalburn', 'el-allomancy-sounds', 'el-carriages'],
    notes: 'Political intrigue ramps up. Vin is getting better at the game. Shan is dangerous. Carriages in establishing shot.'
  },
  {
    id: 'sc-11', sceneNumber: '11', intExt: 'INT', dayNight: 'DAY',
    location: 'Renoux Estate', setName: 'Renoux Study',
    description: 'Sazed teaches Vin about the Keepers and the old religions. She reads the Lord Ruler\'s logbook. Discovers the Lord Ruler may not be who everyone thinks.',
    scriptPage: 26, pageCount: '3/8',
    elements: ['el-vin', 'el-sazed', 'el-logbook', 'el-noble-gowns'],
    notes: 'Lore dump done as character bonding. Sazed is warm, wise. Vin begins trusting people.'
  },
  {
    id: 'sc-12', sceneNumber: '12', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Luthadel Streets', setName: 'City Street / Alley',
    description: 'Vin vs SHAN ELARIEL. Rooftop Mistborn duel. Vin wins by improvising, using her street instincts. Kills Shan with an obsidian dagger.',
    scriptPage: 28, pageCount: '5/8',
    elements: ['el-vin', 'el-shan', 'el-mistcloak', 'el-glass-daggers', 'el-coins', 'el-vfx-steelpush', 'el-stunt-fights', 'el-stunt-allomancy', 'el-stunt-fall', 'el-wire-rigs', 'el-mist', 'el-allomancy-sounds'],
    notes: 'Vin proves herself. Fast, brutal, creative combat. Major wirework sequence.'
  },
  {
    id: 'sc-13', sceneNumber: '13', intExt: 'EXT', dayNight: 'DAY',
    location: 'Luthadel City Square', setName: 'Central Square',
    description: 'Kelsier faces the LORD RULER publicly before the skaa masses. The Lord Ruler kills Kelsier. Kelsier dies smiling, having planned this all along. The skaa begin to revolt.',
    scriptPage: 32, pageCount: '6/8',
    elements: ['el-kelsier', 'el-lordruler', 'el-inquisitor1', 'el-inquisitor-prosthetics', 'el-ash-fall', 'el-vfx-steelpush', 'el-stunt-fights', 'el-wire-rigs', 'el-fire', 'el-coins', 'el-mistcloak', 'el-allomancy-sounds', 'el-ash-makeup', 'el-skaa-rags'],
    notes: 'THE pivotal scene. Kelsier\'s death is a sacrifice, not a defeat. 500+ extras. Massive staging. The Survivor becomes a martyr.'
  },
  {
    id: 'sc-14', sceneNumber: '14', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Kredik Shaw Interior', setName: 'Lord Ruler\'s Throne Room',
    description: 'VIN confronts the LORD RULER in his throne room. Uses the Eleventh Metal. Discovers the truth: he\'s not the Hero of Ages. Draws on the mists, tears his Hemalurgic spikes free. The Lord Ruler ages and dies.',
    scriptPage: 36, pageCount: '7/8',
    elements: ['el-vin', 'el-lordruler', 'el-mistcloak', 'el-atium', 'el-vfx-steelpush', 'el-vfx-atium', 'el-vfx-metalburn', 'el-vfx-koloss', 'el-stunt-fights', 'el-stunt-allomancy', 'el-wire-rigs', 'el-kredik-shaw', 'el-hathsin-set', 'el-mist', 'el-fire', 'el-allomancy-sounds', 'el-rain-towers'],
    notes: 'CLIMAX. Biggest VFX sequence. Lord Ruler aging is major prosthetic/CG work. Vin draws on the mist itself. Koloss vision during Atium burn. Hathsin flashback insert. Rain/ash towers for throne room mist.'
  },
  {
    id: 'sc-15', sceneNumber: '15', intExt: 'EXT', dayNight: 'DAWN',
    location: 'Luthadel City', setName: 'City Overlook',
    description: 'Vin and Elend stand on a balcony overlooking Luthadel at dawn. The mists recede. For the first time, the sun looks a little less red. A new era begins. But the mists are still there.',
    scriptPage: 40, pageCount: '2/8',
    elements: ['el-vin', 'el-elend', 'el-sazed', 'el-vfx-city', 'el-mist', 'el-ash-fall'],
    notes: 'Denouement. Hopeful but ominous. Sequel hook. The ashfall hasn\'t stopped.'
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
  { id: 'chg-1', revisionId: 'rev-2', sceneNumber: '7', changeType: 'Modified', description: 'Extended Vin/Elend first meeting. Added book discussion dialogue.', oldContent: 'Brief encounter at the ball.', newContent: 'Extended scene where Elend quotes philosophy and Vin is intrigued despite herself.', impactedElements: ['el-elend', 'el-vin'], impactedDepartments: ['Wardrobe', 'Props'] },
  { id: 'chg-2', revisionId: 'rev-2', sceneNumber: '11', changeType: 'Added', description: 'New scene: Sazed teaches Vin about the Keepers. Previously this was exposition in scene 5.', impactedElements: ['el-sazed', 'el-vin', 'el-logbook'], impactedDepartments: ['Art', 'Props', 'Set Dressing'] },
  { id: 'chg-3', revisionId: 'rev-3', sceneNumber: '13', changeType: 'Modified', description: 'Kelsier death scene extended. Added his final words to the crowd. Slow-motion ash fall as he dies.', oldContent: 'Quick death scene.', newContent: 'Extended 3-page sequence with crowd reaction, Vin watching from a distance, Kelsier smiling as he dies.', impactedElements: ['el-kelsier', 'el-lordruler', 'el-ash-fall'], impactedDepartments: ['VFX', 'Stunts', 'SFX', 'Camera'] },
  { id: 'chg-4', revisionId: 'rev-3', sceneNumber: '14', changeType: 'Modified', description: 'Restructured throne room fight. Vin now draws on the mists before removing spikes (was simultaneous).', impactedElements: ['el-vin', 'el-lordruler', 'el-mist'], impactedDepartments: ['VFX', 'Stunts', 'SFX'] },
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
