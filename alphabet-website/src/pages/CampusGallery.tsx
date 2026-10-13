import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, Menu, X, ChevronRight, Image as ImageIcon, ArrowLeft, 
  Maximize2, ChevronLeft, Camera, Home, BookOpen, Users, Compass, Trophy 
} from 'lucide-react';
import '../App.css';
import './ExploreCampus.css';

interface GalleryPhoto {
  id: string | number;
  title: string;
  category: 'academics' | 'students' | 'campus' | 'social' | 'events';
  description: string;
  imageUrl: string;
}

const nkhomaCuratedPhotos: GalleryPhoto[] = [
  // Academics & Labs
  { id: 'n1', title: 'Interactive Lecture Session', category: 'academics', description: 'Students engaged in subject discussion and focused classroom study.', imageUrl: '/nkhoma/in class.jpg' },
  { id: 'n2', title: 'Senior Seminar Class', category: 'academics', description: 'Form 4 students preparing for MSCE national exams.', imageUrl: '/nkhoma/in class2.jpg' },
  { id: 'n3', title: 'Science Laboratory Practicals', category: 'academics', description: 'Biology, chemistry and physics hands-on experiment stations.', imageUrl: '/nkhoma/in lab.jpg' },
  { id: 'n4', title: 'Scientific Apparatus Work', category: 'academics', description: 'Students carrying out titration and analytical science work.', imageUrl: '/nkhoma/in lab 2.jpg' },

  // Campus & Nature
  { id: 'n5', title: 'Panoramic Campus Overview', category: 'campus', description: 'Aerial landscape of Nkhoma Secondary School nestled under Nkhoma Hill.', imageUrl: '/nkhoma/campus.jpg' },
  { id: 'n6', title: 'Administrative & Academic Quad', category: 'campus', description: 'Tree-lined pathways and central assembly grounds.', imageUrl: '/nkhoma/campus 2.jpg' },
  { id: 'n7', title: 'Main Classroom Blocks', category: 'campus', description: 'Spacious, well-ventilated learning blocks and study halls.', imageUrl: '/nkhoma/campus 3.jpg' },
  { id: 'n8', title: 'Serene Mountain Ecosystem', category: 'campus', description: 'Clean fresh mountain air and natural flora around Nkhoma Mission.', imageUrl: '/nkhoma/nature.jpg' },

  // Student Life
  { id: 'n9', title: 'Boys Student Fellowship', category: 'students', description: 'Disciplined scholars building lifelong camaraderie.', imageUrl: '/nkhoma/boys.jpg' },
  { id: 'n10', title: 'Senior Boys Cohort', category: 'students', description: 'Young men aspiring for university admission in science and arts.', imageUrl: '/nkhoma/bpys.jpg' },
  { id: 'n11', title: 'Empowered Young Women', category: 'students', description: 'Female scholars taking leadership roles in STEM and governance.', imageUrl: '/nkhoma/girls.jpg' },
  { id: 'n12', title: 'Morning Campus Assembly', category: 'students', description: 'Unity, devotion, and morning announcements on the quad.', imageUrl: '/nkhoma/students1.jpg' },
  { id: 'n13', title: 'Student Leaders Council', category: 'students', description: 'Prefects and class captains coordinating school activities.', imageUrl: '/nkhoma/students 3.jpg' },
  { id: 'n14', title: 'Form Cohort Unity', category: 'students', description: 'Encouraging academic peer support and study circles.', imageUrl: '/nkhoma/students 4.jpg' },
  { id: 'n15', title: 'Milestone Student Gathering', category: 'students', description: 'Celebrating academic term milestones and merit badges.', imageUrl: '/nkhoma/students 5.jpg' },
  { id: 'n16', title: 'Classmates & Friends', category: 'students', description: 'Mutual respect and supportive community living in boarding.', imageUrl: '/nkhoma/students 6.jpg' },
  { id: 'n17', title: 'Boys Leadership Assembly', category: 'students', description: 'Character formation and peer mentoring sessions.', imageUrl: '/nkhoma/students boys.jpg' },
  { id: 'n18', title: 'Girls Academy Excellence', category: 'students', description: 'Inspirational young scholars excelling academically.', imageUrl: '/nkhoma/students girls.jpg' },

  // Sports & Social Life
  { id: 'n19', title: 'Recreation & Fun', category: 'social', description: 'Unwinding after intensive study sessions on campus.', imageUrl: '/nkhoma/student social life.jpg' },
  { id: 'n20', title: 'Athletics & Physical Fitness', category: 'social', description: 'Competitive inter-house sports and track practice.', imageUrl: '/nkhoma/student social life 2.jpg' },
  { id: 'n21', title: 'Football & Team Sports', category: 'social', description: 'Nkhoma team spirit in friendly and regional competitions.', imageUrl: '/nkhoma/student social life 3.jpg' },
  { id: 'n22', title: 'Weekend Fellowship Group', category: 'social', description: 'Student Christian Organization (SCOM) and music ministry.', imageUrl: '/nkhoma/student social life 4.jpg' },
  { id: 'n23', title: 'Campus Social Gathering', category: 'social', description: 'Lively discussions and peer mentorship circles.', imageUrl: '/nkhoma/student social life 5.jpg' },
  { id: 'n24', title: 'Dormitory Bonding', category: 'social', description: 'Friendship and mutual support in boarding hostels.', imageUrl: '/nkhoma/student social life 6.jpg' },
  { id: 'n25', title: 'Cultural Celebrations', category: 'social', description: 'Preserving and performing traditional heritage and arts.', imageUrl: '/nkhoma/student social life 7.jpg' },
  { id: 'n26', title: 'Music & Creative Arts', category: 'social', description: 'Choir practice and creative expression on campus.', imageUrl: '/nkhoma/student social life 8.jpg' },
  { id: 'n27', title: 'Debate & Public Speaking', category: 'social', description: 'Honing eloquence, critical thinking, and civic leadership.', imageUrl: '/nkhoma/student social life 9.jpg' },

  // Events, PTA & Visitors
  { id: 'n28', title: 'Parents-Teachers Association (PTA)', category: 'events', description: 'Collaborative partnership supporting school developments.', imageUrl: '/nkhoma/parents.jpg' },
  { id: 'n29', title: 'Speech Day & Awards', category: 'events', description: 'Parents and teachers celebrating student excellence.', imageUrl: '/nkhoma/parents 2.jpg' },
  { id: 'n30', title: 'Graduation Day Celebration', category: 'events', description: 'Honoring outgoing Form 4 MSCE candidates.', imageUrl: '/nkhoma/parents 4.jpg' },
  { id: 'n31', title: 'University Guest Lecturers', category: 'events', description: 'Mentors from UNIMA and MUST inspiring senior scholars.', imageUrl: '/nkhoma/visitors.jpg' },
  { id: 'n32', title: 'Ministry of Education Visit', category: 'events', description: 'Educational inspectors evaluating academic excellence.', imageUrl: '/nkhoma/visitors 3.jpg' },
  { id: 'n33', title: 'Community Leaders Assembly', category: 'events', description: 'Nkhoma elders and alumni supporting the institution.', imageUrl: '/nkhoma/visitors 4.jpg' },
  { id: 'n34', title: 'Alumni Mentorship Weekend', category: 'events', description: 'Notable alumni returning to give back to the school.', imageUrl: '/nkhoma/visitors 5.jpg' },
  { id: 'n35', title: 'Visiting Day Joy', category: 'events', description: 'Families connecting with their children on scheduled visiting day.', imageUrl: '/nkhoma/vistors.jpg' },
];

