export type WeaponId =
  | 'penna'
  | 'taglierino'
  | 'colla'
  | 'cucchiaio'
  | 'bianchetto'
  | 'forbici'
  | 'elastici'
  | 'cerbottana'
  | 'gomma';

export interface WeaponSpec {
  id: WeaponId;
  keyNum: number;
  name: string;
  category: 'Assalto' | 'Mischia' | 'Crowd Control' | 'Sniper' | 'Tattica';
  damage: number; // In half-hearts (player/bot has 6 half-hearts = 3 full hearts)
  fireRateMs: number;
  ammoMax: number; // -1 for infinite melee
  projectileSpeed: number;
  foleyOnomatopoeia: string;
  foleyDescription: string;
  ragdollEffect: string;
  mechanicDetail: string;
  accentColor: string;
}

export const WEAPONS_ARSENAL: WeaponSpec[] = [
  {
    id: 'penna',
    keyNum: 1,
    name: 'Penna Bic Balistica',
    category: 'Assalto',
    damage: 2,
    fireRateMs: 280,
    ammoMax: 24,
    projectileSpeed: 36,
    foleyOnomatopoeia: 'CLICK-TWANG!',
    foleyDescription: 'Scatto metallico della molla + schiocco secco di elastico teso',
    ragdollEffect: 'Spinta all\'indietro sul torace con spruzzo di stelline di carta colorate',
    mechanicDetail: 'Arma d\'ordinanza vista nel concept: fusto di penna a sfera armato con elastico giallo che spara graffette metalliche e punte d\'inchiostro.',
    accentColor: '#3b82f6',
  },
  {
    id: 'taglierino',
    keyNum: 2,
    name: 'Taglierino a Scatto',
    category: 'Mischia',
    damage: 6,
    fireRateMs: 520,
    ammoMax: -1,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'CLACK-ZIIIP!',
    foleyDescription: 'Scatto metallico della lama segmentata + taglio netto di cartoncino spesso',
    ragdollEffect: 'Smembramento a 2 pezzi: busto e gambe si separano lasciando una pozza d\'inchiostro nero',
    mechanicDetail: 'Arma letale ravvicinata. Colpendo lo stickman lo mozza istantaneamente a metà sul piano orizzontale; le gambe con le scarpe bianche corrono a vuoto per 1s.',
    accentColor: '#eab308',
  },
  {
    id: 'colla',
    keyNum: 3,
    name: 'Tubetto di Colla',
    category: 'Crowd Control',
    damage: 1,
    fireRateMs: 600,
    ammoMax: 12,
    projectileSpeed: 24,
    foleyOnomatopoeia: 'SQUISH-PLOP!',
    foleyDescription: 'Spremere un flacone semivuoto di colla vinilica densa e appiccicosa',
    ragdollEffect: 'Incolla le scarpe da ginnastica al foglio a quadretti per 3.0 secondi',
    mechanicDetail: 'Spara sbuffi bianchi appiccicosi. Il bersaglio colpito resta inchiodato a terra per 3 secondi (in multiplayer deve fare button-mashing di SPAZIO per liberarsi prima).',
    accentColor: '#f59e0b',
  },
  {
    id: 'cucchiaio',
    keyNum: 4,
    name: 'Cucchiaio di Metallo',
    category: 'Mischia',
    damage: 4,
    fireRateMs: 650,
    ammoMax: -1,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'CLANGGGG!',
    foleyDescription: 'Impatto di cucchiaio d\'acciaio inox contro una pentola vuota con riverbero',
    ragdollEffect: 'Knockback violento a catapulta + ammaccature disegnate a matita sui muri',
    mechanicDetail: 'Mischia pesante ad ampio arco. Scaraventa via gli avversari (ottimo per buttarli giù dalla scrivania o nel WC) e incide decalcomanie di crepe sui libri.',
    accentColor: '#94a3b8',
  },
  {
    id: 'bianchetto',
    keyNum: 5,
    name: 'Bianchetto (Fluid)',
    category: 'Crowd Control',
    damage: 2,
    fireRateMs: 700,
    ammoMax: 10,
    projectileSpeed: 26,
    foleyOnomatopoeia: 'SQUASH-POP!',
    foleyDescription: 'Pallina agitatrice interna ("Clack-Clack") seguita da uno schizzo denso',
    ragdollEffect: 'Accecamento totale (schermo imbiancato a pennello) per 2.0 secondi',
    mechanicDetail: 'Spara una sfera densa di liquido correttore. Se colpisce la testa dell\'avversario, gli dipinge di bianco l\'HUD coprendo l\'intera visuale per 2 secondi.',
    accentColor: '#ec4899',
  },
  {
    id: 'forbici',
    keyNum: 6,
    name: 'Forbici da Ufficio',
    category: 'Mischia',
    damage: 6,
    fireRateMs: 480,
    ammoMax: -1,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'SNIP-SNIP!',
    foleyDescription: 'Doppio taglio metallico affilato di lame d\'acciaio su carta',
    ragdollEffect: 'Decapitazione comica: la testa sferica nera rotola e rimbalza via come una palla',
    mechanicDetail: 'Attacco rapido in affondo. Mirando alla parte superiore dello stickman recide il collo: la testa rotola con fisica sferica autonoma sul tavolo.',
    accentColor: '#ef4444',
  },
  {
    id: 'elastici',
    keyNum: 7,
    name: 'Fionda di Elastici',
    category: 'Assalto',
    damage: 2,
    fireRateMs: 340,
    ammoMax: 18,
    projectileSpeed: 32,
    foleyOnomatopoeia: 'BOING-TWANG!',
    foleyDescription: 'Vibrazione armonica di gomma tesa che aumenta di pitch ad ogni rimbalzo',
    ragdollEffect: 'Avvolge gli arti dello stickman facendolo inciampare su se stesso',
    mechanicDetail: 'Rimbalza su tutte le superfici rigide (libri, tazze, piastrelle) fino a 4 volte. Ogni rimbalzo emette un "BOING!" più acuto e incrementa il danno del +25%.',
    accentColor: '#10b981',
  },
  {
    id: 'cerbottana',
    keyNum: 8,
    name: 'Cerbottana + Carta',
    category: 'Sniper',
    damage: 5,
    fireRateMs: 900,
    ammoMax: 5,
    projectileSpeed: 54,
    foleyOnomatopoeia: 'FUUUMP-THWACK!',
    foleyDescription: 'Soffio d\'aria compressa in cannuccia di plastica + impatto bagnato',
    ragdollEffect: 'Colpo di precisione ad alta velocità che inchioda la testa all\'indietro',
    mechanicDetail: 'Cannuccia rigata silenziosa e letale. Munizioni limitatissime: per ricaricare bisogna passare sopra i foglietti di carta sparsi nella mappa.',
    accentColor: '#06b6d4',
  },
  {
    id: 'gomma',
    keyNum: 9,
    name: 'Gomma da Cancellare',
    category: 'Tattica',
    damage: 3,
    fireRateMs: 850,
    ammoMax: 6,
    projectileSpeed: 22,
    foleyOnomatopoeia: 'THUD-RUB-SHHH!',
    foleyDescription: 'Rimbalzo sordo di caucciù pesante + fruscio di cancellatura su carta',
    ragdollEffect: 'Cancellazione parziale dello stickman (dissolvenza a trucioli di gomma)',
    mechanicDetail: 'Lanciata come granata pesante rimbalzante. Mentre vola, il suo campo d\'attrito CANCELLA fisicamente tutti i proiettili nemici a mezz\'aria!',
    accentColor: '#8b5cf6',
  },
];

