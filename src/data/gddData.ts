export type WeaponId =
  | 'penna_bic'
  | 'penna_scatto'
  | 'spillatrice'
  | 'pennarello'
  | 'colla_caldo'
  | 'taglierino'
  | 'cucchiaio'
  | 'mestolo'
  | 'righello'
  | 'forchetta'
  | 'padella'
  | 'spugna'
  | 'gomma'
  | 'molletta'
  | 'lampadina'
  | 'phon'
  | 'laser_gatto';

export type AttackAnimType =
  | 'shoot'
  | 'sniper_scope'
  | 'burst'
  | 'swing_fast'
  | 'swing_wide'
  | 'thrust'
  | 'heavy_smash'
  | 'throw_recover'
  | 'wind_stream'
  | 'laser_beam';

export interface WeaponSpec {
  id: WeaponId;
  keyLabel: string;
  slotIndex: number;
  name: string;
  category: 'Cancelleria' | 'Mischia Casa' | 'Trappola / Utility' | 'Speciale Caos';
  animType: AttackAnimType;
  damage: number; // Out of 6 HP (3 hearts)
  fireRateMs: number;
  magSize: number; // -1 for melee/infinite
  reloadTimeMs: number;
  projectileSpeed: number;
  foleyOnomatopoeia: string;
  foleyDescription: string;
  ragdollEffect: string;
  mechanicDetail: string;
  accentColor: string;
  spawnRoom: 'scrivania' | 'cucina' | 'bagno' | 'soggiorno';
  spawnPos: [number, number, number];
}

