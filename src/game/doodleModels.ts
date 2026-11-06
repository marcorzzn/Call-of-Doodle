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
  redPenMark: THREE.Mesh;
  corkHelmet: THREE.Mesh;
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
  topY: number;
  label: string;
  isBouncePad?: boolean;
  isDuck?: boolean;
  isToaster?: boolean;
  isTapeTrap?: boolean;
  isMouseTrap?: boolean;
  isSoap?: boolean;
}

export const boilingTimeUniform = { value: 0 };

export function createBoilingOutlineMaterial(thickness = 0.036): THREE.ShaderMaterial {
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
        gl_FragColor = vec4(0.06, 0.06, 0.05, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
}

/**
 * Charcoal-shaded texture for Stickman heads & limbs (matches screenshot's hand-shaded black graphite look!)
 */
export function createCharcoalStickmanTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(88, 76, 12, 128, 128, 140);
  grad.addColorStop(0, '#6b6b68');
  grad.addColorStop(0.28, '#2b2b29');
  grad.addColorStop(0.75, '#161614');
  grad.addColorStop(1, '#0c0c0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Diagonal charcoal pencil strokes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  for (let i = -256; i < 256; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createGraphPaperTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Crumpled warm sketch paper base (matches screenshot!)
  ctx.fillStyle = '#f5f2e9';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle crumpled paper crease shadows
  ctx.strokeStyle = 'rgba(120, 113, 100, 0.11)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(260, 270);
  ctx.lineTo(512, 220);
  ctx.moveTo(250, 0);
  ctx.lineTo(270, 512);
  ctx.stroke();

  // Fine quadretti grid lines
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.16)';
  ctx.lineWidth = 1.5;
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

export function createCrossHatchPastelTexture(
  hexColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 256, 256);

  // Colored pencil diagonal texture strokes (identical to screenshot books & Post-its)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  for (let i = -256; i < 256; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(20, 20, 18, 0.24)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 256; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 212 + (i % 13));
    ctx.lineTo(i + 22, 256);
    ctx.stroke();
  }

  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 7;
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
  ctx.ellipse(64, 64, 58, 42, 0, 0, Math.PI * 2);
  ctx.clip();

  // Sharp parallel pencil hatching shadow lines (exactly like under the stickmen in screenshot!)
  ctx.strokeStyle = 'rgba(18, 18, 16, 0.68)';
  ctx.lineWidth = 2.8;
  for (let i = -128; i < 128; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 96, 128);
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
 * Stickman Ragdoll Actor faithful to the attached screenshot:
 * - Solid charcoal-shaded spherical head with pencil specular highlight (no weird eyes)
 * - Tubular charcoal limbs with boiling black ink outline
 * - Crisp white sneakers with black pen laces & sole rim
 * - Optional Cork Helmet ("Tappo di Sughero") & Red Ruler Slash mark
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
    roughness: 0.58,
    metalness: 0.12,
  });
  const whiteSneakerMat = new THREE.MeshStandardMaterial({
    color: 0xfaf8f2,
    roughness: 0.4,
    metalness: 0.05,
  });
  const penInkMat = new THREE.MeshBasicMaterial({ color: 0x111110 });

  // Grounded Cross-Hatched Shadow (like screenshot!)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 1.35),
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
  shadowPlane.position.set(0.15, 0.02, 0.08);
  group.add(shadowPlane);

  const gluePuddle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 0.05, 14),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 })
  );
  gluePuddle.position.y = 0.03;
  gluePuddle.visible = false;
  group.add(gluePuddle);

  // Lower Body Group
  const lowerGroup = new THREE.Group();
  group.add(lowerGroup);

  const legGeo = new THREE.CylinderGeometry(0.095, 0.09, 0.92, 10);
  const shoeBodyGeo = new THREE.BoxGeometry(0.3, 0.19, 0.54);
  const shoeToeGeo = new THREE.SphereGeometry(0.155, 10, 8);
  const laceGeo = new THREE.BoxGeometry(0.31, 0.028, 0.038);

  const buildLegWithSneaker = (offsetX: number): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(offsetX, 0.95, 0);

    addOutlinedMesh(legPivot, legGeo, blackCharcoalMat, outlineMat, [0, -0.42, 0]);

    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.86, 0.1);
    legPivot.add(shoeGroup);

    addOutlinedMesh(shoeGroup, shoeBodyGeo, whiteSneakerMat, outlineMat, [0, 0, 0]);
    addOutlinedMesh(
      shoeGroup,
      shoeToeGeo,
      whiteSneakerMat,
      outlineMat,
      [0, -0.01, 0.23],
      [0, 0, 0],
      [0.98, 0.68, 1.05]
    );

    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(laceGeo, penInkMat);
      lace.position.set(0, 0.1, -0.02 + l * 0.09);
      shoeGroup.add(lace);
    }

    return legPivot;
  };

  const leftLeg = buildLegWithSneaker(-0.22);
  const rightLeg = buildLegWithSneaker(0.22);
  lowerGroup.add(leftLeg, rightLeg);

  // Upper Body Group
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, 0.95, 0);
  group.add(upperGroup);

  const torsoGeo = new THREE.CylinderGeometry(0.135, 0.12, 0.98, 10);
  addOutlinedMesh(upperGroup, torsoGeo, blackCharcoalMat, outlineMat, [0, 0.48, 0]);

  // Red Pen Mark left by Righello 30cm thrust!
  const redPenMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.06, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  redPenMark.position.set(0, 0.55, 0.05);
  redPenMark.rotation.z = 0.45;
  redPenMark.visible = false;
  upperGroup.add(redPenMark);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.78, 8);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.88, 0);
  addOutlinedMesh(
    leftArm,
    armGeo,
    blackCharcoalMat,
    outlineMat,
    [-0.08, -0.34, 0.12],
    [-0.4, 0, 0.25]
  );
  upperGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.88, 0);
  addOutlinedMesh(
    rightArm,
    armGeo,
    blackCharcoalMat,
    outlineMat,
    [0.08, -0.34, 0.18],
    [-0.65, 0, -0.2]
  );

  const miniPenGeo = new THREE.CylinderGeometry(0.045, 0.06, 0.82, 8);
  const miniPenMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
  addOutlinedMesh(
    rightArm,
    miniPenGeo,
    miniPenMat,
    outlineMat,
    [0.08, -0.58, 0.46],
    [Math.PI / 2, 0, 0]
  );
  upperGroup.add(rightArm);

  // Solid Charcoal Spherical Head (matching the screenshot!)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.28, 0);
  upperGroup.add(headGroup);

  const headSphereGeo = new THREE.SphereGeometry(0.36, 16, 14);
  addOutlinedMesh(headGroup, headSphereGeo, blackCharcoalMat, outlineMat, [0, 0, 0]);

  // Subtle white pencil highlight on upper-left of the black sphere (exactly like screenshot!)
  const highlightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x9ca3af })
  );
  highlightMesh.position.set(-0.14, 0.16, 0.26);
  highlightMesh.scale.set(1.1, 0.75, 0.35);
  headGroup.add(highlightMesh);

  // Optional Cork Helmet ("Tappo di Sughero") on top of head
  const corkHelmet = addOutlinedMesh(
    headGroup,
    new THREE.CylinderGeometry(0.28, 0.23, 0.36, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 }),
    outlineMat,
    [0, 0.38, 0]
  );
  corkHelmet.visible = id % 3 === 0;

  const whiteoutSplat = new THREE.Mesh(
    new THREE.SphereGeometry(0.39, 10, 10),
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
    redPenMark,
    corkHelmet,
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
 * Builds the First-Person Viewmodel matching the screenshot (two charcoal hands + all 17 household/stationery weapons)
 */
export function createFirstPersonViewmodel(
  outlineMat: THREE.Material,
  charcoalTex?: THREE.CanvasTexture
): {
  root: THREE.Group;
  weaponPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
} {
  const root = new THREE.Group();
  root.position.set(0, -0.32, -0.66);

  const handMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e1c,
    map: charcoalTex || null,
    roughness: 0.65,
    metalness: 0.08,
  });

  // Left Stickman Arm (extended forward gripping the barrel, exactly like screenshot!)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.14, -0.16, 0.08);
  leftArm.rotation.set(0.62, 0.42, -0.38);
  addOutlinedMesh(
    leftArm,
    new THREE.CylinderGeometry(0.048, 0.058, 0.58, 10),
    handMat,
    outlineMat
  );
  addOutlinedMesh(
    leftArm,
    new THREE.SphereGeometry(0.072, 10, 10),
    handMat,
    outlineMat,
    [0, 0.28, 0]
  );
  root.add(leftArm);

  // Right Stickman Arm (gripping trigger/rear handle, like screenshot!)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, -0.22, 0.18);
  rightArm.rotation.set(0.68, -0.2, 0.18);
  addOutlinedMesh(
    rightArm,
    new THREE.CylinderGeometry(0.05, 0.06, 0.54, 10),
    handMat,
    outlineMat
  );
  addOutlinedMesh(
    rightArm,
    new THREE.SphereGeometry(0.075, 10, 10),
    handMat,
    outlineMat,
    [0, 0.26, 0]
  );
  root.add(rightArm);

  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0.1, 0.04, -0.06);
  weaponPivot.rotation.set(0.08, -0.24, 0.04);
  root.add(weaponPivot);

  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;

  // 1. Penna Blu Bic (Sniper — Transparent outer barrel + black inner ink tube + blue cap!)
  const pennaBic = new THREE.Group();
  const clearBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.044, 0.72, 6),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.42,
      roughness: 0.15,
    })
  );
  clearBarrel.rotation.x = Math.PI / 2;
  pennaBic.add(clearBarrel);
  // Inner black ink tube visible through the transparent barrel!
  addOutlinedMesh(
    pennaBic,
    new THREE.CylinderGeometry(0.015, 0.015, 0.68, 8),
    new THREE.MeshBasicMaterial({ color: 0x111827 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaBic,
    new THREE.ConeGeometry(0.044, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 }),
    outlineMat,
    [0, 0, -0.42],
    [-Math.PI / 2, 0, 0]
  );
  weaponMeshes.penna_bic = pennaBic;

  // 2. Penna a Scatto (Screenshot Hero Gun with rubber bands, clip & metallic barrel)
  const pennaScatto = new THREE.Group();
  addOutlinedMesh(
    pennaScatto,
    new THREE.CylinderGeometry(0.056, 0.064, 0.62, 12),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.35 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaScatto,
    new THREE.ConeGeometry(0.056, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 }),
    outlineMat,
    [0, 0, -0.38],
    [-Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennaScatto,
    new THREE.TorusGeometry(0.064, 0.014, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }),
    outlineMat,
    [0, 0, -0.2]
  );
  addOutlinedMesh(
    pennaScatto,
    new THREE.TorusGeometry(0.066, 0.014, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 }),
    outlineMat,
    [0, 0, 0.12]
  );
  weaponMeshes.penna_scatto = pennaScatto;

  // 3. Spillatrice / Sparapunti
  const spillatrice = new THREE.Group();
  addOutlinedMesh(
    spillatrice,
    new THREE.BoxGeometry(0.09, 0.12, 0.48),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 }),
    outlineMat,
    [0, 0.03, -0.06]
  );
  addOutlinedMesh(
    spillatrice,
    new THREE.BoxGeometry(0.095, 0.035, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 }),
    outlineMat,
    [0, -0.05, -0.06]
  );
  weaponMeshes.spillatrice = spillatrice;

  // 4. Pennarello Indelebile (Bazooka)
  const pennarello = new THREE.Group();
  addOutlinedMesh(
    pennarello,
    new THREE.CylinderGeometry(0.085, 0.085, 0.58, 14),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 }),
    outlineMat,
    [0, 0, -0.05],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    pennarello,
    new THREE.BoxGeometry(0.09, 0.11, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }),
    outlineMat,
    [0, 0, -0.38]
  );
  weaponMeshes.pennarello = pennarello;

  // 5. Pistola Colla a Caldo
  const collaCaldo = new THREE.Group();
  addOutlinedMesh(
    collaCaldo,
    new THREE.BoxGeometry(0.08, 0.14, 0.38),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }),
    outlineMat
  );
  addOutlinedMesh(
    collaCaldo,
    new THREE.ConeGeometry(0.038, 0.14, 10),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 }),
    outlineMat,
    [0, 0.02, -0.25],
    [-Math.PI / 2, 0, 0]
  );
  weaponMeshes.colla_caldo = collaCaldo;

  // 6. Taglierino a Scatti
  const taglierino = new THREE.Group();
  addOutlinedMesh(
    taglierino,
    new THREE.BoxGeometry(0.065, 0.12, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }),
    outlineMat
  );
  addOutlinedMesh(
    taglierino,
    new THREE.BoxGeometry(0.015, 0.085, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 }),
    outlineMat,
    [0, 0.01, -0.28]
  );
  weaponMeshes.taglierino = taglierino;

  // 7. Cucchiaio di Metallo
  const cucchiaio = new THREE.Group();
  addOutlinedMesh(
    cucchiaio,
    new THREE.BoxGeometry(0.035, 0.02, 0.46),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.82, roughness: 0.18 }),
    outlineMat
  );
  addOutlinedMesh(
    cucchiaio,
    new THREE.SphereGeometry(0.105, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.15 }),
    outlineMat,
    [0, 0.01, -0.29],
    [0, 0, 0],
    [0.85, 0.38, 1.35]
  );
  weaponMeshes.cucchiaio = cucchiaio;

  // 8. Mestolo di Legno
  const mestolo = new THREE.Group();
  addOutlinedMesh(
    mestolo,
    new THREE.CylinderGeometry(0.028, 0.032, 0.56, 10),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 }),
    outlineMat,
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    mestolo,
    new THREE.SphereGeometry(0.13, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 }),
    outlineMat,
    [0, 0.02, -0.32],
    [0, 0, 0],
    [1.0, 0.65, 1.15]
  );
  weaponMeshes.mestolo = mestolo;

  // 9. Righello 30 cm
  const righello = new THREE.Group();
  addOutlinedMesh(
    righello,
    new THREE.BoxGeometry(0.09, 0.016, 0.74),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 }),
    outlineMat,
    [0, 0, -0.16]
  );
  weaponMeshes.righello = righello;

  // 10. Forchetta Lanciabile
  const forchetta = new THREE.Group();
  addOutlinedMesh(
    forchetta,
    new THREE.BoxGeometry(0.032, 0.018, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 }),
    outlineMat
  );
  for (let t = -1.5; t <= 1.5; t += 1) {
    addOutlinedMesh(
      forchetta,
      new THREE.BoxGeometry(0.012, 0.016, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.85 }),
      outlineMat,
      [t * 0.024, 0, -0.28]
    );
  }
  weaponMeshes.forchetta = forchetta;

  // 11. Padella in Ghisa (Scudo)
  const padella = new THREE.Group();
  addOutlinedMesh(
    padella,
    new THREE.CylinderGeometry(0.24, 0.21, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.45 }),
    outlineMat,
    [0, 0.06, -0.28],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    padella,
    new THREE.BoxGeometry(0.045, 0.03, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
    outlineMat,
    [0, -0.04, 0.02]
  );
  weaponMeshes.padella = padella;

  // 12. Spugna Assorbi-Liquidi
  const spugna = new THREE.Group();
  addOutlinedMesh(
    spugna,
    new THREE.BoxGeometry(0.18, 0.09, 0.26),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.85 }),
    outlineMat,
    [0, 0, -0.1]
  );
  addOutlinedMesh(
    spugna,
    new THREE.BoxGeometry(0.182, 0.03, 0.262),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }),
    outlineMat,
    [0, 0.055, -0.1]
  );
  weaponMeshes.spugna = spugna;

  // 13. Gomma da Cancellare
  const gomma = new THREE.Group();
  addOutlinedMesh(
    gomma,
    new THREE.BoxGeometry(0.13, 0.07, 0.17),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.65 }),
    outlineMat,
    [0, 0, -0.04]
  );
  addOutlinedMesh(
    gomma,
    new THREE.BoxGeometry(0.13, 0.07, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.65 }),
    outlineMat,
    [0, 0, -0.17]
  );
  weaponMeshes.gomma = gomma;

  // 14. Molletta da Bucato
  const molletta = new THREE.Group();
  addOutlinedMesh(
    molletta,
    new THREE.BoxGeometry(0.06, 0.04, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 }),
    outlineMat,
    [0, 0.025, -0.1],
    [0.08, 0, 0]
  );
  addOutlinedMesh(
    molletta,
    new THREE.BoxGeometry(0.06, 0.04, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 }),
    outlineMat,
    [0, -0.025, -0.1],
    [-0.08, 0, 0]
  );
  weaponMeshes.molletta = molletta;

  // 15. Lampadina & Batteria AA
  const lampadina = new THREE.Group();
  addOutlinedMesh(
    lampadina,
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.35 }),
    outlineMat,
    [0, 0.04, -0.16]
  );
  addOutlinedMesh(
    lampadina,
    new THREE.CylinderGeometry(0.06, 0.06, 0.12, 10),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }),
    outlineMat,
    [0, -0.08, -0.16]
  );
  weaponMeshes.lampadina = lampadina;

  // 16. Phon Asciugacapelli
  const phon = new THREE.Group();
  addOutlinedMesh(
    phon,
    new THREE.CylinderGeometry(0.09, 0.11, 0.38, 12),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 }),
    outlineMat,
    [0, 0.06, -0.12],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    phon,
    new THREE.CylinderGeometry(0.045, 0.05, 0.28, 10),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }),
    outlineMat,
    [0, -0.12, 0.02]
  );
  weaponMeshes.phon = phon;

  // 17. Puntatore Laser & Gomitolo
  const laserGatto = new THREE.Group();
  addOutlinedMesh(
    laserGatto,
    new THREE.CylinderGeometry(0.028, 0.028, 0.36, 10),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 }),
    outlineMat,
    [0, 0, -0.12],
    [Math.PI / 2, 0, 0]
  );
  addOutlinedMesh(
    laserGatto,
    new THREE.SphereGeometry(0.032, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
    outlineMat,
    [0, 0, -0.31]
  );
  weaponMeshes.laser_gatto = laserGatto;

  (Object.keys(weaponMeshes) as WeaponId[]).forEach((key) => {
    weaponMeshes[key].visible = key === 'penna_scatto';
    weaponPivot.add(weaponMeshes[key]);
  });

  return { root, weaponPivot, leftArm, rightArm, weaponMeshes };
}

