import React, { useState } from 'react';
import {
  MAPS_BLUEPRINTS,
  SOLO_DEV_ROADMAP,
  TECHNICAL_SHADERS_CODE,
  WEAPONS_ARSENAL,
  WeaponId,
} from '../data/gddData';
import { foleyAudio } from '../game/soundEngine';

interface GddTechnicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWeaponToTest: (weaponId: WeaponId) => void;
  onSelectMapToPlay: (mapId: 'scrivania' | 'bagno') => void;
}

type GddTab = 'gdd' | 'arsenal' | 'maps' | 'technical' | 'roadmap';

export const GddTechnicalModal: React.FC<GddTechnicalModalProps> = ({
  isOpen,
  onClose,
  onSelectWeaponToTest,
  onSelectMapToPlay,
}) => {
  const [activeTab, setActiveTab] = useState<GddTab>('gdd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 md:p-6 pointer-events-auto">
      <div className="sketch-box bg-graph-paper w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden text-zinc-900">
        {/* Top Notebook Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b-2 border-zinc-900 bg-[#f3eedf]">
          <div>
            <div className="text-xs font-mono-code text-zinc-600">
              DOCUMENTO DI DESIGN & ARCHITETTURA WEBGL · TARGET: eMACHINES EM355 (1GB RAM)
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-hand tracking-wide text-zinc-950">
              CALL OF DOODLE — Game Design Document & Specifiche Tecniche
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border-2 border-zinc-900 rounded-lg shadow-[2px_2px_0px_#141413] transition-transform active:translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              Torna al Gioco 3D (ESC)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-[#ebe5d3] border-b-2 border-zinc-900 overflow-x-auto">
          {[
            { id: 'gdd', label: '1. Core GDD & Loop di Gioco' },
            { id: 'arsenal', label: '2. Arsenale Cancelleria & Foley (9 Armi)' },
            { id: 'maps', label: '3. Level Design Microscopico (4 Stanze)' },
            { id: 'technical', label: '4. Direzione Tecnica & Shader GLSL' },
            { id: 'roadmap', label: '5. Roadmap Sviluppo (5 Fasi)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GddTab)}
              className={`px-3.5 py-1.5 text-sm font-bold font-hand rounded-md border-2 border-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-amber-200 shadow-[2px_2px_0px_#eab308]'
                  : 'bg-[#fbf9f3] text-zinc-800 hover:bg-amber-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {activeTab === 'gdd' && (
            <div className="space-y-8">
              {/* Hero Concept + Reference Screenshot */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 sketch-box-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-mono-code text-zinc-500">
                      SEZIONE 1.1 · HIGH CONCEPT & VISIONE ARTISTICA
                    </div>
                    <h3 className="text-2xl font-bold font-hand text-zinc-950">
                      Cos&apos;è &ldquo;Call of Doodle&rdquo;?
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-800">
                      <strong>Call of Doodle</strong> è un Arena FPS 3D multigiocatore (Online WebRTC/WebSocket, LAN scolastica/ufficio e Singleplayer con Bot tattici) ambientato interamente su fogli di carta a quadretti e stanze domestiche viste in <strong>scala microscopica (1 Stickman = 4,5 cm)</strong>.
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-800">
                      I giocatori controllano <strong>Stickman neri disegnati a pennarello</strong> (testa sferica, arti tubolari, occhi bianchi vuoti ed esclusivamente <strong>scarpe da ginnastica bianche con lacci disegnati a penna</strong>) che si affrontano usando oggetti di cancelleria con fisica ragdoll comica e suoni foley sintetizzati in tempo reale.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-300 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-zinc-500">Target Hardware Minimo</div>
                      <div className="font-semibold text-zinc-900 font-mono-code">eMachines EM355 · 1GB RAM</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Framerate Animazioni</div>
                      <div className="font-semibold text-zinc-900 font-mono-code">12 / 24 FPS Stepped (Flipbook)</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Motore 3D & Audio</div>
                      <div className="font-semibold text-zinc-900 font-mono-code">Three.js WebGL 1.0 + WebAudio</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 sketch-box-sm p-4 flex flex-col justify-between bg-[#f4efe1]">
                  <img
                    src="/assets/aistudio/image_64d66251.png"
                    alt="Concept Art Ufficiale Call of Doodle"
                    referrerPolicy="no-referrer"
                    className="w-full h-56 object-cover rounded border-2 border-zinc-900"
                  />
                  <div className="pt-2 text-xs text-zinc-700 font-hand">
                    Riferimento Visivo Master: contorni neri irregolari &ldquo;boiling line&rdquo;, ombre a tratteggio (cross-hatching), HUD a pennarello con cuoricini rossi e armi di cancelleria.
                  </div>
                </div>
              </div>

              {/* Core Game Loop in 3 Phases */}
              <div className="sketch-box-sm p-6 space-y-4">
                <div className="text-xs font-mono-code text-zinc-500">
                  SEZIONE 1.2 · CORE GAMEPLAY LOOP (CICLO DI GIOCO A 3 FASI)
                </div>
                <h3 className="text-xl font-bold font-hand text-zinc-950">
                  La Formula Tattica: &ldquo;Blocca, Acceca, Smembra e Scarica!&rdquo;
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-4 bg-[#f5f0e2] border border-zinc-300 rounded-lg space-y-2">
                    <div className="font-bold font-hand text-lg text-zinc-950">
                      Fase 1: Scavenge & Posizionamento
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-700">
                      Lo stickman esplora la stanza microscopica sfruttando libri impilati, spugne trampolino e paperelle di gomma. Raccoglie <strong>foglietti di carta</strong> a terra per alimentare la Cerbottana e conquista l&apos;high-ground (portapenne o bordo vasca).
                    </p>
                  </div>
                  <div className="p-4 bg-[#f5f0e2] border border-zinc-300 rounded-lg space-y-2">
                    <div className="font-bold font-hand text-lg text-zinc-950">
                      Fase 2: Crowd-Control & Cancellazione
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-700">
                      Invece di un TTK istantaneo frustrante, il combattimento premia le combo di stato: incollare le scarpe del nemico col <strong>Tubetto di Colla (3s)</strong>, accecarlo col <strong>Bianchetto (2s)</strong> o usare la <strong>Gomma da Cancellare</strong> per eliminare i suoi proiettili a mezz&apos;aria.
                    </p>
                  </div>
                  <div className="p-4 bg-[#f5f0e2] border border-zinc-300 rounded-lg space-y-2">
                    <div className="font-bold font-hand text-lg text-zinc-950">
                      Fase 3: Finisher Ragdoll & Hazard Ambientale
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-700">
                      Avversario immobilizzato o accecato? Il giocatore chiude il duello mozzandolo a metà col <strong>Taglierino</strong>, decapitandolo con le <strong>Forbici</strong>, scaraventandolo col <strong>Cucchiaio (CLANG!)</strong> o tirando lo <strong>Sciacquone del WC</strong> per una Mega-Combo!
                    </p>
                  </div>
                </div>
              </div>

              {/* Stickman & HUD Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="sketch-box-sm p-6 space-y-3">
                  <div className="text-xs font-mono-code text-zinc-500">
                    SEZIONE 1.3 · ANATOMIA STICKMAN & FISICA RAGDOLL
                  </div>
                  <h4 className="text-lg font-bold font-hand text-zinc-950">
                    Stickman a 12 FPS & Scarpe da Ginnastica Bianche
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed">
                    <li>
                      · <strong>Silhouette & Contrasto:</strong> Corpo tubolare nero carbone (#1C1C1A) per massima leggibilità sul foglio chiaro, con occhi bianchi vuoti espressivi.
                    </li>
                    <li>
                      · <strong>Scarpe Bianche Iconiche:</strong> Unico elemento di vestiario; fungono da indicatore visivo per lo stato <em>Incollato</em> (colla gialla sulle suole) o <em>Macchiato di Caffè</em> (lascia impronte marroni).
                    </li>
                    <li>
                      · <strong>Animazione Stepped (12/24 FPS):</strong> Il clock di interpolazione delle pose è discretizzato a <code>floor(t * 12) / 12</code> per replicare i flipbook disegnati a margine del quaderno.
                    </li>
                    <li>
                      · <strong>Smembramento Senza Gore (Inchiostro):</strong> Nessun sangue rosso; i tagli di Taglierino e Forbici rilasciano schizzi di inchiostro di china nero e stelline di carta colorata.
                    </li>
                  </ul>
                </div>

                <div className="sketch-box-sm p-6 space-y-3">
                  <div className="text-xs font-mono-code text-zinc-500">
                    SEZIONE 1.4 · INTERFACCIA UTENTE DIEGETICA (HUD)
                  </div>
                  <h4 className="text-lg font-bold font-hand text-zinc-950">
                    Pennarelli su Carta & Zero Occlusione
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed">
                    <li>
                      · <strong>Sistema Salute a 3 Cuoricini (6 Punti Vita):</strong> Ogni cuore rosso disegnato a pennarello supporta mezzo danno; quando si svuota viene brutalmente sbarrato da una <strong>X nera a pennarello</strong>.
                    </li>
                    <li>
                      · <strong>Riquadri Fumetto Irregolari:</strong> Timer centrale (es. <code>02:14</code>) e contatore munizioni racchiusi in ritagli di carta con bordo nero disegnato a mano.
                    </li>
                    <li>
                      · <strong>Effetti di Stato Sull&apos;HUD:</strong> Colpiti dal Bianchetto, una pennellata bianca copre il centro dello schermo per 2s; colpiti dalla Colla, appare l&apos;indicatore di button-mashing <code>[PREMI SPAZIO!]</code>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arsenal' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-code text-zinc-500">
                    SEZIONE 2 · BILANCIAMENTO ARSENALE, FISICA & FOLEY SONORO
                  </div>
                  <h3 className="text-2xl font-bold font-hand text-zinc-950">
                    Le 9 Armi di Cancelleria & Uso Domestico (Clicca per Provare Audio e Equipaggiare)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {WEAPONS_ARSENAL.map((w) => (
                  <div
                    key={w.id}
                    className="sketch-box-sm p-4 flex flex-col justify-between space-y-3 bg-[#fbf9f3]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-code">
                        <span>TASTO [{w.keyNum}] · {w.category}</span>
                        <span>DANNO: {w.damage}/6 HP</span>
                      </div>
                      <h4 className="text-xl font-bold font-hand text-zinc-950">
                        {w.name}
                      </h4>
                      <div className="text-xs font-mono-code text-zinc-800 bg-amber-100/80 px-2 py-1 rounded border border-zinc-400">
                        Foley: &ldquo;{w.foleyOnomatopoeia}&rdquo; — {w.foleyDescription}
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {w.mechanicDetail}
                      </p>
                      <div className="text-xs text-zinc-900 font-medium pt-1 border-t border-zinc-200">
                        <strong>Reazione Ragdoll:</strong> {w.ragdollEffect}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => foleyAudio.playWeaponFire(w.id)}
                        className="px-3 py-1.5 text-xs font-bold font-hand bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Ascolta Foley ({w.foleyOnomatopoeia})
                      </button>
                      <button
                        onClick={() => {
                          onSelectWeaponToTest(w.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Equipaggia in 3D
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono-code text-zinc-500">
                  SEZIONE 3 · LEVEL DESIGN MICROSCOPICO & HAZARD AMBIENTALI
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Le 4 Stanze di Casa in Scala Microscopica
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MAPS_BLUEPRINTS.map((m) => (
                  <div key={m.id} className="sketch-box-sm p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono-code text-zinc-500">
                        <span>SCALA: {m.scaleRatio}</span>
                        <span>{m.playableInDemo ? 'GIOCABILE ORA IN 3D' : 'SPECIFICA GDD'}</span>
                      </div>
                      <h4 className="text-xl font-bold font-hand text-zinc-950">{m.name}</h4>
                      <p className="text-xs text-zinc-700">{m.subtitle}</p>

                      <div className="space-y-2 pt-2">
                        {m.landmarks.map((lm, i) => (
                          <div key={i} className="p-2.5 bg-[#f4efe1] rounded border border-zinc-300 text-xs">
                            <div className="font-bold text-zinc-900">
                              {lm.name} <span className="font-normal text-zinc-500">· {lm.role}</span>
                            </div>
                            <div className="text-zinc-700 mt-0.5">{lm.interaction}</div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-amber-100/90 border-2 border-zinc-900 rounded-lg text-xs space-y-1">
                        <div className="font-bold font-hand text-sm text-zinc-950">
                          EVENTO DINAMICO: {m.hazardEvent.name}
                        </div>
                        <div className="text-zinc-800">
                          <strong>Attivazione:</strong> {m.hazardEvent.trigger}
                        </div>
                        <div className="text-zinc-800">
                          <strong>Effetto Gameplay:</strong> {m.hazardEvent.effect}
                        </div>
                      </div>
                    </div>

                    {m.playableInDemo && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            onSelectMapToPlay(m.id as 'scrivania' | 'bagno');
                            onClose();
                          }}
                          className="w-full py-2 text-sm font-bold font-hand bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-2 border-zinc-900 rounded-lg cursor-pointer"
                        >
                          Carica Mappa 3D &ldquo;{m.name}&rdquo; e Gioca Ora
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="sketch-box-sm p-6 space-y-4">
                <div className="text-xs font-mono-code text-zinc-500">
                  SEZIONE 4.1 · BUDGET PRESTAZIONALE PER HARDWARE DATATO (eMACHINES EM355)
                </div>
                <h3 className="text-xl font-bold font-hand text-zinc-950">
                  Architettura &ldquo;Zero-Texture-Bloat&rdquo; per Netbook 1GB RAM & GPU Integrata GMA 3150
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-[#f4efe1] border border-zinc-300 rounded">
                    <div className="font-mono-code font-bold text-base text-zinc-950">&lt; 14.500 Tris</div>
                    <div className="text-zinc-600 mt-1">
                      Geometria Low-Poly rigorosa: ogni Stickman pesa solo 480 triangoli; libri e post-it usano box smussati uniti in static batch.
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#f4efe1] border border-zinc-300 rounded">
                    <div className="font-mono-code font-bold text-base text-zinc-950">0 ShadowMaps</div>
                    <div className="text-zinc-600 mt-1">
                      Le shadow map dinamiche uccidono le GPU integrate. Usiamo <strong>Blob Shadows a tratteggio</strong> (PlaneGeometry coplanari) + Cross-Hatching analitico.
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#f4efe1] border border-zinc-300 rounded">
                    <div className="font-mono-code font-bold text-base text-zinc-950">0 Post-Processing</div>
                    <div className="text-zinc-600 mt-1">
                      Nessun EffectComposer o Sobel Depth pass: l&apos;outline tremolante è ottenuto via <strong>Inverted Hull</strong> nel Vertex Shader a 12Hz, e la grana carta è un overlay CSS/SVG fisso a costo zero.
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#f4efe1] border border-zinc-300 rounded">
                    <div className="font-mono-code font-bold text-base text-zinc-950">Zero-GC Pooling</div>
                    <div className="text-zinc-600 mt-1">
                      Vettori matematici, proiettili, macchie d&apos;inchiostro e arti smembrati sono pre-allocati all&apos;avvio per azzerare gli stutter del Garbage Collector su 1GB di RAM.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="sketch-box-sm p-5 space-y-2 bg-zinc-950 text-zinc-100">
                  <div className="text-xs font-mono-code text-amber-300">
                    SHADER 1 · CONTORNO TREMOLANTE &ldquo;BOILING LINE&rdquo; (GLSL)
                  </div>
                  <pre className="text-xs font-mono-code overflow-x-auto leading-relaxed text-zinc-200">
                    {TECHNICAL_SHADERS_CODE.boilingOutlineVertex}
                  </pre>
                </div>

                <div className="sketch-box-sm p-5 space-y-2 bg-zinc-950 text-zinc-100">
                  <div className="text-xs font-mono-code text-amber-300">
                    SHADER 2 · OMBRE A TRATTEGGIO INCROCIATO &ldquo;CROSS-HATCHING&rdquo; (GLSL)
                  </div>
                  <pre className="text-xs font-mono-code overflow-x-auto leading-relaxed text-zinc-200">
                    {TECHNICAL_SHADERS_CODE.crossHatchFragment}
                  </pre>
                </div>
              </div>

              <div className="sketch-box-sm p-5 space-y-2 bg-zinc-950 text-zinc-100">
                <div className="text-xs font-mono-code text-amber-300">
                  CODICE 3 · QUANTIZZAZIONE ANIMAZIONI STICKMAN A 12 FPS (TYPESCRIPT)
                </div>
                <pre className="text-xs font-mono-code overflow-x-auto leading-relaxed text-zinc-200">
                  {TECHNICAL_SHADERS_CODE.steppedAnimationCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono-code text-zinc-500">
                  SEZIONE 5 · PIANO DI PRODUZIONE PER SVILUPPATORE SINGOLO (20 SETTIMANE)
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Roadmap Incrementale in 5 Fasi con Milestone di Ottimizzazione
                </h3>
              </div>

              <div className="space-y-4">
                {SOLO_DEV_ROADMAP.map((phase, idx) => (
                  <div key={idx} className="sketch-box-sm p-5 bg-[#fbf9f3] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-mono-code font-bold bg-zinc-900 text-amber-300 rounded">
                          {phase.phase} · {phase.duration}
                        </span>
                        <h4 className="text-xl font-bold font-hand text-zinc-950">
                          {phase.title}
                        </h4>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-zinc-800">
                      {phase.deliverables.map((d, i) => (
                        <li key={i}>· {d}</li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-zinc-300 text-xs font-mono-code text-zinc-700">
                      <strong>Target Performance & QA:</strong> {phase.optimizationMilestone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
