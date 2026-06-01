import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, ChevronRight, Image as ImageIcon, Loader, ArrowLeft, Maximize2 } from 'lucide-react';
import '../App.css';
import './ExploreCampus.css'; // Reuse some of the premium styles

interface GalleryItem {
  id: number;
  title?: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
}

export default function CampusGallery() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    fetch(`${import.meta.env.VITE_API_URL}/gallery`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load gallery');
        return res.json();
      })
      .then(json => setItems(Array.isArray(json) ? json : json.data ?? []))
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
          <button className="btn btn-outline" onClick={() => navigate('/explore-campus')}>Explore Feeds</button>
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
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/explore-campus')}>
              Explore Feeds
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="explore-hero" style={{ minHeight: '40vh' }}>
        <div className="explore-hero-bg" style={{ filter: 'brightness(0.4)' }} />
        <div className="explore-hero-gradient" />
        <div className="explore-hero-content">
          <h1 className="explore-title">Campus <span className="highlight">Gallery</span></h1>
          <p className="explore-subtitle">
            A visual journey through the heart of Heroes Academy. Experience our state-of-the-art facilities and vibrant atmosphere.
          </p>
        </div>
      </section>

      {/* Gallery Grid Section */}
      <section className="section section-alt" style={{ paddingTop: '5rem' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Visual <span>Showcase</span></h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-gold)', margin: '0 auto', borderRadius: '2px' }} />
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <Loader size={48} className="spin" style={{ color: 'var(--primary-gold)' }} />
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: '#ef4444', borderRadius: '24px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Oops! {error}</h2>
            </div>
          ) : items.length === 0 ? (
            <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '24px' }}>
              <ImageIcon size={64} style={{ opacity: 0.15, margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.5rem' }}>The Gallery is Empty</h2>
              <p style={{ fontSize: '1.1rem' }}>We are capturing some beautiful moments. Check back soon!</p>
            </div>
          ) : (
            <div className="masonry-grid" style={{ columnCount: items.length < 3 ? items.length : 3 }}>
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="premium-card" 
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="premium-card-image-wrap">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} 
                      alt={item.title || 'Campus Photo'} 
                      className="premium-card-image"
                      style={{ height: 'auto', maxHeight: '600px' }}
                    />
                    <div className="gallery-overlay" style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.5rem',
                      color: 'white'
                    }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                        <Maximize2 size={14} /> Click to enlarge
                      </div>
                    </div>
                  </div>
                  {/* For accessibility and SEO */}
                  <div className="sr-only">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="post-modal-overlay" 
          onClick={() => setSelectedImage(null)}
          style={{ opacity: 1 }} // Force visibility as it uses animation
        >
          <div className="post-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <button className="post-modal-close" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <div className="post-modal-content" style={{ overflow: 'hidden', textAlign: 'center' }}>
              <img 
                src={`${import.meta.env.VITE_API_URL}${selectedImage.imageUrl}`} 
                alt={selectedImage.title} 
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} 
              />
              {(selectedImage.title || selectedImage.description) && (
                <div style={{ 
                  marginTop: '2rem', 
                  padding: '2rem', 
                  background: 'var(--bg-darker)', 
                  borderRadius: '24px', 
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'left',
                  maxWidth: '800px',
                  margin: '2rem auto 0'
                }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1rem' }}>{selectedImage.title}</h2>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--silver-light)' }}>{selectedImage.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <footer className="footer">
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Heroes Academy Malawi. All rights reserved. SMIS Powered by Alphabet.
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .premium-card:hover .gallery-overlay {
          opacity: 1;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}} />
    </div>
  );
}
