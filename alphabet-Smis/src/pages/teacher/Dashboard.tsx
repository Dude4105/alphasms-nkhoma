import { useState, useEffect } from 'react';
import { Users, GraduationCap, Clock, CalendarDays, Loader, AlertCircle, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [termContext, setTermContext] = useState({ term: '', year: '' });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/teachers/me/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard data');

        const json = await res.json();
        setData(json);

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
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Syncing your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem', borderRadius: '16px' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Unable to load dashboard data.'}</p>
      </div>
    );
  }

  const iconMap: any = {
    'Users': <Users size={24} />,
    'Clock': <Clock size={24} />,
    'GraduationCap': <GraduationCap size={24} />,
    'CalendarDays': <CalendarDays size={24} />
  };

  return (
    <div className="dashboard-page animate-fade">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', color: 'var(--silver-light)' }}>Welcome back, {data.teacherName}</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          Here is your academic overview for today.
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

      {/* Stats Grid */}
      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {data.stats.map((stat: any, i: number) => (
          <div key={i} className="glass-panel stat-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px' }}>
            <div className="stat-icon" style={{ background: stat.bg, padding: '1rem', borderRadius: '12px', color: 'var(--primary-gold)' }}>
              {iconMap[stat.icon] || <Users size={24} />}
            </div>
            <div>
              <div className="stat-title" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{stat.title}</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-light)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Today's Schedule */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary-gold)" /> Today's Schedule
          </h2>
          <div className="schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.schedule.length > 0 ? data.schedule.map((cls: any, i: number) => (
              <div key={i} style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                background: cls.active ? 'var(--primary-gold-dim)' : 'rgba(255,255,255,0.03)',
                borderLeft: cls.active ? '4px solid var(--primary-gold)' : '4px solid transparent'
              }}>
                <div style={{ color: cls.active ? 'var(--primary-gold)' : 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{cls.time}</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: cls.active ? '#fff' : 'var(--text-light)' }}>{cls.subject}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cls.room}</div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Announcements */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary-gold)" /> Department Notices
          </h2>
          <div className="notice-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.notices.map((notice: any, i: number) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-light)' }}>{notice.title}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{notice.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

