import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, MoreVertical, Plus } from 'lucide-react';

export default function Students() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/classes?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setClasses(json.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setStudents(json.data.map((s: any) => ({
          id: s.student_id,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          gender: s.gender || 'N/A',
          class: s.class?.name || 'Unassigned',
          type: s.scholarType || 'Day',
          status: 'Active',
          dbId: s.id
        })));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === 'all' || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const statusStyle = (s: string) => {
    if (s === 'Active') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
    return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Students</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage all enrolled students across the school.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/admin/students/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <div style={{ position: 'relative' }}>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', appearance: 'none' as any, cursor: 'pointer' }}>
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Student ID</th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Full Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Gender</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Class</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading students...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const ss = statusStyle(s.status);
                  return (
                    <tr 
                      key={s.id || i} 
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.id}</td>
                      <td style={{ padding: '0.75rem 1.5rem', fontWeight: 500, color: 'var(--text-light)' }}>{s.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{s.gender}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{s.class}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{s.type}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, background: ss.bg, color: ss.color }}>{s.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button className="btn-icon" style={{ display: 'inline-flex', width: 32, height: 32 }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