export interface MapBlueprint {
  id: 'scrivania' | 'bagno' | 'cucina' | 'soggiorno';
  name: string;
  subtitle: string;
  playableInDemo: boolean;
  scaleRatio: string;
  themeColor: string;
  landmarks: { name: string; role: string; interaction: string }[];
  hazardEvent: { name: string; trigger: string; effect: string };
}

export const MAPS_BLUEPRINTS: MapBlueprint[] = [
  {
    id: 'scrivania',
    name: '01. La Scrivania (Mappa Iconica)',
    subtitle: 'Foglio a quadretti centrale circondato da cancelleria gigante e tazza di caffè rovesciata',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#eab308',
    landmarks: [
      {
        name: 'Bastione dei Libri Impilati (Verde/Rosso/Blu)',
        role: 'High-Ground & Scalinata',
        interaction: 'Funge da fortezza multi-livello per la Cerbottana; le copertine rigide fanno rimbalzare gli Elastici.',
      },
      {
        name: 'Torri di Post-It Gialli e Rosa',
        role: 'Copertura Distruttibile a Strati',
        interaction: 'I colpi di Taglierino o Forbici sfogliano via i Post-it superiori riducendo l\'altezza del riparo.',
      },
      {
        name: 'Tazza di Caffè Rovesciata',
        role: 'Zona Hazard Scivolosa + Tunnel',
        interaction: 'La pozza di caffè marrone riduce l\'attrito dell\'80% (pattinaggio ad alta velocità) ma macchia le scarpe bianche lasciando impronte tracciabili.',
      },
      {
        name: 'Portapenne Metallici Cilindrici',
        role: 'Torri Verticali & Rifornimento',
        interaction: 'Scalabili tramite righelli appoggiati; colpiti col Cucchiaio risuonano stordendo chi si nasconde dentro.',
      },
    ],
    hazardEvent: {
      name: 'Raffica del Ventilatore da Tavolo',
      trigger: 'Colpire il tasto ON del mini-ventilatore USB a bordo scrivania',
      effect: 'Vento laterale per 8 secondi che devia i proiettili leggeri (Palle di carta, Elastici) e fa volare foglietti bonus per ricaricare la Cerbottana.',
    },
  },
  {
    id: 'bagno',
    name: '02. Il Bagno (Zona Caos & Vortice)',
    subtitle: 'Piastrelle disegnate a pennarello, vasca navigabile su paperelle e la Mega-Combo dello Sciacquone',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 5.0 cm reali',
    themeColor: '#06b6d4',
    landmarks: [
      {
        name: 'La Vasca delle Paperelle di Gomma',
        role: 'Navigazione Acquatica & Piattaforme Mobili',
        interaction: 'Tre paperelle gialle galleggiano sull\'acqua disegnata: salendoci sopra fanno "SQUEAK!" e trasportano il giocatore da un bordo all\'altro.',
      },
      {
        name: 'Il Trono di Porcellana (WC Interattivo)',
        role: 'Obiettivo Centrale & Trappola Mortale',
        interaction: 'La tavoletta può essere aperta/chiusa. Chi sale sulla cassetta superiore e tira la catena attiva lo Sciacquone.',
      },
      {
        name: 'Rotolo di Carta Igienica & Spazzolini',
        role: 'Ponti Sospesi & Coperture Morbide',
        interaction: 'La carta igienica assorbe gli schizzi di Bianchetto e Colla senza farli rimbalzare.',
      },
      {
        name: 'Tubetto di Dentifricio Gigante',
        role: 'Trappola a Pressione',
        interaction: 'Saltando sulla pancia del tubetto col Cucchiaio, spara dal tappo un getto di pasta verde menta che incolla e spinge chi passa davanti.',
      },
    ],
    hazardEvent: {
      name: 'MEGA-COMBO: Tavoletta Aperta + Tirare lo Sciacquone!',
      trigger: 'Premere [E] o colpire la leva cromata dello sciacquone sul retro del WC',
      effect: 'La tavoletta si spalanca e si genera un vortice d\'acqua a spirale per 5 secondi: tutti gli stickman nel raggio di 14 metri vengono risucchiati nello scarico assegnando una Combo Multi-Kill a chi l\'ha attivato!',
    },
  },
  {
    id: 'cucina',
    name: '03. La Cucina (Acustica & Rimbalzi)',
    subtitle: 'Piano cottura gigante, pentole in acciaio fonoassorbenti, taglieri in legno e spugne elastiche',
    playableInDemo: false,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#f97316',
    landmarks: [
      {
        name: 'Pentole Rovesciate in Acciaio Inox',
        role: 'Bunker Acustico & Scudo Balistico',
        interaction: 'Entrando sotto una pentola tramite il beccuccio, il Web Audio applica un filtro Low-Pass a 350Hz (suoni ovattati) e gli elastici rimbalzano fuori.',
      },
      {
        name: 'Spugne Abrasive Giallo-Verdi',
        role: 'Jump-Pad Naturali',
        interaction: 'Il lato giallo morbido lancia gli stickman fino in cima al frigorifero; il lato verde ruvido rallenta la corsa del 40%.',
      },
      {
        name: 'Tagliere con Posate Giganti',
        role: 'Passerelle & Deflettori Metallici',
        interaction: 'Le lame dei coltelli da cucina fungono da specchi balistici per rimbalzi angolati millimetrici.',
      },
    ],
    hazardEvent: {
      name: 'Eruzione del Tostapane',
      trigger: 'Timer ciclico ogni 60 secondi (ticchettio metallico crescente)',
      effect: 'Due fette di pane tostato schizzano verso il soffitto lanciando in aria chiunque si trovi sopra le fessure.',
    },
  },
  {
    id: 'soggiorno',
    name: '04. Il Soggiorno (Trincee & Telecomando)',
    subtitle: 'Cuscini del divano fonoassorbenti, canyon tra i braccioli, telecomando interattivo e tappeto elastico',
    playableInDemo: false,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#10b981',
    landmarks: [
      {
        name: 'Fortezza dei Cuscini del Divano',
        role: 'Copertura Assorbente (Zero-Ricochet)',
        interaction: 'I tessuti imbottiti assorbono completamente proiettili di Penna, Elastici e Gomme da Cancellare neutralizzando i rimbalzi.',
      },
      {
        name: 'Telecomando Gigante a 24 Tasti',
        role: 'Piattaforma a Pulsanti Attivi',
        interaction: 'Calpestare il tasto MUTE silenzia l\'audio di tutti i giocatori per 4 secondi; il tasto CH+ cambia l\'illuminazione della stanza.',
      },
      {
        name: 'Riviste Arrotolate & Tappeto Elastico',
        role: 'Tunnel di Fiancheggiamento & Rotazione Rapida',
        interaction: 'Permette di attraversare il centro scoperto senza esporsi ai cecchini con Cerbottana.',
      },
    ],
    hazardEvent: {
      name: 'Passaggio dell\'Aspirapolvere Robot',
      trigger: 'Attivazione dal tasto ROSSO sul telecomando',
      effect: 'Un disco aspirante pattuglia il pavimento: spazza via le pozze di colla/inchiostro e risucchia chi resta a livello zero.',
    },
  },
];

