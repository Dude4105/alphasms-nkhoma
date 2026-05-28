import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Phone, 
  MapPin, Calendar, Shield,
  ChevronDown, Heart, Info, Home
} from 'lucide-react';

export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [studentId] = useState('STU-2025-' + Math.floor(100 + Math.random() * 900));
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [scholarType, setScholarType] = useState('Boarding');

  // Guardian Info
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');

  // Live data
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [dbHostels, setDbHostels] = useState<any[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [classRes, hostelRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/classes`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/hostels`, { headers })
        ]);

        const classJson = await classRes.json();
        const hostelJson = await hostelRes.json();

        if (classRes.ok && classJson.data) setDbClasses(classJson.data);
        if (hostelRes.ok && hostelJson.data) setDbHostels(hostelJson.data);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.application) {
      const app = location.state.application;
      setFirstName(app.firstName || '');
      setLastName(app.surname || '');
      setGender(app.gender || '');
      setDob(app.dob || '');
      setScholarType(app.boardingStatus || 'Boarding');
      setGuardianName(`${app.guardianTitle} ${app.guardianName}`);
      setRelationship(app.guardianRelation || '');
      setGuardianPhone(app.phone || '');
      setGuardianEmail(app.email || '');
      setAddress(app.guardianAddress || '');
    }
  }, [location.state]);

  const classOptions = dbClasses.map(c => c.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          dob,
          student_id: studentId,
          enrollmentDate,
          className: selectedClass,
          scholarType,
          hostelId: scholarType === 'Boarding' && selectedHostel ? selectedHostel : undefined,
          guardianName,
          guardianRelation: relationship,
          guardianPhone,
          guardianEmail,
          guardianAddress: address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add student');
      }

      // If from application, update application status
      if (location.state?.application?.id) {
        await fetch(`${import.meta.env.VITE_API_URL}/enrollment/applications/${location.state.application.id}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ status: 'APPROVED' })
        });
      }

      navigate('/admin/students');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = firstName && lastName && gender && selectedClass && guardianName && guardianPhone && (scholarType === 'Day' || selectedHostel);

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/students')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Students
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Register New Student</h1>
            <p style={{ color: 'var(--text-muted)' }}>Enroll a new student into the academy's official records.</p>
          </div>
          <button 
            type="submit"
            form="add-student-form"
            className="btn btn-primary" 
            disabled={!isFormValid || isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#3b82f6' }}
          >
            <Save size={16} /> {isSubmitting ? 'Registering...' : 'Register Student'}
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
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Doe" required />
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
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Student ID (Internal)</label>
                  <div className="input-wrapper">
                    <Shield className="input-icon" size={18} />
                    <input type="text" value={studentId} readOnly style={{ background: 'rgba(255,255,255,0.02)', cursor: 'default' }} />
                  </div>
                </div>
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
              </div>

              {/* Hostel Allocation (Boarding Only) */}
              {scholarType === 'Boarding' && (
                <div className="form-group animate-fade" style={{ marginTop: '0.5rem' }}>
                  <label style={{ color: 'var(--primary-gold)', fontWeight: 600 }}>Hostel Allocation</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-gold)', pointerEvents: 'none' }}>
                      <Home size={18} />
                    </div>
                    <select 
                      value={selectedHostel} 
                      onChange={e => setSelectedHostel(e.target.value)} 
                      style={{ 
                        background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--text-light)', padding: '0.65rem 0.85rem 0.65rem 2.8rem', borderRadius: '8px',
                        fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                      }}
                      required
                    >
                      <option value="">Select Hostel</option>
                      {dbHostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary-gold)' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Assigned Class</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={selectedClass} 
                      onChange={e => setSelectedClass(e.target.value)} 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                        fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                      }}
                      required
                    >
                      <option value="">Select Class</option>
                      {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Enrollment Date</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={18} />
                    <input type="date" value={enrollmentDate} onChange={e => setEnrollmentDate(e.target.value)} required />
                  </div>
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
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Guardian Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="e.g. Mr. Peter Doe" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Relationship to Student</label>
                <input type="text" value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. Father, Aunt, Sponsor" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guardian Phone</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="+265..." required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guardian Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input type="email" value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} placeholder="guardian@email.com" />
                  </div>
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
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.25rem', marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <Info size={24} color="#3b82f6" />
          <p style={{ fontSize: '0.85rem', color: 'var(--silver-light)', margin: 0 }}>
            Standard enrollment fees and biological data verification will be required during official induction. 
            Ensure all guardian contact information is accurate for emergency notifications.
          </p>
        </div>
      </form>

      {/* Preview Panel */}
      {(firstName || lastName) && (
        <div className="glass-panel animate-slide-up" style={{ borderRadius: '12px', padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-light)', fontSize: '1.15rem' }}>{firstName} {lastName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentId} · {selectedClass || 'No Class Assigned'}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scholar Type</div>
              <div style={{ fontWeight: 600, color: 'var(--primary-gold)' }}>{scholarType}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
