import { v4 as uuidv4 } from 'uuid';
import type {
  SchedulingProject, Element, BreakdownSheet, StripBoardItem,
  ExtraGroup, SceneExtras, ExtrasVoucher,
  CostumeItem, SceneCostume,
  ScriptRevision, ScriptChange, LockedPage,
  ProductionSet,
} from '../types/scheduling';
import type { BudgetProject, BudgetGlobals, Fringe, AccountGroup, Account, LineItem } from '../types/budgeting';

// Pre-generated element IDs
const E_SARAH = uuidv4();
const E_JAMES = uuidv4();
const E_DR_CHEN = uuidv4();
const E_MARCUS = uuidv4();
const E_ELENA = uuidv4();
const E_YOUNG_SARAH = uuidv4();
const E_DETECTIVE = uuidv4();
const E_NURSE = uuidv4();
const E_FATHER = uuidv4();
const E_MOTHER = uuidv4();
const E_BRIEFCASE = uuidv4();
const E_PHOTO_ALBUM = uuidv4();
const E_SEDAN = uuidv4();
const E_AMBULANCE = uuidv4();
const E_HOSPITAL_GOWN = uuidv4();
const E_SUIT = uuidv4();
const E_CROWD = uuidv4();
const E_STUNT_DOUBLE = uuidv4();

// Pre-generated breakdown IDs
const BD1 = uuidv4();
const BD2 = uuidv4();
const BD3 = uuidv4();
const BD4 = uuidv4();
const BD5 = uuidv4();
const BD6 = uuidv4();
const BD7 = uuidv4();
const BD8 = uuidv4();
const BD9 = uuidv4();
const BD10 = uuidv4();
const BD11 = uuidv4();
const BD12 = uuidv4();
const BD13 = uuidv4();
const BD14 = uuidv4();
const BD15 = uuidv4();
const BD16 = uuidv4();
const BD17 = uuidv4();
const BD18 = uuidv4();
const BD19 = uuidv4();
const BD20 = uuidv4();

// Day break IDs
const DB1 = uuidv4();
const DB2 = uuidv4();
const DB3 = uuidv4();
const DB4 = uuidv4();
const DB5 = uuidv4();

const elements: Element[] = [
  { id: E_SARAH, category: 'Cast', name: 'SARAH (1)', notes: 'Lead actress - every scene' },
  { id: E_JAMES, category: 'Cast', name: 'JAMES (2)', notes: 'Lead actor' },
  { id: E_DR_CHEN, category: 'Cast', name: 'DR. CHEN (3)', notes: 'Supporting - hospital scenes' },
  { id: E_MARCUS, category: 'Cast', name: 'MARCUS (4)', notes: 'Supporting - flashback scenes' },
  { id: E_ELENA, category: 'Cast', name: 'ELENA (5)', notes: 'Supporting - present day' },
  { id: E_YOUNG_SARAH, category: 'Cast', name: 'YOUNG SARAH (6)', notes: 'Flashback sequences' },
  { id: E_DETECTIVE, category: 'Cast', name: 'DETECTIVE ROSS (7)', notes: 'Act 2 only' },
  { id: E_NURSE, category: 'Cast', name: 'NURSE PATRICIA (8)', notes: 'Hospital scenes' },
  { id: E_FATHER, category: 'Cast', name: 'FATHER (9)', notes: 'Flashback only' },
  { id: E_MOTHER, category: 'Cast', name: 'MOTHER (10)', notes: 'Flashback only' },
  { id: E_BRIEFCASE, category: 'Props', name: 'Leather Briefcase', notes: "James prop - every scene with James" },
  { id: E_PHOTO_ALBUM, category: 'Props', name: 'Photo Album - 1987', notes: 'Key prop in flashback scenes' },
  { id: E_SEDAN, category: 'Vehicles', name: 'Black Sedan (Hero)', notes: "Sarah's car" },
  { id: E_AMBULANCE, category: 'Vehicles', name: 'Ambulance', notes: 'Hospital exterior scene' },
  { id: E_HOSPITAL_GOWN, category: 'Wardrobe', name: 'Hospital Gown - Sarah', notes: 'Multiple sets needed' },
  { id: E_SUIT, category: 'Wardrobe', name: 'James Business Suit', notes: 'Charcoal grey, custom' },
  { id: E_CROWD, category: 'Extras', name: 'Hospital Waiting Room Extras (x8)', notes: 'Background' },
  { id: E_STUNT_DOUBLE, category: 'Stunts', name: 'Sarah Stunt Double', notes: 'Car accident sequence' },
];

