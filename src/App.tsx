import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GddTechnicalModal } from './components/GddTechnicalModal';
import { WEAPONS_ARSENAL, WeaponId, WeaponSpec } from './data/gddData';
import {
  boilingTimeUniform,
  createBoilingOutlineMaterial,
  createDottedInkTrailTexture,
  createFirstPersonViewmodel,
  createGraphPaperTexture,
  createHatchShadowTexture,
  createStickmanActor,
  StickmanActor,
} from './game/doodleModels';
import { buildArenaMap, BuiltArena } from './game/mapBuilder';
import { foleyAudio } from './game/soundEngine';

type GamePhase = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

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
}

interface ComicPopText {
  id: number;
  text: string;
  color: string;
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

// Reusable module-scope math helpers (Zero-GC in animation loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveVec = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _projNext = new THREE.Vector3();

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Game Shell state
  const [gamePhase, setGamePhase] = useState<GamePhase>('title');
  const [activeMap, setActiveMap] = useState<'scrivania' | 'bagno'>('scrivania');
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponId>('penna');
  const [playerHp, setPlayerHp] = useState<number>(6); // 6 half-hearts = 3 full hearts
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [matchSeconds, setMatchSeconds] = useState<number>(134); // Starts at 02:14 like screenshot!
  const [ammoCounts, setAmmoCounts] = useState<Record<WeaponId, number>>({
    penna: 24,
    taglierino: -1,
    colla: 12,
    cucchiaio: -1,
    bianchetto: 10,
    forbici: -1,
    elastici: 18,
    cerbottana: 5,
    gomma: 6,
  });
  const [playerGluedCount, setPlayerGluedCount] = useState<number>(0); // >0 means player must mash SPACE
  const [playerBlindTimer, setPlayerBlindTimer] = useState<number>(0); // >0 means screen covered in Bianchetto
  const [flushComboActive, setFlushComboActive] = useState<boolean>(false);
  const [comicPops, setComicPops] = useState<ComicPopText[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [gddOpen, setGddOpen] = useState<boolean>(false);
  const [killFeedMsg, setKillFeedMsg] = useState<string>(
    'Benvenuto su Call of Doodle! Usa 1-9 per cambiare arma di cancelleria.'
  );

  // Mutable refs for 60fps simulation loop
  const stateRef = useRef({
    phase: 'title' as GamePhase,
    mapId: 'scrivania' as 'scrivania' | 'bagno',
    weaponId: 'penna' as WeaponId,
    hp: 6,
    score: 0,
    botScore: 0,
    gluedMashesRemaining: 0,
    blindTimer: 0,
    hitstopTimer: 0,
    shakeIntensity: 0,
    recoilKick: 0,
    lastFireTime: 0,
    flushVortexTimer: 0,
    ammo: {
      penna: 24,
      taglierino: -1,
      colla: 12,
      cucchiaio: -1,
      bianchetto: 10,
      forbici: -1,
      elastici: 18,
      cerbottana: 5,
      gomma: 6,
    } as Record<WeaponId, number>,
    rebuildMapRequested: false,
  });

  useEffect(() => {
    stateRef.current.phase = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    stateRef.current.weaponId = activeWeaponId;
  }, [activeWeaponId]);

  const triggerComicPop = (text: string, color = '#eab308') => {
    const id = Date.now() + Math.random();
    // Keep comic foley popups discreet in the upper-right periphery away from the crosshair
    const x = 76 + Math.random() * 10;
    const y = 15 + Math.random() * 8;
    setComicPops((prev) => [...prev.slice(-1), { id, text, color, x, y }]);
    window.setTimeout(() => {
      setComicPops((prev) => prev.filter((p) => p.id !== id));
    }, 620);
  };

  // Match countdown timer (ticks when playing)
  useEffect(() => {
    if (gamePhase !== 'playing' || gddOpen) return;
    const timer = window.setInterval(() => {
      setMatchSeconds((prev) => {
        if (prev <= 1) {
          setGamePhase('victory');
          if (document.pointerLockElement) {
            document.exitPointerLock?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gamePhase, gddOpen]);

  // Main Three.js WebGL Engine initialization (Mounted once in isolated ref container)
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    // 1. Software-WebGL Guard (Three.js Skill Directive)
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
    renderer.setSize(mountEl.clientWidth || window.innerWidth, mountEl.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4efe1);
    scene.fog = new THREE.FogExp2(0xf4efe1, 0.015);

    // 2. Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced 3-Point Studio Lighting Rig (Warm Key + Cool Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xd6d3d1, 0.95);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    keyLight.position.set(16, 28, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 65;
    const d = 24;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    rimLight.position.set(-18, 15, -16);
    scene.add(rimLight);

    // 4. First-Person Perspective Camera + Stickman Hands Viewmodel
    const camera = new THREE.PerspectiveCamera(
      72,
      (mountEl.clientWidth || window.innerWidth) / (mountEl.clientHeight || window.innerHeight),
      0.1,
      140
    );
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const outlineMat = createBoilingOutlineMaterial(0.032);
    const graphPaperTex = createGraphPaperTexture(maxAniso);
    const hatchShadowTex = createHatchShadowTexture();
    const dottedInkTrailTex = createDottedInkTrailTexture();

    const viewmodel = createFirstPersonViewmodel(outlineMat);
    camera.add(viewmodel.root);

    // Build initial arena map
    let currentArena: BuiltArena = buildArenaMap(
      stateRef.current.mapId,
      maxAniso,
      outlineMat,
      graphPaperTex
    );
    scene.add(currentArena.group);

    // Decal Pool for Black Ink Splats (Taglierino/Forbici) & Wall Pencil Dents (Cucchiaio)
    const decalPool: THREE.Mesh[] = [];
    const inkDecalGeo = new THREE.CircleGeometry(0.95, 12);
    const inkDecalMat = new THREE.MeshBasicMaterial({
      color: 0x121210,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    for (let i = 0; i < 20; i++) {
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

    // Pooled Projectiles (28 projectiles for Zero-GC)
    const projectilePool: ActiveProjectile[] = [];
    const projGeo = new THREE.SphereGeometry(0.18, 8, 8);
    for (let i = 0; i < 28; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
      const mesh = new THREE.Mesh(projGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      projectilePool.push({
        active: false,
        mesh,
        position: mesh.position,
        velocity: new THREE.Vector3(),
        weaponId: 'penna',
        fromPlayer: true,
        bouncesLeft: 0,
        bounceCount: 0,
        life: 0,
        damage: 2,
      });
    }

    // Spawn 5 Stickman Bot Actors
    const botNames = [
      'Scarabocchio_99',
      'TrattoPen_Nero',
      'GommaPane_X',
      'Righello_30cm',
      'Temperino_Pro',
    ];
    const botSpawns: [number, number][] = [
      [-8, -4],
      [7, -6],
      [6, 6],
      [-7, 8],
      [1, -9],
    ];
    const bots: StickmanActor[] = botSpawns.map(([sx, sz], idx) => {
      const actor = createStickmanActor(idx, botNames[idx], sx, sz, hatchShadowTex, outlineMat);
      scene.add(actor.group);
      return actor;
    });
    const botStepTimers = bots.map(() => 0);
    const botStepFootToggle = bots.map(() => false);

    // Player Physics & Input State
    const player = {
      pos: new THREE.Vector3(0, 0, 14.5),
      vel: new THREE.Vector3(0, 0, 0),
      yaw: 0,
      pitch: -0.05,
      grounded: true,
      coyoteTimer: 0,
      walkCycle: 0,
      stepTrailTimer: 0,
      stepFootToggle: false,
    };

    const heldKeys = new Set<string>();

    const switchWeapon = (wId: WeaponId) => {
      stateRef.current.weaponId = wId;
      setActiveWeaponId(wId);
      (Object.keys(viewmodel.weaponMeshes) as WeaponId[]).forEach((k) => {
        viewmodel.weaponMeshes[k].visible = k === wId;
      });
    };

    const triggerToiletFlushCombo = () => {
      if (stateRef.current.mapId !== 'bagno' || stateRef.current.flushVortexTimer > 0) return;
      stateRef.current.flushVortexTimer = 5.0;
      setFlushComboActive(true);
      foleyAudio.playToiletFlush();
      triggerComicPop('SCARICO TOTALE ATTIVATO!', '#06b6d4');
      setKillFeedMsg('MEGA-COMBO: Hai aperto la tavoletta e tirato lo sciacquone del WC!');
    };

    const fireCurrentWeapon = () => {
      if (stateRef.current.phase !== 'playing') return;
      const now = performance.now();
      const spec = WEAPONS_ARSENAL.find((w) => w.id === stateRef.current.weaponId)!;
      if (now - stateRef.current.lastFireTime < spec.fireRateMs) return;

      // Check ammo
      const currentAmmo = stateRef.current.ammo[spec.id];
      if (currentAmmo === 0) {
        triggerComicPop('MUNIZIONI ESAURITE! (Raccogli Carta)', '#ef4444');
        return;
      }
      if (currentAmmo > 0) {
        stateRef.current.ammo[spec.id] = currentAmmo - 1;
        setAmmoCounts({ ...stateRef.current.ammo });
      }

      stateRef.current.lastFireTime = now;
      stateRef.current.recoilKick = 1.0;
      foleyAudio.playWeaponFire(spec.id);
      triggerComicPop(spec.foleyOnomatopoeia, spec.accentColor);

      // Melee Weapons (Taglierino, Cucchiaio, Forbici)
      if (spec.projectileSpeed === 0) {
        camera.getWorldDirection(_forward);
        let hitSomeone = false;

        bots.forEach((bot) => {
          if (bot.state !== 'alive') return;
          _toTarget.subVectors(bot.position, player.pos);
          _toTarget.y = 0;
          const dist = _toTarget.length();
          if (dist < 4.6) {
            _toTarget.normalize();
            const forwardFlat = _forward.clone().setY(0).normalize();
            if (forwardFlat.dot(_toTarget) > 0.35 || dist < 2.2) {
              hitSomeone = true;
              applyWeaponHitToBot(bot, spec, _toTarget);
            }
          }
        });

        // If using Cucchiaio near a structure, leave a drawn dent + camera shake
        if (spec.id === 'cucchiaio') {
          stateRef.current.shakeIntensity = 0.22;
          if (hitSomeone) {
            stateRef.current.hitstopTimer = 0.065; // 65ms simulation hitstop on heavy impact!
          }
        }
        return;
      }

      // Ranged Projectile Weapons
      const proj = projectilePool.find((p) => !p.active);
      if (!proj) return;

      camera.getWorldDirection(_forward);
      proj.active = true;
      proj.weaponId = spec.id;
      proj.fromPlayer = true;
      proj.damage = spec.damage;
      proj.life = 4.2;
      proj.bounceCount = 0;
      proj.bouncesLeft = spec.id === 'elastici' ? 4 : spec.id === 'gomma' ? 3 : 0;

      proj.position.copy(player.pos).addScaledVector(_forward, 0.9);
      proj.position.y += 1.45;
      proj.velocity.copy(_forward).multiplyScalar(spec.projectileSpeed);
      if (spec.id === 'gomma' || spec.id === 'colla' || spec.id === 'bianchetto') {
        proj.velocity.y += 3.2; // Arced throw
      }

      const mat = proj.mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(spec.accentColor);
      proj.mesh.scale.setScalar(
        spec.id === 'gomma' ? 1.65 : spec.id === 'bianchetto' ? 1.4 : 1.0
      );
      proj.mesh.visible = true;
    };

    const applyWeaponHitToBot = (
      bot: StickmanActor,
      spec: WeaponSpec,
      hitDir: THREE.Vector3
    ) => {
      bot.hp -= spec.damage;

      if (spec.id === 'colla') {
        bot.gluedTimer = 3.0;
        bot.gluePuddle.visible = true;
        setKillFeedMsg(`Hai incollato a terra ${bot.name} per 3 secondi col Tubetto di Colla!`);
      } else if (spec.id === 'bianchetto') {
        bot.blindedTimer = 2.5;
        bot.whiteoutSplat.visible = true;
        setKillFeedMsg(`Hai accecato ${bot.name} col Bianchetto (Correction Fluid)!`);
      } else if (spec.id === 'cucchiaio') {
        bot.velocity.addScaledVector(hitDir, 18);
        bot.velocity.y = 7.5;
        stateRef.current.hitstopTimer = 0.06;
      } else {
        bot.velocity.addScaledVector(hitDir, 6.5);
      }

      if (bot.hp <= 0 && bot.state === 'alive') {
        stateRef.current.score += 1;
        setPlayerScore(stateRef.current.score);
        spawnInkSplat(bot.position.x, bot.position.z, 1.3);

        if (spec.id === 'taglierino') {
          // Cut stickman in half!
          bot.state = 'sliced';
          bot.stateTimer = 2.6;
          bot.upperVel.copy(hitDir).multiplyScalar(8).setY(6.5);
          setKillFeedMsg(`ZIIIP! Hai mozzato a metà ${bot.name} col Taglierino!`);
        } else if (spec.id === 'forbici') {
          // Decapitate spherical head so it rolls like a ball!
          bot.state = 'decapitated';
          bot.stateTimer = 2.8;
          bot.headVel.copy(hitDir).multiplyScalar(11).setY(5.5);
          setKillFeedMsg(`SNIP-SNIP! La testa di ${bot.name} rotola via come una biglia!`);
        } else {
          // Comedic full ragdoll tumble
          bot.state = 'ragdoll';
          bot.stateTimer = 2.4;
          bot.upperVel.copy(hitDir).multiplyScalar(12).setY(8.0);
          setKillFeedMsg(`${bot.name} eliminato con ${spec.name} (${spec.foleyOnomatopoeia})`);
        }
      }
    };

    const respawnBot = (bot: StickmanActor) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 9 + Math.random() * 8;
      bot.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      bot.velocity.set(0, 0, 0);
      bot.hp = bot.maxHp;
      bot.state = 'alive';
      bot.gluedTimer = 0;
      bot.blindedTimer = 0;
      bot.gluePuddle.visible = false;
      bot.whiteoutSplat.visible = false;
      bot.group.rotation.set(0, 0, 0);
      bot.upperGroup.position.set(0, 0.95, 0);
      bot.upperGroup.rotation.set(0, 0, 0);
      bot.headGroup.position.set(0, 1.24, 0);
      bot.headGroup.rotation.set(0, 0, 0);
    };

    // Input Event Listeners
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

      // Weapon hotkeys 1 - 9
      if (code.startsWith('Digit')) {
        const num = parseInt(code.replace('Digit', ''), 10);
        const found = WEAPONS_ARSENAL.find((w) => w.keyNum === num);
        if (found) switchWeapon(found.id);
      }

      // Spacebar: Jump OR Button-Mash to unglue shoes!
      if (code === 'Space') {
        if (stateRef.current.gluedMashesRemaining > 0) {
          stateRef.current.gluedMashesRemaining -= 1;
          setPlayerGluedCount(stateRef.current.gluedMashesRemaining);
          foleyAudio.playWeaponFire('colla');
          if (stateRef.current.gluedMashesRemaining === 0) {
            triggerComicPop('SCARPE SCOLLATE!', '#22c55e');
          }
        } else if (player.grounded || player.coyoteTimer > 0) {
          player.vel.y = 10.5;
          player.grounded = false;
          player.coyoteTimer = 0;
          foleyAudio.playBoing(0);
        }
      }

      // E key: Trigger Toilet Flush Vortex Combo in Il Bagno or switch map
      if (code === 'KeyE') {
        if (stateRef.current.mapId === 'bagno') {
          triggerToiletFlushCombo();
        } else {
          // Switch to Il Bagno to try the toilet flush combo!
          stateRef.current.mapId = 'bagno';
          stateRef.current.rebuildMapRequested = true;
          setActiveMap('bagno');
          setKillFeedMsg('Mappa cambiata: IL BAGNO! Premi [E] vicino al WC per tirare lo Sciacquone!');
        }
      }

      if (code === 'KeyF') {
        fireCurrentWeapon();
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
        player.yaw -= e.movementX * 0.0022;
        player.pitch = THREE.MathUtils.clamp(
          player.pitch - e.movementY * 0.0022,
          -1.15,
          1.15
        );
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (stateRef.current.phase !== 'playing') return;
      if (e.button === 0) {
        if (document.pointerLockElement !== renderer.domElement) {
          renderer.domElement.requestPointerLock?.();
        }
        fireCurrentWeapon();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.phase !== 'playing') return;
      const idx = WEAPONS_ARSENAL.findIndex((w) => w.id === stateRef.current.weaponId);
      const nextIdx = (idx + (e.deltaY > 0 ? 1 : -1) + WEAPONS_ARSENAL.length) % WEAPONS_ARSENAL.length;
      switchWeapon(WEAPONS_ARSENAL[nextIdx].id);
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

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 5. Animation & Physics Loop with Software-WebGL `afterDraw` pacing
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
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta time
      const elapsed = clock.getElapsedTime();

      // Update global 12 FPS boiling-line outline shader uniform
      boilingTimeUniform.value = elapsed;

      // Check if map switch was requested from UI
      if (stateRef.current.rebuildMapRequested) {
        stateRef.current.rebuildMapRequested = false;
        scene.remove(currentArena.group);
        currentArena = buildArenaMap(
          stateRef.current.mapId,
          maxAniso,
          outlineMat,
          graphPaperTex
        );
        scene.add(currentArena.group);
        player.pos.set(0, 0, 14.5);
        player.vel.set(0, 0, 0);
      }

      // Sync active viewmodel mesh
      (Object.keys(viewmodel.weaponMeshes) as WeaponId[]).forEach((k) => {
        viewmodel.weaponMeshes[k].visible = k === stateRef.current.weaponId;
      });

      // Handle brief hitstop on heavy impacts (Cucchiaio CLANG!)
      if (stateRef.current.hitstopTimer > 0) {
        stateRef.current.hitstopTimer -= dt;
        renderer.render(scene, camera);
        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
        return;
      }

      if (stateRef.current.phase === 'title') {
        // Atmospheric live-world camera pan over the desk arena & stickman skirmish
        const camAngle = elapsed * 0.22;
        camera.position.set(
          Math.sin(camAngle) * 19,
          7.5 + Math.sin(elapsed * 0.6) * 1.2,
          Math.cos(camAngle) * 19
        );
        camera.lookAt(0, 1.8, 0);
        viewmodel.root.visible = false;
      } else if (stateRef.current.phase === 'playing') {
        viewmodel.root.visible = true;

        // Keyboard look fallback (ArrowLeft / ArrowRight / Q / E)
        if (heldKeys.has('ArrowLeft') || heldKeys.has('KeyQ')) player.yaw += 2.1 * dt;
        if (heldKeys.has('ArrowRight')) player.yaw -= 2.1 * dt;
        if (heldKeys.has('ArrowUp')) player.pitch = Math.min(1.1, player.pitch + 1.5 * dt);
        if (heldKeys.has('ArrowDown')) player.pitch = Math.max(-1.1, player.pitch - 1.5 * dt);

        // Blindness countdown (when hit by enemy Bianchetto)
        if (stateRef.current.blindTimer > 0) {
          stateRef.current.blindTimer = Math.max(0, stateRef.current.blindTimer - dt);
          setPlayerBlindTimer(stateRef.current.blindTimer);
        }

        // Player Movement (blocked if glued by Tubetto di Colla!)
        _forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)).normalize();
        _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw)).normalize();
        _moveVec.set(0, 0, 0);

        if (stateRef.current.gluedMashesRemaining <= 0) {
          if (heldKeys.has('KeyW')) _moveVec.add(_forward);
          if (heldKeys.has('KeyS')) _moveVec.sub(_forward);
          if (heldKeys.has('KeyD')) _moveVec.add(_right);
          if (heldKeys.has('KeyA')) _moveVec.sub(_right);
        }

        if (_moveVec.lengthSq() > 0) {
          _moveVec.normalize();
          player.walkCycle += dt * 11;
        }

        // Check if standing in slippery Coffee Puddle on La Scrivania
        let onCoffee = false;
        if (
          currentArena.coffeePuddleCenter &&
          currentArena.coffeePuddleRadius &&
          player.pos.distanceTo(currentArena.coffeePuddleCenter) < currentArena.coffeePuddleRadius
        ) {
          onCoffee = true;
        }

        const speed = onCoffee ? 15.5 : 10.5;
        const damping = onCoffee ? 2.2 : 11.0;
        player.vel.x = THREE.MathUtils.damp(player.vel.x, _moveVec.x * speed, damping, dt);
        player.vel.z = THREE.MathUtils.damp(player.vel.z, _moveVec.z * speed, damping, dt);
        player.vel.y -= 25.0 * dt; // Gravity

        player.pos.addScaledVector(player.vel, dt);

        // Arena Bounds & Platform/Book Collisions
        player.pos.x = THREE.MathUtils.clamp(player.pos.x, -20.5, 20.5);
        player.pos.z = THREE.MathUtils.clamp(player.pos.z, -20.5, 20.5);

        let floorHeight = 0;
        let hitBouncePad = false;
        let hitDuck = false;

        for (const box of currentArena.colliders) {
          if (
            player.pos.x > box.minX - 0.45 &&
            player.pos.x < box.maxX + 0.45 &&
            player.pos.z > box.minZ - 0.45 &&
            player.pos.z < box.maxZ + 0.45
          ) {
            if (player.pos.y >= box.topY - 0.65) {
              floorHeight = Math.max(floorHeight, box.topY);
              if (box.isBouncePad) hitBouncePad = true;
              if (box.isDuck) hitDuck = true;
            } else {
              // Push out horizontally from book/cup sides
              if (player.pos.x < (box.minX + box.maxX) * 0.5) player.pos.x = box.minX - 0.45;
              else player.pos.x = box.maxX + 0.45;
            }
          }
        }

        if (player.pos.y <= floorHeight) {
          player.pos.y = floorHeight;
          if (hitBouncePad) {
            player.vel.y = 14.5;
            player.grounded = false;
            if (hitDuck) {
              foleyAudio.playDuckSqueak();
              triggerComicPop('SQUEAK! (Paperella)', '#facc15');
            } else {
              foleyAudio.playBoing(1);
              triggerComicPop('BOING! (Spugna)', '#f472b6');
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

        // Check Paper Scrap Pickups (Reloads Cerbottana & Penna!)
        currentArena.paperPickups.forEach((pMesh) => {
          pMesh.rotation.y += dt * 1.8;
          if (pMesh.visible && player.pos.distanceTo(pMesh.position) < 1.65) {
            pMesh.visible = false;
            foleyAudio.playPaperPickup();
            stateRef.current.ammo.cerbottana = Math.min(10, stateRef.current.ammo.cerbottana + 3);
            stateRef.current.ammo.penna = Math.min(36, stateRef.current.ammo.penna + 8);
            setAmmoCounts({ ...stateRef.current.ammo });
            triggerComicPop('+3 CARTA PER CERBOTTANA!', '#38bdf8');
            window.setTimeout(() => {
              pMesh.visible = true;
            }, 7000);
          }
        });

        // Spawn faint hand-drawn dotted ink trail behind Player's feet when running
        const horizSpeedSq = player.vel.x * player.vel.x + player.vel.z * player.vel.z;
        if (player.grounded && horizSpeedSq > 2.2) {
          player.stepTrailTimer -= dt;
          if (player.stepTrailTimer <= 0) {
            player.stepTrailTimer = 0.11;
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

        // Camera Position + Decaying Shake + Stepped 12 FPS Viewmodel Bob
        stateRef.current.shakeIntensity = THREE.MathUtils.damp(
          stateRef.current.shakeIntensity,
          0,
          12,
          dt
        );
        stateRef.current.recoilKick = THREE.MathUtils.damp(
          stateRef.current.recoilKick,
          0,
          14,
          dt
        );

        const steppedWalk = Math.floor(player.walkCycle * 12) / 12;
        const bobY = player.grounded ? Math.abs(Math.sin(steppedWalk)) * 0.065 : 0;
        const shakeX = (Math.random() - 0.5) * stateRef.current.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * stateRef.current.shakeIntensity;

        camera.up.set(0, 1, 0);
        camera.position.set(
          player.pos.x + shakeX,
          player.pos.y + 1.68 + bobY + shakeY,
          player.pos.z
        );
        // Explicitly set z = 0 in YXZ order so title-screen lookAt never leaves the camera upside down!
        camera.rotation.set(
          player.pitch + stateRef.current.recoilKick * 0.09,
          player.yaw,
          0,
          'YXZ'
        );

        viewmodel.root.position.set(
          Math.sin(steppedWalk * 0.5) * 0.025,
          -0.34 - stateRef.current.recoilKick * 0.04,
          -0.68 + stateRef.current.recoilKick * 0.11
        );
      }

      // Animate Floating Rubber Ducks in Il Bagno
      currentArena.rubberDucks.forEach((duck, idx) => {
        duck.position.y = 1.52 + Math.sin(elapsed * 2.5 + idx) * 0.12;
        duck.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.08;
      });

      // Animate Toilet Lid & Swirling Flush Vortex Combo in Il Bagno
      if (stateRef.current.flushVortexTimer > 0 && currentArena.toiletBowlCenter) {
        stateRef.current.flushVortexTimer -= dt;
        if (currentArena.toiletLidPivot) {
          currentArena.toiletLidPivot.rotation.x = THREE.MathUtils.damp(
            currentArena.toiletLidPivot.rotation.x,
            -Math.PI / 2.1,
            8,
            dt
          );
        }
        if (currentArena.flushVortexMesh) {
          currentArena.flushVortexMesh.visible = true;
          currentArena.flushVortexMesh.rotation.y += dt * 14;
        }

        // Pull all alive bots into the swirling toilet bowl!
        bots.forEach((bot) => {
          if (bot.state === 'alive') {
            _toTarget.subVectors(currentArena.toiletBowlCenter!, bot.position);
            const dist = _toTarget.length();
            if (dist < 17) {
              _toTarget.normalize();
              bot.position.addScaledVector(_toTarget, 11.5 * dt);
              bot.rotationY += dt * 15;
              if (dist < 2.6) {
                bot.state = 'flushed';
                bot.stateTimer = 2.0;
                stateRef.current.score += 1;
                setPlayerScore(stateRef.current.score);
                triggerComicPop('FLUSH COMBO +1!', '#06b6d4');
              }
            }
          }
        });

        if (stateRef.current.flushVortexTimer <= 0) {
          setFlushComboActive(false);
          if (currentArena.flushVortexMesh) currentArena.flushVortexMesh.visible = false;
        }
      } else if (currentArena.toiletLidPivot) {
        currentArena.toiletLidPivot.rotation.x = THREE.MathUtils.damp(
          currentArena.toiletLidPivot.rotation.x,
          0,
          6,
          dt
        );
      }

      // Update Projectiles & Mid-Air Eraser Cancellation
      for (let i = 0; i < projectilePool.length; i++) {
        const p = projectilePool[i];
        if (!p.active) continue;

        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        // Gravity on heavy/arced projectiles
        if (
          p.weaponId === 'gomma' ||
          p.weaponId === 'colla' ||
          p.weaponId === 'bianchetto' ||
          p.weaponId === 'elastici'
        ) {
          p.velocity.y -= 13.5 * dt;
        }

        _projNext.copy(p.position).addScaledVector(p.velocity, dt);

        // Floor & Wall Bounce for Elastici and Gomma da Cancellare
        if (_projNext.y < 0.22) {
          if (p.bouncesLeft > 0) {
            p.bouncesLeft--;
            p.bounceCount++;
            _projNext.y = 0.22;
            p.velocity.y = Math.abs(p.velocity.y) * 0.78;
            if (p.weaponId === 'elastici') {
              p.damage = Math.min(6, p.damage + 1); // Gains damage on bounce!
              foleyAudio.playBoing(p.bounceCount);
            }
          } else {
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
        }

        if (Math.abs(_projNext.x) > 21 || Math.abs(_projNext.z) > 21) {
          if (p.bouncesLeft > 0) {
            p.bouncesLeft--;
            p.bounceCount++;
            if (Math.abs(_projNext.x) > 21) p.velocity.x *= -0.85;
            if (Math.abs(_projNext.z) > 21) p.velocity.z *= -0.85;
            foleyAudio.playBoing(p.bounceCount);
          } else {
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
        }

        p.position.copy(_projNext);

        // Special Mechanic: Gomma da Cancellare ERASES enemy projectiles in mid-air!
        if (p.weaponId === 'gomma' && p.fromPlayer) {
          for (let j = 0; j < projectilePool.length; j++) {
            const other = projectilePool[j];
            if (other.active && !other.fromPlayer && other.position.distanceTo(p.position) < 4.5) {
              other.active = false;
              other.mesh.visible = false;
              foleyAudio.playEraseProjectile();
              triggerComicPop('PROIETTILE CANCELLATO!', '#a855f7');
            }
          }
        }

        // Check projectile collision against Stickman Bots or Player
        if (p.fromPlayer) {
          for (const bot of bots) {
            if (bot.state !== 'alive') continue;
            const dx = p.position.x - bot.position.x;
            const dz = p.position.z - bot.position.z;
            const dy = p.position.y - (bot.position.y + 1.1);
            if (dx * dx + dz * dz < 0.75 && Math.abs(dy) < 1.35) {
              const spec = WEAPONS_ARSENAL.find((w) => w.id === p.weaponId)!;
              _toTarget.copy(p.velocity).setY(0).normalize();
              applyWeaponHitToBot(bot, spec, _toTarget);
              p.active = false;
              p.mesh.visible = false;
              break;
            }
          }
        } else if (stateRef.current.phase === 'playing') {
          // Bot projectile hitting Player
          const dx = p.position.x - player.pos.x;
          const dz = p.position.z - player.pos.z;
          const dy = p.position.y - (player.pos.y + 1.2);
          if (dx * dx + dz * dz < 0.75 && Math.abs(dy) < 1.35) {
            p.active = false;
            p.mesh.visible = false;
            stateRef.current.shakeIntensity = 0.16;

            if (p.weaponId === 'colla') {
              stateRef.current.gluedMashesRemaining = 4;
              setPlayerGluedCount(4);
              triggerComicPop('INCOLLATO! PREMI SPAZIO x4!', '#f59e0b');
            } else if (p.weaponId === 'bianchetto') {
              stateRef.current.blindTimer = 2.0;
              setPlayerBlindTimer(2.0);
              triggerComicPop('ACCECATO DAL BIANCHETTO!', '#ec4899');
            }

            stateRef.current.hp = Math.max(0, stateRef.current.hp - 1);
            setPlayerHp(stateRef.current.hp);
            if (stateRef.current.hp <= 0) {
              stateRef.current.botScore += 1;
              setBotScore(stateRef.current.botScore);
              stateRef.current.hp = 6;
              setPlayerHp(6);
              player.pos.set(0, 0, 14.5);
              triggerComicPop('SCARABOCCHIATO! RESPAWN!', '#ef4444');
            }
          }
        }
      }

      // Update Stickman Bots (Stepped 12 FPS Flipbook Animation + Ragdoll States)
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

          // AI Steering toward player or wandering if blinded
          _toTarget.subVectors(player.pos, bot.position);
          _toTarget.y = 0;
          const distToPlayer = _toTarget.length();

          if (bot.blindedTimer > 0) {
            bot.rotationY += dt * 6;
          } else if (distToPlayer > 0.1) {
            bot.rotationY = Math.atan2(_toTarget.x, _toTarget.z);
          }

          const moveSpeed = bot.gluedTimer > 0 ? 0 : distToPlayer > 6.5 ? 4.2 : 1.8;
          const strafeAngle = bot.rotationY + (distToPlayer <= 6.5 ? Math.PI / 2 : 0);
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
          bot.position.x = THREE.MathUtils.clamp(bot.position.x, -19, 19);
          bot.position.z = THREE.MathUtils.clamp(bot.position.z, -19, 19);
          bot.group.rotation.y = bot.rotationY;

          // Stepped 12 FPS Flipbook Limb Animation
          const swing =
            bot.gluedTimer > 0 ? 0 : Math.sin(quantizedTime12 * 14 + idx * 1.7) * 0.78;
          bot.leftLeg.rotation.x = swing;
          bot.rightLeg.rotation.x = -swing;
          bot.leftArm.rotation.x = -swing * 0.65;
          bot.rightArm.rotation.x = swing * 0.45;

          // Emit faint hand-drawn dotted ink trail behind moving Stickman's white sneakers
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

          // Bot fires occasional stationery shots (Penna / Colla / Bianchetto)
          if (stateRef.current.phase === 'playing' && bot.blindedTimer <= 0) {
            bot.shootCooldown -= dt;
            if (bot.shootCooldown <= 0 && distToPlayer < 22) {
              bot.shootCooldown = 2.4 + Math.random() * 1.8;
              const botProj = projectilePool.find((p) => !p.active);
              if (botProj) {
                const botWeaponPool: WeaponId[] = ['penna', 'colla', 'bianchetto', 'elastici'];
                const chosenW = botWeaponPool[idx % botWeaponPool.length];
                const spec = WEAPONS_ARSENAL.find((w) => w.id === chosenW)!;
                botProj.active = true;
                botProj.fromPlayer = false;
                botProj.weaponId = chosenW;
                botProj.damage = 1;
                botProj.life = 3.5;
                botProj.bouncesLeft = chosenW === 'elastici' ? 2 : 0;
                botProj.position.copy(bot.position).setY(1.45);
                _toTarget.subVectors(player.pos, bot.position).setY(0.15).normalize();
                botProj.velocity.copy(_toTarget).multiplyScalar(19);
                (botProj.mesh.material as THREE.MeshStandardMaterial).color.set(
                  spec.accentColor
                );
                botProj.mesh.scale.setScalar(1.05);
                botProj.mesh.visible = true;
              }
            }
          }
        } else if (bot.state === 'sliced') {
          // Taglierino 2-piece dismemberment physics: Upper torso flies off, legs keep running!
          bot.stateTimer -= dt;
          bot.upperVel.y -= 19 * dt;
          bot.upperGroup.position.addScaledVector(bot.upperVel, dt * 0.45);
          bot.upperGroup.rotation.x += dt * 9;
          bot.upperGroup.rotation.z += dt * 6;
          if (bot.upperGroup.position.y < 0.25) {
            bot.upperGroup.position.y = 0.25;
            bot.upperVel.multiplyScalar(0.5);
          }
          // Lower legs keep pedaling comically for 1.2s
          const franticSwing = Math.sin(quantizedTime12 * 26) * 0.95;
          bot.leftLeg.rotation.x = franticSwing;
          bot.rightLeg.rotation.x = -franticSwing;

          if (bot.stateTimer <= 0) respawnBot(bot);
        } else if (bot.state === 'decapitated') {
          // Forbici decapitation: spherical head rolls and bounces like a ball!
          bot.stateTimer -= dt;
          bot.headVel.y -= 20 * dt;
          bot.headGroup.position.addScaledVector(bot.headVel, dt * 0.5);
          bot.headGroup.rotation.x += dt * 14;
          if (bot.headGroup.position.y < -0.85) {
            bot.headGroup.position.y = -0.85;
            bot.headVel.y = Math.abs(bot.headVel.y) * 0.65;
          }
          bot.upperGroup.rotation.z = THREE.MathUtils.damp(
            bot.upperGroup.rotation.z,
            Math.PI / 2.2,
            6,
            dt
          );
          if (bot.stateTimer <= 0) respawnBot(bot);
        } else if (bot.state === 'ragdoll' || bot.state === 'flushed') {
          bot.stateTimer -= dt;
          if (bot.state === 'flushed') {
            bot.group.rotation.y += dt * 22;
            bot.group.position.y -= dt * 2.5;
          } else {
            bot.position.addScaledVector(bot.upperVel, dt * 0.45);
            bot.upperVel.y -= 22 * dt;
            bot.group.rotation.x += dt * 10;
            bot.group.rotation.z += dt * 7;
          }
          if (bot.stateTimer <= 0) respawnBot(bot);
        }
      });

      // Update & Fade Hand-Drawn Dotted Ink Footstep Trail Particles
      const steppedScaleJitter = (Math.floor(elapsed * 12) % 2 === 0 ? 1.0 : 0.94);
      for (let i = 0; i < inkTrailPool.length; i++) {
        const pt = inkTrailPool[i];
        if (!pt.active) continue;
        pt.life -= dt;
        if (pt.life <= 0) {
          pt.active = false;
          pt.mesh.visible = false;
          continue;
        }
        const progress = pt.life / pt.maxLife; // 1 -> 0
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

  const handleSelectMap = (mId: 'scrivania' | 'bagno') => {
    stateRef.current.mapId = mId;
    stateRef.current.rebuildMapRequested = true;
    setActiveMap(mId);
  };

  const handleSelectWeapon = (wId: WeaponId) => {
    stateRef.current.weaponId = wId;
    setActiveWeaponId(wId);
  };

  const handleToggleMute = () => {
    foleyAudio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f4efe1] select-none">
      {/* 1. Dedicated Isolated WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Fixed First-Person Paper Grain & Torn Notebook Frame Overlay (pointer-events-none) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: 'inset 0 0 0 6px #18181b, inset 0 0 48px rgba(24, 24, 20, 0.22)',
        }}
      />

      {/* 3. Bianchetto (Correction Fluid) Whiteout Blindness Overlay when hit */}
      {playerBlindTimer > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center bg-white/90">
          <div className="text-center font-hand text-3xl font-bold text-zinc-900">
            SPLASH! BIANCHETTO IN FACCIA ({playerBlindTimer.toFixed(1)}s)
          </div>
        </div>
      )}

      {/* 4. Discreet Peripheral Comic Foley Onomatopoeia Popups (Non-Intrusive) */}
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

      {/* 5. Hand-Drawn Sketch Crosshair & Glued Button-Mash Prompt (During Active Gameplay) */}
      {gamePhase === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <svg width="54" height="54" viewBox="0 0 54 54" className="opacity-90">
            <circle
              cx="27"
              cy="27"
              r="14"
              fill="none"
              stroke="#141413"
              strokeWidth="2.4"
              strokeDasharray="18 3"
            />
            <line x1="27" y1="4" x2="27" y2="19" stroke="#141413" strokeWidth="2.4" />
            <line x1="27" y1="35" x2="27" y2="50" stroke="#141413" strokeWidth="2.4" />
            <line x1="4" y1="27" x2="19" y2="27" stroke="#141413" strokeWidth="2.4" />
            <line x1="35" y1="27" x2="50" y2="27" stroke="#141413" strokeWidth="2.4" />
            <circle cx="27" cy="27" r="2" fill="#141413" />
          </svg>

          {playerGluedCount > 0 && (
            <div className="absolute mt-28 px-4 py-2 sketch-box bg-amber-300 text-zinc-950 font-hand font-bold text-xl">
              PIEDI INCOLLATI! Premi [SPAZIO] x{playerGluedCount} per liberarti!
            </div>
          )}
        </div>
      )}

      {/* 6. Perimeter Marker-Drawn HUD (Directly faithful to Concept Art Screenshot) */}
      <div className="absolute inset-x-0 top-0 p-3 md:p-4 flex items-start justify-between pointer-events-none z-20">
        {/* Top-Left: P1 Stickman Badge & Score Bar */}
        <div className="sketch-box-sm px-3.5 py-2 flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-950 flex items-center justify-center text-white font-hand font-bold text-sm">
            P1
          </div>
          <div>
            <div className="text-xs font-mono-code text-zinc-600">
              TU (STICKMAN) · FRAG: <span className="font-bold text-zinc-950 tabular-nums">{playerScore}</span>
            </div>
            {/* Hand-drawn marker health/stamina bar */}
            <div className="w-32 md:w-40 h-3.5 bg-zinc-800 border-2 border-zinc-950 rounded-sm overflow-hidden mt-0.5">
              <div
                className="h-full bg-rose-500 transition-all duration-150"
                style={{ width: `${(playerHp / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center: Hand-Drawn Comic Timer Box ("02:14") + Map Indicator */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="sketch-box px-5 py-1.5 bg-[#fbf9f3]">
            <span className="font-hand font-bold text-3xl md:text-4xl tracking-wider text-zinc-950 tabular-nums">
              {formattedTimer}
            </span>
          </div>
          <div className="text-xs font-hand font-bold text-zinc-800 bg-[#fbf9f3]/90 px-2.5 py-0.5 border border-zinc-900 rounded">
            {activeMap === 'scrivania' ? 'Mappa: La Scrivania' : 'Mappa: Il Bagno (Premi E per Sciacquone!)'}
          </div>
        </div>

        {/* Top-Right: P2 / Bot Squad Status & GDD Shortcut */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={() => setGddOpen(true)}
            className="sketch-box-sm px-3.5 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-hand font-bold text-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            Apri GDD & Shader Lab
          </button>

          <div className="sketch-box-sm px-3.5 py-2 hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-mono-code text-zinc-600">
                BOT SQUAD · FRAG: <span className="font-bold text-zinc-950 tabular-nums">{botScore}</span>
              </div>
              <div className="w-28 h-3.5 bg-zinc-800 border-2 border-zinc-950 rounded-sm overflow-hidden mt-0.5">
                <div className="h-full bg-amber-400 w-3/4" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-950 flex items-center justify-center text-amber-300 font-hand font-bold text-sm">
              BOT
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom-Left & Bottom-Right Marker Hearts & Active Weapon Comic Box */}
      {gamePhase === 'playing' && (
        <>
          {/* Bottom-Left: 3 Red Marker Hearts (crossed out with a black X when damaged!) */}
          <div className="absolute bottom-20 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
            <div className="sketch-box-sm px-3.5 py-2 bg-[#bbf7d0] flex items-center gap-2.5">
              {[0, 1, 2].map((heartIdx) => {
                const heartHp = Math.max(0, Math.min(2, playerHp - heartIdx * 2));
                const isDeadHeart = heartHp === 0;
                return (
                  <div key={heartIdx} className="relative w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 32 32" className="w-8 h-8">
                      <path
                        d="M16 28 C16 28 4 20 4 11 C4 6.5 7.5 4 11 4 C13.5 4 15 5.5 16 7.5 C17 5.5 18.5 4 21 4 C24.5 4 28 6.5 28 11 C28 20 16 28 16 28 Z"
                        fill={heartHp === 2 ? '#ef4444' : heartHp === 1 ? '#fca5a5' : '#e5e7eb'}
                        stroke="#141413"
                        strokeWidth="2.5"
                      />
                    </svg>
                    {/* Black Marker X over depleted hearts (Requirement §6) */}
                    {isDeadHeart && (
                      <svg viewBox="0 0 32 32" className="absolute inset-0 w-8 h-8">
                        <line x1="5" y1="5" x2="27" y2="27" stroke="#141413" strokeWidth="4" strokeLinecap="round" />
                        <line x1="27" y1="5" x2="5" y2="27" stroke="#141413" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                );
              })}
              <span className="font-hand font-bold text-sm text-zinc-900 ml-1 tabular-nums">
                {playerHp}/6 HP
              </span>
            </div>

            <div className="text-xs font-hand font-bold text-zinc-800 bg-[#fbf9f3]/90 px-2.5 py-1 border border-zinc-900 rounded max-w-xs truncate">
              {killFeedMsg}
            </div>
          </div>

          {/* Bottom-Right: Comic Ammo Readout & Active Stationery Weapon */}
          <div className="absolute bottom-20 right-4 z-20 pointer-events-none flex flex-col items-end gap-1.5">
            <div className="sketch-box-sm px-4 py-2 bg-[#fed7aa] flex items-center gap-3">
              <div>
                <div className="text-xs font-mono-code text-zinc-700">
                  ARMA [{currentWeaponSpec.keyNum}] · {currentWeaponSpec.foleyOnomatopoeia}
                </div>
                <div className="font-hand font-bold text-lg text-zinc-950">
                  {currentWeaponSpec.name}
                </div>
              </div>
              <div className="pl-3 border-l-2 border-zinc-900 text-right">
                <div className="text-xs font-mono-code text-zinc-700">COLPI</div>
                <div className="font-hand font-bold text-2xl text-zinc-950 tabular-nums">
                  {ammoCounts[activeWeaponId] === -1 ? '∞' : ammoCounts[activeWeaponId]}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 8. Unified Collapsible Bottom Control Dock (Three.js Skill §5: Zero Viewport Occlusion) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-3 z-30 w-full max-w-[min(940px,95vw)] transition-transform duration-200 pointer-events-auto ${
          dockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="px-3.5 py-1 text-xs font-hand font-bold bg-zinc-900 text-amber-200 rounded-t-md border-t-2 border-x-2 border-zinc-950 cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? '▴ Mostra Arsenale & Controlli (H)' : '▾ Nascondi Arsenale (Zen Mode · H)'}
          </button>
        </div>

        <div className="sketch-box-sm px-3 py-2 bg-[#fbf9f3] flex flex-wrap items-center justify-between gap-2">
          {/* 9 Stationery Weapon Slots */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {WEAPONS_ARSENAL.map((w) => {
              const active = w.id === activeWeaponId;
              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWeapon(w.id)}
                  className={`px-2.5 py-1 text-xs font-hand font-bold rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-zinc-900 text-amber-300 border-zinc-950'
                      : 'bg-[#f3eedf] text-zinc-800 border-zinc-400 hover:bg-amber-100'
                  }`}
                >
                  [{w.keyNum}] {w.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Map Switcher, Flush Trigger & Audio Mute */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() =>
                handleSelectMap(activeMap === 'scrivania' ? 'bagno' : 'scrivania')
              }
              className="px-2.5 py-1 text-xs font-hand font-bold bg-cyan-200 hover:bg-cyan-300 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              Mappa: {activeMap === 'scrivania' ? 'Scrivania ➔ Bagno' : 'Bagno ➔ Scrivania'}
            </button>

            {activeMap === 'bagno' && (
              <button
                onClick={() => {
                  stateRef.current.flushVortexTimer = 5.0;
                  setFlushComboActive(true);
                  foleyAudio.playToiletFlush();
                  triggerComicPop('SCARICO TOTALE!', '#06b6d4');
                }}
                disabled={flushComboActive}
                className="px-2.5 py-1 text-xs font-hand font-bold bg-amber-300 hover:bg-amber-400 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
              >
                Sciacquone WC [E]
              </button>
            )}

            <button
              onClick={handleToggleMute}
              className="px-2.5 py-1 text-xs font-hand font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
            >
              {isMuted ? 'Audio: OFF' : 'Audio: ON'}
            </button>
          </div>
        </div>
      </div>

      {/* 9. Title Screen / Pause / Victory Overlay Modal */}
      {gamePhase !== 'playing' && !gddOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 pointer-events-auto">
          <div className="sketch-box bg-graph-paper max-w-2xl w-full p-6 md:p-8 text-center space-y-6">
            {/* Bespoke Inline SVG Hand-Drawn Title Lockup */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 540 110" className="w-full max-w-md h-auto">
                <rect
                  x="8"
                  y="10"
                  width="524"
                  height="90"
                  rx="12"
                  fill="#fde047"
                  stroke="#141413"
                  strokeWidth="4.5"
                />
                <text
                  x="270"
                  y="68"
                  textAnchor="middle"
                  fontFamily="Patrick Hand, cursive"
                  fontSize="58"
                  fontWeight="bold"
                  fill="#141413"
                >
                  CALL OF DOODLE
                </text>
              </svg>
              <p className="text-sm md:text-base font-hand font-bold text-zinc-800 mt-2">
                FPS 3D Microscopico su Carta a Quadretti · Stickman Ragdoll 12 FPS · Arsenale di Cancelleria
              </p>
            </div>

            {gamePhase === 'victory' && (
              <div className="p-4 sketch-box-sm bg-emerald-200 text-zinc-950 font-hand font-bold text-xl">
                FINE PARTITA! Punteggio Stickman: {playerScore} — Bot Squad: {botScore}
              </div>
            )}

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
              <div className="p-3 bg-[#fbf9f3] border-2 border-zinc-900 rounded">
                <div className="font-bold font-hand text-sm text-zinc-950">9 Armi & Foley Reali</div>
                <div className="text-zinc-700 mt-0.5">
                  Taglierino (mozza a metà), Colla (blocca 3s), Cucchiaio (CLANG!), Bianchetto (acceca), Forbici (decapita), Gomma (cancella colpi).
                </div>
              </div>
              <div className="p-3 bg-[#fbf9f3] border-2 border-zinc-900 rounded">
                <div className="font-bold font-hand text-sm text-zinc-950">Scrivania & Bagno 3D</div>
                <div className="text-zinc-700 mt-0.5">
                  Scala libri e Post-it, scivola sul caffè o naviga sulle paperelle di gomma e tira lo Sciacquone del WC!
                </div>
              </div>
              <div className="p-3 bg-[#fbf9f3] border-2 border-zinc-900 rounded">
                <div className="font-bold font-hand text-sm text-zinc-950">GDD & Shader Legacy</div>
                <div className="text-zinc-700 mt-0.5">
                  Include l&apos;intero Game Design Document, gli shader GLSL Boiling Line / Cross-Hatching e la Roadmap in 5 fasi.
                </div>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setGamePhase('playing')}
                className="px-7 py-3 text-xl font-bold font-hand bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-2 border-zinc-950 rounded-xl shadow-[4px_4px_0px_#eab308] cursor-pointer whitespace-nowrap shrink-0"
              >
                {gamePhase === 'paused' ? 'Riprendi Partita (SPAZIO)' : 'Entra sul Foglio 3D (INVIO / SPAZIO)'}
              </button>

              <button
                onClick={() => setGddOpen(true)}
                className="px-6 py-3 text-lg font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border-2 border-zinc-950 rounded-xl shadow-[4px_4px_0px_#141413] cursor-pointer whitespace-nowrap shrink-0"
              >
                Leggi GDD Completo & Shader
              </button>
            </div>

            {/* Single Flat Control-Hint Line */}
            <div className="text-xs font-mono-code text-zinc-700 pt-1">
              WASD Muovi · Mouse / Frecce Mira · Click / F Spara · 1-9 Armi · Spazio Salta/Scolla · E Sciacquone WC · Esc Pausa
            </div>
          </div>
        </div>
      )}

      {/* 10. Full Interactive Game Design Document (GDD) & Technical Architecture Modal */}
      <GddTechnicalModal
        isOpen={gddOpen}
        onClose={() => setGddOpen(false)}
        onSelectWeaponToTest={handleSelectWeapon}
        onSelectMapToPlay={handleSelectMap}
      />
    </div>
  );
}
