import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, User, Mail, Phone, 
  MapPin, Calendar, Shield,
  ChevronDown, Heart, Info, CheckCircle, Users
} from 'lucide-react';

export default function AddClassStudent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Student Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [scholarType, setScholarType] = useState('Boarding');
  const [previousSchool, setPreviousSchool] = useState('');

  // Teacher's main class (fetched live)
  const [mainClassName, setMainClassName] = useState('');
  const [isLoadingClass, setIsLoadingClass] = useState(true);

  // Guardian Info
  const [guardianTitle, setGuardianTitle] = useState('Mr.');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianWhatsapp, setGuardianWhatsapp] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');

  // Fetch teacher's main class on mount
  useEffect(() => {
    const fetchMainClass = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/main-class`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.class?.name) {
          setMainClassName(json.class.name);
        }
      } catch (err) {
        console.error('Error fetching main class:', err);
      } finally {
        setIsLoadingClass(false);
      }
    };
    fetchMainClass();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/enrollment/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          surname: lastName,
          gender,
          targetClass: mainClassName,
          boardingStatus: scholarType,
          previousSchool,
          dob,
          guardianTitle,
          guardianName,
          guardianRelation: guardianRelationship,
          guardianAddress: address,
          whatsapp: guardianWhatsapp,
          phone: guardianPhone,
          email: guardianEmail,
        })
      });

      if (!res.ok) throw new Error('Submission failed');

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/teacher/main-class');
      }, 2500);
    } catch (err) {
      alert('Failed to submit the enrollment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = firstName && lastName && gender && guardianName && guardianPhone && guardianRelationship && mainClassName;

  // Success state
  if (isSuccess) {
    return (
      <div className="animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '24px', maxWidth: '440px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ color: 'var(--silver-light)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Request Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            The enrollment request for <strong style={{ color: 'var(--text-light)' }}>{firstName} {lastName}</strong> has been sent to the administration for verification.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirecting back to your class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/teacher/main-class')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to My Class
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Request Student Enrollment</h1>
            <p style={{ color: 'var(--text-muted)' }}>Submit a student enrollment request for admin verification.</p>
          </div>
          <button 
            type="submit"
            form="add-student-form"
            className="btn btn-primary" 
            disabled={!isFormValid || isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </div>

      <form id="add-student-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          
          {/* Personal & Academic Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#3b82f6" /> Student Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. John" required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Surname</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Phiri" required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Gender</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)} 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                        fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                      }}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Date of Birth</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Scholar Type</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={scholarType} 
                      onChange={e => setScholarType(e.target.value)} 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                        fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                      }}
                    >
                      <option value="Boarding">Boarding</option>
                      <option value="Day">Day Scholar</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Previous School</label>
                  <div className="input-wrapper">
                    <Shield className="input-icon" size={18} />
                    <input type="text" value={previousSchool} onChange={e => setPreviousSchool(e.target.value)} placeholder="e.g. Kamuzu Academy" />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Target Class (Locked)</label>
                <div className="input-wrapper">
                  <Users className="input-icon" size={18} />
                  <input 
                    type="text" 
                    value={isLoadingClass ? 'Loading...' : (mainClassName || 'No class assigned')} 
                    readOnly 
                    style={{ background: 'rgba(255,255,255,0.02)', cursor: 'default', color: '#3b82f6', fontWeight: 600 }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="#ef4444" /> Guardian Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Title</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={guardianTitle} 
                      onChange={e => setGuardianTitle(e.target.value)} 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                        fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                      }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guardian Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="e.g. Peter Doe" required />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Relationship to Student</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={guardianRelationship} 
                    onChange={e => setGuardianRelationship(e.target.value)} 
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                    }}
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="+265..." required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>WhatsApp Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" value={guardianWhatsapp} onChange={e => setGuardianWhatsapp(e.target.value)} placeholder="+265..." />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Guardian Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} placeholder="guardian@email.com" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Residential Address</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <textarea 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="Physical address of the student's legal residence"
                    style={{ 
                      width: '100%', minHeight: '80px', padding: '0.65rem 0.85rem 0.65rem 2.8rem',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      borderRadius: '8px', color: 'var(--text-light)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note Panel */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.25rem', marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <Info size={24} color="#f59e0b" />
          <p style={{ fontSize: '0.85rem', color: 'var(--silver-light)', margin: 0 }}>
            This request will be submitted to the <strong>Administration</strong> for verification. 
            Once approved, the student will be officially registered into <strong>{mainClassName || 'your class'}</strong> and a system account will be created.
          </p>
        </div>
      </form>
    </div>
  );
}
