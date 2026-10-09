import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { 
  Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  ExternalLink, RotateCw, RefreshCw, Move
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfViewer({ url, title = 'PDF Document', className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);

  // Drag pan & touch pinch refs
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1);

  // Reset transform when URL changes
  useEffect(() => {
    let isCancelled = false;

    if (!url) {
      setError('No PDF URL provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });

    const loadingTask = pdfjsLib.getDocument({
      url,
      withCredentials: false
    });

    loadingTask.promise
      .then((doc) => {
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('PDF.js loading error:', err);
          setError(err.message || 'Failed to load PDF');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy();
      } catch (e) {}
    };
  }, [url]);

  // Reset position when changing pages or resetting
  const handleReset = (e) => {
    e?.stopPropagation();
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Render Page to Canvas with High Crisp DPI
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }

      setRendering(true);
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });

      const containerWidth = containerRef.current.clientWidth || 700;
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      
      // Calculate fit scale (fits nicely in container)
      const padding = 16;
      const fitWidth = Math.max(containerWidth - padding * 2, 320);
      const baseScale = fitWidth / unscaledViewport.width;

      // Use higher pixel ratio for razor-sharp text when zooming into details
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
      const renderViewport = page.getViewport({ scale: baseScale * pixelRatio, rotation });

      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);
      canvas.style.width = `${Math.floor(unscaledViewport.width * baseScale)}px`;
      canvas.style.height = `${Math.floor(unscaledViewport.height * baseScale)}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport: renderViewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      setRendering(false);
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PDF Page render error:', err);
        setRendering(false);
      }
    }
  }, [pdfDoc, currentPage, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      renderPage();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderPage]);

  // ----------------------------------------------------
  // TOUCH & MOUSE 4-DIRECTION FREE PANNING & ZOOM
  // ----------------------------------------------------

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScaleRef.current = scale;
      setIsDragging(false);
    } else if (e.touches.length === 1 && scale > 1.05) {
      // 1-finger pan only when zoomed in
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
      if (e.cancelable) e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const factor = currentDistance / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.8), 4.5);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging && scale > 1.05) {
      if (e.cancelable) e.preventDefault(); // Stop outer page scroll only while panning zoomed document
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
      if (scale <= 1.05) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Mouse pan handlers (Desktop)
  const handleMouseDown = (e) => {
    if (scale > 1.05) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1.05) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scale <= 1.05) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Trackpad / Wheel 2-finger panning and Ctrl-wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom in / out
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setScale((s) => {
        const next = Math.min(Math.max(s * zoomFactor, 0.8), 4.5);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    } else if (scale > 1) {
      // Pan 4-way freely
      e.preventDefault();
      setPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Navigation handlers
  const handlePrevPage = (e) => {
    e?.stopPropagation();
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleNextPage = (e) => {
    e?.stopPropagation();
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setScale((s) => Math.min(s + 0.3, 4.5));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setScale((s) => {
      const next = Math.max(s - 0.3, 0.8);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = (e) => {
    e?.stopPropagation();
    setRotation((r) => (r + 90) % 360);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-inner select-none relative ${className}`}
    >
      {/* Top Floating Helper / Status Bar */}
      <div className="bg-slate-950/80 backdrop-blur-md px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-300 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-amber-400 truncate text-[11px] sm:text-xs">
            {title}
          </span>
          {numPages > 1 && (
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-mono font-bold text-gray-200 shrink-0">
              Page {currentPage} of {numPages}
            </span>
          )}
        </div>

        {/* Quick Zoom Pill & Open Direct */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-gray-400">
            {Math.round(scale * 100)}%
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 bg-amber-400/90 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors"
            title="Open PDF in new browser tab"
          >
            <ExternalLink className="w-2.5 h-2.5" /> Full Tab
          </a>
        </div>
      </div>

      {/* Main Document Canvas Viewport with Free 4-Direction Panning */}
      <div
        className={`relative w-full min-h-[380px] sm:min-h-[520px] flex items-center justify-center p-2 sm:p-4 overflow-hidden ${
          scale > 1.05 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        style={{ touchAction: scale > 1.05 ? 'none' : 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {loading && (
          <div className="m-auto flex flex-col items-center gap-3 text-amber-400 py-16">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-semibold text-gray-300">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="m-auto flex flex-col items-center gap-3 p-6 text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-200">Unable to preview PDF directly</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Document Directly</span>
            </a>
          </div>
        )}

        {/* Rendered PDF Page with 2D Transform Matrix */}
        <div
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className={`flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
            loading || error ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl bg-white max-w-none block ring-1 ring-black/20"
          />
        </div>

        {/* Multi-page Navigation Floating Arrows */}
        {numPages > 1 && (
          <>
            {currentPage > 1 && (
              <button
                type="button"
                onClick={handlePrevPage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

            {currentPage < numPages && (
              <button
                type="button"
                onClick={handleNextPage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </>
        )}

        {/* Zoom & Pan Hint */}
        {scale > 1 && (
          <div className="absolute top-12 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-amber-300 font-bold flex items-center gap-1.5 border border-white/10 z-10 pointer-events-none">
            <Move className="w-3 h-3" />
            <span>Drag in any direction to explore</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Interactive Toolbar */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2 border-t border-white/10 flex items-center justify-between gap-2 z-20">
        {/* Page Nav */}
        <div className="flex items-center gap-1">
          {numPages > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-gray-300 px-1">
                {currentPage} / {numPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Zoom & Tool Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-400/20 rounded-lg cursor-pointer transition-colors"
            title="Fit to Screen (Reset)"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
