import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Image as ImageIcon, Loader, ChevronLeft, Calendar } from 'lucide-react';
import '../App.css';
import './ExploreCampus.css';

interface SchoolFeed {
  id: number;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
}

const FeedCard = ({ feed, onClick }: { feed: SchoolFeed, onClick: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feed.images) {
      setCurrentSlide((prev) => (prev + 1) % feed.images!.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feed.images) {
      setCurrentSlide((prev) => (prev - 1 + feed.images!.length) % feed.images!.length);
    }
  };

  const MAX_LENGTH = 150;
  const needsReadMore = feed.content.length > MAX_LENGTH;
  const displayedContent = feed.content.substring(0, MAX_LENGTH) + (needsReadMore ? '...' : '');

  return (
    <div className="premium-card" onClick={onClick}>
      {/* Image Gallery */}
      {feed.images && feed.images.length > 0 ? (
        <div className="image-slider">
          <div 
            className="image-slider-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {feed.images.map((img, idx) => (
              <div key={idx} className="image-slider-slide">
                <img 
                  src={`${import.meta.env.VITE_API_URL}${img}`} 
                  alt={`${feed.title} ${idx + 1}`} 
                  className="premium-card-image"
                />
              </div>
            ))}
          </div>

          {feed.images.length > 1 && (
            <>
              <button className="slider-btn slider-prev" onClick={prevSlide}>
                <ChevronLeft size={20} />
              </button>
              <button className="slider-btn slider-next" onClick={nextSlide}>
                <ChevronRight size={20} />
              </button>
              <div className="slider-dots">
                {feed.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ height: '200px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <ImageIcon size={48} style={{ opacity: 0.1 }} />
        </div>
      )}

      {/* Content */}
      <div className="premium-card-content">
        <div style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} />
          {new Date(feed.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h3 className="premium-card-title">{feed.title}</h3>
        <p className="premium-card-text">
          {displayedContent}
        </p>
        {needsReadMore && (
          <button className="read-more-btn" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Read Full Post <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default function ExploreCampus() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  const [feeds, setFeeds] = useState<SchoolFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    fetch(`${import.meta.env.VITE_API_URL}/feeds/public`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load campus feeds');
        return res.json();
      })
      .then(data => setFeeds(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

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

      {/* Premium Hero Section */}
      <section className="explore-hero">
        <div className="explore-hero-bg" />
        <div className="explore-hero-gradient" />
        <div className="explore-hero-content">
          <h1 className="explore-title">Explore <span className="highlight">Campus</span></h1>
          <p className="explore-subtitle">
            Immerse yourself in the vibrant life, latest events, and exciting updates straight from the heart of Heroes Academy.
          </p>
        </div>
      </section>

      {/* Feeds Grid Section */}
      <section className="section section-alt" style={{ paddingTop: '5rem' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Latest <span>Updates</span></h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-gold)', margin: '0 auto', borderRadius: '2px' }} />
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <Loader size={48} className="spin" style={{ color: 'var(--primary-gold)' }} />
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#ef4444', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Oops! Something went wrong.</h2>
              <p>{error}</p>
            </div>
          ) : feeds.length === 0 ? (
            <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
              <ImageIcon size={64} style={{ opacity: 0.15, margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.5rem' }}>No Campus Feeds Yet</h2>
              <p style={{ fontSize: '1.1rem' }}>Check back later for exciting news and updates from Heroes Academy!</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {feeds.map(feed => (
                <FeedCard 
                  key={feed.id} 
                  feed={feed} 
                  onClick={() => navigate(`/explore-campus/${feed.id}`)} 
                />
              ))}
            </div>
          )}
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
