import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

export default function Enrollment() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/enrollment/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, status: string, app?: any) => {
    if (status === 'APPROVED' && app) {
      navigate('/admin/students/add', { state: { application: app } });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/enrollment/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const statusStyle = (s: string) => {
    if (s === 'APPROVED') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
    if (s === 'REJECTED') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
    return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
  };

  const filtered = applications.filter(a => 
    `${a.firstName} ${a.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `APP-${a.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Enrollment Applications</h1>
          <p style={{ color: 'var(--text-muted)' }}>{pendingCount} application{pendingCount !== 1 ? 's' : ''} pending review.</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <div className="search-bar" style={{ width: '100%', maxWidth: '400px' }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by student name or application ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>App ID</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Student</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Guardian</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Class</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const ss = statusStyle(app.status);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>APP-{app.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-light)' }}>{app.firstName} {app.surname}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{app.guardianTitle}. {app.guardianName}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{app.targetClass}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{app.boardingStatus}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, background: ss.bg, color: ss.color }}>{app.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {app.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleAction(app.id, 'APPROVED', app)}
                            title="Approve & Register"
                            style={{ width: 32, height: 32, color: '#10b981', background: 'rgba(16,185,129,0.1)' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleAction(app.id, 'REJECTED')}
                            title="Reject"
                            style={{ width: 32, height: 32, color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-icon" title="View Details" style={{ width: 32, height: 32, display: 'inline-flex' }}>
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
