import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import courseService from '../services/courseService';
import moduleService from '../services/moduleService';
import contentService from '../services/contentService';
import quizService from '../services/quizService';
import ModuleCard from '../components/ModuleCard';
import ModuleForm from '../components/ModuleForm';
import FileUploader from '../components/FileUploader';
import Loading from '../components/Loading';

const CourseManagement = () => {
  const { id } = useParams();
  const { user, role } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Module Modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Content Modal state
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentType, setContentType] = useState('VIDEO');
  const [contentUrl, setContentUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [duration, setDuration] = useState('10 mins');
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [contentError, setContentError] = useState('');

  // Attach Quiz Modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizModuleId, setQuizModuleId] = useState(null);
  const [quizzesList, setQuizzesList] = useState([]);
  const [chosenQuizId, setChosenQuizId] = useState('');

  const fetchCourseData = async () => {
    try {
      const data = await courseService.getCourseById(id);
      setCourse(data);
    } catch (err) {
      console.error('Failed to load course for management', err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // --- Module Handlers ---
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (moduleData) => {
    try {
      if (editingModule) {
        await moduleService.updateModule(editingModule.id, moduleData);
        showNotification('Module updated successfully');
      } else {
        await moduleService.createModule(id, moduleData);
        showNotification('Module added successfully');
      }
      setIsModuleModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error('Failed to save module', err);
      alert(err.response?.data?.message || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its contents?')) return;
    try {
      await moduleService.deleteModule(moduleId);
      showNotification('Module deleted');
      fetchCourseData();
    } catch (err) {
      console.error('Failed to delete module', err);
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  // --- Content Handlers ---
  const handleOpenAddContent = (moduleId) => {
    setTargetModuleId(moduleId);
    setContentTitle('');
    setContentDescription('');
    setContentType('VIDEO');
    setContentUrl('');
    setTextContent('');
    setSelectedQuizId('');
    setDuration('10 mins');
    setIsDownloadable(true);
    setSelectedFile(null);
    setUploadProgress(0);
    setContentError('');
    setIsContentModalOpen(true);

    // If quizzes haven't been loaded, load them
    if (quizzesList.length === 0) {
      const getQuizFn = quizService.getAllQuizzes || quizService.getQuizzes;
      if (getQuizFn) {
        getQuizFn().then(setQuizzesList).catch(() => {});
      }
    }
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!contentTitle.trim()) {
      setContentError('Content title is required');
      return;
    }

    setIsUploading(true);
    setContentError('');

    try {
      const isFileUpload = ['PDF', 'DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE'].includes(contentType) && selectedFile;

      if (isFileUpload) {
        const formData = new FormData();
        formData.append('title', contentTitle.trim());
        formData.append('description', contentDescription.trim());
        formData.append('contentType', contentType);
        formData.append('file', selectedFile);
        formData.append('duration', duration);
        formData.append('downloadable', isDownloadable);

        await contentService.uploadContent(id, targetModuleId, formData, (percent) => {
          setUploadProgress(percent);
        });
      } else {
        const payload = {
          title: contentTitle.trim(),
          description: contentDescription.trim(),
          contentType,
          contentUrl: contentType === 'LINK' || contentType === 'VIDEO' ? contentUrl : null,
          textContent: contentType === 'TEXT' ? textContent : null,
          quizId: contentType === 'QUIZ' ? Number(selectedQuizId) : null,
          duration,
          isDownloadable,
        };

        await contentService.createContent(targetModuleId, payload);
      }

      showNotification('Content added successfully');
      setIsContentModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error('Failed to create content', err);
      setContentError(err.response?.data?.message || 'Failed to upload/create content');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Delete this content item?')) return;
    try {
      await contentService.deleteContent(contentId);
      showNotification('Content removed');
      fetchCourseData();
    } catch (err) {
      console.error('Failed to delete content', err);
      alert('Failed to delete content');
    }
  };

  // --- Quiz Attachment Handlers ---
  const handleOpenAttachQuiz = async (moduleId) => {
    setQuizModuleId(moduleId);
    setChosenQuizId('');
    try {
      const getQuizFn = quizService.getAllQuizzes || quizService.getQuizzes;
      const qList = getQuizFn ? await getQuizFn() : [];
      setQuizzesList(qList || []);
      if (qList && qList.length > 0) {
        setChosenQuizId(qList[0].id);
      }
    } catch (err) {
      console.error('Failed to load quizzes', err);
    }
    setIsQuizModalOpen(true);
  };

  const handleAttachQuiz = async (e) => {
    e.preventDefault();
    if (!chosenQuizId) return;

    try {
      await moduleService.attachQuiz(quizModuleId, chosenQuizId);
      showNotification('Quiz attached to module successfully');
      setIsQuizModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error('Failed to attach quiz', err);
      alert('Failed to attach quiz');
    }
  };

  const handleRemoveQuiz = async (moduleId) => {
    if (!window.confirm('Are you sure you want to detach this quiz from the module?')) return;
    try {
      await moduleService.removeQuiz(moduleId);
      showNotification('Quiz detached from module successfully');
      fetchCourseData();
    } catch (err) {
      console.error('Failed to detach quiz', err);
      showNotification(err.response?.data?.message || 'Failed to detach quiz. Please try again.');
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await courseService.updateCourseStatus(id, nextStatus);
      showNotification(`Course status changed to ${nextStatus}`);
      fetchCourseData();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  if (loading) return <Loading />;
  if (error || !course) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>;
  }

  return (
    <div className="course-page-container">
      {/* Header */}
      <div className="course-header-row">
        <div className="course-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span className={`badge-status status-${(course.status || '').toLowerCase()}`}>
              {course.status}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Course Management</span>
          </div>
          <h1>{course.title || course.courseName}</h1>
          <p>Organize syllabus, upload learning media, attach assessment quizzes, and publish to students.</p>
        </div>

        <div className="course-actions-bar">
          <button
            onClick={handleTogglePublish}
            className={`btn-secondary-course ${course.status === 'PUBLISHED' ? 'btn-danger-course' : ''}`}
            style={{ fontWeight: 700 }}
          >
            {course.status === 'PUBLISHED' ? 'Unpublish Course' : 'Publish Course'}
          </button>
          <Link to={`/courses/${id}`} className="btn-secondary-course">
            Preview Student View
          </Link>
          <Link to={`/courses/${id}/students`} className="btn-secondary-course">
            Students ({course.studentsCount || 0})
          </Link>
          <button onClick={handleOpenAddModule} className="btn-primary-course">
            + Add Module
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: '0.8rem 1.25rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius)', fontWeight: 600 }}>
          {successMessage}
        </div>
      )}

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              isEducator={true}
              onEditModule={handleOpenEditModule}
              onDeleteModule={handleDeleteModule}
              onAddContent={handleOpenAddContent}
              onAddQuiz={handleOpenAttachQuiz}
              onRemoveQuiz={handleRemoveQuiz}
              onDeleteContent={handleDeleteContent}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3>No modules in this course yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Create your first module (e.g. "Module 1: Introduction") to start adding videos, notes, and quizzes.
            </p>
            <button onClick={handleOpenAddModule} className="btn-primary-course">
              + Create First Module
            </button>
          </div>
        )}
      </div>

      {/* Module Add/Edit Modal */}
      <ModuleForm
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleSaveModule}
        initialData={editingModule}
      />

      {/* Add Content Modal */}
      {isContentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Add Learning Content</h3>
              <button onClick={() => setIsContentModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSaveContent}>
              <div className="modal-body">
                {contentError && (
                  <div style={{ padding: '0.65rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    {contentError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Content Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Variables and Data Types in Java"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Brief description or learning outcome..."
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Content Type *
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }}
                    >
                      <option value="VIDEO">Video</option>
                      <option value="PDF">PDF Document</option>
                      <option value="DOCUMENT">Office Document</option>
                      <option value="IMAGE">Image / Diagram</option>
                      <option value="AUDIO">Audio Lecture</option>
                      <option value="FILE">General File / Archive</option>
                      <option value="TEXT">Rich Text / Article</option>
                      <option value="LINK">External Link</option>
                      <option value="QUIZ">Quiz Reference</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15 mins"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>

                {/* Conditional Fields based on Content Type */}
                {['VIDEO', 'PDF', 'DOCUMENT', 'IMAGE', 'AUDIO', 'FILE'].includes(contentType) && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Upload File
                    </label>
                    <FileUploader
                      onFileSelected={(file) => setSelectedFile(file)}
                      progress={uploadProgress}
                      isUploading={isUploading}
                    />

                    {contentType === 'VIDEO' && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or enter external video / YouTube URL:</span>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={contentUrl}
                          onChange={(e) => setContentUrl(e.target.value)}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '0.25rem' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {contentType === 'LINK' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      External Resource URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/guide"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    />
                  </div>
                )}

                {contentType === 'TEXT' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Text Content / Lecture Notes *
                    </label>
                    <textarea
                      rows="6"
                      required
                      placeholder="Write your study notes, tutorial text, or code examples here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>
                )}

                {contentType === 'QUIZ' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Select Quiz Assessment *
                    </label>
                    <select
                      value={selectedQuizId}
                      onChange={(e) => setSelectedQuizId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }}
                    >
                      <option value="">-- Choose Existing Quiz --</option>
                      {quizzesList.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title} ({q.category} • {q.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="allowDownload"
                    checked={isDownloadable}
                    onChange={(e) => setIsDownloadable(e.target.checked)}
                  />
                  <label htmlFor="allowDownload" style={{ fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Allow students to download this file/resource
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="btn-secondary-course"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-course" disabled={isUploading}>
                  {isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload & Add Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Existing Quiz Modal */}
      {isQuizModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Attach Existing Quiz to Module</h3>
              <button onClick={() => setIsQuizModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleAttachQuiz}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Integrate an assessment from the Quiz module into this section. When students complete this quiz, their scores will automatically sync to analytics and gradebook.
                </p>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Choose Quiz Assessment *
                  </label>
                  <select
                    value={chosenQuizId}
                    onChange={(e) => setChosenQuizId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: '#fff' }}
                  >
                    {quizzesList.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.category} • {q.difficulty} • {q.duration} mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuizModalOpen(false)} className="btn-secondary-course">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-course">
                  Attach Quiz to Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
