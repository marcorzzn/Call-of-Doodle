import * as THREE from 'three';
import { WeaponId } from '../data/gddData';

export interface StickmanActor {
  id: number;
  name: string;
  group: THREE.Group;
  upperGroup: THREE.Group;
  lowerGroup: THREE.Group;
  headGroup: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  gluePuddle: THREE.Mesh;
  whiteoutSplat: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  hp: number; // Max 6 (3 full hearts)
  maxHp: number;
  state: 'alive' | 'sliced' | 'decapitated' | 'ragdoll' | 'flushed';
  stateTimer: number;
  gluedTimer: number;
  blindedTimer: number;
  shootCooldown: number;
  aiTargetAngle: number;
  upperVel: THREE.Vector3;
  headVel: THREE.Vector3;
  headWorldPos: THREE.Vector3;
}

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY: number;
  label: string;
  isBouncePad?: boolean;
  isDuck?: boolean;
}

// Shared uniform for 12 FPS boiling line outline shader
export const boilingTimeUniform = { value: 0 };

export function createBoilingOutlineMaterial(thickness = 0.032): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: boilingTimeUniform,
      uOutlineWidth: { value: thickness },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uOutlineWidth;
      float hash13(vec3 p3) {
        p3 = fract(p3 * 0.1031);
        p3 += dot(p3, p3.zyx + 31.32);
        return fract((p3.x + p3.y) * p3.z);
      }
      void main() {
        float steppedTime = floor(uTime * 12.0);
        float jitter = (hash13(position + vec3(steppedTime)) - 0.5) * 0.016;
        vec3 displaced = position + normal * (uOutlineWidth + jitter);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.07, 0.07, 0.06, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
}

export function createGraphPaperTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm off-white notebook paper base
  ctx.fillStyle = '#f6f3e8';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle paper grain speckles
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(30,25,20,0.025)' : 'rgba(255,255,255,0.35)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // Cyan/blue quadretti grid lines
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
  ctx.lineWidth = 2;
  const step = 32;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Subtle pencil cross-hatch scribbles on corners
  ctx.strokeStyle = 'rgba(20, 20, 19, 0.07)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 6, 0);
    ctx.lineTo(0, i * 6);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createCrossHatchPastelTexture(
  hexColor: string,
  maxAnisotropy: number,
  withLines = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 256, 256);

  // Colored pencil stroke texture
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 3;
  for (let i = -256; i < 256; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  // Graphite cross-hatching near edges
  if (withLines) {
    ctx.strokeStyle = 'rgba(20, 20, 18, 0.22)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 256; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 220 + (i % 11));
      ctx.lineTo(i + 18, 256);
      ctx.stroke();
    }
  }

  // Hand-drawn ink border around UV tile
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createHatchShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  ctx.save();
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = 'rgba(20, 20, 19, 0.55)';
  ctx.lineWidth = 2.2;
  for (let i = -128; i < 128; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.stroke();
    if (i % 12 === 0) {
      ctx.beginPath();
      ctx.moveTo(i + 128, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
    }
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural hand-drawn dotted ink & pencil dash texture for running stickman footstep trails
 */
export function createDottedInkTrailTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  // Hand-drawn ink dots & tiny comic running dashes
  ctx.fillStyle = '#181816';
  ctx.strokeStyle = '#181816';
  ctx.lineCap = 'round';

  // Primary sketchy ink dots along the step path
  const dots: [number, number, number][] = [
    [34, 68, 7.5],
    [62, 54, 6.0],
    [90, 70, 5.2],
    [48, 86, 4.2],
    [78, 42, 4.5],
  ];
  dots.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.82, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Faint twin pencil motion ticks behind the heel
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(18, 48);
  ctx.lineTo(42, 44);
  ctx.moveTo(22, 82);
  ctx.lineTo(46, 86);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function addOutlinedMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  outlineMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1]
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const outline = new THREE.Mesh(geometry, outlineMat);
  mesh.add(outline);
  parent.add(mesh);
  return mesh;
}

/**
 * Builds a 10-part hierarchical Stickman Ragdoll with:
 * - Spherical black head + 2 hollow white doodle eyes
 * - Tubular black torso & limbs
 * - White sneakers with black pen-drawn laces & sole trim
 * - Cross-hatched blob shadow plane at bottom-center pivot
 */
