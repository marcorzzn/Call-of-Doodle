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
  onSelectRoomToTeleport: (room: 'scrivania' | 'bagno' | 'cucina' | 'soggiorno') => void;
}

type GddTab = 'gdd' | 'arsenal' | 'maps' | 'bosses' | 'technical' | 'roadmap';

export const GddTechnicalModal: React.FC<GddTechnicalModalProps> = ({
  isOpen,
  onClose,
  onSelectWeaponToTest,
  onSelectRoomToTeleport,
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
              DOCUMENTO DI DESIGN & ARCHITETTURA WEBGL · CASA COMPLETA (4 STANZE) + 17 ARMI + BOSS CO-OP
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-hand tracking-wide text-zinc-950">
              CALL OF DOODLE — Game Design Document & Specifiche Tecniche
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border-2 border-zinc-900 rounded-lg shadow-[2px_2px_0px_#141413] cursor-pointer whitespace-nowrap shrink-0"
            >
              Torna alla Casa 3D (ESC)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-[#ebe5d3] border-b-2 border-zinc-900 overflow-x-auto">
          {[
            { id: 'gdd', label: '1. Core GDD & Controlli' },
            { id: 'arsenal', label: '2. Arsenale Domestico (17 Armi)' },
            { id: 'maps', label: '3. La Casa Completa & Fisica Caotica' },
            { id: 'bosses', label: '4. Boss Co-op: Padrone & Gatto' },
            { id: 'technical', label: '5. Shader GLSL & Legacy' },
            { id: 'roadmap', label: '6. Roadmap (5 Fasi)' },
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 sketch-box-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-mono-code text-zinc-500">
                      SEZIONE 1.1 · LOCOMOZIONE COMPLETA & DOPPIA MODALITÀ ARSENALE
                    </div>
                    <h3 className="text-2xl font-bold font-hand text-zinc-950">
                      Casa Interconnessa, Fisica Caotica e Stile Scarabocchio Fedele
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-800">
                      Gli Stickman hanno teste sferiche nere sfumate a carboncino (senza bulbi oculari sporgenti, fedeli allo screenshot), scarpe bianche con lacci disegnati a penna ed elmo opzionale <strong>Tappo di Sughero</strong> raccoglibile in Cucina.
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-800">
                      <li>
                        · <strong>Scatto [SHIFT]:</strong> Aumenta la velocità del +55% consumando la barra Stamina verde in basso a sinistra.
                      </li>
                      <li>
                        · <strong>Salto [SPAZIO]:</strong> Salta o rimbalza su Divano, Tostapane, Paperelle di Gomma, Metro a Nastro e Trappola per Topi.
                      </li>
                      <li>
                        · <strong>Accovacciamento [C]:</strong> Abbassa lo stickman per ripararsi dietro i Post-it o passare sotto gli ostacoli.
                      </li>
                      <li>
                        · <strong>Ricarica [R] & Mira Ottica [Tasto Destro / Z]:</strong> Ricarica l&apos;arma o guarda attraverso il corpo trasparente della Penna Blu Bic!
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-zinc-300 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-zinc-500">Modalità Arsenale 1</div>
                      <div className="font-semibold text-zinc-900">Tutte le 17 Armi Subito (Sandbox)</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Modalità Arsenale 2</div>
                      <div className="font-semibold text-zinc-900">Scavenger (Trova le armi nella Casa)</div>
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
                    HUD e stile grafico identici allo screenshot: barre P1/P2 tratteggiate a matita, icona temperino sotto P2, timer 02:14, cuori in basso e barre verdi/rosa con pedina stickman.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arsenal' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono-code text-zinc-500">
                  SEZIONE 2 · LE 17 ARMI DI CANCELLERIA E OGGETTI DI CASA
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Ogni Arma ha Modello 3D, Animazione, Foley e Meccanica Dedicata
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {WEAPONS_ARSENAL.map((w) => (
                  <div
                    key={w.id}
                    className="sketch-box-sm p-4 flex flex-col justify-between space-y-3 bg-[#fbf9f3]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-code">
                        <span>TASTO [{w.keyLabel}] · {w.category}</span>
                        <span>DANNO: {w.damage}/6 HP</span>
                      </div>
                      <h4 className="text-lg font-bold font-hand text-zinc-950">
                        {w.name}
                      </h4>
                      <div className="text-xs font-mono-code text-zinc-800 bg-amber-100/80 px-2 py-1 rounded border border-zinc-400">
                        {w.foleyOnomatopoeia} · Caricatore: {w.magSize === -1 ? '∞' : w.magSize}
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {w.mechanicDetail}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => foleyAudio.playWeaponFire(w.id)}
                        className="px-3 py-1.5 text-xs font-bold font-hand bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Foley ({w.foleyOnomatopoeia})
                      </button>
                      <button
                        onClick={() => {
                          onSelectWeaponToTest(w.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold font-hand bg-amber-300 hover:bg-amber-400 text-zinc-950 border border-zinc-900 rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Impugna in 3D
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
                  SEZIONE 3 · LA CASA INTERCONNESSA (4 STANZE CONTIGUE) & TRAPPOLE FISICHE
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Teletrasportati o Cammina Liberamente tra Studio, Bagno, Cucina e Soggiorno
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MAPS_BLUEPRINTS.map((m) => (
                  <div key={m.id} className="sketch-box-sm p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono-code text-zinc-500">
                        <span>SCALA: {m.scaleRatio}</span>
                        <span>STANZA ATTIVA NELLA CASA 3D</span>
                      </div>
                      <h4 className="text-xl font-bold font-hand text-zinc-950">{m.name}</h4>
                      <p className="text-xs text-zinc-700">{m.subtitle}</p>

                      <div className="space-y-2 pt-1">
                        {m.landmarks.map((lm, i) => (
                          <div key={i} className="p-2.5 bg-[#f4efe1] rounded border border-zinc-300 text-xs">
                            <div className="font-bold text-zinc-900">
                              {lm.name} <span className="font-normal text-zinc-500">· {lm.role}</span>
                            </div>
                            <div className="text-zinc-700 mt-0.5">{lm.interaction}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectRoomToTeleport(m.id);
                        onClose();
                      }}
                      className="w-full py-2 text-sm font-bold font-hand bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-2 border-zinc-900 rounded-lg cursor-pointer"
                    >
                      Teletrasporta Stickman in: {m.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bosses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="sketch-box-sm p-6 space-y-3">
                <div className="text-xs font-mono-code text-zinc-500">
                  MODALITÀ BOSS CO-OP 1 · &ldquo;DOMESTIC CHAOS: IL PADRONE DI CASA&rdquo;
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Il Tiranno della Pulizia (Barra della Pazienza)
                </h3>
                <p className="text-xs leading-relaxed text-zinc-700">
                  Un umano gigante stilizzato col grembiule giallo entra nella casa armato di <strong>Scopa</strong> e <strong>Piumino</strong>. Il vostro obiettivo non è ucciderlo, ma svuotare la sua <strong>Barra della Pazienza</strong> creando il massimo disordine:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-800">
                  <li>· <strong>Pennarello Indelebile:</strong> Scarabocchia i muri e i mobili appena puliti (-12% Pazienza).</li>
                  <li>· <strong>Spillatrice a Terra:</strong> Se il Padrone calpesta le spille salta urlando <em>&ldquo;YOWCH!&rdquo;</em> (-15% Pazienza).</li>
                  <li>· <strong>Taglierino sui Cuscini:</strong> Squarcia le fodere liberando piume nel vento del Ventilatore.</li>
                  <li>· <strong>Attacchi del Padrone:</strong> Spazzata frontale con la Scopa, nuvola grigia col Piumino e Calpestamento nelle fasi di Rabbia!</li>
                </ul>
              </div>

              <div className="sketch-box-sm p-6 space-y-3">
                <div className="text-xs font-mono-code text-zinc-500">
                  MODALITÀ BOSS CO-OP 2 · &ldquo;CAT-ASTROPHE: IL GATTO DISASTRO&rdquo;
                </div>
                <h3 className="text-2xl font-bold font-hand text-zinc-950">
                  Orchestrare il Caos col Puntatore Laser & Gomitolo
                </h3>
                <p className="text-xs leading-relaxed text-zinc-700">
                  Il Gatto Gigante non se ne va per rabbia, ma quando la <strong>Barra del Caos (Gomitolo)</strong> raggiunge il 100%. Se vede gli stickman li insegue come prede, ma potete guidare la sua furia distruttiva:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-800">
                  <li>· <strong>Puntatore Laser (Tasto L):</strong> Proietta il puntino rosso sui libri, sui vasi o sul tostapane. Il Gatto spicca un balzo e sferra la <strong>Zampata (Swat)</strong> distruggendo tutto (+20% Caos)!</li>
                  <li>· <strong>Coda a Frusta & Fusa (Purr):</strong> Mentre corre abbatte i portapenne; quando fa le fusa fa vibrare l&apos;intera stanza.</li>
                  <li>· <strong>Vittoria:</strong> Al 100% di Caos il Gatto sbadiglia, si acciambella tra le macerie e si addormenta!</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              {SOLO_DEV_ROADMAP.map((phase, idx) => (
                <div key={idx} className="sketch-box-sm p-5 bg-[#fbf9f3] space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-mono-code font-bold bg-zinc-900 text-amber-300 rounded">
                      {phase.phase} · {phase.duration}
                    </span>
                    <h4 className="text-xl font-bold font-hand text-zinc-950">{phase.title}</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-800">
                    {phase.deliverables.map((d, i) => (
                      <li key={i}>· {d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
