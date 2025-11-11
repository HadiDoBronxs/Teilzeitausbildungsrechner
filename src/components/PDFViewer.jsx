import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker - use the worker file from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * PDFViewer component that displays a PDF document in a modal overlay.
 * 
 * Features:
 * - Page navigation (Previous/Next)
 * - Zoom controls (zoom in/out)
 * - Loading and error states
 * - Automatic cleanup of blob URLs
 * 
 * The component uses pdfjs-dist to render PDF pages onto a canvas element.
 * PDF bytes are converted to a Blob URL to avoid ArrayBuffer detachment issues
 * when passing data to the Web Worker.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {Uint8Array|ArrayBuffer} props.pdfBytes - The PDF document bytes to display.
 * @param {Function} props.onClose - Callback function called when the viewer is closed.
 * @returns {JSX.Element} The PDF viewer component with toolbar and canvas.
 */
export default function PDFViewer({ pdfBytes, onClose }) {
  const canvasRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Loads the PDF document from the provided bytes.
     * Converts the bytes to a Blob URL to avoid ArrayBuffer detachment issues
     * when passing data to the PDF.js Web Worker.
     * 
     * @async
     * @function loadPDF
     * @throws {Error} If PDF loading fails, sets the error state with details.
     */
    async function loadPDF() {
      try {
        setLoading(true);
        setError(null);
        
        // Convert PDF bytes to a Blob URL to avoid ArrayBuffer detachment issues
        // This approach creates a URL that can be loaded without transferring the buffer
        let blob;
        if (pdfBytes instanceof Uint8Array) {
          blob = new Blob([pdfBytes], { type: 'application/pdf' });
        } else if (pdfBytes instanceof ArrayBuffer) {
          blob = new Blob([pdfBytes], { type: 'application/pdf' });
        } else {
          blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        }
        
        const blobUrl = URL.createObjectURL(blob);
        
        try {
          const loadingTask = pdfjsLib.getDocument({ 
            url: blobUrl,
            useWorkerFetch: false,
            isEvalSupported: false,
            verbosity: 0,
            useSystemFonts: false,
          });
          
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setCurrentPage(1);
          
          // Clean up the blob URL after loading
          URL.revokeObjectURL(blobUrl);
        } catch (loadError) {
          // Clean up blob URL on error
          URL.revokeObjectURL(blobUrl);
          throw loadError;
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        });
        setError(`Failed to load PDF: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    if (pdfBytes) {
      loadPDF();
    }
  }, [pdfBytes]);

  useEffect(() => {
    /**
     * Renders the current PDF page onto the canvas element.
     * Updates the canvas dimensions based on the viewport and scale,
     * then renders the page content.
     * 
     * @async
     * @function renderPage
     * @throws {Error} If page rendering fails, sets the error state.
     */
    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render PDF page");
      }
    }

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  /**
   * Navigates to the previous page.
   * Does nothing if already on the first page.
   * 
   * @function goToPreviousPage
   */
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  /**
   * Navigates to the next page.
   * Does nothing if already on the last page.
   * 
   * @function goToNextPage
   */
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  };

  /**
   * Increases the zoom level by 0.25 (25%).
   * Maximum zoom is 300% (scale 3.0).
   * 
   * @function zoomIn
   */
  const zoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.25));
  };

  /**
   * Decreases the zoom level by 0.25 (25%).
   * Minimum zoom is 50% (scale 0.5).
   * 
   * @function zoomOut
   */
  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-slate-700">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
          >
            −
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
          >
            +
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <canvas ref={canvasRef} className="shadow-2xl bg-white" />
      </div>
    </div>
  );
}