export function createStickmanActor(
  id: number,
  name: string,
  spawnX: number,
  spawnZ: number,
  hatchShadowTex: THREE.CanvasTexture,
  outlineMat: THREE.Material
): StickmanActor {
  const group = new THREE.Group();
  group.position.set(spawnX, 0, spawnZ);

  const blackCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1a,
    roughness: 0.78,
    metalness: 0.08,
  });
  const whitePaperMat = new THREE.MeshStandardMaterial({
    color: 0xfaf8f2,
    roughness: 0.45,
    metalness: 0.05,
  });
  const penInkMat = new THREE.MeshBasicMaterial({ color: 0x111110 });

  // Grounded Cross-Hatched Blob Shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.45, 1.45),
    new THREE.MeshBasicMaterial({
      map: hatchShadowTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  // Glue puddle indicator (hidden unless glued)
  const gluePuddle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 0.05, 14),
    new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      roughness: 0.2,
      metalness: 0.1,
    })
  );
  gluePuddle.position.y = 0.03;
  gluePuddle.visible = false;
  group.add(gluePuddle);

  // Lower Body Group (Legs + White Sneakers with laces)
  const lowerGroup = new THREE.Group();
  lowerGroup.position.set(0, 0, 0);
  group.add(lowerGroup);

  const legGeo = new THREE.CylinderGeometry(0.09, 0.085, 0.92, 8);
  const shoeBodyGeo = new THREE.BoxGeometry(0.28, 0.18, 0.52);
  const shoeToeGeo = new THREE.SphereGeometry(0.145, 10, 8);
  const laceGeo = new THREE.BoxGeometry(0.29, 0.025, 0.035);

  const buildLegWithSneaker = (offsetX: number): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(offsetX, 0.95, 0);

    addOutlinedMesh(legPivot, legGeo, blackCharcoalMat, outlineMat, [0, -0.42, 0]);

    // White Sneaker Group at foot
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.86, 0.09);
    legPivot.add(shoeGroup);

    addOutlinedMesh(shoeGroup, shoeBodyGeo, whitePaperMat, outlineMat, [0, 0, 0]);
    addOutlinedMesh(shoeGroup, shoeToeGeo, whitePaperMat, outlineMat, [0, -0.01, 0.22], [0, 0, 0], [0.98, 0.65, 1.0]);

    // Pen-drawn black sneaker laces (3 crossed stripes)
    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(laceGeo, penInkMat);
      lace.position.set(0, 0.095, -0.02 + l * 0.09);
      shoeGroup.add(lace);
    }

    return legPivot;
  };

  const leftLeg = buildLegWithSneaker(-0.22);
  const rightLeg = buildLegWithSneaker(0.22);
  lowerGroup.add(leftLeg, rightLeg);

  // Upper Body Group (Torso + Arms + Detachable Head)
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 0.95, 0);
  group.add(upperGroup);

  const torsoGeo = new THREE.CylinderGeometry(0.12, 0.105, 0.96, 9);
  addOutlinedMesh(upperGroup, torsoGeo, blackCharcoalMat, outlineMat, [0, 0.48, 0]);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.78, 8);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 0.88, 0);
  addOutlinedMesh(leftArm, armGeo, blackCharcoalMat, outlineMat, [-0.08, -0.34, 0.12], [-0.4, 0, 0.25]);
  upperGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 0.88, 0);
  addOutlinedMesh(rightArm, armGeo, blackCharcoalMat, outlineMat, [0.08, -0.34, 0.18], [-0.65, 0, -0.2]);

  // Mini Ballpoint Pen weapon held in enemy stickman's right hand
  const miniPenGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.75, 8);
  const miniPenMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 });
  addOutlinedMesh(rightArm, miniPenGeo, miniPenMat, outlineMat, [0.08, -0.58, 0.44], [Math.PI / 2, 0, 0]);
  upperGroup.add(rightArm);

  // Detachable Spherical Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.24, 0);
  upperGroup.add(headGroup);

  const headSphereGeo = new THREE.SphereGeometry(0.34, 14, 12);
  addOutlinedMesh(headGroup, headSphereGeo, blackCharcoalMat, outlineMat, [0, 0, 0]);

  // Expressive hollow white doodle eyes
  const eyeGeo = new THREE.SphereGeometry(0.085, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, whitePaperMat);
  leftEye.position.set(-0.12, 0.06, 0.29);
  leftEye.scale.set(1, 1.25, 0.4);
  const rightEye = new THREE.Mesh(eyeGeo, whitePaperMat);
  rightEye.position.set(0.12, 0.06, 0.29);
  rightEye.scale.set(1, 1.25, 0.4);
  headGroup.add(leftEye, rightEye);

  // Whiteout splat on face (shown when hit by Bianchetto)
  const whiteoutSplat = new THREE.Mesh(
    new THREE.SphereGeometry(0.37, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  whiteoutSplat.scale.set(1.02, 0.85, 0.55);
  whiteoutSplat.position.set(0, 0.03, 0.18);
  whiteoutSplat.visible = false;
  headGroup.add(whiteoutSplat);

  return {
    id,
    name,
    group,
    upperGroup,
    lowerGroup,
    headGroup,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    gluePuddle,
    whiteoutSplat,
    position: group.position,
    velocity: new THREE.Vector3(),
    rotationY: 0,
    hp: 6,
    maxHp: 6,
    state: 'alive',
    stateTimer: 0,
    gluedTimer: 0,
    blindedTimer: 0,
    shootCooldown: 1.5 + Math.random(),
    aiTargetAngle: Math.random() * Math.PI * 2,
    upperVel: new THREE.Vector3(),
    headVel: new THREE.Vector3(),
    headWorldPos: new THREE.Vector3(),
  };
}

/**
 * Builds the First-Person Viewmodel attached to the camera:
 * - Left & Right black sketchy Stickman arms/hands (matching the screenshot!)
 * - Active 3D stationery weapon model swapped dynamically
 */
export function createFirstPersonViewmodel(outlineMat: THREE.Material): {
  root: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
} {
  const root = new THREE.Group();
  root.position.set(0, -0.34, -0.68);

  const handMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a18,
    roughness: 0.8,
    metalness: 0.05,
  });

  // Left and Right Stickman Forearms (exactly like the reference screenshot)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.18, -0.18, 0.14);
  leftArm.rotation.set(0.55, 0.35, -0.35);
  addOutlinedMesh(
    leftArm,
    new THREE.CylinderGeometry(0.042, 0.052, 0.52, 8),
    handMat,
    outlineMat
  );
  addOutlinedMesh(
    leftArm,
    new THREE.SphereGeometry(0.062, 8, 8),
    handMat,
    outlineMat,
    [0, 0.25, 0]
  );
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, -0.22, 0.18);
  rightArm.rotation.set(0.65, -0.22, 0.2);
  addOutlinedMesh(
    rightArm,
    new THREE.CylinderGeometry(0.045, 0.055, 0.52, 8),
    handMat,
    outlineMat
  );
  addOutlinedMesh(
    rightArm,
    new THREE.SphereGeometry(0.065, 8, 8),
    handMat,
    outlineMat,
    [0, 0.25, 0]
  );
  root.add(rightArm);

  // Build each of the 9 stationery weapons
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0.12, 0.02, -0.05);
  weaponPivot.rotation.set(0.08, -0.22, 0.05);
  root.add(weaponPivot);

  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;

  // 1. Penna Bic Balistica (Barrel + Blue cone tip + Clip + Yellow rubber band)
  const pennaGroup = new THREE.Group();
  addOutlinedMesh(
    pennaGroup,
    new THREE.CylinderGeometry(0.048, 0.054, 0.56, 10),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.3 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaGroup,
    new THREE.ConeGeometry(0.048, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 }),
    outlineMat,
    [0, 0, -0.35],
    [-Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaGroup,
    new THREE.TorusGeometry(0.056, 0.012, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 }),
    outlineMat,
    [0, 0, -0.18]
  );
  weaponMeshes.penna = pennaGroup;

  // 2. Taglierino (Yellow Box Cutter + Segmented Steel Blade)
  const taglierinoGroup = new THREE.Group();
  addOutlinedMesh(
    taglierinoGroup,
    new THREE.BoxGeometry(0.06, 0.11, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 }),
    outlineMat
  );
  addOutlinedMesh(
    taglierinoGroup,
    new THREE.BoxGeometry(0.014, 0.075, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.2 }),
    outlineMat,
    [0, 0.01, -0.26]
  );
  weaponMeshes.taglierino = taglierinoGroup;

  // 3. Tubetto di Colla (White bottle + Orange applicator nozzle)
  const collaGroup = new THREE.Group();
  addOutlinedMesh(
    collaGroup,
    new THREE.CylinderGeometry(0.065, 0.075, 0.36, 12),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    collaGroup,
    new THREE.ConeGeometry(0.042, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }),
    outlineMat,
    [0, 0, -0.25],
    [-Math.PI / 2, 0, 0]
  );
  weaponMeshes.colla = collaGroup;

  // 4. Cucchiaio di Metallo (Long stainless handle + Concave spoon bowl)
  const cucchiaioGroup = new THREE.Group();
  addOutlinedMesh(
    cucchiaioGroup,
    new THREE.BoxGeometry(0.032, 0.018, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.82, roughness: 0.18 }),
    outlineMat
  );
  addOutlinedMesh(
    cucchiaioGroup,
    new THREE.SphereGeometry(0.095, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 }),
    outlineMat,
    [0, 0.01, -0.26],
    [0, 0, 0],
    [0.85, 0.38, 1.35]
  );
  weaponMeshes.cucchiaio = cucchiaioGroup;

  // 5. Bianchetto (Red/White Correction Fluid bottle + Brush tip)
  const bianchettoGroup = new THREE.Group();
  addOutlinedMesh(
    bianchettoGroup,
    new THREE.BoxGeometry(0.11, 0.14, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.45 }),
    outlineMat
  );
  addOutlinedMesh(
    bianchettoGroup,
    new THREE.CylinderGeometry(0.025, 0.038, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
    outlineMat,
    [0, 0, -0.21],
    [Math.PI / 2, 0, 0]
  );
  weaponMeshes.bianchetto = bianchettoGroup;

  // 6. Forbici (Red finger loops + Crossed silver blades)
  const forbiciGroup = new THREE.Group();
  addOutlinedMesh(
    forbiciGroup,
    new THREE.BoxGeometry(0.016, 0.045, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 }),
    outlineMat,
    [0, 0.02, -0.14],
    [0.14, 0, 0]
  );
  addOutlinedMesh(
    forbiciGroup,
    new THREE.BoxGeometry(0.016, 0.045, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 }),
    outlineMat,
    [0, -0.02, -0.14],
    [-0.14, 0, 0]
  );
  addOutlinedMesh(
    forbiciGroup,
    new THREE.TorusGeometry(0.045, 0.014, 8, 14),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }),
    outlineMat,
    [0, 0.05, 0.08],
    [0, Math.PI / 2, 0]
  );
  weaponMeshes.forbici = forbiciGroup;

  // 7. Elastici (Wooden slingshot fork + stretched green rubber band)
  const elasticiGroup = new THREE.Group();
  addOutlinedMesh(
    elasticiGroup,
    new THREE.CylinderGeometry(0.028, 0.032, 0.26, 8),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 }),
    outlineMat,
    [0, -0.08, -0.05]
  );
  addOutlinedMesh(
    elasticiGroup,
    new THREE.TorusGeometry(0.08, 0.014, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }),
    outlineMat,
    [0, 0.05, -0.12],
    [Math.PI / 2, 0, 0]
  );
  weaponMeshes.elastici = elasticiGroup;

  // 8. Cerbottana (Striped plastic straw + spitball)
  const cerbottanaGroup = new THREE.Group();
  addOutlinedMesh(
    cerbottanaGroup,
    new THREE.CylinderGeometry(0.026, 0.026, 0.68, 10),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 }),
    outlineMat,
    [0, 0, -0.12],
    [Math.PI / 2, 0, 0]
  );
  weaponMeshes.cerbottana = cerbottanaGroup;

  // 9. Gomma da Cancellare (Pink & Blue classic bevelled school eraser)
  const gommaGroup = new THREE.Group();
  addOutlinedMesh(
    gommaGroup,
    new THREE.BoxGeometry(0.12, 0.065, 0.16),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.65 }),
    outlineMat,
    [0, 0, -0.04]
  );
  addOutlinedMesh(
    gommaGroup,
    new THREE.BoxGeometry(0.12, 0.065, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.65 }),
    outlineMat,
    [0, 0, -0.165]
  );
  weaponMeshes.gomma = gommaGroup;

  (Object.keys(weaponMeshes) as WeaponId[]).forEach((key) => {
    weaponMeshes[key].visible = key === 'penna';
    weaponPivot.add(weaponMeshes[key]);
  });

  return { root, weaponMeshes };
}
