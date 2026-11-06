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
  leftKnee: THREE.Group;
  rightLeg: THREE.Group;
  rightKnee: THREE.Group;
  leftArm: THREE.Group;
  leftElbow: THREE.Group;
  rightArm: THREE.Group;
  rightElbow: THREE.Group;
  gluePuddle: THREE.Mesh;
  whiteoutSplat: THREE.Mesh;
  redPenMark: THREE.Mesh;
  corkHelmet: THREE.Mesh;
  notebookShield: THREE.Group;
  muzzleFlashGroup: THREE.Group;
  hitStarsGroup: THREE.Group;
  hitPopTimer: number;
  muzzlePopTimer: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  hp: number;
  maxHp: number;
  state: 'alive' | 'sliced' | 'decapitated' | 'ragdoll' | 'flushed' | 'electrocuted';
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
  bottomY?: number;
  topY: number;
  label: string;
  isBouncePad?: boolean;
  isDuck?: boolean;
  isToaster?: boolean;
  isTapeTrap?: boolean;
  isMouseTrap?: boolean;
  isSoap?: boolean;
  isVentDuct?: boolean;
  isBookBridge?: boolean;
}

export const boilingTimeUniform = { value: 0 };

/**
 * Crisp, well-defined hand-drawn ink outline shader.
 * Uses smooth sinusoidal boiling (no spiky vertex splitting on cube corners!)
 * and respects non-uniform scale so small and scaled parts always have a clean, uniform contour.
 */