export const TECHNICAL_SHADERS_CODE = {
  boilingOutlineVertex: `// 1. VERTEX SHADER: Contorno "Boiling Line" a 12 FPS (Inverted Hull)
// Compatibile WebGL 1.0 (Intel GMA 3150 / eMachines EM355)
// Zero Post-Processing: usa 1 draw call aggiuntivo con BackSide culling
uniform float uTime;
uniform float uOutlineWidth; // es. 0.035

// Hash deterministico ultra-leggero (zero texture lookup)
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  // Quantizza il tempo a 12 frame al secondo per l'effetto "disegnato a mano"
  float steppedTime = floor(uTime * 12.0);
  
  // Calcola un jitter pseudo-casuale per ogni vertice a 12Hz
  float sketchJitter = (hash13(position + vec3(steppedTime)) - 0.5) * 0.018;
  
  // Espande il vertice lungo la normale con spessore irregolare a matita
  vec3 displaced = position + normal * (uOutlineWidth + sketchJitter);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}`,

  crossHatchFragment: `// 2. FRAGMENT SHADER: Ombreggiatura a Tratteggio Incrociato (Cross-Hatching)
// Sostituisce completamente le ShadowMap hardware pesanti
precision mediump float;

uniform vec3 uBaseColor;     // Colore pastello piatto
uniform vec3 uLightDir;      // Direzione luce principale normalizzata
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  // Calcolo Lambertiano super-economico
  float ndl = clamp(dot(normalize(vNormal), normalize(uLightDir)), 0.0, 1.0);
  
  // Coordinate di tratteggio scalate sulla geometria
  vec2 hatchUV = vUv * 42.0;
  
  // Linee diagonali a 45° e -45° generate analiticamente (zero texture RAM!)
  float lineA = step(0.18, abs(fract(hatchUV.x + hatchUV.y) - 0.5));
  float lineB = step(0.18, abs(fract(hatchUV.x - hatchUV.y) - 0.5));
  float lineC = step(0.22, abs(fract(hatchUV.y * 1.5) - 0.5));
  
  vec3 pencilColor = uBaseColor;
  
  // 3 fasce discrete di ombra a matita (Grafite #1c1917)
  if (ndl < 0.65) pencilColor *= mix(0.72, 1.0, lineA);
  if (ndl < 0.40) pencilColor *= mix(0.55, 1.0, lineB);
  if (ndl < 0.20) pencilColor *= mix(0.35, 1.0, lineC);
  
  gl_FragColor = vec4(pencilColor, 1.0);
}`,

  steppedAnimationCode: `// 3. QUANTIZZATORE ANIMAZIONI STICKMAN A 12 FPS & RAGDOLL POOLING
// Evita qualsiasi allocazione sul Garbage Collector (Zero-GC Loop)
const STEP_FPS = 12;

export function updateStickmanSteppedPose(
  actor: StickmanRig,
  elapsedTime: number,
  isMoving: boolean
): void {
  // 1. Discretizza il clock globale a step di 83.3ms (12 FPS)
  const quantizedT = Math.floor(elapsedTime * STEP_FPS) / STEP_FPS;
  
  // 2. Ciclo di corsa scattoso "Flipbook"
  const swing = isMoving ? Math.sin(quantizedT * 14.0) * 0.75 : 0;
  actor.leftLeg.rotation.x = swing;
  actor.rightLeg.rotation.x = -swing;
  actor.leftArm.rotation.x = -swing * 0.8;
  actor.rightArm.rotation.x = swing * 0.8;
  
  // 3. Le scarpe bianche mantengono il pivot parallelo al foglio
  actor.leftShoe.rotation.x = -swing * 0.35;
  actor.rightShoe.rotation.x = swing * 0.35;
}`
};

