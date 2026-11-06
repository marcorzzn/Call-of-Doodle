import * as THREE from 'three';
import { WEAPONS_ARSENAL, WeaponId } from '../data/gddData';
import {
  addOutlinedMesh,
  ColliderBox,
  createCrossHatchPastelTexture,
} from './doodleModels';

export interface WeaponPickupNode {
  weaponId: WeaponId;
  mesh: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
}

export interface BuiltArena {
  group: THREE.Group;
  colliders: ColliderBox[];
  tremblingProps: THREE.Object3D[];
  paperPickups: THREE.Mesh[];
  weaponPickups: WeaponPickupNode[];
  corkHelmetPickup: THREE.Mesh;
  rubberDucks: THREE.Group[];
  fanBladesPivot: THREE.Group;
  fanPosition: THREE.Vector3;
  lampPivot: THREE.Group;
  rollingMarble: THREE.Mesh;
  marbleVel: THREE.Vector3;
  toastSlices: THREE.Mesh[];
  coffeePuddleMesh: THREE.Mesh;
  coffeePuddleCenter: THREE.Vector3;
  coffeePuddleRadius: number;
  bathtubBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  toiletLidPivot: THREE.Group;
  flushVortexMesh: THREE.Mesh;
  toiletBowlCenter: THREE.Vector3;
  vacuumPosition: THREE.Vector3;
}