export function createBoilingOutlineMaterial(
  thickness = 0.022,
  jitterAmount = 0.0025
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: boilingTimeUniform,
      uOutlineWidth: { value: thickness },
      uJitter: { value: jitterAmount },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uOutlineWidth;
      uniform float uJitter;
      void main() {
        float steppedTime = floor(uTime * 12.0);
        // Smooth continuous wave instead of discontinuous hash so box corners never split open
        float wave = sin(position.x * 9.0 + position.y * 11.0 + position.z * 7.0 + steppedTime * 2.1) * uJitter;
        // Compensate for per-axis scale so scaled meshes keep a uniform ink border
        vec3 scaleComp = vec3(
          1.0 / max(length(modelMatrix[0].xyz), 0.08),
          1.0 / max(length(modelMatrix[1].xyz), 0.08),
          1.0 / max(length(modelMatrix[2].xyz), 0.08)
        );
        vec3 displaced = position + normalize(normal) * scaleComp * (uOutlineWidth + wave);
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

/**
 * High-contrast hand-shaded charcoal texture for Stickman heads, limbs, and 1st-person arms
 */
export function createCharcoalStickmanTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(88, 76, 12, 128, 128, 148);
  grad.addColorStop(0, '#686864');
  grad.addColorStop(0.3, '#2d2d2a');
  grad.addColorStop(0.75, '#171715');
  grad.addColorStop(1, '#0e0e0d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Clean diagonal charcoal pencil strokes
  ctx.strokeStyle = 'rgba(245, 242, 232, 0.14)';
  ctx.lineWidth = 2.0;
  for (let i = -256; i < 256; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 240, 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Clean, flat, un-crumpled sketch paper texture with subtle paper tooth & light quadretti lines
 */
export function createGraphPaperTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm ivory drawing paper base (flat & clean, NO crumpled creases!)
  ctx.fillStyle = '#f6f3ea';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle fine paper tooth speckles
  ctx.fillStyle = 'rgba(28, 26, 23, 0.022)';
  for (let i = 0; i < 450; i++) {
    const px = (i * 73) % 512;
    const py = (i * 137) % 512;
    ctx.fillRect(px, py, 2, 2);
  }

  // Crisp quadretti grid lines
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.13)';
  ctx.lineWidth = 1.2;
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

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Crisp colored-pencil texture with clean diagonal strokes & bold black ink edge border
 */
export function createCrossHatchPastelTexture(
  hexColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#faf8f0';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = hexColor;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalAlpha = 1.0;

  // Clean diagonal colored-pencil grain
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2.2;
  for (let i = -256; i < 256; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(18, 18, 16, 0.12)';
  ctx.lineWidth = 1.6;
  for (let i = -256; i < 256; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i + 3, 0);
    ctx.lineTo(i + 259, 256);
    ctx.stroke();
  }

  // Clean black ink border around UV tile so every box face has crisp hand-drawn edges
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 5.5;
  ctx.strokeRect(3, 3, 250, 250);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Parallel black ink scribble shadow texture (cast on the paper floor under stickmen & props)
 */
export function createHatchShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(64, 64, 58, 42, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = 'rgba(15, 15, 14, 0.72)';
  ctx.lineWidth = 3.0;
  for (let i = -128; i < 128; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, 6);
    ctx.lineTo(i + 88, 122);
    ctx.stroke();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDottedInkTrailTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  ctx.fillStyle = '#181816';
  ctx.strokeStyle = '#181816';
  ctx.lineCap = 'round';

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

/**
 * Adds a mesh with a clean BackSide ink outline.
 * Disables expensive WebGL shadow-map casting/receiving (since we use hand-drawn cross-hatched
 * floor shadows per GDD), which prevents shadow-acne artifacts on weapons/arms AND doubles FPS!
 */
export function addOutlinedMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  outlineMat: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  freezeMatrix = false
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.scale.set(...scale);

  const outline = new THREE.Mesh(geometry, outlineMat);
  mesh.add(outline);

  if (freezeMatrix) {
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    outline.updateMatrix();
    outline.matrixAutoUpdate = false;
  }

  parent.add(mesh);
  return mesh;
}

/**
 * Clean 3D Comic Starburst (used for Muzzle Flashes & Chest Hit Bursts)
 */
export function createComicStarburstGroup(outlineMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const redMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
  const blueMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

  const spikeGeo = new THREE.ConeGeometry(0.14, 0.52, 4);
  for (let i = 0; i < 4; i++) {
    const spike = new THREE.Mesh(spikeGeo, yellowMat);
    spike.rotation.z = (i * Math.PI) / 2 + 0.35;
    spike.scale.z = 0.3;
    group.add(spike);
  }

  const starGeo = new THREE.OctahedronGeometry(0.11, 0);
  const starColors = [redMat, yellowMat, blueMat];
  starColors.forEach((mat, idx) => {
    const angle = (idx * Math.PI * 2) / starColors.length + 0.2;
    const star = addOutlinedMesh(
      group,
      starGeo,
      mat,
      outlineMat,
      [Math.cos(angle) * 0.48, Math.sin(angle) * 0.48, 0.06],
      [0, 0, angle],
      [1, 1, 0.35]
    );
    star.matrixAutoUpdate = true;
  });

  return group;
}

// Shared Stickman Geometries (allocated once for all bots -> Zero memory bloat!)
const STICK_THIGH_GEO = new THREE.CylinderGeometry(0.1, 0.09, 0.48, 10);
const STICK_CALF_GEO = new THREE.CylinderGeometry(0.09, 0.082, 0.48, 10);
const STICK_JOINT_GEO = new THREE.SphereGeometry(0.095, 8, 8);
const STICK_SHOE_GEO = new THREE.BoxGeometry(0.32, 0.22, 0.58);
const STICK_SOLE_GEO = new THREE.BoxGeometry(0.34, 0.06, 0.6);
const STICK_LACE_GEO = new THREE.BoxGeometry(0.33, 0.028, 0.04);
const STICK_TORSO_GEO = new THREE.CylinderGeometry(0.14, 0.12, 0.98, 10);
const STICK_ARM_GEO = new THREE.CylinderGeometry(0.082, 0.075, 0.42, 8);
const STICK_HAND_GEO = new THREE.SphereGeometry(0.105, 8, 8);
const STICK_HEAD_GEO = new THREE.SphereGeometry(0.39, 16, 14);

/**
 * Clean, Well-Defined Stickman Ragdoll Actor
 */
export function createStickmanActor(
  id: number,
  name: string,
  spawnX: number,
  spawnZ: number,
  hatchShadowTex: THREE.CanvasTexture,
  outlineMat: THREE.Material,
  charcoalTex?: THREE.CanvasTexture
): StickmanActor {
  const group = new THREE.Group();
  group.position.set(spawnX, 0, spawnZ);

  const blackCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x222220,
    map: charcoalTex || null,
    roughness: 0.65,
    metalness: 0.08,
  });
  const whiteSneakerMat = new THREE.MeshStandardMaterial({
    color: 0xfaf8f2,
    roughness: 0.45,
    metalness: 0.05,
  });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d0, roughness: 0.7 });
  const penInkMat = new THREE.MeshBasicMaterial({ color: 0x111110 });

  // Grounded Cross-Hatched Ink Shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.45),
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
  shadowPlane.position.set(0.18, 0.02, 0.08);
  group.add(shadowPlane);

  const gluePuddle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 })
  );
  gluePuddle.position.y = 0.03;
  gluePuddle.visible = false;
  group.add(gluePuddle);

  const lowerGroup = new THREE.Group();
  group.add(lowerGroup);

  const buildArticulatedLeg = (offsetX: number): { hip: THREE.Group; knee: THREE.Group } => {
    const hip = new THREE.Group();
    hip.position.set(offsetX, 0.96, 0);

    addOutlinedMesh(hip, STICK_THIGH_GEO, blackCharcoalMat, outlineMat, [0, -0.24, 0]);
    const kneeJoint = new THREE.Mesh(STICK_JOINT_GEO, blackCharcoalMat);
    kneeJoint.position.set(0, -0.46, 0);
    hip.add(kneeJoint);

    const knee = new THREE.Group();
    knee.position.set(0, -0.46, 0);
    hip.add(knee);

    addOutlinedMesh(knee, STICK_CALF_GEO, blackCharcoalMat, outlineMat, [0, -0.24, 0]);

    // Clean, well-defined White Sneaker with black sole line & 3 laces
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.44, 0.1);
    knee.add(shoeGroup);

    addOutlinedMesh(shoeGroup, STICK_SHOE_GEO, whiteSneakerMat, outlineMat, [0, 0.02, 0]);
    const sole = new THREE.Mesh(STICK_SOLE_GEO, soleMat);
    sole.position.set(0, -0.09, 0);
    shoeGroup.add(sole);

    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(STICK_LACE_GEO, penInkMat);
      lace.position.set(0, 0.135, -0.04 + l * 0.09);
      shoeGroup.add(lace);
    }

    return { hip, knee };
  };

  const leftLegBuilt = buildArticulatedLeg(-0.22);
  const rightLegBuilt = buildArticulatedLeg(0.22);
  const leftLeg = leftLegBuilt.hip;
  const leftKnee = leftLegBuilt.knee;
  const rightLeg = rightLegBuilt.hip;
  const rightKnee = rightLegBuilt.knee;
  lowerGroup.add(leftLeg, rightLeg);

  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 0.96, 0);
  group.add(upperGroup);

  addOutlinedMesh(upperGroup, STICK_TORSO_GEO, blackCharcoalMat, outlineMat, [0, 0.48, 0]);

  const redPenMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.06, 0.32),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  redPenMark.position.set(0, 0.55, 0.05);
  redPenMark.rotation.z = 0.45;
  redPenMark.visible = false;
  upperGroup.add(redPenMark);

  const hitStarsGroup = createComicStarburstGroup(outlineMat);
  hitStarsGroup.position.set(0, 0.58, 0.26);
  hitStarsGroup.visible = false;
  upperGroup.add(hitStarsGroup);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 0.88, 0);
  addOutlinedMesh(leftArm, STICK_ARM_GEO, blackCharcoalMat, outlineMat, [0, -0.2, 0]);
  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.4, 0);
  leftArm.add(leftElbow);
  addOutlinedMesh(leftElbow, STICK_ARM_GEO, blackCharcoalMat, outlineMat, [0, -0.2, 0]);
  addOutlinedMesh(leftElbow, STICK_HAND_GEO, blackCharcoalMat, outlineMat, [0, -0.42, 0]);
  upperGroup.add(leftArm);

  // Clean Spiral Notebook Shield
  const notebookShield = new THREE.Group();
  notebookShield.position.set(-0.08, -0.35, 0.28);
  notebookShield.rotation.set(0.25, 0.22, -0.12);
  addOutlinedMesh(
    notebookShield,
    new THREE.BoxGeometry(0.76, 0.86, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.75 }),
    outlineMat
  );
  for (let r = -2; r <= 2; r++) {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.12), penInkMat);
    ring.position.set(r * 0.14, 0.44, 0);
    notebookShield.add(ring);
  }
  notebookShield.visible = id % 2 === 1;
  leftElbow.add(notebookShield);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 0.88, 0);
  addOutlinedMesh(rightArm, STICK_ARM_GEO, blackCharcoalMat, outlineMat, [0, -0.2, 0]);
  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.4, 0);
  rightArm.add(rightElbow);
  addOutlinedMesh(rightElbow, STICK_ARM_GEO, blackCharcoalMat, outlineMat, [0, -0.2, 0]);
  addOutlinedMesh(rightElbow, STICK_HAND_GEO, blackCharcoalMat, outlineMat, [0, -0.42, 0]);

  // Bot's Clean Pen-Rifle
  const miniPenGroup = new THREE.Group();
  miniPenGroup.position.set(0.04, -0.42, 0.25);
  addOutlinedMesh(
    miniPenGroup,
    new THREE.CylinderGeometry(0.052, 0.064, 0.88, 8),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    miniPenGroup,
    new THREE.ConeGeometry(0.052, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b }),
    outlineMat,
    [0, 0, 0.54],
    [Math.PI / 2, 0, 0]
  );

  const muzzleFlashGroup = createComicStarburstGroup(outlineMat);
  muzzleFlashGroup.position.set(0, 0, 0.74);
  muzzleFlashGroup.scale.setScalar(0.6);
  muzzleFlashGroup.visible = false;
  miniPenGroup.add(muzzleFlashGroup);

  rightElbow.add(miniPenGroup);
  upperGroup.add(rightArm);

  // Clean Charcoal Spherical Head with crisp specular highlight
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.32, 0);
  upperGroup.add(headGroup);

  addOutlinedMesh(headGroup, STICK_HEAD_GEO, blackCharcoalMat, outlineMat, [0, 0, 0]);

  const highlightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xa1a1aa })
  );
  highlightMesh.position.set(-0.14, 0.16, 0.29);
  highlightMesh.scale.set(1.1, 0.75, 0.3);
  headGroup.add(highlightMesh);

  const corkHelmet = addOutlinedMesh(
    headGroup,
    new THREE.CylinderGeometry(0.27, 0.22, 0.34, 10),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 }),
    outlineMat,
    [0, 0.4, 0]
  );
  corkHelmet.visible = id % 3 === 0;

  const whiteoutSplat = new THREE.Mesh(
    new THREE.SphereGeometry(0.41, 10, 10),
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
    leftKnee,
    rightLeg,
    rightKnee,
    leftArm,
    leftElbow,
    rightArm,
    rightElbow,
    gluePuddle,
    whiteoutSplat,
    redPenMark,
    corkHelmet,
    notebookShield,
    muzzleFlashGroup,
    hitStarsGroup,
    hitPopTimer: 0,
    muzzlePopTimer: 0,
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
 * Clean, Razor-Sharp First-Person Viewmodel (Arms + 17 Weapons).
 * Uses a dedicated Fine Viewmodel Outline (`0.0052`) so small parts never blob or Z-fight,
 * and clean, bold geometric silhouettes for the Stickman Arms, Hands, and all 17 Weapons!
 */
export function createFirstPersonViewmodel(
  _worldOutlineMat: THREE.Material,
  charcoalTex?: THREE.CanvasTexture
): {
  root: THREE.Group;
  weaponPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  muzzleFlash: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
} {
  // Fine, razor-sharp outline material calibrated specifically for first-person camera distance!
  const vmOutlineMat = createBoilingOutlineMaterial(0.0052, 0.0004);

  const root = new THREE.Group();
  root.position.set(0, -0.29, -0.62);

  const handMat = new THREE.MeshStandardMaterial({
    color: 0x20201e,
    map: charcoalTex || null,
    roughness: 0.58,
    metalness: 0.08,
  });

  // Clean, well-defined Stickman Hand (smooth palm sphere + bold thumb + clean curled grip block — zero Z-fighting!)
  const addCleanStickmanHand = (armGroup: THREE.Group, isLeft: boolean) => {
    const handGroup = new THREE.Group();
    handGroup.position.set(0, 0.28, 0);
    armGroup.add(handGroup);

    // Main rounded Stickman fist/palm
    addOutlinedMesh(
      handGroup,
      new THREE.SphereGeometry(0.062, 14, 12),
      handMat,
      vmOutlineMat,
      [0, 0, 0],
      [0, 0, 0],
      [1.05, 0.95, 1.15]
    );
    // Clean curled fingers block wrapping around the grip
    addOutlinedMesh(
      handGroup,
      new THREE.BoxGeometry(0.055, 0.068, 0.088),
      handMat,
      vmOutlineMat,
      [isLeft ? 0.036 : -0.036, 0.015, 0.01],
      [0, 0, isLeft ? -0.35 : 0.35]
    );
    // Distinct opposing thumb
    addOutlinedMesh(
      handGroup,
      new THREE.CylinderGeometry(0.02, 0.022, 0.075, 10),
      handMat,
      vmOutlineMat,
      [isLeft ? -0.032 : 0.032, 0.045, 0.025],
      [0.35, 0, isLeft ? 0.55 : -0.55]
    );
  };

  // Left Stickman Arm (smooth, well-defined tubular arm reaching from bottom-left to hold the barrel)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.11, -0.17, 0.03);
  leftArm.rotation.set(0.56, 0.44, -0.42);
  addOutlinedMesh(
    leftArm,
    new THREE.CylinderGeometry(0.046, 0.056, 0.58, 14),
    handMat,
    vmOutlineMat
  );
  addCleanStickmanHand(leftArm, true);
  root.add(leftArm);

  // Right Stickman Arm (smooth tubular arm holding the rear trigger grip from bottom-right)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.18, -0.22, 0.14);
  rightArm.rotation.set(0.62, -0.22, 0.2);
  addOutlinedMesh(
    rightArm,
    new THREE.CylinderGeometry(0.048, 0.058, 0.54, 14),
    handMat,
    vmOutlineMat
  );
  addCleanStickmanHand(rightArm, false);
  root.add(rightArm);

  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0.12, 0.02, -0.06);
  weaponPivot.rotation.set(0.05, -0.35, 0.05);
  root.add(weaponPivot);

  const muzzleFlash = createComicStarburstGroup(vmOutlineMat);
  muzzleFlash.position.set(0, 0.01, -0.58);
  muzzleFlash.scale.setScalar(0.42);
  muzzleFlash.visible = false;
  weaponPivot.add(muzzleFlash);

  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;

  // Shared crisp weapon materials
  const silverMetalMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.35,
    metalness: 0.3,
  });
  const slateGripMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.4,
  });
  const rubberYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.5,
  });
  const woodHandleMat = new THREE.MeshStandardMaterial({
    color: 0xc27838,
    roughness: 0.7,
  });

  // 1. Penna Blu Bic (Clean hexagonal transparent barrel + dark inner ink core + blue cone + blue cap clip)
  const pennaBic = new THREE.Group();
  addOutlinedMesh(
    pennaBic,
    new THREE.CylinderGeometry(0.032, 0.032, 0.62, 8),
    new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.25 }),
    vmOutlineMat,
    [0, 0, 0.02],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaBic,
    new THREE.ConeGeometry(0.032, 0.14, 10),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 }),
    vmOutlineMat,
    [0, 0, -0.36],
    [-Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaBic,
    new THREE.CylinderGeometry(0.034, 0.034, 0.08, 10),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 }),
    vmOutlineMat,
    [0, 0, 0.35],
    [Math.PI / 2, 0, 0]
  );
  weaponMeshes.penna_bic = pennaBic;

  // 2. Penna a Scatto (Clean, crisp hero weapon from the screenshot: silver barrel, blue-slate grip,
  // 2 clean yellow rubber bands, top pocket clip, lower trigger grip, and rear clicker plunger)
  const pennaScatto = new THREE.Group();
  // Main silver body
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.048, 0.056, 0.48, 14),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, 0.05],
    [Math.PI / 2, 0, 0]
  );
  // Front blue-slate grip section
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.04, 0.048, 0.2, 14),
    slateGripMat,
    vmOutlineMat,
    [0, 0, -0.29],
    [Math.PI / 2, 0, 0]
  );
  // Conical metallic tip
  addOutlinedMesh(
    pennaScatto,
    new THREE.ConeGeometry(0.04, 0.14, 12),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, -0.46],
    [-Math.PI / 2, 0, 0]
  );
  // Top pocket clip (raised cleanly above barrel so there is zero Z-fighting!)
  addOutlinedMesh(
    pennaScatto,
    new THREE.BoxGeometry(0.022, 0.024, 0.24),
    silverMetalMat,
    vmOutlineMat,
    [0, 0.068, 0.08]
  );
  // Lower trigger grip handle
  addOutlinedMesh(
    pennaScatto,
    new THREE.BoxGeometry(0.038, 0.19, 0.08),
    slateGripMat,
    vmOutlineMat,
    [0.015, -0.12, 0.12],
    [0.22, 0, 0]
  );
  // Rear clicker button
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.036, 0.04, 0.09, 12),
    darkIronMat,
    vmOutlineMat,
    [0, 0, 0.33],
    [Math.PI / 2, 0, 0]
  );
  // Clean yellow rubber band rings around front & rear barrel
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.053, 0.053, 0.035, 14),
    rubberYellowMat,
    vmOutlineMat,
    [0, 0, -0.17],
    [Math.PI / 2 + 0.12, 0, 0]
  );
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.06, 0.06, 0.035, 14),
    rubberYellowMat,
    vmOutlineMat,
    [0, 0, 0.17],
    [Math.PI / 2 - 0.1, 0, 0]
  );
  weaponMeshes.penna_scatto = pennaScatto;

  // 3. Spillatrice / Sparapunti (Crisp two-piece stapler with red top cap & steel jaw)
  const spillatrice = new THREE.Group();
  addOutlinedMesh(
    spillatrice,
    new THREE.BoxGeometry(0.075, 0.09, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }),
    vmOutlineMat,
    [0, 0.03, -0.06],
    [0.06, 0, 0]
  );
  addOutlinedMesh(
    spillatrice,
    new THREE.BoxGeometry(0.08, 0.03, 0.46),
    silverMetalMat,
    vmOutlineMat,
    [0, -0.04, -0.06]
  );
  weaponMeshes.spillatrice = spillatrice;

  // 4. Pennarello Indelebile (Bold thick marker bazooka with white label band & chisel felt tip)
  const pennarello = new THREE.Group();
  addOutlinedMesh(
    pennarello,
    new THREE.CylinderGeometry(0.068, 0.068, 0.48, 14),
    darkIronMat,
    vmOutlineMat,
    [0, 0, -0.02],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennarello,
    new THREE.CylinderGeometry(0.071, 0.071, 0.22, 14),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
    vmOutlineMat,
    [0, 0, 0.02],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennarello,
    new THREE.ConeGeometry(0.055, 0.14, 8),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 }),
    vmOutlineMat,
    [0, 0, -0.32],
    [-Math.PI / 2, 0, 0]
  );
  weaponMeshes.pennarello = pennarello;

  // 5. Pistola Colla a Caldo (Orange glue gun body + angled handle + yellow brass nozzle + white glue stick)
  const collaCaldo = new THREE.Group();
  addOutlinedMesh(
    collaCaldo,
    new THREE.BoxGeometry(0.068, 0.11, 0.34),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }),
    vmOutlineMat,
    [0, 0.02, -0.05]
  );
  addOutlinedMesh(
    collaCaldo,
    new THREE.BoxGeometry(0.052, 0.18, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.45 }),
    vmOutlineMat,
    [0, -0.1, 0.06],
    [0.25, 0, 0]
  );
  addOutlinedMesh(
    collaCaldo,
    new THREE.ConeGeometry(0.032, 0.12, 10),
    rubberYellowMat,
    vmOutlineMat,
    [0, 0.02, -0.28],
    [-Math.PI / 2, 0, 0]
  );
  weaponMeshes.colla_caldo = collaCaldo;

  // 6. Taglierino a Scatti (Yellow ribbed utility cutter + silver segmented diagonal blade)
  const taglierino = new THREE.Group();
  addOutlinedMesh(
    taglierino,
    new THREE.BoxGeometry(0.052, 0.095, 0.38),
    rubberYellowMat,
    vmOutlineMat,
    [0, 0, -0.02]
  );
  addOutlinedMesh(
    taglierino,
    new THREE.BoxGeometry(0.014, 0.072, 0.24),
    silverMetalMat,
    vmOutlineMat,
    [0, 0.005, -0.28]
  );
  weaponMeshes.taglierino = taglierino;

  // 7. Cucchiaio di Metallo (Sleek silver handle + crisp concave-look oval spoon bowl)
  const cucchiaio = new THREE.Group();
  addOutlinedMesh(
    cucchiaio,
    new THREE.CylinderGeometry(0.018, 0.024, 0.44, 10),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, 0.02],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    cucchiaio,
    new THREE.SphereGeometry(0.085, 14, 12),
    silverMetalMat,
    vmOutlineMat,
    [0, 0.01, -0.27],
    [0, 0, 0],
    [0.85, 0.35, 1.35]
  );
  weaponMeshes.cucchiaio = cucchiaio;

  // 8. Mestolo di Legno (Warm wooden handle + deep rounded wooden ladle bowl)
  const mestolo = new THREE.Group();
  addOutlinedMesh(
    mestolo,
    new THREE.CylinderGeometry(0.024, 0.028, 0.48, 10),
    woodHandleMat,
    vmOutlineMat,
    [0, 0, 0.02],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    mestolo,
    new THREE.SphereGeometry(0.105, 14, 12),
    woodHandleMat,
    vmOutlineMat,
    [0, 0.02, -0.29],
    [0, 0, 0],
    [1.0, 0.6, 1.1]
  );
  weaponMeshes.mestolo = mestolo;

  // 9. Righello 30 cm (Crisp flat yellow ruler blade with black centimeter tick marks)
  const righello = new THREE.Group();
  addOutlinedMesh(
    righello,
    new THREE.BoxGeometry(0.085, 0.018, 0.64),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 }),
    vmOutlineMat,
    [0, 0, -0.14]
  );
  weaponMeshes.righello = righello;

  // 10. Forchetta Lanciabile (Crisp 3-pronged silver fork with well-spaced tines so outlines never merge!)
  const forchetta = new THREE.Group();
  addOutlinedMesh(
    forchetta,
    new THREE.CylinderGeometry(0.018, 0.022, 0.36, 10),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, 0.04],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    forchetta,
    new THREE.BoxGeometry(0.095, 0.02, 0.04),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, -0.15]
  );
  [-0.036, 0, 0.036].forEach((xOff) => {
    addOutlinedMesh(
      forchetta,
      new THREE.CylinderGeometry(0.008, 0.011, 0.16, 8),
      silverMetalMat,
      vmOutlineMat,
      [xOff, 0, -0.25],
      [Math.PI / 2, 0, 0]
    );
  });
  weaponMeshes.forchetta = forchetta;

  // 11. Padella in Ghisa (Cast-iron skillet pan with raised rim & handle)
  const padella = new THREE.Group();
  addOutlinedMesh(
    padella,
    new THREE.CylinderGeometry(0.2, 0.18, 0.05, 16),
    darkIronMat,
    vmOutlineMat,
    [0, 0.05, -0.26],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    padella,
    new THREE.CylinderGeometry(0.024, 0.028, 0.32, 10),
    darkIronMat,
    vmOutlineMat,
    [0, -0.02, 0.02],
    [Math.PI / 2 - 0.2, 0, 0]
  );
  weaponMeshes.padella = padella;

  // 12. Spugna Assorbi-Liquidi (Two-tone yellow/green kitchen sponge with non-overlapping layers)
  const spugna = new THREE.Group();
  addOutlinedMesh(
    spugna,
    new THREE.BoxGeometry(0.16, 0.075, 0.24),
    rubberYellowMat,
    vmOutlineMat,
    [0, -0.01, -0.1]
  );
  addOutlinedMesh(
    spugna,
    new THREE.BoxGeometry(0.16, 0.032, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),
    vmOutlineMat,
    [0, 0.048, -0.1]
  );
  weaponMeshes.spugna = spugna;

  // 13. Gomma da Cancellare (Iconic pink/blue two-part school eraser)
  const gomma = new THREE.Group();
  addOutlinedMesh(
    gomma,
    new THREE.BoxGeometry(0.12, 0.065, 0.16),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 }),
    vmOutlineMat,
    [0, 0, -0.03]
  );
  addOutlinedMesh(
    gomma,
    new THREE.BoxGeometry(0.12, 0.065, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 }),
    vmOutlineMat,
    [0, 0, -0.16]
  );
  weaponMeshes.gomma = gomma;

  // 14. Molletta da Bucato (Two angled wooden jaws + central metal spring cylinder)
  const molletta = new THREE.Group();
  addOutlinedMesh(
    molletta,
    new THREE.BoxGeometry(0.055, 0.035, 0.3),
    woodHandleMat,
    vmOutlineMat,
    [0, 0.032, -0.1],
    [0.09, 0, 0]
  );
  addOutlinedMesh(
    molletta,
    new THREE.BoxGeometry(0.055, 0.035, 0.3),
    woodHandleMat,
    vmOutlineMat,
    [0, -0.032, -0.1],
    [-0.09, 0, 0]
  );
  addOutlinedMesh(
    molletta,
    new THREE.CylinderGeometry(0.022, 0.022, 0.07, 10),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, -0.08],
    [0, 0, Math.PI / 2]
  );
  weaponMeshes.molletta = molletta;

  // 15. Lampadina & Batteria AA (Glowing glass bulb + metallic screw base)
  const lampadina = new THREE.Group();
  addOutlinedMesh(
    lampadina,
    new THREE.SphereGeometry(0.11, 14, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.35,
    }),
    vmOutlineMat,
    [0, 0.04, -0.15]
  );
  addOutlinedMesh(
    lampadina,
    new THREE.CylinderGeometry(0.055, 0.05, 0.1, 12),
    silverMetalMat,
    vmOutlineMat,
    [0, -0.07, -0.15]
  );
  weaponMeshes.lampadina = lampadina;

  // 16. Phon Asciugacapelli (Cyan hairdryer barrel + angled black handle)
  const phon = new THREE.Group();
  addOutlinedMesh(
    phon,
    new THREE.CylinderGeometry(0.075, 0.095, 0.34, 14),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.35 }),
    vmOutlineMat,
    [0, 0.06, -0.12],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    phon,
    new THREE.CylinderGeometry(0.038, 0.044, 0.24, 12),
    darkIronMat,
    vmOutlineMat,
    [0, -0.1, 0.02],
    [0.2, 0, 0]
  );
  weaponMeshes.phon = phon;

  // 17. Puntatore Laser & Gomitolo (Sleek silver laser pen + glowing red emitter tip)
  const laserGatto = new THREE.Group();
  addOutlinedMesh(
    laserGatto,
    new THREE.CylinderGeometry(0.026, 0.026, 0.36, 12),
    silverMetalMat,
    vmOutlineMat,
    [0, 0, -0.12],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    laserGatto,
    new THREE.SphereGeometry(0.03, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
    vmOutlineMat,
    [0, 0, -0.31]
  );
  weaponMeshes.laser_gatto = laserGatto;

  (Object.keys(weaponMeshes) as WeaponId[]).forEach((key) => {
    weaponMeshes[key].visible = key === 'penna_scatto';
    weaponPivot.add(weaponMeshes[key]);
  });

  return { root, weaponPivot, leftArm, rightArm, muzzleFlash, weaponMeshes };
}

