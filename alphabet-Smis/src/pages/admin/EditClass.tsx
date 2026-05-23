import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function EditClass() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);

  // Live data options
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);
  const [usedSubjects, setUsedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Class Details
        const classRes = await fetch(`http://localhost:3000/classes/${classId}`, { headers });
        const classData = await classRes.json();

        if (classRes.ok && classData) {
          // Parse Name: "Form 1A" -> "Form 1" + "A", "Standard 3B" -> "Standard 3" + "B", "ReceptionA" -> "Reception" + "A"
          const formMatch = classData.name.match(/^(Form\s\d|Standard\s\d)(\w?)$/);
          const nurseryMatch = classData.name.match(/^(Reception|Nursery)(\w?)$/);
          if (formMatch) {
            setFormName(formMatch[1]);
            setStream(formMatch[2] || '');
          } else if (nurseryMatch) {
            setFormName(nurseryMatch[1]);
            setStream(nurseryMatch[2] || '');
          } else {
            setFormName(classData.name);
          }

          // Detect school level from formName
          const detectedLevel = classData.level || 
            (classData.name.startsWith('Standard') ? 'Primary' : 
             classData.name.startsWith('Reception') || classData.name.startsWith('Nursery') ? 'Nursery' : 'Secondary');
          setLevel(detectedLevel);
          setTrack(classData.track || 'Sciences & Humanities');
          setRoom(classData.room || '');
          setClassTeacher(classData.classTeacher || '');
          setSchedule(classData.schedule || 'Mon–Fri, 7:00 AM – 3:30 PM');
          setCapacity(classData.capacity || 40);

          if (Array.isArray(classData.subjects)) {
            setSubjects(classData.subjects.map((s: any, i: number) => ({
              id: i.toString(),
              name: s.name,
              teacher: s.teacher,
              periods: s.periods || 4
            })));
          }
        }

        // 2. Fetch Options
        const [subRes, tchRes] = await Promise.all([
          fetch('http://localhost:3000/subjects?limit=1000', { headers }),
          fetch('http://localhost:3000/teachers?limit=1000', { headers })
        ]);
        
        const subOptions = await subRes.json();
        const tchOptions = await tchRes.json();

        // 3. Fetch Used Subjects (those with grades)
        const usedRes = await fetch(`http://localhost:3000/classes/${classId}/used-subjects`, { headers });
        if (usedRes.ok) {
          const usedData = await usedRes.json();
          setUsedSubjects(usedData);
        }

        if (subRes.ok) setDbSubjects(subOptions.data || []);
        if (tchRes.ok) setDbTeachers(tchOptions.data || []);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [classId]);

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
    const subject = subjects.find(s => s.id === id);
    if (subject && usedSubjects.includes(subject.name)) {
      alert(`Cannot remove "${subject.name}" because it has recorded grades or assessment scores. Please delete the results first if you truly need to remove this subject.`);
      return;
    }
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, value: any) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${formName}${stream}`.trim(),
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
        throw new Error(errorData.message || 'Failed to update class');
      }

      navigate(`/admin/classes/${classId}`);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading class details...</div>;

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
          onClick={() => navigate(`/admin/classes/${classId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Class Detail
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Edit {formName}{stream}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Update academic track, teacher assignments and classroom details.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleUpdate} 
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem' }}
          >
            <Save size={16} /> {isSubmitting ? 'Saving Changes...' : 'Save Updates'}
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
          <button onClick={addSubject} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
            + Add Subject
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                type="number" value={subj.periods} onChange={e => updateSubject(subj.id, 'periods', parseInt(e.target.value) || 0)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-light)', padding: '0.65rem 0.5rem', borderRadius: '8px',
                  textAlign: 'center', fontSize: '0.9rem', width: '100%'
                }}
              />
              <button 
                onClick={() => removeSubject(subj.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

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
