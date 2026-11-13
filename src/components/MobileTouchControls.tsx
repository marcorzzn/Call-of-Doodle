import React, { useEffect, useRef, useState } from 'react';
import { WeaponId } from '../data/gddData';

interface MobileTouchControlsProps {
  activeWeaponId: WeaponId;
  isCrouching: boolean;
  isSniperAiming: boolean;
  stamina: number;
  currentRoom: string;
  onFireStart: () => void;
  onFireEnd: () => void;
  onJump: () => void;
  onCrouchToggle: () => void;
  onReload: () => void;
  onCycleWeapon: (dir: number) => void;
  onSniperToggle: () => void;
  onFlush: () => void;
  onSprintToggle: (sprint: boolean) => void;
  onMoveVectorChange: (vec: { x: number; y: number }) => void;
  onAimDeltaChange: (delta: { x: number; y: number }) => void;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  activeWeaponId,
  isCrouching,
  isSniperAiming,
  stamina,
  currentRoom,
  onFireStart,
  onFireEnd,
  onJump,
  onCrouchToggle,
  onReload,
  onCycleWeapon,
  onSniperToggle,
  onFlush,
  onSprintToggle,
  onMoveVectorChange,
  onAimDeltaChange,
}) => {
  const [isSprinting, setIsSprinting] = useState(false);

  // Left stick position (visual thumb position)
  const [leftStickPos, setLeftStickPos] = useState({ x: 0, y: 0 });
  const leftStickTouchId = useRef<number | null>(null);
  const leftStickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Right stick position (visual thumb position)
  const [rightStickPos, setRightStickPos] = useState({ x: 0, y: 0 });
  const rightStickTouchId = useRef<number | null>(null);
  const rightStickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const leftStickRef = useRef<HTMLDivElement | null>(null);
  const rightStickRef = useRef<HTMLDivElement | null>(null);

  const STICK_RADIUS = 46; // max px offset from center

  // Handle Left Joystick (Move)
  const handleLeftTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (leftStickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    leftStickTouchId.current = touch.identifier;

    if (leftStickRef.current) {
      const rect = leftStickRef.current.getBoundingClientRect();
      leftStickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    const dx = touch.clientX - leftStickCenter.current.x;
    const dy = touch.clientY - leftStickCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, STICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setLeftStickPos({ x: knobX, y: knobY });
    onMoveVectorChange({
      x: knobX / STICK_RADIUS,
      y: knobY / STICK_RADIUS,
    });
  };

  const handleLeftTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (leftStickTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === leftStickTouchId.current) {
        const dx = touch.clientX - leftStickCenter.current.x;
        const dy = touch.clientY - leftStickCenter.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, STICK_RADIUS);
        const angle = Math.atan2(dy, dx);
        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        setLeftStickPos({ x: knobX, y: knobY });
        onMoveVectorChange({
          x: knobX / STICK_RADIUS,
          y: knobY / STICK_RADIUS,
        });
        break;
      }
    }
  };

  const handleLeftTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === leftStickTouchId.current) {
        leftStickTouchId.current = null;
        setLeftStickPos({ x: 0, y: 0 });
        onMoveVectorChange({ x: 0, y: 0 });
        break;
      }
    }
  };

  // Handle Right Joystick (Aim)
  const handleRightTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (rightStickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    rightStickTouchId.current = touch.identifier;

    if (rightStickRef.current) {
      const rect = rightStickRef.current.getBoundingClientRect();
      rightStickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    const dx = touch.clientX - rightStickCenter.current.x;
    const dy = touch.clientY - rightStickCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, STICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setRightStickPos({ x: knobX, y: knobY });
    onAimDeltaChange({
      x: knobX / STICK_RADIUS,
      y: knobY / STICK_RADIUS,
    });
  };

  const handleRightTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (rightStickTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === rightStickTouchId.current) {
        const dx = touch.clientX - rightStickCenter.current.x;
        const dy = touch.clientY - rightStickCenter.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, STICK_RADIUS);
        const angle = Math.atan2(dy, dx);
        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        setRightStickPos({ x: knobX, y: knobY });
        onAimDeltaChange({
          x: knobX / STICK_RADIUS,
          y: knobY / STICK_RADIUS,
        });
        break;
      }
    }
  };

  const handleRightTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightStickTouchId.current) {
        rightStickTouchId.current = null;
        setRightStickPos({ x: 0, y: 0 });
        onAimDeltaChange({ x: 0, y: 0 });
        break;
      }
    }
  };

  const handleToggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    onSprintToggle(next);
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 touch-none">
      {/* 1. LEFT ZONE: Movement Virtual Joystick + Sprint Toggle Button */}
      <div className="absolute bottom-6 left-6 pointer-events-auto flex flex-col items-center gap-2">
        {/* Sprint Toggle with Stamina Bar */}
        <div className="flex flex-col items-center gap-1">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleToggleSprint();
            }}
            onClick={handleToggleSprint}
            className={`px-3 py-1 text-xs font-hand font-extrabold rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#141413] cursor-pointer transition-transform active:scale-95 flex items-center gap-1 ${
              isSprinting
                ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-500'
                : 'bg-white/80 text-zinc-800'
            }`}
          >
            <span>⚡</span>
            <span>{isSprinting ? 'SCATTO ON' : 'SCATTO'}</span>
          </button>
          {/* Mini Stamina Bar */}
          <div className="w-20 h-1.5 bg-zinc-300 border border-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                stamina > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${stamina}%` }}
            />
          </div>
        </div>

        {/* Outer Circular Movement Base */}
        <div
          ref={leftStickRef}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          onTouchEnd={handleLeftTouchEnd}
          onTouchCancel={handleLeftTouchEnd}
          className="w-28 h-28 rounded-full border-3 border-zinc-950 bg-[#f4efe1]/80 backdrop-blur-xs shadow-[3px_3px_0px_#141413] relative flex items-center justify-center cursor-pointer touch-none"
        >
          {/* Compass Axis Markings */}
          <div className="absolute inset-x-0 top-1.5 text-[9px] font-hand text-center text-zinc-500 font-bold">W</div>
          <div className="absolute inset-x-0 bottom-1.5 text-[9px] font-hand text-center text-zinc-500 font-bold">S</div>
          <div className="absolute inset-y-0 left-1.5 flex items-center text-[9px] font-hand text-zinc-500 font-bold">A</div>
          <div className="absolute inset-y-0 right-1.5 flex items-center text-[9px] font-hand text-zinc-500 font-bold">D</div>

          {/* Center Stickman Footstep Icon */}
          <div className="w-6 h-6 rounded-full border border-dashed border-zinc-400 pointer-events-none" />

          {/* Floating Movable Thumb Knob */}
          <div
            className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-amber-300 shadow-[2px_2px_4px_rgba(0,0,0,0.4)] absolute pointer-events-none flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${leftStickPos.x}px, ${leftStickPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-amber-300/80" />
          </div>
        </div>
      </div>

      {/* 2. RIGHT ZONE: Look / Aim Joystick + Action Buttons Cluster */}
      <div className="absolute bottom-6 right-5 pointer-events-auto flex items-end gap-3">
        {/* Secondary Action Column (Jump, Crouch, Reload, Utilities) */}
        <div className="flex flex-col items-center gap-2 mb-1">
          {/* Cycle Weapons Buttons [◀] [▶] */}
          <div className="flex items-center gap-1 bg-[#f4efe1]/90 p-1 rounded-lg border-2 border-zinc-950 shadow-[2px_2px_0px_#141413]">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onCycleWeapon(-1);
              }}
              onClick={() => onCycleWeapon(-1)}
              className="w-7 h-7 bg-zinc-900 text-amber-300 rounded font-hand font-bold text-sm flex items-center justify-center active:scale-90"
              title="Arma Precedente"
            >
              ◀
            </button>
            <span className="text-[10px] font-hand font-bold text-zinc-900 px-0.5">ARMA</span>
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onCycleWeapon(1);
              }}
              onClick={() => onCycleWeapon(1)}
              className="w-7 h-7 bg-zinc-900 text-amber-300 rounded font-hand font-bold text-sm flex items-center justify-center active:scale-90"
              title="Prossima Arma"
            >
              ▶
            </button>
          </div>

          {/* Sniper Optical Zoom (Only if holding Penna Bic) */}
          {activeWeaponId === 'penna_bic' && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onSniperToggle();
              }}
              onClick={onSniperToggle}
              className={`w-11 h-11 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#141413] flex flex-col items-center justify-center font-hand font-bold text-[11px] active:scale-90 ${
                isSniperAiming ? 'bg-blue-500 text-white' : 'bg-blue-100 text-zinc-900'
              }`}
            >
              <span>🎯</span>
              <span>MIRINO</span>
            </button>
          )}

          {/* Toilet Flush Combo in Il Bagno */}
          {currentRoom === 'bagno' && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onFlush();
              }}
              onClick={onFlush}
              className="w-11 h-11 rounded-full bg-teal-300 active:bg-teal-400 border-2 border-zinc-950 shadow-[2px_2px_0px_#141413] flex flex-col items-center justify-center font-hand font-bold text-[10px] text-zinc-950 active:scale-90"
            >
              <span>🚽</span>
              <span>SCARICO</span>
            </button>
          )}

          {/* Reload Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onReload();
            }}
            onClick={onReload}
            className="w-12 h-12 rounded-full bg-emerald-200 active:bg-emerald-300 border-2 border-zinc-950 shadow-[2px_2px_0px_#141413] flex flex-col items-center justify-center font-hand font-bold text-[11px] text-zinc-950 active:scale-90 cursor-pointer"
          >
            <span>🔄</span>
            <span>RICAR.</span>
          </button>

          {/* Crouch Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onCrouchToggle();
            }}
            onClick={onCrouchToggle}
            className={`w-12 h-12 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#141413] flex flex-col items-center justify-center font-hand font-bold text-[11px] active:scale-90 cursor-pointer ${
              isCrouching
                ? 'bg-cyan-400 text-zinc-950 ring-2 ring-cyan-500'
                : 'bg-cyan-100 text-zinc-900'
            }`}
          >
            <span>🧎</span>
            <span>{isCrouching ? 'ALZATI' : 'ACCOV.'}</span>
          </button>
        </div>

        {/* Primary Action Column (Jump & Big Fire Button) */}
        <div className="flex flex-col items-center gap-2 mb-1">
          {/* Jump Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onJump();
            }}
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-amber-300 active:bg-amber-400 border-3 border-zinc-950 shadow-[3px_3px_0px_#141413] flex flex-col items-center justify-center font-hand font-extrabold text-xs text-zinc-950 active:scale-90 cursor-pointer"
          >
            <span className="text-base">🦘</span>
            <span>SALTO</span>
          </button>

          {/* BIG FIRE BUTTON (Hold or Tap to shoot) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onFireStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onFireEnd();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              onFireEnd();
            }}
            onMouseDown={onFireStart}
            onMouseUp={onFireEnd}
            onMouseLeave={onFireEnd}
            className="w-18 h-18 rounded-full bg-rose-600 active:bg-rose-700 text-white border-3 border-zinc-950 shadow-[4px_4px_0px_#141413] flex flex-col items-center justify-center font-hand font-black text-sm active:scale-95 cursor-pointer touch-none"
          >
            <span className="text-lg leading-none">💥</span>
            <span className="tracking-wide">SPARA</span>
          </button>
        </div>

        {/* Right Aiming Touch Stick */}
        <div
          ref={rightStickRef}
          onTouchStart={handleRightTouchStart}
          onTouchMove={handleRightTouchMove}
          onTouchEnd={handleRightTouchEnd}
          onTouchCancel={handleRightTouchEnd}
          className="w-26 h-26 rounded-full border-2 border-dashed border-zinc-800 bg-[#f4efe1]/70 backdrop-blur-xs shadow-[2px_2px_0px_#141413] relative flex items-center justify-center cursor-pointer touch-none ml-1"
        >
          {/* Crosshair graphic in center */}
          <div className="text-zinc-400 font-hand text-xs font-bold pointer-events-none">
            MIRA 360°
          </div>

          {/* Floating Aim Thumb Knob */}
          <div
            className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-rose-400 shadow-md absolute pointer-events-none flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${rightStickPos.x}px, ${rightStickPos.y}px)`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-rose-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
