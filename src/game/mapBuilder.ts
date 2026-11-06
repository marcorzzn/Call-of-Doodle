import * as THREE from 'three';
import { WEAPONS_ARSENAL, WeaponId } from '../data/gddData';
import {
  addOutlinedMesh,
  ColliderBox,
  createCrossHatchPastelTexture,
  createHatchShadowTexture,
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

export interface KineticProp {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotVel: THREE.Vector3;
  baseY: number;
  radius: number;
}

export interface BuiltArena {
  group: THREE.Group;
  colliders: ColliderBox[];
  queryNearbyColliders: (x: number, z: number) => ColliderBox[];
  worldHalfExtent: number; // 760m per room -> [-760, +760] world bounds (1520m x 1520m total!)
  ventDuctZones: VentDuctZone[];
  ductFanPivots: THREE.Group[];
  tremblingProps: THREE.Object3D[];
  kineticProps: KineticProp[];
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

const EMPTY_COLLIDER_BUCKET: ColliderBox[] = [];

// Shared Unit Geometries (allocated once -> Zero GPU buffer duplication across hundreds of props!)
const UNIT_BOX_GEO = new THREE.BoxGeometry(1, 1, 1);
const UNIT_CYL_GEO = new THREE.CylinderGeometry(1, 1, 1, 14);
const UNIT_CONE_GEO = new THREE.ConeGeometry(1, 1, 10);
const UNIT_SPHERE_GEO = new THREE.SphereGeometry(1, 12, 10);
const UNIT_PLANE_GEO = new THREE.PlaneGeometry(1, 1);

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
  const kineticProps: KineticProp[] = [];
  const paperPickups: THREE.Mesh[] = [];
  const weaponPickups: WeaponPickupNode[] = [];
  const rubberDucks: THREE.Group[] = [];
  const toastSlices: THREE.Mesh[] = [];

  const ROOM_SIZE = 760;
  const WORLD_TOTAL_SIZE = ROOM_SIZE * 2; // 1520m x 1520m

  const hatchShadowTex = createHatchShadowTexture();
  const hatchShadowMat = new THREE.MeshBasicMaterial({
    map: hatchShadowTex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Batch all floor shadows into a single GPU InstancedMesh (1 draw call for up to 700 shadows!)
  const MAX_INSTANCED_SHADOWS = 700;
  const shadowInstancedMesh = new THREE.InstancedMesh(
    UNIT_PLANE_GEO,
    hatchShadowMat,
    MAX_INSTANCED_SHADOWS
  );
  shadowInstancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  let shadowInstanceCount = 0;
  const _shadowDummy = new THREE.Object3D();

  const addBatchedFloorShadow = (x: number, z: number, w: number, d: number, yaw = 0) => {
    if (shadowInstanceCount >= MAX_INSTANCED_SHADOWS) return;
    _shadowDummy.position.set(x, 0.018, z);
    _shadowDummy.rotation.set(-Math.PI / 2, 0, yaw);
    _shadowDummy.scale.set(w, d, 1);
    _shadowDummy.updateMatrix();
    shadowInstancedMesh.setMatrixAt(shadowInstanceCount++, _shadowDummy.matrix);
  };

  const registerTremblingProp = (obj: THREE.Object3D) => {
    obj.userData.baseY = obj.position.y;
    obj.userData.baseRotZ = obj.rotation.z;
    obj.userData.baseRotX = obj.rotation.x;
    tremblingProps.push(obj);
  };

  // Shared Pastel Cross-Hatched Materials
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
    map: createCrossHatchPastelTexture('#c99364', maxAnisotropy),
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
    map: createCrossHatchPastelTexture('#fef9e7', maxAnisotropy),
    roughness: 0.8,
  });

  // Scale graph paper repeat so squares stay crisp across 4 rooms of 760m x 760m (1520m x 1520m total)
  graphPaperTex.repeat.set(440, 440);
  graphPaperTex.needsUpdate = true;

  // Colossal Wooden Desk / House Floor Slab
  const outerFloor = new THREE.Mesh(
    new THREE.BoxGeometry(WORLD_TOTAL_SIZE + 120, 3.0, WORLD_TOTAL_SIZE + 120),
    woodMat
  );
  outerFloor.position.set(0, -1.54, 0);
  outerFloor.updateMatrix();
  outerFloor.matrixAutoUpdate = false;
  group.add(outerFloor);

  // Main Flat Sketchbook Paper Sheet covering the 4 rooms
  const paperSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_TOTAL_SIZE, WORLD_TOTAL_SIZE),
    new THREE.MeshStandardMaterial({
      map: graphPaperTex,
      roughness: 0.85,
      metalness: 0.02,
    })
  );
  paperSheet.rotation.x = -Math.PI / 2;
  paperSheet.updateMatrix();
  paperSheet.matrixAutoUpdate = false;
  group.add(paperSheet);

  // Room Divider Cardboard Walls across the 760m room spans
  const wallMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#f3e8d2', maxAnisotropy),
    roughness: 0.8,
  });
  const buildWallSegment = (
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    label: string
  ) => {
    addOutlinedMesh(
      group,
      UNIT_BOX_GEO,
      wallMat,
      outlineMat,
      [x, h / 2, z],
      [0, 0, 0],
      [w, h, d],
      true
    );
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

  const dividerSpans: [number, number][] = [
    [-45, 56],
    [-138, 62],
    [-260, 108],
    [-410, 96],
    [-565, 120],
    [-700, 108],
    [45, 56],
    [138, 62],
    [260, 108],
    [410, 96],
    [565, 120],
    [700, 108],
  ];
  dividerSpans.forEach(([pos, len], idx) => {
    buildWallSegment(0, pos, 2.6, 22.0, len, `Parete Divisoria Nord-Sud #${idx + 1}`);
    buildWallSegment(pos, 0, len, 22.0, 2.6, `Parete Divisoria Ovest-Est #${idx + 1}`);
  });

  /**
   * Clean, Well-Defined 2-Part Book / Block Builder (Zero overlapping Z-fighting faces!).
   * Uses shared UNIT_BOX_GEO + batched instanced shadow for maximum FPS.
   */
  const addBookBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    coverMat: THREE.Material,
    label: string,
    extraFlags: Partial<ColliderBox> = {},
    yawTilt?: number
  ) => {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, y, z);
    const organicYaw =
      yawTilt !== undefined
        ? yawTilt
        : extraFlags.isBookBridge
        ? ((Math.sin(x * 0.37 + z * 0.53 + y) * 0.03) as number)
        : ((Math.sin(x * 0.71 + z * 0.43 + y * 1.3) * 0.055) as number);
    bookGroup.rotation.y = organicYaw;

    // 1. Clean main colored block/cover
    addOutlinedMesh(
      bookGroup,
      UNIT_BOX_GEO,
      coverMat,
      outlineMat,
      [0, h * 0.5, 0],
      [0, 0, 0],
      [w, h, d],
      true
    );

    // 2. Clean non-overlapping page edge strip on the front/right side (gives unmistakable book/pad definition without Z-fighting!)
    const isAppliance =
      label.includes('Vasca') ||
      label.includes('Trono') ||
      label.includes('Cassetta') ||
      label.includes('Tostapane') ||
      label.includes('Pentolone') ||
      label.includes('Aspirapolvere');

    if (!isAppliance) {
      addOutlinedMesh(
        bookGroup,
        UNIT_BOX_GEO,
        whitePagesMat,
        outlineMat,
        [w * 0.04, h * 0.5, d * 0.04],
        [0, 0, 0],
        [w * 0.96, h * 0.72, d * 0.96],
        true
      );
    }

    if (y === 0 && w < 65 && d < 65) {
      addBatchedFloorShadow(x + w * 0.12, z + d * 0.1, w * 1.24, d * 1.24, organicYaw);
    }

    group.add(bookGroup);
    // Only register nearby/medium props for cat-purr trembling so we don't iterate 500 static mega-walls
    if (Math.abs(x) < 160 && Math.abs(z) < 160) {
      registerTremblingProp(bookGroup);
    } else {
      bookGroup.updateMatrix();
      bookGroup.matrixAutoUpdate = false;
    }

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

  // Clean Open Manila Envelope with protruding white letter sheet
  const addOpenManilaEnvelope = (x: number, z: number, w: number, h: number, d: number, yaw = 0) => {
    const envGroup = new THREE.Group();
    envGroup.position.set(x, 0, z);
    envGroup.rotation.y = yaw;

    addOutlinedMesh(
      envGroup,
      UNIT_BOX_GEO,
      manilaEnvelopeMat,
      outlineMat,
      [0, h * 0.5, 0],
      [0, 0, 0],
      [w, h, d],
      true
    );
    addOutlinedMesh(
      envGroup,
      UNIT_BOX_GEO,
      whitePagesMat,
      outlineMat,
      [0, h * 0.9, -d * 0.05],
      [0, 0, -0.03],
      [w * 0.78, h * 0.78, d * 0.45],
      true
    );

    addBatchedFloorShadow(x + 0.5, z + 0.4, w * 1.22, d * 1.9, yaw);
    group.add(envGroup);
    registerTremblingProp(envGroup);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      bottomY: 0,
      topY: h * 1.25,
      label: 'Busta Manila Gialla Aperta con Lettera',
    });
  };

  // Clean Scattered Loose Paper Sheet
  const addScatteredPaperSheet = (
    x: number,
    z: number,
    w: number,
    d: number,
    yaw: number,
    stackCount = 1
  ) => {
    const sheetGroup = new THREE.Group();
    sheetGroup.position.set(x, 0, z);
    sheetGroup.rotation.y = yaw;

    for (let s = 0; s < stackCount; s++) {
      addOutlinedMesh(
        sheetGroup,
        UNIT_BOX_GEO,
        whitePagesMat,
        outlineMat,
        [s * 0.14, 0.06 + s * 0.11, -s * 0.1],
        [0, s * 0.08, 0],
        [w, 0.09, d],
        true
      );
    }

    addBatchedFloorShadow(x + 0.2, z + 0.2, w * 1.2, d * 1.2, yaw);
    group.add(sheetGroup);
    registerTremblingProp(sheetGroup);
  };

  // Clean Spiral Notebook Prop
  const addSpiralNotebookProp = (
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    yaw: number
  ) => {
    const nbGroup = new THREE.Group();
    nbGroup.position.set(x, y, z);
    nbGroup.rotation.y = yaw;

    addOutlinedMesh(
      nbGroup,
      UNIT_BOX_GEO,
      whitePagesMat,
      outlineMat,
      [0, 0.2, 0],
      [0, 0, 0],
      [w, 0.38, d],
      true
    );
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x141413 });
    for (let r = -3; r <= 3; r++) {
      const ring = new THREE.Mesh(UNIT_BOX_GEO, ringMat);
      ring.scale.set(0.14, 0.46, 0.36);
      ring.position.set(r * (w * 0.12), 0.24, -d * 0.48);
      ring.updateMatrix();
      ring.matrixAutoUpdate = false;
      nbGroup.add(ring);
    }
    if (y === 0) addBatchedFloorShadow(x + 0.25, z + 0.25, w * 1.2, d * 1.2, yaw);
    group.add(nbGroup);
    registerTremblingProp(nbGroup);
  };

  // Clean Pencil Cup Tower with well-defined colored pencils
  const addPencilCupTower = (x: number, z: number, radius: number, height: number) => {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(x, 0, z);
    addOutlinedMesh(
      cupGroup,
      UNIT_CYL_GEO,
      blueCupMat,
      outlineMat,
      [0, height / 2, 0],
      [0, 0, 0],
      [radius, height, radius],
      true
    );

    const pencilMats = [yellowPostItMat, pinkPostItMat, greenBookMat, redBookMat];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.35;
      const pLen = height * 1.42;
      const px = Math.cos(angle) * radius * 0.42;
      const pz = Math.sin(angle) * radius * 0.42;
      const tiltX = (i % 2 === 0 ? 1 : -1) * 0.14;
      const tiltZ = (i < 2 ? 1 : -1) * 0.12;
      addOutlinedMesh(
        cupGroup,
        UNIT_CYL_GEO,
        pencilMats[i],
        outlineMat,
        [px, height * 0.92, pz],
        [tiltX, 0, tiltZ],
        [radius * 0.15, pLen, radius * 0.15],
        true
      );
    }

    addBatchedFloorShadow(x + radius * 0.3, z + radius * 0.25, radius * 2.8, radius * 2.4, 0);
    group.add(cupGroup);
    if (Math.abs(x) < 160 && Math.abs(z) < 160) {
      registerTremblingProp(cupGroup);
    } else {
      cupGroup.updateMatrix();
      cupGroup.matrixAutoUpdate = false;
    }
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
  // PERCORSI DI COLLEGAMENTO INTER-STANZA (8 CONDOTTI HVAC + 8 CORRIDOI LIBRI)
  // ============================================================================
  const buildVentilationDuctTunnel = (
    id: string,
    name: string,
    centerX: number,
    centerZ: number,
    length: number,
    axis: 'x' | 'z'
  ) => {
    const ductWidth = 16.0;
    const wallThick = 1.3;
    const ductHeight = 7.8;
    const roofThick = 1.2;

    const ductGroup = new THREE.Group();
    ductGroup.position.set(centerX, 0, centerZ);
    group.add(ductGroup);

    const spanX = axis === 'x' ? length : ductWidth;
    const spanZ = axis === 'z' ? length : ductWidth;

    addOutlinedMesh(
      ductGroup,
      UNIT_BOX_GEO,
      ductDarkSteelMat,
      outlineMat,
      [0, 0.13, 0],
      [0, 0, 0],
      [spanX, 0.26, spanZ],
      true
    );

    if (axis === 'x') {
      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [0, ductHeight / 2, -ductWidth / 2],
        [0, 0, 0],
        [length, ductHeight, wallThick],
        true
      );
      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [0, ductHeight / 2, ductWidth / 2],
        [0, 0, 0],
        [length, ductHeight, wallThick],
        true
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

      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [0, ductHeight + roofThick / 2, 0],
        [0, 0, 0],
        [length, roofThick, ductWidth + wallThick * 2],
        true
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

      [-length * 0.35, 0, length * 0.35].forEach((offsetX) => {
        const fanPivot = new THREE.Group();
        fanPivot.position.set(offsetX, ductHeight - 1.6, 0);
        for (let b = 0; b < 4; b++) {
          addOutlinedMesh(
            fanPivot,
            UNIT_BOX_GEO,
            yellowPostItMat,
            outlineMat,
            [0, 0, 0],
            [(b * Math.PI) / 2, 0, 0],
            [0.28, 2.4, 0.6],
            true
          );
        }
        ductGroup.add(fanPivot);
        ductFanPivots.push(fanPivot);
      });
    } else {
      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [-ductWidth / 2, ductHeight / 2, 0],
        [0, 0, 0],
        [wallThick, ductHeight, length],
        true
      );
      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [ductWidth / 2, ductHeight / 2, 0],
        [0, 0, 0],
        [wallThick, ductHeight, length],
        true
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

      addOutlinedMesh(
        ductGroup,
        UNIT_BOX_GEO,
        steelMat,
        outlineMat,
        [0, ductHeight + roofThick / 2, 0],
        [0, 0, 0],
        [ductWidth + wallThick * 2, roofThick, length],
        true
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

      [-length * 0.35, 0, length * 0.35].forEach((offsetZ) => {
        const fanPivot = new THREE.Group();
        fanPivot.position.set(0, ductHeight - 1.6, offsetZ);
        fanPivot.rotation.y = Math.PI / 2;
        for (let b = 0; b < 4; b++) {
          addOutlinedMesh(
            fanPivot,
            UNIT_BOX_GEO,
            yellowPostItMat,
            outlineMat,
            [0, 0, 0],
            [(b * Math.PI) / 2, 0, 0],
            [0.28, 2.4, 0.6],
            true
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

  buildVentilationDuctTunnel(
    'duct_north_inner',
    'Condotto HVAC Nord (Studio ⇄ Bagno)',
    0,
    -185,
    180,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_south_inner',
    'Condotto HVAC Sud (Cucina ⇄ Soggiorno)',
    0,
    185,
    180,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_west_inner',
    'Condotto HVAC Ovest (Studio ⇄ Cucina)',
    -185,
    0,
    180,
    'z'
  );
  buildVentilationDuctTunnel(
    'duct_east_inner',
    'Condotto HVAC Est (Bagno ⇄ Soggiorno)',
    185,
    0,
    180,
    'z'
  );

  buildVentilationDuctTunnel(
    'duct_north_outer',
    'Mega-Condotto HVAC Nord Esterno (Studio ⇄ Bagno)',
    0,
    -480,
    240,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_south_outer',
    'Mega-Condotto HVAC Sud Esterno (Cucina ⇄ Soggiorno)',
    0,
    480,
    240,
    'x'
  );
  buildVentilationDuctTunnel(
    'duct_west_outer',
    'Mega-Condotto HVAC Ovest Esterno (Studio ⇄ Cucina)',
    -480,
    0,
    240,
    'z'
  );
  buildVentilationDuctTunnel(
    'duct_east_outer',
    'Mega-Condotto HVAC Est Esterno (Bagno ⇄ Soggiorno)',
    480,
    0,
    240,
    'z'
  );

  const buildStackedBookCorridor = (
    name: string,
    centerX: number,
    centerZ: number,
    length: number,
    axis: 'x' | 'z'
  ) => {
    const corridorGap = 16.0;
    const bookWallWidth = 9.0;
    const bookMats = [blueCupMat, redBookMat, greenBookMat, pinkPostItMat, yellowPostItMat];
    const segments = 5;
    const segLen = length / segments;

    for (let s = 0; s < segments; s++) {
      const offsetAlong = -length / 2 + segLen * (s + 0.5);
      for (let tier = 0; tier < 3; tier++) {
        const tierH = 2.5;
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
            `${name} · Pila Nord T${tier + 1}`,
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
            `${name} · Pila Sud T${tier + 1}`,
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
            `${name} · Pila Ovest T${tier + 1}`,
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
            `${name} · Pila Est T${tier + 1}`,
            { isBookBridge: true }
          );
        }
      }
    }

    if (axis === 'x') {
      addBookBlock(
        centerX,
        7.5,
        centerZ,
        46.0,
        2.0,
        corridorGap + bookWallWidth * 2,
        manilaEnvelopeMat,
        `${name} · Ponte Sospeso di Libri`,
        { isBookBridge: true }
      );
      addBookBlock(
        centerX - length / 2 - 9,
        0,
        centerZ - corridorGap / 2 - 4,
        8.0,
        2.4,
        8.0,
        yellowPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
      addBookBlock(
        centerX + length / 2 + 9,
        0,
        centerZ + corridorGap / 2 + 4,
        8.0,
        2.4,
        8.0,
        pinkPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
    } else {
      addBookBlock(
        centerX,
        7.5,
        centerZ,
        corridorGap + bookWallWidth * 2,
        2.0,
        46.0,
        manilaEnvelopeMat,
        `${name} · Ponte Sospeso di Libri`,
        { isBookBridge: true }
      );
      addBookBlock(
        centerX - corridorGap / 2 - 4,
        0,
        centerZ - length / 2 - 9,
        8.0,
        2.4,
        8.0,
        yellowPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
      addBookBlock(
        centerX + corridorGap / 2 + 4,
        0,
        centerZ + length / 2 + 9,
        8.0,
        2.4,
        8.0,
        pinkPostItMat,
        'Trampolino Post-It Ponte Libri',
        { isBouncePad: true }
      );
    }
  };

  buildStackedBookCorridor('Corridoio dei Dizionari (Studio ⇄ Bagno)', 0, -92, 144, 'x');
  buildStackedBookCorridor('Corridoio dei Ricettari (Cucina ⇄ Soggiorno)', 0, 92, 144, 'x');
  buildStackedBookCorridor('Galleria degli Atlanti (Studio ⇄ Cucina)', -92, 0, 144, 'z');
  buildStackedBookCorridor('Galleria dei Romanzi (Bagno ⇄ Soggiorno)', 92, 0, 144, 'z');

  buildStackedBookCorridor(
    'Grande Corridoio delle Enciclopedie Nord (Studio ⇄ Bagno)',
    0,
    -340,
    210,
    'x'
  );
  buildStackedBookCorridor(
    'Grande Corridoio dei Manuali Sud (Cucina ⇄ Soggiorno)',
    0,
    340,
    210,
    'x'
  );
  buildStackedBookCorridor(
    'Grande Galleria dei Quaderni Ovest (Studio ⇄ Cucina)',
    -340,
    0,
    210,
    'z'
  );
  buildStackedBookCorridor(
    'Grande Galleria dei Tomi Est (Bagno ⇄ Soggiorno)',
    340,
    0,
    210,
    'z'
  );

  // ============================================================================
  // STANZA 1 (NORD-OVEST: 760m x 760m, x in [-760, 0], z in [-760, 0]): LO STUDIO
  // ============================================================================
  addBookBlock(-18.5, 0, -19.2, 12.2, 1.9, 9.2, blueCupMat, 'Dizionario Blu', {}, 0.18);
  addBookBlock(-18.8, 1.9, -19.4, 11.4, 1.9, 8.6, redBookMat, 'Atlante Rosso', {}, 0.12);
  addBookBlock(-18.2, 3.8, -19.0, 10.6, 1.8, 8.0, greenBookMat, 'Quaderno Verde', {}, 0.22);

  addBookBlock(-21.0, 0, -9.8, 8.8, 1.6, 7.2, greenBookMat, 'Manuale Verde Base', {}, 0.22);
  addBookBlock(-20.8, 1.6, -9.7, 8.2, 1.5, 6.8, redBookMat, 'Diario Rosso', {}, 0.16);
  addBookBlock(-20.5, 3.1, -9.5, 7.8, 1.5, 6.4, greenBookMat, 'Quaderno Chiaro', {}, 0.25);

  addBookBlock(-10.8, 0, -13.2, 4.8, 1.25, 4.8, greenBookMat, 'Post-It Base Verde', {}, 0.24);
  addBookBlock(-10.7, 1.25, -13.2, 4.5, 1.25, 4.5, pinkPostItMat, 'Post-It Rosa', {}, 0.18);
  addBookBlock(-10.5, 2.5, -13.1, 4.3, 1.25, 4.3, yellowPostItMat, 'Post-It Giallo', {}, 0.28);
  addBookBlock(-10.2, 0, -6.4, 3.9, 1.35, 3.9, yellowPostItMat, 'Blocco Note Post-It', {}, 0.26);

  addOpenManilaEnvelope(-5.8, -23.5, 13.5, 5.4, 2.8, 0.05);
  addBookBlock(-1.2, 0, -3.6, 6.4, 0.45, 4.6, manilaEnvelopeMat, 'Busta Gialla Piatta', {}, -0.32);

  addScatteredPaperSheet(-6.8, -16.8, 4.4, 4.0, 0.22, 1);
  addScatteredPaperSheet(-13.2, -5.2, 3.6, 3.4, -0.3, 2);
  addSpiralNotebookProp(2.5, 0, -16.5, 5.2, 4.4, -0.24);

  addPencilCupTower(-12.6, -23.2, 2.0, 4.6);
  addPencilCupTower(4.8, -11.8, 2.0, 4.5);
  addPencilCupTower(-4.2, -4.4, 1.15, 2.4);

  const deskTrimLeft = addOutlinedMesh(
    group,
    UNIT_BOX_GEO,
    woodMat,
    outlineMat,
    [-16.5, 0.22, 2.6],
    [0, -0.46, 0],
    [28.0, 0.55, 2.2],
    true
  );
  registerTremblingProp(deskTrimLeft);
  const deskTrimRight = addOutlinedMesh(
    group,
    UNIT_BOX_GEO,
    woodMat,
    outlineMat,
    [10.5, 0.22, 1.8],
    [0, 0.46, 0],
    [26.0, 0.55, 2.2],
    true
  );
  registerTremblingProp(deskTrimRight);

  // Mid & Outer 760m Studio Citadels
  addBookBlock(-68, 0, -56, 28.0, 4.5, 22.0, blueCupMat, 'Enciclopedia Universale T1');
  addBookBlock(-68, 4.5, -56, 25.0, 4.5, 19.5, redBookMat, 'Enciclopedia Universale T2');
  addBookBlock(-68, 9.0, -56, 22.0, 4.2, 17.0, greenBookMat, 'Vetta dello Studio (Sniper Nest)');

  addBookBlock(-44, 0, -48, 9.0, 2.5, 9.0, yellowPostItMat, 'Gradino Post-It 1', {
    isBouncePad: true,
  });
  addBookBlock(-53, 2.5, -52, 9.0, 3.0, 9.0, pinkPostItMat, 'Gradino Post-It 2', {
    isBouncePad: true,
  });

  addBookBlock(-145, 0, -135, 44.0, 6.0, 34.0, blueCupMat, 'Ziggurat Enciclopedica Base');
  addBookBlock(-145, 6.0, -135, 36.0, 6.0, 28.0, redBookMat, 'Ziggurat Enciclopedica Media');
  addBookBlock(-145, 12.0, -135, 28.0, 5.5, 22.0, greenBookMat, 'Ziggurat Enciclopedica Vetta');
  addBookBlock(-115, 0, -135, 11.0, 3.2, 11.0, yellowPostItMat, 'Trampolino Ziggurat', {
    isBouncePad: true,
  });

  addBookBlock(-245, 0, -155, 52.0, 18.0, 8.0, manilaEnvelopeMat, 'Grande Muraglia di Buste');
  addBookBlock(-165, 0, -245, 48.0, 7.5, 32.0, greenBookMat, 'Quaderno ad Anelli Titanico');
  addBookBlock(-285, 0, -285, 64.0, 10.0, 48.0, redBookMat, 'Archivio Storico Centrale');
  addBookBlock(-440, 0, -420, 82.0, 12.0, 58.0, blueCupMat, 'Cittadella Esterna dei Dizionari');
  addBookBlock(-580, 0, -540, 96.0, 16.0, 72.0, greenBookMat, 'Bastione Nord-Ovest 760m');
  addPencilCupTower(-195, -195, 6.2, 15.0);
  addPencilCupTower(-380, -290, 9.0, 22.0);
  addPencilCupTower(-520, -390, 11.0, 26.0);

  // Clean Overturned Coffee Mug + Double-Inked Coffee Puddle
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-8.2, 1.15, -3.2);
  mugGroup.rotation.set(0.24, 0.55, Math.PI / 2.12);
  addOutlinedMesh(
    mugGroup,
    new THREE.CylinderGeometry(1.22, 1.06, 2.6, 16),
    whitePagesMat,
    outlineMat,
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1],
    true
  );
  const mugInside = new THREE.Mesh(
    new THREE.CircleGeometry(1.12, 14),
    new THREE.MeshBasicMaterial({ color: 0x291306 })
  );
  mugInside.rotation.x = -Math.PI / 2;
  mugInside.position.set(0, 1.31, 0);
  mugInside.updateMatrix();
  mugInside.matrixAutoUpdate = false;
  mugGroup.add(mugInside);

  addOutlinedMesh(
    mugGroup,
    new THREE.TorusGeometry(0.72, 0.18, 8, 14),
    whitePagesMat,
    outlineMat,
    [0, -0.1, 1.05],
    [0, 0, 0],
    [1, 1, 1],
    true
  );
  group.add(mugGroup);
  registerTremblingProp(mugGroup);

  const coffeePuddleCenter = new THREE.Vector3(-7.4, 0, -2.5);
  const coffeePuddleMesh = new THREE.Mesh(
    new THREE.CircleGeometry(3.6, 24),
    new THREE.MeshStandardMaterial({
      map: createCrossHatchPastelTexture('#3e1f0d', maxAnisotropy),
      roughness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  coffeePuddleMesh.scale.set(1.28, 0.86, 1);
  coffeePuddleMesh.rotation.x = -Math.PI / 2;
  coffeePuddleMesh.position.set(coffeePuddleCenter.x, 0.022, coffeePuddleCenter.z);
  const puddleOutlineRing = new THREE.Mesh(
    new THREE.RingGeometry(3.52, 3.74, 24),
    new THREE.MeshBasicMaterial({
      color: 0x141413,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  puddleOutlineRing.position.set(0, 0, 0.002);
  coffeePuddleMesh.add(puddleOutlineRing);
  group.add(coffeePuddleMesh);

  // Colossal Desk Fan
  const fanPosition = new THREE.Vector3(-52, 0, -28);
  const fanGroup = new THREE.Group();
  fanGroup.position.copy(fanPosition);
  addOutlinedMesh(
    fanGroup,
    new THREE.CylinderGeometry(2.8, 3.6, 5.5, 14),
    steelMat,
    outlineMat,
    [0, 2.75, 0],
    [0, 0, 0],
    [1, 1, 1],
    true
  );
  const fanBladesPivot = new THREE.Group();
  fanBladesPivot.position.set(1.2, 6.4, 0);
  for (let b = 0; b < 3; b++) {
    addOutlinedMesh(
      fanBladesPivot,
      UNIT_BOX_GEO,
      steelMat,
      outlineMat,
      [0, 0, 0],
      [(b * Math.PI * 2) / 3, 0, 0],
      [0.35, 5.2, 1.1],
      true
    );
  }
  fanGroup.add(fanBladesPivot);
  group.add(fanGroup);
  registerTremblingProp(fanGroup);

  // Colossal Swinging Desk Lamp
  const lampPivot = new THREE.Group();
  lampPivot.position.set(-38, 22.0, -38);
  addOutlinedMesh(
    lampPivot,
    UNIT_CYL_GEO,
    steelMat,
    outlineMat,
    [0, -5.25, 0],
    [0, 0, 0],
    [0.22, 10.5, 0.22],
    true
  );
  addOutlinedMesh(
    lampPivot,
    UNIT_CONE_GEO,
    yellowPostItMat,
    outlineMat,
    [0, -10.8, 0],
    [0, 0, 0],
    [4.2, 3.0, 4.2],
    true
  );
  group.add(lampPivot);

  // ============================================================================
  // STANZA 2 (NORD-EST: 760m x 760m, x in [0, 760], z in [-760, 0]): IL BAGNO
  // ============================================================================
  const bathtubBounds = { minX: 46, maxX: 82, minZ: -172, maxZ: -102 };
  addBookBlock(64, 0, -137, 36.0, 4.0, 70.0, porcelainMat, 'Vasca da Bagno Olimpionica');
  const bathWater = new THREE.Mesh(new THREE.PlaneGeometry(32.0, 65.0), waterMat);
  bathWater.rotation.x = -Math.PI / 2;
  bathWater.position.set(64, 4.06, -137);
  bathWater.updateMatrix();
  bathWater.matrixAutoUpdate = false;
  group.add(bathWater);

  const duckCoords: [number, number][] = [
    [56, -160],
    [72, -150],
    [56, -140],
    [72, -130],
    [56, -120],
    [72, -110],
  ];
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
  duckCoords.forEach(([dx, dz]) => {
    const duck = new THREE.Group();
    duck.position.set(dx, 4.15, dz);
    addOutlinedMesh(
      duck,
      UNIT_SPHERE_GEO,
      yellowPostItMat,
      outlineMat,
      [0, 0.8, 0],
      [0, 0, 0],
      [2.6, 1.8, 3.2],
      true
    );
    addOutlinedMesh(
      duck,
      UNIT_SPHERE_GEO,
      yellowPostItMat,
      outlineMat,
      [0, 2.5, 1.4],
      [0, 0, 0],
      [1.4, 1.4, 1.4],
      true
    );
    addOutlinedMesh(
      duck,
      UNIT_CONE_GEO,
      beakMat,
      outlineMat,
      [0, 2.4, 2.9],
      [Math.PI / 2, 0, 0],
      [0.6, 1.2, 0.6],
      true
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
    UNIT_CYL_GEO,
    whitePagesMat,
    outlineMat,
    [0, 0.28, 4.8],
    [0, 0, 0],
    [6.5, 0.55, 6.5],
    true
  );
  group.add(toiletLidPivot);

  const flushVortexMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(6.2, 1.0, 4.2, 18, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true })
  );
  flushVortexMesh.position.set(toiletBowlCenter.x, 5.8, toiletBowlCenter.z + 1.5);
  flushVortexMesh.visible = false;
  group.add(flushVortexMesh);

  addBookBlock(135, 0, -135, 32.0, 8.5, 48.0, porcelainMat, 'Lavabo Monumentale Doppio');
  addBookBlock(135, 8.5, -135, 22.0, 2.5, 36.0, blueCupMat, 'Specchiera Panoramica');
  addBookBlock(225, 0, -215, 46.0, 6.0, 46.0, pinkPostItMat, 'Piramide di Asciugamani T1', {
    isBouncePad: true,
  });
  addBookBlock(225, 6.0, -215, 32.0, 5.5, 32.0, yellowPostItMat, 'Piramide di Asciugamani T2', {
    isBouncePad: true,
  });
  addBookBlock(165, 0, -265, 54.0, 11.0, 26.0, porcelainMat, 'Acquedotto di Porcellana');
  addBookBlock(420, 0, -420, 76.0, 10.0, 110.0, porcelainMat, 'Terme Olimpioniche Nord-Est');
  addBookBlock(560, 0, -540, 84.0, 14.0, 64.0, blueCupMat, 'Santuario degli Specchi 760m');
  addBookBlock(28, 0, -28, 7.2, 1.3, 4.6, pinkPostItMat, 'Saponetta Scivolosa 1 (SWISH!)', {
    isSoap: true,
  });
  addBookBlock(64, 0, -42, 7.2, 1.3, 4.6, yellowPostItMat, 'Saponetta Scivolosa 2 (SWISH!)', {
    isSoap: true,
  });

  // ============================================================================
  // STANZA 3 (SUD-OVEST: 760m x 760m, x in [-760, 0], z in [0, 760]): LA CUCINA
  // ============================================================================
  addBookBlock(-58, 0, 58, 16.0, 7.5, 11.5, steelMat, 'Tostapane Catapulta (Salta sopra!)', {
    isBouncePad: true,
    isToaster: true,
  });
  for (let s = 0; s < 2; s++) {
    const toast = addOutlinedMesh(
      group,
      UNIT_BOX_GEO,
      woodMat,
      outlineMat,
      [-58, 8.2, 56.2 + s * 3.6],
      [0, 0, 0],
      [5.5, 5.5, 0.95]
    );
    toastSlices.push(toast);
  }

  addBookBlock(-34, 0, 38, 18.0, 6.0, 18.0, steelMat, 'Pentolone in Acciaio Inox');
  addBookBlock(-82, 0, 34, 26.0, 2.4, 18.0, woodMat, 'Tagliere da Macellaio');
  addBookBlock(-135, 0, 135, 42.0, 10.5, 64.0, woodMat, 'Isola Centrale della Cucina');
  addBookBlock(-135, 10.5, 135, 28.0, 6.5, 36.0, yellowPostItMat, 'Scatola di Cereali Colosso');
  addBookBlock(-65, 0, 145, 32.0, 7.0, 22.0, redBookMat, 'Vassoio Lasagne Gigante');
  addBookBlock(-235, 0, 225, 58.0, 14.0, 42.0, woodMat, 'Dispensa Colossale Sud-Ovest');
  addBookBlock(-155, 0, 265, 46.0, 8.5, 34.0, steelMat, 'Frigorifero Orizzontale');
  addBookBlock(-420, 0, 410, 88.0, 15.0, 62.0, woodMat, 'Tavola Imbandita Reale 760m');
  addBookBlock(-560, 0, 550, 92.0, 18.0, 68.0, steelMat, 'Cella Frigorifera Titanica');

  const corkHelmetPickup = addOutlinedMesh(
    group,
    new THREE.CylinderGeometry(1.5, 1.2, 2.2, 14),
    woodMat,
    outlineMat,
    [-42, 1.3, 52]
  );
  registerTremblingProp(corkHelmetPickup);

  // ============================================================================
  // STANZA 4 (SUD-EST: 760m x 760m, x in [0, 760], z in [0, 760]): IL SOGGIORNO
  // ============================================================================
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

  addBookBlock(78, 0, 58, 32.0, 4.2, 18.0, woodMat, 'Tavolino da Salotto');
  addBookBlock(155, 0, 125, 24.0, 15.0, 52.0, redBookMat, 'Libreria del Soggiorno');
  addBookBlock(36, 0, 135, 16.0, 3.0, 16.0, pinkPostItMat, 'Pouf Cuscino Morbido', {
    isBouncePad: true,
  });
  addBookBlock(235, 0, 235, 64.0, 7.5, 32.0, greenBookMat, 'Anfiteatro Divano Angolare', {
    isBouncePad: true,
  });
  addBookBlock(275, 0, 155, 36.0, 18.0, 48.0, blueCupMat, 'Torre Enciclopedica Sud-Est');
  addBookBlock(430, 0, 430, 94.0, 11.0, 48.0, greenBookMat, 'Mega-Divano Olimpico 760m', {
    isBouncePad: true,
  });
  addBookBlock(570, 0, 550, 86.0, 22.0, 54.0, redBookMat, 'Grande Biblioteca del Soggiorno');

  addBookBlock(32, 0, 48, 7.2, 3.6, 7.2, yellowPostItMat, 'Metro a Nastro (ZIIIP!)', {
    isBouncePad: true,
    isTapeTrap: true,
  });
  addBookBlock(22, 0, 26, 8.0, 0.95, 5.2, woodMat, 'Trappola per Topi (CLACK!)', {
    isBouncePad: true,
    isMouseTrap: true,
  });

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

  const rollingMarble = addOutlinedMesh(
    group,
    UNIT_SPHERE_GEO,
    blueCupMat,
    outlineMat,
    [42.0, 3.2, 68.0],
    [0, 0, 0],
    [3.2, 3.2, 3.2]
  );
  const marbleVel = new THREE.Vector3(14.5, 0, -11.2);

  // ============================================================================
  // ARCHITETTURA ZERO-LAG PER MAPPE GIGANTI RICCHE DI DETTAGLI & AZIONI:
  // 1) GPU HARDWARE INSTANCING (600+ Dettagli 3D in sole 5 Draw Call GPU!)
  // 2) 64 OGGETTI FISICI REATTIVI ("Kinetic Props" calciabili e colpibili!)
  // ============================================================================
  const instancedMaterials = [
    greenBookMat,
    redBookMat,
    blueCupMat,
    yellowPostItMat,
    pinkPostItMat,
  ];
  const INSTANCES_PER_MAT = 110; // 5 * 110 = 550 rich 3D detail blocks across all 4 rooms in 5 draw calls!
  const _instDummy = new THREE.Object3D();

  instancedMaterials.forEach((mat, mIdx) => {
    const instMesh = new THREE.InstancedMesh(UNIT_BOX_GEO, mat, INSTANCES_PER_MAT);
    instMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    for (let i = 0; i < INSTANCES_PER_MAT; i++) {
      // Distribute across all 4 rooms (both near-mid sectors and deep 760m sectors)
      const seed = mIdx * 1000 + i * 37;
      const roomQuadX = i % 2 === 0 ? -1 : 1;
      const roomQuadZ = i % 4 < 2 ? -1 : 1;
      const distRing = 28 + ((seed * 17) % 660);
      const angle = ((seed * 29) % 100) * 0.014 + 0.08;

      const px = roomQuadX * Math.cos(angle) * distRing;
      const pz = roomQuadZ * Math.sin(angle) * distRing;

      // Keep clear of X=0 and Z=0 divider walls & corridors
      if (Math.abs(px) < 18 || Math.abs(pz) < 18) {
        _instDummy.scale.set(0, 0, 0);
        _instDummy.updateMatrix();
        instMesh.setMatrixAt(i, _instDummy.matrix);
        continue;
      }

      const w = 2.8 + (i % 5) * 1.4;
      const h = 0.75 + (i % 3) * 0.65;
      const d = 2.4 + (i % 4) * 1.2;
      const yaw = ((seed % 60) - 30) * 0.02;

      _instDummy.position.set(px, h * 0.5, pz);
      _instDummy.rotation.set(0, yaw, 0);
      _instDummy.scale.set(w, h, d);
      _instDummy.updateMatrix();
      instMesh.setMatrixAt(i, _instDummy.matrix);

      if (shadowInstanceCount < MAX_INSTANCED_SHADOWS && i % 2 === 0) {
        addBatchedFloorShadow(px + 0.25, pz + 0.25, w * 1.2, d * 1.2, yaw);
      }
    }
    instMesh.instanceMatrix.needsUpdate = true;
    instMesh.updateMatrix();
    instMesh.matrixAutoUpdate = false;
    group.add(instMesh);
  });

  // Commit the single batched floor shadow InstancedMesh
  shadowInstancedMesh.count = shadowInstanceCount;
  shadowInstancedMesh.instanceMatrix.needsUpdate = true;
  shadowInstancedMesh.updateMatrix();
  shadowInstancedMesh.matrixAutoUpdate = false;
  group.add(shadowInstancedMesh);

  // Spawn 56 Interactive Kinetic Physics Props (Kickable & Shootable Dominoes, Cans, Erasers & Dice!)
  for (let k = 0; k < 56; k++) {
    const kMat = instancedMaterials[k % instancedMaterials.length];
    const isCylinder = k % 3 === 0;
    const w = isCylinder ? 0.65 : 1.1;
    const h = isCylinder ? 1.5 : 1.7;
    const d = isCylinder ? 0.65 : 0.45;

    // Place 24 in the immediate Studio & passages, and 32 across the other 3 rooms
    let kx = 0;
    let kz = 0;
    if (k < 24) {
      kx = -4 - (k % 6) * 4.5;
      kz = -4 - Math.floor(k / 6) * 5.2;
    } else {
      const quadX = k % 2 === 0 ? -1 : 1;
      const quadZ = k % 4 < 2 ? -1 : 1;
      kx = quadX * (22 + (k * 13) % 160);
      kz = quadZ * (22 + (k * 19) % 160);
    }

    const kMesh = addOutlinedMesh(
      group,
      isCylinder ? UNIT_CYL_GEO : UNIT_BOX_GEO,
      kMat,
      outlineMat,
      [kx, h * 0.5, kz],
      [0, (k * 0.7) % Math.PI, 0],
      [w, h, d]
    );
    kineticProps.push({
      mesh: kMesh,
      position: kMesh.position,
      velocity: new THREE.Vector3(),
      rotVel: new THREE.Vector3(),
      baseY: h * 0.5,
      radius: Math.max(w, d) * 0.75,
    });
  }

  // Spawn 28 Paper Ammo Pickups
  const paperGeo = new THREE.DodecahedronGeometry(0.95, 0);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const pickupCoords: [number, number][] = [
    [-14, -18],
    [-48, -42],
    [-115, -75],
    [-185, -145],
    [0, -92],
    [0, -185],
    [0, -340],
    [0, -480],
    [36, -36],
    [82, -75],
    [145, -115],
    [185, 0],
    [92, 0],
    [340, 0],
    [480, 0],
    [-35, 38],
    [-75, 75],
    [-145, 115],
    [-185, 0],
    [-92, 0],
    [-340, 0],
    [-480, 0],
    [0, 92],
    [0, 185],
    [0, 340],
    [0, 480],
    [35, 35],
    [135, 95],
  ];
  pickupCoords.forEach(([px, pz]) => {
    const pMesh = addOutlinedMesh(group, paperGeo, paperMat, outlineMat, [px, 1.0, pz]);
    registerTremblingProp(pMesh);
    paperPickups.push(pMesh);
  });

  // Spawn Collectible Weapon Nodes for Scavenger Mode
  WEAPONS_ARSENAL.forEach((w) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(w.spawnPos[0], w.spawnPos[1], w.spawnPos[2]);

    addOutlinedMesh(
      nodeGroup,
      UNIT_BOX_GEO,
      new THREE.MeshStandardMaterial({ color: w.accentColor, roughness: 0.4 }),
      outlineMat,
      [0, 0, 0],
      [0, 0, 0],
      [2.0, 1.2, 2.0],
      true
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
  // ULTRA-PERFORMANT O(1) 2D SPATIAL HASH GRID COVERING [-800m, +800m]
  // ============================================================================
  const GRID_MIN = -800;
  const GRID_CELL_SIZE = 40;
  const GRID_COLS = 40; // 40 x 40 = 1600 buckets
  const spatialBuckets: ColliderBox[][] = Array.from(
    { length: GRID_COLS * GRID_COLS },
    () => []
  );

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
    const cx = Math.floor((x - GRID_MIN) / GRID_CELL_SIZE);
    const cz = Math.floor((z - GRID_MIN) / GRID_CELL_SIZE);
    if (cx < 0 || cx >= GRID_COLS || cz < 0 || cz >= GRID_COLS) {
      return EMPTY_COLLIDER_BUCKET;
    }
    return spatialBuckets[cz * GRID_COLS + cx];
  };

  return {
    group,
    colliders,
    queryNearbyColliders,
    worldHalfExtent: ROOM_SIZE - 8,
    ventDuctZones,
    ductFanPivots,
    tremblingProps,
    kineticProps,
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
