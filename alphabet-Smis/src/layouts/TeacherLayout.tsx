import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut, 
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import '../App.css';

export default function TeacherLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'light';
  });
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'warning'>('success');
  const statusTimerRef = useRef<any>(null);

  useEffect(() => {
    const triggerToast = (message: string, type: 'success' | 'warning') => {
      setStatusMessage(message);
      setStatusType(type);
      setShowStatusToast(true);

      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }

      statusTimerRef.current = setTimeout(() => {
        setShowStatusToast(false);
      }, 2000);
    };

    const handleOnline = () => {
      setIsOnline(true);
      triggerToast('Back online. System synced.', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      triggerToast('Offline mode. Changes will sync when online.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setIsOnline(false);
      triggerToast('Offline mode. Changes will sync when online.', 'warning');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch('http://localhost:3000/teachers/me/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Teacher profile fetched:', data);
        setTeacherProfile(data);
      } else if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch teacher profile:', errorData);
      }
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
    }
  };

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to logout on backend', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/teacher' },
    { name: 'My Main Class', icon: <GraduationCap size={20} />, path: '/teacher/main-class' },
    { name: 'My Classes', icon: <Users size={20} />, path: '/teacher/classes' },
    { name: 'Grades Area', icon: <GraduationCap size={20} />, path: '/teacher/grades' },
    { name: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/teacher/attendance' },
    { name: 'My Profile', icon: <User size={20} />, path: '/teacher/profile' }
  ];

  return (
    <div className="system-layout bg-dark">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/heroesLogo.png" alt="Heroes Academy" />
          <span>Heroes Portal</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end={item.path === '/teacher'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-link theme-toggle-btn" 
            onClick={() => setIsLightMode(!isLightMode)}
            style={{ marginBottom: '0.5rem' }}
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            <span>{isLightMode ? 'Dark' : 'Light'} Mode</span>
          </button>
          
          <button className="sidebar-link text-danger" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="system-header glass-panel">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button 
              className="btn-icon mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="search-bar hidden-mobile">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search students, classes..." />
            </div>

            {/* Connection Status Badge */}
            {showStatusToast && (
              <div className={`connection-status-badge ${statusType}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: statusType === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: statusType === 'success' ? '#10b981' : '#f59e0b',
                border: statusType === 'success' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                boxShadow: statusType === 'success' ? '0 0 10px rgba(16, 185, 129, 0.05)' : '0 0 10px rgba(245, 158, 11, 0.05)',
                animation: 'pulse 2s infinite',
                whiteSpace: 'nowrap'
              }}>
                {statusType === 'success' ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          <div className="header-right">
            <div 
              className="user-profile" 
              onClick={() => navigate('/teacher/profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar" style={{ position: 'relative' }}>
                <Users size={20} />
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#ef4444',
                  border: '2px solid var(--glass-panel-bg, #1a1a1a)',
                  boxShadow: isOnline ? '0 0 6px rgba(16, 185, 129, 0.6)' : '0 0 6px rgba(239, 68, 68, 0.6)',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                }}></span>
              </div>
              <div className="user-info hidden-mobile">
                <span className="user-name" style={{ textTransform: 'capitalize' }}>
                  Teacher {teacherProfile?.lastName || 'User'}
                </span>
                <span className="user-role">Educator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Render Here */}
        <div className="page-content">
          <Outlet />
        </div>

        {/* Premium Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav glass-panel">
          <NavLink to="/teacher" end className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/teacher/classes" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Classes</span>
          </NavLink>
          <NavLink to="/teacher/grades" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
            <GraduationCap size={20} />
            <span>Grades</span>
          </NavLink>
          <NavLink to="/teacher/profile" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </main>
    </div>
  );
}
