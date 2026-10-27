import api from './api';

export const proctoringService = {
  // Start proctored exam attempt
  startProctoredExam: async (quizId) => {
    const response = await api.post(`/proctoring/quizzes/${quizId}/start`);
    return response.data;
  },

  // Upload an exam screenshot snapshot
  uploadScreenshot: async (attemptId, blob, sequenceNumber, capturedAt) => {
    const formData = new FormData();
    formData.append('file', blob, `attempt_${attemptId}_seq_${sequenceNumber}.jpg`);
    if (sequenceNumber !== undefined && sequenceNumber !== null) {
      formData.append('sequenceNumber', sequenceNumber);
    }
    if (capturedAt) {
      formData.append('capturedAt', capturedAt);
    }

    const response = await api.post(`/proctoring/attempts/${attemptId}/screenshots`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get screenshot metadata list for an attempt
  getAttemptScreenshots: async (attemptId) => {
    const response = await api.get(`/proctoring/attempts/${attemptId}/screenshots`);
    return response.data;
  },

  // Get full proctoring summary with integrity score and events
  getAttemptSummary: async (attemptId) => {
    const response = await api.get(`/proctoring/attempts/${attemptId}/summary`);
    return response.data;
  },

  // Get all proctoring summaries for a quiz (educators/admins)
  getQuizSummaries: async (quizId) => {
    const response = await api.get(`/proctoring/quizzes/${quizId}/summaries`);
    return response.data;
  },

  // Delete a screenshot
  deleteScreenshot: async (screenshotId) => {
    const response = await api.delete(`/proctoring/screenshots/${screenshotId}`);
    return response.data;
  },

  // Record an integrity event
  recordIntegrityEvent: async (attemptId, userId, eventType, remarks) => {
    try {
      const response = await api.post('/integrity-events', {
        quizAttemptId: attemptId,
        userId: userId,
        eventType: eventType,
        eventTime: new Date().toISOString(),
        remarks: remarks || `Proctoring event: ${eventType}`
      });
      return response.data;
    } catch (e) {
      console.warn('Failed to record integrity event:', e);
      return null;
    }
  },

  // Helper to convert HTML5 canvas to Blob with quality optimization
  canvasToBlob: (canvas, mimeType = 'image/jpeg', quality = 0.6) => {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        }, mimeType, quality);
      } catch (err) {
        reject(err);
      }
    });
  }
};

export default proctoringService;
