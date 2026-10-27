import React, { useState, useRef } from 'react';

const FileUploader = ({ onFileSelected, progress = 0, isUploading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (onFileSelected) onFileSelected(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (onFileSelected) onFileSelected(file);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <div
        className={`file-uploader-dropzone ${dragActive ? 'dragging' : ''}`}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <span className="upload-icon">☁️</span>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          {selectedFile ? selectedFile.name : 'Click to upload or drag & drop file'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {selectedFile
            ? `${formatSize(selectedFile.size)} • Click to change file`
            : 'PDF, DOCX, PPTX, MP4, MP3, JPG, PNG, ZIP (Max 200MB)'}
        </div>
      </div>

      {isUploading && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>Uploading file...</span>
            <span>{progress}%</span>
          </div>
          <div className="upload-progress-bar-wrap">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
