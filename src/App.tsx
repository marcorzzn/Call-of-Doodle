import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GddTechnicalModal } from './components/GddTechnicalModal';
import { WEAPONS_ARSENAL, WeaponId, WeaponSpec } from './data/gddData';
import {
  boilingTimeUniform,
  createBoilingOutlineMaterial,
  createCharcoalStickmanTexture,
  createDottedInkTrailTexture,
  createFirstPersonViewmodel,
  createGattoBoss,
  createGraphPaperTexture,
  createHatchShadowTexture,
  createPadroneBoss,
  createStickmanActor,
  StickmanActor,
} from './game/doodleModels';
import { buildArenaMap, BuiltArena } from './game/mapBuilder';
import { foleyAudio } from './game/soundEngine';

type GamePhase = 'title' | 'playing' | 'paused' | 'victory';
type ArsenalMode = 'all_weapons' | 'scavenger';
type BossMode = 'none' | 'padrone' | 'gatto';
type HouseRoom = 'scrivania' | 'bagno' | 'cucina' | 'soggiorno';

interface ActiveProjectile {
  active: boolean;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  weaponId: WeaponId;
  fromPlayer: boolean;
  bouncesLeft: number;
  bounceCount: number;
  life: number;
  damage: number;
  isGroundedTrap: boolean;
  isStuckFork: boolean;
}

interface ComicPopText {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface InkTrailParticle {
  active: boolean;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  life: number;
  maxLife: number;
  baseScale: number;
}

// Pre-allocated math helpers for Zero-GC loop
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveVec = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _projNext = new THREE.Vector3();

const INITIAL_MAGAZINES: Record<WeaponId, number> = WEAPONS_ARSENAL.reduce(
  (acc, w) => {
    acc[w.id] = w.magSize;
    return acc;
  },
  {} as Record<WeaponId, number>
);

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [gamePhase, setGamePhase] = useState<GamePhase>('title');
  const [arsenalMode, setArsenalMode] = useState<ArsenalMode>('all_weapons');
  const [bossMode, setBossMode] = useState<BossMode>('none');
  const [currentRoom, setCurrentRoom] = useState<HouseRoom>('scrivania');
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponId>('penna_scatto');
  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponId[]>(
    WEAPONS_ARSENAL.map((w) => w.id)
  );
  const [hasCorkHelmet, setHasCorkHelmet] = useState<boolean>(false);