const breakdowns: BreakdownSheet[] = [
  {
    id: BD1, sceneNumber: '1', intExt: 'INT', dayNight: 'DAY',
    location: 'Mercy General Hospital', setName: 'ICU Room 412',
    description: 'Sarah wakes from coma. James sits vigil at her bedside. She reaches for his hand.',
    scriptPage: 1, pageCount: '2/8',
    elements: [E_SARAH, E_JAMES, E_NURSE, E_HOSPITAL_GOWN, E_CROWD],
    notes: 'Establish ICU environment. Need medical equipment dressing.', estimatedTime: '1/2 day',
  },
  {
    id: BD2, sceneNumber: '2', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Mercy General Hospital', setName: 'Hospital Corridor',
    description: 'Dr. Chen delivers diagnosis to James in the empty corridor. Long walk-and-talk.',
    scriptPage: 3, pageCount: '1 4/8',
    elements: [E_JAMES, E_DR_CHEN, E_SUIT],
    notes: 'Night exterior look through windows. Steady-cam shot.', estimatedTime: '3/4 day',
  },
  {
    id: BD3, sceneNumber: '3', intExt: 'INT', dayNight: 'DAY',
    location: 'Mercy General Hospital', setName: 'Hospital Lobby',
    description: 'Sarah\'s first steps post-coma. Physical therapy nurse guides her. James watches.',
    scriptPage: 5, pageCount: '1/8',
    elements: [E_SARAH, E_JAMES, E_NURSE, E_HOSPITAL_GOWN, E_CROWD],
    notes: 'Handheld. Emotional moment.', estimatedTime: '1/4 day',
  },
  {
    id: BD4, sceneNumber: '4A', intExt: 'INT', dayNight: 'DAY',
    location: 'Fletcher Residence', setName: 'Living Room - 1987',
    description: 'FLASHBACK: Young Sarah discovers photo album. Parents argue in background.',
    scriptPage: 7, pageCount: '1 2/8',
    elements: [E_YOUNG_SARAH, E_FATHER, E_MOTHER, E_PHOTO_ALBUM],
    notes: 'Period appropriate dressing. Warm lighting contrast to present day.', estimatedTime: '1/2 day',
  },
  {
    id: BD5, sceneNumber: '4B', intExt: 'EXT', dayNight: 'DAY',
    location: 'Fletcher Residence', setName: 'Front Yard - 1987',
    description: 'FLASHBACK: Young Sarah hides under porch as storm approaches.',
    scriptPage: 9, pageCount: '3/8',
    elements: [E_YOUNG_SARAH],
    notes: 'Rain effect required. SFX rain machine.', estimatedTime: '1/4 day',
  },
  {
    id: BD6, sceneNumber: '5', intExt: 'EXT', dayNight: 'DAY',
    location: 'Downtown District', setName: 'City Street - Oak & 5th',
    description: 'Sarah returns to work for first time. Navigates crowded sidewalk.',
    scriptPage: 11, pageCount: '2/8',
    elements: [E_SARAH, E_SEDAN],
    notes: 'Permit required. 2-block radius. Extras - pedestrians.', estimatedTime: '1/2 day',
  },
  {
    id: BD7, sceneNumber: '6', intExt: 'INT', dayNight: 'DAY',
    location: 'Hargrove & Associates', setName: 'Law Office - Open Floor',
    description: 'Sarah confronts Marcus about the missing files. Tension escalates.',
    scriptPage: 12, pageCount: '2 4/8',
    elements: [E_SARAH, E_MARCUS, E_BRIEFCASE],
    notes: 'Wide establishing, then tight two-shot. Corporate wardrobe.', estimatedTime: '3/4 day',
  },
  {
    id: BD8, sceneNumber: '7', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Hargrove & Associates', setName: "Law Office - James's Office",
    description: 'James works late. Sarah finds the incriminating letter in his drawer.',
    scriptPage: 15, pageCount: '1 6/8',
    elements: [E_SARAH, E_JAMES, E_BRIEFCASE, E_SUIT],
    notes: 'Practical lighting only. Rain on windows.', estimatedTime: '3/4 day',
  },
  {
    id: BD9, sceneNumber: '8', intExt: 'EXT', dayNight: 'NIGHT',
    location: 'Downtown District', setName: 'Parking Structure - Level 3',
    description: 'Sarah confronted by unknown figure. James arrives just in time.',
    scriptPage: 18, pageCount: '1 2/8',
    elements: [E_SARAH, E_JAMES, E_STUNT_DOUBLE],
    notes: 'Stunt coordinator on set. Safety briefing required.', estimatedTime: '1 day',
  },
  {
    id: BD10, sceneNumber: '9', intExt: 'INT', dayNight: 'DAY',
    location: 'Mercy General Hospital', setName: "Dr. Chen's Office",
    description: 'Sarah reviews her own medical file. Dr. Chen reveals truth about the accident.',
    scriptPage: 21, pageCount: '3 0/8',
    elements: [E_SARAH, E_DR_CHEN, E_HOSPITAL_GOWN],
    notes: 'Key exposition scene. Performance-heavy.', estimatedTime: '1 day',
  },
  {
    id: BD11, sceneNumber: '10', intExt: 'EXT', dayNight: 'DAWN',
    location: 'Riverside Park', setName: 'Park Walkway',
    description: 'Sarah and Elena share early morning walk. Elena reveals she knows the truth.',
    scriptPage: 25, pageCount: '2 2/8',
    elements: [E_SARAH, E_ELENA, E_SEDAN],
    notes: 'Magic hour. Call time 5:30am. Beautiful shot opportunity.', estimatedTime: '1/2 day',
  },
  {
    id: BD12, sceneNumber: '11', intExt: 'INT', dayNight: 'NIGHT',
    location: "Sarah's Apartment", setName: 'Kitchen',
    description: 'Sarah pieces together the evidence at her kitchen table. Flashback intercuts.',
    scriptPage: 28, pageCount: '1 4/8',
    elements: [E_SARAH, E_PHOTO_ALBUM],
    notes: 'Intercut with flashback. Same set as scene 4A memory.', estimatedTime: '1/2 day',
  },
  {
    id: BD13, sceneNumber: '12', intExt: 'INT', dayNight: 'DAY',
    location: 'Hargrove & Associates', setName: 'Conference Room',
    description: 'Board meeting turns hostile. Sarah presents her evidence. Marcus exposed.',
    scriptPage: 30, pageCount: '4 0/8',
    elements: [E_SARAH, E_MARCUS, E_JAMES, E_ELENA, E_BRIEFCASE, E_SUIT, E_CROWD],
    notes: 'Large cast. Multiple extras as board members. Climax of act 2.', estimatedTime: '1 day',
  },
  {
    id: BD14, sceneNumber: '13', intExt: 'EXT', dayNight: 'DAY',
    location: 'Mercy General Hospital', setName: 'Hospital Entrance',
    description: 'Marcus arrested outside hospital. Sarah watches from window above.',
    scriptPage: 35, pageCount: '1 0/8',
    elements: [E_SARAH, E_MARCUS, E_DETECTIVE, E_AMBULANCE],
    notes: 'Permit: hospital exterior. Police vehicles needed.', estimatedTime: '3/4 day',
  },
  {
    id: BD15, sceneNumber: '14', intExt: 'INT', dayNight: 'DAY',
    location: 'Mercy General Hospital', setName: 'ICU Room 412',
    description: 'James visits Sarah. They face the future. Dialogue-heavy resolution.',
    scriptPage: 37, pageCount: '2 4/8',
    elements: [E_SARAH, E_JAMES, E_HOSPITAL_GOWN],
    notes: 'Matching scene 1. Full circle. Intimate, handheld.', estimatedTime: '3/4 day',
  },
  {
    id: BD16, sceneNumber: '15', intExt: 'INT', dayNight: 'NIGHT',
    location: 'Riverside Bar & Grill', setName: 'Bar Interior',
    description: 'Detective Ross debriefs Elena over drinks. Exposition on case resolution.',
    scriptPage: 40, pageCount: '1 6/8',
    elements: [E_ELENA, E_DETECTIVE],
    notes: 'Practical location. Evening light through windows.', estimatedTime: '1/2 day',
  },
  {
    id: BD17, sceneNumber: '16A', intExt: 'EXT', dayNight: 'DAY',
    location: 'State Highway 9', setName: 'Rural Road - Accident Site',
    description: "FLASHBACK: The accident. Sarah's car veers off road. Stunt sequence.",
    scriptPage: 43, pageCount: '2 0/8',
    elements: [E_SARAH, E_STUNT_DOUBLE, E_SEDAN],
    notes: 'Full stunt day. Safety protocols. Locked location.', estimatedTime: '1 day',
  },
  {
    id: BD18, sceneNumber: '16B', intExt: 'EXT', dayNight: 'DAY',
    location: 'State Highway 9', setName: 'Rural Road - Aftermath',
    description: 'James arrives at accident scene. Paramedics load Sarah into ambulance.',
    scriptPage: 45, pageCount: '1 0/8',
    elements: [E_JAMES, E_STUNT_DOUBLE, E_AMBULANCE, E_SUIT],
    notes: 'Follows 16A. Golden hour if possible.', estimatedTime: '1/2 day',
  },
  {
    id: BD19, sceneNumber: '17', intExt: 'EXT', dayNight: 'DAY',
    location: 'Riverside Park', setName: 'Park Bench - Overlook',
    description: 'Final scene. Sarah sits alone overlooking city. James appears. Hope.',
    scriptPage: 47, pageCount: '1 4/8',
    elements: [E_SARAH, E_JAMES],
    notes: 'Last shooting day ideally. Natural light. Minimal crew.', estimatedTime: '1/2 day',
  },
  {
    id: BD20, sceneNumber: '18', intExt: 'INT', dayNight: 'DAY',
    location: 'Fletcher Residence', setName: 'Living Room - Present Day',
    description: "Sarah returns to childhood home. Finds mother's letter. Closure.",
    scriptPage: 49, pageCount: '2 2/8',
    elements: [E_SARAH, E_PHOTO_ALBUM],
    notes: 'Re-dress from 1987 set to present. Requires art department turnaround.', estimatedTime: '3/4 day',
  },
];