export const WEAPONS_ARSENAL: WeaponSpec[] = [
  {
    id: 'penna_bic',
    keyLabel: '1',
    slotIndex: 0,
    name: 'Penna Blu Bic (Sniper)',
    category: 'Cancelleria',
    animType: 'sniper_scope',
    damage: 5,
    fireRateMs: 850,
    magSize: 6,
    reloadTimeMs: 1400,
    projectileSpeed: 68,
    foleyOnomatopoeia: 'CLICK-FSSS!',
    foleyDescription: 'Click secco del tappo + sibilo supersonico del tubetto d\'inchiostro',
    ragdollEffect: 'Colpo di precisione che lascia una traccia nera lineare e sbalza lo stickman',
    mechanicDetail: 'Fucile di precisione: tieni premuto Tasto Destro (o Z) per mirare ATTRAVERSO il fusto trasparente esagonale della penna e sparare il tubo d\'inchiostro legato a un elastico.',
    accentColor: '#2563eb',
    spawnRoom: 'scrivania',
    spawnPos: [-14, 0.7, -12],
  },
  {
    id: 'penna_scatto',
    keyLabel: '2',
    slotIndex: 1,
    name: 'Penna a Scatto (Raffica)',
    category: 'Cancelleria',
    animType: 'burst',
    damage: 2,
    fireRateMs: 170,
    magSize: 24,
    reloadTimeMs: 1100,
    projectileSpeed: 42,
    foleyOnomatopoeia: 'CLICK-CLICK-TWANG!',
    foleyDescription: 'Mitragliata di scatti metallici a molla in rapida successione',
    ragdollEffect: 'Danza comica dello stickman colpito da una raffica di punte e stelline di carta',
    mechanicDetail: 'Ibrido tra fucile tattico e mitragliatrice leggera (l\'arma iconica impugnata nello screenshot!). Alta cadenza di fuoco e ricarica rapida con [R].',
    accentColor: '#3b82f6',
    spawnRoom: 'scrivania',
    spawnPos: [-6, 0.7, -6],
  },
  {
    id: 'spillatrice',
    keyLabel: '3',
    slotIndex: 2,
    name: 'Sparapunti / Spillatrice',
    category: 'Cancelleria',
    animType: 'shoot',
    damage: 3,
    fireRateMs: 420,
    magSize: 14,
    reloadTimeMs: 1300,
    projectileSpeed: 38,
    foleyOnomatopoeia: 'KA-CHUNK!',
    foleyDescription: 'Schiocco meccanico pesante di cucitrice industriale da ufficio',
    ragdollEffect: 'Inchioda lo stickman al muro o al pavimento per 1.5 secondi!',
    mechanicDetail: 'Spara grossi punti metallici a U: rimbalzano una volta sulle superfici dure, inchiodano i nemici per 1.5s e fanno saltare di dolore il Padrone di Casa ("YOWCH!").',
    accentColor: '#64748b',
    spawnRoom: 'scrivania',
    spawnPos: [-10, 0.7, -3],
  },
  {
    id: 'pennarello',
    keyLabel: '4',
    slotIndex: 3,
    name: 'Pennarello Indelebile (Bazooka)',
    category: 'Cancelleria',
    animType: 'shoot',
    damage: 5,
    fireRateMs: 1100,
    magSize: 4,
    reloadTimeMs: 1800,
    projectileSpeed: 26,
    foleyOnomatopoeia: 'SQUEAK-BOOM!',
    foleyDescription: 'Stridio di feltro indelebile seguito da un\'esplosione d\'inchiostro',
    ragdollEffect: 'Onda d\'urto d\'inchiostro indelebile che scaraventa in aria gli stickman',
    mechanicDetail: 'Bazooka pesante: lancia il tampone d\'inchiostro generando una grossa macchia nera indelebile sui muri e sui mobili (toglie tantissima Pazienza al Padrone di Casa!).',
    accentColor: '#1e293b',
    spawnRoom: 'scrivania',
    spawnPos: [-17, 0.7, -5],
  },
  {
    id: 'colla_caldo',
    keyLabel: '5',
    slotIndex: 4,
    name: 'Pistola Colla a Caldo',
    category: 'Cancelleria',
    animType: 'shoot',
    damage: 2,
    fireRateMs: 480,
    magSize: 12,
    reloadTimeMs: 1300,
    projectileSpeed: 28,
    foleyOnomatopoeia: 'PSSST-SQUISH!',
    foleyDescription: 'Sbuffo di vapore caldo seguito da filamento viscoso appiccicoso',
    ragdollEffect: 'Avvolge le scarpe bianche in filamenti caldi bloccando la corsa per 3s',
    mechanicDetail: 'Spara globi caldi e filanti che rallentano e incollano i piedi degli avversari a terra (chi è incollato deve premere [SPAZIO] ripetutamente per liberarsi).',
    accentColor: '#f59e0b',
    spawnRoom: 'soggiorno',
    spawnPos: [10, 0.7, 10],
  },
  {
    id: 'taglierino',
    keyLabel: '6',
    slotIndex: 5,
    name: 'Taglierino a Scatti (Shotgun)',
    category: 'Mischia Casa',
    animType: 'swing_fast',
    damage: 6,
    fireRateMs: 520,
    magSize: 8,
    reloadTimeMs: 1200,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'SNIKT-SNIKT!',
    foleyDescription: 'Doppio scatto metallico della lama segmentata + taglio netto',
    ragdollEffect: 'Mozza lo stickman a metà (busto e gambe separati + pozza d\'inchiostro)',
    mechanicDetail: 'Come un fucile a pompa a corto raggio: espelle segmenti di lama affilati che mozzano a metà i nemici vicini e squarciano i cuscini del divano facendo volare piume!',
    accentColor: '#eab308',
    spawnRoom: 'scrivania',
    spawnPos: [-4, 0.7, -12],
  },
  {
    id: 'cucchiaio',
    keyLabel: '7',
    slotIndex: 6,
    name: 'Cucchiaio di Metallo',
    category: 'Mischia Casa',
    animType: 'swing_fast',
    damage: 3,
    fireRateMs: 460,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'CLANG!',
    foleyDescription: 'Risonanza metallica squillante di posata in acciaio inox',
    ragdollEffect: 'Spinta all\'indietro netta + ammaccature disegnate a matita sui mobili',
    mechanicDetail: 'Arma da mischia sempre disponibile (anche a inizio modalità Scavenger). Veloce, affidabile, spinge indietro i nemici e lascia ammaccature sui muri.',
    accentColor: '#94a3b8',
    spawnRoom: 'cucina',
    spawnPos: [-10, 0.7, 10],
  },
  {
    id: 'mestolo',
    keyLabel: '8',
    slotIndex: 7,
    name: 'Mestolo di Legno',
    category: 'Mischia Casa',
    animType: 'swing_wide',
    damage: 4,
    fireRateMs: 720,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'TONF!',
    foleyDescription: 'Colpo sordo di legno massello su scatola di cartone',
    ragdollEffect: 'Spazzata ad arco di 160° che atterra più stickman contemporaneamente',
    mechanicDetail: 'Più lento del cucchiaio ma con un\'area di impatto ad arco vastissima: ideale per colpire gruppi di stickman o spingere la Biglia gigante.',
    accentColor: '#b45309',
    spawnRoom: 'cucina',
    spawnPos: [-15, 0.7, 13],
  },
  {
    id: 'righello',
    keyLabel: '9',
    slotIndex: 8,
    name: 'Righello 30 cm',
    category: 'Mischia Casa',
    animType: 'thrust',
    damage: 3,
    fireRateMs: 310,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'SWOOSH!',
    foleyDescription: 'Fendente aerodinamico di plastica flessibile (effetto spada laser)',
    ragdollEffect: 'Affondo preciso che lascia una riga rossa a penna sul torace del nemico!',
    mechanicDetail: 'Attacco in stoccata (affondo) rapidissimo e con allungo superiore: marchia ogni stickman colpito con un segno rosso di correzione.',
    accentColor: '#ef4444',
    spawnRoom: 'scrivania',
    spawnPos: [-2, 0.7, -5],
  },
  {
    id: 'forchetta',
    keyLabel: '0',
    slotIndex: 9,
    name: 'Forchetta Lanciabile',
    category: 'Mischia Casa',
    animType: 'throw_recover',
    damage: 6,
    fireRateMs: 550,
    magSize: 1,
    reloadTimeMs: 900,
    projectileSpeed: 46,
    foleyOnomatopoeia: 'STAB-TWANG!',
    foleyDescription: 'Infilzata metallica + vibrazione dei rebbi conficcati nel legno',
    ragdollEffect: 'Inchioda istantaneamente il bersaglio; resta conficcata finché non la recuperi!',
    mechanicDetail: 'Può essere lanciata come un giavellotto letale: dove atterra si conficca vibrando e devi passarci sopra (o premere [R]) per recuperarla!',
    accentColor: '#cbd5e1',
    spawnRoom: 'cucina',
    spawnPos: [-7, 0.7, 15],
  },
  {
    id: 'padella',
    keyLabel: 'Q',
    slotIndex: 10,
    name: 'Padella in Ghisa (Scudo)',
    category: 'Mischia Casa',
    animType: 'heavy_smash',
    damage: 6,
    fireRateMs: 1150,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'DONNNNG!',
    foleyDescription: 'Campana metallica profonda di ghisa pesante con riverbero lungo',
    ragdollEffect: 'Lancia lo stickman in orbita attraverso la stanza con hitstop di 80ms!',
    mechanicDetail: 'Mischia pesantissima. Mentre la impugni, la padella para e fa rimbalzare automaticamente il 70% dei proiettili frontali!',
    accentColor: '#334155',
    spawnRoom: 'cucina',
    spawnPos: [-13, 0.7, 7],
  },
  {
    id: 'spugna',
    keyLabel: 'V',
    slotIndex: 11,
    name: 'Spugna Assorbi-Liquidi',
    category: 'Trappola / Utility',
    animType: 'swing_wide',
    damage: 2,
    fireRateMs: 450,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 0,
    foleyOnomatopoeia: 'SQUELCH-WIPE!',
    foleyDescription: 'Spremere una spugna imbevuta d\'acqua e sapone',
    ragdollEffect: 'Colpo morbido rimbalzante + asciuga le pozze scivolose di caffè e acqua!',
    mechanicDetail: 'Usala vicino alla pozza di caffè rovesciata o all\'acqua per ASSORBIRE il liquido dal pavimento, oppure spremila contro un nemico!',
    accentColor: '#facc15',
    spawnRoom: 'bagno',
    spawnPos: [8, 0.7, -12],
  },
  {
    id: 'gomma',
    keyLabel: 'G',
    slotIndex: 12,
    name: 'Gomma da Cancellare',
    category: 'Trappola / Utility',
    animType: 'shoot',
    damage: 3,
    fireRateMs: 750,
    magSize: 6,
    reloadTimeMs: 1200,
    projectileSpeed: 25,
    foleyOnomatopoeia: 'BOING-RUB!',
    foleyDescription: 'Rimbalzo pazzo da super-ball + fruscio di cancellatura su carta',
    ragdollEffect: 'Stordisce il nemico e cancella tutti i proiettili avversari a mezz\'aria!',
    mechanicDetail: 'Rimbalza in modo imprevedibile fino a 5 volte sui mobili e cancella dalla realtà qualsiasi proiettile nemico incontri lungo la traiettoria.',
    accentColor: '#ec4899',
    spawnRoom: 'scrivania',
    spawnPos: [-9, 0.7, -9],
  },
  {
    id: 'molletta',
    keyLabel: 'T',
    slotIndex: 13,
    name: 'Molletta & Scotch (Trappola)',
    category: 'Trappola / Utility',
    animType: 'shoot',
    damage: 3,
    fireRateMs: 800,
    magSize: 5,
    reloadTimeMs: 1400,
    projectileSpeed: 18,
    foleyOnomatopoeia: 'SNAP-PINCH!',
    foleyDescription: 'Scatto secco di molla metallica che pinza una scarpa',
    ragdollEffect: 'Pinza il piede del primo nemico che ci cammina sopra bloccandolo per 3.5s!',
    mechanicDetail: 'Lanciata a terra resta armata come trappola: appena uno stickman (o il Padrone di Casa) ci passa sopra, scatta con un forte "SNAP!".',
    accentColor: '#10b981',
    spawnRoom: 'bagno',
    spawnPos: [14, 0.7, -4],
  },
  {
    id: 'lampadina',
    keyLabel: 'B',
    slotIndex: 14,
    name: 'Lampadina & Batteria AA (Flash)',
    category: 'Trappola / Utility',
    animType: 'shoot',
    damage: 4,
    fireRateMs: 950,
    magSize: 4,
    reloadTimeMs: 1500,
    projectileSpeed: 24,
    foleyOnomatopoeia: 'POP-CRACKLE!',
    foleyDescription: 'Scoppio di bulbo di vetro sottovuoto + scarica elettrica AA',
    ragdollEffect: 'Flashbang accecante di 2.5s + esplosione elettrica se tocca l\'acqua!',
    mechanicDetail: 'Granata ibrida: esplode con un "POP!" accecando chi guarda e, se cade nella Vasca da Bagno o in una pozza d\'acqua, fulmina l\'intera area!',
    accentColor: '#fde047',
    spawnRoom: 'soggiorno',
    spawnPos: [14, 0.7, 14],
  },
  {
    id: 'phon',
    keyLabel: 'F',
    slotIndex: 15,
    name: 'Phon Asciugacapelli (Vento/Elettro)',
    category: 'Speciale Caos',
    animType: 'wind_stream',
    damage: 2,
    fireRateMs: 220,
    magSize: 30,
    reloadTimeMs: 1600,
    projectileSpeed: 34,
    foleyOnomatopoeia: 'WHOOOOOSH-BZZZ!',
    foleyDescription: 'Turbina d\'aria calda continua + scarica 220V se colpisce la vasca',
    ragdollEffect: 'Spinge via stickman e fogli con linee di velocità; nella Vasca fa "BZZZ-BZZZ!"',
    mechanicDetail: 'Spara un getto di vento che fa volare via i nemici. COMBO LETALE: se spari col Phon dentro la Vasca da Bagno in cui c\'è qualcuno, fulmini tutti ("BZZZ-BZZZ!") forzando il respawn!',
    accentColor: '#06b6d4',
    spawnRoom: 'bagno',
    spawnPos: [5, 0.7, -6],
  },
  {
    id: 'laser_gatto',
    keyLabel: 'L',
    slotIndex: 16,
    name: 'Puntatore Laser & Gomitolo',
    category: 'Speciale Caos',
    animType: 'laser_beam',
    damage: 1,
    fireRateMs: 120,
    magSize: -1,
    reloadTimeMs: 0,
    projectileSpeed: 80,
    foleyOnomatopoeia: 'BEEP-MEOW!',
    foleyDescription: 'Click elettronico del diodo laser + miagolio furioso del Gatto',
    ragdollEffect: 'Attira istantaneamente il Gatto Gigante a saltare e distruggere il punto mirato!',
    mechanicDetail: 'Strumento chiave per la modalità "Cat-astrophe": punta il cerchietto rosso laser su mobili, libri o nemici per far scattare la zampata del Gatto Gigante!',
    accentColor: '#ef4444',
    spawnRoom: 'soggiorno',
    spawnPos: [5, 0.7, 5],
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
    name: 'Quadrante Nord-Ovest: Lo Studio / Scrivania',
    subtitle: 'Foglio a quadretti master, pila di libri, tazza di caffè rovesciata, Ventilatore e Lampada oscillante',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#eab308',
    landmarks: [
      {
        name: 'Bastione dei Libri Impilati & Post-It',
        role: 'High-Ground & Copertura',
        interaction: 'Funge da roccaforte per la Penna Blu Bic (Sniper); i Post-it offrono riparo accovacciandosi con [C].',
      },
      {
        name: 'Tazza di Caffè Rovesciata (Assorbibile)',
        role: 'Zona Scivolosa',
        interaction: 'Fa pattinare gli stickman ad alta velocità; può essere asciugata colpendola con la Spugna!',
      },
      {
        name: 'Ventilatore da Tavolo con Pale',
        role: 'Zona di Vento & Sballottamento',
        interaction: 'Accendendolo crea una corrente continua che spinge gli stickman, devia i fogli e spazza le piume.',
      },
    ],
    hazardEvent: {
      name: 'Oscillazione della Lampada da Tavolo',
      trigger: 'Colpire il paralume metallico sospeso',
      effect: 'La lampada dondola sopra la scrivania stordendo chi viene colpito in testa.',
    },
  },
  {
    id: 'bagno',
    name: 'Quadrante Nord-Est: Il Bagno',
    subtitle: 'Vasca con Paperelle di Gomma, Saponetta Hockey, Sciacquone del WC e Combo Elettrica Phon + Acqua',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#06b6d4',
    landmarks: [
      {
        name: 'Vasca da Bagno & Paperelle di Gomma',
        role: 'Navigazione & Elettrocuzione',
        interaction: 'Si naviga saltando sulle Paperelle ("SQUEAK!"). Se qualcuno usa il Phon o la Lampadina sulla vasca, tutti nell\'acqua fanno "BZZZ-BZZZ!" e respawnano!',
      },
      {
        name: 'Il Trono di Porcellana (WC con Sciacquone)',
        role: 'Vortice Gravitazionale',
        interaction: 'Premendo [E] si apre la tavoletta e si tira lo sciacquone: risucchia tutti gli stickman nel raggio di 14m per una Mega-Combo!',
      },
      {
        name: 'La Saponetta Scivolosa',
        role: 'Slitta & Trappola',
        interaction: 'Calpestandola si scivola via dritti come un disco da hockey sbattendo contro i mobili.',
      },
    ],
    hazardEvent: {
      name: 'COMBO: Phon nella Vasca ("BZZZ-BZZZ!") + Sciacquone WC',
      trigger: 'Sparare col Phon/Lampadina verso la vasca o premere [E] vicino al WC',
      effect: 'Scarica elettrica a fumetto su tutta la vasca da bagno o vortice d\'acqua totale nel water.',
    },
  },
  {
    id: 'cucina',
    name: 'Quadrante Sud-Ovest: La Cucina',
    subtitle: 'Tostapane lancia-fette, Pentole in acciaio, Cavatappi d\'ancoraggio, Bottiglia frangibile e Tappo di Sughero',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#f97316',
    landmarks: [
      {
        name: 'Il Tostapane a Molla (Piattaforma & Catapulta)',
        role: 'Jump-Pad & Proiettili di Pane',
        interaction: 'Saltandoci sopra scatta con un "DING!" lanciando gli stickman in alto insieme a due fette di pane tostato impazzite!',
      },
      {
        name: 'Il Tappo di Sughero (Elmo Cosmetico)',
        role: 'Equipaggiamento Speciale',
        interaction: 'Raccogliendolo in cucina lo indossi sulla testa dello stickman come un vero elmo da battaglia!',
      },
      {
        name: 'Pentole, Padella & Bottiglia d\'Acqua',
        role: 'Bunker & Pozza Conduttiva',
        interaction: 'La bottiglia se colpita fa "CRASH-SPLASH!" creando una pozza d\'acqua conduttiva.',
      },
    ],
    hazardEvent: {
      name: 'Eruzione del Tostapane',
      trigger: 'Salire sulla fessura del tostapane in cucina',
      effect: 'Catapulta verticale istantanea per raggiungere le mensole alte.',
    },
  },
  {
    id: 'soggiorno',
    name: 'Quadrante Sud-Est: Il Soggiorno',
    subtitle: 'Divano Trampolino, Aspirapolvere risucchia-tutto, Metro a Nastro, Trappola per Topi e Biglia rotolante',
    playableInDemo: true,
    scaleRatio: '1 Stickman = 4.5 cm reali',
    themeColor: '#10b981',
    landmarks: [
      {
        name: 'Il Divano Elastico (Squash & Stretch)',
        role: 'Super Trampolino',
        interaction: 'Saltando sui cuscini verdi si rimbalza altissimo ("BOING-BOING!"); tagliandoli col Taglierino volano piume bianche!',
      },
      {
        name: 'L\'Aspirapolvere Accendibile',
        role: 'Vortice d\'Aspirazione a 180°',
        interaction: 'Aspira gli stickman verso il tubo ("VRRRRR-CLUNK!") intrappolandoli per 5 secondi nel serbatoio.',
      },
      {
        name: 'Metro a Nastro, Trappola per Topi & Biglia',
        role: 'Catene Fisiche Caotiche',
        interaction: 'Il Metro a Nastro e la Trappola per Topi ("CLACK!") lanciano in orbita chi ci passa sopra; la Biglia rotola travolgendo gli stickman.',
      },
    ],
    hazardEvent: {
      name: 'Reazione a Catena del Soggiorno',
      trigger: 'Attivare Ventilatore / Biglia / Puntatore Laser del Gatto',
      effect: 'La biglia fa scattare il metro a nastro mentre il Gatto o l\'Aspirapolvere seminano il panico nella stanza.',
    },
  },
];

