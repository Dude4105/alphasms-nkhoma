import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Phone, 
  GraduationCap, BookOpen, Plus, 
  ChevronDown, Shield, Calendar, Award
} from 'lucide-react';

export default function AddTeacher() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId] = useState('TCH-' + Math.floor(100 + Math.random() * 900));
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualification, setQualification] = useState('');

  // Assignments
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Data from DB
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [subRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/subjects?limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const subData = await subRes.json();

        if (subRes.ok) setDbSubjects(subData.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const subjectOptions = dbSubjects.map(s => s.name);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          email,
          phone,
          employeeId,
          joiningDate,
          qualification,
          subjects: selectedSubjects,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register teacher');
      }

      navigate('/admin/teachers');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const isFormValid = firstName && lastName && gender && email && phone && selectedSubjects.length > 0;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/teachers')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Teachers
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Add New Teacher</h1>
            <p style={{ color: 'var(--text-muted)' }}>Register a new teaching staff member and assign their subjects.</p>
          </div>
          <button 
            type="submit"
            form="add-teacher-form"
            className="btn btn-primary" 
            disabled={!isFormValid || isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#3b82f6' }}
          >
            <Save size={16} /> {isSubmitting ? 'Registering...' : 'Register Teacher'}
          </button>
        </div>
      </div>

      <form id="add-teacher-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
          
          {/* Personal Info */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#3b82f6" /> Personal Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Kondwani" required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Banda" required />
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
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Employee ID</label>
                  <div className="input-wrapper">
                    <Shield className="input-icon" size={18} />
                    <input type="text" value={employeeId} readOnly style={{ background: 'rgba(255,255,255,0.02)', cursor: 'default' }} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kbanda@heroesacademy.mw" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+265..." required />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#10b981" /> Professional Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Joining Date</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Qualifications / Degrees</label>
                <div className="input-wrapper">
                  <GraduationCap className="input-icon" size={18} />
                  <input type="text" value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. B.Sc in Education (Biology)" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Subjects Qualified to Teach</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {subjectOptions.map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      style={{
                        padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        background: selectedSubjects.includes(subj) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid',
                        borderColor: selectedSubjects.includes(subj) ? '#3b82f6' : 'var(--glass-border)',
                        color: selectedSubjects.includes(subj) ? '#3b82f6' : 'var(--text-muted)'
                      }}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Panel */}
      {firstName && (
        <div className="glass-panel animate-slide-up" style={{ borderRadius: '12px', padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-light)', fontSize: '1.15rem' }}>{firstName} {lastName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{employeeId} · {selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'No subjects selected'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
