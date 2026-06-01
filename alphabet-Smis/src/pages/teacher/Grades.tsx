import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Save, 
  Filter, 
  ChevronDown, 
  Settings, 
  Plus, 
  Trash2,
  AlertCircle,
  BarChart3,
  Loader,
  Calendar,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Assessment {
  id: string;
  name: string;
  maxScore: number;
}

interface ClassConfig {
  assessments: Assessment[];
}

interface ClassOption {
  id: string;
  name: string;
  level: string | null;
  students: number;
  theme: string;
  subjects?: any[];
}

interface StudentGrade {
  id: string;
  name: string;
  scores: Record<string, number>;
}

export default function Grades() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeTerm, setActiveTerm] = useState('1');
  const [academicYear, setAcademicYear] = useState('2025');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [finalResultsMode, setFinalResultsMode] = useState(false);
  const [gradingPassMin, setGradingPassMin] = useState(40);

  // Live data
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [qualifiedSubjects, setQualifiedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);

  // Per-class assessment configurations
  const [classConfigs, setClassConfigs] = useState<Record<string, ClassConfig>>({});

  const normalizeSubjectKey = (name: string) => {
    if (!name) return 'unknown';
    const map: Record<string, string> = {
      'Biology': 'bio',
      'Mathematics': 'math',
      'English': 'eng',
      'Chichewa': 'chi',
      'Physical Science': 'phys',
      'Chemistry': 'chem',
      'Physics': 'physics',
      'History': 'hist',
      'Geography': 'geog',
      'Agriculture': 'agri',
      'Social Studies': 'social',
      'Business Studies': 'biz',
      'Computer Studies': 'comp',
      'Home Economics': 'home'
    };
    if (map[name]) return map[name];
    
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 10);
  };

  // Default config if a class doesn't have one set yet
  const getSafeConfig = (key: string) => {
    return classConfigs[key] || {
      assessments: [
        { id: 'test1', name: 'Test 1', maxScore: 100 },
        { id: 'test2', name: 'Test 2', maxScore: 100 },
      ]
    };
  };

  // Fetch teacher's classes on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Check if admin enabled Final Results Mode and fetch active period
        try {
          const modeRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/final-results-mode`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (modeRes.ok) {
            const modeData = await modeRes.json();
            setFinalResultsMode(modeData.enabled);
          }

          // Fetch Global Settings
          const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (settingsRes.ok) {
              const settings = await settingsRes.json();
              if (settings.academicYear) setAcademicYear(settings.academicYear);
              if (settings.currentTerm) setActiveTerm(settings.currentTerm);
          }

          // Fetch grading config for pass threshold
          const gradingRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings/grading-system`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (gradingRes.ok) {
              const gc = await gradingRes.json();
              if (typeof gc.passMinScore === 'number') setGradingPassMin(gc.passMinScore);
          }
        } catch (e) { /* ignore, defaults stay */ }

        // Fetch User Profile for Subjects (Backup)
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let foundSubjects: string[] = [];
        if (profileRes.ok) {
            const profile = await profileRes.json();
            foundSubjects = profile.subjects || [];
        }

        // Fetch Classes (and Primary Subjects)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        const classList = json.classes || [];
        setClasses(classList);
        
        const teacherSubjects = json.teacher?.subjects || foundSubjects;
        const DEFAULT_SUBS = ['Biology', 'Mathematics', 'English', 'Chichewa', 'Physical Science'];
        const finalSubjects = teacherSubjects.length > 0 ? teacherSubjects : DEFAULT_SUBS;
        
        setQualifiedSubjects(finalSubjects);
        setTeacherName(json.teacher?.name || '');
        
        if (classList.length > 0) {
            setSelectedClass(classList[0].id);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter available subjects based on selected class curriculum
  useEffect(() => {
    if (!selectedClass || !teacherName) return;

    const currentCls = classes.find(c => c.id === selectedClass);
    if (currentCls && Array.isArray(currentCls.subjects)) {
      // Filter subjects where this teacher is assigned
      const assignedSubjects = currentCls.subjects
        .filter((s: any) => s.teacher === teacherName)
        .map((s: any) => s.name);

      setAvailableSubjects(assignedSubjects);

      // If current subject is not in the assigned list, pick the first one
      if (assignedSubjects.length > 0) {
        if (!assignedSubjects.includes(selectedSubject)) {
          setSelectedSubject(assignedSubjects[0]);
        }
      } else {
        // Fallback: If no assignments found in curriculum, show an empty state or qualified list
        // Based on user request, we should probably stick to assigned only
        setSelectedSubject('');
      }
    } else {
      // Fallback to qualified subjects if class data is missing subjects array
      setAvailableSubjects(qualifiedSubjects);
      if (qualifiedSubjects.length > 0 && !qualifiedSubjects.includes(selectedSubject)) {
          setSelectedSubject(qualifiedSubjects[0]);
      }
    }
  }, [selectedClass, classes, teacherName, qualifiedSubjects]);

  // Fetch students, config, and entries when class/subject/term changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;
    
    const fetchData = async () => {
      setIsLoadingStudents(true);
      setFetchError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const subjectKey = normalizeSubjectKey(selectedSubject);

        // 1. Fetch Class & Students
        // We try the string ID first, then fallback to any class with this name if ID fails
        let classRes = await fetch(`${import.meta.env.VITE_API_URL}/classes/${selectedClass}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let classJson = classRes.ok ? await classRes.json() : null;

        if (!classJson || !classJson.students) {
            // Backup fetch if first one fails or returns no students
            console.warn(`Class ${selectedClass} returned no students or failed. Trying search...`);
            
            // USE THE LOCAL classList from the parent effect if possible, or Fallback to state
            const targetName = classes.find(c => c.id === selectedClass)?.name || '';
            
            if (targetName) {
                const searchRes = await fetch(`${import.meta.env.VITE_API_URL}/classes?search=${encodeURIComponent(targetName)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const searchJson = await searchRes.json();
                
                // Find any class that actually has students
                const candidate = (searchJson.data || []).find((c: any) => c._count?.students > 0) || (searchJson.data || [])[0];
                
                if (candidate) {
                    const detailRes = await fetch(`${import.meta.env.VITE_API_URL}/classes/${candidate.class_id || candidate.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    classJson = await detailRes.json();
                }
            }
        }

        if (!classJson || !classJson.students) {
            setFetchError("Could not find students for this class. Please ensure the class has students assigned.");
            setGrades([]);
            return;
        }
        
        // 2. Fetch Config
        const configRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/grades/config?classId=${selectedClass}&subjectKey=${subjectKey}&term=${activeTerm}&academicYear=${academicYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (configRes.ok) {
            const configData = await configRes.json();
            if (configData) {
                const configKey = `${selectedClass}-${subjectKey}`;
                setClassConfigs(prev => ({ ...prev, [configKey]: configData.config }));
            }
        }

        // 3. Fetch Entries
        const entriesRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/grades/entries?classId=${selectedClass}&subjectKey=${subjectKey}&term=${activeTerm}&academicYear=${academicYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const entriesData = entriesRes.ok ? await entriesRes.json() : [];
        const entriesMap: Record<number, any> = {};
        (entriesData || []).forEach((e: any) => {
            entriesMap[e.studentId] = e.assessmentScores || {};
        });

        // Combine
        const students = (classJson.students || []).map((s: any) => ({
          id: s.student_id,
          dbId: s.id,
          name: `${s.firstName} ${s.lastName}`,
          gender: s.gender,
          scores: entriesMap[s.id] || {},
        }));
        setGrades(students);
      } catch (err) {
        console.error('Error fetching data:', err);
        setFetchError("An error occurred while loading grades.");
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchData();
  }, [selectedClass, selectedSubject, activeTerm, academicYear, classes]);

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const subjectKey = normalizeSubjectKey(selectedSubject);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/grades/config`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: selectedClass,
          subjectKey,
          term: parseInt(activeTerm),
          academicYear,
          config: currentConfig
        })
      });
      if (res.ok) {
        alert('Assessment configuration saved successfully!');
        setIsConfigModalOpen(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save configuration: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving config:', err);
      if (!navigator.onLine) {
        alert('Offline: Assessment configuration queued for auto-sync!');
        setIsConfigModalOpen(false);
      } else {
        alert('An error occurred while saving. Please check your connection.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const subjectKey = normalizeSubjectKey(selectedSubject);
      
      const entries = grades.map(s => ({
        student_id: s.id,
        scores: finalResultsMode ? { finalScore: s.scores['finalScore'] || 0 } : s.scores,
        totalScore: finalResultsMode ? (s.scores['finalScore'] || 0) : 0
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/grades/entries/bulk`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classId: selectedClass,
          subjectKey,
          term: parseInt(activeTerm),
          academicYear,
          entries
        })
      });
      if (res.ok) {
        alert('Grades saved successfully!');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save grades: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving grades:', err);
      if (!navigator.onLine) {
        alert('Offline: Gradebook changes queued for auto-sync!');
      } else {
        alert('An error occurred while saving grades. Please check your connection.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGrades = grades.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const configKey = `${selectedClass}-${normalizeSubjectKey(selectedSubject)}`;
  const currentConfig = getSafeConfig(configKey);

  const handleScoreChange = (studentIndex: number, assId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGrades(prev => prev.map((s, i) => {
      if (i === studentIndex) {
        return { ...s, scores: { ...s.scores, [assId]: numValue } };
      }
      return s;
    }));
  };

  const updateConfig = (newAssessments: Assessment[]) => {
    const subjectKey = normalizeSubjectKey(selectedSubject);
    const configKey = `${selectedClass}-${subjectKey}`;
    setClassConfigs(prev => ({
      ...prev,
      [configKey]: { assessments: newAssessments }
    }));
  };

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Select a Class';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your grade book...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="animate-fade">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', borderRadius: '24px', maxWidth: '500px', margin: '2rem auto' }}>
          <GraduationCap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--silver-light)', marginBottom: '0.5rem' }}>No Classes Assigned</h2>
          <p style={{ color: 'var(--text-muted)' }}>You need to be assigned to at least one class to use the grade book.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="grades-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Grades Area</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            Input and manage student assessment scores.
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <Calendar size={12} />
              Term {activeTerm} · {academicYear}
            </span>
          </p>
        </div>
        <div className="grades-header-actions">
          <button 
            className="btn btn-subject-results" 
            onClick={() => {
                const subjectKey = normalizeSubjectKey(selectedSubject);
                navigate(`/teacher/subjects/results/${selectedClass}/${subjectKey}`);
            }}
          >
            <BarChart3 size={18} /> View Subject Results
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsConfigModalOpen(true)}
            disabled={finalResultsMode}
            title={finalResultsMode ? 'Disabled: Admin has activated Final Results Mode' : 'Configure assessment components'}
          >
            <Settings size={18} /> Configure Assessments
          </button>
          <button className="btn btn-primary" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader size={16} className="spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters & Status */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={18} color="var(--text-muted)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Class:</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-light)',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Subject:</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-light)',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', minWidth: '240px' }} className="grades-search-container">
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Search:</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-light)',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} color="var(--primary-gold)" />
            {selectedClassName} — {finalResultsMode ? 'Final Grades' : 'Score Sheet'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {searchQuery ? `${filteredGrades.length} of ${grades.length} found` : `${grades.length} students enrolled`}
          </span>
        </div>

        {finalResultsMode && (
          <div style={{
            padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: '#ef4444', fontSize: '0.85rem', fontWeight: 600
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
            FINAL RESULTS MODE — Enter one definitive score per student
          </div>
        )}
        
        {isLoadingStudents ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
            <Loader size={20} className="spin" style={{ color: '#3b82f6' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading students...</span>
          </div>
        ) : fetchError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem', color: '#ef4444' }}>
            <AlertCircle size={32} />
            <p>{fetchError}</p>
            <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ fontSize: '0.8rem' }}>Retry</button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="grades-desktop-view">
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>#</th>
                      <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Student Name</th>
                      {finalResultsMode ? (
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'center' }}>
                          Final Score
                          <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>Max: 100</div>
                        </th>
                      ) : (
                        currentConfig.assessments.map(ass => (
                          <th key={ass.id} style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'center' }}>
                            {ass.name}
                            <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>
                              Max: {ass.maxScore}
                            </div>
                          </th>
                        ))
                      )}
                      {!finalResultsMode && (
                        <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--primary-gold)', background: 'rgba(212, 175, 55, 0.05)' }}>
                          AVERAGE (%)
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.length === 0 ? (
                      <tr>
                        <td colSpan={finalResultsMode ? 3 : currentConfig.assessments.length + 3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No students found matching "{searchQuery}"
                        </td>
                      </tr>
                    ) : (
                      filteredGrades.map((student) => {
                        const originalIdx = grades.indexOf(student);
                        return (
                          <tr key={originalIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{originalIdx + 1}</td>
                            <td style={{ padding: '0.75rem 1.5rem' }}>
                              <div style={{ fontWeight: 500, color: 'var(--text-light)' }}>{student.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.id}</div>
                            </td>
                            {finalResultsMode ? (
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                <input 
                                  type="number" 
                                  value={student.scores['finalScore'] ?? ''} 
                                  onChange={e => handleScoreChange(originalIdx, 'finalScore', e.target.value)}
                                  max={100}
                                  min={0}
                                  placeholder="—"
                                  style={{
                                    width: '80px',
                                    padding: '0.5rem 0.6rem',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: 'var(--text-light)',
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                  }}
                                />
                              </td>
                            ) : (
                              currentConfig.assessments.map(ass => (
                                <td key={ass.id} style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                  <input 
                                    type="number" 
                                    value={student.scores[ass.id] ?? ''} 
                                    onChange={e => handleScoreChange(originalIdx, ass.id, e.target.value)}
                                    max={ass.maxScore}
                                    min={0}
                                    placeholder="—"
                                    style={{
                                      width: '65px',
                                      padding: '0.4rem 0.5rem',
                                      borderRadius: '6px',
                                      background: 'rgba(255,255,255,0.05)',
                                      border: '1px solid var(--glass-border)',
                                      color: 'var(--text-light)',
                                      textAlign: 'center',
                                      fontSize: '0.9rem'
                                    }}
                                  />
                                </td>
                              ))
                            )}
                          
                          {!finalResultsMode && (
                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', background: 'rgba(212, 175, 55, 0.02)' }}>
                              {(() => {
                                let total = 0;
                                let maxTotal = 0;
                                currentConfig.assessments.forEach(ass => {
                                  const val = student.scores[ass.id];
                                  if (val !== undefined && val !== null && val !== '') {
                                    total += Number(val);
                                    maxTotal += Number(ass.maxScore);
                                  }
                                });
                                const avg = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                                const isPassing = avg >= gradingPassMin;
                                
                                return (
                                  <div style={{ 
                                    fontWeight: 800, 
                                    fontSize: '1.1rem', 
                                    color: isPassing ? '#10b981' : '#ef4444',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                  }}>
                                    <span>{avg}%</span>
                                    <div style={{ 
                                      height: '3px', 
                                      width: '30px', 
                                      background: isPassing ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      borderRadius: '2px',
                                      marginTop: '2px'
                                    }}>
                                      <div style={{ 
                                        height: '100%', 
                                        width: `${avg}%`, 
                                        background: isPassing ? '#10b981' : '#ef4444',
                                        borderRadius: '2px'
                                      }}></div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                          )}
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Deck View */}
            <div className="grades-mobile-view">
              <div className="grades-mobile-list">
                {filteredGrades.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredGrades.map((student) => {
                    const originalIdx = grades.indexOf(student);
                    let total = 0;
                    let maxTotal = 0;
                    currentConfig.assessments.forEach(ass => {
                      const val = student.scores[ass.id];
                      if (val !== undefined && val !== null && val !== '') {
                        total += Number(val);
                        maxTotal += Number(ass.maxScore);
                      }
                    });
                    const avg = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                    const isPassing = avg >= gradingPassMin;
                    const initials = student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <div key={originalIdx} className="student-mobile-card">
                        <div className="student-card-header">
                          <div className="student-card-profile">
                            <div className="student-card-avatar">{initials}</div>
                            <div>
                              <div className="student-card-name">{student.name}</div>
                              <div className="student-card-id">{student.id}</div>
                            </div>
                          </div>
                          {!finalResultsMode && (
                            <div className="student-card-avg-badge">
                              <span className="card-avg-label">Avg</span>
                              <span className="card-avg-val" style={{ color: isPassing ? '#10b981' : '#ef4444' }}>
                                {avg}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="student-card-inputs">
                          {finalResultsMode ? (
                            <div className="card-input-box" style={{ gridColumn: 'span 2' }}>
                              <label>Final Score (Max: 100)</label>
                              <input 
                                type="number" 
                                value={student.scores['finalScore'] ?? ''} 
                                onChange={e => handleScoreChange(originalIdx, 'finalScore', e.target.value)}
                                max={100}
                                min={0}
                                placeholder="—"
                                className="card-input-field"
                                style={{ 
                                  background: 'rgba(239, 68, 68, 0.05)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: 'var(--text-light)',
                                  fontWeight: 700
                                }}
                              />
                            </div>
                          ) : (
                            currentConfig.assessments.map(ass => (
                              <div key={ass.id} className="card-input-box">
                                <label>{ass.name} (Max: {ass.maxScore})</label>
                                <input 
                                  type="number" 
                                  value={student.scores[ass.id] ?? ''} 
                                  onChange={e => handleScoreChange(originalIdx, ass.id, e.target.value)}
                                  max={ass.maxScore}
                                  min={0}
                                  placeholder="—"
                                  className="card-input-field"
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sticky Mobile Save Button */}
            <div className="mobile-sticky-save">
              <button className="btn btn-primary mobile-save-fab" onClick={handleSaveAll} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader size={18} className="spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Gradebook Changes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <div className="config-overlay" onClick={() => setIsConfigModalOpen(false)}>
          <div className="config-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="config-header">
              <div className="config-header-icon">
                <Settings size={28} />
              </div>
              <h2 className="config-title">Configure Term Assessments</h2>
              <p className="config-subtitle">
                Define the continuous assessment structure for <strong>{selectedClassName}</strong>
              </p>
            </div>

            <div className="config-assessment-list">
              {currentConfig.assessments.map((ass, index) => (
                <div key={ass.id} className="config-assessment-card">
                  <div className="config-card-row">
                    <div className="config-input-group config-name-group">
                      <label>Assessment Name</label>
                      <input 
                        type="text" 
                        value={ass.name} 
                        placeholder="e.g. Final Exam"
                        onChange={e => {
                          const newAss = [...currentConfig.assessments];
                          newAss[index].name = e.target.value;
                          updateConfig(newAss);
                        }}
                      />
                    </div>
                    <div className="config-input-group config-num-group">
                      <label>Max Score</label>
                      <input 
                        type="number" 
                        value={ass.maxScore} 
                        onChange={e => {
                          const newAss = [...currentConfig.assessments];
                          newAss[index].maxScore = parseInt(e.target.value) || 1;
                          updateConfig(newAss);
                        }}
                      />
                    </div>
                    <button 
                      className="config-delete-btn" 
                      onClick={() => {
                        const newAss = currentConfig.assessments.filter((_, i) => i !== index);
                        updateConfig(newAss);
                      }}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                className="config-add-btn" 
                onClick={() => {
                  const nextTestNum = currentConfig.assessments.length + 1;
                  const newAss = [...currentConfig.assessments, { 
                    id: 'test' + Date.now(), 
                    name: `Test ${nextTestNum}`, 
                    maxScore: 100 
                  }];
                  updateConfig(newAss);
                }}
              >
                <Plus size={18} /> Add Assessment Component
              </button>
            </div>

            <div className="config-footer">
              <button 
                className="btn btn-outline config-cancel-btn" 
                onClick={() => setIsConfigModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary config-apply-btn" 
                onClick={handleSaveConfig}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save & Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .config-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: configFadeIn 0.25s ease;
        }

        @keyframes configFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .config-modal {
          width: 100%;
          max-width: 720px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          padding: 0 !important;
          border-radius: 16px !important;
          overflow: hidden;
          animation: configSlideUp 0.3s ease;
        }

        @keyframes configSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .config-header {
          text-align: center;
          padding: 2rem 2rem 1.5rem;
        }

        .config-header-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--primary-gold-dim);
          color: var(--primary-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .config-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-light);
          margin-bottom: 0.4rem;
        }

        .config-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .weight-bar-container {
          padding: 0 2rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .weight-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          overflow: hidden;
        }

        .weight-bar-fill {
          height: 100%;
          border-radius: 100px;
          background: var(--primary-gold);
          transition: width 0.3s ease, background 0.3s ease;
        }

        .weight-bar-fill.valid {
          background: #10b981;
        }

        .weight-bar-fill.over {
          background: #ef4444;
        }

        .weight-bar-label {
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .weight-bar-label.valid { color: #10b981; }
        .weight-bar-label.invalid { color: var(--primary-gold); }

        .config-assessment-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0 2rem 1rem;
        }

        .config-assessment-list::-webkit-scrollbar {
          width: 5px;
        }
        .config-assessment-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }

        .config-assessment-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s ease;
        }

        .config-assessment-card:hover {
          border-color: rgba(255, 215, 0, 0.25);
        }

        .config-card-row {
          display: grid;
          grid-template-columns: 1fr 90px 90px 38px;
          gap: 1rem;
          align-items: flex-end;
        }

        .config-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .config-input-group label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .config-input-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-light);
          padding: 0.55rem 0.7rem;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
          width: 100%;
        }

        .config-input-group input:focus {
          outline: none;
          border-color: var(--primary-gold);
          box-shadow: 0 0 0 2px var(--primary-gold-dim);
        }

        .config-delete-btn {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid transparent;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .config-delete-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .config-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          border: 2px dashed var(--glass-border);
          border-radius: 10px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .config-add-btn:hover {
          border-color: var(--primary-gold);
          color: var(--primary-gold);
          background: var(--primary-gold-dim);
        }

        .config-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--glass-border);
        }

        .config-cancel-btn {
          flex: 1;
          height: 3rem;
          font-weight: 600;
        }

        .config-apply-btn {
          flex: 2;
          height: 3rem;
          font-weight: 600;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .config-modal {
            max-height: 95vh;
            border-radius: 12px !important;
          }

          .config-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .weight-bar-container {
            padding: 0 1.5rem;
          }

          .config-assessment-list {
            padding: 0 1.5rem 1rem;
          }

          .config-card-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .config-card-row .config-num-group {
            display: inline-flex;
          }

          .config-assessment-card {
            position: relative;
            padding-bottom: 1.25rem;
          }

          .config-card-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .config-name-group {
            width: 100%;
          }

          .config-num-group {
            flex: 1;
            min-width: 80px;
          }

          .config-delete-btn {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            width: 32px;
            height: 32px;
          }

          .config-footer {
            padding: 1.25rem 1.5rem;
          }
        }

        /* --- Premium Mobile UI/UX Local Styles for Grades Book --- */
        .grades-desktop-view {
          display: block;
        }

        .grades-mobile-view {
          display: none;
        }

        .grades-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .grades-header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-subject-results {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .grades-mobile-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        .student-mobile-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          position: relative;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .student-mobile-card:focus-within {
          border-color: rgba(253, 184, 19, 0.4);
          transform: translateY(-2px);
        }

        .student-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.75rem;
        }

        .student-card-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .student-card-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--primary-gold-dim);
          color: var(--primary-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          border: 1px solid rgba(253, 184, 19, 0.15);
        }

        .student-card-name {
          font-weight: 600;
          color: var(--text-light);
          font-size: 0.95rem;
        }

        .student-card-id {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        .student-card-avg-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .card-avg-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-avg-val {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .student-card-inputs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .card-input-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          background: rgba(255,255,255,0.01);
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.03);
        }

        .card-input-box label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .card-input-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          color: var(--text-light);
          padding: 0.4rem 0.5rem;
          border-radius: 6px;
          font-size: 0.95rem;
          text-align: center;
          font-weight: 600;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .card-input-field:focus {
          border-color: var(--primary-gold);
        }

        .mobile-sticky-save {
          position: relative;
          width: 100%;
          margin-top: 1.5rem;
          margin-bottom: 2rem;
          padding: 0 1rem;
          z-index: 10;
          display: none;
        }

        .mobile-save-fab {
          width: 100%;
          padding: 0.6rem 1rem !important; /* Slim padding */
          border-radius: 10px !important; /* Sleeker border radius */
          box-shadow: 0 4px 15px rgba(253,184,19,0.2) !important; /* Lighter slim shadow */
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem; /* Slimmer font size */
        }

        @media (max-width: 768px) {
          .grades-desktop-view {
            display: none;
          }

          .grades-mobile-view {
            display: block;
          }

          .mobile-sticky-save {
            display: block;
          }

          .grades-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
          }

          .grades-header-actions {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }

          .grades-header-actions .btn {
            width: 100%;
            justify-content: center;
            padding: 0.85rem 1.25rem !important;
            font-size: 0.95rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .grades-search-container {
            margin-left: 0 !important;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