export const TECHNICAL_SHADERS_CODE = {
  boilingOutlineVertex: `// 1. VERTEX SHADER: Contorno "Boiling Line" a 12 FPS (Inverted Hull)
// Compatibile WebGL 1.0 (Intel GMA 3150 / eMachines EM355)
uniform float uTime;
uniform float uOutlineWidth;

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float steppedTime = floor(uTime * 12.0);
  float sketchJitter = (hash13(position + vec3(steppedTime)) - 0.5) * 0.018;
  vec3 displaced = position + normal * (uOutlineWidth + sketchJitter);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}`,

  crossHatchFragment: `// 2. FRAGMENT SHADER: Ombreggiatura a Tratteggio Incrociato (Cross-Hatching)
precision mediump float;
uniform vec3 uBaseColor;
uniform vec3 uLightDir;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  float ndl = clamp(dot(normalize(vNormal), normalize(uLightDir)), 0.0, 1.0);
  vec2 hatchUV = vUv * 42.0;
  float lineA = step(0.18, abs(fract(hatchUV.x + hatchUV.y) - 0.5));
  float lineB = step(0.18, abs(fract(hatchUV.x - hatchUV.y) - 0.5));
  float lineC = step(0.22, abs(fract(hatchUV.y * 1.5) - 0.5));
  vec3 pencilColor = uBaseColor;
  if (ndl < 0.65) pencilColor *= mix(0.72, 1.0, lineA);
  if (ndl < 0.40) pencilColor *= mix(0.55, 1.0, lineB);
  if (ndl < 0.20) pencilColor *= mix(0.35, 1.0, lineC);
  gl_FragColor = vec4(pencilColor, 1.0);
}`,

  steppedAnimationCode: `// 3. SISTEMA DI MOVIMENTO AVANZATO (SHIFT SPRINT, C CROUCH, R RELOAD)
// + BOSS FIGHTS "DOMESTIC CHAOS" (PADRONE) & "CAT-ASTROPHE" (GATTO)
export function updateStickmanMovementAndBosses(dt: number) {
  // Sprint (Shift): +55% speed, consuma Stamina verde, FOV 72 -> 78
  // Crouch (C): abbassa altezza occhi 1.68m -> 0.95m per copertura dietro Post-it
  // Reload (R): ricarica il caricatore con rotazione 3D del viewmodel
  // Boss Padrone: spazza con la Scopa, perde Pazienza se sporchi coi Pennarelli
  // Boss Gatto: insegue il Puntatore Laser rosso distruggendo libri e vasi!
}`,
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
    title: 'Core Engine "Paper-GL" & Locomozione Completa (Sprint, Salto, Accovacciamento)',
    deliverables: [
      'Setup Three.js WebGL 1.0 low-spec con shader Boiling Line a 12Hz e Cross-Hatching a matita.',
      'Locomozione FPS reattiva: Scatto (Shift) con barra stamina, Salto (Spazio), Accovacciamento (C) e Ricarica (R).',
      'Rig Stickman fedele al concept (testa nera sfumata a carboncino senza occhi bianchi, scarpe bianche con lacci, elmo Tappo di Sughero opzionale).',
    ],
    optimizationMilestone: '60 FPS fissi su eMachines EM355 (Intel Atom N455 + GMA 3150, < 8 MB VRAM).',
  },
  {
    phase: 'FASE 2',
    duration: 'Settimane 4–7',
    title: 'Le 17 Armi Domestiche, Animazioni Viewmodel & Modalità Scavenger',
    deliverables: [
      'Implementazione delle 17 armi con animazioni dedicate (mirino ottico attraverso la Penna Bic trasparente, fendente Mestolo, affondo Righello, lancio e recupero Forchetta, scudo Padella).',
      'Doppia modalità d\'equipaggiamento: Sandbox (tutte le armi subito) e Scavenger (raccogli le armi sparse nelle 4 stanze della casa).',
    ],
    optimizationMilestone: 'Zero-GC Object Pooling per proiettili, spille a terra, forchette conficcate e scie di passi a inchiostro.',
  },
  {
    phase: 'FASE 3',
    duration: 'Settimane 8–12',
    title: 'La Casa Interconnessa (4 Stanze) & Fisica Caotica a Catena',
    deliverables: [
      'Mappa continua con Studio/Scrivania, Bagno, Cucina e Soggiorno collegati da varchi.',
      'Trappole e oggetti fisici leggeri: Ventilatore, Aspirapolvere, Tostapane catapulta, Metro a Nastro, Trappola per Topi, Saponetta, Biglia e combo Phon nella Vasca ("BZZZ-BZZZ!").',
    ],
    optimizationMilestone: 'Collider primitivi AABB/Sferici puramente analitici (< 0.4ms CPU per frame).',
  },
  {
    phase: 'FASE 4',
    duration: 'Settimane 13–16',
    title: 'Boss Fight Co-op: "Domestic Chaos" (Padrone) & "Cat-astrophe" (Gatto)',
    deliverables: [
      'Modalità "The Tidy Tyrant": il Padrone di Casa gigante con Scopa e Piumino + Barra della Pazienza da svuotare sporcando i muri col Pennarello e rovesciando il caffè.',
      'Modalità "Cat-astrophe": il Gatto Gigante guidato dal Puntatore Laser e dal Gomitolo per innescare reazioni a catena distruttive.',
    ],
    optimizationMilestone: 'Sincronizzazione deterministica degli stati Boss su pacchetti WebRTC da 24 byte.',
  },
  {
    phase: 'FASE 5',
    duration: 'Settimane 17–20',
    title: 'HUD Fedele allo Screenshot, Audio Foley & Polish Finale',
    deliverables: [
      'HUD identico al concept art: strisce P1/P2 tratteggiate a matita, timer 02:14 ritagliato, box cuoricini verde/arancione e barre con pedina stickman.',
      'Bilanciamento finale e modalità Low-Spec automatica.',
    ],
    optimizationMilestone: 'Bundle < 450 KB gzipped, zero memory leaks.',
  },
];
