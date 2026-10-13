import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Plus, Search, Trash2, ChevronDown, Check, X, Loader2,
  Layers, Beaker, Languages, GraduationCap, Wrench, Briefcase, Hash, Sparkles, PackageOpen
} from 'lucide-react';

const PRESET_SUBJECTS = [
  'Biology', 'Mathematics', 'English', 'Chichewa', 'Physical Science',
  'Chemistry', 'Physics', 'Social Studies', 'History', 'Geography',
  'Agriculture', 'Life Skills', 'Computer Studies', 'Bible Knowledge',
  'Religious Studies', 'Home Economics', 'Technical Education'
];

const PRESET_DEPARTMENTS = [
  'Sciences', 'Languages', 'Humanities', 'Technical', 'Commercial', 'General'
];

// Department theming: color + accent icon for badges / avatars
const DEPT_THEME: Record<string, { color: string; icon: any }> = {
  Sciences: { color: '#10b981', icon: Beaker },
  Languages: { color: '#3b82f6', icon: Languages },
  Humanities: { color: '#8b5cf6', icon: GraduationCap },
  Technical: { color: '#f97316', icon: Wrench },
  Commercial: { color: '#f59e0b', icon: Briefcase },
  General: { color: '#64748b', icon: Layers },
};

const deptTheme = (dept?: string) =>
  DEPT_THEME[dept || 'General'] || DEPT_THEME.General;

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');

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

  // Delete confirm state
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Bulk Setup State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkSubjects, setSelectedBulkSubjects] = useState<string[]>([
    'English', 'Mathematics', 'Agriculture', 'Biology', 'Physics', 'Chemistry', 'Chichewa', 'Geography', 'History', 'Business Studies', 'French',
    'Computer Studies', 'Bible Knowledge', 'Religious Studies', 'Home Economics', 'Technical Education', 'Social Studies', 'Life Skills'
  ]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subjects?limit=${limit}&search=${searchTerm}`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/subjects`, {
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

      setIsCreating(false);
      resetForm();
      showToast(`"${finalName}" added to curriculum.`);
      fetchSubjects();
    } catch (err: any) {
      showToast(err.message || 'An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNameSelect('');
    setCustomName('');
    setCode('');
    setDepartmentSelect('');
    setCustomDepartment('');
    setDescription('');
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subjects/${deleting.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSubjects(subjects.filter(s => s.id !== deleting.id));
        setTotalSubjects(prev => Math.max(0, prev - 1));
        showToast(`"${deleting.name}" removed.`);
        setDeleting(null);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to delete subject.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error occurred.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkCreate = async () => {
    if (selectedBulkSubjects.length === 0) return showToast('Please select at least one subject.', 'error');
    setIsBulkSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subjects/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subjects: selectedBulkSubjects.map(name => ({ name })) })
      });
      if (!res.ok) throw new Error('Bulk creation failed');
      await fetchSubjects();
      setIsBulkModalOpen(false);
      showToast(`${selectedBulkSubjects.length} subjects created successfully!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to bulk create subjects.', 'error');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Derived stats + department breakdown
  const stats = useMemo(() => {
    const deptCount = new Set(subjects.map(s => s.department || 'General')).size;
    return { total: totalSubjects, depts: deptCount };
  }, [subjects, totalSubjects]);

  const departments = useMemo(() => {
    const counts: Record<string, number> = {};
    subjects.forEach(s => {
      const d = s.department || 'General';
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [subjects]);

  // Client-side department filter on the loaded page
  const displayed = useMemo(
    () => (activeDept === 'All' ? subjects : subjects.filter(s => (s.department || 'General') === activeDept)),
    [subjects, activeDept]
  );

  const filteredBulkOptions = useMemo(
    () => BULK_OPTIONS.filter(n => n.toLowerCase().includes(bulkSearch.toLowerCase())),
    [bulkSearch]
  );

  const toggleBulk = (name: string) =>
    setSelectedBulkSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );

  const selectAllFiltered = () => {
    const allSelected = filteredBulkOptions.every(n => selectedBulkSubjects.includes(n));
    setSelectedBulkSubjects(prev => {
      const others = prev.filter(n => !filteredBulkOptions.includes(n));
      return allSelected ? others : [...others, ...filteredBulkOptions];
    });
  };

  const canSubmit =
    !isSubmitting && !!nameSelect && (nameSelect !== 'Other' || !!customName) &&
    !!departmentSelect && (departmentSelect !== 'Other' || !!customDepartment);

  return (
    <div className="animate-fade" style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && createPortal(
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100000, display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.8rem 1.3rem', borderRadius: '12px',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 500,
          backdropFilter: 'blur(16px)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }} className="animate-slide-up">
          {toast.type === 'success' ? <Check size={16} color="#10b981" /> : <X size={16} color="#ef4444" />}
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-flex', padding: '0.4rem', borderRadius: '10px', background: 'var(--primary-gold-dim)', color: 'var(--primary-gold)' }}>
              <BookOpen size={22} />
            </span>
            Subject Management
          </h1>
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
            <Sparkles size={16} /> Bulk Setup
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(!isCreating)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isCreating ? <X size={16} /> : <Plus size={16} />}
            {isCreating ? 'Cancel' : 'Add Subject'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', borderTop: '3px solid var(--primary-gold)', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-light)', lineHeight: 1 }}>{stats.total}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Total Subjects</div>
            </div>
            <div style={{ background: 'var(--primary-gold-dim)', padding: '0.7rem', borderRadius: '10px', color: 'var(--primary-gold)' }}>
              <BookOpen size={22} />
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', borderTop: '3px solid var(--accent-blue)', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-light)', lineHeight: 1 }}>{stats.depts}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Departments</div>
            </div>
            <div style={{ background: 'rgba(59,130,246,0.15)', padding: '0.7rem', borderRadius: '10px', color: 'var(--accent-blue)' }}>
              <Layers size={22} />
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', borderTop: '3px solid var(--accent-emerald)', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-light)', lineHeight: 1 }}>{subjects.length}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Loaded This Page</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.15)', padding: '0.7rem', borderRadius: '10px', color: 'var(--accent-emerald)' }}>
              <Hash size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Setup Modal */}
      {isBulkModalOpen && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999,
          padding: '2rem', overflowY: 'auto'
        }} onClick={() => setIsBulkModalOpen(false)}>
          <div className="glass-panel animate-zoom-in" onClick={e => e.stopPropagation()} style={{
            marginTop: '5vh', width: '100%', maxWidth: '560px', marginBottom: '4rem', padding: '2rem',
            borderRadius: '20px', border: '1px solid var(--glass-border)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.25rem' }}>Bulk Curriculum Setup</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select the subjects you want to add to your school database.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="search-bar" style={{ marginBottom: '1rem' }}>
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Filter subjects..." value={bulkSearch} onChange={e => setBulkSearch(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedBulkSubjects.length} selected</span>
              <button onClick={selectAllFiltered} style={{ background: 'none', border: 'none', color: 'var(--primary-gold)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                {filteredBulkOptions.every(n => selectedBulkSubjects.includes(n)) ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {filteredBulkOptions.map(name => {
                const isSelected = selectedBulkSubjects.includes(name);
                return (
                  <div key={name} onClick={() => toggleBulk(name)} style={{
                    padding: '0.65rem 0.85rem', borderRadius: '10px',
                    background: isSelected ? 'rgba(253,184,19,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--primary-gold)' : 'var(--glass-border)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '5px', flexShrink: 0,
                      background: isSelected ? 'var(--primary-gold)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <Check size={12} color="#0f1012" />}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--text-light)' : 'var(--text-muted)' }}>{name}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={() => setIsBulkModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none' }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleBulkCreate} disabled={isBulkSubmitting || selectedBulkSubjects.length === 0}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isBulkSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isBulkSubmitting ? 'Creating...' : `Create ${selectedBulkSubjects.length} Subject${selectedBulkSubjects.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Modal */}
      {isCreating && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999,
          padding: '2rem', overflowY: 'auto'
        }} onClick={() => setIsCreating(false)}>
          <form onSubmit={handleCreateSubject} className="glass-panel animate-zoom-in" onClick={e => e.stopPropagation()} style={{
            marginTop: '6vh', width: '100%', maxWidth: '520px', padding: '2rem', borderRadius: '20px',
            border: '1px solid var(--glass-border)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.25rem' }}>Create New Subject</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add a subject to the curriculum database.</p>
              </div>
              <button type="button" onClick={() => setIsCreating(false)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label>Subject Name</label>
              <div style={{ position: 'relative', marginBottom: nameSelect === 'Other' ? '0.75rem' : 0 }}>
                <select value={nameSelect} onChange={e => setNameSelect(e.target.value)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-light)', padding: '0.7rem 0.85rem', borderRadius: '10px',
                  fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                }} required>
                  <option value="" disabled>Select Subject</option>
                  {PRESET_SUBJECTS.map(subj => (<option key={subj} value={subj}>{subj}</option>))}
                  <option value="Other">Other (Specify)</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
              {nameSelect === 'Other' && (
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Type custom subject name..." required />
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label>Department</label>
              <div style={{ position: 'relative', marginBottom: departmentSelect === 'Other' ? '0.75rem' : 0 }}>
                <select value={departmentSelect} onChange={e => setDepartmentSelect(e.target.value)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-light)', padding: '0.7rem 0.85rem', borderRadius: '10px',
                  fontSize: '0.9rem', appearance: 'none', cursor: 'pointer', width: '100%'
                }} required>
                  <option value="" disabled>Select Department</option>
                  {PRESET_DEPARTMENTS.map(dep => (<option key={dep} value={dep}>{dep}</option>))}
                  <option value="Other">Other (Specify)</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
              {departmentSelect === 'Other' && (
                <input type="text" value={customDepartment} onChange={e => setCustomDepartment(e.target.value)} placeholder="Type custom department..." required />
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label>Subject Code <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Optional)</span></label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. SUB-MAT" />
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label>Description <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>(Optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the subject..."
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem', color: 'var(--text-light)', width: '100%', minHeight: '80px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsCreating(false)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!canSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isSubmitting ? 'Saving...' : 'Save Subject'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Delete Confirm Modal */}
      {deleting && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100001, padding: '2rem'
        }} onClick={() => !isDeleting && setDeleting(null)}>
          <div className="glass-panel animate-zoom-in" onClick={e => e.stopPropagation()} style={{
            maxWidth: '420px', width: '100%', padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)', textAlign: 'center'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={26} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.5rem' }}>Delete Subject</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Are you sure you want to remove <strong style={{ color: 'var(--text-light)' }}>{deleting.name}</strong> from the curriculum database? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={() => setDeleting(null)} disabled={isDeleting} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none' }}>
                Cancel
              </button>
              <button className="btn" onClick={confirmDelete} disabled={isDeleting} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: '#ef4444', color: 'white', border: 'none'
              }}>
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toolbar: search + department pills */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search subjects by name, code, or department..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {subjects.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['All', ...Object.keys(departments)].map(dept => {
            const isActive = activeDept === dept;
            const c = dept === 'All' ? 'var(--primary-gold)' : deptTheme(dept).color;
            return (
              <button key={dept} onClick={() => setActiveDept(dept)} style={{
                padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease',
                background: isActive ? `${c}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? c : 'var(--glass-border)'}`,
                color: isActive ? c : 'var(--text-muted)'
              }}>
                {dept} <span style={{ opacity: 0.7 }}>({dept === 'All' ? subjects.length : departments[dept]})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.9rem 1.5rem', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Code</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                <th style={{ padding: '0.9rem 1.5rem', fontWeight: 500, fontSize: '0.78rem', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ height: 12, width: 140, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} />
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}><div style={{ height: 12, width: 70, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.9rem 1rem' }}><div style={{ height: 12, width: 90, borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} /></td>
                    <td style={{ padding: '0.9rem 1.5rem' }}><div style={{ height: 12, width: 40, borderRadius: '6px', background: 'rgba(255,255,255,0.05)', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <PackageOpen size={30} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '0.35rem' }}>No subjects found</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      {searchTerm || activeDept !== 'All'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by adding your first subject.'}
                    </p>
                    {!searchTerm && activeDept === 'All' && (
                      <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Add Subject
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displayed.map((s) => {
                  const theme = deptTheme(s.department);
                  const DeptIcon = theme.icon;
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.8rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                            background: `${theme.color}18`, color: theme.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
                          }}>
                            {initials(s.name) || <BookOpen size={18} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.2 }}>{s.name}</div>
                            {s.description && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--silver-light)', fontSize: '0.85rem' }}>
                        <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                          {s.subject_code || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.28rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500,
                          background: `${theme.color}18`, color: theme.color
                        }}>
                          <DeptIcon size={12} /> {s.department || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1.5rem', textAlign: 'right' }}>
                        <button className="btn-icon" onClick={() => setDeleting({ id: s.id, name: s.name })}
                          style={{ display: 'inline-flex', width: 34, height: 34, color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalSubjects > subjects.length && (
          <div style={{ padding: '1.25rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <button className="btn" onClick={() => setLimit(prev => prev + 50)}
              style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', background: 'rgba(253,184,19,0.05)', border: '1px solid var(--primary-gold-dim)', padding: '0.5rem 1.5rem' }}>
              See More ({totalSubjects - subjects.length} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
