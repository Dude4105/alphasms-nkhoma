import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Mail, Phone, Plus, Trash2 } from 'lucide-react';

export default function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const mapped = json.data.map((t: any) => ({
          id: t.teacher_id,
          name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unnamed',
          subjects: Array.isArray(t.subjects) ? t.subjects.join(', ') : (t.subjects || 'N/A'),
          classes: Array.isArray(t.classes) ? t.classes.join(', ') : (t.classes || 'N/A'),
          phone: t.phone,
          email: t.email,
          dbId: t.id
        }));
        setTeachers(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async (e: React.MouseEvent, teacherId: string, teacherName: string) => {
    e.stopPropagation(); // Prevent card navigation
    if (!await window.confirm(`CRITICAL: Are you sure you want to UNENROLL ${teacherName}?\n\nThis will permanently delete their profile and system access. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/staff/${teacherId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to unenroll staff');

      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      alert(`${teacherName} has been successfully unenrolled.`);
    } catch (err) {
      console.error(err);
      alert('Error unenrolling staff. Please try again.');
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Teachers</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all teaching staff and their assignments.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/admin/teachers/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No teachers found. Please add teaching staff.</div>
        ) : (
          teachers.map((t, i) => (
            <div 
              key={t.id || i} 
              className="glass-panel" 
              onClick={() => navigate(`/admin/teachers/${t.id}`)}
              style={{ 
                borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: '4px', background: `hsl(${(i * 60) + 200}, 70%, 55%)` }}></div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.15rem' }}>{t.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.id}</span>
                  </div>
                  <button className="btn-icon" style={{ width: 32, height: 32 }}><MoreVertical size={16} /></button>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Subjects</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--silver-light)' }}>{t.subjects}</div>
                </div>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Classes Assigned</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--silver-light)' }}>{t.classes}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                  {t.phone ? (
                    <a href={`tel:${t.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                      <Phone size={14} /> Call
                    </a>
                  ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Phone</span>}
                  
                  {t.email ? (
                    <a href={`mailto:${t.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                      <Mail size={14} /> Email
                    </a>
                  ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Email</span>}

                  <button 
                    className="btn"
                    onClick={(e) => handleUnenroll(e, t.id, t.name)}
                    style={{ 
                      marginLeft: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem', 
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none',
                      display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '6px'
                    }}
                  >
                    <Trash2 size={12} /> Unenroll Staff
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
