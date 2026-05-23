import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, Globe, Phone, X, Save, Loader, CheckCircle2, ArrowLeft, Trash2 
} from 'lucide-react';

const AVAILABLE_TABS = [
  'Students', 'Teachers', 'Classes', 'Subjects', 
  'Enrollment', 'Finance', 'Boarding', 'Password Resets', 'School Feeds', 'Settings', 'Edit Admin Access', 'Delete Admin'
];

export default function AdminDetail() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [meData, setMeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [adminRes, meRes] = await Promise.all([
          fetch(`http://localhost:3000/admin/${adminId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:3000/admin/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!adminRes.ok) throw new Error('Failed to fetch admin details');
        setAdminData(await adminRes.json());
        if (meRes.ok) setMeData(await meRes.json());
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmin();
  }, [adminId]);

  const handleUpdatePermissions = async () => {
    setIsUpdatingPermissions(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/admin/${adminId}/permissions`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: editedPermissions })
      });
      if (!res.ok) throw new Error('Failed to update permissions');
      setMessage({ type: 'success', text: `Permissions updated successfully.` });
      
      setAdminData({ ...adminData, permissions: editedPermissions });
      setIsEditingPermissions(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error updating permissions.' });
    } finally {
      setIsUpdatingPermissions(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!window.confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/admin/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete admin');
      
      setMessage({ type: 'success', text: 'Admin deleted successfully. Redirecting...' });
      setTimeout(() => navigate('/admin/settings'), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error deleting admin.' });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>{error || 'Admin not found.'}</p>
        <button className="btn" onClick={() => navigate('/admin/settings')} style={{ marginTop: '1rem' }}>Back to Settings</button>
      </div>
    );
  }

  const canEditAdmins = !meData?.permissions || meData.permissions.length === 0 || meData.permissions.includes('Edit Admin Access');
  const canDeleteAdmins = !meData?.permissions || meData.permissions.length === 0 || meData.permissions.includes('Delete Admin');

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/admin/settings')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {message.text && (
        <div style={{ 
          padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', 
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: message.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{adminData.firstName} {adminData.lastName}</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem' }}>Administrator Profile</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <Globe size={24} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{adminData.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <Phone size={24} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Phone</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{adminData.phone || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Module Access</h2>
          {!isEditingPermissions ? (
            canEditAdmins && (
              <button 
                onClick={() => {
                  setIsEditingPermissions(true);
                  setEditedPermissions(adminData.permissions || [...AVAILABLE_TABS]);
                }}
                style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', 
                  padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                }}
              >
                Edit Permissions
              </button>
            )
          ) : (
            <button 
              type="button" 
              onClick={() => setEditedPermissions(editedPermissions.length === AVAILABLE_TABS.length ? [] : [...AVAILABLE_TABS])}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', 
                padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              {editedPermissions.length === AVAILABLE_TABS.length ? 'Deselect All' : 'Select All Modules'}
            </button>
          )}
        </div>
        
        {isEditingPermissions ? (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '16px', 
            marginBottom: '2rem', border: '1px solid var(--glass-border)' 
          }}>
            {AVAILABLE_TABS.map(tab => {
              const isSelected = editedPermissions.includes(tab);
              return (
                <div 
                  key={tab} 
                  onClick={() => {
                    setEditedPermissions(prev => isSelected ? prev.filter(p => p !== tab) : [...prev, tab]);
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', 
                    padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600,
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#3b82f6' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected ? <CheckCircle2 size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '4px', border: '2px solid rgba(255,255,255,0.2)' }} />}
                  {tab}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            {adminData.permissions && adminData.permissions.length > 0 ? (
              adminData.permissions.map((p: string) => (
                <span key={p} style={{ padding: '0.6rem 1.2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600 }}>
                  {p}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
                Full Access (All Modules)
              </span>
            )}
          </div>
        )}

        {isEditingPermissions && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              onClick={handleUpdatePermissions}
              disabled={isUpdatingPermissions}
              className="btn-primary" 
              style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
            >
              {isUpdatingPermissions ? <Loader size={18} className="spin" /> : <Save size={18} />} Save Changes
            </button>
            <button 
              onClick={() => { setIsEditingPermissions(false); setEditedPermissions(adminData.permissions || [...AVAILABLE_TABS]); }}
              style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {canDeleteAdmins && !isEditingPermissions && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleDeleteAdmin}
            disabled={isDeleting}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', 
              borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isDeleting ? <Loader size={16} className="spin" /> : <Trash2 size={16} />} 
            {isDeleting ? 'Deleting...' : 'Delete Administrator'}
          </button>
        </div>
      )}
    </div>
  );
}
