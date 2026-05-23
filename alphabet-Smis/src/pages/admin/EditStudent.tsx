import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Phone, 
  MapPin, Calendar, Shield,
  ChevronDown, Heart, Info
} from 'lucide-react';

export default function EditStudent() {
  const { studentId: urlStudentId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Student Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [studentId, setStudentId] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState('');
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // 1. Fetch Classes for dropdown
        const classRes = await fetch('http://localhost:3000/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const classJson = await classRes.json();
        if (classRes.ok && classJson.data) {
          setDbClasses(classJson.data);
        }

        // 2. Fetch Student Data
        const studentRes = await fetch(`http://localhost:3000/students/${urlStudentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const student = await studentRes.json();

        if (studentRes.ok && student) {
          setFirstName(student.firstName || '');
          setLastName(student.lastName || '');
          setGender(student.gender || '');
          setDob(student.dob || '');
          setStudentId(student.student_id || '');
          setEnrollmentDate(student.enrollmentDate || '');
          setSelectedClass(student.class?.name || '');
          setScholarType(student.scholarType || 'Boarding');
          setGuardianName(student.guardianName || '');
          setRelationship(student.guardianRelation || '');
          setGuardianPhone(student.guardianPhone || '');
          setGuardianEmail(student.guardianEmail || '');
          setAddress(student.guardianAddress || '');
        }
      } catch (err) {
        console.error('Error fetching edit data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [urlStudentId]);

  const classOptions = dbClasses.map(c => c.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/students/${urlStudentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          dob,
          student_id: studentId, // This allows changing the ID
          enrollmentDate,
          className: selectedClass,
          scholarType,
          guardianName,
          guardianRelation: relationship,
          guardianPhone,
          guardianEmail,
          guardianAddress: address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      navigate(`/admin/students/${studentId}`);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = firstName && lastName && gender && selectedClass && guardianName && guardianPhone;

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading student records...</div>;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(`/admin/students/${urlStudentId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Edit Student Profile</h1>
            <p style={{ color: 'var(--text-muted)' }}>Modify official records and guardian information for {firstName}.</p>
          </div>
          <button 
            type="submit"
            form="edit-student-form"
            className="btn btn-primary" 
            disabled={!isFormValid || isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: 'var(--primary-gold)', color: 'black' }}
          >
            <Save size={16} /> {isSubmitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form id="edit-student-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          
          {/* Personal & Academic Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary-gold)" /> Student Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Surname</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
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
                  <label>Student ID (Confirm Change)</label>
                  <div className="input-wrapper">
                    <Shield className="input-icon" size={18} />
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} style={{ background: 'rgba(215, 185, 0, 0.05)', color: 'var(--primary-gold)' }} />
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
                  <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Relationship to Student</label>
                <input type="text" value={relationship} onChange={e => setRelationship(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guardian Phone</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Guardian Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input type="email" value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} />
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
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.25rem', marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(215, 185, 0, 0.05)', borderColor: 'rgba(215, 185, 0, 0.2)' }}>
          <Info size={24} color="var(--primary-gold)" />
          <p style={{ fontSize: '0.85rem', color: 'var(--silver-light)', margin: 0 }}>
            You are editing an official academic record. Changes to the Student ID or Class Enrollment will be reflected immediately across the entire system.
          </p>
        </div>
      </form>
    </div>
  );
}
