import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, 
  Calendar, Award, BookOpen, Clock, 
  Shield, GraduationCap, BarChart3, TrendingUp, Users, Trash2,
  MessageCircle
} from 'lucide-react';

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [availableYears, setAvailableYears] = useState<string[]>(['2025', '2026', '2027']);
  const [hasSetInitialTerm, setHasSetInitialTerm] = useState(false);
  const handleOpenHistory = () => {
    if (isTeacher) {
      navigate(`/teacher/students/${studentId}/history`);
    } else {
      navigate(`/admin/students/${studentId}/history`);
    }
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        let activeTerm = selectedTerm;
        let activeYear = selectedYear;

        // Fetch active term/year from global settings on initial load
        if (!hasSetInitialTerm) {
          try {
            const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (settingsRes.ok) {
              const settings = await settingsRes.json();
              if (settings.currentTerm) {
                activeTerm = settings.currentTerm;
                setSelectedTerm(settings.currentTerm);
              }
              if (settings.academicYear) {
                activeYear = settings.academicYear;
                setSelectedYear(settings.academicYear);
              }
            }
          } catch (e) {
            console.error('Error fetching global settings:', e);
          }
        }

        const termQuery = `?term=${activeTerm}&academicYear=${activeYear}`;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}${termQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const student = await res.json();
        
        if (res.ok && student) {
          setData({
            id: student.student_id,
            name: `${student.firstName} ${student.lastName}`,
            gender: student.gender || 'N/A',
            class: student.class?.name || 'Unassigned',
            type: student.scholarType || 'Day',
            status: 'Active',
            dob: student.dob || 'N/A',
            enrollmentDate: student.enrollmentDate || 'N/A',
            admissionNo: student.student_id,
            house: student.hostel?.name || 'Day Scholar',
            guardian: {
              name: student.guardianName || 'N/A',
              relationship: student.guardianRelation || 'N/A',
              phone: student.guardianPhone || 'N/A',
              email: student.guardianEmail || 'N/A',
              address: student.guardianAddress || 'N/A'
            },
            academic: student.academic || {
              average: 0, 
              rank: 0,
              totalStudents: 0,
              attendance: 0,
              topSubjects: [],
              grades: []
            }
          });

          // Dynamically populate available years from classHistory
          let yearsList = ['2025', '2026', '2027'];
          if (student.classHistory) {
            try {
              const hist = JSON.parse(student.classHistory);
              const parsedYears = Object.keys(hist);
              yearsList = Array.from(new Set([...yearsList, ...parsedYears, student.academic?.year])).filter(Boolean).sort() as string[];
            } catch {}
          }
          setAvailableYears(yearsList);
          setHasSetInitialTerm(true);
        }
      } catch (err) {
        console.error('Error fetching student:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, selectedTerm, selectedYear, hasSetInitialTerm]);

  const handleUnenroll = async () => {
    if (!await window.confirm(`Are you sure you want to unenroll ${data.name}? This will permanently delete all their information and login access from the system.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        navigate('/admin/students');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to remove student.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
  };

  const getAvgColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return 'var(--primary-gold)';
    return '#ef4444';
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading student profile...</div>;
  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Student not found.</div>;


  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => isTeacher ? navigate(-1) : navigate('/admin/students')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> {isTeacher ? 'Back' : 'Back to Students'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '16px', 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: '#3b82f6', display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.15rem' }}>{data.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{data.id}</span>
                <span style={{ 
                   fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', textTransform: 'uppercase'
                }}>{data.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Elegant Year Selector */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '2px', borderRadius: '8px' }}>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    setIsLoading(true);
                    setSelectedYear(yr);
                  }}
                  style={{
                    padding: '0.4rem 0.9rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedYear === yr ? 'var(--primary-gold)' : 'transparent',
                    color: selectedYear === yr ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Elegant HSL-Tailored Term Selectors */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '2px', borderRadius: '8px' }}>
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setIsLoading(true);
                    setSelectedTerm(t);
                  }}
                  style={{
                    padding: '0.4rem 0.9rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedTerm === t ? '#3b82f6' : 'transparent',
                    color: selectedTerm === t ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Term {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenHistory}
              style={{
                padding: '0.4rem 1.25rem', fontSize: '0.9rem', borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.05)',
                color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease', height: '36px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
            >
              <TrendingUp size={16} /> Academic History
            </button>

            {!isTeacher && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleUnenroll}
                  style={{ 
                    padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)',
                    color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                >
                  <Trash2 size={16} /> Unenroll Student
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(`/admin/students/${studentId}/edit`)}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Current Average', value: data.academic.average > 0 ? `${data.academic.average}%` : 'N/A', icon: <BarChart3 size={20} />, color: data.academic.average > 0 ? getAvgColor(data.academic.average) : 'var(--text-muted)' },
          { label: 'Class Rank', value: data.academic.rank > 0 ? `${data.academic.rank} / ${data.academic.totalStudents}` : 'N/A', icon: <TrendingUp size={20} />, color: data.academic.rank > 0 ? 'var(--primary-gold)' : 'var(--text-muted)' },
          { label: 'Attendance', value: data.academic.attendance > 0 ? `${data.academic.attendance}%` : 'N/A', icon: <Calendar size={20} />, color: data.academic.attendance > 0 ? '#10b981' : 'var(--text-muted)' },
          { label: 'Scholar Type', value: data.type, icon: <GraduationCap size={20} />, color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: stat.color }}>
              {stat.icon}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-light)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Basic & Guardian Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Basic Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#3b82f6" /> Academic & Personal Info
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { label: 'Form/Class', value: data.class, icon: <BookOpen size={16} /> },
                { label: 'House', value: data.house, icon: <MapPin size={16} /> },
                { label: 'Gender', value: data.gender, icon: <User size={16} /> },
                { label: 'Date of Birth', value: data.dob, icon: <Calendar size={16} /> },
                { label: 'Admission No', value: data.admissionNo, icon: <Shield size={16} /> },
                { label: 'Enrollment Date', value: data.enrollmentDate, icon: <Clock size={16} /> },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guardian Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#8b5cf6" /> Guardian Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name & Relationship</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>{data.guardian.name} ({data.guardian.relationship})</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <a href={`tel:${data.guardian.phone}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
                  <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} /> {data.guardian.phone}
                  </div>
                </a>
                {data.guardian.phone && data.guardian.phone !== 'N/A' ? (
                  <a 
                    href={`https://wa.me/${data.guardian.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Mr. / Mrs. ${data.guardian.name}, ${data.name}'s ${data.guardian.relationship}\nHow are you!`)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>WhatsApp</div>
                    <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MessageCircle size={14} /> Message
                    </div>
                  </a>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>WhatsApp</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MessageCircle size={14} /> N/A
                    </div>
                  </div>
                )}
                <a href={`mailto:${data.guardian.email}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} /> {data.guardian.email}
                  </div>
                </a>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Residential Address</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> {data.guardian.address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grades & Performance */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary-gold)" /> Performance Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.academic.grades.length > 0 ? data.academic.grades.map((g: any, i: number) => (
              <div 
                key={i} 
                className="glass-panel" 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.95rem' }}>{g.subject}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: getAvgColor(g.score), fontWeight: 700 }}>{g.score}%</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grade: {g.grade}</span>
                  </div>
                </div>
                <div style={{ 
                  padding: '0.4rem', borderRadius: '8px', 
                  background: g.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : g.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: g.trend === 'up' ? '#10b981' : g.trend === 'down' ? '#ef4444' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {g.trend === 'up' ? <TrendingUp size={18} /> : g.trend === 'down' ? <TrendingUp size={18} style={{ transform: 'rotate(90deg)' }} /> : <Clock size={18} />}
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px' }}>
                No academic results out yet.
              </div>
            )}
          </div>

          {data.academic.topSubjects.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} color="#3b82f6" /> Strengths
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.academic.topSubjects.map((s: string) => (
                  <span key={s} style={{ 
                    fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', 
                    background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 500 
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