/**
 * Giant Landlord Boss ("Il Padrone di Casa" with Apron & Giant Broom)
 */
export function createPadroneBoss(outlineMat: THREE.Material): {
  group: THREE.Group;
  broomPivot: THREE.Group;
} {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });

  addOutlinedMesh(
    group,
    new THREE.CylinderGeometry(0.95, 1.1, 4.8, 12),
    bodyMat,
    outlineMat,
    [0, 2.4, 0]
  );
  addOutlinedMesh(
    group,
    new THREE.BoxGeometry(1.9, 3.2, 1.4),
    apronMat,
    outlineMat,
    [0, 2.5, 0.35]
  );
  addOutlinedMesh(
    group,
    new THREE.SphereGeometry(1.15, 14, 12),
    skinMat,
    outlineMat,
    [0, 5.7, 0]
  );

  const broomPivot = new THREE.Group();
  broomPivot.position.set(1.4, 3.8, 0.6);
  addOutlinedMesh(
    broomPivot,
    new THREE.CylinderGeometry(0.14, 0.14, 5.6, 8),
    new THREE.MeshStandardMaterial({ color: 0xb45309 }),
    outlineMat,
    [0, -1.6, 0.8],
    [0.3, 0, 0]
  );
  addOutlinedMesh(
    broomPivot,
    new THREE.BoxGeometry(2.6, 0.8, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xd97706 }),
    outlineMat,
    [0, -3.9, 1.6]
  );
  group.add(broomPivot);
  group.scale.setScalar(2.4);

  return { group, broomPivot };
}

