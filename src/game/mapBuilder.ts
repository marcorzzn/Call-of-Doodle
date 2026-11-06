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

export interface VentDuctZone {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  axis: 'x' | 'z';
}

export interface BuiltArena {
  group: THREE.Group;
  colliders: ColliderBox[];
  queryNearbyColliders: (x: number, z: number) => ColliderBox[];
  ventDuctZones: VentDuctZone[];
  ductFanPivots: THREE.Group[];
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
  const ventDuctZones: VentDuctZone[] = [];
  const ductFanPivots: THREE.Group[] = [];
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
  const ductDarkSteelMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#94a3b8', maxAnisotropy),
    roughness: 0.4,
    metalness: 0.6,
  });
  const whitePagesMat = new THREE.MeshStandardMaterial({
    color: 0xfefce8,
    roughness: 0.8,
  });

  // Scale graph paper repeat so squares stay crisp across the mega-vast 760m x 760m arena!
  graphPaperTex.repeat.set(220, 220);
  graphPaperTex.needsUpdate = true;

  // Mega-Vast Wooden Desk / House Floor Slab (840m x 840m)
  const outerFloor = new THREE.Mesh(new THREE.BoxGeometry(840, 2.4, 840), woodMat);
  outerFloor.position.set(0, -1.24, 0);
  outerFloor.receiveShadow = true;
  group.add(outerFloor);

  // Mega-Vast Sketchbook Paper Sheet covering the 4-Room Mega-House (760m x 760m -> 380m x 380m per room!)
  const paperSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(760, 760),
    new THREE.MeshStandardMaterial({
      map: graphPaperTex,
      roughness: 0.85,
      metalness: 0.02,
    })
  );
  paperSheet.rotation.x = -Math.PI / 2;
  paperSheet.receiveShadow = true;
  group.add(paperSheet);

  // Room Divider Cardboard Walls with Wide Doorways + Passages for Book Corridors (±92m) and HVAC Ducts (±185m)
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
      bottomY: 0,
      topY: h,
      label,
    });
  };

  // North-South Divider Wall segments along X = 0 (leaving openings at Z=0, Z=±92 for Book Corridors, Z=±185 for HVAC Ducts, Z=±280)
  buildWallSegment(0, -45, 2.2, 18.0, 56, 'Parete Divisoria Nord-1');
  buildWallSegment(0, -138, 2.2, 18.0, 62, 'Parete Divisoria Nord-2');
  buildWallSegment(0, -240, 2.2, 18.0, 76, 'Parete Divisoria Nord-3');
  buildWallSegment(0, -335, 2.2, 18.0, 70, 'Parete Divisoria Nord-Esterna');

  buildWallSegment(0, 45, 2.2, 18.0, 56, 'Parete Divisoria Sud-1');
  buildWallSegment(0, 138, 2.2, 18.0, 62, 'Parete Divisoria Sud-2');
  buildWallSegment(0, 240, 2.2, 18.0, 76, 'Parete Divisoria Sud-3');
  buildWallSegment(0, 335, 2.2, 18.0, 70, 'Parete Divisoria Sud-Esterna');

  // West-East Divider Wall segments along Z = 0 (leaving openings at X=0, X=±92 for Book Corridors, X=±185 for HVAC Ducts, X=±280)
  buildWallSegment(-45, 0, 56, 18.0, 2.2, 'Parete Divisoria Ovest-1');
  buildWallSegment(-138, 0, 62, 18.0, 2.2, 'Parete Divisoria Ovest-2');
  buildWallSegment(-240, 0, 76, 18.0, 2.2, 'Parete Divisoria Ovest-3');
  buildWallSegment(-335, 0, 70, 18.0, 2.2, 'Parete Divisoria Ovest-Esterna');

  buildWallSegment(45, 0, 56, 18.0, 2.2, 'Parete Divisoria Est-1');
  buildWallSegment(138, 0, 62, 18.0, 2.2, 'Parete Divisoria Est-2');
  buildWallSegment(240, 0, 76, 18.0, 2.2, 'Parete Divisoria Est-3');
  buildWallSegment(335, 0, 70, 18.0, 2.2, 'Parete Divisoria Est-Esterna');

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
      bottomY: y,
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
      bottomY: 0,
      topY: height,
      label: 'Portamatite Gigante',
    });
  };

  // ============================================================================
  // NUOVI PERCORSI DI COLLEGAMENTO TRA LE 4 STANZE:
  // A) 4 CONDOTTI DI VENTILAZIONE IN LAMIERA (HVAC AIR DUCT TUNNELS)
  // B) 4 CORRIDOI & PONTI SOSPESI DI LIBRI IMPILATI (STACKED BOOK CORRIDORS)
  // ============================================================================
  const buildVentilationDuctTunnel = (
    id: string,
    name: string,
    centerX: number,
    centerZ: number,
    length: number,
    axis: 'x' | 'z'
  ) => {
    const ductWidth = 15.0; // Wide interior so players and bots can sprint through!
    const wallThick = 1.2;
    const ductHeight = 7.4;
    const roofThick = 1.1;

    const ductGroup = new THREE.Group();
    ductGroup.position.set(centerX, 0, centerZ);
    group.add(ductGroup);

    const spanX = axis === 'x' ? length : ductWidth;
    const spanZ = axis === 'z' ? length : ductWidth;

    // Galvanized Steel Floor Plate inside the Ventilation Duct
    addOutlinedMesh(
      ductGroup,
      new THREE.BoxGeometry(spanX, 0.25, spanZ),
      ductDarkSteelMat,
      outlineMat,
      [0, 0.125, 0]
    );

    if (axis === 'x') {
      // Side walls along X
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(length, ductHeight, wallThick),
        steelMat,
        outlineMat,
        [0, ductHeight / 2, -ductWidth / 2]
      );
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(length, ductHeight, wallThick),
        steelMat,
        outlineMat,
        [0, ductHeight / 2, ductWidth / 2]
      );
      colliders.push({
        minX: centerX - length / 2,
        maxX: centerX + length / 2,
        minZ: centerZ - ductWidth / 2 - wallThick / 2,
        maxZ: centerZ - ductWidth / 2 + wallThick / 2,
        bottomY: 0,
        topY: ductHeight,
        label: `${name} (Parete Nord)`,
        isVentDuct: true,
      });
      colliders.push({
        minX: centerX - length / 2,
        maxX: centerX + length / 2,
        minZ: centerZ + ductWidth / 2 - wallThick / 2,
        maxZ: centerZ + ductWidth / 2 + wallThick / 2,
        bottomY: 0,
        topY: ductHeight,
        label: `${name} (Parete Sud)`,
        isVentDuct: true,
      });

      // Overhead Duct Roof Slab (walkable on top AND hollow underneath via bottomY!)
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(length, roofThick, ductWidth + wallThick * 2),
        steelMat,
        outlineMat,
        [0, ductHeight + roofThick / 2, 0]
      );
      colliders.push({
        minX: centerX - length / 2,
        maxX: centerX + length / 2,
        minZ: centerZ - ductWidth / 2 - wallThick,
        maxZ: centerZ + ductWidth / 2 + wallThick,
        bottomY: ductHeight - 0.2,
        topY: ductHeight + roofThick,
        label: `${name} (Tetto Condotto)`,
        isVentDuct: true,
      });

      // 3 Internal Spinning Ventilation Turbine Fans along the duct
      [-length * 0.35, 0, length * 0.35].forEach((offsetX) => {
        const fanPivot = new THREE.Group();
        fanPivot.position.set(offsetX, ductHeight - 1.5, 0);
        for (let b = 0; b < 4; b++) {
          addOutlinedMesh(
            fanPivot,
            new THREE.BoxGeometry(0.25, 2.2, 0.55),
            yellowPostItMat,
            outlineMat,
            [0, 0, 0],
            [(b * Math.PI) / 2, 0, 0]
          );
        }
        ductGroup.add(fanPivot);
        ductFanPivots.push(fanPivot);
      });
    } else {
      // Side walls along Z
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(wallThick, ductHeight, length),
        steelMat,
        outlineMat,
        [-ductWidth / 2, ductHeight / 2, 0]
      );
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(wallThick, ductHeight, length),
        steelMat,
        outlineMat,
        [ductWidth / 2, ductHeight / 2, 0]
      );
      colliders.push({
        minX: centerX - ductWidth / 2 - wallThick / 2,
        maxX: centerX - ductWidth / 2 + wallThick / 2,
        minZ: centerZ - length / 2,
        maxZ: centerZ + length / 2,
        bottomY: 0,
        topY: ductHeight,
        label: `${name} (Parete Ovest)`,
        isVentDuct: true,
      });
      colliders.push({
        minX: centerX + ductWidth / 2 - wallThick / 2,
        maxX: centerX + ductWidth / 2 + wallThick / 2,
        minZ: centerZ - length / 2,
        maxZ: centerZ + length / 2,
        bottomY: 0,
        topY: ductHeight,
        label: `${name} (Parete Est)`,
        isVentDuct: true,
      });

      // Overhead Duct Roof Slab
      addOutlinedMesh(
        ductGroup,
        new THREE.BoxGeometry(ductWidth + wallThick * 2, roofThick, length),
        steelMat,
        outlineMat,
        [0, ductHeight + roofThick / 2, 0]
      );
      colliders.push({
        minX: centerX - ductWidth / 2 - wallThick,
        maxX: centerX + ductWidth / 2 + wallThick,
        minZ: centerZ - length / 2,
        maxZ: centerZ + length / 2,
        bottomY: ductHeight - 0.2,
        topY: ductHeight + roofThick,
        label: `${name} (Tetto Condotto)`,
        isVentDuct: true,
      });

      // 3 Internal Spinning Ventilation Turbine Fans along the Z duct
      [-length * 0.35, 0, length * 0.35].forEach((offsetZ) => {
        const fanPivot = new THREE.Group();
        fanPivot.position.set(0, ductHeight - 1.5, offsetZ);
        fanPivot.rotation.y = Math.PI / 2;
        for (let b = 0; b < 4; b++) {
          addOutlinedMesh(
            fanPivot,
            new THREE.BoxGeometry(0.25, 2.2, 0.55),
            yellowPostItMat,
            outlineMat,
            [0, 0, 0],
            [(b * Math.PI) / 2, 0, 0]
          );
        }
        ductGroup.add(fanPivot);
        ductFanPivots.push(fanPivot);
      });
    }

    ventDuctZones.push({
      id,
      name,
      minX: centerX - spanX / 2,
      maxX: centerX + spanX / 2,
      minZ: centerZ - spanZ / 2,
      maxZ: centerZ + spanZ / 2,
      axis,
    });
  };

  // Build the 4 Inter-Room Ventilation Duct Tunnels (HVAC)
  buildVentilationDuctTunnel(
    'duct_north',
    'Condotto di Ventilazione Nord (Studio ⇄ Bagno)',
    0,
    -185,
    170,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_south',
    'Condotto di Ventilazione Sud (Cucina ⇄ Soggiorno)',
    0,
    185,
    170,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_west',
    'Condotto di Ventilazione Ovest (Studio ⇄ Cucina)',
    -185,
    0,
    170,
    'z'
  );
  buildVentilationDuctTunnel(
    'duct_east',
    'Condotto di Ventilazione Est (Bagno ⇄ Soggiorno)',
    185,
    0,
    170,
    'z'
  );

  // Helper to build Stacked Book Corridors & Skybridges ("Corridoi fatti di Libri Impilati")
  const buildStackedBookCorridor = (
    name: string,
    centerX: number,
    centerZ: number,
    length: number,
    axis: 'x' | 'z'
  ) => {
    const corridorGap = 15.0; // Wide passage between stacked book walls
    const bookWallWidth = 8.5;
    const bookMats = [blueCupMat, redBookMat, greenBookMat, pinkPostItMat, yellowPostItMat];
    const segments = 5;
    const segLen = length / segments;

    for (let s = 0; s < segments; s++) {
      const offsetAlong = -length / 2 + segLen * (s + 0.5);
      // 3 stacked books on each side of the corridor
      for (let tier = 0; tier < 3; tier++) {
        const tierH = 2.4;
        const y = tier * tierH;
        const matLeft = bookMats[(s + tier) % bookMats.length];
        const matRight = bookMats[(s + tier + 2) % bookMats.length];

        if (axis === 'x') {
          addBookBlock(
            centerX + offsetAlong,
            y,
            centerZ - corridorGap / 2 - bookWallWidth / 2,
            segLen * 0.96,
            tierH,
            bookWallWidth,
            matLeft,
            `${name} · Tomo Nord T${tier + 1}`,
            { isBookBridge: true }
          );
          addBookBlock(
            centerX + offsetAlong,
            y,
            centerZ + corridorGap / 2 + bookWallWidth / 2,
            segLen * 0.96,
            tierH,
            bookWallWidth,
            matRight,
            `${name} · Tomo Sud T${tier + 1}`,
            { isBookBridge: true }
          );
        } else {
          addBookBlock(
            centerX - corridorGap / 2 - bookWallWidth / 2,
            y,
            centerZ + offsetAlong,
            bookWallWidth,
            tierH,
            segLen * 0.96,
            matLeft,
            `${name} · Tomo Ovest T${tier + 1}`,
            { isBookBridge: true }
          );
          addBookBlock(
            centerX + corridorGap / 2 + bookWallWidth / 2,
            y,
            centerZ + offsetAlong,
            bookWallWidth,
            tierH,
            segLen * 0.96,
            matRight,
            `${name} · Tomo Est T${tier + 1}`,
            { isBookBridge: true }
          );
        }
      }
    }

    // Overhead Stacked Book Skybridge Arch spanning across the center of the corridor (walkable above & hollow below!)
    if (axis === 'x') {
      addBookBlock(
        centerX,
        7.2,
        centerZ,
        42.0,
        1.8,
        corridorGap + bookWallWidth * 2,
        manilaEnvelopeMat,
        `${name} · Ponte Sospeso di Libri`,
        { isBookBridge: true }
      );
      // Bounce-pad Post-it stairs at both entrances to leap onto the Book Skybridge!
      addBookBlock(
        centerX - length / 2 - 8,
        0,
        centerZ - corridorGap / 2 - 4,
        7.5,
        2.2,
        7.5,
        yellowPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
      addBookBlock(
        centerX + length / 2 + 8,
        0,
        centerZ + corridorGap / 2 + 4,
        7.5,
        2.2,
        7.5,
        pinkPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
    } else {
      addBookBlock(
        centerX,
        7.2,
        centerZ,
        corridorGap + bookWallWidth * 2,
        1.8,
        42.0,
        manilaEnvelopeMat,
        `${name} · Ponte Sospeso di Libri`,
        { isBookBridge: true }
      );
      addBookBlock(
        centerX - corridorGap / 2 - 4,
        0,
        centerZ - length / 2 - 8,
        7.5,
        2.2,
        7.5,
        yellowPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
      addBookBlock(
        centerX + corridorGap / 2 + 4,
        0,
        centerZ + length / 2 + 8,
        7.5,
        2.2,
        7.5,
        pinkPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
    }
  };

  // Build the 4 Inter-Room Stacked Book Corridors & Skybridges!
  buildStackedBookCorridor(
    'Corridoio dei Dizionari (Studio ⇄ Bagno)',
    0,
    -92,
    136,
    'x'
  );
  buildStackedBookCorridor(
    'Corridoio dei Ricettari (Cucina ⇄ Soggiorno)',
    0,
    92,
    136,
    'x'
  );
  buildStackedBookCorridor(
    'Galleria degli Atlanti (Studio ⇄ Cucina)',
    -92,
    0,
    136,
    'z'
  );
  buildStackedBookCorridor(
    'Galleria dei Romanzi (Bagno ⇄ Soggiorno)',
    92,
    0,
    136,
    'z'
  );

  // ============================================================================
  // STANZA 1 (NORD-OVEST: x in [-375, 0], z in [-375, 0]): LO STUDIO MEGA-VASTO
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

  // 1B. Mid-Sector & Deep Outer Studio Citadel (extending out to -340m!)
  addBookBlock(-68, 0, -56, 28.0, 4.5, 22.0, blueCupMat, 'Enciclopedia Universale T1');
  addBookBlock(-68, 4.5, -56, 25.0, 4.5, 19.5, redBookMat, 'Enciclopedia Universale T2');
  addBookBlock(-68, 9.0, -56, 22.0, 4.2, 17.0, greenBookMat, 'Vetta dello Studio (Sniper Nest)');

  addBookBlock(-44, 0, -48, 9.0, 2.5, 9.0, yellowPostItMat, 'Gradino Post-It 1', {
    isBouncePad: true,
  });
  addBookBlock(-53, 2.5, -52, 9.0, 3.0, 9.0, pinkPostItMat, 'Gradino Post-It 2', {
    isBouncePad: true,
  });

  // Deep North-West Mega-Fortress (-140m to -320m)
  addBookBlock(-145, 0, -135, 44.0, 6.0, 34.0, blueCupMat, 'Ziggurat Enciclopedica Base');
  addBookBlock(-145, 6.0, -135, 36.0, 6.0, 28.0, redBookMat, 'Ziggurat Enciclopedica Media');
  addBookBlock(-145, 12.0, -135, 28.0, 5.5, 22.0, greenBookMat, 'Ziggurat Enciclopedica Vetta');
  addBookBlock(-115, 0, -135, 11.0, 3.2, 11.0, yellowPostItMat, 'Trampolino Ziggurat', {
    isBouncePad: true,
  });

  addBookBlock(-245, 0, -155, 52.0, 18.0, 8.0, manilaEnvelopeMat, 'Grande Muraglia di Buste');
  addBookBlock(-165, 0, -245, 48.0, 7.5, 32.0, greenBookMat, 'Quaderno ad Anelli Titanico');
  addBookBlock(-265, 0, -265, 56.0, 9.0, 44.0, redBookMat, 'Archivio Storico Nord-Ovest');
  addPencilCupTower(-195, -195, 6.2, 15.0);
  addPencilCupTower(-110, -235, 5.5, 13.5);

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
  // STANZA 2 (NORD-EST: x in [0, 375], z in [-375, 0]): IL BAGNO OLIMPIONICO VASTO
  // ============================================================================
  // Olympic-Sized Bathtub (72m long x 34m wide!)
  const bathtubBounds = { minX: 46, maxX: 82, minZ: -172, maxZ: -102 };
  addBookBlock(64, 0, -137, 36.0, 4.0, 70.0, porcelainMat, 'Vasca da Bagno Olimpionica');
  const bathWater = new THREE.Mesh(new THREE.PlaneGeometry(32.0, 65.0), waterMat);
  bathWater.rotation.x = -Math.PI / 2;
  bathWater.position.set(64, 4.06, -137);
  group.add(bathWater);

  // 6 Giant Rubber Ducks floating inside the Olympic Bathtub
  const duckCoords: [number, number][] = [
    [56, -160],
    [72, -150],
    [56, -140],
    [72, -130],
    [56, -120],
    [72, -110],
  ];
  duckCoords.forEach(([dx, dz]) => {
    const duck = new THREE.Group();
    duck.position.set(dx, 4.15, dz);
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(2.4, 12, 10),
      yellowPostItMat,
      outlineMat,
      [0, 0.8, 0],
      [0, 0, 0],
      [1.1, 0.75, 1.35]
    );
    addOutlinedMesh(
      duck,
      new THREE.SphereGeometry(1.4, 10, 10),
      yellowPostItMat,
      outlineMat,
      [0, 2.5, 1.4]
    );
    addOutlinedMesh(
      duck,
      new THREE.ConeGeometry(0.6, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xf97316 }),
      outlineMat,
      [0, 2.4, 2.7],
      [Math.PI / 2, 0, 0]
    );
    group.add(duck);
    rubberDucks.push(duck);
    registerTremblingProp(duck);
    colliders.push({
      minX: dx - 2.8,
      maxX: dx + 2.8,
      minZ: dz - 3.0,
      maxZ: dz + 3.0,
      bottomY: 0,
      topY: 6.5,
      label: 'Paperella di Gomma Gigante (SQUEAK!)',
      isBouncePad: true,
      isDuck: true,
    });
  });

  // Colossal Interactive WC Throne in Il Bagno
  const toiletBowlCenter = new THREE.Vector3(36, 0, -56);
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

  // Deep Bathroom Landmarks (out to +320m, -320m)
  addBookBlock(135, 0, -135, 32.0, 8.5, 48.0, porcelainMat, 'Lavabo Monumentale Doppio');
  addBookBlock(135, 8.5, -135, 22.0, 2.5, 36.0, blueCupMat, 'Specchiera Panoramica');
  addBookBlock(225, 0, -215, 46.0, 6.0, 46.0, pinkPostItMat, 'Piramide di Asciugamani T1', {
    isBouncePad: true,
  });
  addBookBlock(225, 6.0, -215, 32.0, 5.5, 32.0, yellowPostItMat, 'Piramide di Asciugamani T2', {
    isBouncePad: true,
  });
  addBookBlock(165, 0, -265, 54.0, 11.0, 26.0, porcelainMat, 'Acquedotto di Porcellana');
  addBookBlock(28, 0, -28, 7.2, 1.3, 4.6, pinkPostItMat, 'Saponetta Scivolosa 1 (SWISH!)', {
    isSoap: true,
  });
  addBookBlock(64, 0, -42, 7.2, 1.3, 4.6, yellowPostItMat, 'Saponetta Scivolosa 2 (SWISH!)', {
    isSoap: true,
  });

  // ============================================================================
  // STANZA 3 (SUD-OVEST: x in [-375, 0], z in [0, 375]): LA CUCINA GIGANTESCA
  // ============================================================================
  // Colossal Spring Toaster ("Il Tostapane Catapulta")
  addBookBlock(-58, 0, 58, 16.0, 7.5, 11.5, steelMat, 'Tostapane Catapulta (Salta sopra!)', {
    isBouncePad: true,
    isToaster: true,
  });
  for (let s = 0; s < 2; s++) {
    const toast = addOutlinedMesh(
      group,
      new THREE.BoxGeometry(5.5, 5.5, 0.95),
      woodMat,
      outlineMat,
      [-58, 8.2, 56.2 + s * 3.6]
    );
    toastSlices.push(toast);
  }

  // Mid & Deep Kitchen Landmarks (out to -330m, +330m)
  addBookBlock(-34, 0, 38, 18.0, 6.0, 18.0, steelMat, 'Pentolone in Acciaio Inox');
  addBookBlock(-82, 0, 34, 26.0, 2.4, 18.0, woodMat, 'Tagliere da Macellaio');
  addBookBlock(-135, 0, 135, 42.0, 10.5, 64.0, woodMat, 'Isola Centrale della Cucina');
  addBookBlock(-135, 10.5, 135, 28.0, 6.5, 36.0, yellowPostItMat, 'Scatola di Cereali Colosso');
  addBookBlock(-65, 0, 145, 32.0, 7.0, 22.0, redBookMat, 'Vassoio Lasagne Gigante');
  addBookBlock(-235, 0, 225, 58.0, 14.0, 42.0, woodMat, 'Dispensa Colossale Sud-Ovest');
  addBookBlock(-155, 0, 265, 46.0, 8.5, 34.0, steelMat, 'Frigorifero Orizzontale');

  // Collectible Cork Helmet ("Il Tappo di Sughero") in the Kitchen
  const corkHelmetPickup = addOutlinedMesh(
    group,
    new THREE.CylinderGeometry(1.5, 1.2, 2.2, 14),
    woodMat,
    outlineMat,
    [-42, 1.3, 52]
  );
  registerTremblingProp(corkHelmetPickup);

  // ============================================================================
  // STANZA 4 (SUD-EST: x in [0, 375], z in [0, 375]): IL SOGGIORNO STADIO
  // ============================================================================
  // Stadium-Sized Trampoline Couch ("Il Divano Elastico")
  addBookBlock(78, 0, 135, 58.0, 6.0, 26.0, greenBookMat, 'Divano Trampolino Gigante (BOING!)', {
    isBouncePad: true,
  });
  addBookBlock(78, 6.0, 146, 58.0, 8.5, 5.5, greenBookMat, 'Schienale Divano Stadio');
  addBookBlock(46, 6.0, 135, 6.5, 4.8, 26.0, greenBookMat, 'Bracciolo Ovest', {
    isBouncePad: true,
  });
  addBookBlock(110, 6.0, 135, 6.5, 4.8, 26.0, greenBookMat, 'Bracciolo Est', {
    isBouncePad: true,
  });

  // Mid & Deep Living Room Landmarks (out to +330m, +330m)
  addBookBlock(78, 0, 58, 32.0, 4.2, 18.0, woodMat, 'Tavolino da Salotto');
  addBookBlock(155, 0, 125, 24.0, 15.0, 52.0, redBookMat, 'Libreria del Soggiorno');
  addBookBlock(36, 0, 135, 16.0, 3.0, 16.0, pinkPostItMat, 'Pouf Cuscino Morbido', {
    isBouncePad: true,
  });
  addBookBlock(235, 0, 235, 64.0, 7.5, 32.0, greenBookMat, 'Anfiteatro Divano Angolare', {
    isBouncePad: true,
  });
  addBookBlock(275, 0, 155, 36.0, 18.0, 48.0, blueCupMat, 'Torre Enciclopedica Sud-Est');

  // Spring Tape Measure ("Il Metro a Nastro a Molla")
  addBookBlock(32, 0, 48, 7.2, 3.6, 7.2, yellowPostItMat, 'Metro a Nastro (ZIIIP!)', {
    isBouncePad: true,
    isTapeTrap: true,
  });

  // Mouse Trap ("La Trappola per Topi")
  addBookBlock(22, 0, 26, 8.0, 0.95, 5.2, woodMat, 'Trappola per Topi (CLACK!)', {
    isBouncePad: true,
    isMouseTrap: true,
  });

  // Colossal Vacuum Cleaner ("L'Aspirapolvere")
  const vacuumPosition = new THREE.Vector3(52, 0, 32);
  addBookBlock(
    vacuumPosition.x,
    0,
    vacuumPosition.z,
    11.0,
    6.0,
    8.4,
    redBookMat,
    'Aspirapolvere Turbo'
  );

  // Giant Rolling Glass Marble ("La Biglia")
  const rollingMarble = addOutlinedMesh(
    group,
    new THREE.SphereGeometry(3.2, 18, 16),
    blueCupMat,
    outlineMat,
    [42.0, 3.2, 68.0]
  );
  const marbleVel = new THREE.Vector3(14.5, 0, -11.2);

  // Spawn 24 Paper Ammo Pickups across the rooms, Book Corridors, and HVAC Ducts!
  const paperGeo = new THREE.DodecahedronGeometry(0.95, 0);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const pickupCoords: [number, number][] = [
    [-14, -18],
    [-48, -42],
    [-115, -75],
    [-185, -145],
    [0, -92], // Inside North Book Corridor
    [0, -185], // Inside North HVAC Duct
    [36, -36],
    [82, -75],
    [145, -115],
    [185, 0], // Inside East HVAC Duct
    [92, 0], // Inside East Book Corridor
    [-35, 38],
    [-75, 75],
    [-145, 115],
    [-185, 0], // Inside West HVAC Duct
    [-92, 0], // Inside West Book Corridor
    [0, 92], // Inside South Book Corridor
    [0, 185], // Inside South HVAC Duct
    [35, 35],
    [72, 65],
    [135, 95],
    [195, 185],
    [-215, 195],
    [205, -195],
  ];
  pickupCoords.forEach(([px, pz]) => {
    const pMesh = addOutlinedMesh(group, paperGeo, paperMat, outlineMat, [px, 1.0, pz]);
    registerTremblingProp(pMesh);
    paperPickups.push(pMesh);
  });

  // Spawn Collectible Weapon Nodes for Scavenger Mode ("Trova le armi nella casa")
  WEAPONS_ARSENAL.forEach((w) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(w.spawnPos[0], w.spawnPos[1], w.spawnPos[2]);

    addOutlinedMesh(
      nodeGroup,
      new THREE.BoxGeometry(2.0, 1.2, 2.0),
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

  // ============================================================================
  // ULTRA-PERFORMANT 2D SPATIAL HASH GRID FOR O(1) COLLIDER QUERIES
  // ============================================================================
  const GRID_MIN = -400;
  const GRID_CELL_SIZE = 38;
  const GRID_COLS = 22; // Covers -400m to +436m on both X and Z
  const spatialBuckets: ColliderBox[][] = Array.from(
    { length: GRID_COLS * GRID_COLS },
    () => []
  );

  // Pre-index every collider into all overlapping 38m x 38m cells (with 1.5m player radius padding)
  const pad = 1.5;
  for (let i = 0; i < colliders.length; i++) {
    const box = colliders[i];
    const cMinX = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((box.minX - pad - GRID_MIN) / GRID_CELL_SIZE))
    );
    const cMaxX = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((box.maxX + pad - GRID_MIN) / GRID_CELL_SIZE))
    );
    const cMinZ = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((box.minZ - pad - GRID_MIN) / GRID_CELL_SIZE))
    );
    const cMaxZ = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((box.maxZ + pad - GRID_MIN) / GRID_CELL_SIZE))
    );

    for (let cx = cMinX; cx <= cMaxX; cx++) {
      for (let cz = cMinZ; cz <= cMaxZ; cz++) {
        spatialBuckets[cz * GRID_COLS + cx].push(box);
      }
    }
  }

  const queryNearbyColliders = (x: number, z: number): ColliderBox[] => {
    const cx = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((x - GRID_MIN) / GRID_CELL_SIZE))
    );
    const cz = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((z - GRID_MIN) / GRID_CELL_SIZE))
    );
    return spatialBuckets[cz * GRID_COLS + cx];
  };

  return {
    group,
    colliders,
    queryNearbyColliders,
    ventDuctZones,
    ductFanPivots,
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
