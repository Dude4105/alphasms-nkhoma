import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import '../App.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://alphabetsmis-ii.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate based on role from backend
      const role = data.user.role?.toLowerCase() || '';
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/'); // default fallback
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // We still fail gracefully, but the backend doesn't throw 400 for unfound emails
        // so this is strictly for network errors.
        console.error('Password reset request failed');
      }

      setIsResetSent(true);
    } catch (err: any) {
      setError('An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="apply-page-overlay">
      <div className="glass-panel modal-container" style={{ margin: 'auto', maxWidth: '450px', padding: '3rem 2rem' }}>
        <button 
          className="modal-close" 
          onClick={() => navigate('/')}
          title="Back to Home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', left: '1.5rem', right: 'auto', top: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} /> Home
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
          <img src="/heroesLogo.png" alt="Heroes Academy" style={{ height: '60px', marginBottom: '1rem' }} />
          <h2 className="step-title" style={{ marginBottom: '0.5rem' }}>
            {isForgotPassword ? 'Reset Password' : 'Portal Login'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isForgotPassword 
              ? (isResetSent ? 'Check your email' : 'Enter your email to receive a reset link')
              : 'Sign in to access your dashboard'
            }
          </p>
        </div>

        {error && !isForgotPassword && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1.5rem', 
            borderRadius: '0.5rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {isForgotPassword ? (
          isResetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem'
              }}>
                A password reset link has been sent to <strong>{email}</strong> if it exists in our system.
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { setIsForgotPassword(false); setIsResetSent(false); setEmail(''); }}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="info@heroesacademy.mw"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-gold)', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
