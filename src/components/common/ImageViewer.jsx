import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, ExternalLink } from 'lucide-react';

export default function ImageViewer({ src, alt = 'Document', className = '' }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Touch pinch-to-zoom refs
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1);

  // Reset transform when src changes
  useEffect(() => {
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Touch pinch handlers (Mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // 2 fingers = Pinch Zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // 1 finger = Pan when zoomed
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      if (e.cancelable) e.preventDefault(); // Prevent full-page viewport zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const factor = currentDistance / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.8), 4.0);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      if (scale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Mouse pan handlers (Desktop)
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setScale((s) => Math.min(s + 0.25, 4.0));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setScale((s) => {
      const next = Math.max(s - 0.25, 0.8);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = (e) => {
    e?.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-slate-900/95 rounded-xl overflow-hidden flex flex-col shadow-inner select-none ${className}`}
    >
      {/* Image Area with touch pinch & pan */}
      <div
        className={`relative w-full min-h-[350px] sm:min-h-[500px] flex items-center justify-center p-2 sm:p-4 overflow-hidden ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl bg-white transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* Floating Bottom Controls (Zoom & Rotate) */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] hidden sm:inline">Rotate</span>
          </button>
          {scale !== 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-gray-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.8}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors text-xs font-bold"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-gray-400 min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4.0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors text-xs font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
