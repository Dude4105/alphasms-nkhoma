import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Home as HomeIcon,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  BookOpen,
  Microscope,
  Monitor,
  Trophy,
  Activity,
  Heart,
  ChevronRight,
  ChevronDown,
  Award,
  Phone,
  Mail,
  FileText,
  Info,
  GraduationCap,
  Shield,
  Star,
  Quote,
  Globe,
  MessageCircle,
  Camera,
  Clock,
  Target,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Layers,
  Compass
} from 'lucide-react';
import '../App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/* ---- Animated Counter Hook ---- */
function useCountUp(target: number, duration = 2000, startCounting: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);
  return count;
}

/* ---- Scroll Reveal Hook ---- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          el.querySelectorAll('.reveal').forEach(child => child.classList.add('visible'));
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

interface GalleryItem {
  src: string;
  title: string;
  category: 'all' | 'academics' | 'students' | 'campus' | 'social' | 'events';
  desc: string;
}

export default function Home() {
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const navigate = useNavigate();
  const [isResultsPublished, setIsResultsPublished] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<'all' | 'academics' | 'students' | 'campus' | 'social' | 'events'>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'Nkhoma Secondary School',
    schoolCampus: 'Nkhoma Mission Campus, Lilongwe',
    schoolAddress: 'Nkhoma Hill, off M1 / Lilongwe East, Malawi',
    schoolPhone: '+265 (0) 1 762 300 / +265 (0) 999 123 456',
    schoolEmail: 'admissions@nkhoma.ac.mw'
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role?.toLowerCase() || '';
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'teacher') {
          navigate('/teacher', { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, infoRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/public-results/status`),
        fetch(`${import.meta.env.VITE_API_URL}/public-results/info`)
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setIsResultsPublished(data.published);
      }
      if (infoRes.ok) {
        const data = await infoRes.json();
        setSchoolInfo(prev => ({
          ...prev,
          ...data,
          schoolName: data.schoolName || prev.schoolName,
          schoolCampus: data.schoolCampus || prev.schoolCampus,
          schoolAddress: data.schoolAddress || prev.schoolAddress
        }));
      }
    } catch (err) {
      console.error('Error fetching landing page data:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Stats intersection observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const studentsCount = useCountUp(850, 2000, statsVisible);
  const teachersCount = useCountUp(45, 1500, statsVisible);
  const passRate = useCountUp(98, 2000, statsVisible);
  const yearsCount = useCountUp(50, 1200, statsVisible);

  // Reveal refs
  const aboutRef = useReveal();
  const facilitiesRef = useReveal();
  const timelineRef = useReveal();
  const galleryRef = useReveal();
  const achieveRef = useReveal();
  const enrollRef = useReveal();
  const testimonialRef = useReveal();
  const contactRef = useReveal();

  const testimonials = [
    {
      text: "Nkhoma Secondary School provided the discipline and academic foundation that propelled me to study Engineering at MUST. The science labs, dedicated teachers, and serene atmosphere are second to none in Malawi.",
      name: 'Emmanuel Chimphamba',
      role: 'Alumnus & MUST Engineering Scholar',
      initials: 'EC'
    },
    {
      text: "As a parent, seeing my daughter grow intellectually and morally in the Nkhoma boarding environment has been our family's greatest joy. The faculty mentors each student as their own child.",
      name: 'Mrs. Grace Phiri',
      role: 'Parent of Form 4 Scholar',
      initials: 'GP'
    },
    {
      text: "The student life at Nkhoma blends serious classroom rigor with sports, leadership, and cultural fellowship. We learn to lead with integrity, faith, and humility.",
      name: 'Tadala Chiphiko',
      role: 'Head Girl, Class of 2026',
      initials: 'TC'
    }
  ];

  const allGalleryItems: GalleryItem[] = [
    { src: '/nkhoma/in class.jpg', title: 'Interactive Learning', category: 'academics', desc: 'Active classroom engagement under qualified subject specialists.' },
    { src: '/nkhoma/in lab.jpg', title: 'Science Laboratory', category: 'academics', desc: 'Practical experiments in physics, chemistry, and biology.' },
    { src: '/nkhoma/in lab 2.jpg', title: 'Hands-on Experiments', category: 'academics', desc: 'Modern scientific apparatus for MANEB curriculum mastery.' },
    { src: '/nkhoma/in class2.jpg', title: 'Senior Seminar Class', category: 'academics', desc: 'Form 4 students preparing for MSCE national examinations.' },
    { src: '/nkhoma/students boys.jpg', title: 'Boys Student Cohort', category: 'students', desc: 'Disciplined scholars building character and lifelong brotherhood.' },
    { src: '/nkhoma/girls.jpg', title: 'Young Women Leaders', category: 'students', desc: 'Empowering future female leaders through STEM and arts.' },
    { src: '/nkhoma/students 3.jpg', title: 'School Assembly', category: 'students', desc: 'Morning assembly instilling values, faith, and community cohesion.' },
    { src: '/nkhoma/students 5.jpg', title: 'Class Fellowship', category: 'students', desc: 'Mutual encouragement and peer study partnerships.' },
    { src: '/nkhoma/campus.jpg', title: 'Historic Nkhoma Campus', category: 'campus', desc: 'Nestled beneath the majestic Nkhoma mountain backdrop.' },
    { src: '/nkhoma/campus 2.jpg', title: 'Academic Administration', category: 'campus', desc: 'Serene walkways connecting modern halls and lecture spaces.' },
    { src: '/nkhoma/campus 3.jpg', title: 'Central Courtyard', category: 'campus', desc: 'Clean, green campus grounds conducive for peaceful concentration.' },
    { src: '/nkhoma/nature.jpg', title: 'Campus Natural Ecosystem', category: 'campus', desc: 'Pristine mountain environment offering clean air and quiet study.' },
    { src: '/nkhoma/student social life.jpg', title: 'Recreation & Fellowship', category: 'social', desc: 'Healthy social activities and weekend extracurricular life.' },
    { src: '/nkhoma/student social life 3.jpg', title: 'Inter-House Sports', category: 'social', desc: 'Athletics, football, and physical fitness competitions.' },
    { src: '/nkhoma/student social life 7.jpg', title: 'Cultural Celebrations', category: 'social', desc: 'Music, drama, and Malawian heritage showcases.' },
    { src: '/nkhoma/student social life 8.jpg', title: 'Community Camaraderie', category: 'social', desc: 'Lifelong friendships forged across all four academic forms.' },
    { src: '/nkhoma/parents.jpg', title: 'Parent-Teacher Consultations', category: 'events', desc: 'Active partnership between educators and parents.' },
    { src: '/nkhoma/parents 2.jpg', title: 'Annual Speech Day', category: 'events', desc: 'Celebrating academic merit, discipline, and top performers.' },
    { src: '/nkhoma/visitors.jpg', title: 'University Guest Mentors', category: 'events', desc: 'Academics and professionals inspiring future career pathways.' },
    { src: '/nkhoma/visitors 4.jpg', title: 'Distinguished Visitors', category: 'events', desc: 'National education leadership engaging with our school administration.' }
  ];

  const filteredGallery = activeGalleryFilter === 'all'
    ? allGalleryItems
    : allGalleryItems.filter(item => item.category === activeGalleryFilter);

  return (
    <div className="app-container">
      {/* ===== HEADER ===== */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/NkhomaLogo.svg" alt="Nkhoma Secondary School Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text">Nkhoma <span className="logo-accent">Secondary</span></span>
        </div>
        <div className="nav-buttons desktop-nav">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)} title="Toggle Theme">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/campus-gallery')}>Gallery</button>
          <button className="btn btn-outline" onClick={() => navigate('/explore-campus')}>Campus News</button>
          <button className="btn btn-primary" onClick={() => navigate('/apply')} style={{ padding: '0.6rem 1.6rem', fontSize: '0.85rem' }}>
            Admissions
          </button>
          <span className="portal-login-btn" onClick={() => window.location.href = 'http://localhost:5174/login'}>
            SMIS Portal <ChevronRight size={16} />
          </span>
        </div>
        <div className="mobile-nav-toggle">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)} title="Toggle Theme">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ padding: '0.5rem' }} aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ display: 'block' }}>
          <div className="mobile-menu-content">
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/campus-gallery'); setIsMobileMenuOpen(false); }}>
              Campus Gallery
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/explore-campus'); setIsMobileMenuOpen(false); }}>
              Campus News & Feeds
            </button>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/apply'); setIsMobileMenuOpen(false); }}>
              Admissions
            </button>
            <div className="portal-login-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => { window.location.href = 'http://localhost:5174/login'; setIsMobileMenuOpen(false); }}>
              SMIS Portal <ChevronRight size={18} />
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/nkhoma/campus%202.jpg)', filter: 'brightness(0.65)' }} />
        <div className="hero-gradient" />
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badges">
              <span className="badge"><Award size={18} /> Top Performing MANEB School</span>
              <span className="badge"><Sparkles size={18} /> Faith & Academic Excellence</span>
              <span className="badge"><HomeIcon size={18} /> Premier Boarding & Day</span>
            </div>
            <h1 className="hero-title">
              Empowering Minds at <span className="highlight">Nkhoma Secondary School</span>
            </h1>
            <p className="hero-subtitle">
              Nestled beneath historic Nkhoma Hill in Lilongwe, Malawi. Fostering national academic distinction, advanced STEM education, and exemplary moral leadership for generations.
            </p>
            <div className="nav-buttons" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 2.2rem', fontSize: '1rem' }} onClick={() => navigate('/apply')}>
                Apply for 2026/2027
              </button>
              <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/campus-gallery')}>
                <Camera size={18} /> View Gallery
              </button>
              <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/explore-campus')}>
                Explore Campus
              </button>
              {isResultsPublished && (
                <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/exam-results')}>
                  <FileText size={18} /> Exam Results
                </button>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-glow-sphere" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(29,78,216,0.1) 60%, transparent 80%)' }} />
            <div className="hero-card-stack">
              <div className="hero-stacked-card c1">
                <img src="/nkhoma/students%20boys.jpg" alt="Scholars at Nkhoma" />
                <div className="hero-card-badge">Academic Scholars</div>
              </div>
              <div className="hero-stacked-card c2">
                <img src="/nkhoma/girls.jpg" alt="Empowered Leaders" />
                <div className="hero-card-badge">Future Leaders</div>
              </div>
              <div className="hero-stacked-card c3">
                <img src="/nkhoma/in%20class.jpg" alt="Active Learning" />
                <div className="hero-card-badge">Excellence in Action</div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll Down</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ===== STATS COUNTER BAR ===== */}
      <div className="stats-bar" ref={statsRef}>
        <div className="stats-bar-inner">
          <div className="stat-item">
            <div className="stat-icon"><Users size={22} /></div>
            <div className="stat-number">{studentsCount}+</div>
            <div className="stat-label">Students Enrolled</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><GraduationCap size={22} /></div>
            <div className="stat-number">{teachersCount}+</div>
            <div className="stat-label">Qualified Teachers</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Target size={22} /></div>
            <div className="stat-number">{passRate}%</div>
            <div className="stat-label">MSCE Pass Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Clock size={22} /></div>
            <div className="stat-number">{yearsCount}+</div>
            <div className="stat-label">Years of Heritage</div>
          </div>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <section className="about-section" ref={aboutRef}>
        <div className="about-grid reveal">
          <div className="about-text-col">
            <span className="about-label">About Nkhoma Secondary</span>
            <h2 className="about-title">
              A Proud Tradition of <span>Academic Leadership</span> & Integrity
            </h2>
            <p className="about-desc">
              Situated in the historic mission hub of Nkhoma, Lilongwe, Nkhoma Secondary School is one of Malawi's premier educational institutions. Built on the enduring foundations of Christian ethics, intellectual curiosity, and self-discipline, we prepare young men and women to conquer the challenges of tomorrow.
            </p>
            <p className="about-desc">
              Our scenic hill campus offers a peaceful sanctuary shielded from city distractions, where students immerse themselves in rigorous academics, modern laboratory practicals, and vibrant student community life.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon"><Shield size={18} /></div>
                Disciplined Environment
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><BookOpen size={18} /></div>
                MANEB & STEM Focus
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><Users size={18} /></div>
                Dedicated Faculty Mentorship
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><Star size={18} /></div>
                Character & Faith Formation
              </div>
            </div>
          </div>
          <div className="about-image-col">
            <img src="/nkhoma/campus%203.jpg" alt="Nkhoma Campus Grounds" className="about-img-main" />
            <img src="/nkhoma/in%20class2.jpg" alt="Students in Classroom" className="about-img-secondary" />
            <div className="about-accent-box" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)' }}>
              <div className="about-accent-number" style={{ color: '#FFFFFF' }}>10-14</div>
              <div className="about-accent-label" style={{ color: '#E2E8F0' }}>Points MSCE<br />Top Honours</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACILITIES BENTO GRID ===== */}
      <section className="facilities-section" ref={facilitiesRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">World-Class <span>Campus Facilities</span></h2>
            <p className="section-subtitle">
              Designed to stimulate curiosity, support practical STEM mastery, and provide a healthy home away from home.
            </p>
          </div>
          <div className="bento-grid">
            <div className="bento-card large">
              <div className="bento-card-image-wrap">
                <img src="/nkhoma/in%20lab.jpg" alt="Science Laboratory" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Microscope size={24} /></div>
                <h3 className="bento-card-title">Science Laboratories</h3>
                <p className="bento-card-text">
                  Fully equipped Physics, Chemistry, and Biology laboratories allowing students to conduct direct hands-on experimental research and excel in MANEB practical examinations.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-image-wrap">
                <img src="/nkhoma/in%20class.jpg" alt="Modern Classrooms" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Monitor size={24} /></div>
                <h3 className="bento-card-title">Digital ICT & Libraries</h3>
                <p className="bento-card-text">
                  Dedicated computer rooms and comprehensive reading libraries equipped with contemporary textbooks, digital learning tools, and quiet study carrels.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-image-wrap">
                <img src="/nkhoma/boys.jpg" alt="Boarding Facilities" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><HomeIcon size={24} /></div>
                <h3 className="bento-card-title">Boarding Hostels</h3>
                <p className="bento-card-text">
                  Secure, well-maintained separate hostels for boys and girls with resident wardens, steady utilities, nutritious meals, and disciplined night-prep routines.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-image-wrap">
                <img src="/nkhoma/nature.jpg" alt="Scenic Mountain Campus" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Compass size={24} /></div>
                <h3 className="bento-card-title">Scenic Mountain Setting</h3>
                <p className="bento-card-text">
                  A tranquil hill environment providing fresh air, panoramic natural vistas, and an atmosphere deeply conducive to study and reflection.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-image-wrap">
                <img src="/nkhoma/student%20social%20life%202.jpg" alt="Sports Grounds" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Activity size={24} /></div>
                <h3 className="bento-card-title">Sports & Extracurriculars</h3>
                <p className="bento-card-text">
                  Spacious football pitches, netball courts, debate society, SCOM, choir, and wildlife clubs nurturing diverse talents outside the lecture halls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACADEMIC TIMELINE ===== */}
      <section className="academic-section" ref={timelineRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">Academic <span>Journey</span> (Form 1 - Form 4)</h2>
            <p className="section-subtitle">
              A structured four-year pathway aligned with the Malawi National Examinations Board (MANEB) curriculum.
            </p>
          </div>
          <div className="timeline-container">
            {[
              { form: 'Form 1', desc: 'Orientation, discipline, and grounding in physical sciences, mathematics, humanities, and languages.', highlight: false, exam: null },
              { form: 'Form 2', desc: 'Comprehensive consolidation and preparation for the Junior Certificate of Education (JCE).', highlight: true, exam: 'JCE' },
              { form: 'Form 3', desc: 'Specialized subject selection, advanced STEM practicals, and university career mapping.', highlight: false, exam: null },
              { form: 'Form 4', desc: 'Mastery mock exams and national MSCE certification with intensive university entrance prep.', highlight: true, exam: 'MSCE' },
            ].map((item, i) => (
              <div key={i} className={`timeline-step ${item.highlight ? 'highlight' : ''}`}>
                <div className="timeline-node" style={{ background: item.highlight ? '#2563EB' : 'var(--glass-bg)', borderColor: item.highlight ? '#38BDF8' : 'var(--glass-border)' }}>
                  <BookOpen size={24} style={{ color: item.highlight ? '#FFFFFF' : 'var(--primary-blue)' }} />
                </div>
                {i < 3 && <div className={`timeline-connector ${item.highlight ? 'active' : ''}`} />}
                <div>
                  <div className="timeline-form-name">{item.form}</div>
                  {item.exam && <span className="timeline-exam-badge" style={{ background: '#2563EB', color: '#FFFFFF' }}>{item.exam} Examination</span>}
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Subjects Offered</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '1rem', maxWidth: '850px', margin: '1rem auto 0' }}>
              {['Mathematics', 'Physical Science', 'Biology', 'English Language', 'Chichewa', 'Geography', 'History', 'Social Studies', 'Agriculture', 'Computer Studies', 'Bible Knowledge'].map((sub, idx) => (
                <span key={idx} style={{ padding: '0.4rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50px', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE CAMPUS GALLERY WITH FILTERS & LIGHTBOX ===== */}
      <section className="campus-life-section" ref={galleryRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">Life at <span>Nkhoma</span> (Campus Gallery)</h2>
            <p className="section-subtitle">
              Authentic glimpses into our classrooms, laboratories, boarding community, and memorable school events.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="gallery-filter-bar">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'academics', label: 'Classrooms & Labs' },
              { id: 'students', label: 'Student Body' },
              { id: 'campus', label: 'Campus & Nature' },
              { id: 'social', label: 'Sports & Social' },
              { id: 'events', label: 'PTA & Visitors' },
            ].map(f => (
              <button
                key={f.id}
                className={`gallery-filter-btn ${activeGalleryFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveGalleryFilter(f.id as any)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Interactive Card Grid */}
          <div className="interactive-gallery-grid">
            {filteredGallery.map((item, i) => (
              <div key={i} className="interactive-gallery-card" onClick={() => setLightboxItem(item)}>
                <img src={item.src} alt={item.title} loading="lazy" />
                <span className="gallery-card-badge">
                  <Camera size={12} /> {item.category}
                </span>
                <div className="gallery-card-overlay">
                  <div className="gallery-card-title">{item.title}</div>
                  <div className="gallery-card-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn btn-outline" style={{ display: 'inline-flex', margin: '0 auto' }} onClick={() => navigate('/campus-gallery')}>
              Open Full 35-Photo Campus Gallery <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== LIGHTBOX MODAL ===== */}
      {lightboxItem && (
        <div className="lightbox-backdrop" onClick={() => setLightboxItem(null)}>
          <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setLightboxItem(null)}>
              <X size={22} />
            </button>
            <div className="lightbox-img-wrap">
              <img src={lightboxItem.src} alt={lightboxItem.title} />
            </div>
            <div className="lightbox-details">
              <div>
                <h3 style={{ color: 'var(--text-light)', fontSize: '1.25rem', fontWeight: 700 }}>{lightboxItem.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{lightboxItem.desc}</p>
              </div>
              <span className="gallery-card-badge" style={{ position: 'static' }}>
                {lightboxItem.category}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== ACHIEVEMENT BANNER ===== */}
      <section className="achievement-section" ref={achieveRef}>
        <div className="reveal">
          <div className="achievement-banner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', textAlign: 'left', maxWidth: '1100px' }}>
            <div className="achievement-content" style={{ textAlign: 'left' }}>
              <div className="achievement-icon" style={{ justifyContent: 'flex-start', color: '#38BDF8' }}><Trophy size={48} /></div>
              <div className="achievement-number" style={{ color: '#FFFFFF' }}>10 Points</div>
              <div className="achievement-text">MSCE National Distinction</div>
              <div className="achievement-subtext">
                Nkhoma scholars consistently attain outstanding results in the Malawi School Certificate of Education (MSCE). Over 60 candidates earned direct public university selection in 2025 across UNIMA, MUST, LUANAR, MUBAS, and MZUNI.
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} onClick={() => navigate('/apply')}>
                  Apply for Admission
                </button>
                {isResultsPublished && (
                  <button className="btn btn-outline" style={{ padding: '0.8rem 2rem' }} onClick={() => navigate('/exam-results')}>
                    <FileText size={18} /> View Results
                  </button>
                )}
              </div>
            </div>
            <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(96,165,250,0.3)', maxHeight: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <img src="/nkhoma/students%20girls.jpg" alt="Top Performing Scholars" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ENROLLMENT CTA ===== */}
      <section className="enroll-cta" ref={enrollRef}>
        <div className="reveal">
          <div className="enroll-cta-inner" style={{ border: '1px solid rgba(96,165,250,0.25)', background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(8,13,26,0.95) 100%)' }}>
            <div className="enroll-cta-text">
              <h2>Enroll with <span>Nkhoma Secondary</span> Today</h2>
              <p>
                Applications are now being received for Form 1 through Form 4 for the 2026/2027 academic session. Join an institution celebrated for academic brilliance, student safety, and moral integrity.
              </p>
              <div className="enroll-cta-features">
                <div className="enroll-feature"><HomeIcon size={18} style={{ color: '#38BDF8' }} /> Boarding & Day Options Available</div>
                <div className="enroll-feature"><Microscope size={18} style={{ color: '#38BDF8' }} /> Fully Outfitted Physics & Chem Labs</div>
                <div className="enroll-feature"><GraduationCap size={18} style={{ color: '#38BDF8' }} /> Seasoned Education Faculty</div>
                <div className="enroll-feature"><Star size={18} style={{ color: '#38BDF8' }} /> Proven University Placement Record</div>
              </div>
              <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }} onClick={() => navigate('/apply')}>
                Start Online Application <ChevronRight size={18} />
              </button>
            </div>
            <div className="enroll-cta-images">
              <div className="enroll-img-wrap" style={{ border: '1px solid rgba(96,165,250,0.3)' }}>
                <img src="/nkhoma/in%20class.jpg" alt="Classroom Life" />
              </div>
              <div className="enroll-img-wrap" style={{ border: '1px solid rgba(96,165,250,0.3)' }}>
                <img src="/nkhoma/students%203.jpg" alt="Student Body" />
              </div>
              <div className="enroll-img-wrap" style={{ border: '1px solid rgba(96,165,250,0.3)' }}>
                <img src="/nkhoma/parents%202.jpg" alt="Graduation Day" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section" ref={testimonialRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">What Our <span>Community</span> Says</h2>
            <p className="section-subtitle">
              Hear from graduates, parents, and student leaders about their Nkhoma Secondary School experience.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card" style={{ border: '1px solid var(--glass-border)' }}>
                <div className="testimonial-quote-icon" style={{ color: '#38BDF8' }}><Quote size={32} /></div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFF' }}>{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOCATION & CONTACT ===== */}
      <section className="contact-section" ref={contactRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">Visit & <span>Contact Us</span></h2>
            <p className="section-subtitle">
              Located at the historic Nkhoma Mission in Lilongwe, easily accessible via the M1 Lilongwe East junction.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card" style={{ border: '1px solid var(--glass-border)' }}>
              <div className="contact-item">
                <div className="contact-item-icon" style={{ color: '#38BDF8' }}><MapPin size={22} /></div>
                <div className="contact-item-text">
                  <h4>Campus Location</h4>
                  <p>{schoolInfo.schoolCampus}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon" style={{ color: '#38BDF8' }}><Info size={22} /></div>
                <div className="contact-item-text">
                  <h4>Postal Address</h4>
                  <p>Nkhoma Secondary School, P.O. Box 48, Nkhoma, Lilongwe, Malawi</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon" style={{ color: '#38BDF8' }}><Phone size={22} /></div>
                <div className="contact-item-text">
                  <h4>Admissions Hotline</h4>
                  <p>{schoolInfo.schoolPhone}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon" style={{ color: '#38BDF8' }}><Mail size={22} /></div>
                <div className="contact-item-text">
                  <h4>Official Email</h4>
                  <p>{schoolInfo.schoolEmail}</p>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '0.8rem', alignSelf: 'flex-start' }} onClick={() => navigate('/apply')}>
                Submit Admission Form <ChevronRight size={18} />
              </button>
            </div>
            <div className="contact-map-wrap" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <MapContainer
                center={[-14.0435, 34.0538]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', minHeight: '400px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[-14.0435, 34.0538]}>
                  <Popup>
                    <strong>Nkhoma Secondary School</strong><br />Nkhoma Mission, Lilongwe, Malawi.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/NkhomaLogo.svg" alt="Nkhoma Secondary School Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              Nkhoma Secondary School
            </h3>
            <p>Cultivating academic leaders through intellectual rigor, moral values, and state-of-the-art STEM facilities since inception. Shaping the next generation of Malawi's leaders.</p>
            <div className="social-links">
              <div className="footer-social-icon"><Globe size={18} /></div>
              <div className="footer-social-icon"><MessageCircle size={18} /></div>
              <div className="footer-social-icon"><Camera size={18} /></div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Direct Contacts</h4>
            <p><MapPin size={18} /> {schoolInfo.schoolCampus}</p>
            <p><Info size={18} /> P.O. Box 48, Nkhoma, Malawi</p>
            <p><Phone size={18} /> {schoolInfo.schoolPhone}</p>
            <p><Mail size={18} /> {schoolInfo.schoolEmail}</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <p className="footer-link" onClick={() => navigate('/apply')}>Admissions Application</p>
            <p className="footer-link" onClick={() => navigate('/campus-gallery')}>Campus Gallery (35 Photos)</p>
            <p className="footer-link" onClick={() => navigate('/explore-campus')}>Campus News & Announcements</p>
            <p className="footer-link" onClick={() => window.location.href = 'http://localhost:5174/login'}>SMIS Staff & Student Portal</p>
            {isResultsPublished && (
              <p className="footer-link" style={{ color: '#38BDF8', fontWeight: 600 }} onClick={() => navigate('/exam-results')}>MSCE Exam Results</p>
            )}
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Nkhoma Secondary School, Lilongwe, Malawi. All rights reserved. Powered by Alphabet SMIS.
        </div>
      </footer>
    </div>
  );
}