const stripBoard: StripBoardItem[] = [
  { type: 'dayBreak', id: DB1, dayNumber: 1, label: 'Day 1 - Mercy General Hospital' },
  { type: 'scene', id: uuidv4(), breakdownId: BD1 },
  { type: 'scene', id: uuidv4(), breakdownId: BD2 },
  { type: 'scene', id: uuidv4(), breakdownId: BD3 },
  { type: 'scene', id: uuidv4(), breakdownId: BD10 },
  { type: 'dayBreak', id: DB2, dayNumber: 2, label: 'Day 2 - Hospital & Flashbacks' },
  { type: 'scene', id: uuidv4(), breakdownId: BD14 },
  { type: 'scene', id: uuidv4(), breakdownId: BD15 },
  { type: 'scene', id: uuidv4(), breakdownId: BD4 },
  { type: 'scene', id: uuidv4(), breakdownId: BD5 },
  { type: 'dayBreak', id: DB3, dayNumber: 3, label: 'Day 3 - Downtown & Office' },
  { type: 'scene', id: uuidv4(), breakdownId: BD6 },
  { type: 'scene', id: uuidv4(), breakdownId: BD7 },
  { type: 'scene', id: uuidv4(), breakdownId: BD8 },
  { type: 'scene', id: uuidv4(), breakdownId: BD9 },
  { type: 'dayBreak', id: DB4, dayNumber: 4, label: 'Day 4 - Office & Park' },
  { type: 'scene', id: uuidv4(), breakdownId: BD13 },
  { type: 'scene', id: uuidv4(), breakdownId: BD11 },
  { type: 'scene', id: uuidv4(), breakdownId: BD12 },
  { type: 'scene', id: uuidv4(), breakdownId: BD16 },
  { type: 'dayBreak', id: DB5, dayNumber: 5, label: 'Day 5 - Highway & Final Scenes' },
  { type: 'scene', id: uuidv4(), breakdownId: BD17 },
  { type: 'scene', id: uuidv4(), breakdownId: BD18 },
  { type: 'scene', id: uuidv4(), breakdownId: BD19 },
  { type: 'scene', id: uuidv4(), breakdownId: BD20 },
];

// ── Extras Manager sample data ───────────────────────────────────────────────

const EG_RESTAURANT = uuidv4();
const EG_HOSPITAL = uuidv4();
const EG_STREET = uuidv4();
const EG_POLICE = uuidv4();

const extraGroups: ExtraGroup[] = [
  { id: EG_RESTAURANT, name: 'Restaurant Patrons', category: 'Non-Union', defaultRate: 182, defaultOvertimeRate: 273, notes: 'Business casual attire required' },
  { id: EG_HOSPITAL, name: 'Hospital Visitors', category: 'Non-Union', defaultRate: 182, defaultOvertimeRate: 273, notes: 'Civilian clothes, no medical uniforms' },
  { id: EG_STREET, name: 'Street Pedestrians', category: 'SAG', defaultRate: 236, defaultOvertimeRate: 354, notes: 'Varied street clothing' },
  { id: EG_POLICE, name: 'Police Officers', category: 'Special Ability', defaultRate: 312, defaultOvertimeRate: 468, notes: 'Must have own uniform or use provided costumes' },
];

