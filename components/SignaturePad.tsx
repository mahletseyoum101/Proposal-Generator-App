"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

const SIGNATURE_FONT = "'Brush Script MT', 'Segoe Script', cursive";

export function SignaturePad({ onChange }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const emitDrawnSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke.current) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getCanvasContext();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#241C13";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    hasStroke.current = true;
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    emitDrawnSignature();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    onChange(null);
  }

  // Re-render the typed signature onto an offscreen canvas whenever it changes, so both
  // modes produce the same PNG data-URL shape for the API.
  useEffect(() => {
    if (mode !== "type") return;
    if (!typedName.trim()) {
      onChange(null);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 160;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#241C13";
    ctx.font = `56px ${SIGNATURE_FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 24, canvas.height / 2);
    onChange(canvas.toDataURL("image/png"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedName, mode]);

  function switchMode(next: "draw" | "type") {
    setMode(next);
    if (next === "draw") {
      clearCanvas();
    } else {
      onChange(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => switchMode("draw")}
          className={`text-sm px-3 py-1.5 rounded-full border transition ${
            mode === "draw"
              ? "bg-dodo-ink text-white border-dodo-ink"
              : "border-dodo-border text-dodo-muted hover:border-dodo-gold"
          }`}
        >
          Draw
        </button>
        <button
          type="button"
          onClick={() => switchMode("type")}
          className={`text-sm px-3 py-1.5 rounded-full border transition ${
            mode === "type"
              ? "bg-dodo-ink text-white border-dodo-ink"
              : "border-dodo-border text-dodo-muted hover:border-dodo-gold"
          }`}
        >
          Type
        </button>
      </div>

      {mode === "draw" ? (
        <div>
          <canvas
            ref={canvasRef}
            width={600}
            height={160}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full h-40 bg-white border border-dodo-border rounded-xl touch-none cursor-crosshair"
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="mt-2 text-sm text-dodo-muted hover:text-dodo-ink underline"
          >
            Clear
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name"
            className="w-full border border-dodo-border rounded-xl px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-dodo-gold"
            style={{ fontFamily: SIGNATURE_FONT }}
          />
        </div>
      )}
    </div>
  );
}