/**
 * Giant Sketch Cat Boss ("Il Gatto Disastro")
 */
export function createGattoBoss(outlineMat: THREE.Material): {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  tailPivot: THREE.Group;
  pawPivot: THREE.Group;
  openEyesGroup: THREE.Group;
  closedEyesGroup: THREE.Group;
  purrWaveRing: THREE.Mesh;
  sleepZzzGroup: THREE.Group;
} {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const catFurMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.65 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const eyelidMat = new THREE.MeshBasicMaterial({ color: 0xfaf8f2 });

  addOutlinedMesh(
    bodyGroup,
    new THREE.SphereGeometry(1.6, 14, 12),
    catFurMat,
    outlineMat,
    [0, 1.5, 0],
    [0, 0, 0],
    [1.15, 0.85, 1.65]
  );

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.6, 1.8);
  bodyGroup.add(headGroup);

  addOutlinedMesh(
    headGroup,
    new THREE.SphereGeometry(1.25, 14, 12),
    catFurMat,
    outlineMat,
    [0, 0, 0]
  );
  addOutlinedMesh(
    headGroup,
    new THREE.ConeGeometry(0.45, 0.95, 6),
    catFurMat,
    outlineMat,
    [-0.65, 1.1, 0],
    [0, 0, 0.25]
  );
  addOutlinedMesh(
    headGroup,
    new THREE.ConeGeometry(0.45, 0.95, 6),
    catFurMat,
    outlineMat,
    [0.65, 1.1, 0],
    [0, 0, -0.25]
  );

  const openEyesGroup = new THREE.Group();
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
  lEye.position.set(-0.45, 0.15, 1.1);
  const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
  rEye.position.set(0.45, 0.15, 1.1);
  openEyesGroup.add(lEye, rEye);
  headGroup.add(openEyesGroup);

  const closedEyesGroup = new THREE.Group();
  closedEyesGroup.visible = false;
  const lidGeo = new THREE.BoxGeometry(0.48, 0.08, 0.12);
  const lLid = new THREE.Mesh(lidGeo, eyelidMat);
  lLid.position.set(-0.45, 0.12, 1.14);
  lLid.rotation.z = -0.12;
  const rLid = new THREE.Mesh(lidGeo, eyelidMat);
  rLid.position.set(0.45, 0.12, 1.14);
  rLid.rotation.z = 0.12;
  closedEyesGroup.add(lLid, rLid);
  headGroup.add(closedEyesGroup);

  const pawPivot = new THREE.Group();
  pawPivot.position.set(0.9, 1.2, 2.1);
  addOutlinedMesh(
    pawPivot,
    new THREE.SphereGeometry(0.55, 10, 10),
    catFurMat,
    outlineMat,
    [0, 0, 0.6]
  );
  bodyGroup.add(pawPivot);

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 1.8, -2.4);
  addOutlinedMesh(
    tailPivot,
    new THREE.CylinderGeometry(0.22, 0.16, 3.2, 8),
    catFurMat,
    outlineMat,
    [0, 1.2, -0.8],
    [-0.6, 0, 0]
  );
  bodyGroup.add(tailPivot);

  const purrWaveRing = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 3.3, 28),
    new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  purrWaveRing.rotation.x = -Math.PI / 2;
  purrWaveRing.position.y = 0.06;
  purrWaveRing.visible = false;
  group.add(purrWaveRing);

  const sleepZzzGroup = new THREE.Group();
  sleepZzzGroup.position.set(0, 4.2, 1.5);
  sleepZzzGroup.visible = false;

  const zMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  for (let i = 0; i < 3; i++) {
    const zItem = new THREE.Group();
    zItem.position.set(i * 0.65 - 0.5, i * 0.85, 0);
    const barTop = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.06), zMat);
    barTop.position.y = 0.2;
    const barDiag = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.06), zMat);
    barDiag.rotation.z = 0.72;
    const barBot = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.06), zMat);
    barBot.position.y = -0.2;
    zItem.add(barTop, barDiag, barBot);
    sleepZzzGroup.add(zItem);
  }

  const mosqMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
  const wingMat = new THREE.MeshBasicMaterial({ color: 0xfafaf9 });
  for (let m = 0; m < 2; m++) {
    const mosq = new THREE.Group();
    const mBody = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), mosqMat);
    const mWingL = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), wingMat);
    mWingL.position.set(-0.14, 0.1, 0);
    const mWingR = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), wingMat);
    mWingR.position.set(0.14, 0.1, 0);
    mosq.add(mBody, mWingL, mWingR);
    mosq.position.set(Math.cos(m * Math.PI) * 1.6, 0.8 + m * 0.5, Math.sin(m * Math.PI) * 1.6);
    sleepZzzGroup.add(mosq);
  }

  group.add(sleepZzzGroup);
  group.scale.setScalar(2.2);

  return {
    group,
    bodyGroup,
    headGroup,
    tailPivot,
    pawPivot,
    openEyesGroup,
    closedEyesGroup,
    purrWaveRing,
    sleepZzzGroup,
  };
}
