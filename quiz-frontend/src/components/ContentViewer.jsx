import React from 'react';
import { useNavigate } from 'react-router-dom';
import PdfViewer from './PdfViewer';

const ContentViewer = ({ content, courseId, moduleId, onComplete, isCompleted }) => {
  const navigate = useNavigate();

  const { title, description, contentType, contentUrl, fileName, mimeType, textContent, quizId, isDownloadable } = content || {};

  // Resolve file URL: if relative path, prepend backend base URL
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:8080${cleanUrl}`;
  };

  const fullContentUrl = getFullUrl(contentUrl);

  const isPdf =
    contentType === 'PDF' ||
    (mimeType && mimeType.includes('pdf')) ||
    (contentUrl && contentUrl.toLowerCase().endsWith('.pdf')) ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'));

  if (!content) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📖</span>
        <h3>Select a topic from the sidebar to start learning</h3>
      </div>
    );
  }

  const effectiveDownloadUrl = fullContentUrl;

  const getEmbedVideoUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();

    // 1. YouTube youtu.be/<id>
    const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
    }

    // 2. YouTube watch?v=<id>
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    // 3. YouTube embed/<id>
    const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    // 4. YouTube shorts/<id>
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) {
      return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    // 5. Vimeo vimeo.com/<id>
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return trimmed;
  };

  const renderContentBody = () => {
    const type = (contentType || '').toUpperCase();

    // 1. VIDEO
    if (type === 'VIDEO' || (mimeType && mimeType.startsWith('video/'))) {
      const isExternalVideo =
        fullContentUrl.includes('youtube.com') ||
        fullContentUrl.includes('youtu.be') ||
        fullContentUrl.includes('vimeo.com');

      const videoEmbedUrl = isExternalVideo ? getEmbedVideoUrl(fullContentUrl) : fullContentUrl;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {/* Action Toolbar for Video */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎥</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {fileName || title || 'Video Lesson'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {isExternalVideo ? (
                <a
                  href={fullContentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary-course"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  Watch on YouTube ↗
                </a>
              ) : (
                <>
                  <a
                    href={fullContentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary-course"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Open in New Tab ↗
                  </a>
                  {isDownloadable && (
                    <a
                      href={effectiveDownloadUrl}
                      download={fileName || `${title || 'video'}.mp4`}
                      className="btn-primary-course"
                      style={{ padding: '0.4rem 0.95rem', fontSize: '0.85rem' }}
                    >
                      Download 📥
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Video Player Display Container */}
          <div
            className="media-viewer-container"
            style={{
              width: '100%',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              background: '#000000',
              aspectRatio: '16 / 9',
              minHeight: '480px',
              maxHeight: '620px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isExternalVideo ? (
              <iframe
                key={videoEmbedUrl}
                style={{ width: '100%', height: '100%', minHeight: '480px', border: 'none' }}
                src={videoEmbedUrl}
                title={title || 'Video Lesson'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <video key={fullContentUrl} controls className="video-player-element" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
                <source src={fullContentUrl} type={mimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      );
    }

    // 2. AUDIO
    if (type === 'AUDIO' || (mimeType && mimeType.startsWith('audio/'))) {
      return (
        <div className="media-viewer-container" style={{ padding: '2rem', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>🎵</span>
          <audio key={fullContentUrl} controls className="audio-player-element" style={{ width: '80%' }}>
            <source src={fullContentUrl} type={mimeType || 'audio/mpeg'} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // 3. PDF
    if (isPdf) {
      return (
        <PdfViewer
          url={fullContentUrl}
          fileName={fileName}
          title={title}
          isDownloadable={isDownloadable}
        />
      );
    }

    // 4. IMAGE
    if (type === 'IMAGE' || (mimeType && mimeType.startsWith('image/'))) {
      return (
        <div className="media-viewer-container" style={{ padding: '1rem' }}>
          <img src={fullContentUrl} alt={title} className="image-viewer-element" />
        </div>
      );
    }

    // 5. TEXT
    if (type === 'TEXT') {
      return (
        <div className="text-viewer-card">
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.75' }}>
            {textContent || description || 'No text content available.'}
          </div>
        </div>
      );
    }

    // 6. LINK / EXTERNAL LINK
    if (type === 'LINK') {
      return (
        <div className="quiz-content-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <span style={{ fontSize: '3.5rem' }}>🔗</span>
          <h3>External Learning Resource</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
            {description || 'This resource links to external educational content. Click below to open it in a secure new tab.'}
          </p>
          <a
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-course"
            style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
          >
            Open External Resource ↗
          </a>
        </div>
      );
    }

    // 7. QUIZ
    if (type === 'QUIZ' || quizId) {
      return (
        <div className="quiz-content-card">
          <span style={{ fontSize: '3.5rem' }}>🧠</span>
          <h2>Module Assessment Quiz</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '550px' }}>
            {description || 'Test your understanding of the concepts covered in this module. Your results will automatically update your gradebook and progress.'}
          </p>
          <button
            onClick={() => navigate(`/take-quiz/${quizId}`)}
            className="btn-primary-course"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
          >
            Start Quiz Assessment ➔
          </button>
        </div>
      );
    }

    // 8. OTHER DOCUMENT / FILE
    return (
      <div className="quiz-content-card" style={{ background: '#f8fafc', borderColor: 'var(--border)' }}>
        <span style={{ fontSize: '3.5rem' }}>📁</span>
        <h3>{fileName || title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          {description || 'Download this educational document to study offline.'}
        </p>
        {isDownloadable && (
          <a
            href={effectiveDownloadUrl}
            download={fileName || title}
            className="btn-primary-course"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            📥 Download File
          </a>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="content-detail-header">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          {title}
        </h2>
        {description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{description}</p>
        )}
      </div>

      {renderContentBody()}
    </div>
  );
};

export default ContentViewer;
