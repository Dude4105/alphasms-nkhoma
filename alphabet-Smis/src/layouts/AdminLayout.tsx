import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen,
  ClipboardList, 
  Settings,
  LogOut, 
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  Wallet,
  Home,
  Key,
  User,
  Image,
  Wifi,
  WifiOff
} from 'lucide-react';
import '../App.css';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'light';
  });
  const [adminProfile, setAdminProfile] = useState<any>(null);
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
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProfile(data);
      } else if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (err) {
      console.error('Failed to fetch admin profile', err);
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
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
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
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Students', icon: <Users size={20} />, path: '/admin/students' },
    { name: 'Teachers', icon: <GraduationCap size={20} />, path: '/admin/teachers' },
    { name: 'Classes', icon: <BookOpen size={20} />, path: '/admin/classes' },
    { name: 'Subjects', icon: <BookOpen size={20} />, path: '/admin/subjects' },
    { name: 'Enrollment', icon: <ClipboardList size={20} />, path: '/admin/enrollment' },
    { name: 'Finance', icon: <Wallet size={20} />, path: '/admin/finance' },
    { name: 'Boarding', icon: <Home size={20} />, path: '/admin/boarding' },
    { name: 'Password Resets', icon: <Key size={20} />, path: '/admin/password-resets' },
    { name: 'School Feeds', icon: <Image size={20} />, path: '/admin/feeds' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
    { name: 'My Profile', icon: <User size={20} />, path: '/admin/profile' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.name === 'Dashboard' || item.name === 'My Profile') return true;
    if (adminProfile?.permissions && Array.isArray(adminProfile.permissions)) {
      if (adminProfile.permissions.length === 0) return true;
      return adminProfile.permissions.includes(item.name);
    }
    return true;
  });

  return (
    <div className="system-layout">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, 
            background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={20} />
          </div>
          <span>Admin Portal</span>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end={item.path === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active admin-active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-link" 
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

      <main className="main-content">
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
              <input type="text" placeholder="Search anything..." />
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
              onClick={() => navigate('/admin/profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', position: 'relative' }}>
                <Shield size={20} />
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
                <span className="user-name">Admin {adminProfile?.lastName || 'User'}</span>
                <span className="user-role">System Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-active {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