export default function CampusGallery() {
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'academics' | 'students' | 'campus' | 'social' | 'events'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>(nkhomaCuratedPhotos);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also fetch dynamic uploads from backend if available
    fetch(`${import.meta.env.VITE_API_URL}/gallery`)
      .then(res => res.ok ? res.json() : [])
      .then(json => {
        const dynamicItems = Array.isArray(json) ? json : json.data ?? [];
        if (dynamicItems.length > 0) {
          const mappedDynamic: GalleryPhoto[] = dynamicItems.map((item: any) => ({
            id: item.id,
            title: item.title || 'Campus Moment',
            category: 'campus',
            description: item.description || '',
            imageUrl: `${import.meta.env.VITE_API_URL}${item.imageUrl}`
          }));
          setAllPhotos([...mappedDynamic, ...nkhomaCuratedPhotos]);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const filtered = activeFilter === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.category === activeFilter);

  const currentPhoto = selectedPhotoIndex !== null ? filtered[selectedPhotoIndex] : null;

  const nextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % filtered.length);
    }
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + filtered.length) % filtered.length);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/NkhomaLogo.svg" alt="Nkhoma Secondary School" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text">Nkhoma <span className="logo-accent">Secondary</span></span>
        </div>

        <div className="nav-buttons desktop-nav">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)} title="Toggle Theme">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Home</button>
          <button className="btn btn-outline" onClick={() => navigate('/explore-campus')}>Campus News</button>
          <button className="btn btn-primary" onClick={() => navigate('/apply')} style={{ padding: '0.6rem 1.6rem', fontSize: '0.85rem' }}>
            Admissions
          </button>
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
        <div className="mobile-menu" style={{ display: 'block' }}>
          <div className="mobile-menu-content">
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/')}>
              Home
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/explore-campus')}>
              Campus News & Feeds
            </button>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/apply')}>
              Apply for Admission
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="explore-hero" style={{ minHeight: '45vh', backgroundImage: 'none' }}>
        <div className="explore-hero-bg" style={{ backgroundImage: 'url(/nkhoma/campus%202.jpg)', filter: 'brightness(0.55)' }} />
        <div className="explore-hero-gradient" />
        <div className="explore-hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.3)', padding: '0.4rem 1.2rem', borderRadius: '50px', color: '#38BDF8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Camera size={16} /> Authentic Photo Archive (35 Photos)
          </div>
          <h1 className="explore-title">Nkhoma Campus <span className="highlight">Gallery</span></h1>
          <p className="explore-subtitle">
            Explore our state-of-the-art laboratories, serene mountain grounds, cohesive boarding community, and memorable school events.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section section-alt" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 2rem' }}>
          
          {/* Category Filter Chips */}
          <div className="gallery-filter-bar">
            {[
              { id: 'all', label: `All Photos (${allPhotos.length})` },
              { id: 'academics', label: 'Classrooms & Labs (4)' },
              { id: 'students', label: 'Student Body (10)' },
              { id: 'campus', label: 'Campus & Nature (4)' },
              { id: 'social', label: 'Sports & Social (9)' },
              { id: 'events', label: 'PTA & Visitors (8)' },
            ].map(f => (
              <button
                key={f.id}
                className={`gallery-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id as any)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          <div className="interactive-gallery-grid">
            {filtered.map((photo, idx) => (
              <div 
                key={photo.id} 
                className="interactive-gallery-card"
                onClick={() => setSelectedPhotoIndex(idx)}
              >
                <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
                <span className="gallery-card-badge">
                  <Camera size={12} /> {photo.category}
                </span>
                <div className="gallery-card-overlay">
                  <div className="gallery-card-title">{photo.title}</div>
                  <div className="gallery-card-desc">{photo.description}</div>
                  <span style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Click to enlarge <Maximize2 size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {currentPhoto && (
        <div className="lightbox-backdrop" onClick={() => setSelectedPhotoIndex(null)}>
          <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setSelectedPhotoIndex(null)}>
              <X size={22} />
            </button>
            
            <div className="lightbox-img-wrap" style={{ position: 'relative' }}>
              <img src={currentPhoto.imageUrl} alt={currentPhoto.title} />
              
              {/* Prev / Next Arrows */}
              <button 
                onClick={prevPhoto}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(8,13,26,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Previous Image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextPhoto}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(8,13,26,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Next Image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="lightbox-details">
              <div>
                <h3 style={{ color: 'var(--text-light)', fontSize: '1.3rem', fontWeight: 700 }}>{currentPhoto.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{currentPhoto.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="gallery-card-badge" style={{ position: 'static' }}>
                  {currentPhoto.category}
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  {selectedPhotoIndex! + 1} of {filtered.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/NkhomaLogo.svg" alt="Nkhoma Secondary School" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              Nkhoma Secondary School
            </h3>
            <p>Cultivating academic leaders through intellectual rigor, moral values, and modern facilities. Nkhoma Mission, Lilongwe, Malawi.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <p className="footer-link" onClick={() => navigate('/')}>Home</p>
            <p className="footer-link" onClick={() => navigate('/apply')}>Admissions Form</p>
            <p className="footer-link" onClick={() => navigate('/explore-campus')}>Campus News</p>
            <p className="footer-link" onClick={() => window.location.href = 'http://localhost:5174/login'}>SMIS Portal</p>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Nkhoma Secondary School, Lilongwe, Malawi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
