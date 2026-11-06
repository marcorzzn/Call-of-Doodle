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
    spawnPos: [-115, 0.9, -110],
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
    spawnPos: [-32, 0.9, -36],
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
    spawnPos: [-88, 0.9, -28],
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
    spawnPos: [-195, 0.9, -145],
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
    spawnPos: [92, 0.9, 92],
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
    spawnPos: [-52, 0.9, -90],
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
    spawnPos: [-65, 0.9, 65],
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
    spawnPos: [-135, 0.9, 110],
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
    spawnPos: [-18, 0.9, -24],
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
    spawnPos: [-85, 0.9, 165],
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
    spawnPos: [-155, 0.9, 68],
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
    spawnPos: [68, 0.9, -85],
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
    spawnPos: [-72, 0.9, -62],
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
    spawnPos: [135, 0.9, -55],
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
    spawnPos: [148, 0.9, 138],
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
    spawnPos: [48, 0.9, -45],
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
    foleyOnomatopoeia: 'BEEP-MEOW-PURRRR!',
    foleyDescription: 'Click elettronico del diodo laser + miagolio e fusa sismiche del Gatto',
    ragdollEffect: 'Attira il Gatto Gigante a saltare, fare le Fusa che fanno tremare tutta la stanza e infine schiacciare un pisolino (Cat-Nap)!',
    mechanicDetail: 'Strumento chiave per "Cat-astrophe": punta il laser sui mobili per scatenare il Gatto! Dopo gli attacchi il Gatto fa le FUSA ("PURRRR!") facendo vibrare lo schermo e tremare tutti gli oggetti vicini; al 100% della Barra del Caos si acciambella e dorme con "Zzz" e zanzare attorno alla testa!',
    accentColor: '#ef4444',
    spawnRoom: 'soggiorno',
    spawnPos: [42, 0.9, 42],
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
    name: 'Quadrante Nord-Ovest (380×380m): Lo Studio / Scrivania Colossale',
    subtitle: 'Cittadella delle Enciclopedie, Corridoio dei Libri Impilati e Condotto di Ventilazione Nord/Ovest',
    playableInDemo: true,
    scaleRatio: 'Mappa Totale 760×760m (577.600 m²)',
    themeColor: '#eab308',
    landmarks: [
      {
        name: 'Corridoi & Ponti Sospesi di Libri Impilati',
        role: 'Collegamento Tattico tra Stanze',
        interaction: 'Tunnel fiancheggiati da enciclopedie e ponti sopraelevati (raggiungibili coi Post-it elastici) che collegano direttamente Studio, Bagno e Cucina.',
      },
      {
        name: 'Condotti di Ventilazione in Lamiera (HVAC)',
        role: 'Tunnel Rapido con Turbina d\'Aria',
        interaction: 'Grandi condotti metallici ispezionabili con ventole rotanti che spingono gli stickman ad alta velocità da una stanza all\'altra.',
      },
      {
        name: 'Tazza di Caffè Rovesciata & Ventilatore Gigante',
        role: 'Zona Scivolosa & Corrente',
        interaction: 'Fa pattinare gli stickman ad alta velocità; può essere asciugata colpendola con la Spugna!',
      },
    ],
    hazardEvent: {
      name: 'Oscillazione della Lampada + Turbina Condotto HVAC',
      trigger: 'Attraversare i condotti di ventilazione o i ponti di libri',
      effect: 'Flusso d\'aria accelerato nei tunnel di lamiera per rotazioni rapide tra i 4 quadranti.',
    },
  },
  {
    id: 'bagno',
    name: 'Quadrante Nord-Est (380×380m): Il Bagno Olimpionico',
    subtitle: 'Vasca Olimpionica, Acquedotto di Porcellana, Condotto di Ventilazione Est e Galleria dei Romanzi',
    playableInDemo: true,
    scaleRatio: 'Mappa Totale 760×760m (577.600 m²)',
    themeColor: '#06b6d4',
    landmarks: [
      {
        name: 'Vasca da Bagno Olimpionica & Paperelle Giganti',
        role: 'Navigazione & Elettrocuzione',
        interaction: 'Si naviga saltando sulle Paperelle ("SQUEAK!"). Se qualcuno usa il Phon o la Lampadina sulla vasca, tutti nell\'acqua fanno "BZZZ-BZZZ!" e respawnano!',
      },
      {
        name: 'Il Trono di Porcellana (WC con Sciacquone)',
        role: 'Vortice Gravitazionale',
        interaction: 'Premendo [E] si apre la tavoletta e si tira lo sciacquone: risucchia tutti gli stickman nel raggio di 24m per una Mega-Combo!',
      },
      {
        name: 'Condotto di Ventilazione Nord & Est',
        role: 'Scorciatoia Coperta Studio ⇄ Bagno ⇄ Soggiorno',
        interaction: 'Tunnel metallico con griglie a matita e spinta aerodinamica bidirezionale.',
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
    name: 'Quadrante Sud-Ovest (380×380m): La Cucina Gigantesca',
    subtitle: 'Tostapane Catapulta, Dispensa Colossale, Corridoio dei Ricettari e Condotto HVAC Sud',
    playableInDemo: true,
    scaleRatio: 'Mappa Totale 760×760m (577.600 m²)',
    themeColor: '#f97316',
    landmarks: [
      {
        name: 'Il Tostapane a Molla (Piattaforma & Catapulta)',
        role: 'Jump-Pad & Proiettili di Pane',
        interaction: 'Saltandoci sopra scatta con un "DING!" lanciando gli stickman in alto insieme a due fette di pane tostato impazzite!',
      },
      {
        name: 'Corridoio dei Ricettari & Scatole di Cereali',
        role: 'Passaggio Coperto & Ponte Cucina ⇄ Soggiorno',
        interaction: 'Galleria fortificata fatta di enormi libri di cucina e scatole di cartone impilate che attraversa la parete divisoria Sud.',
      },
      {
        name: 'Il Tappo di Sughero (Elmo Cosmetico)',
        role: 'Equipaggiamento Speciale',
        interaction: 'Raccogliendolo in cucina lo indossi sulla testa dello stickman come un vero elmo da battaglia!',
      },
    ],
    hazardEvent: {
      name: 'Eruzione del Tostapane & Corrente del Condotto Sud',
      trigger: 'Salire sulla fessura del tostapane o imboccare il Condotto HVAC Sud',
      effect: 'Catapulta verticale istantanea per raggiungere i ponti di libri e le mensole alte.',
    },
  },
  {
    id: 'soggiorno',
    name: 'Quadrante Sud-Est (380×380m): Il Soggiorno Stadio',
    subtitle: 'Divano Trampolino da 80m, Libreria Fortezza, Aspirapolvere Turbo, Biglia e Condotti Interconnessi',
    playableInDemo: true,
    scaleRatio: 'Mappa Totale 760×760m (577.600 m²)',
    themeColor: '#10b981',
    landmarks: [
      {
        name: 'Il Divano Elastico Stadio (Squash & Stretch)',
        role: 'Super Trampolino',
        interaction: 'Saltando sui cuscini verdi si rimbalza altissimo ("BOING-BOING!"); tagliandoli col Taglierino volano piume bianche!',
      },
      {
        name: 'Galleria dei Romanzi & Condotto HVAC Est/Sud',
        role: 'Rete di Tunnel Inter-Stanza',
        interaction: 'Collega il Soggiorno al Bagno e alla Cucina tramite tunnel di ventilazione in acciaio e ponti di volumi rilegati.',
      },
      {
        name: 'Aspirapolvere, Metro a Nastro, Trappola & Biglia',
        role: 'Catene Fisiche Caotiche',
        interaction: 'Il Metro a Nastro e la Trappola per Topi ("CLACK!") lanciano in orbita chi ci passa sopra; la Biglia rotola travolgendo gli stickman.',
      },
    ],
    hazardEvent: {
      name: 'Reazione a Catena del Soggiorno + Fusa del Gatto',
      trigger: 'Attivare Puntatore Laser del Gatto / Fusa [P] / Biglia',
      effect: 'Le Fusa del Gatto fanno tremare tutti i mobili della stanza fino al Cat-Nap finale al 100% di Caos.',
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

  steppedAnimationCode: `// 3. SPATIAL HASH GRID O(1) PER MAPPA MEGA-VASTA (760m x 760m)
// + CONDOTTI DI VENTILAZIONE HVAC & CORRIDOI DI LIBRI IMPILATI
export function querySpatialHashGrid(x: number, z: number) {
  // La mappa 760x760m è suddivisa in celle da 38x38m pre-indicizzate:
  // Ogni frame testa SOLO i 3-8 collider nella cella corrente del giocatore
  // (costo CPU < 0.04ms anche su Intel Atom N455 + supporto tunnel 3D bottomY/topY).
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
    title: 'Mega-Casa 760×760m, Condotti di Ventilazione, Corridoi di Libri & Spatial Hash Grid O(1)',
    deliverables: [
      'Espansione colossale delle 4 stanze (380×380m ciascuna) interconnesse da Condotti di Ventilazione in lamiera (con spinta d\'aria) e Corridoi/Ponti di Libri Impilati.',
      'Partizionamento spaziale 2D Spatial Hash Grid (celle 38×38m) con supporto tunnel 3D (bottomY/topY) per collisioni O(1) ultra-performanti.',
    ],
    optimizationMilestone: 'Lookup Spatial Hash Grid O(1) (< 0.04ms CPU per frame con oltre 180 collider attivi).',
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