  const [playerHp, setPlayerHp] = useState<number>(6); // 3 full hearts
  const [stamina, setStamina] = useState<number>(100);
  const [isCrouching, setIsCrouching] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isSniperAiming, setIsSniperAiming] = useState<boolean>(false);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [matchSeconds, setMatchSeconds] = useState<number>(134); // 02:14 like screenshot!
  const [ammoCounts, setAmmoCounts] = useState<Record<WeaponId, number>>({
    ...INITIAL_MAGAZINES,
  });

  // Boss meters: Padrone Patience (starts at 100%, win at 0%) or Cat Chaos (starts at 0%, win at 100%)
  const [bossMeter, setBossMeter] = useState<number>(100);

  const [playerGluedCount, setPlayerGluedCount] = useState<number>(0);
  const [playerBlindTimer, setPlayerBlindTimer] = useState<number>(0);
  const [flushComboActive, setFlushComboActive] = useState<boolean>(false);
  const [comicPops, setComicPops] = useState<ComicPopText[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [gddOpen, setGddOpen] = useState<boolean>(false);
  const [killFeedMsg, setKillFeedMsg] = useState<string>(
    'Casa Completa 3D pronta! Shift=Scatto · Spazio=Salto · C=Accovaccia · R=Ricarica'
  );

  const stateRef = useRef({
    phase: 'title' as GamePhase,
    arsenalMode: 'all_weapons' as ArsenalMode,
    bossMode: 'none' as BossMode,
    weaponId: 'penna_scatto' as WeaponId,
    unlocked: new Set<WeaponId>(WEAPONS_ARSENAL.map((w) => w.id)),
    hp: 6,
    stamina: 100,
    crouching: false,
    reloading: false,
    reloadTimer: 0,
    sniperAim: false,
    score: 0,
    botScore: 0,
    bossMeter: 100,
    gluedMashesRemaining: 0,
    blindTimer: 0,
    hitstopTimer: 0,
    shakeIntensity: 0,
    attackAnimTimer: 0,
    lastFireTime: 0,
    flushVortexTimer: 0,
    ammo: { ...INITIAL_MAGAZINES } as Record<WeaponId, number>,
    teleportRoomRequested: null as HouseRoom | null,
    laserTargetPoint: new THREE.Vector3(6, 0.2, 6),
    laserActive: false,
  });

  useEffect(() => {
    stateRef.current.phase = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    stateRef.current.weaponId = activeWeaponId;
  }, [activeWeaponId]);

  const triggerComicPop = (text: string) => {
    const id = Date.now() + Math.random();
    const x = 77 + Math.random() * 9;
    const y = 15 + Math.random() * 8;
    setComicPops((prev) => [...prev.slice(-1), { id, text, x, y }]);
    window.setTimeout(() => {
      setComicPops((prev) => prev.filter((p) => p.id !== id));
    }, 580);
  };

  // Switch between "All Weapons Unlocked" and "Scavenger (Find in Map)"
  const handleSelectArsenalMode = (mode: ArsenalMode) => {
    setArsenalMode(mode);
    stateRef.current.arsenalMode = mode;
    if (mode === 'all_weapons') {
      const all = WEAPONS_ARSENAL.map((w) => w.id);
      stateRef.current.unlocked = new Set(all);
      setUnlockedWeapons(all);
      setKillFeedMsg('Modalità Sandbox: Tutte le 17 armi di casa e cancelleria sono sbloccate!');
    } else {
      const starter: WeaponId[] = ['cucchiaio'];
      stateRef.current.unlocked = new Set(starter);
      setUnlockedWeapons(starter);
      stateRef.current.weaponId = 'cucchiaio';
      setActiveWeaponId('cucchiaio');
      setKillFeedMsg(
        'Modalità Scavenger: Inizi col Cucchiaio! Esplora le 4 stanze per raccogliere le altre armi.'
      );
    }
  };

  const handleSelectBossMode = (mode: BossMode) => {
    setBossMode(mode);
    stateRef.current.bossMode = mode;
    if (mode === 'padrone') {
      stateRef.current.bossMeter = 100;
      setBossMeter(100);
      setKillFeedMsg(
        'BOSS CO-OP: Il Padrone di Casa è entrato! Usa Pennarello, Spille e Taglierino per azzerare la sua Pazienza!'
      );
    } else if (mode === 'gatto') {
      stateRef.current.bossMeter = 0;
      setBossMeter(0);
      stateRef.current.weaponId = 'laser_gatto';
      setActiveWeaponId('laser_gatto');
      setKillFeedMsg(
        'BOSS CO-OP: Il Gatto Disastro è in casa! Usa il Puntatore Laser [L] sui mobili per fargli distruggere tutto!'
      );
    } else {
      setKillFeedMsg('Modalità Arena Classica contro la squadra di Stickman Bot.');
    }
  };

  useEffect(() => {
    if (gamePhase !== 'playing' || gddOpen) return;
    const timer = window.setInterval(() => {
      setMatchSeconds((prev) => {
        if (prev <= 1) {
          setGamePhase('victory');
          if (document.pointerLockElement) document.exitPointerLock?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gamePhase, gddOpen]);

  // Main Three.js WebGL Engine
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
      mountEl.clientWidth || window.innerWidth,
      mountEl.clientHeight || window.innerHeight
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4efe1);
    scene.fog = new THREE.FogExp2(0xf4efe1, 0.011);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xd6d3d1, 0.98);
    hemiLight.position.set(0, 28, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.32);
    keyLight.position.set(18, 32, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 80;
    const d = 32;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const camera = new THREE.PerspectiveCamera(
      72,
      (mountEl.clientWidth || window.innerWidth) / (mountEl.clientHeight || window.innerHeight),
      0.1,
      160
    );
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const outlineMat = createBoilingOutlineMaterial(0.036);
    const charcoalTex = createCharcoalStickmanTexture(maxAniso);
    const graphPaperTex = createGraphPaperTexture(maxAniso);
    const hatchShadowTex = createHatchShadowTexture();
    const dottedInkTrailTex = createDottedInkTrailTexture();

    const viewmodel = createFirstPersonViewmodel(outlineMat, charcoalTex);
    camera.add(viewmodel.root);

    // Build Complete 4-Room House Arena
    const currentArena: BuiltArena = buildArenaMap(maxAniso, outlineMat, graphPaperTex);
    scene.add(currentArena.group);

    // Boss 1: Il Padrone di Casa & Boss 2: Il Gatto Disastro
    const padroneBoss = createPadroneBoss(outlineMat);
    padroneBoss.group.position.set(-4, 0, -4);
    padroneBoss.group.visible = false;
    scene.add(padroneBoss.group);

    const gattoBoss = createGattoBoss(outlineMat);
    gattoBoss.group.position.set(5, 0, 5);
    gattoBoss.group.visible = false;
    scene.add(gattoBoss.group);

    // Red Laser Dot Mesh for Cat-astrophe Mode
    const laserDotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    laserDotMesh.visible = false;
    scene.add(laserDotMesh);

    // Decal Pool for Black Ink Splats & Permanent Marker Graffiti
    const decalPool: THREE.Mesh[] = [];
    const inkDecalGeo = new THREE.CircleGeometry(1.05, 12);
    const inkDecalMat = new THREE.MeshBasicMaterial({
      color: 0x121210,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(inkDecalGeo, inkDecalMat);
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.025;
      m.visible = false;
      scene.add(m);
      decalPool.push(m);
    }
    let decalCursor = 0;
    const spawnInkSplat = (x: number, z: number, scale = 1.0) => {
      const decal = decalPool[decalCursor % decalPool.length];
      decalCursor++;
      decal.position.set(x, 0.026, z);
      decal.scale.setScalar(scale * (0.8 + Math.random() * 0.5));
      decal.visible = true;
    };

    // Pooled Hand-Drawn Dotted Ink Footstep Trail Particle System (Zero-GC, 84 particles)
    const inkTrailPool: InkTrailParticle[] = [];
    const inkTrailGeo = new THREE.PlaneGeometry(0.48, 0.48);
    for (let i = 0; i < 84; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: dottedInkTrailTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const mesh = new THREE.Mesh(inkTrailGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.024;
      mesh.visible = false;
      scene.add(mesh);
      inkTrailPool.push({
        active: false,
        mesh,
        mat,
        life: 0,
        maxLife: 1.35,
        baseScale: 0.85,
      });
    }
    let inkTrailCursor = 0;
    const spawnDottedFootstepParticle = (
      footX: number,
      footY: number,
      footZ: number,
      moveHeadingRad: number,
      scaleMultiplier = 1.0
    ) => {
      const p = inkTrailPool[inkTrailCursor % inkTrailPool.length];
      inkTrailCursor++;
      p.active = true;
      p.maxLife = 1.25 + Math.random() * 0.25;
      p.life = p.maxLife;
      p.baseScale = (0.78 + Math.random() * 0.28) * scaleMultiplier;
      p.mesh.position.set(
        footX + (Math.random() - 0.5) * 0.08,
        footY + 0.024,
        footZ + (Math.random() - 0.5) * 0.08
      );
      p.mesh.rotation.set(
        -Math.PI / 2,
        0,
        -moveHeadingRad + (Math.random() - 0.5) * 0.35
      );
      p.mesh.scale.setScalar(p.baseScale);
      p.mat.opacity = 0.5;
      p.mesh.visible = true;
    };

    // Pooled Projectiles & Ground Traps (32 items)
    const projectilePool: ActiveProjectile[] = [];
    const projGeo = new THREE.SphereGeometry(0.19, 8, 8);
    for (let i = 0; i < 32; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
      const mesh = new THREE.Mesh(projGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      projectilePool.push({
        active: false,
        mesh,
        position: mesh.position,
        velocity: new THREE.Vector3(),
        weaponId: 'penna_scatto',
        fromPlayer: true,
        bouncesLeft: 0,
        bounceCount: 0,
        life: 0,
        damage: 2,
        isGroundedTrap: false,
        isStuckFork: false,
      });
    }

    // Spawn 6 Stickman Bots across the 4 rooms of the house
    const botNames = [
      'Scarabocchio_P2',
      'TrattoPen_Nero',
      'GommaPane_X',
      'Righello_30cm',
      'Temperino_Pro',
      'Bianchetto_Kid',
    ];
    const botSpawns: [number, number][] = [
      [-11, -13],
      [-5, -9],
      [11, -11],
      [-12, 11],
      [11, 11],
      [-8, -4],
    ];
    const bots: StickmanActor[] = botSpawns.map(([sx, sz], idx) => {
      const actor = createStickmanActor(
        idx,
        botNames[idx],
        sx,
        sz,
        hatchShadowTex,
        outlineMat,
        charcoalTex
      );
      scene.add(actor.group);
      return actor;
    });
    const botStepTimers = bots.map(() => 0);
    const botStepFootToggle = bots.map(() => false);

    // Player State (Starts in Lo Studio / La Scrivania looking at the screenshot scene!)
    const player = {
      pos: new THREE.Vector3(-4.5, 0, -1.2),
      vel: new THREE.Vector3(0, 0, 0),
      yaw: 0.42,
      pitch: -0.06,
      eyeHeight: 1.68,
      grounded: true,
      coyoteTimer: 0,
      walkCycle: 0,
      stepTrailTimer: 0,
      stepFootToggle: false,
      slipperyTimer: 0,
    };

    const heldKeys = new Set<string>();

    const switchWeapon = (wId: WeaponId) => {
      if (!stateRef.current.unlocked.has(wId)) {
        triggerComicPop('ARMA NON ANCORA TROVATA!');
        return;
      }
      stateRef.current.weaponId = wId;
      stateRef.current.sniperAim = false;
      setIsSniperAiming(false);
      setActiveWeaponId(wId);
    };

    const startReload = () => {
      const spec = WEAPONS_ARSENAL.find((w) => w.id === stateRef.current.weaponId)!;
      if (spec.magSize === -1 || stateRef.current.reloading) return;
      if (stateRef.current.ammo[spec.id] === spec.magSize) return;

      stateRef.current.reloading = true;
      stateRef.current.reloadTimer = spec.reloadTimeMs / 1000;
      setIsReloading(true);
      foleyAudio.playReload();
      triggerComicPop('RICARICA...');
    };

    const triggerToiletFlushCombo = () => {
      if (stateRef.current.flushVortexTimer > 0) return;
      stateRef.current.flushVortexTimer = 5.0;
      setFlushComboActive(true);
      foleyAudio.playToiletFlush();
      triggerComicPop('SCARICO WC!');
      setKillFeedMsg('MEGA-COMBO BAGNO: Hai aperto la tavoletta e tirato lo sciacquone del WC!');
    };

    const damageBossPadrone = (amount: number, reason: string) => {
      if (stateRef.current.bossMode !== 'padrone') return;
      stateRef.current.bossMeter = Math.max(0, stateRef.current.bossMeter - amount);
      setBossMeter(Math.round(stateRef.current.bossMeter));
      setKillFeedMsg(`CAOS DOMESTICO: ${reason} (-${amount}% Pazienza del Padrone!)`);
      if (stateRef.current.bossMeter <= 0) {
        setGamePhase('victory');
        if (document.pointerLockElement) document.exitPointerLock?.();
      }
    };

    const addCatChaos = (amount: number, reason: string) => {
      if (stateRef.current.bossMode !== 'gatto') return;
      stateRef.current.bossMeter = Math.min(100, stateRef.current.bossMeter + amount);
      setBossMeter(Math.round(stateRef.current.bossMeter));
      foleyAudio.playCatMeow();
      setKillFeedMsg(`CAT-ASTROPHE: ${reason} (+${amount}% Barra del Caos!)`);
      if (stateRef.current.bossMeter >= 100) {
        setGamePhase('victory');
        if (document.pointerLockElement) document.exitPointerLock?.();
      }
    };

    const fireCurrentWeapon = () => {
      if (stateRef.current.phase !== 'playing' || stateRef.current.reloading) return;
      const now = performance.now();
      const spec = WEAPONS_ARSENAL.find((w) => w.id === stateRef.current.weaponId)!;
      if (now - stateRef.current.lastFireTime < spec.fireRateMs) return;

      const currentAmmo = stateRef.current.ammo[spec.id];
      if (currentAmmo === 0) {
        if (spec.id === 'forchetta') {
          triggerComicPop('RECUPERA FORCHETTA O PREMI [R]!');
        } else {
          startReload();
        }
        return;
      }

      if (currentAmmo > 0) {
        stateRef.current.ammo[spec.id] = currentAmmo - 1;
        setAmmoCounts({ ...stateRef.current.ammo });
      }

      stateRef.current.lastFireTime = now;
      stateRef.current.attackAnimTimer = 0.28;
      foleyAudio.playWeaponFire(spec.id);
      triggerComicPop(spec.foleyOnomatopoeia);

      camera.getWorldDirection(_forward);

      // Special Weapon: Puntatore Laser (Guides Giant Cat!)
      if (spec.id === 'laser_gatto') {
        stateRef.current.laserActive = true;
        stateRef.current.laserTargetPoint
          .copy(player.pos)
          .addScaledVector(_forward, 14)
          .setY(0.35);
        laserDotMesh.position.copy(stateRef.current.laserTargetPoint);
        laserDotMesh.visible = true;
        if (stateRef.current.bossMode === 'gatto') {
          addCatChaos(14, 'Il Gatto ha inseguito il Puntatore Laser travolgendo i mobili!');
        }
        return;
      }

      // Special Weapon: Spugna (Soaks up slippery coffee puddle!)
      if (spec.id === 'spugna') {
        if (
          currentArena.coffeePuddleMesh.visible &&
          player.pos.distanceTo(currentArena.coffeePuddleCenter) < 5.5
        ) {
          currentArena.coffeePuddleMesh.visible = false;
          setKillFeedMsg('SPUGNA: Hai assorbito la pozza di caffè rendendo il pavimento sicuro!');
        }
      }

      // Special Weapon: Phon (Blows wind & triggers BZZZ-BZZZ electro-bath combo if aimed at Bathtub!)
      if (spec.id === 'phon') {
        const bath = currentArena.bathtubBounds;
        const aimPoint = player.pos.clone().addScaledVector(_forward, 9);
        const aimedAtBath =
          aimPoint.x >= bath.minX - 2 &&
          aimPoint.x <= bath.maxX + 2 &&
          aimPoint.z >= bath.minZ - 2 &&
          aimPoint.z <= bath.maxZ + 2;

        bots.forEach((bot) => {
          if (bot.state !== 'alive') return;
          const inBath =
            bot.position.x >= bath.minX - 1.5 &&
            bot.position.x <= bath.maxX + 1.5 &&
            bot.position.z >= bath.minZ - 1.5 &&
            bot.position.z <= bath.maxZ + 1.5;

          if (aimedAtBath && inBath) {
            foleyAudio.playElectroBathBuzz();
            bot.state = 'electrocuted';
            bot.stateTimer = 2.2;
            stateRef.current.score += 1;
            setPlayerScore(stateRef.current.score);
            setKillFeedMsg(
              `BZZZ-BZZZ! Hai fulminato ${bot.name} nella Vasca da Bagno col Phon!`
            );
          } else {
            _toTarget.subVectors(bot.position, player.pos);
            if (_toTarget.length() < 11) {
              _toTarget.normalize();
              bot.velocity.addScaledVector(_toTarget, 19);
              bot.velocity.y = 8;
            }
          }
        });
        return;
      }

      // Melee Weapons (Cucchiaio, Mestolo, Righello, Taglierino, Padella, Spugna)
      if (spec.projectileSpeed === 0) {
        const reach =
          spec.id === 'righello' ? 5.8 : spec.id === 'mestolo' ? 5.2 : 4.5;
        const coneDot = spec.id === 'mestolo' ? -0.1 : 0.35; // Mestolo hits a huge 160° arc!

        bots.forEach((bot) => {
          if (bot.state !== 'alive') return;
          _toTarget.subVectors(bot.position, player.pos);
          _toTarget.y = 0;
          const dist = _toTarget.length();
          if (dist < reach) {
            _toTarget.normalize();
            const forwardFlat = _forward.clone().setY(0).normalize();
            if (forwardFlat.dot(_toTarget) > coneDot || dist < 2.2) {
              applyWeaponHitToBot(bot, spec, _toTarget);
            }
          }
        });

        if (spec.id === 'taglierino' && stateRef.current.bossMode === 'padrone') {
          damageBossPadrone(14, 'Hai squarciato i cuscini col Taglierino facendo volare piume!');
        }
        if (spec.id === 'padella' || spec.id === 'cucchiaio') {
          stateRef.current.shakeIntensity = 0.22;
        }
        return;
      }

      // Ranged Projectiles & Thrown Traps
      const proj = projectilePool.find((p) => !p.active);
      if (!proj) return;

      proj.active = true;
      proj.weaponId = spec.id;
      proj.fromPlayer = true;
      proj.damage = spec.damage;
      proj.life = spec.id === 'molletta' || spec.id === 'forchetta' ? 9.0 : 4.2;
      proj.bounceCount = 0;
      proj.isGroundedTrap = false;
      proj.isStuckFork = false;
      proj.bouncesLeft =
        spec.id === 'gomma' ? 5 : spec.id === 'spillatrice' ? 2 : 0;

      proj.position.copy(player.pos).addScaledVector(_forward, 0.9);
      proj.position.y += player.eyeHeight - 0.22;
      proj.velocity.copy(_forward).multiplyScalar(spec.projectileSpeed);
      if (
        spec.id === 'gomma' ||
        spec.id === 'molletta' ||
        spec.id === 'lampadina' ||
        spec.id === 'pennarello'
      ) {
        proj.velocity.y += 3.4;
      }

      const mat = proj.mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(spec.accentColor);
      proj.mesh.scale.setScalar(
        spec.id === 'pennarello' ? 1.8 : spec.id === 'gomma' ? 1.5 : 1.05
      );
      proj.mesh.visible = true;
    };

    const applyWeaponHitToBot = (
      bot: StickmanActor,
      spec: WeaponSpec,
      hitDir: THREE.Vector3
    ) => {
      bot.hp -= spec.damage;

      if (spec.id === 'righello') {
        bot.redPenMark.visible = true;
        setKillFeedMsg(`SWOOSH! Hai marchiato ${bot.name} con un segno rosso col Righello 30cm!`);
      } else if (spec.id === 'colla_caldo' || spec.id === 'spillatrice' || spec.id === 'molletta') {
        bot.gluedTimer = spec.id === 'spillatrice' ? 1.8 : 3.2;
        bot.gluePuddle.visible = true;
        setKillFeedMsg(
          spec.id === 'spillatrice'
            ? `KA-CHUNK! Hai inchiodato ${bot.name} con la Sparapunti!`
            : `Hai bloccato a terra ${bot.name} con ${spec.name}!`
        );
      } else if (spec.id === 'lampadina') {
        bot.blindedTimer = 2.5;
        bot.whiteoutSplat.visible = true;
      } else if (spec.id === 'padella') {
        bot.velocity.addScaledVector(hitDir, 28);
        bot.velocity.y = 12;
        stateRef.current.hitstopTimer = 0.075;
      } else if (spec.id === 'cucchiaio' || spec.id === 'mestolo') {
        bot.velocity.addScaledVector(hitDir, 16);
        bot.velocity.y = 6.5;
      } else {
        bot.velocity.addScaledVector(hitDir, 6.5);
      }

      if (bot.hp <= 0 && bot.state === 'alive') {
        stateRef.current.score += 1;
        setPlayerScore(stateRef.current.score);
        spawnInkSplat(bot.position.x, bot.position.z, 1.3);

        if (spec.id === 'taglierino') {
          bot.state = 'sliced';
          bot.stateTimer = 2.6;
          bot.upperVel.copy(hitDir).multiplyScalar(8).setY(6.5);
          setKillFeedMsg(`SNIKT-SNIKT! Hai mozzato a metà ${bot.name} col Taglierino!`);
        } else {
          bot.state = 'ragdoll';
          bot.stateTimer = 2.4;
          bot.upperVel.copy(hitDir).multiplyScalar(13).setY(8.5);
          setKillFeedMsg(`${bot.name} spazzato via con ${spec.name} (${spec.foleyOnomatopoeia})`);
        }
      }
    };

    const respawnBot = (bot: StickmanActor) => {
      const roomOffsets: [number, number][] = [
        [-12, -12],
        [12, -12],
        [-12, 12],
        [12, 12],
      ];
      const [rx, rz] = roomOffsets[bot.id % roomOffsets.length];
      bot.position.set(rx + (Math.random() - 0.5) * 6, 0, rz + (Math.random() - 0.5) * 6);
      bot.velocity.set(0, 0, 0);
      bot.hp = bot.maxHp;
      bot.state = 'alive';
      bot.gluedTimer = 0;
      bot.blindedTimer = 0;
      bot.gluePuddle.visible = false;
      bot.whiteoutSplat.visible = false;
      bot.redPenMark.visible = false;
      bot.group.rotation.set(0, 0, 0);
      bot.upperGroup.position.set(0, 0.95, 0);
      bot.upperGroup.rotation.set(0, 0, 0);
      bot.headGroup.position.set(0, 1.28, 0);
      bot.headGroup.rotation.set(0, 0, 0);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      heldKeys.add(code);

      if (code === 'Escape') {
        if (stateRef.current.phase === 'playing') {
          setGamePhase('paused');
          if (document.pointerLockElement) document.exitPointerLock?.();
        } else if (stateRef.current.phase === 'paused') {
          setGamePhase('playing');
        }
        return;
      }

      if (code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
      }

      if (stateRef.current.phase === 'title' && (code === 'Enter' || code === 'Space')) {
        setGamePhase('playing');
        return;
      }

      if (stateRef.current.phase !== 'playing') return;

      // Crouch toggle / hold with [C]
      if (code === 'KeyC') {
        stateRef.current.crouching = !stateRef.current.crouching;
        setIsCrouching(stateRef.current.crouching);
      }

      // Reload with [R]
      if (code === 'KeyR') {
        if (stateRef.current.weaponId === 'forchetta' && stateRef.current.ammo.forchetta === 0) {
          stateRef.current.ammo.forchetta = 1;
          setAmmoCounts({ ...stateRef.current.ammo });
          foleyAudio.playReload();
          triggerComicPop('FORCHETTA RECUPERATA!');
        } else {
          startReload();
        }
      }

      // Sniper Optical Zoom through Penna Blu Bic with [Z]
      if (code === 'KeyZ' && stateRef.current.weaponId === 'penna_bic') {
        stateRef.current.sniperAim = !stateRef.current.sniperAim;
        setIsSniperAiming(stateRef.current.sniperAim);
      }

      // Weapon Hotkeys (1-9, 0, Q, V, G, T, B, F, L)
      const keyMap: Record<string, WeaponId> = {
        Digit1: 'penna_bic',
        Digit2: 'penna_scatto',
        Digit3: 'spillatrice',
        Digit4: 'pennarello',
        Digit5: 'colla_caldo',
        Digit6: 'taglierino',
        Digit7: 'cucchiaio',
        Digit8: 'mestolo',
        Digit9: 'righello',
        Digit0: 'forchetta',
        KeyQ: 'padella',
        KeyV: 'spugna',
        KeyG: 'gomma',
        KeyT: 'molletta',
        KeyB: 'lampadina',
        KeyF: 'phon',
        KeyL: 'laser_gatto',
      };
      if (keyMap[code]) {
        switchWeapon(keyMap[code]);
      }

      // Spacebar: Jump OR unglue shoes
      if (code === 'Space') {
        if (stateRef.current.gluedMashesRemaining > 0) {
          stateRef.current.gluedMashesRemaining -= 1;
          setPlayerGluedCount(stateRef.current.gluedMashesRemaining);
          foleyAudio.playWeaponFire('colla_caldo');
        } else if (player.grounded || player.coyoteTimer > 0) {
          player.vel.y = 11.2;
          player.grounded = false;
          player.coyoteTimer = 0;
          foleyAudio.playBoing(0);
        }
      }

      // E key: Toilet Flush Combo in Il Bagno
      if (code === 'KeyE') {
        triggerToiletFlushCombo();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const onWindowBlur = () => {
      heldKeys.clear();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (stateRef.current.phase !== 'playing') return;
      if (document.pointerLockElement === renderer.domElement) {
        const sens = stateRef.current.sniperAim ? 0.0011 : 0.0022;
        player.yaw -= e.movementX * sens;
        player.pitch = THREE.MathUtils.clamp(player.pitch - e.movementY * sens, -1.15, 1.15);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (stateRef.current.phase !== 'playing') return;
      if (e.button === 2 && stateRef.current.weaponId === 'penna_bic') {
        stateRef.current.sniperAim = !stateRef.current.sniperAim;
        setIsSniperAiming(stateRef.current.sniperAim);
        return;
      }
      if (e.button === 0) {
        if (document.pointerLockElement !== renderer.domElement) {
          renderer.domElement.requestPointerLock?.();
        }
        fireCurrentWeapon();
      }
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.phase !== 'playing') return;
      const unlockedList = WEAPONS_ARSENAL.filter((w) =>
        stateRef.current.unlocked.has(w.id)
      );
      if (unlockedList.length === 0) return;
      const idx = unlockedList.findIndex((w) => w.id === stateRef.current.weaponId);
      const nextIdx =
        (idx + (e.deltaY > 0 ? 1 : -1) + unlockedList.length) % unlockedList.length;
      switchWeapon(unlockedList[nextIdx].id);
    };

    const onResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || window.innerWidth;
      const h = mountEl.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel);
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      boilingTimeUniform.value = elapsed;

      // Room Teleport Request
      if (stateRef.current.teleportRoomRequested) {
        const targetRoom = stateRef.current.teleportRoomRequested;
        stateRef.current.teleportRoomRequested = null;
        if (targetRoom === 'scrivania') player.pos.set(-5, 0, -3);
        else if (targetRoom === 'bagno') player.pos.set(7, 0, -9);
        else if (targetRoom === 'cucina') player.pos.set(-9, 0, 12);
        else if (targetRoom === 'soggiorno') player.pos.set(8, 0, 9);
        player.vel.set(0, 0, 0);
      }

      // Sync active weapon mesh visibility
      (Object.keys(viewmodel.weaponMeshes) as WeaponId[]).forEach((k) => {
        viewmodel.weaponMeshes[k].visible = k === stateRef.current.weaponId;
      });

      // Handle Reload Countdown & Animation
      if (stateRef.current.reloading) {
        stateRef.current.reloadTimer -= dt;
        if (stateRef.current.reloadTimer <= 0) {
          stateRef.current.reloading = false;
          setIsReloading(false);
          const spec = WEAPONS_ARSENAL.find((w) => w.id === stateRef.current.weaponId)!;
          stateRef.current.ammo[spec.id] = spec.magSize;
          setAmmoCounts({ ...stateRef.current.ammo });
        }
      }

      if (stateRef.current.hitstopTimer > 0) {
        stateRef.current.hitstopTimer -= dt;
        renderer.render(scene, camera);
        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
        return;
      }

      if (stateRef.current.phase === 'title') {
        // Frame the Studio / Scrivania exactly like the attached screenshot!
        camera.up.set(0, 1, 0);
        camera.position.set(
          -4.2 + Math.sin(elapsed * 0.4) * 0.8,
          3.2,
          1.4 + Math.cos(elapsed * 0.4) * 0.6
        );
        camera.rotation.set(-0.24, 0.44, 0, 'YXZ');
        viewmodel.root.visible = true;
      } else if (stateRef.current.phase === 'playing') {
        viewmodel.root.visible = true;

        if (heldKeys.has('ArrowLeft')) player.yaw += 2.1 * dt;
        if (heldKeys.has('ArrowRight')) player.yaw -= 2.1 * dt;
        if (heldKeys.has('ArrowUp')) player.pitch = Math.min(1.1, player.pitch + 1.5 * dt);
        if (heldKeys.has('ArrowDown')) player.pitch = Math.max(-1.1, player.pitch - 1.5 * dt);

        if (stateRef.current.blindTimer > 0) {
          stateRef.current.blindTimer = Math.max(0, stateRef.current.blindTimer - dt);
          setPlayerBlindTimer(stateRef.current.blindTimer);
        }

        _forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)).normalize();
        _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw)).normalize();
        _moveVec.set(0, 0, 0);

        if (stateRef.current.gluedMashesRemaining <= 0) {
          if (heldKeys.has('KeyW')) _moveVec.add(_forward);
          if (heldKeys.has('KeyS')) _moveVec.sub(_forward);
          if (heldKeys.has('KeyD')) _moveVec.add(_right);
          if (heldKeys.has('KeyA')) _moveVec.sub(_right);
        }

        // Sprint with [Shift] & Stamina management
        const wantsSprint =
          (heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight')) &&
          _moveVec.lengthSq() > 0 &&
          !stateRef.current.crouching &&
          stateRef.current.stamina > 5;

        if (wantsSprint) {
          stateRef.current.stamina = Math.max(0, stateRef.current.stamina - 28 * dt);
          setStamina(Math.round(stateRef.current.stamina));
        } else if (stateRef.current.stamina < 100) {
          stateRef.current.stamina = Math.min(100, stateRef.current.stamina + 18 * dt);
          setStamina(Math.round(stateRef.current.stamina));
        }

        // Smooth FOV for Sniper Scope vs Sprint
        const targetFov = stateRef.current.sniperAim ? 32 : wantsSprint ? 79 : 72;
        if (Math.abs(camera.fov - targetFov) > 0.2) {
          camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 12, dt);
          camera.updateProjectionMatrix();
        }

        // Smooth Crouch Eye Height with [C]
        const targetEye = stateRef.current.crouching ? 0.92 : 1.68;
        player.eyeHeight = THREE.MathUtils.damp(player.eyeHeight, targetEye, 12, dt);

        if (_moveVec.lengthSq() > 0) {
          _moveVec.normalize();
          player.walkCycle += dt * (wantsSprint ? 15 : 11);
        }

        // Check if standing in slippery Coffee Puddle or Soap
        const onCoffee =
          currentArena.coffeePuddleMesh.visible &&
          player.pos.distanceTo(currentArena.coffeePuddleCenter) < currentArena.coffeePuddleRadius;
        if (onCoffee) player.slipperyTimer = 0.6;
        if (player.slipperyTimer > 0) player.slipperyTimer -= dt;

        // Desk Fan Wind Force in Lo Studio
        if (player.pos.distanceTo(currentArena.fanPosition) < 11 && player.pos.x > -22) {
          player.vel.x += 12 * dt;
        }

        // Vacuum Cleaner Suction in Il Soggiorno
        const distVac = player.pos.distanceTo(currentArena.vacuumPosition);
        if (distVac < 8.5 && distVac > 1.8) {
          _toTarget.subVectors(currentArena.vacuumPosition, player.pos).normalize();
          player.vel.addScaledVector(_toTarget, 14 * dt);
        }

        const baseSpeed = stateRef.current.crouching
          ? 6.2
          : wantsSprint
          ? 16.2
          : player.slipperyTimer > 0
          ? 16.5
          : 10.5;
        const damping = player.slipperyTimer > 0 ? 1.8 : 11.0;

        player.vel.x = THREE.MathUtils.damp(player.vel.x, _moveVec.x * baseSpeed, damping, dt);
        player.vel.z = THREE.MathUtils.damp(player.vel.z, _moveVec.z * baseSpeed, damping, dt);
        player.vel.y -= 26.0 * dt;

        player.pos.addScaledVector(player.vel, dt);
        player.pos.x = THREE.MathUtils.clamp(player.pos.x, -28.5, 28.5);
        player.pos.z = THREE.MathUtils.clamp(player.pos.z, -28.5, 28.5);

        // Update current room indicator based on quadrant
        const newRoom: HouseRoom =
          player.pos.z < 0
            ? player.pos.x < 0
              ? 'scrivania'
              : 'bagno'
            : player.pos.x < 0
            ? 'cucina'
            : 'soggiorno';
        setCurrentRoom((prev) => (prev === newRoom ? prev : newRoom));

        // Collisions & Interactive Bounce Pads (Toaster, Couch, Duck, Tape Measure, Mouse Trap, Soap)
        let floorHeight = 0;
        let hitBouncePad = false;
        let hitDuck = false;
        let hitToaster = false;
        let hitTrapLaunch = false;

        for (const box of currentArena.colliders) {
          if (
            player.pos.x > box.minX - 0.45 &&
            player.pos.x < box.maxX + 0.45 &&
            player.pos.z > box.minZ - 0.45 &&
            player.pos.z < box.maxZ + 0.45
          ) {
            if (player.pos.y >= box.topY - 0.7) {
              floorHeight = Math.max(floorHeight, box.topY);
              if (box.isBouncePad) hitBouncePad = true;
              if (box.isDuck) hitDuck = true;
              if (box.isToaster) hitToaster = true;
              if (box.isTapeTrap || box.isMouseTrap) hitTrapLaunch = true;
              if (box.isSoap) player.slipperyTimer = 1.4;
            } else {
              if (player.pos.x < (box.minX + box.maxX) * 0.5) player.pos.x = box.minX - 0.45;
              else player.pos.x = box.maxX + 0.45;
            }
          }
        }

        if (player.pos.y <= floorHeight) {
          player.pos.y = floorHeight;
          if (hitBouncePad) {
            player.vel.y = hitToaster || hitTrapLaunch ? 19.5 : 15.0;
            player.grounded = false;
            if (hitDuck) {
              foleyAudio.playDuckSqueak();
              triggerComicPop('SQUEAK!');
            } else if (hitToaster) {
              foleyAudio.playWeaponFire('cucchiaio');
              triggerComicPop('TOSTAPANE DING!');
              setKillFeedMsg('TOSTAPANE: Catapultato in aria insieme alle fette di pane tostato!');
            } else if (hitTrapLaunch) {
              foleyAudio.playWeaponFire('molletta');
              triggerComicPop('CLACK-ZIIIP!');
            } else {
              foleyAudio.playBoing(1);
              triggerComicPop('BOING!');
            }
          } else {
            player.vel.y = 0;
            player.grounded = true;
            player.coyoteTimer = 0.12;
          }
        } else {
          player.grounded = false;
          player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
        }

        // Collect Paper Pickups & Cork Helmet & Scavenger Weapon Crates
        currentArena.paperPickups.forEach((pMesh) => {
          pMesh.rotation.y += dt * 1.8;
          if (pMesh.visible && player.pos.distanceTo(pMesh.position) < 1.8) {
            pMesh.visible = false;
            foleyAudio.playPaperPickup();
            WEAPONS_ARSENAL.forEach((w) => {
              if (w.magSize > 0) {
                stateRef.current.ammo[w.id] = w.magSize;
              }
            });
            setAmmoCounts({ ...stateRef.current.ammo });
            triggerComicPop('+MUNIZIONI CARTA!');
            window.setTimeout(() => {
              pMesh.visible = true;
            }, 8000);
          }
        });

        // Cork Helmet ("Il Tappo di Sughero") in Kitchen
        if (
          currentArena.corkHelmetPickup.visible &&
          player.pos.distanceTo(currentArena.corkHelmetPickup.position) < 1.8
        ) {
          currentArena.corkHelmetPickup.visible = false;
          foleyAudio.playPaperPickup();
          setHasCorkHelmet(true);
          setKillFeedMsg('HAI INDOSSATO IL TAPPO DI SUGHERO COME ELMO DELLO STICKMAN!');
        }

        // Scavenger Weapon Crates
        currentArena.weaponPickups.forEach((node) => {
          node.mesh.rotation.y += dt * 1.6;
          node.mesh.visible =
            stateRef.current.arsenalMode === 'scavenger' && !node.collected;
          if (node.mesh.visible && player.pos.distanceTo(node.position) < 1.9) {
            node.collected = true;
            node.mesh.visible = false;
            stateRef.current.unlocked.add(node.weaponId);
            setUnlockedWeapons(Array.from(stateRef.current.unlocked));
            switchWeapon(node.weaponId);
            foleyAudio.playReload();
            const wSpec = WEAPONS_ARSENAL.find((w) => w.id === node.weaponId)!;
            setKillFeedMsg(`TROVATA ARMA: ${wSpec.name}!`);
          }
        });

        // Dotted Ink Footstep Trail for Player
        const horizSpeedSq = player.vel.x * player.vel.x + player.vel.z * player.vel.z;
        if (player.grounded && horizSpeedSq > 2.2) {
          player.stepTrailTimer -= dt;
          if (player.stepTrailTimer <= 0) {
            player.stepTrailTimer = wantsSprint ? 0.075 : 0.11;
            player.stepFootToggle = !player.stepFootToggle;
            const sideSign = player.stepFootToggle ? 0.22 : -0.22;
            const moveHeading = Math.atan2(player.vel.x, player.vel.z);
            const footX =
              player.pos.x + Math.cos(player.yaw) * sideSign - Math.sin(moveHeading) * 0.25;
            const footZ =
              player.pos.z - Math.sin(player.yaw) * sideSign - Math.cos(moveHeading) * 0.25;
            spawnDottedFootstepParticle(footX, player.pos.y, footZ, moveHeading, 0.95);
          }
        }

        // Camera & Per-Weapon Viewmodel Attack Animations
        stateRef.current.shakeIntensity = THREE.MathUtils.damp(
          stateRef.current.shakeIntensity,
          0,
          12,
          dt
        );
        stateRef.current.attackAnimTimer = Math.max(0, stateRef.current.attackAnimTimer - dt);

        const steppedWalk = Math.floor(player.walkCycle * 12) / 12;
        const bobY = player.grounded ? Math.abs(Math.sin(steppedWalk)) * 0.065 : 0;
        const shakeX = (Math.random() - 0.5) * stateRef.current.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * stateRef.current.shakeIntensity;

        camera.up.set(0, 1, 0);
        camera.position.set(
          player.pos.x + shakeX,
          player.pos.y + player.eyeHeight + bobY + shakeY,
          player.pos.z
        );
        camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');

        // Distinct 3D Viewmodel Animations per Weapon Category!
        const activeSpec = WEAPONS_ARSENAL.find((w) => w.id === stateRef.current.weaponId)!;
        const animP = stateRef.current.attackAnimTimer / 0.28; // 1 -> 0 during attack
        const reloadTilt = stateRef.current.reloading ? -0.65 : 0;

        if (activeSpec.animType === 'swing_wide' || activeSpec.animType === 'heavy_smash') {
          viewmodel.weaponPivot.rotation.set(
            0.08 - Math.sin(animP * Math.PI) * 0.95 + reloadTilt,
            -0.24 + Math.sin(animP * Math.PI) * 1.1,
            0.04
          );
        } else if (activeSpec.animType === 'swing_fast') {
          viewmodel.weaponPivot.rotation.set(
            0.08 - Math.sin(animP * Math.PI) * 0.75,
            -0.24 + Math.sin(animP * Math.PI) * 0.55,
            0.04
          );
        } else if (activeSpec.animType === 'thrust') {
          // Righello lunge thrust!
          viewmodel.weaponPivot.position.set(
            0.1,
            0.04,
            -0.06 - Math.sin(animP * Math.PI) * 0.36
          );
        } else {
          viewmodel.weaponPivot.position.set(0.1, 0.04, -0.06 + animP * 0.09);
          viewmodel.weaponPivot.rotation.set(0.08 + animP * 0.18 + reloadTilt, -0.24, 0.04);
        }
      }

      // Animate Environmental Chaos Props (Fan Blades, Swinging Lamp, Toaster Bread, Rolling Marble)
      currentArena.fanBladesPivot.rotation.x += dt * 18;
      currentArena.lampPivot.rotation.z = Math.sin(elapsed * 2.2) * 0.24;
      currentArena.toastSlices.forEach((toast, idx) => {
        toast.position.y = 3.1 + Math.abs(Math.sin(elapsed * 3.2 + idx)) * 2.4;
      });

      // Rolling Marble in Living Room
      currentArena.rollingMarble.position.addScaledVector(currentArena.marbleVel, dt);
      currentArena.rollingMarble.rotation.x += dt * 5;
      if (currentArena.rollingMarble.position.x > 25 || currentArena.rollingMarble.position.x < 3) {
        currentArena.marbleVel.x *= -1;
      }
      if (currentArena.rollingMarble.position.z > 25 || currentArena.rollingMarble.position.z < 3) {
        currentArena.marbleVel.z *= -1;
      }

      currentArena.rubberDucks.forEach((duck, idx) => {
        duck.position.y = 1.52 + Math.sin(elapsed * 2.5 + idx) * 0.12;
      });

      // Animate Boss 1: Il Padrone di Casa ("Domestic Chaos")
      padroneBoss.group.visible = stateRef.current.bossMode === 'padrone';
      if (padroneBoss.group.visible) {
        _toTarget.subVectors(player.pos, padroneBoss.group.position).setY(0);
        if (_toTarget.length() > 2.5) {
          _toTarget.normalize();
          padroneBoss.group.position.addScaledVector(_toTarget, 3.6 * dt);
          padroneBoss.group.rotation.y = Math.atan2(_toTarget.x, _toTarget.z);
        }
        padroneBoss.broomPivot.rotation.y = Math.sin(elapsed * 5.5) * 0.85;
      }

      // Animate Boss 2: Il Gatto Disastro ("Cat-astrophe")
      gattoBoss.group.visible = stateRef.current.bossMode === 'gatto';
      if (gattoBoss.group.visible) {
        const catTarget = stateRef.current.laserActive
          ? stateRef.current.laserTargetPoint
          : player.pos;
        _toTarget.subVectors(catTarget, gattoBoss.group.position).setY(0);
        if (_toTarget.length() > 1.8) {
          _toTarget.normalize();
          gattoBoss.group.position.addScaledVector(_toTarget, 6.8 * dt);
          gattoBoss.group.rotation.y = Math.atan2(_toTarget.x, _toTarget.z);
        }
        gattoBoss.tailPivot.rotation.z = Math.sin(elapsed * 8) * 0.55;
        gattoBoss.pawPivot.rotation.x = Math.sin(elapsed * 10) * 0.65;
      }

      // Toilet Flush Vortex Combo in Il Bagno
      if (stateRef.current.flushVortexTimer > 0) {
        stateRef.current.flushVortexTimer -= dt;
        currentArena.toiletLidPivot.rotation.x = THREE.MathUtils.damp(
          currentArena.toiletLidPivot.rotation.x,
          -Math.PI / 2.1,
          8,
          dt
        );
        currentArena.flushVortexMesh.visible = true;
        currentArena.flushVortexMesh.rotation.y += dt * 14;

        bots.forEach((bot) => {
          if (bot.state === 'alive') {
            _toTarget.subVectors(currentArena.toiletBowlCenter, bot.position);
            const dist = _toTarget.length();
            if (dist < 19) {
              _toTarget.normalize();
              bot.position.addScaledVector(_toTarget, 12.5 * dt);
              bot.rotationY += dt * 15;
              if (dist < 2.8) {
                bot.state = 'flushed';
                bot.stateTimer = 2.0;
                stateRef.current.score += 1;
                setPlayerScore(stateRef.current.score);
              }
            }
          }
        });

        if (stateRef.current.flushVortexTimer <= 0) {
          setFlushComboActive(false);
          currentArena.flushVortexMesh.visible = false;
        }
      } else {
        currentArena.toiletLidPivot.rotation.x = THREE.MathUtils.damp(
          currentArena.toiletLidPivot.rotation.x,
          0,
          6,
          dt
        );
      }

      // Update Projectiles, Ground Traps (Molletta/Spillatrice) & Recoverable Fork
      for (let i = 0; i < projectilePool.length; i++) {
        const p = projectilePool[i];
        if (!p.active) continue;

        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        // Recoverable Fork stuck in ground
        if (p.isStuckFork) {
          if (player.pos.distanceTo(p.position) < 2.0) {
            p.active = false;
            p.mesh.visible = false;
            stateRef.current.ammo.forchetta = 1;
            setAmmoCounts({ ...stateRef.current.ammo });
            foleyAudio.playReload();
            triggerComicPop('FORCHETTA RACCOLTA!');
          }
          continue;
        }

        // Armed Clothespin Trap ("Molletta") on floor
        if (p.isGroundedTrap) {
          for (const bot of bots) {
            if (bot.state === 'alive' && bot.position.distanceTo(p.position) < 1.6) {
              const spec = WEAPONS_ARSENAL.find((w) => w.id === 'molletta')!;
              applyWeaponHitToBot(bot, spec, _forward);
              foleyAudio.playWeaponFire('molletta');
              p.active = false;
              p.mesh.visible = false;
              break;
            }
          }
          continue;
        }

        if (
          p.weaponId === 'gomma' ||
          p.weaponId === 'molletta' ||
          p.weaponId === 'lampadina' ||
          p.weaponId === 'pennarello'
        ) {
          p.velocity.y -= 14.0 * dt;
        }

        _projNext.copy(p.position).addScaledVector(p.velocity, dt);

        if (_projNext.y < 0.24) {
          if (p.weaponId === 'forchetta') {
            p.position.copy(_projNext).setY(0.24);
            p.isStuckFork = true;
            continue;
          }
          if (p.weaponId === 'molletta') {
            p.position.copy(_projNext).setY(0.2);
            p.isGroundedTrap = true;
            continue;
          }
          if (p.weaponId === 'pennarello') {
            spawnInkSplat(_projNext.x, _projNext.z, 2.2);
            damageBossPadrone(16, 'Hai imbrattato il pavimento col Pennarello Indelebile!');
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
          if (p.bouncesLeft > 0) {
            p.bouncesLeft--;
            p.bounceCount++;
            _projNext.y = 0.24;
            p.velocity.y = Math.abs(p.velocity.y) * 0.82;
            foleyAudio.playBoing(p.bounceCount);
            if (p.weaponId === 'spillatrice' && stateRef.current.bossMode === 'padrone') {
              damageBossPadrone(12, 'YOWCH! Il Padrone di Casa ha calpestato le spille!');
            }
          } else {
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
        }

        p.position.copy(_projNext);

        // Gomma da Cancellare erases enemy projectiles mid-air!
        if (p.weaponId === 'gomma' && p.fromPlayer) {
          for (let j = 0; j < projectilePool.length; j++) {
            const other = projectilePool[j];
            if (other.active && !other.fromPlayer && other.position.distanceTo(p.position) < 4.5) {
              other.active = false;
              other.mesh.visible = false;
              foleyAudio.playEraseProjectile();
              triggerComicPop('COLPO CANCELLATO!');
            }
          }
        }

        if (p.fromPlayer) {
          for (const bot of bots) {
            if (bot.state !== 'alive') continue;
            const dx = p.position.x - bot.position.x;
            const dz = p.position.z - bot.position.z;
            const dy = p.position.y - (bot.position.y + 1.1);
            if (dx * dx + dz * dz < 0.85 && Math.abs(dy) < 1.4) {
              const spec = WEAPONS_ARSENAL.find((w) => w.id === p.weaponId)!;
              _toTarget.copy(p.velocity).setY(0).normalize();
              applyWeaponHitToBot(bot, spec, _toTarget);
              if (p.weaponId === 'forchetta') {
                p.isStuckFork = true;
                p.position.set(bot.position.x, 0.3, bot.position.z);
              } else {
                p.active = false;
                p.mesh.visible = false;
              }
              break;
            }
          }
        } else if (stateRef.current.phase === 'playing') {
          const dx = p.position.x - player.pos.x;
          const dz = p.position.z - player.pos.z;
          const dy = p.position.y - (player.pos.y + 1.1);
          if (dx * dx + dz * dz < 0.75 && Math.abs(dy) < 1.35) {
            // Padella in Ghisa Shield Block!
            if (stateRef.current.weaponId === 'padella') {
              p.velocity.negate();
              p.fromPlayer = true;
              foleyAudio.playWeaponFire('padella');
              triggerComicPop('PARATO CON PADELLA!');
              continue;
            }
            p.active = false;
            p.mesh.visible = false;
            stateRef.current.shakeIntensity = 0.15;
            stateRef.current.hp = Math.max(0, stateRef.current.hp - 1);
            setPlayerHp(stateRef.current.hp);
            if (stateRef.current.hp <= 0) {
              stateRef.current.botScore += 1;
              setBotScore(stateRef.current.botScore);
              stateRef.current.hp = 6;
              setPlayerHp(6);
              player.pos.set(-4.5, 0, -1.2);
            }
          }
        }
      }

      // Update Stickman Bots + Dotted Footstep Ink Trail
      const quantizedTime12 = Math.floor(elapsed * 12) / 12;

      bots.forEach((bot, idx) => {
        if (bot.state === 'alive') {
          if (bot.gluedTimer > 0) {
            bot.gluedTimer -= dt;
            if (bot.gluedTimer <= 0) bot.gluePuddle.visible = false;
          }
          if (bot.blindedTimer > 0) {
            bot.blindedTimer -= dt;
            if (bot.blindedTimer <= 0) bot.whiteoutSplat.visible = false;
          }

          _toTarget.subVectors(player.pos, bot.position).setY(0);
          const distToPlayer = _toTarget.length();
          if (distToPlayer > 0.1) {
            bot.rotationY = Math.atan2(_toTarget.x, _toTarget.z);
          }

          const moveSpeed = bot.gluedTimer > 0 ? 0 : distToPlayer > 7.5 ? 4.4 : 2.1;
          const strafeAngle = bot.rotationY + (distToPlayer <= 7.5 ? Math.PI / 2 : 0);
          bot.velocity.x = THREE.MathUtils.damp(
            bot.velocity.x,
            Math.sin(strafeAngle) * moveSpeed,
            6,
            dt
          );
          bot.velocity.z = THREE.MathUtils.damp(
            bot.velocity.z,
            Math.cos(strafeAngle) * moveSpeed,
            6,
            dt
          );

          bot.position.addScaledVector(bot.velocity, dt);
          bot.position.x = THREE.MathUtils.clamp(bot.position.x, -26, 26);
          bot.position.z = THREE.MathUtils.clamp(bot.position.z, -26, 26);
          bot.group.rotation.y = bot.rotationY;

          const swing =
            bot.gluedTimer > 0 ? 0 : Math.sin(quantizedTime12 * 14 + idx * 1.7) * 0.78;
          bot.leftLeg.rotation.x = swing;
          bot.rightLeg.rotation.x = -swing;
          bot.leftArm.rotation.x = -swing * 0.65;
          bot.rightArm.rotation.x = swing * 0.45;

          const botSpeedSq =
            bot.velocity.x * bot.velocity.x + bot.velocity.z * bot.velocity.z;
          if (bot.gluedTimer <= 0 && botSpeedSq > 0.65) {
            botStepTimers[idx] -= dt;
            if (botStepTimers[idx] <= 0) {
              botStepTimers[idx] = 0.12;
              botStepFootToggle[idx] = !botStepFootToggle[idx];
              const lateralOffset = botStepFootToggle[idx] ? 0.22 : -0.22;
              const moveHeading = Math.atan2(bot.velocity.x, bot.velocity.z);
              const heelX =
                bot.position.x +
                Math.cos(bot.rotationY) * lateralOffset -
                Math.sin(moveHeading) * 0.28;
              const heelZ =
                bot.position.z -
                Math.sin(bot.rotationY) * lateralOffset -
                Math.cos(moveHeading) * 0.28;
              spawnDottedFootstepParticle(heelX, bot.position.y, heelZ, moveHeading, 1.0);
            }
          }

          if (stateRef.current.phase === 'playing' && bot.blindedTimer <= 0) {
            bot.shootCooldown -= dt;
            if (bot.shootCooldown <= 0 && distToPlayer < 22) {
              bot.shootCooldown = 2.6 + Math.random() * 2.0;
              const botProj = projectilePool.find((p) => !p.active);
              if (botProj) {
                botProj.active = true;
                botProj.fromPlayer = false;
                botProj.weaponId = 'penna_scatto';
                botProj.damage = 1;
                botProj.life = 3.2;
                botProj.bouncesLeft = 0;
                botProj.isGroundedTrap = false;
                botProj.isStuckFork = false;
                botProj.position.copy(bot.position).setY(1.45);
                _toTarget.subVectors(player.pos, bot.position).setY(0.1).normalize();
                botProj.velocity.copy(_toTarget).multiplyScalar(18);
                (botProj.mesh.material as THREE.MeshStandardMaterial).color.set('#3b82f6');
                botProj.mesh.scale.setScalar(1.0);
                botProj.mesh.visible = true;
              }
            }
          }
        } else {
          bot.stateTimer -= dt;
          if (bot.state === 'sliced') {
            bot.upperVel.y -= 19 * dt;
            bot.upperGroup.position.addScaledVector(bot.upperVel, dt * 0.45);
            bot.upperGroup.rotation.x += dt * 9;
          } else if (bot.state === 'electrocuted') {
            bot.group.position.x += Math.sin(elapsed * 55) * 0.12;
          } else {
            bot.position.addScaledVector(bot.upperVel, dt * 0.45);
            bot.upperVel.y -= 22 * dt;
            bot.group.rotation.x += dt * 10;
          }
          if (bot.stateTimer <= 0) respawnBot(bot);
        }
      });

      // Update Dotted Ink Footstep Particles
      const steppedScaleJitter = Math.floor(elapsed * 12) % 2 === 0 ? 1.0 : 0.94;
      for (let i = 0; i < inkTrailPool.length; i++) {
        const pt = inkTrailPool[i];
        if (!pt.active) continue;
        pt.life -= dt;
        if (pt.life <= 0) {
          pt.active = false;
          pt.mesh.visible = false;
          continue;
        }
        const progress = pt.life / pt.maxLife;
        pt.mat.opacity = progress * 0.48;
        pt.mesh.scale.setScalar(
          pt.baseScale * (1.0 + (1.0 - progress) * 0.28) * steppedScaleJitter
        );
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const currentWeaponSpec = WEAPONS_ARSENAL.find((w) => w.id === activeWeaponId)!;
  const formattedTimer = `${String(Math.floor(matchSeconds / 60)).padStart(2, '0')}:${String(
    matchSeconds % 60
  ).padStart(2, '0')}`;

  const handleTeleportRoom = (room: HouseRoom) => {
    stateRef.current.teleportRoomRequested = room;
    setCurrentRoom(room);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f4efe1] select-none">
      {/* 1. Dedicated WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Penna Blu Bic Transparent Barrel Optical Scope Overlay */}
      {isSniperAiming && gamePhase === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-15 flex items-center justify-center">
          <div className="w-[460px] h-[460px] rounded-full border-8 border-blue-900/70 bg-sky-100/15 flex items-center justify-center shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
            <div className="text-xs font-mono-code text-blue-950 absolute top-6 font-bold">
              MIRINO OTTICO PENNA BLU BIC · TUBO INCHIOSTRO
            </div>
          </div>
        </div>
      )}

      {/* 3. Discreet Peripheral Comic Foley Popups */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {comicPops.map((pop) => (
          <div
            key={pop.id}
            style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-[#fbf9f3]/85 border border-zinc-800 rounded font-hand font-bold text-xs md:text-sm text-zinc-900 opacity-85 rotate-[-3deg]"
          >
            {pop.text}
          </div>
        ))}
      </div>

      {/* 4. Exact Hand-Drawn Crosshair from Reference Screenshot */}
      {gamePhase === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle
              cx="34"
              cy="34"
              r="18"
              fill="none"
              stroke="#141413"
              strokeWidth="2.6"
            />
            <line x1="34" y1="3" x2="34" y2="23" stroke="#141413" strokeWidth="2.6" />
            <line x1="34" y1="45" x2="34" y2="65" stroke="#141413" strokeWidth="2.6" />
            <line x1="3" y1="34" x2="23" y2="34" stroke="#141413" strokeWidth="2.6" />
            <line x1="45" y1="34" x2="65" y2="34" stroke="#141413" strokeWidth="2.6" />
            <line x1="30" y1="34" x2="38" y2="34" stroke="#141413" strokeWidth="2.2" />
            <line x1="34" y1="30" x2="34" y2="38" stroke="#141413" strokeWidth="2.2" />
          </svg>
        </div>
      )}

      {/* 5. SCREENSHOT-IDENTICAL TOP HUD (P1 Torn Strip, 02:14 Torn Card, P2 Torn Strip + Temperino Tag) */}
      <div className="absolute inset-x-0 top-0 p-3 md:p-4 flex items-start justify-between pointer-events-none z-20">
        {/* Top-Left: P1 Torn Paper Strip with Charcoal Sphere & Red/Graphite Pencil Bar */}
        <div className="sketch-box-sm px-3 py-2 bg-[#f5f2e8] flex items-center gap-2.5 pointer-events-auto">
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 rounded-full border-2 border-zinc-950"
              style={{
                background: 'radial-gradient(circle at 32% 30%, #71717a, #18181b 70%)',
              }}
            />
            <span className="font-hand font-bold text-base leading-none text-zinc-950 mt-0.5">
              P1
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-36 md:w-44 h-5 border-2 border-zinc-950 bg-[#52525b] overflow-hidden relative">
              <div
                className="h-full bg-[#f87171] border-r-2 border-zinc-950 transition-all duration-150"
                style={{ width: `${(playerHp / 6) * 100}%` }}
              />
            </div>
            <div className="text-[11px] font-hand font-bold text-zinc-800">
              Stanza: {currentRoom.toUpperCase()} {hasCorkHelmet ? '· Elmo Sughero' : ''}
            </div>
          </div>
        </div>

        {/* Top-Center: Torn Paper Timer Card ("02:14") + Active Boss Meter */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="sketch-box px-5 py-1 bg-[#f5f2e8]">
            <span
              className="font-hand font-bold text-3xl md:text-4xl tracking-wider text-zinc-950 tabular-nums"
              style={{
                textShadow: '1px 1px 0px #ffffff, -1px -1px 0px #ffffff',
              }}
            >
              {formattedTimer}
            </span>
          </div>

          {bossMode !== 'none' && (
            <div className="sketch-box-sm px-3 py-1 bg-amber-100 flex items-center gap-2">
              <span className="text-xs font-hand font-bold text-zinc-950">
                {bossMode === 'padrone'
                  ? `Pazienza Padrone: ${bossMeter}%`
                  : `Caos Gatto (Gomitolo): ${bossMeter}%`}
              </span>
              <div className="w-28 h-3 border border-zinc-900 bg-white overflow-hidden">
                <div
                  className={`h-full ${
                    bossMode === 'padrone' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${bossMeter}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: P2 Torn Paper Strip + Pencil Sharpener ("Temperino") Tag & GDD Button */}
        <div className="flex items-start gap-2.5 pointer-events-auto">
          <button
            onClick={() => setGddOpen(true)}
            className="sketch-box-sm px-3 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-hand font-bold text-xs md:text-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            GDD & 17 Armi
          </button>

          <div className="flex flex-col items-end">
            <div className="sketch-box-sm px-3 py-2 bg-[#f5f2e8] hidden sm:flex items-center gap-2.5">
              <div className="w-36 md:w-44 h-5 border-2 border-zinc-950 bg-[#52525b] overflow-hidden flex justify-end">
                <div className="h-full bg-[#fde047] border-l-2 border-zinc-950 w-1/3" />
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full border-2 border-zinc-950"
                  style={{
                    background: 'radial-gradient(circle at 32% 30%, #71717a, #18181b 70%)',
                  }}
                />
                <span className="font-hand font-bold text-base leading-none text-zinc-950 mt-0.5">
                  P2
                </span>
              </div>
            </div>

            {/* Iconic Hand-Drawn Pencil Sharpener ("Temperino") Tag hanging under P2 (from screenshot!) */}
            <div className="hidden sm:flex items-center gap-1.5 sketch-box-sm px-2.5 py-1 bg-[#f5f2e8] -mt-1 mr-8 rotate-[-4deg]">
              <svg width="26" height="18" viewBox="0 0 26 18">
                <rect
                  x="2"
                  y="2"
                  width="22"
                  height="14"
                  rx="2"
                  fill="#d4d4d8"
                  stroke="#141413"
                  strokeWidth="2"
                />
                <rect
                  x="6"
                  y="5"
                  width="14"
                  height="8"
                  fill="#71717a"
                  stroke="#141413"
                  strokeWidth="1.5"
                />
                <circle cx="13" cy="9" r="2" fill="#141413" />
              </svg>
              <span className="text-[11px] font-hand font-bold text-zinc-900 tabular-nums">
                {playerScore} - {botScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SCREENSHOT-IDENTICAL BOTTOM-LEFT & BOTTOM-RIGHT HEARTS + PAWN BARS */}
      <div className="absolute bottom-16 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
        {/* Green Pencil Box with 3 Red Hearts */}
        <div className="sketch-box-sm px-3 py-1.5 bg-[#86efac] flex items-center gap-2 w-fit">
          {[0, 1, 2].map((heartIdx) => {
            const heartHp = Math.max(0, Math.min(2, playerHp - heartIdx * 2));
            return (
              <div key={heartIdx} className="relative w-6 h-6">
                <svg viewBox="0 0 32 32" className="w-6 h-6">
                  <path
                    d="M16 28 C16 28 4 20 4 11 C4 6.5 7.5 4 11 4 C13.5 4 15 5.5 16 7.5 C17 5.5 18.5 4 21 4 C24.5 4 28 6.5 28 11 C28 20 16 28 16 28 Z"
                    fill={heartHp > 0 ? '#ef4444' : '#d4d4d8'}
                    stroke="#141413"
                    strokeWidth="2.8"
                  />
                </svg>
                {heartHp === 0 && (
                  <svg viewBox="0 0 32 32" className="absolute inset-0 w-6 h-6">
                    <line x1="5" y1="5" x2="27" y2="27" stroke="#141413" strokeWidth="4" />
                    <line x1="27" y1="5" x2="5" y2="27" stroke="#141413" strokeWidth="4" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom-Left Stickman Pawn + Green Stamina / Sprint Bar (from screenshot!) */}
        <div className="sketch-box-sm px-2.5 py-1 bg-[#fbf9f3] flex items-center gap-2 w-48 md:w-56">
          <div className="w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-950 shrink-0" />
          <div className="flex-1 h-4 bg-zinc-200 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-[#86efac] transition-all duration-100"
              style={{ width: `${stamina}%` }}
            />
          </div>
          <span className="text-[11px] font-hand font-bold text-zinc-900">
            {isCrouching ? 'ACCOV.' : 'SCATTO'}
          </span>
        </div>

        <div className="text-xs font-hand font-bold text-zinc-900 bg-[#fbf9f3]/90 px-2.5 py-0.5 border border-zinc-900 rounded max-w-xs truncate">
          {killFeedMsg}
        </div>
      </div>

      {/* Bottom-Right: Orange Pencil Box with 3 Hearts + Pink Ammo Bar with Right Stickman Pawn (from screenshot!) */}
      <div className="absolute bottom-16 right-3 z-20 pointer-events-none flex flex-col items-end gap-1.5">
        <div className="sketch-box-sm px-3 py-1.5 bg-[#fdba74] flex items-center gap-2 w-fit">
          {[0, 1, 2].map((idx) => (
            <svg key={idx} viewBox="0 0 32 32" className="w-6 h-6">
              <path
                d="M16 28 C16 28 4 20 4 11 C4 6.5 7.5 4 11 4 C13.5 4 15 5.5 16 7.5 C17 5.5 18.5 4 21 4 C24.5 4 28 6.5 28 11 C28 20 16 28 16 28 Z"
                fill="#ef4444"
                stroke="#141413"
                strokeWidth="2.8"
              />
            </svg>
          ))}
        </div>

        <div className="sketch-box-sm px-2.5 py-1 bg-[#fbf9f3] flex items-center gap-2 w-52 md:w-64">
          <div className="flex-1 text-left">
            <div className="text-[11px] font-hand font-bold text-zinc-950 truncate">
              [{currentWeaponSpec.keyLabel}] {currentWeaponSpec.name}
            </div>
            <div className="h-3.5 bg-zinc-200 border border-zinc-800 overflow-hidden mt-0.5">
              <div
                className="h-full bg-[#fda4af] transition-all duration-150"
                style={{
                  width:
                    currentWeaponSpec.magSize === -1
                      ? '100%'
                      : `${(ammoCounts[activeWeaponId] / currentWeaponSpec.magSize) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="font-hand font-bold text-base text-zinc-950 tabular-nums">
            {isReloading
              ? 'RIC...'
              : ammoCounts[activeWeaponId] === -1
              ? '∞'
              : `${ammoCounts[activeWeaponId]}/${currentWeaponSpec.magSize}`}
          </div>
          <div className="w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-950 shrink-0" />
        </div>
      </div>

      {/* 7. Unified Collapsible Bottom Control Dock (17 Weapons + 4 Rooms + Arsenal Mode + Boss Mode) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-2 z-30 w-full max-w-[min(1080px,97vw)] transition-transform duration-200 pointer-events-auto ${
          dockCollapsed ? 'translate-y-[calc(100%-26px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="px-3.5 py-0.5 text-xs font-hand font-bold bg-zinc-900 text-amber-200 rounded-t-md border-t-2 border-x-2 border-zinc-950 cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed
              ? '▴ Mostra 17 Armi, 4 Stanze & Modalità (H)'
              : '▾ Nascondi Barra Controlli (Zen Mode · H)'}
          </button>
        </div>

        <div className="sketch-box-sm px-2.5 py-1.5 bg-[#fbf9f3] flex flex-wrap items-center justify-between gap-2">
          {/* Scrollable 17 Weapon Slots */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full lg:max-w-[54%] py-0.5">
            {WEAPONS_ARSENAL.map((w) => {
              const unlocked = unlockedWeapons.includes(w.id);
              const active = w.id === activeWeaponId;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (unlocked) {
                      stateRef.current.weaponId = w.id;
                      setActiveWeaponId(w.id);
                    } else {
                      triggerComicPop(`TROVA IN ${w.spawnRoom.toUpperCase()}!`);
                    }
                  }}
                  className={`px-2 py-0.5 text-[11px] font-hand font-bold rounded border cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-zinc-900 text-amber-300 border-zinc-950'
                      : unlocked
                      ? 'bg-[#f3eedf] text-zinc-900 border-zinc-500 hover:bg-amber-100'
                      : 'bg-zinc-200 text-zinc-400 border-zinc-300 line-through'
                  }`}
                >
                  [{w.keyLabel}] {w.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Room Teleporters + Arsenal Mode + Boss Selector */}
          <div className="flex items-center gap-1 overflow-x-auto shrink-0">
            {(['scrivania', 'bagno', 'cucina', 'soggiorno'] as HouseRoom[]).map((r) => (
              <button
                key={r}
                onClick={() => handleTeleportRoom(r)}
                className={`px-2 py-0.5 text-[11px] font-hand font-bold rounded border border-zinc-900 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentRoom === r ? 'bg-cyan-300 text-zinc-950' : 'bg-white text-zinc-800'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}

            <button
              onClick={() =>
                handleSelectArsenalMode(
                  arsenalMode === 'all_weapons' ? 'scavenger' : 'all_weapons'
                )
              }
              className="px-2 py-0.5 text-[11px] font-hand font-bold bg-amber-200 hover:bg-amber-300 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {arsenalMode === 'all_weapons' ? 'Mod: Tutte Armi' : 'Mod: Trova in Mappa'}
            </button>

            <button
              onClick={() =>
                handleSelectBossMode(
                  bossMode === 'none' ? 'padrone' : bossMode === 'padrone' ? 'gatto' : 'none'
                )
              }
              className="px-2 py-0.5 text-[11px] font-hand font-bold bg-rose-200 hover:bg-rose-300 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              Boss: {bossMode === 'none' ? 'Off' : bossMode === 'padrone' ? 'Padrone' : 'Gatto'}
            </button>

            <button
              onClick={() => {
                foleyAudio.muted = !isMuted;
                setIsMuted(!isMuted);
              }}
              className="px-2 py-0.5 text-[11px] font-hand font-bold bg-zinc-200 text-zinc-900 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {isMuted ? 'Muto' : 'Audio'}
            </button>
          </div>
        </div>
      </div>

      {/* 8. Title Screen / Pause / Victory Modal */}
      {gamePhase !== 'playing' && !gddOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 pointer-events-auto">
          <div className="sketch-box bg-graph-paper max-w-2xl w-full p-6 md:p-7 text-center space-y-5">
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 540 100" className="w-full max-w-md h-auto">
                <rect
                  x="8"
                  y="8"
                  width="524"
                  height="84"
                  rx="12"
                  fill="#fde047"
                  stroke="#141413"
                  strokeWidth="4.5"
                />
                <text
                  x="270"
                  y="64"
                  textAnchor="middle"
                  fontFamily="Patrick Hand, cursive"
                  fontSize="54"
                  fontWeight="bold"
                  fill="#141413"
                >
                  CALL OF DOODLE
                </text>
              </svg>
              <p className="text-sm font-hand font-bold text-zinc-800 mt-1">
                Casa Completa (4 Stanze) · 17 Armi Domestiche · Boss Co-op Padrone & Gatto
              </p>
            </div>

            {/* Mode Selection Controls right on the Title/Pause Screen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
              <div className="p-3 bg-[#fbf9f3] border-2 border-zinc-900 rounded space-y-2">
                <div className="font-bold font-hand text-sm text-zinc-950">
                  1. Scegli Modalità Arsenale:
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectArsenalMode('all_weapons')}
                    className={`flex-1 py-1.5 px-2 font-hand font-bold rounded border border-zinc-900 cursor-pointer ${
                      arsenalMode === 'all_weapons'
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-800'
                    }`}
                  >
                    Tutte le 17 Armi Subito
                  </button>
                  <button
                    onClick={() => handleSelectArsenalMode('scavenger')}
                    className={`flex-1 py-1.5 px-2 font-hand font-bold rounded border border-zinc-900 cursor-pointer ${
                      arsenalMode === 'scavenger'
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-800'
                    }`}
                  >
                    Trova Armi in Casa
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#fbf9f3] border-2 border-zinc-900 rounded space-y-2">
                <div className="font-bold font-hand text-sm text-zinc-950">
                  2. Scegli Modalità Partita / Boss Co-op:
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleSelectBossMode('none')}
                    className={`flex-1 py-1.5 px-1.5 font-hand font-bold rounded border border-zinc-900 cursor-pointer ${
                      bossMode === 'none'
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-800'
                    }`}
                  >
                    Arena Bot
                  </button>
                  <button
                    onClick={() => handleSelectBossMode('padrone')}
                    className={`flex-1 py-1.5 px-1.5 font-hand font-bold rounded border border-zinc-900 cursor-pointer ${
                      bossMode === 'padrone'
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-800'
                    }`}
                  >
                    Boss Padrone
                  </button>
                  <button
                    onClick={() => handleSelectBossMode('gatto')}
                    className={`flex-1 py-1.5 px-1.5 font-hand font-bold rounded border border-zinc-900 cursor-pointer ${
                      bossMode === 'gatto'
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-800'
                    }`}
                  >
                    Boss Gatto
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <button
                onClick={() => setGamePhase('playing')}
                className="px-7 py-2.5 text-xl font-bold font-hand bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-2 border-zinc-950 rounded-xl shadow-[4px_4px_0px_#eab308] cursor-pointer whitespace-nowrap shrink-0"
              >
                {gamePhase === 'paused' ? 'Riprendi Partita (SPAZIO)' : 'Entra nella Casa 3D (INVIO / SPAZIO)'}
              </button>

              <button
                onClick={() => setGddOpen(true)}
                className="px-5 py-2.5 text-lg font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border-2 border-zinc-950 rounded-xl shadow-[4px_4px_0px_#141413] cursor-pointer whitespace-nowrap shrink-0"
              >
                Apri GDD Completo & 17 Armi
              </button>
            </div>

            <div className="text-xs font-mono-code text-zinc-700">
              WASD Muovi · Shift Scatto · Spazio Salta · C Accovaccia · R Ricarica · Click Spara · Z/Dx Mirino Bic · E Sciacquone
            </div>
          </div>
        </div>
      )}

      {/* 9. Full GDD & Technical Architecture Modal */}
      <GddTechnicalModal
        isOpen={gddOpen}
        onClose={() => setGddOpen(false)}
        onSelectWeaponToTest={(wId) => {
          stateRef.current.unlocked.add(wId);
          setUnlockedWeapons(Array.from(stateRef.current.unlocked));
          stateRef.current.weaponId = wId;
          setActiveWeaponId(wId);
        }}
        onSelectRoomToTeleport={handleTeleportRoom}
      />
    </div>
  );
}
