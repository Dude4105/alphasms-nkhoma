import { useState, useEffect } from 'react';
import { 
  Users, BookOpen, GraduationCap, Clock, MapPin,
  Calendar, Award, BarChart3, UserCheck, ShieldCheck, Mail, Plus, Loader, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassData {
  teacher: {
    id: string;
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    classes: string[];
  } | null;
  class: {
    id: string;
    name: string;
    level: string | null;
    track: string | null;
    room: string | null;
    schedule: string | null;
    capacity: number | null;
    subjects: any;
    classTeacher: string | null;
  } | null;
  students: {
    id: string;
    name: string;
    gender: string | null;
    type: string;
    status: string;
  }[];
  stats: {
    total: number;
    boys: number;
    girls: number;
    boarding: number;
    day: number;
  };
}

export default function MainClass() {
  const navigate = useNavigate();
  const [data, setData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [termContext, setTermContext] = useState({ term: '', year: '' });

  useEffect(() => {
    const fetchMainClass = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/main-class`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch main class data');

        const json = await res.json();
        setData(json);

        // Fetch current term context
        try {
          const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            setTermContext({ term: settings.currentTerm || '1', year: settings.academicYear || '' });
          }
        } catch (e) { /* ignore */ }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching main class:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainClass();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your class data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem', borderRadius: '16px' }}>
        <GraduationCap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Unable to Load Class</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  if (!data.class) {
    return (
      <div className="animate-fade">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', margin: '2rem auto', maxWidth: '500px', borderRadius: '24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GraduationCap size={40} />
          </div>
          <h2 style={{ color: 'var(--silver-light)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Class Assigned</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '350px', margin: '0 auto' }}>
            You don't have a main class assigned yet. Please contact the administration to be allocated to a class.
          </p>
        </div>
      </div>
    );
  }

  const classSubjects = Array.isArray(data.class.subjects) ? data.class.subjects : [];
  const subjectColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'];

  const getSubjectKey = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n.includes('agriculture')) return 'agri';
    if (n.includes('biology')) return 'bio';
    if (n.includes('mathematics')) return 'math';
    if (n.includes('english')) return 'eng';
    if (n.includes('chichewa')) return 'chi';
    if (n.includes('physical science')) return 'phys';
    if (n.includes('chemistry')) return 'chem';
    if (n.includes('physics')) return 'physics';
    if (n.includes('history')) return 'hist';
    if (n.includes('geography')) return 'geog';
    if (n.includes('academic') || n.includes('general')) return 'gen';
    if (n.includes('social')) return 'social';
    if (n.includes('business')) return 'biz';
    if (n.includes('computer')) return 'comp';
    if (n.includes('home')) return 'home';
    return n.slice(0, 4);
  };

  return (
    <div className="animate-fade">
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.75rem', borderRadius: '14px', color: '#3b82f6' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 800,
              letterSpacing: '-0.01em',
              marginBottom: '0.2rem',
              background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>My Main Class</h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <BookOpen size={16} /> {data.class.name} {data.class.level ? `· ${data.class.level}` : ''}
              {termContext.year && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <Calendar size={12} />
                  Term {termContext.term} · {termContext.year}
                </span>
              )}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn" 
              onClick={() => navigate('/teacher/main-class/results')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-light)', border: '1px solid var(--glass-border)' }}
            >
              <BarChart3 size={18} /> Final Results
            </button>
            <button 
              className="btn" 
              onClick={() => navigate(`/teacher/classes/${data.class?.id}/migrate`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              <ArrowUpRight size={18} /> Migrate Students
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/teacher/main-class/add-student')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6' }}
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Students', value: data.stats.total, icon: <Users size={20} />, color: 'var(--primary-gold)' },
          { label: 'Boys', value: data.stats.boys, icon: <UserCheck size={20} />, color: '#3b82f6' },
          { label: 'Girls', value: data.stats.girls, icon: <UserCheck size={20} />, color: '#ec4899' },
          { label: 'Boarding', value: data.stats.boarding, icon: <Award size={20} />, color: '#10b981' },
        ].map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: card.color }}>
              {card.icon}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-light)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Class Overview */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={20} color="#3b82f6" /> Administration Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {[
              { label: 'Class Teacher', value: data.teacher?.name || data.class.classTeacher || 'Unassigned', role: 'Main Class Teacher', icon: <GraduationCap size={18} /> },
              { label: 'Primary Room', value: data.class.room || 'Not Assigned', icon: <MapPin size={18} /> },
              { label: 'Academic Track', value: data.class.track || 'General', icon: <BookOpen size={18} /> },
              { label: 'Weekly Schedule', value: data.class.schedule || 'Mon–Fri, 7:00 AM – 3:30 PM', icon: <Clock size={18} /> },
            ].map((item: any, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-light)', fontWeight: 600 }}>{item.value}</div>
                  {item.role && <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{item.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#10b981" /> Subjects & Faculty
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {classSubjects.length > 0 ? classSubjects.map((subj: any, i: number) => {
              const name = typeof subj === 'string' ? subj : subj.name;
              const teacher = typeof subj === 'object' ? subj.teacher : '';
              const periods = typeof subj === 'object' ? subj.periods : null;
              const color = subjectColors[i % subjectColors.length];
              
              return (
                <div 
                  key={i} 
                  onClick={() => navigate(`/teacher/subjects/results/${data.class?.id}/${getSubjectKey(name)}`)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', 
                    borderLeft: `3px solid ${color}`, cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  className="hover-bright"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.9rem' }}>{name}</div>
                    {teacher && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teacher}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {periods && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{periods} Periods</div>
                    )}
                    <BarChart3 size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No subjects assigned to this class yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Roster */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#3b82f6" /> Student Roster
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.students.length} students enrolled</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>NAME</th>
                <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.8rem' }}>GENDER</th>
                <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.8rem' }}>TYPE</th>
                <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.8rem' }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.students.length > 0 ? data.students.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td 
                    style={{ padding: '0.85rem 1.5rem', cursor: 'pointer' }}
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-light)', transition: 'color 0.2s ease' }} 
                         onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                         onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.id}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--silver-light)', fontSize: '0.9rem' }}>{s.gender || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', 
                      background: s.type === 'Boarding' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', 
                      color: s.type === 'Boarding' ? '#10b981' : 'var(--text-muted)' 
                    }}>{s.type}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', textTransform: 'uppercase'
                    }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button 
                      className="btn" 
                      onClick={() => navigate(`/teacher/students/${s.id}`)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)', border: '1px solid var(--glass-border)' }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => navigate(`/teacher/students/${s.id}/report`)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students enrolled in this class yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Info({ size, color }: { size: number, color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
