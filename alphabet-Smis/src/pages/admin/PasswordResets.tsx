import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import '../../App.css';

interface ResetRequest {
  id: number;
  email: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export default function PasswordResets() {
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchRequests = async () => {
    setIsLoading(true);
    setStatusMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/password-resets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch password reset tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/admin/password-resets/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage({ text: `Successfully reset password for ticket #${id} to 'pass1234'`, type: 'success' });
        fetchRequests(); // Refresh the list
      } else {
        setStatusMessage({ text: data.message || 'Failed to resolve request', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to resolve request:', err);
      setStatusMessage({ text: 'A network error occurred. Please try again.', type: 'error' });
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Password Resets</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
            Manage user tickets reporting lost passwords.
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px', 
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
          {statusMessage.text}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tickets...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>TICKET ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>ACCOUNT EMAIL</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>STATUS</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>REQUESTED ON</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{req.id}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-light)' }}>{req.email}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: req.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: req.status === 'RESOLVED' ? '#10b981' : '#f59e0b'
                      }}>
                        {req.status === 'RESOLVED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      {req.status === 'PENDING' ? (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleResolve(req.id)}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <ShieldAlert size={14} /> Reset Pass1234
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Resolved on {new Date(req.resolvedAt!).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No password reset requests pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
