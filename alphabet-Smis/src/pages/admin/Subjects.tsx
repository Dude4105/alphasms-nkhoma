import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Plus, Search, Trash2, ChevronDown, Check, X, Loader2 } from 'lucide-react';

const PRESET_SUBJECTS = [
  'Biology', 'Mathematics', 'English', 'Chichewa', 'Physical Science',
  'Chemistry', 'Physics', 'Social Studies', 'History', 'Geography',
  'Agriculture', 'Life Skills', 'Computer Studies', 'Bible Knowledge',
  'Religious Studies', 'Home Economics', 'Technical Education'
];

const PRESET_DEPARTMENTS = [
  'Sciences', 'Languages', 'Humanities', 'Technical', 'Commercial', 'General'
];

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameSelect, setNameSelect] = useState('');
  const [customName, setCustomName] = useState('');
  const [code, setCode] = useState('');
  const [departmentSelect, setDepartmentSelect] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [limit, setLimit] = useState(10);

  
  // Bulk Setup State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkSubjects, setSelectedBulkSubjects] = useState<string[]>([
    'English', 'Mathematics', 'Agriculture', 'Biology', 'Physics', 'Chemistry', 'Chichewa', 'Geography', 'History', 'Business Studies', 'French',
    'Computer Studies', 'Bible Knowledge', 'Religious Studies', 'Home Economics', 'Technical Education', 'Social Studies', 'Life Skills'
  ]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const BULK_OPTIONS = [
    'English', 'Mathematics', 'Agriculture', 'Biology', 'Physics', 'Chemistry', 'Chichewa', 'Geography', 'History', 'Business Studies', 'French',
    'Computer Studies', 'Bible Knowledge', 'Religious Studies', 'Home Economics', 'Technical Education', 'Social Studies', 'Life Skills'
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSubjects();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [limit, searchTerm]);

  // Reset limit when searching to start from the top
  useEffect(() => {
    setLimit(10);
  }, [searchTerm]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await fetch(`http://localhost:3000/subjects?limit=${limit}&search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSubjects(json.data);
        setTotalSubjects(json.meta?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const finalName = nameSelect === 'Other' ? customName : nameSelect;
      const finalDepartment = departmentSelect === 'Other' ? customDepartment : departmentSelect;

      const response = await fetch('http://localhost:3000/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject_code: code,
          name: finalName,
          department: finalDepartment,
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subject');
      }

      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]);
      setIsCreating(false);
      setNameSelect('');
      setCustomName('');
      setCode('');
      setDepartmentSelect('');
      setCustomDepartment('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will remove it from the curriculum database.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSubjects(subjects.filter(s => s.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete subject.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
  };

  const filtered = subjects; // Backend now handles filtering

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Subject Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure and track academic subjects across the school.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn" 
            onClick={() => setIsBulkModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(255,255,255,0.05)', color: 'var(--silver-light)', border: '1px solid var(--glass-border)'
            }}
          >
            <BookOpen size={18} /> CREATE ALL SUBJECTS
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreating(!isCreating)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> {isCreating ? 'Cancel' : 'Add Subject'}
          </button>
        </div>
      </div>

      {/* Bulk Setup Modal */}
      {isBulkModalOpen && createPortal(
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          zIndex: 99999, 
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div className="glass-panel animate-zoom-in" style={{ 
            marginTop: '5vh',
            width: '100%', 
            maxWidth: '500px', 
            marginBottom: '4rem',
            padding: '2rem', 
            borderRadius: '20px', 
            border: '1px solid var(--glass-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.25rem' }}>Bulk Curriculum Setup</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select the subjects you want to add to your school database.</p>
              </div>
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="btn-icon" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
              {BULK_OPTIONS.map(name => {
                const isSelected = selectedBulkSubjects.includes(name);
                return (
                  <div 
                    key={name}
                    onClick={() => {
                      setSelectedBulkSubjects(prev => 
                        isSelected ? prev.filter(s => s !== name) : [...prev, name]
                      );
                    }}
                    style={{ 
                      padding: '0.75rem 1rem', borderRadius: '10px', 
                      background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? '#3b82f6' : 'var(--glass-border)'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: 18, height: 18, borderRadius: '4px', 
                      background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <Check size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--text-light)' : 'var(--text-muted)' }}>{name}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => setIsBulkModalOpen(false)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  if (selectedBulkSubjects.length === 0) return alert('Please select at least one subject.');
                  setIsBulkSubmitting(true);
                  try {
                    const token = localStorage.getItem('accessToken');
                    const res = await fetch('http://localhost:3000/subjects/bulk', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ subjects: selectedBulkSubjects.map(name => ({ name })) })
                    });
                    if (!res.ok) throw new Error('Bulk creation failed');
                    await fetchSubjects();
                    setIsBulkModalOpen(false);
                    alert('Subjects created successfully!');
                  } catch (err) {
                    console.error(err);
                    alert('Failed to bulk create subjects.');
                  } finally {
                    setIsBulkSubmitting(false);
                  }
                }}
                disabled={isBulkSubmitting || selectedBulkSubjects.length === 0}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isBulkSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isBulkSubmitting ? 'Creating...' : `Confirm creation (${selectedBulkSubjects.length})`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isCreating && (
        <form onSubmit={handleCreateSubject} className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-light)' }}>Create New Subject</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subject Name</label>
              <div style={{ position: 'relative', marginBottom: nameSelect === 'Other' ? '0.75rem' : 0 }}>
                <select 
                  value={nameSelect} 
                  onChange={e => setNameSelect(e.target.value)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                  }}
                  required
                >
                  <option value="" disabled>Select Subject</option>
                  {PRESET_SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                  <option value="Other">Other (Specify)</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
              {nameSelect === 'Other' && (
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Type custom subject name..." required />
              )}
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department</label>
              <div style={{ position: 'relative', marginBottom: departmentSelect === 'Other' ? '0.75rem' : 0 }}>
                <select 
                  value={departmentSelect} 
                  onChange={e => setDepartmentSelect(e.target.value)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-light)', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                  }}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {PRESET_DEPARTMENTS.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                  <option value="Other">Other (Specify)</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
              {departmentSelect === 'Other' && (
                <input type="text" value={customDepartment} onChange={e => setCustomDepartment(e.target.value)} placeholder="Type custom department..." required />
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subject Code <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Optional)</span></label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. SUB-MAT" />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Description <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Optional)</span></label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief description of the subject..."
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.75rem', color: 'var(--text-light)', width: '100%', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || !nameSelect || (nameSelect === 'Other' && !customName) || !departmentSelect || (departmentSelect === 'Other' && !customDepartment)}
            >
              {isSubmitting ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search subjects by name, code, or department..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1.5rem', width: '40px' }}></th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Code</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Subject Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading subjects...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No subjects found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr 
                    key={s.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--primary-gold)' }}><BookOpen size={18} /></td>
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.subject_code}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-light)' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>
                      <span style={{ padding: '0.2rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)'}}>
                        {s.department || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDeleteSubject(s.id, s.name)}
                        style={{ 
                          display: 'inline-flex', width: 32, height: 32, 
                          color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalSubjects > subjects.length && (
          <div style={{ 
            padding: '1.25rem', 
            textAlign: 'center', 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.01)'
          }}>
            <button 
              className="btn" 
              onClick={() => setLimit(prev => prev + 50)}
              style={{ 
                fontSize: '0.85rem', color: 'var(--primary-gold)', 
                background: 'rgba(253, 184, 19, 0.05)', border: '1px solid var(--primary-gold-dim)',
                padding: '0.5rem 1.5rem'
              }}
            >
              See More ({totalSubjects - subjects.length} remaining)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
