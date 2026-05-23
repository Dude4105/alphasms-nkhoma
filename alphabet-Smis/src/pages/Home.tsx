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
  Sparkles
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
          // Also reveal any child elements with the .reveal class
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

export default function Home() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const navigate = useNavigate();
  const [isResultsPublished, setIsResultsPublished] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'Heroes Academy',
    schoolCampus: 'Kudya Township, Blantyre',
    schoolAddress: 'Off Zingwangwa, Near Kudya Filling Station',
    schoolPhone: '+265 (0) 123 456 789',
    schoolEmail: 'admissions@heroesacademy.mw'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statusRes, infoRes] = await Promise.all([
        fetch('http://localhost:3000/public-results/status'),
        fetch('http://localhost:3000/public-results/info')
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setIsResultsPublished(data.published);
      }
      if (infoRes.ok) {
        const data = await infoRes.json();
        setSchoolInfo(prev => ({ ...prev, ...data }));
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

  const studentsCount = useCountUp(500, 2000, statsVisible);
  const teachersCount = useCountUp(30, 1500, statsVisible);
  const passRate = useCountUp(95, 2000, statsVisible);
  const yearsCount = useCountUp(5, 1200, statsVisible);

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
      text: "Heroes Academy transformed my child's academic journey. The teachers are dedicated and the environment is truly nurturing. My daughter went from struggling to becoming top of her class.",
      name: 'Mrs. Grace Phiri',
      role: 'Parent of Form 3 Student',
      initials: 'GP'
    },
    {
      text: "The boarding facilities are excellent and the school feels like a second home. I've grown not just academically but as a person. The science lab is amazing for practical experiments.",
      name: 'James Banda',
      role: 'Form 4 Student',
      initials: 'JB'
    },
    {
      text: "We chose Heroes Academy for the holistic approach to education. Our son excels in sports and academics equally. The 10-point MSCE achievement speaks for itself.",
      name: 'Mr. Kondwani Mwale',
      role: 'Parent of MSCE Graduate',
      initials: 'KM'
    }
  ];

  const galleryItems = [
    { src: '/home/visiting day.jpg', label: 'Visiting Day' },
    { src: '/home/student social.jpg', label: 'Student Social Life' },
    { src: '/home/acadymic life.jpg', label: 'Academic Life' },
    { src: '/home/student social3.jpg', label: 'Campus Community' },
    { src: '/home/student social2.jpg', label: 'Friendship & Fun' },
    { src: '/home/student social4.jpg', label: 'Cultural Events' }
  ];

  return (
    <div className="app-container">
      {/* ===== HEADER ===== */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <img src="/heroesLogo.png" alt="Heroes Academy Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text">Heroes <span className="logo-accent">Academy</span></span>
        </div>
        <div className="nav-buttons desktop-nav">
          <button className="btn btn-outline theme-toggle" onClick={() => setIsLightMode(!isLightMode)} title="Toggle Theme">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/apply')}>Admissions</button>
          <span className="portal-login-btn" onClick={() => navigate('/login')}>
            Portal Login <ChevronRight size={16} />
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
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/apply'); setIsMobileMenuOpen(false); }}>
              Admissions
            </button>
            <div className="portal-login-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
              Portal Login <ChevronRight size={18} />
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/hero_light.jpg)' }} />
        <div className="hero-gradient" />
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badges">
              <span className="badge"><Award size={18} /> Top Ranked 2025</span>
              <span className="badge"><Sparkles size={18} /> Hope & Excellence</span>
              <span className="badge"><HomeIcon size={18} /> Boarding & Day</span>
            </div>
            <h1 className="hero-title">
              Empowering the Future at <span className="highlight">Heroes Academy</span>
            </h1>
            <p className="hero-subtitle">
              A modern secondary school built in the heart of Blantyre, Malawi.
              Fostering academic excellence, trust, and a brighter tomorrow for every student.
            </p>
            <div className="nav-buttons" style={{ justifyContent: 'flex-start' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/apply')}>
                Apply Now
              </button>
              {isResultsPublished && (
                <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/exam-results')}>
                  <FileText size={20} /> Exam Results
                </button>
              )}
              <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/explore-campus')}>
                Explore Campus
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-glow-sphere" />
            <div className="hero-card-stack">
              <div className="hero-stacked-card c1">
                <img src="/home/acadymic life2.jpg" alt="Academic Life at Heroes" />
                <div className="hero-card-badge">Academic Excellence</div>
              </div>
              <div className="hero-stacked-card c2">
                <img src="/home/enroll with us.jpg" alt="Students in Classroom" />
                <div className="hero-card-badge">Vibrant Community</div>
              </div>
              <div className="hero-stacked-card c3">
                <img src="/home/visiting day.jpg" alt="Student Life" />
                <div className="hero-card-badge">Hope & Growth</div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
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
            <div className="stat-label">Years of Excellence</div>
          </div>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <section className="about-section" ref={aboutRef}>
        <div className="about-grid reveal">
          <div className="about-text-col">
            <span className="about-label">About Our School</span>
            <h2 className="about-title">
              Building <span>Tomorrow's Leaders</span> Today
            </h2>
            <p className="about-desc">
              Heroes Academy is more than a school — it's a community where young minds are nurtured to become
              confident, capable leaders. Founded on the pillars of hope, excellence, and trust, we provide a
              holistic educational experience that blends rigorous academics with character development.
            </p>
            <p className="about-desc">
              Located in the vibrant Kudya Township of Blantyre, our campus offers modern facilities,
              dedicated faculty, and a supportive environment where every student can thrive and reach
              their full potential.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon"><Shield size={18} /></div>
                Safe Environment
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><BookOpen size={18} /></div>
                MANEB Curriculum
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><Users size={18} /></div>
                Small Class Sizes
              </div>
              <div className="about-feature">
                <div className="about-feature-icon"><Star size={18} /></div>
                Holistic Growth
              </div>
            </div>
          </div>
          <div className="about-image-col">
            <img src="/home/acadymic life2.jpg" alt="Students at Heroes Academy" className="about-img-main" />
            <img src="/home/acadymic life.jpg" alt="Academic Life" className="about-img-secondary" />
            <div className="about-accent-box">
              <div className="about-accent-number">10</div>
              <div className="about-accent-label">Points MSCE<br />Best Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACILITIES BENTO GRID ===== */}
      <section className="facilities-section" ref={facilitiesRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">Modern <span>Facilities</span> & Resources</h2>
            <p className="section-subtitle">
              A beautifully designed campus providing everything students need to excel academically and socially.
            </p>
          </div>
          <div className="bento-grid">
            <div className="bento-card large">
              <div className="bento-card-image-wrap">
                <img src="/scientificlab.png" alt="Scientific Laboratory" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Microscope size={24} /></div>
                <h3 className="bento-card-title">Scientific Laboratory</h3>
                <p className="bento-card-text">
                  State-of-the-art laboratory equipment for practical experiments in Biology, Chemistry, and Physics.
                  Hands-on learning that brings theory to life.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-image-wrap">
                <img src="/computerLab.png" alt="Computer Lab" className="bento-card-image" />
              </div>
              <div className="bento-card-body">
                <div className="bento-card-icon"><Monitor size={24} /></div>
                <h3 className="bento-card-title">Computer Lab</h3>
                <p className="bento-card-text">
                  Modern computers with high-speed internet for digital literacy and programming skills.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-body">
                <div className="bento-card-icon"><Activity size={24} /></div>
                <h3 className="bento-card-title">Sports Campus</h3>
                <p className="bento-card-text">
                  Comprehensive sports facilities promoting physical health, teamwork, and competitive excellence.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-body">
                <div className="bento-card-icon"><HomeIcon size={24} /></div>
                <h3 className="bento-card-title">Boarding Facilities</h3>
                <p className="bento-card-text">
                  Safe, modern boarding designed to feel like home. 24/7 supervision and support for boys & girls.
                </p>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-card-body">
                <div className="bento-card-icon"><Heart size={24} /></div>
                <h3 className="bento-card-title">Student Clubs</h3>
                <p className="bento-card-text">
                  Various clubs, cultural societies, and social activities building strong character and leadership.
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
            <h2 className="section-title">Academic <span>Journey</span></h2>
            <p className="section-subtitle">
              A trusted and rigorous curriculum preparing students for national excellence and global opportunities.
            </p>
          </div>
          <div className="timeline-container">
            {[
              { form: 'Form 1', desc: 'Building a strong foundation in sciences, arts, and humanities.', highlight: false, exam: null },
              { form: 'Form 2', desc: 'Preparation for the Junior Certificate of Education examination.', highlight: true, exam: 'JCE' },
              { form: 'Form 3', desc: 'Advanced coursework and specialized subject selection.', highlight: false, exam: null },
              { form: 'Form 4', desc: 'Intensive preparation for the Malawi School Certificate of Education.', highlight: true, exam: 'MSCE' },
            ].map((item, i) => (
              <div key={i} className={`timeline-step ${item.highlight ? 'highlight' : ''}`}>
                <div className="timeline-node">
                  <BookOpen size={24} />
                </div>
                {i < 3 && <div className={`timeline-connector ${item.highlight ? 'active' : ''}`} />}
                <div>
                  <div className="timeline-form-name">{item.form}</div>
                  {item.exam && <span className="timeline-exam-badge">{item.exam} Exam</span>}
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CAMPUS LIFE GALLERY ===== */}
      <section className="campus-life-section" ref={galleryRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">Campus <span>Life</span></h2>
            <p className="section-subtitle">
              Beyond the classroom — our vibrant community of clubs, sports, and social activities.
            </p>
          </div>
          <div className="gallery-grid-6">
            {galleryItems.map((item, i) => (
              <div key={i} className="gallery-item">
                <img src={item.src} alt={item.label} />
                <div className="gallery-overlay">
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ACHIEVEMENT BANNER ===== */}
      <section className="achievement-section" ref={achieveRef}>
        <div className="reveal">
          <div className="achievement-banner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', textAlign: 'left', maxWidth: '1100px' }}>
            <div className="achievement-content" style={{ textAlign: 'left' }}>
              <div className="achievement-icon" style={{ justifyContent: 'flex-start' }}><Trophy size={48} /></div>
              <div className="achievement-number">10 Points</div>
              <div className="achievement-text">Highest Score in 2025 MSCE</div>
              <div className="achievement-subtext">
                Our students consistently achieve the best academic records nationwide. 44+ students selected to public universities including UNIMA, LUANAR, MZUNI, MUST & MUBAS.
              </div>
              {isResultsPublished && (
                <button className="btn btn-primary" style={{ margin: '1.5rem 0 0', padding: '0.8rem 2rem' }} onClick={() => navigate('/exam-results')}>
                  <FileText size={18} /> View Results
                </button>
              )}
            </div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(253,184,19,0.3)', maxHeight: '400px' }}>
              <img src="/home/2025 MSCE Reuilts.jpg" alt="2025 MSCE Results" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ENROLLMENT CTA ===== */}
      <section className="enroll-cta" ref={enrollRef}>
        <div className="reveal">
          <div className="enroll-cta-inner">
            <div className="enroll-cta-text">
              <h2>Enroll With <span>Heroes Academy</span> Today</h2>
              <p>
                Registration is in progress for the 2025/2026 academic year. Places are available in Form 1, 2, 3 & 4.
                Join a school that combines modern facilities with dedicated educators.
              </p>
              <div className="enroll-cta-features">
                <div className="enroll-feature"><HomeIcon size={18} /> Boarding and Day School</div>
                <div className="enroll-feature"><Microscope size={18} /> Computer and Science Lab</div>
                <div className="enroll-feature"><GraduationCap size={18} /> Dedicated Educators</div>
                <div className="enroll-feature"><Star size={18} /> Affordable Tuition Fees</div>
              </div>
              <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }} onClick={() => navigate('/apply')}>
                Apply for Admission <ChevronRight size={18} />
              </button>
            </div>
            <div className="enroll-cta-images">
              <div className="enroll-img-wrap">
                <img src="/home/enrollwithus.jpg" alt="Enroll with Heroes Academy" />
              </div>
              <div className="enroll-img-wrap">
                <img src="/home/acadymic life22.jpg" alt="Student Life" />
              </div>
              <div className="enroll-img-wrap">
                <img src="/home/visiting day2.jpg" alt="Visiting Day" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section" ref={testimonialRef}>
        <div className="reveal">
          <div className="section-header">
            <h2 className="section-title">What People <span>Say</span></h2>
            <p className="section-subtitle">
              Hear from parents and students who are part of the Heroes Academy family.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-quote-icon"><Quote size={32} /></div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
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
            <h2 className="section-title">Find <span>Us</span></h2>
            <p className="section-subtitle">
              Nestled in a serene and accessible environment to support focused learning.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card">
              <div className="contact-item">
                <div className="contact-item-icon"><MapPin size={22} /></div>
                <div className="contact-item-text">
                  <h4>Campus Location</h4>
                  <p>{schoolInfo.schoolCampus}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Info size={22} /></div>
                <div className="contact-item-text">
                  <h4>Address</h4>
                  <p>{schoolInfo.schoolAddress}, opposite Bethel Stage</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Phone size={22} /></div>
                <div className="contact-item-text">
                  <h4>Phone</h4>
                  <p>{schoolInfo.schoolPhone}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon"><Mail size={22} /></div>
                <div className="contact-item-text">
                  <h4>Email</h4>
                  <p>{schoolInfo.schoolEmail}</p>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }} onClick={() => navigate('/apply')}>
                Apply for Admission <ChevronRight size={18} />
              </button>
            </div>
            <div className="contact-map-wrap">
              <MapContainer
                center={[-15.813433, 35.015612]}
                zoom={16}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', minHeight: '400px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[-15.813433, 35.015612]}>
                  <Popup>
                    <strong>Heroes Academy</strong><br />Kudya Township, Blantyre.
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/heroesLogo.png" alt="Heroes Academy Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
              Heroes Academy
            </h3>
            <p>A modern secondary school built on hope, excellence, and trust. Shaping the future of Malawi, one student at a time.</p>
            <div className="social-links">
              <div className="footer-social-icon"><Globe size={18} /></div>
              <div className="footer-social-icon"><MessageCircle size={18} /></div>
              <div className="footer-social-icon"><Camera size={18} /></div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact Details</h4>
            <p><MapPin size={18} /> {schoolInfo.schoolCampus}</p>
            <p><Info size={18} /> {schoolInfo.schoolAddress}</p>
            <p><Phone size={18} /> {schoolInfo.schoolPhone}</p>
            <p><Mail size={18} /> {schoolInfo.schoolEmail}</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <p className="footer-link" onClick={() => navigate('/apply')}>Admissions Form</p>
            <p className="footer-link" onClick={() => navigate('/login')}>Portal Login</p>
            <p className="footer-link" onClick={() => navigate('/explore-campus')}>Explore Campus</p>
            {isResultsPublished && (
              <p className="footer-link" style={{ color: 'var(--primary-gold)', fontWeight: 600 }} onClick={() => navigate('/exam-results')}>Exam Results</p>
            )}
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Heroes Academy Malawi. All rights reserved. SMIS Powered by Alphabet.
        </div>
      </footer>
    </div>
  );
}
