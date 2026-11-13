import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const MobileInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="sketch-box bg-graph-paper max-w-lg w-full p-5 text-left space-y-4 border-3 border-zinc-950 shadow-[6px_6px_0px_#141413]">
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <h3 className="font-hand font-bold text-xl text-zinc-950">
              Android APK (GitHub Releases) & App Mobile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-rose-200 hover:bg-rose-300 font-bold text-sm flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs font-hand font-bold text-zinc-800 leading-relaxed">
          <strong>Call of Doodle</strong> include il progetto nativo <strong>Capacitor Android</strong> e
          una pipeline automatica <strong>GitHub Actions</strong>: ogni volta che invii una modifica
          su GitHub, viene compilato un nuovo file <strong>.apk firmato</strong> e pubblicato nella
          sezione <strong>Releases</strong> del repository!
        </p>

        {/* GitHub APK Build & Release Section */}
        <div className="p-3 bg-emerald-50 border-2 border-zinc-900 rounded-lg text-xs font-hand text-zinc-900 space-y-1.5">
          <div className="font-mono-code font-bold text-emerald-900">
            🤖 SCARICA APK NATIVO DA GITHUB RELEASES:
          </div>
          <p>
            1. Carica il progetto sul tuo repository GitHub (ramo <code>main</code> o <code>master</code>).
          </p>
          <p>
            2. Ad ogni push, il workflow <code>.github/workflows/android-release.yml</code> compila
            automaticamente l&apos;app Android (<code>Call-of-Doodle-v1.0.X.apk</code>).
          </p>
          <p>
            3. Apri la scheda <strong>Releases</strong> su GitHub dal tuo smartphone Android, scarica
            il file <code>.apk</code> allegato e toccalo per installarlo!
          </p>
        </div>

        {/* Direct WebAPK Install / Add to homescreen */}
        <div className="space-y-2">
          <div className="text-xs font-mono-code font-bold text-zinc-900">
            {isIOS ? '🍎 ALTERNATIVA IPHONE / IPAD (PWA):' : '⚡ INSTALLAZIONE RAPIDA DA BROWSER (PWA):'}
          </div>

          {isInstallable ? (
            <button
              onClick={() => {
                install();
                onClose();
              }}
              className="w-full py-2 px-4 font-hand font-bold text-sm bg-emerald-400 hover:bg-emerald-500 text-zinc-950 border-2 border-zinc-950 rounded-lg shadow-[3px_3px_0px_#141413] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📲</span>
              <span>Installa Ora come App Standalone</span>
            </button>
          ) : isIOS ? (
            <div className="p-2.5 bg-amber-50 border-2 border-zinc-900 rounded-lg text-xs font-hand text-zinc-900 space-y-1">
              <p>1. Tocca <strong>Condividi</strong> in Safari e scegli <strong>&quot;Aggiungi alla schermata Home&quot;</strong>.</p>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 border-2 border-zinc-900 rounded-lg text-xs font-hand text-zinc-900">
              Su Chrome mobile puoi anche usare il menu (3 puntini) → <strong>&quot;Installa app&quot;</strong> per giocare subito a schermo intero.
            </div>
          )}
        </div>

        {/* Copy Link & Close */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-1.5 px-3 font-hand font-bold text-xs bg-amber-200 hover:bg-amber-300 text-zinc-950 border border-zinc-900 rounded cursor-pointer text-center"
          >
            {copied ? '✓ Link Copiato!' : '📋 Copia Link Versione Web'}
          </button>
          <button
            onClick={onClose}
            className="py-1.5 px-4 font-hand font-bold text-xs bg-zinc-900 text-amber-300 border border-zinc-950 rounded cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
