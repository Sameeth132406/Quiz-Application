import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PdfViewer = ({ url, fileName, title, isDownloadable = true }) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [blobDownloadUrl, setBlobDownloadUrl] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Initialize PDF.js library
  const getPdfJs = async () => {
    if (window.pdfjsLib) {
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
      }
      return window.pdfjsLib;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/vendor/pdfjs/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to initialize'));
        }
      };
      script.onerror = () => {
        // Fallback to CDN
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        cdnScript.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(window.pdfjsLib);
          } else {
            reject(new Error('PDF.js CDN failed to initialize'));
          }
        };
        cdnScript.onerror = () => reject(new Error('Could not load PDF.js'));
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(script);
    });
  };

  // Load document data
  useEffect(() => {
    let isCancelled = false;
    let localBlobUrl = null;

    const loadDocument = async () => {
      if (!url) return;
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setCurrentPage(1);

      try {
        const pdfjs = await getPdfJs();

        // Fetch document bytes with auth headers via axios api
        const response = await api.get(url, { responseType: 'arraybuffer' });
        if (isCancelled) return;

        // Also create a local blob for download / open in new tab
        const blob = new Blob([response.data], { type: 'application/pdf' });
        localBlobUrl = URL.createObjectURL(blob);
        setBlobDownloadUrl(localBlobUrl);

        const typedArray = new Uint8Array(response.data);
        const loadingTask = pdfjs.getDocument({
          data: typedArray,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF document:', err);
        if (!isCancelled) {
          setError('Failed to load document preview. Please use the button below to view or download.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [url]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isPageCancelled = false;

    const renderPage = async () => {
      try {
        setRendering(true);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isPageCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale });

        // Adjust for device pixel ratio for crystal-clear text on Retina / high-DPI screens
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isPageCancelled) {
          setRendering(false);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
        if (!isPageCancelled) {
          setRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isPageCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleFitWidth = () => {
    if (containerRef.current && pdfDoc) {
      pdfDoc.getPage(currentPage).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current.clientWidth - 48; // padding
        if (containerWidth > 0 && viewport.width > 0) {
          const newScale = Math.max(0.6, Math.min(containerWidth / viewport.width, 2.0));
          setScale(newScale);
        }
      });
    }
  };

  const effectiveDownload = blobDownloadUrl || url;
  const displayName = fileName || title || 'Document.pdf';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Action Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Document Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '180px' }}>
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            {numPages > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {numPages} {numPages === 1 ? 'page' : 'pages'}
              </div>
            )}
          </div>
        </div>

        {/* Navigation & Zoom Bar (Only when document loaded) */}
        {!loading && !error && numPages > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {/* Page Navigation */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              title="Previous Page"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.35 : 1,
                padding: '0.25rem 0.5rem',
                fontSize: '0.9rem',
                borderRadius: '4px',
              }}
            >
              ◀
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '70px', textAlign: 'center' }}>
              {currentPage} / {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              title="Next Page"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage >= numPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= numPages ? 0.35 : 1,
                padding: '0.25rem 0.5rem',
                fontSize: '0.9rem',
                borderRadius: '4px',
              }}
            >
              ▶
            </button>

            <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 0.25rem' }}></div>

            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '1rem', borderRadius: '4px' }}
            >
              −
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '1rem', borderRadius: '4px' }}
            >
              +
            </button>
            <button
              onClick={handleFitWidth}
              title="Fit to Width"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '0.2rem 0.45rem', fontSize: '0.75rem', borderRadius: '4px', marginLeft: '0.2rem' }}
            >
              Fit
            </button>
          </div>
        )}

        {/* Action Buttons: Single Download + Open in New Tab */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={effectiveDownload}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-course"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
          >
            Open in New Tab ↗
          </a>
          {isDownloadable && (
            <a
              href={effectiveDownload}
              download={displayName}
              className="btn-primary-course"
              style={{ padding: '0.4rem 0.95rem', fontSize: '0.85rem' }}
            >
              Download 📥
            </a>
          )}
        </div>
      </div>

      {/* Main Canvas Display Area */}
      <div
        style={{
          position: 'relative',
          minHeight: '620px',
          maxHeight: '780px',
          overflow: 'auto',
          background: '#525659',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '1.5rem',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            ></div>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Rendering document preview...</span>
          </div>
        )}

        {error ? (
          <div
            style={{
              background: '#ffffff',
              padding: '2.5rem',
              borderRadius: '8px',
              maxWidth: '480px',
              textAlign: 'center',
              boxShadow: 'var(--shadow)',
              margin: 'auto',
            }}
          >
            <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.75rem' }}>📄</span>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Inline Preview Unavailable</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {error}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <a
                href={effectiveDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-course"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
              >
                Open Document in New Tab ↗
              </a>
              {isDownloadable && (
                <a
                  href={effectiveDownload}
                  download={displayName}
                  className="btn-secondary-course"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Download File 📥
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
              background: '#ffffff',
              borderRadius: '2px',
              transition: 'opacity 0.2s ease',
              opacity: rendering ? 0.75 : 1,
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
