import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, Users, MapPin, 
  ChevronRight, Loader, Calendar, BookOpen 
} from 'lucide-react';

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

export default function AttendanceOverview() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassCard[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [termContext, setTermContext] = useState({ term: '', year: '' });
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    // Format current date beautifully
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDateStr(formatted);

    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/teachers/me/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch classes');

        const json = await res.json();
        setClasses(json.classes || []);
        setTeacherName(json.teacher?.name || '');

        // Fetch current term context
        try {
          const settingsRes = await fetch('http://localhost:3000/admin/settings', {
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
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', color: 'var(--silver-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardCheck size={28} style={{ color: '#10b981' }} /> Attendance Management
        </h1>
        <p className="page-subtitle" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span>Select an assigned class below to manage daily attendance.</span>
          {termContext.year && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Calendar size={12} />
              Term {termContext.term} · {termContext.year}
            </span>
          )}
        </p>
      </div>

      {/* Live Date Card */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem 1.5rem', 
        borderRadius: '16px', 
        marginBottom: '2rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        borderLeft: '4px solid #10b981',
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05), transparent)'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '10px', color: '#10b981' }}>
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tracking Date</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>{currentDateStr}</div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', borderRadius: '24px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ClipboardCheck size={40} />
          </div>
          <h2 style={{ color: 'var(--silver-light)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Classes Allocated</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            You have not been assigned to any classrooms yet. Please contact the administrative desk to update your class list.
          </p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {classes.map((cls) => (
            <div key={cls.id} className="glass-panel" style={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={() => navigate(`/teacher/classes/${cls.id}/attendance`)}
            >
              <div style={{ height: '6px', background: cls.theme, width: '100%' }}></div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', color: cls.theme }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.15rem' }}>{cls.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cls.level || 'General'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--silver-light)', fontSize: '0.85rem' }}>
                    <MapPin size={16} color="var(--text-muted)" />
                    <span>Room: <strong>{cls.room}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--silver-light)', fontSize: '0.85rem' }}>
                    <Users size={16} color="var(--text-muted)" />
                    <span>Students: <strong>{cls.students}</strong></span>
                  </div>
                </div>

                {/* Subjects Tags */}
                {(() => {
                  const assignedInThisClass = (cls.subjects || [])
                    .filter((s: any) => s.teacher === teacherName)
                    .map((s: any) => s.name);

                  if (assignedInThisClass.length === 0) return null;

                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {assignedInThisClass.map(sub => (
                        <span key={sub} style={{ 
                          fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '6px',
                          background: `${cls.theme}15`, color: cls.theme, fontWeight: 600 
                        }}>{sub}</span>
                      ))}
                    </div>
                  );
                })()}

                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--glass-border)', color: 'var(--text-light)', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teacher/classes/${cls.id}/attendance`);
                  }}
                >
                  Track Attendance <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
