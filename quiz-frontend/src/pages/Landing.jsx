import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="testportal-wrapper">
      {/* 1. Top Navigation Bar (Exact Testportal Layout: Logo Left, Links Center, Actions Right) */}
      <header className="testportal-topbar">
        {/* Left: Brand Logo */}
        <Link to="/" className="topbar-brand">
          <div className="topbar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="topbar-logo-text">quizportal</span>
        </Link>

        {/* Center navigation links removed as requested */}

        {/* Right: Language & Auth Action Buttons */}
        <div className="topbar-actions-right">
          <div className="topbar-lang-pill">
            <span>EN</span>
            <span style={{ fontSize: '0.7rem' }}>▼</span>
          </div>

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-topbar-signup">
              Dashboard ➔
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-topbar-login">
                Login
              </Link>
              <Link to="/register" className="btn-topbar-signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Section (Deep Blue with Angled Floating Glow Pills & Pastel Blue CTA) */}
      <section className="testportal-hero">
        {/* Iconic Angled Floating Capsules in Shades of Blue */}
        <div className="hero-capsules-bg">
          <div className="capsule capsule-1"></div>
          <div className="capsule capsule-2"></div>
          <div className="capsule capsule-3"></div>
          <div className="capsule capsule-4"></div>
        </div>

        {/* Hero Content Stage */}
        <div className="hero-stage-center">
          {/* Main Headline */}
          <h1 className="hero-headline">
            Make <span className="highlight-sky">skills and knowledge</span> quizzes for everyone
          </h1>

          {/* Subtitle */}
          <p className="hero-subtext">
            Actionable insights. Smart proctoring. Choose a professional quiz software that covers all the bases.
          </p>

          {/* Signature Pastel Blue CTA Button */}
          <div className="hero-cta-box">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-pastel-cta">
                Go to your dashboard ➔
              </Link>
            ) : (
              <Link to="/register" className="btn-pastel-cta">
                <b>Get Started</b>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
