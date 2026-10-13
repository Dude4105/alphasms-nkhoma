import { useState, useEffect } from 'react';
import { 
  Shield, Lock, Save, Loader, CheckCircle2, AlertCircle, 
  Mail, Phone, User, Calendar
} from 'lucide-react';

export default function AdminProfile() {
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setAdminData(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/change-password`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          currentPass: passwordForm.currentPassword, 
          newPass: passwordForm.newPassword 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error updating password' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={48} className="spin" color="#3b82f6" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="header-stack" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and security settings.</p>
      </div>

      {message.text && (
        <div className={`notification ${message.type}`} style={{ 
          padding: '1rem', borderRadius: '12px', marginBottom: '2rem', 
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Personal Info */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={22} color="#3b82f6" /> Personal Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>First Name</label>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontWeight: 600 }}>
                  {adminData?.firstName}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Last Name</label>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontWeight: 600 }}>
                  {adminData?.lastName}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <Mail size={18} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>{adminData?.email}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <Phone size={18} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>{adminData?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Shield size={18} color="#3b82f6" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#3b82f6' }}>Account Role</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>System Administrator with Full Access</p>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock size={22} color="#ef4444" /> Security & Access
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Password</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <Shield size={18} color="var(--text-muted)" />
                <input 
                  type="password" 
                  style={{ background: 'none', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <Lock size={18} color="var(--text-muted)" />
                <input 
                  type="password" 
                  style={{ background: 'none', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm New Password</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                <CheckCircle2 size={18} color="var(--text-muted)" />
                <input 
                  type="password" 
                  style={{ background: 'none', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required 
                />
              </div>
            </div>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ marginTop: '2.5rem', width: '100%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {isSaving ? <Loader size={18} className="spin" /> : <Lock size={18} />} Update Password
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        .input-wrapper:focus-within { border-color: #ef4444 !important; background: rgba(239,68,68,0.05) !important; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
