import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Image as ImageIcon, Loader, ChevronLeft, Calendar, ArrowLeft } from 'lucide-react';
import '../App.css';
import './ExploreCampus.css';

interface SchoolFeed {
  id: number;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
}

export default function ExploreCampusDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [feed, setFeed] = useState<SchoolFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    if (id) {
      fetch(`http://localhost:3000/feeds/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load post details');
          return res.json();
        })
        .then(data => setFeed(data))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size={64} className="spin" style={{ color: 'var(--primary-gold)' }} />
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#ef4444', borderRadius: '24px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Oops! {error || 'Post not found'}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/explore-campus')}>Back to Feeds</button>
        </div>
      </div>
    );
  }

  const firstImage = feed.images && feed.images.length > 0 ? `http://localhost:3000${feed.images[0]}` : null;
  const otherImages = feed.images && feed.images.length > 1 ? feed.images.slice(1) : [];

  return (
    <div className="app-container">
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/heroesLogo.png" alt="Heroes Academy Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text">Heroes <span className="logo-accent">Academy</span></span>
        </div>

        <div className="nav-buttons desktop-nav">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)}>
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/apply')}>Admissions</button>
          <button className="btn btn-outline" onClick={() => navigate('/campus-gallery')}>View Campus</button>
        </div>

        <div className="mobile-nav-toggle">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)}>
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/apply')}>
              Admissions
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/campus-gallery')}>
              View Campus
            </button>
          </div>
        </div>
      )}

      {/* Detail Hero Section */}
      <section className="detail-hero">
        <div 
          className="detail-hero-bg" 
          style={{ 
            backgroundImage: `url(${firstImage || '/hero_light.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} 
        />
        <div className="detail-hero-gradient" />
        
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', zIndex: 10 }}>
          <button 
            className="back-btn" 
            onClick={() => navigate('/explore-campus')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'white', 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              marginBottom: '3rem',
              backdropFilter: 'blur(10px)',
              width: 'fit-content'
            }}
          >
            <ArrowLeft size={18} /> Back to Feeds
          </button>

          <div className="detail-hero-content" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-gold)', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
              <Calendar size={20} />
              {new Date(feed.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="detail-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
              {feed.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section section-alt" style={{ padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="glass-panel" style={{ padding: '4rem', borderRadius: '32px', position: 'relative', marginTop: '-10rem', background: 'var(--bg-darker)', backdropFilter: 'blur(30px)' }}>
            <div className="detail-body" style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--silver-light)', whiteSpace: 'pre-wrap' }}>
              {feed.content}
            </div>
            
            {/* Gallery Section */}
            {otherImages.length > 0 && (
              <div className="detail-gallery" style={{ marginTop: '5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ImageIcon size={28} style={{ color: 'var(--primary-gold)' }} /> More from this Story
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {otherImages.map((img, idx) => (
                    <div key={idx} className="gallery-item" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                      <img 
                        src={`http://localhost:3000${img}`} 
                        alt={`${feed.title} ${idx + 2}`} 
                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Heroes Academy Malawi. All rights reserved. SMIS Powered by Alphabet.
        </div>
      </footer>
    </div>
  );
}
