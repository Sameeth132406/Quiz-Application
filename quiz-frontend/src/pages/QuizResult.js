import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/attemptService';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const aData = await attemptService.getAttemptById(attemptId);
        setAttempt(aData);

        const rData = await attemptService.getResponsesByAttempt(attemptId);
        setResponses(rData || []);
      } catch (err) {
        console.error('Failed to load result', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return <div className="loading-spinner">Loading quiz result...</div>;
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '1.25rem',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
        }}>
          🎉
        </div>

        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quiz Completed!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your attempt has been successfully recorded and processed.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Attempt Score</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
              {attempt?.score || 0} pts
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
              {attempt?.status || 'COMPLETED'}
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Responses</div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--primary)' }}>
              {responses.length}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
            ← Back to Quizzes
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/gradebook')}>
            View Gradebook →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