export interface RoadmapPhase {
  phase: string;
  duration: string;
  title: string;
  deliverables: string[];
  optimizationMilestone: string;
}

export const SOLO_DEV_ROADMAP: RoadmapPhase[] = [
  {
    phase: 'FASE 1',
    duration: 'Settimane 1–3',
    title: 'Core Engine "Paper-GL" & Locomozione Stickman 12 FPS',
    deliverables: [
      'Setup Three.js / WebGL 1.0 con disattivazione automatica di MSAA, ShadowMap hardware e Post-Processing su GPU integrate.',
      'Implementazione dello shader Inverted-Hull "Boiling Line" a 12Hz e del materiale Cross-Hatching analitico senza texture.',
      'Controller FPS snello con fisica AABB/Cilindrica custom (zero motori fisici pesanti come Ammo.js/Havok) e animazione procedurale scattosa a 12 FPS.',
      'Rig dello Stickman a 10 parti con testa sferica, occhi bianchi vuoti e scarpe da ginnastica bianche con lacci disegnati.',
    ],
    optimizationMilestone: '60 FPS fissi su Intel Atom N455 / GMA 3150 a risoluzione 1024x600 (< 8 MB VRAM allocata).',
  },
  {
    phase: 'FASE 2',
    duration: 'Settimane 4–7',
    title: 'Arsenale di Cancelleria, Smembramento Ragdoll & Sintetizzatore Foley',
    deliverables: [
      'Implementazione delle 9 armi con comportamenti balistici distinti (rimbalzo elastici, cancellazione proiettili a mezz\'aria della Gomma, munizioni di carta per Cerbottana).',
      'Sistema di smembramento istantaneo pooled: taglio a metà del Taglierino (busto + gambe indipendenti + decal inchiostro) e decapitazione con le Forbici.',
      'Stati alterati: blocco a terra per 3s con Tubetto di Colla (con minigame button-mashing SPAZIO) e accecamento HUD con Bianchetto.',
      'Motore audio procedurale Web Audio API per suoni fisici ("CLANG!", "SQUISH!", "SNIP!", "BOING!") senza file MP3 esterni.',
    ],
    optimizationMilestone: 'Object Pooling pre-allocato per 64 proiettili, 32 decalcomanie d\'inchiostro e 16 arti smembrati (Zero Garbage Collection pauses).',
  },
  {
    phase: 'FASE 3',
    duration: 'Settimane 8–12',
    title: 'Level Design Microscopico & Interazioni Ambientali (Le 4 Stanze)',
    deliverables: [
      'Costruzione low-poly de La Scrivania (libri scalabili, pozza di caffè scivolosa, Post-it distruttibili) e Il Bagno (vasca con paperelle di gomma navigabili).',
      'Scripting della Mega-Combo "Tavoletta + Sciacquone del WC": attrattore gravitazionale a spirale che risucchia tutti gli stickman nella tazza.',
      'Costruzione de La Cucina (pentole con filtro acustico Low-Pass, spugne trampolino) e Il Soggiorno (cuscini assorbi-proiettili, telecomando interattivo).',
      'Merging statico delle geometrie di scenario per mantenere le draw call totali sotto quota 35.',
    ],
    optimizationMilestone: 'Static Batching per colore/materiale e Frustum Culling aggressivo; < 14.500 triangoli totali per mappa.',
  },
  {
    phase: 'FASE 4',
    duration: 'Settimane 13–16',
    title: 'Bot AI Tattici & Architettura Multiplayer LAN / WebRTC Ultra-Light',
    deliverables: [
      'Macchina a stati finiti (FSM) per i Bot in Singleplayer: navigazione su waypoint, raccolta fogli di carta, uso di coperture e attivazione dello sciacquone.',
      'Netcode binario su WebSockets / WebRTC DataChannels a 20Hz con pacchetti da 18 byte (posizione quantizzata Int16, angoli Uint8, bitmask azioni).',
      'Client-side prediction per il movimento e lag compensation leggera per i colpi di Cerbottana e Forbici.',
    ],
    optimizationMilestone: 'Consumo banda < 12 KB/s per giocatore; giocabile in LAN scolastica/ufficio o browser P2P senza server dedicati costosi.',
  },
  {
    phase: 'FASE 5',
    duration: 'Settimane 17–20',
    title: 'HUD "Pennarello su Quaderno", Polish & Stress-Test Legacy',
    deliverables: [
      'Interfaccia HUD disegnata a mano: cuoricini rossi sbarrati da una X nera al danno, contatore munizioni e timer in box fumetto, overlay grana della carta.',
      'Modalità "Notebook Low-Spec" automatica per netbook con 1GB di RAM (disabilita particellari secondari e riduce la risoluzione interna a 0.75x).',
      'Bilanciamento finale TTK, feedback hitstop (60ms sul Cucchiaio) e pacchettizzazione PWA offline.',
    ],
    optimizationMilestone: 'Cold-boot in meno di 1.8 secondi, bundle complessivo < 450 KB gzipped, zero memory leaks su sessioni di 2 ore.',
  },
];