/**
 * Giant Landlord Boss ("Il Padrone di Casa" with Apron & Giant Broom) for Domestic Chaos Mode
 */
export function createPadroneBoss(outlineMat: THREE.Material): {
  group: THREE.Group;
  broomPivot: THREE.Group;
} {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });

  // Giant legs & torso (Scale ~3.5x Stickman!)
  addOutlinedMesh(group, new THREE.CylinderGeometry(0.95, 1.1, 4.8, 12), bodyMat, outlineMat, [0, 2.4, 0]);
  addOutlinedMesh(group, new THREE.BoxGeometry(1.9, 3.2, 1.4), apronMat, outlineMat, [0, 2.5, 0.35]);
  // Head
  addOutlinedMesh(group, new THREE.SphereGeometry(1.15, 14, 12), skinMat, outlineMat, [0, 5.7, 0]);

  // Giant Sweeping Broom ("La Scopa")
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
 * Giant Sketch Cat Boss ("Il Gatto Disastro") with:
 * - Purr Vibration Ring ("Le Fusa" ripple wave)
 * - Curling Sleep Body Group & Head Group (for Cat-Nap animation when Barra del Caos = 100%)
 * - Open Glowing Eyes vs Closed Sleeping Eyelids
 * - Floating "Zzz" & Pencil-Drawn Buzzing Mosquitoes ("Zanzare a matita") when napping!
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

  // Torso
  addOutlinedMesh(
    bodyGroup,
    new THREE.SphereGeometry(1.6, 14, 12),
    catFurMat,
    outlineMat,
    [0, 1.5, 0],
    [0, 0, 0],
    [1.15, 0.85, 1.65]
  );

  // Head Group (tilts & tucks into paws when napping)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.6, 1.8);
  bodyGroup.add(headGroup);

  addOutlinedMesh(headGroup, new THREE.SphereGeometry(1.25, 14, 12), catFurMat, outlineMat, [0, 0, 0]);
  // Pointed Cat Ears
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

  // Open Glowing Yellow Doodle Eyes
  const openEyesGroup = new THREE.Group();
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
  lEye.position.set(-0.45, 0.15, 1.1);
  const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), eyeMat);
  rEye.position.set(0.45, 0.15, 1.1);
  openEyesGroup.add(lEye, rEye);
  headGroup.add(openEyesGroup);

  // Closed Sleeping Eyelids (visible during Cat-Nap!)
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

  // Swatting Front Paw
  const pawPivot = new THREE.Group();
  pawPivot.position.set(0.9, 1.2, 2.1);
  addOutlinedMesh(pawPivot, new THREE.SphereGeometry(0.55, 10, 10), catFurMat, outlineMat, [0, 0, 0.6]);
  bodyGroup.add(pawPivot);

  // Whipping Tail
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

  // Concentric Purr Vibration Ring on Floor ("Le Fusa" shockwave)
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

  // Floating "Zzz" & Pencil-Drawn Buzzing Mosquitoes ("Zanzare") for Cat-Nap state
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

  // 2 Tiny Pencil-Drawn Mosquitoes orbiting the sleeping cat
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
