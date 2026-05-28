import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, MapPin, ChevronRight, Loader, GraduationCap, Calendar } from 'lucide-react';

interface ClassCard {
  id: string;
  name: string;
  level: string | null;
  room: string;
  students: number;
  schedule: string | null;
  subjects?: any[];
  theme: string;
}

export default function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassCard[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [termContext, setTermContext] = useState({ term: '', year: '' });

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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch classes');

        const json = await res.json();
        setClasses(json.classes || []);
        setTeacherName(json.teacher?.name || '');

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
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your classes...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', color: 'var(--silver-light)' }}>My Classes</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {classes.length > 0 
            ? `You are assigned to ${classes.length} class${classes.length > 1 ? 'es' : ''} this term.`
            : 'Manage your assigned subjects and classrooms.'
          }
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

      {classes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', borderRadius: '24px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GraduationCap size={40} />
          </div>
          <h2 style={{ color: 'var(--silver-light)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Classes Assigned</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            You have not been assigned to any classes yet. Please contact the administration for your class allocations.
          </p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {classes.map((cls, idx) => (
            <div key={cls.id} className="glass-panel" style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ height: '6px', background: cls.theme, width: '100%' }}></div>
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', color: cls.theme }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.15rem' }}>{cls.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cls.level || 'General'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--silver-light)' }}>
                    <MapPin size={18} color="var(--text-muted)" />
                    <span>Room: <strong>{cls.room}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--silver-light)' }}>
                    <Users size={18} color="var(--text-muted)" />
                    <span>Total Students: <strong>{cls.students}</strong></span>
                  </div>
                </div>

                {/* Show teacher's subjects as tags for THIS class */}
                {(() => {
                  const assignedInThisClass = (cls.subjects || [])
                    .filter((s: any) => s.teacher === teacherName)
                    .map((s: any) => s.name);

                  if (assignedInThisClass.length === 0) return null;

                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {assignedInThisClass.map(sub => (
                        <span 
                          key={sub} 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teacher/subjects/results/${cls.id}/${getSubjectKey(sub)}`);
                          }}
                          style={{ 
                            fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                            background: `${cls.theme}15`, color: cls.theme, fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `${cls.theme}30`;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = `${cls.theme}15`;
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', borderColor: 'var(--glass-border)', color: 'var(--text-light)' }}
                  onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                >
                  View Roster <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
