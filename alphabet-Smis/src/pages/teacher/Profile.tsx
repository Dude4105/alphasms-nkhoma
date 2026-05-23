import { useState, useEffect } from 'react';
import { 
  User, Lock, ShieldCheck, Mail, 
  BookOpen, Hash, GraduationCap, CheckCircle
} from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/teachers/me/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/teachers/me/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update password');
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading profile...</div>;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account settings and security credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Account Details */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-gold-dim)', padding: '1rem', borderRadius: '12px', color: 'var(--primary-gold)' }}>
              <User size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>{profile?.name}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Teacher ID: {profile?.teacher_id || 'N/A'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} color="var(--primary-gold)" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ color: 'var(--text-light)' }}>{profile?.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BookOpen size={20} color="#3b82f6" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department / Subjects</p>
                <p style={{ color: 'var(--text-light)' }}>{profile?.subjects?.join(', ') || 'General Educator'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <GraduationCap size={20} color="#10b981" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Classes</p>
                <p style={{ color: 'var(--text-light)' }}>{profile?.classes?.join(', ') || 'No classes assigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password Form */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--silver-light)' }}>
            <ShieldCheck size={24} color="#ef4444" /> Account Security
          </h2>
          
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} /> Current Password
              </label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} /> New Password
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} /> Confirm New Password
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>

            {message && (
              <div style={{ 
                padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem',
                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? '#10b981' : '#ef4444',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {message.type === 'success' && <CheckCircle size={16} />}
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isUpdating}
              style={{ padding: '0.85rem', marginTop: '0.5rem', background: '#ef4444' }}
            >
              {isUpdating ? 'Updating...' : 'Update Login Password'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-light)' }}>Security Tip:</p>
            <p>Use at least 8 characters with a mix of letters, numbers, and symbols for a stronger password.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
