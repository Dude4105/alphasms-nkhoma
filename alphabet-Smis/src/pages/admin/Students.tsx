import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, MoreVertical, Plus, Loader2, Users, UserPlus } from 'lucide-react';

const PAGE_SIZE = 10;   // initial students shown
const LOAD_MORE = 20;   // students added per "Show More" click

export default function Students() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasLoadedRef = useRef(false);

  // Debounce search so we only hit the server after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to first page whenever the search changes
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, debouncedSearch]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/classes?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    // Show a full skeleton on first load, keep rows + spinner in the button on "Show More"
    if (hasLoadedRef.current) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ limit: String(limit) });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/students?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        setTotal(json.meta?.total || 0);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleShowMore = () => setLimit(prev => prev + LOAD_MORE);

  // Class filter stays client-side (applies to the students loaded so far)
  const displayed = students.filter(s => filterClass === 'all' || s.class === filterClass);

  const hasMore = students.length < total;
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
                // Skeleton rows while the first page loads
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1.5rem' }}><div style={{ height: 12, width: 80, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1.5rem' }}><div style={{ height: 12, width: 150, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ height: 12, width: 50, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ height: 12, width: 70, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ height: 12, width: 40, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ height: 18, width: 60, borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}><div style={{ height: 12, width: 24, borderRadius: '6px', background: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <Users size={28} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.35rem' }}>No students found</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {debouncedSearch || filterClass !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by adding your first student.'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayed.map((s, i) => {
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

        {/* Footer: count + Show More */}
        {!isLoading && displayed.length > 0 && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-light)' }}>{displayed.length}</strong> of <strong style={{ color: 'var(--text-light)' }}>{total}</strong> student{total === 1 ? '' : 's'}
            </span>

            {hasMore && (
              <button
                className="btn"
                onClick={handleShowMore}
                disabled={isLoadingMore}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.85rem', color: 'var(--primary-gold)',
                  background: 'rgba(253,184,19,0.05)', border: '1px solid var(--primary-gold-dim)',
                  padding: '0.5rem 1.5rem', opacity: isLoadingMore ? 0.7 : 1
                }}
              >
                {isLoadingMore ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                {isLoadingMore ? 'Loading...' : `Show More (${Math.min(LOAD_MORE, total - students.length)} more)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
