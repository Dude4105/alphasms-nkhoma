import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Plus, Trash2, ChevronDown, 
  Save, GraduationCap, MapPin, Users
} from 'lucide-react';
import SearchableSelect from '../../components/common/SearchableSelect';

interface SubjectEntry {
  id: string;
  name: string;
  teacher: string;
  periods: number;
}

export default function CreateClass() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Class info
  const [formName, setFormName] = useState('');
  const [stream, setStream] = useState('');
  const [level, setLevel] = useState('Secondary');
  const [track, setTrack] = useState('Sciences & Humanities');
  const [room, setRoom] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [schedule, setSchedule] = useState('Mon–Fri, 7:00 AM – 3:30 PM');
  const [capacity, setCapacity] = useState(40);

  // Subjects
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: '1', name: '', teacher: '', periods: 4 },
  ]);

  // Live data
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [subRes, tchRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/subjects?limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/teachers?limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const subData = await subRes.json();
        const tchData = await tchRes.json();

        if (subRes.ok) setDbSubjects(subData.data || []);
        if (tchRes.ok) setDbTeachers(tchData.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const availableTeachers = dbTeachers.map(t => `${t.firstName} ${t.lastName}`);
  const subjectOptions = dbSubjects.map(s => s.name);

  // Dynamic form name options based on school level
  const getFormNameOptions = () => {
    switch (level) {
      case 'Primary':
        return Array.from({ length: 8 }, (_, i) => ({ value: `Standard ${i + 1}`, label: `Standard ${i + 1}` }));
      case 'Secondary':
        return Array.from({ length: 4 }, (_, i) => ({ value: `Form ${i + 1}`, label: `Form ${i + 1}` }));
      case 'Nursery':
        return [
          { value: 'Reception', label: 'Reception' },
          { value: 'Nursery', label: 'Nursery' }
        ];
      default:
        return [];
    }
  };

  const formNameOptions = getFormNameOptions();

  // Reset formName when level changes
  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    setFormName('');
  };

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: '', teacher: '', periods: 4 }]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, value: any) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const totalPeriods = subjects.reduce((sum, s) => sum + s.periods, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formName,
          stream,
          level,
          track,
          room,
          classTeacher,
          schedule,
          capacity,
          subjects: subjects.filter(s => s.name && s.teacher)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create class');
      }

      navigate('/admin/classes');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formName && stream && room && classTeacher && subjects.length > 0 && subjects.every(s => s.name && s.teacher);

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-light)',
    padding: '0.65rem 2rem 0.65rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    appearance: 'none',
    cursor: 'pointer',
    width: '100%'
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/classes')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Classes
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Create New Class</h1>
            <p style={{ color: 'var(--text-muted)' }}>Set up a new class with all required information.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem' }}
          >
            <Save size={16} /> {isSubmitting ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>

        {/* Basic Info */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#3b82f6" /> Basic Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>School Level</label>
              <div style={{ position: 'relative' }}>
                <select value={level} onChange={e => handleLevelChange(e.target.value)} style={selectStyle}>
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Form / Class</label>
                <div style={{ position: 'relative' }}>
                  <select value={formName} onChange={e => setFormName(e.target.value)} style={selectStyle}>
                    <option value="">Select {level === 'Primary' ? 'Standard' : level === 'Nursery' ? 'Class' : 'Form'}</option>
                    {formNameOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Stream</label>
                <input type="text" value={stream} onChange={e => setStream(e.target.value)} placeholder="e.g. A, B, C" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Academic Track</label>
              <div style={{ position: 'relative' }}>
                <select value={track} onChange={e => setTrack(e.target.value)} style={selectStyle}>
                  <option value="Sciences & Humanities">Sciences & Humanities</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Humanities">Humanities</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Class Details */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#10b981" /> Class Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Class Teacher</label>
              <SearchableSelect 
                options={availableTeachers}
                value={classTeacher}
                onChange={setClassTeacher}
                placeholder="Search Class Teacher..."
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Classroom / Room</label>
              <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Block A - Room 101" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Schedule</label>
              <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. Mon-Fri, 7:00 AM - 3:30 PM" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Maximum Student Capacity</label>
              <input type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value) || 0)} min={1} max={100} />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} color="var(--primary-gold)" /> Subjects & Teachers
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {totalPeriods} periods/week
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 42px', gap: '1rem', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Subject</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Teacher</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Periods/wk</span>
            <span></span>
          </div>

          {subjects.map((subj) => (
            <div 
              key={subj.id} 
              style={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr 100px 42px', gap: '1rem', 
                alignItems: 'center', padding: '0.75rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)'
              }}
            >
              <SearchableSelect 
                options={dbSubjects
                  .map(s => s.name)
                  .filter(name => !subjects.some(subj2 => subj2.name === name && subj2.id !== subj.id))
                }
                value={subj.name}
                onChange={val => updateSubject(subj.id, 'name', val)}
                placeholder="Search Subject..."
              />
              <SearchableSelect 
                options={dbTeachers
                  .filter(t => !subj.name || (Array.isArray(t.subjects) && t.subjects.includes(subj.name)))
                  .map(t => `${t.firstName} ${t.lastName}`)
                }
                value={subj.teacher}
                onChange={val => updateSubject(subj.id, 'teacher', val)}
                placeholder="Search Teacher..."
              />
              <input 
                type="number" 
                value={subj.periods} 
                onChange={e => updateSubject(subj.id, 'periods', parseInt(e.target.value) || 0)}
                min={1} max={10}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-light)', padding: '0.65rem 0.5rem', borderRadius: '8px',
                  textAlign: 'center', fontSize: '0.9rem', width: '100%'
                }}
              />
              <button 
                onClick={() => removeSubject(subj.id)}
                disabled={subjects.length <= 1}
                style={{ 
                  background: subjects.length <= 1 ? 'transparent' : 'rgba(239,68,68,0.1)',
                  color: subjects.length <= 1 ? 'var(--glass-border)' : '#ef4444',
                  border: '1px solid transparent', width: 42, height: 42, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: subjects.length <= 1 ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={addSubject}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            width: '100%', padding: '0.85rem', border: '2px dashed var(--glass-border)',
            borderRadius: '10px', background: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary-gold)';
            e.currentTarget.style.color = 'var(--primary-gold)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Plus size={18} /> Add Another Subject
        </button>
      </div>

      {/* Summary Preview */}
      {formName && stream && (
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid #3b82f6' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#3b82f6" /> Class Preview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class Name</span>
              <div style={{ fontWeight: 700, color: 'var(--text-light)', fontSize: '1.1rem' }}>{formName}{stream}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</span>
              <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>{level}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Track</span>
              <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>{track}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class Teacher</span>
              <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>{classTeacher || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room</span>
              <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>{room || '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subjects</span>
              <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>{subjects.filter(s => s.name).length} assigned</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .glass-panel [style*="grid-template-columns: 1fr 1fr 100px 42px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