const sceneExtras: SceneExtras[] = [
  {
    sceneId: BD1,
    groups: [{ groupId: EG_HOSPITAL, headcount: 8, callTime: '6:00 AM', wrapTime: '4:00 PM', wardrobe: 'Civilian clothes', notes: 'Waiting room background' }],
  },
  {
    sceneId: BD6,
    groups: [{ groupId: EG_STREET, headcount: 15, callTime: '7:00 AM', wrapTime: '5:00 PM', wardrobe: 'Business casual / casual pedestrian mix' }],
  },
  {
    sceneId: BD13,
    groups: [
      { groupId: EG_RESTAURANT, headcount: 12, callTime: '7:30 AM', wrapTime: '6:00 PM', wardrobe: 'Business formal', notes: 'Board members — seated at conference table' },
      { groupId: EG_POLICE, headcount: 2, callTime: '2:00 PM', wrapTime: '6:00 PM', notes: 'Arrival at end of scene' },
    ],
  },
  {
    sceneId: BD14,
    groups: [{ groupId: EG_POLICE, headcount: 4, callTime: '8:00 AM', wrapTime: '4:00 PM', wardrobe: 'Full uniform', notes: 'Arrest scene exterior' }],
  },
];

const extrasVouchers: ExtrasVoucher[] = [
  { id: uuidv4(), date: '2026-03-01', sceneId: BD1, groupId: EG_HOSPITAL, name: 'Maria Gonzalez', ssn_last4: '4521', callTime: '6:00 AM', wrapTime: '4:00 PM', hoursWorked: 10, mealPenalty: false, rate: 182, totalPay: 182 },
  { id: uuidv4(), date: '2026-03-01', sceneId: BD1, groupId: EG_HOSPITAL, name: 'Tom Ashby', ssn_last4: '7732', callTime: '6:00 AM', wrapTime: '4:30 PM', hoursWorked: 10.5, mealPenalty: true, rate: 182, totalPay: 212 },
  { id: uuidv4(), date: '2026-03-01', sceneId: BD1, groupId: EG_HOSPITAL, name: 'Priya Nair', callTime: '6:00 AM', wrapTime: '4:00 PM', hoursWorked: 10, mealPenalty: false, rate: 182, totalPay: 182 },
];

// ── Wardrobe / Costumes sample data ──────────────────────────────────────────

const C_SARAH_GOWN = uuidv4();
const C_SARAH_BUSINESS = uuidv4();
const C_SARAH_CASUAL = uuidv4();
const C_JAMES_SUIT = uuidv4();
const C_JAMES_CASUAL = uuidv4();
const C_DRCHEN_COAT = uuidv4();
const C_YOUNGSARAH_PERIOD = uuidv4();
const C_YOUNGSARAH_SUMMER = uuidv4();
const C_MARCUS_POWERSUIT = uuidv4();

const costumes: CostumeItem[] = [
  {
    id: C_SARAH_GOWN, characterId: E_SARAH,
    name: 'Hospital Gown — Sarah', description: 'Standard hospital gown, pale blue with white pattern',
    pieces: ['Hospital gown (x4 matching sets)', 'Non-slip hospital socks', 'IV bandage on left hand'],
    condition: 'Aged', color: '#a8d8ea',
    continuityNotes: 'IV in left hand Sc 1–3, removed Sc 10. Gown slightly damp Sc 3.',
  },
  {
    id: C_SARAH_BUSINESS, characterId: E_SARAH,
    name: 'Business Attire — Sarah', description: 'Return-to-work outfit. Professional but slightly too formal.',
    pieces: ['Charcoal blazer', 'White silk blouse', 'Dark navy trousers', 'Low block heels'],
    condition: 'New', color: '#4a4a6a',
    notes: 'Purchased per character arc — she is overcompensating.',
  },
  {
    id: C_SARAH_CASUAL, characterId: E_SARAH,
    name: 'Casual Apartment — Sarah', description: 'Home wear. Comfortable but guarded.',
    pieces: ['Grey oversized knit sweater', 'Dark leggings', 'Wool socks'],
    condition: 'Aged', color: '#888888',
  },
  {
    id: C_JAMES_SUIT, characterId: E_JAMES,
    name: 'Charcoal Business Suit — James', description: 'Custom tailored charcoal suit. Authority and wealth.',
    pieces: ['Charcoal wool suit jacket', 'Matching trousers', 'White dress shirt', 'Burgundy tie', 'Black oxfords', 'Leather belt'],
    condition: 'New', color: '#3d3d3d',
    continuityNotes: 'Tie loosened by Sc 8. Jacket removed Sc 8.',
  },
  {
    id: C_JAMES_CASUAL, characterId: E_JAMES,
    name: 'Casual — James', description: 'Relaxed weekend look for park scene.',
    pieces: ['Navy chore coat', 'Light grey crewneck', 'Dark jeans', 'White sneakers'],
    condition: 'New', color: '#2b4a6e',
  },
  {
    id: C_DRCHEN_COAT, characterId: E_DR_CHEN,
    name: "Doctor's Coat — Dr. Chen", description: 'Standard white lab coat over professional attire.',
    pieces: ["White lab coat (Dr. Chen name tag)", 'Navy dress shirt', 'Grey trousers', 'Stethoscope'],
    condition: 'Clean', color: '#f5f5f5',
  },
  {
    id: C_YOUNGSARAH_PERIOD, characterId: E_YOUNG_SARAH,
    name: 'Period Dress 1987 — Young Sarah', description: '1987 period-accurate summer dress for flashback interiors.',
    pieces: ['Floral cotton dress (80s cut)', 'White ankle socks', 'Mary Jane shoes', 'Scrunchie'],
    condition: 'Aged', color: '#e8c4a0',
    notes: 'Dress has been aged — slight fading on shoulders. Multiple sets.',
  },
  {
    id: C_YOUNGSARAH_SUMMER, characterId: E_YOUNG_SARAH,
    name: 'Summer Play Clothes — Young Sarah', description: 'Exterior yard scene casual wear.',
    pieces: ['Light blue t-shirt', 'Denim shorts', 'Sneakers (worn, vintage style)', 'Hair in pigtails'],
    condition: 'Distressed', color: '#87ceeb',
    continuityNotes: 'Dress and shoes get muddy during rain — matched for coverage shots.',
  },
  {
    id: C_MARCUS_POWERSUIT, characterId: E_MARCUS,
    name: 'Power Suit — Marcus', description: 'Expensive, aggressive cut. Dark authority.',
    pieces: ['Black Italian suit jacket', 'Matching slim trousers', 'Black dress shirt (no tie)', 'Black oxfords'],
    condition: 'New', color: '#1a1a1a',
    notes: 'Intentionally darker than James — visual contrast between the two men.',
  },
];

