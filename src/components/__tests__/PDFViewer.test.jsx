import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PDFViewer from "../PDFViewer";

// Fully mock pdfjs-dist so Vitest can run without a real worker.
vi.mock("pdfjs-dist", () => {
  const mockPage = {
    getViewport: vi.fn(() => ({
      width: 800,
      height: 600,
    })),
    render: vi.fn(() => ({
      promise: Promise.resolve(),
    })),
  };

  const mockPdf = {
    numPages: 3,
    getPage: vi.fn(() => Promise.resolve(mockPage)),
  };

  const mockGetDocument = vi.fn(() => ({
    promise: Promise.resolve(mockPdf),
  }));

  return {
    GlobalWorkerOptions: {
      workerSrc: "mock-worker",
    },
    getDocument: mockGetDocument,
    __TEST_MOCKS: {
      getDocument: mockGetDocument,
      pdf: mockPdf,
      page: mockPage,
    },
  };
});

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("PDFViewer", () => {
  const mockPdfBytes = new Uint8Array([1, 2, 3, 4, 5]);
  const mockOnClose = vi.fn();
  let mockGetDocument;
  let mockPdf;

  beforeEach(async () => {
    // Dynamically import the mocked module so the references stay up to date.
    const pdfjsModule = await import("pdfjs-dist");
    mockGetDocument = pdfjsModule.__TEST_MOCKS.getDocument;
    mockPdf = pdfjsModule.__TEST_MOCKS.pdf;

    vi.clearAllMocks();
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdf),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    expect(screen.getByText("Loading PDF...")).toBeInTheDocument();
    
    // Wait until the async load kicked off at least once.
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  it("creates blob URL from PDF bytes", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
    
    const blobCall = mockCreateObjectURL.mock.calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
    expect(blobCall.type).toBe("application/pdf");
  });

  it("loads PDF and displays viewer after loading", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    });
    
    // Should show page navigation - check for page indicator format "1 / 3"
    // The text is split across elements, so we check the span container
    const pageIndicators = screen.getAllByText((content, element) => {
      const text = element?.textContent?.trim() || "";
      return /^\s*1\s*\/\s*3\s*$/.test(text);
    });
    expect(pageIndicators.length).toBeGreaterThan(0);
    // Check buttons by aria-label since text is conditionally rendered
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("displays error message when PDF loading fails", async () => {
    if (!mockGetDocument) {
      const pdfjsModule = await import("pdfjs-dist");
      mockGetDocument = pdfjsModule.__TEST_MOCKS.getDocument;
      mockPdf = pdfjsModule.__TEST_MOCKS.pdf;
    }
    
    mockGetDocument.mockReturnValueOnce({
      promise: Promise.reject(new Error("Failed to load PDF")),
    });

    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load PDF/)).toBeInTheDocument();
    });
    
    expect(mockRevokeObjectURL).toHaveBeenCalled();
    
    // Reset mock for other tests
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdf),
    });
  });

  it("calls onClose when close button is clicked", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    });
    
    const closeButton = screen.getByLabelText("Close viewer");
    await userEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("navigates to next page when Next button is clicked", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const nextButton = screen.getByLabelText("Next page");
    await userEvent.click(nextButton);
    
    await waitFor(() => {
      // Check for page 2 indicator - format is "2 / 3"
      const pageIndicators = screen.getAllByText((content, element) => {
        const text = element?.textContent?.trim() || "";
        return /^\s*2\s*\/\s*3\s*$/.test(text);
      });
      expect(pageIndicators.length).toBeGreaterThan(0);
    });
  });

  it("navigates to previous page when Previous button is clicked", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Go to page 2 first
    const nextButton = screen.getByLabelText("Next page");
    await userEvent.click(nextButton);
    
    await waitFor(() => {
      // Check for page 2 indicator - format is "2 / 3"
      const pageIndicators = screen.getAllByText((content, element) => {
        const text = element?.textContent?.trim() || "";
        return /^\s*2\s*\/\s*3\s*$/.test(text);
      });
      expect(pageIndicators.length).toBeGreaterThan(0);
    });
    
    // Then go back
    const prevButton = screen.getByLabelText("Previous page");
    await userEvent.click(prevButton);
    
    await waitFor(() => {
      // Check for page 1 indicator - format is "1 / 3"
      const pageIndicators = screen.getAllByText((content, element) => {
        const text = element?.textContent?.trim() || "";
        return /^\s*1\s*\/\s*3\s*$/.test(text);
      });
      expect(pageIndicators.length).toBeGreaterThan(0);
    });
  });

  it("disables Previous button on first page", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const prevButton = screen.getByLabelText("Previous page");
    expect(prevButton).toBeDisabled();
  });

  it("disables Next button on last page", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Navigate to last page
    const nextButton = screen.getByLabelText("Next page");
    await userEvent.click(nextButton); // Page 2
    await waitFor(() => {
      // Check for page 2 indicator - format is "2 / 3"
      const pageIndicators = screen.getAllByText((content, element) => {
        const text = element?.textContent?.trim() || "";
        return /^\s*2\s*\/\s*3\s*$/.test(text);
      });
      expect(pageIndicators.length).toBeGreaterThan(0);
    });
    await userEvent.click(nextButton); // Page 3
    await waitFor(() => {
      // Check for page 3 indicator - format is "3 / 3"
      const pageIndicators = screen.getAllByText((content, element) => {
        const text = element?.textContent?.trim() || "";
        return /^\s*3\s*\/\s*3\s*$/.test(text);
      });
      expect(pageIndicators.length).toBeGreaterThan(0);
    });
    
    expect(nextButton).toBeDisabled();
  });

  it("zooms in when zoom in button is clicked", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const zoomInButton = screen.getByText("+");
    
    await userEvent.click(zoomInButton);
    
    // Scale should increase from 100% to 125%
    await waitFor(() => {
      expect(screen.getByText("125%")).toBeInTheDocument();
    });
  });

  it("zooms out when zoom out button is clicked", async () => {
    render(<PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const zoomOutButton = screen.getByText("−");
    
    await userEvent.click(zoomOutButton);
    
    // Scale should decrease from 100% to 75%
    await waitFor(() => {
      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  it("handles ArrayBuffer input", async () => {
    const arrayBuffer = new ArrayBuffer(5);
    const view = new Uint8Array(arrayBuffer);
    view.set([1, 2, 3, 4, 5]);
    
    render(<PDFViewer pdfBytes={arrayBuffer} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  it("cleans up blob URL on unmount", async () => {
    const { unmount } = render(
      <PDFViewer pdfBytes={mockPdfBytes} onClose={mockOnClose} />
    );
    
    await waitFor(() => {
      expect(screen.queryByText("Loading PDF...")).not.toBeInTheDocument();
    });
    
    unmount();
    
    // Blob URL should be revoked (once after loading, once on unmount if needed)
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("handles empty PDF bytes gracefully", async () => {
    const emptyBytes = new Uint8Array(0);
    
    render(<PDFViewer pdfBytes={emptyBytes} onClose={mockOnClose} />);
    
    // Should still attempt to create blob and load
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });
});
