import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Shield, Globe, Lock, Save, RefreshCw, 
  MapPin, School, Calendar, Info, Loader, CheckCircle2, AlertCircle, Plus, Users,
  Zap, ZapOff, Award, BarChart3, Trash2, RotateCcw, Mail, Phone, X
} from 'lucide-react';

  const AVAILABLE_TABS = [
    'Students', 'Teachers', 'Classes', 'Subjects', 
    'Enrollment', 'Finance', 'Boarding', 'Password Resets', 'Settings', 'Edit Admin Access', 'Delete Admin'
  ];

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>({
    schoolName: '',
    schoolCampus: '',
    schoolAddress: '',
    schoolPOBox: '',
    schoolPhone: '',
    schoolEmail: '',
    academicYear: '',
    currentTerm: '1'
  });
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    permissions: [...AVAILABLE_TABS]
  });
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingAdmins, setIsFetchingAdmins] = useState(false);
  const [isTogglingFinals, setIsTogglingFinals] = useState(false);
  const [isPublishingExams, setIsPublishingExams] = useState(false);
  const [finalResultsMode, setFinalResultsMode] = useState(false);
  const [examResultsPublished, setExamResultsPublished] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [originalSettings, setOriginalSettings] = useState<any>({});

  // Grading system state
  const DEFAULT_GRADING = {
    grades: [
      { grade: 'A', label: 'Distinction', minScore: 80, maxScore: 100, points: 1 },
      { grade: 'B', label: 'Credit',      minScore: 60, maxScore: 79,  points: 3 },
      { grade: 'C', label: 'Pass',        minScore: 50, maxScore: 59,  points: 5 },
      { grade: 'D', label: 'Satisfactory',minScore: 40, maxScore: 49,  points: 7 },
      { grade: 'F', label: 'Fail',        minScore: 0,  maxScore: 39,  points: 9 },
    ],
    passMinScore: 40,
  };
  const [gradingConfig, setGradingConfig] = useState<any>(DEFAULT_GRADING);
  const [isSavingGrading, setIsSavingGrading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
    fetchFinalResultsMode();
    fetchExamResultsPublishedStatus();
    fetchGradingConfig();
  }, []);

  const fetchExamResultsPublishedStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/exam-results-published', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExamResultsPublished(data.enabled);
      }
    } catch (err) {
      console.error('Error fetching exam results status:', err);
    }
  };

  const fetchFinalResultsMode = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/final-results-mode', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFinalResultsMode(data.enabled);
      }
    } catch (err) {
      console.error('Error fetching final results mode:', err);
    }
  };

  const handleToggleFinalResults = async () => {
    const newState = !finalResultsMode;
    const action = newState ? 'ACTIVATE' : 'DEACTIVATE';
    const confirmed = window.confirm(
      newState 
        ? '⚡ ACTIVATE FINAL RESULTS MODE?\n\nThis will:\n• Switch all teacher grade areas to FINAL GRADE recording only\n• Disable the "Configure Assessments" button for teachers\n• Teachers will only be able to input one final score per student per subject\n\nContinue?'
        : '🔄 DEACTIVATE Final Results Mode?\n\nThis will restore the normal continuous assessment mode for all teachers.\n\nContinue?'
    );
    if (!confirmed) return;

    setIsTogglingFinals(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/final-results-mode', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
      if (res.ok) {
        setFinalResultsMode(newState);
        setMessage({ type: 'success', text: `Final Results Mode ${action}D successfully!` });
      } else {
        throw new Error('Failed to toggle');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to toggle Final Results Mode.' });
    } finally {
      setIsTogglingFinals(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleTogglePublishExams = async () => {
    const newState = !examResultsPublished;
    const confirmed = window.confirm(
      newState 
        ? '📢 PUBLISH EXAM RESULTS?\n\nThis will make all final results visible to students and parents on the landing page.\n\nContinue?'
        : '🔇 UNPUBLISH EXAM RESULTS?\n\nThis will hide results from the landing page. Students will no longer be able to check their performance publicly.\n\nContinue?'
    );
    if (!confirmed) return;

    setIsPublishingExams(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/exam-results-published', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      });
      if (res.ok) {
        setExamResultsPublished(newState);
        setMessage({ type: 'success', text: `Examination results ${newState ? 'published' : 'unpublished'} successfully!` });
      } else {
        throw new Error('Failed to toggle');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error toggling publication status.' });
    } finally {
      setIsPublishingExams(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const fetchGradingConfig = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/grading-system', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGradingConfig(data);
      }
    } catch (err) {
      console.error('Error fetching grading config:', err);
    }
  };

  const handleSaveGrading = async () => {
    setIsSavingGrading(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings/grading-system', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(gradingConfig)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Grading system updated successfully! Changes will apply to all results views.' });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save grading config');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save grading config' });
    } finally {
      setIsSavingGrading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleResetGrading = () => {
    if (window.confirm('Reset grading system to default values?\n\nA: 80-100 (1 pt)\nB: 60-79 (3 pts)\nC: 50-59 (5 pts)\nD: 40-49 (7 pts)\nF: 0-39 (9 pts)\nPass threshold: 40%')) {
      setGradingConfig(DEFAULT_GRADING);
    }
  };

  const updateGradeRow = (index: number, field: string, value: any) => {
    const newGrades = [...gradingConfig.grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setGradingConfig({ ...gradingConfig, grades: newGrades });
  };

  const addGradeRow = () => {
    const newGrades = [...gradingConfig.grades];
    newGrades.push({ grade: '', label: '', minScore: 0, maxScore: 0, points: newGrades.length + 1 });
    setGradingConfig({ ...gradingConfig, grades: newGrades });
  };

  const removeGradeRow = (index: number) => {
    if (gradingConfig.grades.length <= 2) return;
    const newGrades = gradingConfig.grades.filter((_: any, i: number) => i !== index);
    setGradingConfig({ ...gradingConfig, grades: newGrades });
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
      setOriginalSettings(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    // Detect if a term or academic year transition is happening
    const termChanging = settings.currentTerm !== originalSettings.currentTerm;
    const yearChanging = settings.academicYear !== originalSettings.academicYear;

    if (termChanging || yearChanging) {
      const termLabel = (v: string) => v === '1' ? 'Term 1' : v === '2' ? 'Term 2' : 'Term 3';
      const fromTerm = termLabel(originalSettings.currentTerm);
      const toTerm = termLabel(settings.currentTerm);
      const fromYear = originalSettings.academicYear;
      const toYear = settings.academicYear;

      const confirmed = window.confirm(
        `⚠️ TERM TRANSITION DETECTED\n\n` +
        `You are changing from ${fromTerm} (${fromYear}) → ${toTerm} (${toYear}).\n\n` +
        `This will:\n` +
        `• Start fresh grade records for all subjects & students\n` +
        `• Reset all student fee balances to "Unpaid"\n` +
        `• Deactivate Final Results / Exam Mode\n\n` +
        `All previous term data is safely preserved and can be viewed later.\n\n` +
        `Continue with this term change?`
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/settings', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const result = await res.json();

      // If a term transition occurred, sync UI state
      if (result.termTransition) {
        setFinalResultsMode(false);
        setMessage({ type: 'success', text: `✅ Term transition complete! Now active: Term ${settings.currentTerm} (${settings.academicYear}). Exam mode has been deactivated.` });
      } else {
        setMessage({ type: 'success', text: 'System settings updated successfully!' });
      }

      // Update original settings to reflect the new saved state
      setOriginalSettings({ ...settings });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const fetchAdmins = async () => {
    setIsFetchingAdmins(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch admin list');
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingAdmins(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/admin/add-admin', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add administrator');
      setMessage({ type: 'success', text: `Administrator ${adminForm.firstName} ${adminForm.lastName} added successfully! Default password: pass1234` });
      setAdminForm({ firstName: '', lastName: '', email: '', phone: '', permissions: [...AVAILABLE_TABS] });
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error adding administrator' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 6000);
    }
  };

  const renderGeneral = () => (
    <div className="animate-fade">
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <School size={22} color="#3b82f6" /> School Identity
        </h3>
        <form onSubmit={handleUpdateSettings}>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="input-group">
              <label>School Legal Name</label>
              <div className="input-wrapper">
                <Globe size={18} />
                <input 
                  value={settings.schoolName} 
                  onChange={e => setSettings({...settings, schoolName: e.target.value})}
                  placeholder="e.g. ALPHABET SMIS"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Campus Designation</label>
              <div className="input-wrapper">
                <MapPin size={18} />
                <input 
                   value={settings.schoolCampus} 
                   onChange={e => setSettings({...settings, schoolCampus: e.target.value})}
                   placeholder="e.g. HEROES ACADEMY"
                />
              </div>
            </div>
          </div>
          <div className="input-group" style={{ marginTop: '2rem' }}>
            <label>Physical Address</label>
            <div className="input-wrapper">
              <Info size={18} />
              <input 
                value={settings.schoolAddress} 
                onChange={e => setSettings({...settings, schoolAddress: e.target.value})}
                placeholder="District, City, Country"
              />
            </div>
          </div>

          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div className="input-group">
              <label>Post Office Box (P.O. Box)</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input 
                  value={settings.schoolPOBox} 
                  onChange={e => setSettings({...settings, schoolPOBox: e.target.value})}
                  placeholder="e.g. P.O. Box 2025, Blantyre"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Official Phone Number(s)</label>
              <div className="input-wrapper">
                <Phone size={18} />
                <input 
                  value={settings.schoolPhone} 
                  onChange={e => setSettings({...settings, schoolPhone: e.target.value})}
                  placeholder="e.g. +265 888 123 456"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Official School Email</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input 
                  type="email"
                  value={settings.schoolEmail} 
                  onChange={e => setSettings({...settings, schoolEmail: e.target.value})}
                  placeholder="e.g. info@heroesacademy.mw"
                />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="btn-primary" style={{ marginTop: '2.5rem', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />} Save Changes
          </button>
        </form>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="animate-fade">
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={22} color="#f59e0b" /> Academic Configuration
        </h3>
        <form onSubmit={handleUpdateSettings}>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="input-group">
              <label>Current Academic Year</label>
              <div className="input-wrapper">
                <RefreshCw size={18} />
                <input 
                  value={settings.academicYear} 
                  onChange={e => setSettings({...settings, academicYear: e.target.value})}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Active Term</label>
              <div className="input-wrapper">
                <Info size={18} />
                <select 
                  value={settings.currentTerm} 
                  onChange={e => setSettings({...settings, currentTerm: e.target.value})}
                >
                  <option value="1">Term 1 (First Term)</option>
                  <option value="2">Term 2 (Second Term)</option>
                  <option value="3">Term 3 (Third Term)</option>
                </select>
              </div>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <strong>Note:</strong> Changing the academic year or term will immediately reflect in all financial reports and student enrollment default states.
          </p>
          <button type="submit" disabled={isSaving} className="btn-primary" style={{ marginTop: '2.5rem', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />} Save Changes
          </button>
        </form>
      </div>

      {/* Final Results Mode Control */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem', border: finalResultsMode ? '2px solid rgba(239, 68, 68, 0.4)' : '2px solid rgba(16, 185, 129, 0.2)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {finalResultsMode ? <Zap size={22} color="#ef4444" /> : <ZapOff size={22} color="var(--text-muted)" />}
          Final Results Mode
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '650px' }}>
          When activated, the teacher grade area switches to <strong style={{ color: 'var(--text-light)' }}>final grade recording only</strong>. 
          Teachers will see a single score input per student per subject. 
          The "Configure Assessments" button will be disabled across all teacher portals.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
            background: finalResultsMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
            color: finalResultsMode ? '#ef4444' : 'var(--text-muted)',
            border: `1px solid ${finalResultsMode ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)'}`
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: finalResultsMode ? '#ef4444' : '#6b7280', animation: finalResultsMode ? 'pulse 2s infinite' : 'none' }} />
            {finalResultsMode ? 'ACTIVE — Final Grades Only' : 'INACTIVE — Continuous Assessments'}
          </div>
          <button
            onClick={handleToggleFinalResults}
            disabled={isTogglingFinals}
            style={{
              padding: '0.85rem 2rem',
              background: finalResultsMode ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              transition: 'all 0.3s',
              boxShadow: finalResultsMode ? 'none' : '0 4px 20px rgba(239, 68, 68, 0.3)',
              fontSize: '0.95rem'
            }}
          >
            {isTogglingFinals ? <Loader size={18} className="spin" /> : finalResultsMode ? <ZapOff size={18} /> : <Zap size={18} />}
            {finalResultsMode ? 'Stop Final Results' : 'Start Final Results'}
          </button>
        </div>
      </div>

      {/* Publish Exams Control */}
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        borderRadius: '24px', 
        marginTop: '2rem', 
        border: examResultsPublished ? '2px solid var(--primary-gold)' : '2px solid rgba(255,255,255,0.05)',
        opacity: finalResultsMode ? 1 : 0.6,
        pointerEvents: finalResultsMode ? 'all' : 'none'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={22} color={examResultsPublished ? 'var(--primary-gold)' : 'var(--text-muted)'} />
          Public Result Publication
        </h3>
        {!finalResultsMode && (
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            color: '#f59e0b', 
            padding: '0.75rem 1rem', 
            borderRadius: '10px', 
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            Final Results Mode must be active before you can publish exams.
          </div>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '650px' }}>
          Once you have verified all records, use this button to make results available to the public. 
          When enabled, the "Exam Results" button will appear on the school landing page for students to view their unofficial transcripts.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={handleTogglePublishExams}
            disabled={isPublishingExams || !finalResultsMode}
            className="btn-primary"
            style={{
              padding: '0.85rem 2.5rem',
              background: examResultsPublished ? 'linear-gradient(135deg, #1f2937, #111827)' : 'var(--primary-gold-gradient)',
              color: examResultsPublished ? 'var(--text-light)' : 'black',
              border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              transition: 'all 0.3s',
              boxShadow: examResultsPublished ? 'none' : '0 4px 20px rgba(253, 184, 19, 0.2)',
              fontSize: '0.95rem'
            }}
          >
            {isPublishingExams ? <Loader size={18} className="spin" /> : examResultsPublished ? <ZapOff size={18} /> : <Globe size={18} />}
            {examResultsPublished ? 'Unpublish Results' : 'Publish Results Now'}
          </button>
          
          {examResultsPublished && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={16} /> Visible on Landing Page
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-fade">
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={22} color="#3b82f6" /> Add New Administrator
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Grant full administrative access. The user will be created with a temporary password: <strong>pass1234</strong>
        </p>
        <form onSubmit={handleAddAdmin}>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="input-group">
              <label>First Name</label>
              <div className="input-wrapper"><Info size={18} /><input value={adminForm.firstName} onChange={e => setAdminForm({...adminForm, firstName: e.target.value})} placeholder="e.g. John" required /></div>
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <div className="input-wrapper"><Info size={18} /><input value={adminForm.lastName} onChange={e => setAdminForm({...adminForm, lastName: e.target.value})} placeholder="e.g. Doe" required /></div>
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper"><Globe size={18} /><input type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} placeholder="admin@school.com" required /></div>
            </div>
            <div className="input-group">
              <label>Contact Phone</label>
              <div className="input-wrapper"><RefreshCw size={18} /><input value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value})} placeholder="+265..." /></div>
            </div>
          </div>
          
          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Module Access Permissions</span>
              <button 
                type="button" 
                onClick={() => setAdminForm(prev => ({ ...prev, permissions: prev.permissions.length === AVAILABLE_TABS.length ? [] : [...AVAILABLE_TABS] }))}
                style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', 
                  padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s'
                }}
              >
                {adminForm.permissions.length === AVAILABLE_TABS.length ? 'Deselect All' : 'Select All Modules'}
              </button>
            </div>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              {AVAILABLE_TABS.map(tab => {
                const isSelected = adminForm.permissions.includes(tab);
                return (
                  <div 
                    key={tab} 
                    onClick={() => {
                      setAdminForm(prev => ({ 
                        ...prev, 
                        permissions: isSelected ? prev.permissions.filter(p => p !== tab) : [...prev.permissions, tab] 
                      }));
                    }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', 
                      padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                      background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#3b82f6' : 'var(--text-muted)',
                      border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.05)' : 'none'
                    }}
                  >
                    {isSelected ? <CheckCircle2 size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '4px', border: '2px solid rgba(255,255,255,0.2)' }} />}
                    {tab}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="btn-primary" style={{ marginTop: '2rem', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {isSaving ? <Loader size={18} className="spin" /> : <Plus size={18} />} Create Admin
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={22} color="#10b981" /> Administrator Directory
          </h3>
          <button onClick={fetchAdmins} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
            <RefreshCw size={18} className={isFetchingAdmins ? 'spin' : ''} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm, i) => (
                <tr 
                  key={i} 
                  className="table-row-hover" 
                  style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/settings/admins/${adm.id}`)}
                >
                  <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px' }}>
                    <div style={{ fontWeight: 600 }}>{adm.firstName} {adm.lastName}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{adm.email}</td>
                  <td style={{ padding: '1rem' }}>{adm.phone}</td>
                  <td style={{ padding: '1rem', borderRadius: '0 12px 12px 0' }}>{adm.joinedDate}</td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No secondary administrators found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const gradeColors: Record<string, string> = { 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };

  const renderGrading = () => (
    <div className="animate-fade">
      {/* Grade Boundaries Table */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={22} color="#f59e0b" /> Grade Boundaries & Points
          </h3>
          <button 
            onClick={handleResetGrading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem'
            }}
          >
            <RotateCcw size={14} /> Reset to Defaults
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          Define the score boundaries for each grade, along with the corresponding <strong style={{ color: 'var(--text-light)' }}>points</strong> value (1 = highest, 9 = lowest). 
          These settings apply <strong style={{ color: 'var(--text-light)' }}>system-wide</strong> to all results, reports, and analytics.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Grade</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Label</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Min Score</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Max Score</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Points</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {gradingConfig.grades.map((g: any, i: number) => {
                const isPass = g.minScore >= gradingConfig.passMinScore;
                const color = gradeColors[g.grade] || '#6b7280';
                return (
                  <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <td style={{ padding: '0.6rem 1rem', borderRadius: '12px 0 0 12px' }}>
                      <input 
                        value={g.grade} 
                        onChange={e => updateGradeRow(i, 'grade', e.target.value)}
                        style={{
                          width: '50px', padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
                          background: `${color}15`, border: `1px solid ${color}40`, color, 
                          fontWeight: 800, fontSize: '1rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <input 
                        value={g.label} 
                        onChange={e => updateGradeRow(i, 'label', e.target.value)}
                        style={{
                          width: '100%', maxWidth: '180px', padding: '0.5rem 0.75rem', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                          color: 'var(--text-light)', fontSize: '0.85rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <input 
                        type="number" value={g.minScore} min={0} max={100}
                        onChange={e => updateGradeRow(i, 'minScore', parseInt(e.target.value) || 0)}
                        style={{
                          width: '65px', padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                          color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <input 
                        type="number" value={g.maxScore} min={0} max={100}
                        onChange={e => updateGradeRow(i, 'maxScore', parseInt(e.target.value) || 0)}
                        style={{
                          width: '65px', padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                          color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <input 
                        type="number" value={g.points} min={1} max={9}
                        onChange={e => updateGradeRow(i, 'points', parseInt(e.target.value) || 1)}
                        style={{
                          width: '55px', padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                          color: 'var(--primary-gold)', fontSize: '0.9rem', fontWeight: 700
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px',
                        background: isPass ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: isPass ? '#10b981' : '#ef4444'
                      }}>
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                      <button 
                        onClick={() => removeGradeRow(i)}
                        disabled={gradingConfig.grades.length <= 2}
                        style={{
                          background: 'none', border: 'none', cursor: gradingConfig.grades.length <= 2 ? 'not-allowed' : 'pointer',
                          color: gradingConfig.grades.length <= 2 ? 'var(--glass-border)' : '#ef4444', padding: '0.3rem'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button 
          onClick={addGradeRow}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem',
            padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)',
            border: '1px dashed var(--glass-border)', borderRadius: '10px',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem'
          }}
        >
          <Plus size={16} /> Add Grade Level
        </button>
      </div>

      {/* Visual Score Range Bar */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={20} color="#3b82f6" /> Score Range Preview
        </h3>
        <div style={{ display: 'flex', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          {[...gradingConfig.grades].sort((a: any, b: any) => a.minScore - b.minScore).map((g: any, i: number) => {
            const width = g.maxScore - g.minScore + 1;
            const color = gradeColors[g.grade] || '#6b7280';
            return (
              <div key={i} style={{
                width: `${width}%`, background: `${color}25`, borderRight: i < gradingConfig.grades.length - 1 ? `1px solid ${color}40` : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{g.grade}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{g.minScore}–{g.maxScore}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>0%</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>← FAIL | PASS →</span>
          <span>100%</span>
        </div>
      </div>

      {/* Pass Threshold */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} color="#10b981" /> Pass Threshold
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Students scoring <strong style={{ color: 'var(--text-light)' }}>at or above</strong> this percentage will be marked as <strong style={{ color: '#10b981' }}>PASSED</strong>. 
          Students below will be marked as <strong style={{ color: '#ef4444' }}>FAILED</strong>.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              value={gradingConfig.passMinScore} 
              min={0} max={100}
              onChange={e => setGradingConfig({ ...gradingConfig, passMinScore: parseInt(e.target.value) || 0 })}
              style={{
                width: '80px', padding: '0.75rem', borderRadius: '10px', textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981', fontSize: '1.2rem', fontWeight: 800
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>%</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            Currently: ≥ {gradingConfig.passMinScore}% = PASS
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={handleSaveGrading} 
          disabled={isSavingGrading}
          className="btn-primary" 
          style={{ 
            width: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s'
          }}
        >
          {isSavingGrading ? <Loader size={18} className="spin" /> : <Save size={18} />} 
          {isSavingGrading ? 'Saving Configuration...' : 'Save Grading System'}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader size={48} className="spin" color="#3b82f6" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Synching system configurations...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="header-stack" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #ffffff, var(--silver-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          System Settings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure core school properties, academic timelines, and security preferences.</p>
      </div>

      {message.text && (
        <div className={`notification ${message.type}`} style={{ 
          padding: '1rem', borderRadius: '12px', marginBottom: '2rem', 
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="scrollable-tabs" style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'general', label: 'General', icon: <School size={18} /> },
          { id: 'academic', label: 'Academic', icon: <Calendar size={18} /> },
          { id: 'security', label: 'Security', icon: <Shield size={18} /> },
          { id: 'grading', label: 'Grading', icon: <Award size={18} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: activeTab === tab.id ? '#3b82f6' : 'var(--text-muted)',
              border: 'none', borderRadius: '12px', fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
            }}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: '#3b82f6' }} />}
          </button>
        ))}
      </div>

      <div className="tab-container">
        {activeTab === 'general' && renderGeneral()}
        {activeTab === 'academic' && renderAcademic()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'grading' && renderGrading()}
      </div>

      <style>{`
        .input-group { display: flex; flexDirection: column; gap: 0.5rem; }
        .input-group label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
        .input-wrapper { 
          display: flex; align-items: center; gap: 0.75rem; 
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          padding: 0.75rem 1rem; borderRadius: 12px; transition: all 0.2s;
          color: var(--text-light);
        }
        .input-wrapper:focus-within { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
        .input-wrapper input, .input-wrapper select { 
          background: none; border: none; color: inherit; width: 100%; outline: none; font-size: 0.95rem;
        }
        .btn-primary { 
          padding: 0.85rem 1.5rem; background: #3b82f6; color: white; 
          border: none; borderRadius: 12px; fontWeight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