const sceneCostumes: SceneCostume[] = [
  { sceneId: BD1, characterId: E_SARAH, costumeId: C_SARAH_GOWN, changeNumber: 1, notes: 'IV on left hand' },
  { sceneId: BD1, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1 },
  { sceneId: BD2, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1, notes: 'Same day as Sc 1' },
  { sceneId: BD2, characterId: E_DR_CHEN, costumeId: C_DRCHEN_COAT, changeNumber: 1 },
  { sceneId: BD3, characterId: E_SARAH, costumeId: C_SARAH_GOWN, changeNumber: 1 },
  { sceneId: BD3, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1 },
  { sceneId: BD4, characterId: E_YOUNG_SARAH, costumeId: C_YOUNGSARAH_PERIOD, changeNumber: 1 },
  { sceneId: BD5, characterId: E_YOUNG_SARAH, costumeId: C_YOUNGSARAH_SUMMER, changeNumber: 1, notes: 'Gets wet from rain machine' },
  { sceneId: BD6, characterId: E_SARAH, costumeId: C_SARAH_BUSINESS, changeNumber: 1, notes: 'First time out of gown' },
  { sceneId: BD7, characterId: E_SARAH, costumeId: C_SARAH_BUSINESS, changeNumber: 1 },
  { sceneId: BD7, characterId: E_MARCUS, costumeId: C_MARCUS_POWERSUIT, changeNumber: 1 },
  { sceneId: BD8, characterId: E_SARAH, costumeId: C_SARAH_CASUAL, changeNumber: 1, notes: 'Night scene — she changed after work' },
  { sceneId: BD8, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1, notes: 'Jacket removed, tie loosened' },
  { sceneId: BD9, characterId: E_SARAH, costumeId: C_SARAH_CASUAL, changeNumber: 1 },
  { sceneId: BD9, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1 },
  { sceneId: BD10, characterId: E_SARAH, costumeId: C_SARAH_GOWN, changeNumber: 1, notes: 'Back in gown for medical visit' },
  { sceneId: BD10, characterId: E_DR_CHEN, costumeId: C_DRCHEN_COAT, changeNumber: 1 },
  { sceneId: BD13, characterId: E_SARAH, costumeId: C_SARAH_BUSINESS, changeNumber: 1 },
  { sceneId: BD13, characterId: E_JAMES, costumeId: C_JAMES_SUIT, changeNumber: 1 },
  { sceneId: BD13, characterId: E_MARCUS, costumeId: C_MARCUS_POWERSUIT, changeNumber: 1 },
  { sceneId: BD15, characterId: E_SARAH, costumeId: C_SARAH_GOWN, changeNumber: 1 },
  { sceneId: BD15, characterId: E_JAMES, costumeId: C_JAMES_CASUAL, changeNumber: 1 },
  { sceneId: BD19, characterId: E_SARAH, costumeId: C_SARAH_CASUAL, changeNumber: 1 },
  { sceneId: BD19, characterId: E_JAMES, costumeId: C_JAMES_CASUAL, changeNumber: 1 },
];

// ── Script Revisions sample data ─────────────────────────────────────────────

const REV1 = uuidv4();
const REV2 = uuidv4();

