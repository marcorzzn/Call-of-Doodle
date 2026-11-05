import * as THREE from 'three';
import {
  addOutlinedMesh,
  ColliderBox,
  createCrossHatchPastelTexture,
} from './doodleModels';

export interface BuiltArena {
  group: THREE.Group;
  colliders: ColliderBox[];
  paperPickups: THREE.Mesh[];
  rubberDucks: THREE.Group[];
  toiletLidPivot?: THREE.Group;
  flushVortexMesh?: THREE.Mesh;
  coffeePuddleCenter?: THREE.Vector3;
  coffeePuddleRadius?: number;
  toiletBowlCenter?: THREE.Vector3;
}

export function buildArenaMap(
  mapId: 'scrivania' | 'bagno',
  maxAnisotropy: number,
  outlineMat: THREE.Material,
  graphPaperTex: THREE.CanvasTexture
): BuiltArena {
  const group = new THREE.Group();
  const colliders: ColliderBox[] = [];
  const paperPickups: THREE.Mesh[] = [];
  const rubberDucks: THREE.Group[] = [];

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
  const whitePagesMat = new THREE.MeshStandardMaterial({
    color: 0xfefce8,
    roughness: 0.8,
  });
  const deskWoodMat = new THREE.MeshStandardMaterial({
    map: createCrossHatchPastelTexture('#d6a87c', maxAnisotropy),
    roughness: 0.75,
  });

  // Outer Desk / Floor Slab beneath the Graph Paper Sheet
  const outerDesk = new THREE.Mesh(
    new THREE.BoxGeometry(66, 1.2, 66),
    deskWoodMat
  );
  outerDesk.position.set(0, -0.64, 0);
  outerDesk.receiveShadow = true;
  group.add(outerDesk);

  // Main Graph Paper Sheet ("Foglio a Quadretti" 44x44m)
  const paperSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(44, 44),
    new THREE.MeshStandardMaterial({
      map: graphPaperTex,
      roughness: 0.85,
      metalness: 0.02,
    })
  );
  paperSheet.rotation.x = -Math.PI / 2;
  paperSheet.receiveShadow = true;
  group.add(paperSheet);

  // Thick black marker border around the paper sheet
  const borderMat = new THREE.MeshBasicMaterial({ color: 0x141413 });
  const borderNorth = new THREE.Mesh(new THREE.BoxGeometry(44.4, 0.08, 0.25), borderMat);
  borderNorth.position.set(0, 0.02, -22);
  const borderSouth = borderNorth.clone();
  borderSouth.position.set(0, 0.02, 22);
  const borderWest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 44.4), borderMat);
  borderWest.position.set(-22, 0.02, 0);
  const borderEast = borderWest.clone();
  borderEast.position.set(22, 0.02, 0);
  group.add(borderNorth, borderSouth, borderWest, borderEast);

  // Helper to register box colliders and composite books/blocks
  const addBookBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    coverMat: THREE.Material,
    label: string,
    isBouncePad = false
  ) => {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, y, z);

    // Cover
    addOutlinedMesh(
      bookGroup,
      new THREE.BoxGeometry(w, h, d),
      coverMat,
      outlineMat,
      [0, h / 2, 0]
    );
    // Recessed white page block for composite 3D detail
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
      isBouncePad,
    });
  };

  // Spawn 6 crumpled paper sheet pickups around the arena (for Cerbottana ammo)
  const paperGeo = new THREE.DodecahedronGeometry(0.42, 0);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const pickupCoords: [number, number][] = [
    [-6, 5],
    [7, -4],
    [-9, -8],
    [9, 7],
    [0, 11],
    [-3, -11],
  ];
  pickupCoords.forEach(([px, pz]) => {
    const pMesh = addOutlinedMesh(group, paperGeo, paperMat, outlineMat, [px, 0.45, pz]);
    paperPickups.push(pMesh);
  });

  if (mapId === 'scrivania') {
    // 1. Stacked Hardcover Books on North-West (Directly inspired by reference screenshot!)
    addBookBlock(-12, 0, -9, 9.5, 1.5, 7.0, blueCupMat, 'Dizionario Blu');
    addBookBlock(-12.4, 1.5, -9.2, 8.8, 1.5, 6.4, redBookMat, 'Atlante Rosso');
    addBookBlock(-11.8, 3.0, -8.8, 8.2, 1.4, 6.0, greenBookMat, 'Quaderno Verde');

    // Step-up books on West flank
    addBookBlock(-13.5, 0, 1.5, 6.5, 1.3, 5.5, greenBookMat, 'Manuale Verde');
    addBookBlock(-13.2, 1.3, 1.5, 5.6, 1.2, 4.8, pinkPostItMat, 'Diario Rosa');

    // 2. Central Post-It Stacks (Yellow & Pink stepped cover)
    addBookBlock(-3.8, 0, -2.2, 3.8, 1.1, 3.8, greenBookMat, 'Post-It Base');
    addBookBlock(-3.7, 1.1, -2.2, 3.6, 1.0, 3.6, pinkPostItMat, 'Post-It Rosa');
    addBookBlock(-3.6, 2.1, -2.1, 3.5, 1.1, 3.5, yellowPostItMat, 'Post-It Giallo');

    // Smaller Front Post-It pad
    addBookBlock(-3.5, 0, 4.2, 3.2, 1.15, 3.2, yellowPostItMat, 'Blocco Note');

    // 3. Overturned Coffee Mug & Slippery Espresso Puddle (South-Center, from screenshot!)
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-1.5, 0.95, 8.6);
    mugGroup.rotation.set(0.2, 0.6, Math.PI / 2.15);
    addOutlinedMesh(
      mugGroup,
      new THREE.CylinderGeometry(1.05, 0.92, 2.3, 14),
      whitePagesMat,
      outlineMat
    );
    addOutlinedMesh(
      mugGroup,
      new THREE.TorusGeometry(0.65, 0.16, 8, 14),
      whitePagesMat,
      outlineMat,
      [0.95, 0, 0]
    );
    group.add(mugGroup);

    // Slippery Dark-Brown Coffee Spill Decal
    const coffeePuddle = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 20),
      new THREE.MeshStandardMaterial({
        color: 0x3e1f0d,
        roughness: 0.15,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    coffeePuddle.rotation.x = -Math.PI / 2;
    coffeePuddle.position.set(0.4, 0.02, 9.2);
    group.add(coffeePuddle);

    // 4. Giant Manila Envelope in North Center (From screenshot!)
    addBookBlock(1.5, 0, -13.5, 11.0, 4.2, 2.2, manilaEnvelopeMat, 'Busta Gialla Gigante');

    // 5. Blue Pen-Holder Cups with Giant Colored Pencils sticking out (North-West & East)
    const buildPenCup = (cx: number, cz: number) => {
      const cupGroup = new THREE.Group();
      cupGroup.position.set(cx, 0, cz);
      addOutlinedMesh(
        cupGroup,
        new THREE.CylinderGeometry(1.7, 1.55, 3.8, 14),
        blueCupMat,
        outlineMat,
        [0, 1.9, 0]
      );
      // 3 Giant Pencils/Markers inside cup
      const pencilColors = [0xa855f7, 0x22c55e, 0xf97316];
      pencilColors.forEach((col, idx) => {
        const p = new THREE.Group();
        p.position.set((idx - 1) * 0.55, 3.6, (idx % 2) * 0.35);
        p.rotation.set((idx - 1) * 0.12, 0, (idx - 1) * -0.15);
        addOutlinedMesh(
          p,
          new THREE.CylinderGeometry(0.22, 0.22, 3.5, 8),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 }),
          outlineMat
        );
        addOutlinedMesh(
          p,
          new THREE.ConeGeometry(0.22, 0.65, 8),
          new THREE.MeshStandardMaterial({ color: 0xfde047 }),
          outlineMat,
          [0, 2.05, 0]
        );
        cupGroup.add(p);
      });
      group.add(cupGroup);
      colliders.push({
        minX: cx - 1.7,
        maxX: cx + 1.7,
        minZ: cz - 1.7,
        maxZ: cz + 1.7,
        topY: 3.8,
        label: 'Portapenne',
      });
    };

    buildPenCup(-5.5, -13.5);
    buildPenCup(13.5, 2.5);

    // 6. Spiral Sketchbook Ramp & Eraser Trampoline on East Flank
    addBookBlock(9.5, 0, -5.5, 6.0, 2.2, 5.2, whitePagesMat, 'Blocco da Disegno');
    addBookBlock(5.5, 0, 5.5, 3.2, 0.9, 2.4, pinkPostItMat, 'Spugna Trampolino', true);

    return {
      group,
      colliders,
      paperPickups,
      rubberDucks,
      coffeePuddleCenter: new THREE.Vector3(0.4, 0, 9.2),
      coffeePuddleRadius: 3.6,
    };
  } else {
    // MAP 02: IL BAGNO (Bathtub with Rubber Ducks + Giant Toilet with Flush Vortex Combo!)
    const porcelainMat = new THREE.MeshStandardMaterial({
      map: createCrossHatchPastelTexture('#f0f9ff', maxAnisotropy),
      roughness: 0.25,
    });
    const waterMat = new THREE.MeshStandardMaterial({
      map: createCrossHatchPastelTexture('#67e8f9', maxAnisotropy),
      roughness: 0.2,
    });

    // 1. Giant Bathtub on West Side with Soapy Water
    addBookBlock(-11.5, 0, 0, 9.0, 1.4, 18.0, porcelainMat, 'Vasca da Bagno');
    const bathWater = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 16.6), waterMat);
    bathWater.rotation.x = -Math.PI / 2;
    bathWater.position.set(-11.5, 1.44, 0);
    group.add(bathWater);

    // 3 Rideable Yellow Rubber Ducks floating in the Bathtub ("Paperelle di Gomma")
    const duckCoords: [number, number][] = [
      [-11.5, -5.5],
      [-11.5, 0],
      [-11.5, 5.5],
    ];
    duckCoords.forEach(([dx, dz]) => {
      const duck = new THREE.Group();
      duck.position.set(dx, 1.55, dz);
      // Body
      addOutlinedMesh(
        duck,
        new THREE.SphereGeometry(1.1, 12, 10),
        yellowPostItMat,
        outlineMat,
        [0, 0.4, 0],
        [0, 0, 0],
        [1.1, 0.75, 1.35]
      );
      // Head
      addOutlinedMesh(
        duck,
        new THREE.SphereGeometry(0.65, 10, 10),
        yellowPostItMat,
        outlineMat,
        [0, 1.25, 0.65]
      );
      // Orange Beak
      addOutlinedMesh(
        duck,
        new THREE.ConeGeometry(0.28, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0xf97316 }),
        outlineMat,
        [0, 1.2, 1.35],
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

    // 2. Giant Interactive WC (Toilet Bowl + Hinged Lid + Cistern Tank + Flush Vortex) in North-East
    const wcCenter = new THREE.Vector3(9.5, 0, -8.5);
    addBookBlock(wcCenter.x, 0, wcCenter.z, 7.2, 2.4, 7.2, porcelainMat, 'Tazza del WC');
    // Upper Cistern Tank
    addBookBlock(wcCenter.x, 2.4, wcCenter.z - 2.6, 6.8, 3.6, 2.4, porcelainMat, 'Cassetta Sciacquone (Premi E per Scaricare!)');

    // Hinged Toilet Lid ("Tavoletta del WC")
    const toiletLidPivot = new THREE.Group();
    toiletLidPivot.position.set(wcCenter.x, 2.45, wcCenter.z - 1.4);
    addOutlinedMesh(
      toiletLidPivot,
      new THREE.CylinderGeometry(2.9, 2.9, 0.28, 16),
      whitePagesMat,
      outlineMat,
      [0, 0.14, 2.2]
    );
    group.add(toiletLidPivot);

    // Swirling Flush Vortex Mesh inside the WC bowl
    const flushVortexMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 0.4, 1.8, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
      })
    );
    flushVortexMesh.position.set(wcCenter.x, 2.6, wcCenter.z + 0.8);
    flushVortexMesh.visible = false;
    group.add(flushVortexMesh);

    // 3. Giant Toilet Paper Rolls & Toothpaste Tube in South-East
    addBookBlock(0, 0, 2.5, 3.6, 2.5, 3.6, whitePagesMat, 'Rotolo Carta Igienica');
    addBookBlock(8.5, 0, 7.5, 8.2, 1.5, 3.5, greenBookMat, 'Tubetto Dentifricio Menta');
    addBookBlock(-2.5, 0, -9.5, 4.0, 1.1, 3.2, yellowPostItMat, 'Spugna Bagno (Jump Pad)', true);

    return {
      group,
      colliders,
      paperPickups,
      rubberDucks,
      toiletLidPivot,
      flushVortexMesh,
      toiletBowlCenter: wcCenter,
    };
  }
}
