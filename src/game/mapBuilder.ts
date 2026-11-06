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
  const paperPickups: THREE.Mesh[] = [];
  const weaponPickups: WeaponPickupNode[] = [];
  const rubberDucks: THREE.Group[] = [];
  const toastSlices: THREE.Mesh[] = [];

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

  // Outer Wooden Desk / House Floor Slab (72x72m)
  const outerFloor = new THREE.Mesh(new THREE.BoxGeometry(72, 1.2, 72), woodMat);
  outerFloor.position.set(0, -0.64, 0);
  outerFloor.receiveShadow = true;
  group.add(outerFloor);

  // Main Sketchbook Paper Sheet covering the whole 4-Room House (60x60m)
  const paperSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({
      map: graphPaperTex,
      roughness: 0.85,
      metalness: 0.02,
    })
  );
  paperSheet.rotation.x = -Math.PI / 2;
  paperSheet.receiveShadow = true;
  group.add(paperSheet);

  // Room Divider Cardboard Walls with Wide Open Doorways connecting the 4 rooms
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

  // North-South Divider Wall (with wide doorway gaps)
  buildWallSegment(0, -21, 0.7, 5.2, 14, 'Parete Divisoria Nord');
  buildWallSegment(0, 21, 0.7, 5.2, 14, 'Parete Divisoria Sud');
  // West-East Divider Wall (with wide doorway gaps)
  buildWallSegment(-21, 0, 14, 5.2, 0.7, 'Parete Divisoria Ovest');
  buildWallSegment(21, 0, 14, 5.2, 0.7, 'Parete Divisoria Est');

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
      [0.08, h / 2, 0]
    );
    group.add(bookGroup);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      topY: y + h,
      label,
      ...extraFlags,
    });
  };

  // ============================================================================
  // STANZA 1 (NORD-OVEST: x < 0, z < 0): LO STUDIO / LA SCRIVANIA (SCREENSHOT!)
  // ============================================================================
  addBookBlock(-18, 0, -18, 9.0, 1.5, 6.8, blueCupMat, 'Dizionario Blu');
  addBookBlock(-18.3, 1.5, -18.2, 8.4, 1.5, 6.2, redBookMat, 'Atlante Rosso');
  addBookBlock(-17.8, 3.0, -17.8, 7.8, 1.4, 5.8, greenBookMat, 'Quaderno Verde');

  addBookBlock(-19.5, 0, -8.5, 6.2, 1.3, 5.2, greenBookMat, 'Manuale Verde');
  addBookBlock(-19.2, 1.3, -8.5, 5.4, 1.2, 4.6, pinkPostItMat, 'Diario Rosa');

  // Post-It Stacks in the Studio
  addBookBlock(-9.5, 0, -11.5, 3.6, 1.0, 3.6, greenBookMat, 'Post-It Base');
  addBookBlock(-9.4, 1.0, -11.5, 3.4, 1.0, 3.4, pinkPostItMat, 'Post-It Rosa');
  addBookBlock(-9.3, 2.0, -11.4, 3.3, 1.0, 3.3, yellowPostItMat, 'Post-It Giallo');
  addBookBlock(-9.5, 0, -5.2, 3.0, 1.0, 3.0, yellowPostItMat, 'Blocco Note');

  // Giant Manila Envelope
  addBookBlock(-6.5, 0, -22.5, 10.0, 4.0, 2.0, manilaEnvelopeMat, 'Busta Gialla Gigante');

  // Overturned Coffee Mug + Absorbable Coffee Puddle
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-7.5, 0.95, -2.0);
  mugGroup.rotation.set(0.2, 0.6, Math.PI / 2.15);
  addOutlinedMesh(
    mugGroup,
    new THREE.CylinderGeometry(1.0, 0.9, 2.2, 14),
    whitePagesMat,
    outlineMat
  );
  addOutlinedMesh(
    mugGroup,
    new THREE.TorusGeometry(0.6, 0.15, 8, 14),
    whitePagesMat,
    outlineMat,
    [0.9, 0, 0]
  );
  group.add(mugGroup);

  const coffeePuddleCenter = new THREE.Vector3(-5.5, 0, -1.5);
  const coffeePuddleMesh = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 20),
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

  // Desk Fan ("Il Ventilatore da Tavolo con le pale")
  const fanPosition = new THREE.Vector3(-22, 0, -14);
  const fanGroup = new THREE.Group();
  fanGroup.position.copy(fanPosition);
  addOutlinedMesh(
    fanGroup,
    new THREE.CylinderGeometry(1.2, 1.5, 2.2, 12),
    steelMat,
    outlineMat,
    [0, 1.1, 0]
  );
  const fanBladesPivot = new THREE.Group();
  fanBladesPivot.position.set(0.5, 2.6, 0);
  for (let b = 0; b < 3; b++) {
    addOutlinedMesh(
      fanBladesPivot,
      new THREE.BoxGeometry(0.15, 1.9, 0.45),
      steelMat,
      outlineMat,
      [0, 0, 0],
      [(b * Math.PI * 2) / 3, 0, 0]
    );
  }
  fanGroup.add(fanBladesPivot);
  group.add(fanGroup);

  // Swinging Desk Lamp ("Il Lampadario / Lampada")
  const lampPivot = new THREE.Group();
  lampPivot.position.set(-10, 8.5, -10);
  addOutlinedMesh(
    lampPivot,
    new THREE.CylinderGeometry(0.08, 0.08, 4.5, 8),
    steelMat,
    outlineMat,
    [0, -2.25, 0]
  );
  addOutlinedMesh(
    lampPivot,
    new THREE.ConeGeometry(1.6, 1.2, 14),
    yellowPostItMat,
    outlineMat,
    [0, -4.6, 0]
  );
  group.add(lampPivot);

  // ============================================================================
  // STANZA 2 (NORD-EST: x > 0, z < 0): IL BAGNO (VASCA, PAPERELLE, WC & SAPONETTA)
  // ============================================================================
  const bathtubBounds = { minX: 11, maxX: 20, minZ: -21, maxZ: -5 };
  addBookBlock(15.5, 0, -13, 9.0, 1.4, 16.0, porcelainMat, 'Vasca da Bagno');
  const bathWater = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 14.8), waterMat);
  bathWater.rotation.x = -Math.PI / 2;
  bathWater.position.set(15.5, 1.44, -13);
  group.add(bathWater);

  const duckCoords: [number, number][] = [
    [15.5, -17.5],
    [15.5, -13],
    [15.5, -8.5],
  ];
  duckCoords.forEach(([dx, dz]) => {
    const duck = new THREE.Group();
    duck.position.set(dx, 1.55, dz);
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(1.05, 12, 10),
      yellowPostItMat,
      outlineMat,
      [0, 0.4, 0],
      [0, 0, 0],
      [1.1, 0.75, 1.35]
    );
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(0.62, 10, 10),
      yellowPostItMat,
      outlineMat,
      [0, 1.2, 0.65]
    );
    addOutlinedMesh(
      duck,
      new THREE.ConeGeometry(0.26, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xf97316 }),
      outlineMat,
      [0, 1.15, 1.3],
      [Math.PI / 2, 0, 0]
    );
    group.add(duck);
    rubberDucks.push(duck);
    colliders.push({
      minX: dx - 1.3,
      maxX: dx + 1.3,
      minZ: dz - 1.4,
      maxZ: dz + 1.4,
      topY: 2.7,
      label: 'Paperella di Gomma (SQUEAK!)',
      isBouncePad: true,
      isDuck: true,
    });
  });

  // Giant Interactive WC in Il Bagno
  const toiletBowlCenter = new THREE.Vector3(6.5, 0, -19.5);
  addBookBlock(toiletBowlCenter.x, 0, toiletBowlCenter.z, 6.4, 2.3, 6.4, porcelainMat, 'Tazza del WC');
  addBookBlock(
    toiletBowlCenter.x,
    2.3,
    toiletBowlCenter.z - 2.3,
    6.0,
    3.4,
    2.2,
    porcelainMat,
    'Cassetta Sciacquone [Premi E]'
  );

  const toiletLidPivot = new THREE.Group();
  toiletLidPivot.position.set(toiletBowlCenter.x, 2.35, toiletBowlCenter.z - 1.2);
  addOutlinedMesh(
    toiletLidPivot,
    new THREE.CylinderGeometry(2.6, 2.6, 0.26, 16),
    whitePagesMat,
    outlineMat,
    [0, 0.13, 2.0]
  );
  group.add(toiletLidPivot);

  const flushVortexMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 0.4, 1.8, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true })
  );
  flushVortexMesh.position.set(toiletBowlCenter.x, 2.5, toiletBowlCenter.z + 0.7);
  flushVortexMesh.visible = false;
  group.add(flushVortexMesh);

  // Slippery Soap Bar ("La Saponetta")
  addBookBlock(7.5, 0, -7.5, 2.2, 0.55, 1.4, pinkPostItMat, 'Saponetta Scivolosa (SWISH!)', {
    isSoap: true,
  });

  // ============================================================================
  // STANZA 3 (SUD-OVEST: x < 0, z > 0): LA CUCINA (TOSTAPANE, PENTOLE, TAPPO)
  // ============================================================================
  // Giant Spring Toaster ("Il Tostapane")
  addBookBlock(-15, 0, 14, 5.2, 2.8, 3.6, steelMat, 'Tostapane Catapulta (Salta sopra!)', {
    isBouncePad: true,
    isToaster: true,
  });
  for (let s = 0; s < 2; s++) {
    const toast = addOutlinedMesh(
      group,
      new THREE.BoxGeometry(1.8, 1.8, 0.35),
      woodMat,
      outlineMat,
      [-15, 3.1, 13.5 + s * 1.0]
    );
    toastSlices.push(toast);
  }

  // Overturned Steel Pot & Kitchen Cutting Board
  addBookBlock(-8, 0, 9, 5.5, 2.2, 5.5, steelMat, 'Pentola in Acciaio');
  addBookBlock(-17, 0, 6, 6.5, 0.8, 4.5, woodMat, 'Tagliere in Legno');

  // Collectible Cork Helmet ("Il Tappo di Sughero") in the Kitchen
  const corkHelmetPickup = addOutlinedMesh(
    group,
    new THREE.CylinderGeometry(0.65, 0.52, 0.9, 12),
    woodMat,
    outlineMat,
    [-11.5, 0.65, 16.5]
  );

  // ============================================================================
  // STANZA 4 (SUD-EST: x > 0, z > 0): IL SOGGIORNO (DIVANO, ASPIRAPOLVERE, BIGLIA)
  // ============================================================================
  // Giant Trampoline Couch ("Il Divano Elastico")
  addBookBlock(15, 0, 15, 11.0, 2.2, 5.6, greenBookMat, 'Divano Trampolino (BOING!)', {
    isBouncePad: true,
  });
  addBookBlock(15, 2.2, 17.2, 11.0, 2.6, 1.4, greenBookMat, 'Schienale Divano');

  // Spring Tape Measure ("Il Metro a Nastro a Molla")
  addBookBlock(6.5, 0, 11.5, 2.2, 1.2, 2.2, yellowPostItMat, 'Metro a Nastro (ZIIIP!)', {
    isBouncePad: true,
    isTapeTrap: true,
  });

  // Mouse Trap ("La Trappola per Topi")
  addBookBlock(4.5, 0, 4.5, 2.6, 0.35, 1.6, woodMat, 'Trappola per Topi (CLACK!)', {
    isBouncePad: true,
    isMouseTrap: true,
  });

  // Vacuum Cleaner ("L'Aspirapolvere")
  const vacuumPosition = new THREE.Vector3(11.5, 0, 6.5);
  addBookBlock(vacuumPosition.x, 0, vacuumPosition.z, 3.4, 2.0, 2.6, redBookMat, 'Aspirapolvere');

  // Rolling Glass Marble ("La Biglia")
  const rollingMarble = addOutlinedMesh(
    group,
    new THREE.SphereGeometry(1.15, 16, 14),
    blueCupMat,
    outlineMat,
    [8.0, 1.15, 13.0]
  );
  const marbleVel = new THREE.Vector3(3.8, 0, -2.9);

  // Spawn Paper Pickups across the House
  const paperGeo = new THREE.DodecahedronGeometry(0.45, 0);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const pickupCoords: [number, number][] = [
    [-6, -8],
    [8, -5],
    [-12, 11],
    [9, 10],
    [0, 0],
    [-14, -14],
  ];
  pickupCoords.forEach(([px, pz]) => {
    const pMesh = addOutlinedMesh(group, paperGeo, paperMat, outlineMat, [px, 0.5, pz]);
    paperPickups.push(pMesh);
  });

  // Spawn Collectible Weapon Nodes for Scavenger Mode ("Trova le armi nella casa")
  WEAPONS_ARSENAL.forEach((w) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(w.spawnPos[0], w.spawnPos[1], w.spawnPos[2]);

    // Floating Sketch Crate / Pedestal
    addOutlinedMesh(
      nodeGroup,
      new THREE.BoxGeometry(0.95, 0.55, 0.95),
      new THREE.MeshStandardMaterial({ color: w.accentColor, roughness: 0.4 }),
      outlineMat
    );
    group.add(nodeGroup);
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
    coffeePuddleRadius: 3.4,
    bathtubBounds,
    toiletLidPivot,
    flushVortexMesh,
    toiletBowlCenter,
    vacuumPosition,
  };
}