const revisions: ScriptRevision[] = [
  {
    id: REV1, revisionNumber: 1, color: 'White', date: '2026-01-15',
    author: 'A. Whitmore',
    description: 'Original shooting script. Full draft with all 18 scenes.',
    pagesChanged: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    scenesAffected: ['1', '2', '3', '4A', '4B', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16A', '16B', '17', '18'],
    isLocked: true,
  },
  {
    id: REV2, revisionNumber: 2, color: 'Blue', date: '2026-02-28',
    author: 'A. Whitmore / M. Davis',
    description: 'Act 2 restructure — conference room scene expanded. Added Det. Ross subplot. Sc 16A stunt revised for safety.',
    pagesChanged: ['12', '13', '14', '15', '30', '31', '32', '43', '44', '45'],
    scenesAffected: ['6', '7', '12', '13', '16A'],
    isLocked: false,
  },
];

const scriptChanges: ScriptChange[] = [
  {
    id: uuidv4(), revisionId: REV2, sceneNumber: '12',
    changeType: 'Modified',
    description: 'Conference room scene extended by 2 pages. Board members given individual lines.',
    oldContent: '2-page dialogue between Sarah and Marcus at board table',
    newContent: '4-page scene with full board reaction and walkout moment',
    impactedElements: [E_SARAH, E_MARCUS, E_JAMES, E_ELENA, E_CROWD],
    impactedDepartments: ['Art Department', 'Wardrobe', 'AD'],
  },
  {
    id: uuidv4(), revisionId: REV2, sceneNumber: '6',
    changeType: 'Modified',
    description: 'Law office confrontation reworked — Marcus now threatens Sarah explicitly.',
    oldContent: 'Tense but civil exchange about missing files',
    newContent: 'Open threat with physical intimidation blocking',
    impactedElements: [E_SARAH, E_MARCUS],
    impactedDepartments: ['AD', 'Camera', 'Stunt Coordinator'],
  },
  {
    id: uuidv4(), revisionId: REV2, sceneNumber: '16A',
    changeType: 'Modified',
    description: 'Stunt sequence revised. Car now swerves to avoid oncoming truck rather than mechanical failure.',
    oldContent: 'Car veers due to brake failure',
    newContent: 'Oncoming truck forces Sarah off road — requires stunt truck hero vehicle',
    impactedElements: [E_SARAH, E_STUNT_DOUBLE, E_SEDAN],
    impactedDepartments: ['Stunts', 'Transportation', 'Camera', 'Special Effects'],
  },
  {
    id: uuidv4(), revisionId: REV2, sceneNumber: '13',
    changeType: 'Added',
    description: 'New scene 13A added — Detective Ross interviews hospital receptionist. Brief exposition.',
    oldContent: '',
    newContent: 'INT. HOSPITAL LOBBY - DAY. 1/8 page. Det. Ross + receptionist.',
    impactedElements: [E_DETECTIVE],
    impactedDepartments: ['AD', 'Casting', 'Locations'],
  },
];

const lockedPages: LockedPage[] = [
  { pageNumber: '1', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '2', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '3', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '25', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '47', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '48', lockedAtRevision: 1, cannotChange: true },
  { pageNumber: '49', lockedAtRevision: 1, cannotChange: true },
];

// ── Sets sample data ──────────────────────────────────────────────────────────

const sets: ProductionSet[] = [
  {
    id: uuidv4(),
    name: 'ICU Room 412',
    type: 'Studio Build',
    location: 'Stage A — Paramount Lot',
    status: 'Ready',
    buildDate: '2026-02-10',
    readyDate: '2026-02-28',
    strikeDate: '2026-03-20',
    estimatedCost: 42000,
    actualCost: 44800,
    sqFootage: 380,
    linkedScenes: ['1', '14'],
    linkedLocationName: 'ICU Room 412',
    departments: {
      art: 'Full medical build. ICU bed, monitors, IV stands, ceiling tiles, observation window.',
      construction: 'Walls on 3 sides. Practical door. Ceiling drop for lighting rig.',
      electric: 'Practical monitors must be lit and operational. Fluorescent ceiling panels.',
      setDressing: 'Medical equipment rental from Prop Heaven. Fresh flowers for Sc 14.',
      props: 'IV bag with colored water. Medical chart. Personal items on bedside table.',
    },
    photos: [],
    notes: 'Match precisely between Sc 1 and Sc 14 — full circle callback.',
  },
  {
    id: uuidv4(),
    name: 'Hospital Corridor',
    type: 'Studio Build',
    location: 'Stage A — Paramount Lot',
    status: 'In Use',
    buildDate: '2026-02-10',
    readyDate: '2026-02-28',
    strikeDate: '2026-03-20',
    estimatedCost: 28000,
    actualCost: 27400,
    sqFootage: 620,
    linkedScenes: ['2', '3'],
    linkedLocationName: 'Hospital Corridor',
    departments: {
      art: 'Long corridor with nurse station at end. Night exterior visible through window cyclorama.',
      electric: 'Fluorescent flicker unit for Sc 2 — moody effect.',
      setDressing: 'Bulletin boards, patient room signs, emergency equipment cabinets.',
    },
    photos: [],
    notes: 'Steady-cam track laid on day 1 — do not strike until wrap day 2.',
  },
  {
    id: uuidv4(),
    name: 'Downtown Street — Oak & 5th',
    type: 'Practical Location',
    location: 'Oak St & 5th Ave, Downtown',
    status: 'In Use',
    buildDate: undefined,
    readyDate: '2026-03-05',
    strikeDate: '2026-03-06',
    estimatedCost: 8500,
    actualCost: 9100,
    sqFootage: undefined,
    linkedScenes: ['5', '8'],
    linkedLocationName: 'City Street - Oak & 5th',
    departments: {
      art: 'Period hero car parking. Minimal dressing — remove modern signage.',
      electric: 'HMI bounce off building face. Generator truck around corner.',
      grip: 'Dolly on sidewalk for tracking shot with Sarah.',
    },
    photos: [],
    notes: 'City permit #24-882. 6am–6pm window. Parking lot blocked. Police liaison: Ofc. Torres.',
  },
  {
    id: uuidv4(),
    name: 'Fletcher Living Room — 1987',
    type: 'Studio Build',
    location: 'Stage B — Paramount Lot',
    status: 'In Construction',
    buildDate: '2026-03-01',
    readyDate: '2026-03-12',
    strikeDate: '2026-03-15',
    estimatedCost: 35000,
    sqFootage: 480,
    linkedScenes: ['4A', '18'],
    linkedLocationName: 'Living Room - 1987',
    departments: {
      art: '1987-era furnishings. Striped sofa, wood paneling, tube TV. Warm practical lamps.',
      construction: 'Reversible build — dresses as 1987 then redresses as present day for Sc 18.',
      setDressing: 'Props rented from Period Props Inc. Calendar on wall: September 1987.',
      greens: 'Potted ficus in corner. Practical plants.',
    },
    photos: [],
    notes: 'Art department needs 1 full day to re-dress from 1987 to present-day between Sc 4A and Sc 18.',
  },
  {
    id: uuidv4(),
    name: 'Riverside Park — Walkway & Bench',
    type: 'Practical Location',
    location: 'Riverside Park, North Trail',
    status: 'Planned',
    buildDate: undefined,
    readyDate: '2026-03-18',
    strikeDate: '2026-03-19',
    estimatedCost: 3200,
    sqFootage: undefined,
    linkedScenes: ['10', '17'],
    linkedLocationName: 'Park Walkway',
    departments: {
      grip: 'Dolly or Steadicam for Sc 10 walk-and-talk.',
      electric: 'Bounce and fill for early morning light (Sc 10 is DAWN call).',
    },
    photos: [],
    notes: 'No permit required for under 10 crew. Sc 10 call time 5:30am — coordinate with park management.',
  },
  {
    id: uuidv4(),
    name: 'State Highway 9 — Stunt Site',
    type: 'Practical Location',
    location: 'State Hwy 9, Mile Marker 44, Rural Section',
    status: 'Planned',
    buildDate: undefined,
    readyDate: '2026-03-22',
    strikeDate: '2026-03-22',
    estimatedCost: 18500,
    sqFootage: undefined,
    linkedScenes: ['16A', '16B'],
    linkedLocationName: 'Rural Road - Accident Site',
    departments: {
      art: 'Hero sedan, stunt truck. Skid marks applied by SFX. Crash debris kit.',
      electric: 'Generator and golden-hour HMI for Sc 16B.',
      grip: 'Low-loader camera car for chase coverage.',
    },
    photos: [],
    notes: 'FULL ROAD CLOSURE REQUIRED — State permit in progress. Stunt coordinator: Rick Vasquez. Safety briefing mandatory before rehearsals.',
  },
];

export const sampleSchedulingProject: SchedulingProject = {
  id: uuidv4(),
  name: 'THE LAST LIGHT',
  elements,
  breakdowns,
  stripBoard,
  extraGroups,
  sceneExtras,
  extrasVouchers,
  costumes,
  sceneCostumes,
  revisions,
  scriptChanges,
  lockedPages,
  sets,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ---- BUDGET DATA ----

const globals: BudgetGlobals = {
  currency: 'USD',
  currencySymbol: '$',
  prepWeeks: 4,
  shootWeeks: 6,
  wrapWeeks: 2,
  payDaysPerWeek: 5,
  overtimeRate: 1.5,
  taxRate: 0,
  contingencyPercent: 10,
};

const makeLineItem = (
  description: string,
  units: number,
  unitType: string,
  rate: number,
  quantity: number,
  actualSpend?: number
): LineItem => {
  const subtotal = units * rate * quantity;
  return {
    id: uuidv4(),
    description,
    units,
    unitType,
    rate,
    quantity,
    subtotal,
    fringeTotal: 0,
    total: subtotal,
    actualSpend,
  };
};

const makeAccount = (code: string, name: string, lineItems: LineItem[]): Account => ({
  id: uuidv4(),
  code,
  name,
  lineItems,
  subtotal: lineItems.reduce((s, i) => s + i.total, 0),
});

const makeGroup = (code: string, name: string, accounts: Account[]): AccountGroup => ({
  id: uuidv4(),
  code,
  name,
  accounts,
  subtotal: accounts.reduce((s, a) => s + a.subtotal, 0),
});

const group1 = makeGroup('1000', 'Above The Line', [
  makeAccount('1100', 'Story & Screenplay', [
    makeLineItem('Option Agreement', 1, 'Flat', 15000, 1, 15000),
    makeLineItem('Screenplay Purchase', 1, 'Flat', 75000, 1, 75000),
    makeLineItem('WGA Residuals Reserve', 1, 'Allow', 5000, 1, 3200),
  ]),
  makeAccount('1200', 'Producer', [
    makeLineItem('Executive Producer Fee', 12, 'Weeks', 3500, 1, 42000),
    makeLineItem('Producer Fee', 12, 'Weeks', 2500, 1, 30000),
    makeLineItem('Development Expenses', 1, 'Allow', 8000, 1, 6500),
  ]),
  makeAccount('1300', 'Direction', [
    makeLineItem('Director Fee - Prep', 4, 'Weeks', 8000, 1, 32000),
    makeLineItem('Director Fee - Shoot', 6, 'Weeks', 8000, 1, 48000),
    makeLineItem('Director Fee - Post', 8, 'Weeks', 4000, 1, 32000),
    makeLineItem('Director Expenses', 1, 'Allow', 5000, 1, 4200),
  ]),
  makeAccount('1400', 'Cast', [
    makeLineItem('Lead Actress (Sarah) - SAG Day Rate x30', 30, 'Days', 1400, 1, 42000),
    makeLineItem('Lead Actor (James) - SAG Day Rate x25', 25, 'Days', 1200, 1, 30000),
    makeLineItem('Supporting Cast - Package', 1, 'Allow', 85000, 1, 85000),
    makeLineItem('Stunt Coordinator', 5, 'Days', 1800, 1, 9000),
    makeLineItem('Stunt Performers', 10, 'Days', 900, 1, 9000),
    makeLineItem('Casting Director Fee', 1, 'Flat', 18000, 1, 18000),
  ]),
]);

const group2 = makeGroup('2000', 'Below The Line', [
  makeAccount('2100', 'Production Staff', [
    makeLineItem('Production Manager', 10, 'Weeks', 2200, 1, 22000),
    makeLineItem('1st Assistant Director', 8, 'Weeks', 2000, 1, 16000),
    makeLineItem('2nd Assistant Director', 7, 'Weeks', 1600, 1, 11200),
    makeLineItem('Script Supervisor', 6, 'Weeks', 1800, 1, 10800),
    makeLineItem('Production Coordinator', 10, 'Weeks', 1400, 1, 14000),
    makeLineItem('Production Assistants (x3)', 30, 'Days', 200, 1, 6000),
  ]),
  makeAccount('2200', 'Camera Department', [
    makeLineItem('Director of Photography', 8, 'Weeks', 4500, 1, 36000),
    makeLineItem('Camera Operator', 6, 'Weeks', 2200, 1, 13200),
    makeLineItem('1st AC', 8, 'Weeks', 1800, 1, 14400),
    makeLineItem('2nd AC', 7, 'Weeks', 1400, 1, 9800),
    makeLineItem('Camera Package Rental', 6, 'Weeks', 8500, 1, 51000),
    makeLineItem('Expendables', 1, 'Allow', 3500, 1, 3500),
  ]),
  makeAccount('2300', 'Art Department', [
    makeLineItem('Production Designer', 10, 'Weeks', 3000, 1, 30000),
    makeLineItem('Art Director', 8, 'Weeks', 2200, 1, 17600),
    makeLineItem('Set Decorator', 6, 'Weeks', 1800, 1, 10800),
    makeLineItem('Props Master', 8, 'Weeks', 1600, 1, 12800),
    makeLineItem('Set Construction', 1, 'Allow', 45000, 1, 45000),
    makeLineItem('Set Dressing & Props Rental', 1, 'Allow', 28000, 1, 28000),
  ]),
  makeAccount('2400', 'Locations', [
    makeLineItem('Location Manager', 10, 'Weeks', 2000, 1, 20000),
    makeLineItem('Hospital Location Fee', 15, 'Days', 2500, 1, 37500),
    makeLineItem('Office Building Location Fee', 8, 'Days', 1800, 1, 14400),
    makeLineItem('Practical Locations Package', 1, 'Allow', 25000, 1, 25000),
    makeLineItem('Location Permits & Insurance', 1, 'Allow', 12000, 1, 12000),
  ]),
  makeAccount('2500', 'Production Sound', [
    makeLineItem('Production Sound Mixer', 6, 'Weeks', 2500, 1, 15000),
    makeLineItem('Boom Operator', 6, 'Weeks', 1600, 1, 9600),
    makeLineItem('Sound Package Rental', 6, 'Weeks', 1200, 1, 7200),
    makeLineItem('Expendables', 1, 'Allow', 800, 1, 800),
  ]),
]);

const group3 = makeGroup('3000', 'Post Production', [
  makeAccount('3100', 'Editorial', [
    makeLineItem('Editor', 16, 'Weeks', 3500, 1, 56000),
    makeLineItem('Assistant Editor', 16, 'Weeks', 1600, 1, 25600),
    makeLineItem('Avid Rental', 16, 'Weeks', 600, 1, 9600),
    makeLineItem('Post Production Supervisor', 20, 'Weeks', 2000, 1, 40000),
  ]),
  makeAccount('3200', 'Visual Effects', [
    makeLineItem('VFX Supervisor', 8, 'Weeks', 4000, 1, 32000),
    makeLineItem('VFX Compositing Package', 1, 'Allow', 75000, 1, 75000),
    makeLineItem('VFX Plates & Cleanup', 1, 'Allow', 25000, 1, 25000),
  ]),
  makeAccount('3300', 'Sound Post', [
    makeLineItem('Sound Design', 8, 'Weeks', 2500, 1, 20000),
    makeLineItem('ADR Sessions', 5, 'Days', 2000, 1, 10000),
    makeLineItem('Music Composer Fee', 1, 'Flat', 40000, 1, 40000),
    makeLineItem('Music Licensing', 1, 'Allow', 15000, 1, 15000),
    makeLineItem('Mix & Deliverables', 1, 'Allow', 18000, 1, 18000),
  ]),
]);

const group4 = makeGroup('4000', 'Other', [
  makeAccount('4100', 'Insurance & Legal', [
    makeLineItem('Production Insurance', 1, 'Allow', 45000, 1, 45000),
    makeLineItem('E&O Insurance', 1, 'Allow', 12000, 1, 12000),
    makeLineItem('Legal & Contracts', 1, 'Allow', 20000, 1, 20000),
  ]),
  makeAccount('4200', 'General & Administrative', [
    makeLineItem('Production Office Rental', 12, 'Weeks', 1500, 1, 18000),
    makeLineItem('Office Equipment & Supplies', 1, 'Allow', 5000, 1, 5000),
    makeLineItem('Accounting & Payroll Services', 1, 'Allow', 18000, 1, 18000),
    makeLineItem('Festival & Deliverables Package', 1, 'Allow', 12000, 1, 12000),
  ]),
]);

const allGroups: AccountGroup[] = [group1, group2, group3, group4];
const grandTotal = allGroups.reduce((s, g) => s + g.subtotal, 0);
const contingencyPct = 10;
const contingency = grandTotal * contingencyPct / 100;

const fringes: Fringe[] = [
  {
    id: uuidv4(),
    name: 'Social Security (FICA)',
    type: 'percentage',
    value: 6.2,
    cap: 160200,
    appliesTo: [group1.accounts[3].id, group2.accounts[0].id, group2.accounts[1].id, group2.accounts[2].id, group2.accounts[3].id, group2.accounts[4].id],
    enabled: true,
  },
  {
    id: uuidv4(),
    name: 'Medicare',
    type: 'percentage',
    value: 1.45,
    appliesTo: [group1.accounts[3].id, group2.accounts[0].id, group2.accounts[1].id, group2.accounts[2].id, group2.accounts[3].id, group2.accounts[4].id],
    enabled: true,
  },
  {
    id: uuidv4(),
    name: 'SAG-AFTRA Pension & Health',
    type: 'percentage',
    value: 19.0,
    appliesTo: [group1.accounts[3].id],
    enabled: true,
  },
  {
    id: uuidv4(),
    name: 'Workers Compensation',
    type: 'percentage',
    value: 4.0,
    appliesTo: [group1.accounts[3].id, group2.accounts[0].id, group2.accounts[1].id, group2.accounts[2].id, group2.accounts[3].id, group2.accounts[4].id],
    enabled: true,
  },
];

export const sampleBudgetProject: BudgetProject = {
  id: uuidv4(),
  name: 'THE LAST LIGHT',
  globals,
  fringes,
  accountGroups: allGroups,
  grandTotal,
  contingency,
  totalWithContingency: grandTotal + contingency,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Legacy aliases for compatibility
export const SAMPLE_SCHEDULING_PROJECT = sampleSchedulingProject;
export const SAMPLE_BUDGET_PROJECT = sampleBudgetProject;
