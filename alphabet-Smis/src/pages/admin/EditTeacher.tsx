import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Mail, Phone, 
  Award, Briefcase, Plus, X, AlertTriangle, User,
  GraduationCap, Shield, BookOpen, ChevronDown, Check
} from 'lucide-react';

export default function EditTeacher() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  // Selection Data
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [teacherRes, subRes, clsRes] = await Promise.all([
          fetch(`http://localhost:3000/teachers/${teacherId}`, { headers }),
          fetch(`http://localhost:3000/subjects?limit=1000`, { headers }),
          fetch(`http://localhost:3000/classes?limit=1000`, { headers })
        ]);

        const teacher = await teacherRes.json();
        const subJson = await subRes.json();
        const clsJson = await clsRes.json();

        if (teacherRes.ok && teacher) {
          setFirstName(teacher.firstName || '');
          setLastName(teacher.lastName || '');
          setEmail(teacher.email || '');
          setPhone(teacher.phone || '');
          setQualification(teacher.qualification || '');
          setSubjects(Array.isArray(teacher.subjects) ? teacher.subjects : []);
        } else {
          navigate('/admin/teachers');
        }

        if (subJson.data) setAllSubjects(subJson.data);

      } catch (err) {
        console.error('Error fetching teacher for edit:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId, navigate]);

  const toggleSubject = (name: string) => {
    if (subjects.includes(name)) {
      setSubjects(subjects.filter(s => s !== name));
    } else {
      setSubjects([...subjects, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/teachers/${teacherId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          qualification,
          subjects,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update teacher');
      }

      navigate(`/admin/teachers/${teacherId}`);
    } catch (err) {
      alert('An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Synchronizing staff records...</div>;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button 
          onClick={() => navigate(`/admin/teachers/${teacherId}`)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.9rem',
            padding: 0, transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-light)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} /> Discard Changes
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-gold)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Administration Portal</div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--silver-light)', fontWeight: 800, marginBottom: '0.25rem' }}>Edit Staff Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Updating records for <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{firstName} {lastName}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button 
              type="submit"
              form="edit-teacher-form"
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.8rem', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                border: 'none'
              }}
            >
              <Save size={18} /> {isSubmitting ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>

      <form id="edit-teacher-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Context Card */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="glass-panel" style={{ borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: 100, height: 100, borderRadius: '30px', 
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                color: '#3b82f6', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(59,130,246,0.2)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}>
                <GraduationCap size={48} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-light)', fontWeight: 700, marginBottom: '0.25rem' }}>{firstName} {lastName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{teacherId}</p>
              
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                padding: '0.4rem 0.85rem', borderRadius: '100px',
                background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
              }}>
                <Shield size={14} /> Active Staff
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Assignments</div>
                    <div className="glass-panel" style={{ padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                       <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-light)' }}>{subjects.length}</div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Subjects</div>
                    </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '1.5rem', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--silver-light)', lineHeight: 1.5, margin: 0 }}>
              Modifying specializations will trigger an automatic update to the class timetable for the upcoming academic week.
            </p>
          </div>
        </div>

        {/* Right Column: Editing Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Identity */}
          <div className="glass-panel" style={{ borderRadius: '24px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--silver-light)' }}>
              <User size={22} color="#3b82f6" /> Identity & Contact
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem' }}
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Official Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Professional Qualifications</label>
                <div className="input-wrapper">
                  <GraduationCap className="input-icon" size={18} />
                  <input 
                    type="text" 
                    value={qualification} 
                    onChange={e => setQualification(e.target.value)} 
                    placeholder="e.g. B.Ed in Education (English)"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Specializations */}
          <div className="glass-panel" style={{ borderRadius: '24px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--silver-light)' }}>
              <Award size={22} color="var(--primary-gold)" /> Subject Specializations
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Select the subjects this teacher is qualified to deliver.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
              {subjects.length > 0 ? subjects.map(s => (
                <div key={s} style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: 'var(--primary-gold)', fontWeight: 600, fontSize: '0.9rem'
                }}>
                  {s}
                  <X size={14} onClick={() => toggleSubject(s)} style={{ cursor: 'pointer', opacity: 0.7 }} />
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No subjects assigned yet. Use the selection below.</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem', padding: '0.5rem' }} className="custom-scrollbar">
              {allSubjects.map(sub => {
                const isSelected = subjects.includes(sub.name);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.name)}
                    style={{
                      padding: '0.75rem', borderRadius: '12px', border: '1px solid',
                      borderColor: isSelected ? 'var(--primary-gold)' : 'var(--glass-border)',
                      background: isSelected ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? 'var(--primary-gold)' : 'var(--text-muted)',
                      fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left'
                    }}
                  >
                    {sub.name}
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
