import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, RotateCw } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfViewer({ url, title, className = '' }) {
  const containerRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Touch pinch-to-zoom refs
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1);

  // Load PDF Document
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

  // Render Page to Canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const containerWidth = containerRef.current.clientWidth || 600;
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      
      const autoScale = ((containerWidth - 24) / unscaledViewport.width) * scale;
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: autoScale, rotation });

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const transform = pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null;

      const renderContext = {
        canvasContext: ctx,
        transform: transform,
        viewport: viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PDF Page render error:', err);
      }
    }
  }, [pdfDoc, currentPage, scale, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => {
    const handleResize = () => {
      renderPage();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderPage]);

  // Touch Pinch-to-zoom handlers (Document only)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      if (e.cancelable) e.preventDefault(); // Stop outer browser viewport zoom!
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const factor = currentDistance / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.75), 3.5);
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null;
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentPage < numPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.25, 3.5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.25, 0.75));
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setScale(1.0);
    setRotation(0);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-slate-900/95 rounded-xl overflow-hidden flex flex-col shadow-inner select-none ${className}`}
    >
      {/* Viewer Main Body */}
      <div
        ref={scrollWrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: scale > 1 ? 'pan-x pan-y' : 'pan-y' }}
        className="relative w-full min-h-[350px] sm:min-h-[500px] flex items-center justify-center p-2 sm:p-4 overflow-auto"
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-amber-400 py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-semibold text-gray-300">Rendering document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm">
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

        <canvas
          ref={canvasRef}
          className={`mx-auto rounded-lg shadow-2xl bg-white max-w-none transition-opacity duration-200 ${
            loading || error ? 'hidden' : 'block'
          }`}
        />
      </div>

      {/* Floating Bottom Controls (Page nav, Rotation & Zoom) */}
      {!loading && !error && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2 text-white">
          {/* Page navigation */}
          {numPages > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-xs font-bold"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-800 rounded-md">
                {currentPage} / {numPages}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentPage >= numPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-xs font-bold"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] hidden sm:inline">Rotate</span>
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            {scale !== 1 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-gray-300 transition-colors mr-1"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.75}
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
              disabled={scale >= 3.5}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors text-xs font-bold"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
