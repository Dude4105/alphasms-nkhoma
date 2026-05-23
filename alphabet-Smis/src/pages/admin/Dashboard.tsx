import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, UserPlus, ChevronRight, Loader, AlertCircle, Key, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [statsRes, meRes] = await Promise.all([
          fetch('http://localhost:3000/admin/dashboard-stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3000/admin/me', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!statsRes.ok) throw new Error('Failed to fetch dashboard statistics');

        const statsJson = await statsRes.json();
        setData(statsJson);

        if (meRes.ok) {
          const meJson = await meRes.json();
          setAdminProfile(meJson);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Dashboard Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const iconMap: any = {
    'Users': <Users size={24} />,
    'GraduationCap': <GraduationCap size={24} />,
    'BookOpen': <BookOpen size={24} />,
    'ClipboardList': <ClipboardList size={24} />,
    'Key': <Key size={24} />,
  };

  const statusColor = (s: string) => {
    if (s === 'APPROVED') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
    if (s === 'REJECTED') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
    return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Preparing dashboard overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem', borderRadius: '16px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Failed to Load Stats</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'An unexpected error occurred.'}</p>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>School-wide overview and management center.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {data.stats.filter((stat: any) => {
          const tabMap: any = {
            'Total Students': 'Students',
            'Total Teachers': 'Teachers',
            'Total Classes': 'Classes',
            'Pending Enrollment': 'Enrollment',
            'Pass. Resets': 'Password Resets'
          };
          const requiredTab = tabMap[stat.title];
          if (!adminProfile?.permissions || adminProfile.permissions.length === 0) return true;
          return adminProfile.permissions.includes(requiredTab);
        }).map((stat: any, i: number) => (
          <div 
            key={i} 
            className="glass-panel" 
            onClick={() => navigate(stat.path)}
            style={{ 
              padding: '1.5rem', 
              borderRadius: '12px', 
              borderTop: `3px solid ${stat.color}`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 16px -4px ${stat.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: `${stat.color}18`, padding: '0.75rem', borderRadius: '10px', color: stat.color }}>
                {iconMap[stat.icon] || <TrendingUp size={24} />}
              </div>
              <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.2rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.title}</div>
            <div style={{ fontSize: '0.75rem', color: stat.color, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={12} /> {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Recent Applications */}
        {(!adminProfile?.permissions || adminProfile.permissions.length === 0 || adminProfile.permissions.includes('Enrollment')) && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="#3b82f6" /> Recent Enrollment Applications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recentApplications && data.recentApplications.length > 0 ? data.recentApplications.map((app: any, i: number) => {
              const sc = statusColor(app.status);
              return (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.85rem 1rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)', 
                  borderLeft: `3px solid ${sc.color}`
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.15rem' }}>{app.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.class} · {app.type} · {app.date}</div>
                  </div>
                  <span style={{ 
                    padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                    background: sc.bg, color: sc.color 
                  }}>
                    {app.status}
                  </span>
                </div>
              );
            }) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent applications found.
              </div>
            )}
          </div>
        </div>
        )}

        {/* Recent Password Resets */}
        {(!adminProfile?.permissions || adminProfile.permissions.length === 0 || adminProfile.permissions.includes('Password Resets')) && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="#ec4899" /> Recent Password Reset Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recentResetRequests && data.recentResetRequests.length > 0 ? data.recentResetRequests.map((req: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', 
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.15rem' }}>{req.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={() => navigate('/admin/password-resets')}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}
                >
                  Manage
                </button>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No pending reset requests.
              </div>
            )}
          </div>
        </div>
        )}

        {/* Top Performers */}
        {(!adminProfile?.permissions || adminProfile.permissions.length === 0 || adminProfile.permissions.includes('Students')) && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#10b981" /> Top Performing Students
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topPerformers && data.topPerformers.length > 0 ? data.topPerformers.map((s: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: '50%', 
                    background: 'rgba(16,185,129,0.1)', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Award size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.class} · {s.subject}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.05rem' }}>{s.avg}</span>
              </div>
            )) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <TrendingUp size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.9rem' }}>No results out</div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

