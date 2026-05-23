import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function AdminClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await fetch('http://localhost:3000/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const mapped = json.data.map((c: any) => ({
          id: c.class_id,
          form: c.name,
          students: c._count?.students || 0,
          teachers: Array.isArray(c.subjects) ? c.subjects.length : 0,
          streams: c.track || 'General',
          color: getColorByLevel(c.level || c.name)
        }));
        setClasses(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorByLevel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('form 1') || l.includes('form 2')) return '#3b82f6';
    if (l.includes('form 3')) return 'var(--primary-gold)';
    if (l.includes('form 4')) return '#ef4444';
    return '#10b981';
  };

  const totalStudents = classes.reduce((s, c) => s + c.students, 0);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Classes Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>{classes.length} classes · {totalStudents} total students enrolled.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/classes/create')}
        >
          + Create Class
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading classes...</div>
        ) : classes.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No classes found. Please create one.</div>
        ) : (
          classes.map((c, i) => (
            <div 
              key={i} 
              className="glass-panel" 
              onClick={() => navigate(`/admin/classes/${c.id}`)}
              style={{ 
                borderRadius: '12px', padding: '1.5rem', borderLeft: `4px solid ${c.color}`,
                cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: `${c.color}18`, padding: '0.6rem', borderRadius: '10px', color: c.color }}>
                    <BookOpen size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-light)' }}>{c.form}</h3>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Students</span>
                  <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{c.students}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subjects (Teachers)</span>
                  <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{c.teachers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Track</span>
                  <span style={{ color: c.color, fontWeight: 500, fontSize: '0.85rem' }}>{c.streams}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
