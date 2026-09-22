import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="compact-landing">
      <div className="ambient-glow"></div>

      <div className="landing-content">
       

        <h1 className="hero-headline">
         <span className="brand-highlight">QuizFlow</span>
        </h1>

        <p className="hero-subtext">
          An intuitive, high-speed quiz platform designed for students.
        </p>

        {/* Call to Actions */}
        <div className="hero-cta-group">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-cta-main">
              <span>Go to Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-cta-main">
                <span>Get Started Free</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/login" className="btn-cta-outline">
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Sleek, Compact Minimal Highlights (Horizontal Bar) */}
        <div className="compact-features-strip">
          <div className="feature-chip">
            <span className="chip-icon">📝</span>
            <span>Interactive Quizzes</span>
          </div>
          <div className="chip-sep">•</div>
          <div className="feature-chip">
            <span className="chip-icon">⚡</span>
            <span>Real-Time Scoring</span>
          </div>
          <div className="chip-sep">•</div>
          <div className="feature-chip">
            <span className="chip-icon">📊</span>
            <span>Instant Analytics</span>
          </div>
          <div className="chip-sep">•</div>
          <div className="feature-chip">
            <span className="chip-icon">⏱️</span>
            <span>Timed Challenges</span>
          </div>
        </div>
      </div>

      <footer className="compact-footer">
      </footer>
    </div>
  );
};

export default Landing;
