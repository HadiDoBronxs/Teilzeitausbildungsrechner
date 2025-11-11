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
 * - Save PDF functionality
 * - Print PDF functionality
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
  const [scale, setScale] = useState(1.0);
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

  /**
   * Creates a Blob from the PDF bytes, handling different input types.
   * 
   * @function createPDFBlob
   * @returns {Blob} A Blob object containing the PDF data.
   */
  function createPDFBlob() {
    if (pdfBytes instanceof Uint8Array) {
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else if (pdfBytes instanceof ArrayBuffer) {
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } else {
      return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    }
  }

  /**
   * Cleans up resources after saving (revokes blob URL).
   * 
   * @function cleanupSaveResources
   * @param {string} url - The blob URL to revoke.
   */
  function cleanupSaveResources(url) {
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads the PDF file to the user's device.
   * Creates a temporary download link and triggers it programmatically.
   * 
   * @function handleSave
   */
  function handleSave() {
    try {
      const blob = createPDFBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'part-time-training-calculation.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a short delay
      setTimeout(cleanupSaveResources, 100, url);
    } catch (err) {
      console.error("Error saving PDF:", err);
      alert("Failed to save PDF. Please try again.");
    }
  }

  /**
   * Cleans up print resources (removes iframe and revokes blob URL).
   * 
   * @function cleanupPrintResources
   * @param {HTMLIFrameElement} iframe - The iframe element to remove.
   * @param {string} url - The blob URL to revoke.
   */
  function cleanupPrintResources(iframe, url) {
    if (iframe && document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Attempts to print from an iframe.
   * 
   * @function attemptIframePrint
   * @param {HTMLIFrameElement} iframe - The iframe containing the PDF.
   * @param {string} _url - The blob URL of the PDF (unused but kept for API consistency).
   */
  function attemptIframePrint(iframe, _url) {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.print();
      }
    } catch (printErr) {
      console.error("Error triggering print:", printErr);
      throw printErr;
    }
  }

  /**
   * Fallback print method using a new window.
   * Sets up event listeners to clean up after printing.
   * 
   * @function printInNewWindow
   * @param {string} url - The blob URL of the PDF.
   */
  function printInNewWindow(url) {
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      let cleanupTimeout;
      let hasCleanedUp = false;

      function cleanupAfterPrint() {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        
        if (cleanupTimeout) {
          clearTimeout(cleanupTimeout);
        }
        
        try {
          printWindow.close();
        } catch (_err) {
          // Window might already be closed
        }
        URL.revokeObjectURL(url);
      }

      function handleAfterPrint() {
        cleanupAfterPrint();
      }

      // Set up event listeners
      window.addEventListener('afterprint', handleAfterPrint);
      
      // Fallback timeout: clean up after 5 minutes
      cleanupTimeout = setTimeout(function fallbackCleanup() {
        if (!hasCleanedUp) {
          console.warn("Print events did not fire for new window, cleaning up after timeout");
          cleanupAfterPrint();
        }
      }, 300000); // 5 minutes

      setTimeout(function triggerPrint() {
        try {
          printWindow.print();
        } catch (printErr) {
          console.error("Error printing in new window:", printErr);
          cleanupAfterPrint();
        }
      }, 500);
    }
  }

  /**
   * Sets up print event listeners to clean up resources after printing is complete.
   * 
   * @function setupPrintEventListeners
   * @param {HTMLIFrameElement} iframe - The iframe element.
   * @param {string} url - The blob URL of the PDF.
   * @returns {Function} A cleanup function to remove event listeners.
   */
  function setupPrintEventListeners(iframe, url) {
    let cleanupTimeout;
    let hasCleanedUp = false;

    function cleanupAfterPrint() {
      if (hasCleanedUp) return;
      hasCleanedUp = true;
      
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
      
      cleanupPrintResources(iframe, url);
    }

    function handleAfterPrint() {
      cleanupAfterPrint();
    }

    // Set up event listeners on the iframe's window
    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener('afterprint', handleAfterPrint);
      
      // Also listen on the main window as fallback
      window.addEventListener('afterprint', handleAfterPrint);
    }

    // Fallback timeout: clean up after 5 minutes if events don't fire
    // This is a safety net in case the browser doesn't support afterprint events
    cleanupTimeout = setTimeout(function fallbackCleanup() {
      if (!hasCleanedUp) {
        console.warn("Print events did not fire, cleaning up after timeout");
        cleanupAfterPrint();
      }
    }, 300000); // 5 minutes

    // Return cleanup function to remove listeners
    return function removeEventListeners() {
      if (iframe.contentWindow) {
        iframe.contentWindow.removeEventListener('afterprint', handleAfterPrint);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
    };
  }

  /**
   * Handles the iframe load event for printing.
   * Sets up print event listeners and triggers the print dialog.
   * 
   * @function handleIframeLoad
   * @param {HTMLIFrameElement} iframe - The iframe element.
   * @param {string} url - The blob URL of the PDF.
   */
  function handleIframeLoad(iframe, url) {
    // Small delay to ensure PDF is fully loaded
    setTimeout(function triggerPrintAfterLoad() {
      try {
        // Set up event listeners before triggering print
        setupPrintEventListeners(iframe, url);
        
        // Trigger print dialog
        attemptIframePrint(iframe, url);
      } catch (printErr) {
        console.error("Error triggering print:", printErr);
        cleanupPrintResources(iframe, null);
        printInNewWindow(url);
      }
    }, 500);
  }

  /**
   * Fallback timeout handler in case iframe onload doesn't fire.
   * 
   * @function handlePrintTimeout
   * @param {HTMLIFrameElement} iframe - The iframe element.
   * @param {string} url - The blob URL of the PDF.
   */
  function handlePrintTimeout(iframe, url) {
    if (document.body.contains(iframe)) {
      try {
        // Set up event listeners before triggering print
        setupPrintEventListeners(iframe, url);
        
        // Trigger print dialog
        attemptIframePrint(iframe, url);
      } catch (_printErr) {
        cleanupPrintResources(iframe, url);
        alert("Failed to print. Please use the Save button and print the saved file.");
      }
    }
  }

  /**
   * Detects if the current device is a mobile device.
   * 
   * @function isMobileDevice
   * @returns {boolean} True if the device is mobile.
   */
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
  }

  /**
   * Opens the PDF and triggers the browser's print dialog.
   * Uses different strategies for mobile vs desktop devices.
   * 
   * @function handlePrint
   */
  function handlePrint() {
    try {
      const blob = createPDFBlob();
      const url = URL.createObjectURL(blob);
      
      // On mobile devices, open PDF in new window/tab for better compatibility
      if (isMobileDevice()) {
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          // Try to trigger print after PDF loads
          let printAttempted = false;
          
          function attemptMobilePrint() {
            if (printAttempted) return;
            printAttempted = true;
            
            try {
              // Try to trigger print dialog
              printWindow.print();
              
              // Set up cleanup after print
              function handleAfterPrint() {
                try {
                  printWindow.close();
                } catch (_err) {
                  // Window might already be closed
                }
                URL.revokeObjectURL(url);
                window.removeEventListener('afterprint', handleAfterPrint);
              }
              
              window.addEventListener('afterprint', handleAfterPrint);
              
              // Fallback cleanup after 5 minutes
              setTimeout(function fallbackCleanup() {
                window.removeEventListener('afterprint', handleAfterPrint);
                URL.revokeObjectURL(url);
              }, 300000);
            } catch (_printErr) {
              console.log("Auto-print not available on mobile. PDF opened in new tab - use browser menu to print.");
              // On mobile, if print() fails, the PDF is still open in a new tab
              // User can use browser menu to print/share
              // Clean up blob URL after delay
              setTimeout(function revokeBlob() {
                URL.revokeObjectURL(url);
              }, 60000);
            }
          }
          
          // Try to print after a short delay to allow PDF to load
          setTimeout(attemptMobilePrint, 1000);
          
          // Also try when window loads (if event is available)
          if (printWindow.addEventListener) {
            printWindow.addEventListener('load', attemptMobilePrint);
          }
        } else {
          // Popup blocked - fall back to save suggestion
          URL.revokeObjectURL(url);
          alert("Please allow popups to print, or use the Save button and print the saved file.");
        }
        return;
      }
      
      // Desktop: Use iframe approach
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = url;
      
      document.body.appendChild(iframe);
      
      // Wait for the PDF to load, then trigger print
      iframe.onload = function onIframeLoad() {
        handleIframeLoad(iframe, url);
      };
      
      // Fallback timeout in case onload doesn't fire
      setTimeout(function printTimeout() {
        handlePrintTimeout(iframe, url);
      }, 2000);
    } catch (err) {
      console.error("Error printing PDF:", err);
      alert("Failed to print PDF. Please try saving and printing manually.");
    }
  }

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
      {/* Toolbar - Mobile First */}
      <div className="bg-slate-800 text-white">
        {/* Top row: Page navigation and close button */}
        <div className="flex items-center justify-between px-2 py-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="px-3 py-2 sm:px-3 sm:py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation"
              aria-label="Previous page"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </button>
            <span className="text-xs sm:text-sm font-medium px-2 whitespace-nowrap">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="px-3 py-2 sm:px-3 sm:py-1 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 sm:px-4 sm:py-1 bg-red-600 rounded hover:bg-red-700 text-sm sm:text-base min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation ml-2"
            aria-label="Close viewer"
          >
            <span className="hidden sm:inline">Close</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
        
        {/* Bottom row: Zoom and actions */}
        <div className="flex items-center justify-between px-2 py-2 sm:px-4 border-t border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={zoomOut}
              className="px-4 py-2 sm:px-3 sm:py-1 bg-slate-700 rounded hover:bg-slate-600 active:bg-slate-500 text-xl sm:text-base font-bold min-w-[48px] min-h-[48px] sm:min-w-0 sm:min-h-0 touch-manipulation select-none"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="text-xs sm:text-sm font-medium min-w-[3.5rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="px-4 py-2 sm:px-3 sm:py-1 bg-slate-700 rounded hover:bg-slate-600 active:bg-slate-500 text-xl sm:text-base font-bold min-w-[48px] min-h-[48px] sm:min-w-0 sm:min-h-0 touch-manipulation select-none"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 sm:px-4 sm:py-1 bg-green-600 rounded hover:bg-green-700 active:bg-green-800 text-xs sm:text-base font-medium min-w-[50px] min-h-[48px] sm:min-w-0 sm:min-h-0 touch-manipulation select-none"
              aria-label="Save PDF"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 sm:px-4 sm:py-1 bg-blue-600 rounded hover:bg-blue-700 active:bg-blue-800 text-xs sm:text-base font-medium min-w-[50px] min-h-[48px] sm:min-w-0 sm:min-h-0 touch-manipulation select-none"
              aria-label="Print PDF"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* PDF Canvas */}
      <div 
        className="flex-1 overflow-x-auto overflow-y-auto p-2 sm:p-4"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        <div className="inline-flex items-center justify-center min-w-min">
          <canvas ref={canvasRef} className="shadow-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