export function buildArenaMap(
  maxAnisotropy: number,
  outlineMat: THREE.Material,
  graphPaperTex: THREE.CanvasTexture
): BuiltArena {
  const group = new THREE.Group();
  const colliders: ColliderBox[] = [];
  const tremblingProps: THREE.Object3D[] = [];
  const paperPickups: THREE.Mesh[] = [];
  const weaponPickups: WeaponPickupNode[] = [];
  const rubberDucks: THREE.Group[] = [];
  const toastSlices: THREE.Mesh[] = [];

  const registerTremblingProp = (obj: THREE.Object3D) => {
    obj.userData.baseY = obj.position.y;
    obj.userData.baseRotZ = obj.rotation.z;
    obj.userData.baseRotX = obj.rotation.x;
    tremblingProps.push(obj);
  };

  // Shared Pastel Cross-Hatched Materials (matching the screenshot's colored pencil style!)
  const yellowPostItMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#fde047', maxAnisotropy),
    roughness: 0.72,
  });
  const pinkPostItMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#f9a8d4', maxAnisotropy),
    roughness: 0.72,
  });
  const greenBookMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#86efac', maxAnisotropy),
    roughness: 0.65,
  });
  const redBookMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#fca5a5', maxAnisotropy),
    roughness: 0.65,
  });
  const blueCupMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#93c5fd', maxAnisotropy),
    roughness: 0.5,
  });
  const manilaEnvelopeMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#fcd34d', maxAnisotropy),
    roughness: 0.75,
  });
  const porcelainMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#e0f2fe', maxAnisotropy),
    roughness: 0.3,
  });
  const waterMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#67e8f9', maxAnisotropy),
    roughness: 0.2,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#d6a87c', maxAnisotropy),
    roughness: 0.75,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#cbd5e1', maxAnisotropy),
    roughness: 0.35,
    metalness: 0.55,
  });
  const whitePagesMat = new THREE.MeshStandardMaterial({
    color: 0xfefce8,
    roughness: 0.8,
  });

  // Scale graph paper repeat so squares stay crisp across the colossal 300m x 300m arena!
  graphPaperTex.repeat.set(95, 95);
  graphPaperTex.needsUpdate = true;

  // Colossal Wooden Desk / House Floor Slab (340m x 340m)
  const outerFloor = new THREE.Mesh(new THREE.BoxGeometry(340, 2.0, 340), woodMat);
  outerFloor.position.set(0, -1.04, 0);
  outerFloor.receiveShadow = true;
  group.add(outerFloor);

  // Colossal Sketchbook Paper Sheet covering the 4-Room Mega-House (300m x 300m -> 150m x 150m per room!)
  const paperSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({
      map: graphPaperTex,
      roughness: 0.85,
      metalness: 0.02,
    })
  );
  paperSheet.rotation.x = -Math.PI / 2;
  paperSheet.receiveShadow = true;
  group.add(paperSheet);

  // Room Divider Cardboard Walls with Wide Monumental Doorways connecting the 4 colossal rooms
  const wallMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#f3e8d2', maxAnisotropy),
    roughness: 0.8,
  });
  const buildWallSegment = (x: number, z: number, w: number, h: number, d: number, label: string) => {
    addOutlinedMesh(group, new THREE.BoxGeometry(w, h, d), wallMat, outlineMat, [x, h / 2, z]);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      topY: h,
      label,
    });
  };

  // North-South Divider Walls (with wide central & mid-room doorways across the 300m span)
  buildWallSegment(0, -105, 1.8, 16.0, 72, 'Parete Divisoria Nord-Est/Ovest');
  buildWallSegment(0, -34, 1.8, 16.0, 34, 'Parete Divisoria Centro-Nord');
  buildWallSegment(0, 34, 1.8, 16.0, 34, 'Parete Divisoria Centro-Sud');
  buildWallSegment(0, 105, 1.8, 16.0, 72, 'Parete Divisoria Sud-Est/Ovest');

  // West-East Divider Walls (with wide central & mid-room doorways across the 300m span)
  buildWallSegment(-105, 0, 72, 16.0, 1.8, 'Parete Divisoria Ovest');
  buildWallSegment(-34, 0, 34, 16.0, 1.8, 'Parete Divisoria Centro-Ovest');
  buildWallSegment(34, 0, 34, 16.0, 1.8, 'Parete Divisoria Centro-Est');
  buildWallSegment(105, 0, 72, 16.0, 1.8, 'Parete Divisoria Est');

  const addBookBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    coverMat: THREE.Material,
    label: string,
    extraFlags: Partial<ColliderBox> = {}
  ) => {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, y, z);
    addOutlinedMesh(
      bookGroup,
      new THREE.BoxGeometry(w, h, d),
      coverMat,
      outlineMat,
      [0, h / 2, 0]
    );
    addOutlinedMesh(
      bookGroup,
      new THREE.BoxGeometry(w * 0.94, h * 0.78, d * 0.94),
      whitePagesMat,
      outlineMat,
      [0.12, h / 2, 0]
    );
    group.add(bookGroup);
    registerTremblingProp(bookGroup);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      topY: y + h,
      label,
      ...extraFlags,
    });
    return bookGroup;
  };

  const addPencilCupTower = (x: number, z: number, radius: number, height: number) => {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(x, 0, z);
    addOutlinedMesh(
      cupGroup,
      new THREE.CylinderGeometry(radius, radius * 0.92, height, 14),
      blueCupMat,
      outlineMat,
      [0, height / 2, 0]
    );
    // Giant colored pencils sticking out of the cup (just like the reference screenshot!)
    const pencilMats = [yellowPostItMat, pinkPostItMat, greenBookMat, redBookMat];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.3;
      addOutlinedMesh(
        cupGroup,
        new THREE.CylinderGeometry(radius * 0.16, radius * 0.16, height * 1.45, 8),
        pencilMats[i],
        outlineMat,
        [Math.cos(angle) * radius * 0.42, height * 0.95, Math.sin(angle) * radius * 0.42],
        [(i % 2 === 0 ? 1 : -1) * 0.14, 0, (i < 2 ? 1 : -1) * 0.12]
      );
    }
    group.add(cupGroup);
    registerTremblingProp(cupGroup);
    colliders.push({
      minX: x - radius,
      maxX: x + radius,
      minZ: z - radius,
      maxZ: z + radius,
      topY: height,
      label: 'Portamatite Gigante',
    });
  };

  // ============================================================================
  // STANZA 1 (NORD-OVEST: x in [-145, 0], z in [-145, 0]): LO STUDIO COLOSSALE
  // ============================================================================
  // 1A. Foreground Screenshot Cluster (near spawn so Title Screen & initial spawn match the screenshot!)
  addBookBlock(-20, 0, -20, 12.0, 2.0, 9.0, blueCupMat, 'Dizionario Blu');
  addBookBlock(-20.4, 2.0, -20.2, 11.0, 2.0, 8.2, redBookMat, 'Atlante Rosso');
  addBookBlock(-19.8, 4.0, -19.8, 10.2, 1.8, 7.6, greenBookMat, 'Quaderno Verde');

  addBookBlock(-22.5, 0, -9.5, 8.4, 1.8, 7.0, greenBookMat, 'Manuale Verde');
  addBookBlock(-22.2, 1.8, -9.5, 7.4, 1.6, 6.2, pinkPostItMat, 'Diario Rosa');

  addBookBlock(-10.5, 0, -12.5, 4.6, 1.3, 4.6, greenBookMat, 'Post-It Base');
  addBookBlock(-10.4, 1.3, -12.5, 4.3, 1.3, 4.3, pinkPostItMat, 'Post-It Rosa');
  addBookBlock(-10.3, 2.6, -12.4, 4.0, 1.3, 4.0, yellowPostItMat, 'Post-It Giallo');
  addBookBlock(-10.5, 0, -5.5, 3.8, 1.2, 3.8, yellowPostItMat, 'Blocco Note');

  addBookBlock(-7.5, 0, -26.5, 14.0, 5.8, 2.8, manilaEnvelopeMat, 'Busta Gialla Gigante');
  addPencilCupTower(-13.5, -24.5, 2.1, 4.8);
  addPencilCupTower(3.5, -14.5, 2.0, 4.5);

  // 1B. Colossal Outer Studio Citadel (extending all the way to -135m!)
  addBookBlock(-68, 0, -64, 28.0, 4.5, 22.0, blueCupMat, 'Enciclopedia Universale T1');
  addBookBlock(-68, 4.5, -64, 25.0, 4.5, 19.5, redBookMat, 'Enciclopedia Universale T2');
  addBookBlock(-68, 9.0, -64, 22.0, 4.2, 17.0, greenBookMat, 'Vetta dello Studio (Sniper Nest)');

  // Staircase of Giant Post-its leading up to the Encyclopedia Fortress
  addBookBlock(-44, 0, -52, 9.0, 2.5, 9.0, yellowPostItMat, 'Gradino Post-It 1', { isBouncePad: true });
  addBookBlock(-53, 2.5, -58, 9.0, 3.0, 9.0, pinkPostItMat, 'Gradino Post-It 2', { isBouncePad: true });

  // Colossal Manila Folder Canyon & Giant Spiral Notebook Ramp in Deep North-West (-115m)
  addBookBlock(-108, 0, -96, 34.0, 14.0, 5.5, manilaEnvelopeMat, 'Archivio Buste Giganti');
  addBookBlock(-95, 0, -45, 24.0, 3.5, 18.0, greenBookMat, 'Quaderno ad Anelli Colosso');
  addBookBlock(-95, 3.5, -45, 21.0, 3.5, 15.5, yellowPostItMat, 'Blocco Appunti Superiore');
  addBookBlock(-42, 0, -108, 26.0, 5.0, 18.0, redBookMat, 'Vocabolario Monumentale');
  addPencilCupTower(-84, -82, 4.5, 11.5);
  addPencilCupTower(-35, -82, 4.2, 10.5);

  // Overturned Coffee Mug + Absorbable Coffee Puddle
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-7.8, 1.15, -2.0);
  mugGroup.rotation.set(0.2, 0.6, Math.PI / 2.15);
  addOutlinedMesh(
    mugGroup,
    new THREE.CylinderGeometry(1.2, 1.05, 2.6, 14),
    whitePagesMat,
    outlineMat
  );
  addOutlinedMesh(
    mugGroup,
    new THREE.TorusGeometry(0.7, 0.18, 8, 14),
    whitePagesMat,
    outlineMat,
    [1.05, 0, 0]
  );
  group.add(mugGroup);
  registerTremblingProp(mugGroup);

  const coffeePuddleCenter = new THREE.Vector3(-5.5, 0, -1.5);
  const coffeePuddleMesh = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 24),
    new THREE.MeshStandardMaterial({
      color: 0x3b1d0b,
      roughness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  coffeePuddleMesh.rotation.x = -Math.PI / 2;
  coffeePuddleMesh.position.set(coffeePuddleCenter.x, 0.02, coffeePuddleCenter.z);
  group.add(coffeePuddleMesh);

  // Colossal Desk Fan ("Il Ventilatore da Tavolo con le pale")
  const fanPosition = new THREE.Vector3(-52, 0, -28);
  const fanGroup = new THREE.Group();
  fanGroup.position.copy(fanPosition);
  addOutlinedMesh(
    fanGroup,
    new THREE.CylinderGeometry(2.8, 3.6, 5.5, 14),
    steelMat,
    outlineMat,
    [0, 2.75, 0]
  );
  const fanBladesPivot = new THREE.Group();
  fanBladesPivot.position.set(1.2, 6.4, 0);
  for (let b = 0; b < 3; b++) {
    addOutlinedMesh(
      fanBladesPivot,
      new THREE.BoxGeometry(0.35, 5.2, 1.1),
      steelMat,
      outlineMat,
      [0, 0, 0],
      [(b * Math.PI * 2) / 3, 0, 0]
    );
  }
  fanGroup.add(fanBladesPivot);
  group.add(fanGroup);
  registerTremblingProp(fanGroup);

  // Colossal Swinging Desk Lamp ("Il Lampadario / Lampada")
  const lampPivot = new THREE.Group();
  lampPivot.position.set(-38, 22.0, -38);
  addOutlinedMesh(
    lampPivot,
    new THREE.CylinderGeometry(0.22, 0.22, 10.5, 8),
    steelMat,
    outlineMat,
    [0, -5.25, 0]
  );
  addOutlinedMesh(
    lampPivot,
    new THREE.ConeGeometry(4.2, 3.0, 16),
    yellowPostItMat,
    outlineMat,
    [0, -10.8, 0]
  );
  group.add(lampPivot);

  // ============================================================================
  // STANZA 2 (NORD-EST: x in [0, 145], z in [-145, 0]): IL BAGNO OLIMPIONICO
  // ============================================================================
  // Olympic-Sized Bathtub (52m long x 26m wide!)
  const bathtubBounds = { minX: 46, maxX: 74, minZ: -98, maxZ: -44 };
  addBookBlock(60, 0, -71, 28.0, 3.8, 54.0, porcelainMat, 'Vasca da Bagno Olimpionica');
  const bathWater = new THREE.Mesh(new THREE.PlaneGeometry(24.5, 50.0), waterMat);
  bathWater.rotation.x = -Math.PI / 2;
  bathWater.position.set(60, 3.86, -71);
  group.add(bathWater);

  // 6 Giant Rubber Ducks floating inside the Olympic Bathtub
  const duckCoords: [number, number][] = [
    [54, -90],
    [66, -82],
    [54, -74],
    [66, -66],
    [54, -58],
    [66, -50],
  ];
  duckCoords.forEach(([dx, dz]) => {
    const duck = new THREE.Group();
    duck.position.set(dx, 3.95, dz);
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(2.2, 12, 10),
      yellowPostItMat,
      outlineMat,
      [0, 0.8, 0],
      [0, 0, 0],
      [1.1, 0.75, 1.35]
    );
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(1.3, 10, 10),
      yellowPostItMat,
      outlineMat,
      [0, 2.4, 1.35]
    );
    addOutlinedMesh(
      duck,
      new THREE.ConeGeometry(0.55, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xf97316 }),
      outlineMat,
      [0, 2.3, 2.6],
      [Math.PI / 2, 0, 0]
    );
    group.add(duck);
    rubberDucks.push(duck);
    registerTremblingProp(duck);
    colliders.push({
      minX: dx - 2.6,
      maxX: dx + 2.6,
      minZ: dz - 2.8,
      maxZ: dz + 2.8,
      topY: 6.2,
      label: 'Paperella di Gomma Gigante (SQUEAK!)',
      isBouncePad: true,
      isDuck: true,
    });
  });

  // Colossal Interactive WC Throne in Il Bagno
  const toiletBowlCenter = new THREE.Vector3(28, 0, -82);
  addBookBlock(
    toiletBowlCenter.x,
    0,
    toiletBowlCenter.z,
    16.0,
    5.4,
    16.0,
    porcelainMat,
    'Trono di Porcellana (WC Gigante)'
  );
  addBookBlock(
    toiletBowlCenter.x,
    5.4,
    toiletBowlCenter.z - 5.8,
    15.0,
    8.5,
    5.5,
    porcelainMat,
    'Cassetta Sciacquone [Premi E]'
  );

  const toiletLidPivot = new THREE.Group();
  toiletLidPivot.position.set(toiletBowlCenter.x, 5.5, toiletBowlCenter.z - 3.0);
  addOutlinedMesh(
    toiletLidPivot,
    new THREE.CylinderGeometry(6.5, 6.5, 0.55, 18),
    whitePagesMat,
    outlineMat,
    [0, 0.28, 4.8]
  );
  group.add(toiletLidPivot);

  const flushVortexMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(6.2, 1.0, 4.2, 18, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true })
  );
  flushVortexMesh.position.set(toiletBowlCenter.x, 5.8, toiletBowlCenter.z + 1.5);
  flushVortexMesh.visible = false;
  group.add(flushVortexMesh);

  // Additional Bathroom Landmarks: Giant Sink Vanity, Stacked Towel Towers & Slippery Soap Bars
  addBookBlock(98, 0, -68, 22.0, 7.5, 36.0, porcelainMat, 'Lavabo Monumentale');
  addBookBlock(98, 7.5, -68, 16.0, 2.2, 26.0, blueCupMat, 'Specchiera Orizzontale');
  addBookBlock(32, 0, -34, 14.0, 3.2, 14.0, pinkPostItMat, 'Pila Asciugamani Rosa', {
    isBouncePad: true,
  });
  addBookBlock(24, 0, -22, 6.2, 1.2, 4.0, pinkPostItMat, 'Saponetta Scivolosa 1 (SWISH!)', {
    isSoap: true,
  });
  addBookBlock(48, 0, -26, 6.2, 1.2, 4.0, yellowPostItMat, 'Saponetta Scivolosa 2 (SWISH!)', {
    isSoap: true,
  });

  // ============================================================================
  // STANZA 3 (SUD-OVEST: x in [-145, 0], z in [0, 145]): LA CUCINA GIGANTESCA
  // ============================================================================
  // Colossal Spring Toaster ("Il Tostapane Catapulta")
  addBookBlock(-55, 0, 58, 15.0, 7.2, 10.5, steelMat, 'Tostapane Catapulta (Salta sopra!)', {
    isBouncePad: true,
    isToaster: true,
  });
  for (let s = 0; s < 2; s++) {
    const toast = addOutlinedMesh(
      group,
      new THREE.BoxGeometry(5.2, 5.2, 0.9),
      woodMat,
      outlineMat,
      [-55, 8.0, 56.2 + s * 3.4]
    );
    toastSlices.push(toast);
  }

  // Towering Kitchen Island, Steel Pots, Giant Cutting Board & Cereal Box Towers
  addBookBlock(-32, 0, 36, 16.0, 5.5, 16.0, steelMat, 'Pentolone in Acciaio Inox');
  addBookBlock(-78, 0, 32, 24.0, 2.2, 16.0, woodMat, 'Tagliere da Macellaio');
  addBookBlock(-96, 0, 78, 28.0, 9.5, 42.0, woodMat, 'Isola Centrale della Cucina');
  addBookBlock(-96, 9.5, 78, 20.0, 5.0, 24.0, yellowPostItMat, 'Scatola di Cereali Colosso');
  addBookBlock(-45, 0, 98, 26.0, 6.5, 18.0, redBookMat, 'Vassoio Lasagne Gigante');

  // Collectible Cork Helmet ("Il Tappo di Sughero") in the Kitchen
  const corkHelmetPickup = addOutlinedMesh(
    group,
    new THREE.CylinderGeometry(1.4, 1.1, 2.0, 14),
    woodMat,
    outlineMat,
    [-38, 1.2, 52]
  );
  registerTremblingProp(corkHelmetPickup);

  // ============================================================================
  // STANZA 4 (SUD-EST: x in [0, 145], z in [0, 145]): IL SOGGIORNO STADIO
  // ============================================================================
  // Stadium-Sized Trampoline Couch ("Il Divano Elastico")
  addBookBlock(68, 0, 72, 42.0, 5.5, 20.0, greenBookMat, 'Divano Trampolino Gigante (BOING!)', {
    isBouncePad: true,
  });
  addBookBlock(68, 5.5, 80.5, 42.0, 7.5, 4.5, greenBookMat, 'Schienale Divano Stadio');
  addBookBlock(45, 5.5, 72, 5.0, 4.2, 20.0, greenBookMat, 'Bracciolo Ovest', {
    isBouncePad: true,
  });
  addBookBlock(91, 5.5, 72, 5.0, 4.2, 20.0, greenBookMat, 'Bracciolo Est', {
    isBouncePad: true,
  });

  // Living Room Coffee Table, Bookshelf Citadel & Cushions
  addBookBlock(68, 0, 42, 26.0, 3.8, 14.0, woodMat, 'Tavolino da Salotto');
  addBookBlock(108, 0, 58, 18.0, 12.0, 38.0, redBookMat, 'Libreria del Soggiorno');
  addBookBlock(32, 0, 88, 14.0, 2.6, 14.0, pinkPostItMat, 'Pouf Cuscino Morbido', {
    isBouncePad: true,
  });

  // Spring Tape Measure ("Il Metro a Nastro a Molla")
  addBookBlock(28, 0, 44, 6.2, 3.2, 6.2, yellowPostItMat, 'Metro a Nastro (ZIIIP!)', {
    isBouncePad: true,
    isTapeTrap: true,
  });

  // Mouse Trap ("La Trappola per Topi")
  addBookBlock(18, 0, 22, 7.2, 0.85, 4.6, woodMat, 'Trappola per Topi (CLACK!)', {
    isBouncePad: true,
    isMouseTrap: true,
  });

  // Colossal Vacuum Cleaner ("L'Aspirapolvere")
  const vacuumPosition = new THREE.Vector3(44, 0, 26);
  addBookBlock(
    vacuumPosition.x,
    0,
    vacuumPosition.z,
    9.5,
    5.4,
    7.2,
    redBookMat,
    'Aspirapolvere Turbo'
  );

  // Giant Rolling Glass Marble ("La Biglia")
  const rollingMarble = addOutlinedMesh(
    group,
    new THREE.SphereGeometry(2.8, 18, 16),
    blueCupMat,
    outlineMat,
    [34.0, 2.8, 54.0]
  );
  const marbleVel = new THREE.Vector3(11.5, 0, -8.8);

  // Spawn 16 Paper Ammo Pickups across the colossal 300m x 300m House
  const paperGeo = new THREE.DodecahedronGeometry(0.85, 0);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const pickupCoords: [number, number][] = [
    [-12, -16],
    [-38, -32],
    [-75, -48],
    [-52, -88],
    [24, -24],
    [48, -36],
    [82, -55],
    [35, -95],
    [-25, 28],
    [-48, 48],
    [-82, 62],
    [-38, 88],
    [25, 25],
    [52, 38],
    [84, 52],
    [48, 95],
  ];
  pickupCoords.forEach(([px, pz]) => {
    const pMesh = addOutlinedMesh(group, paperGeo, paperMat, outlineMat, [px, 0.9, pz]);
    registerTremblingProp(pMesh);
    paperPickups.push(pMesh);
  });

  // Spawn Collectible Weapon Nodes for Scavenger Mode ("Trova le armi nella casa")
  WEAPONS_ARSENAL.forEach((w) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(w.spawnPos[0], w.spawnPos[1], w.spawnPos[2]);

    // Floating Sketch Crate / Pedestal
    addOutlinedMesh(
      nodeGroup,
      new THREE.BoxGeometry(1.8, 1.1, 1.8),
      new THREE.MeshStandardMaterial({ color: w.accentColor, roughness: 0.4 }),
      outlineMat
    );
    group.add(nodeGroup);
    registerTremblingProp(nodeGroup);
    weaponPickups.push({
      weaponId: w.id,
      mesh: nodeGroup,
      position: nodeGroup.position,
      collected: false,
    });
  });

  return {
    group,
    colliders,
    tremblingProps,
    paperPickups,
    weaponPickups,
    corkHelmetPickup,
    rubberDucks,
    fanBladesPivot,
    fanPosition,
    lampPivot,
    rollingMarble,
    marbleVel,
    toastSlices,
    coffeePuddleMesh,
    coffeePuddleCenter,
    coffeePuddleRadius: 4.6,
    bathtubBounds,
    toiletLidPivot,
    flushVortexMesh,
    toiletBowlCenter,
    vacuumPosition,
  };
}
