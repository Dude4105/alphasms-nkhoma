import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, GraduationCap, Calendar, Check, AlertTriangle, 
  Users, RefreshCw, CheckSquare, Square, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface StudentItem {
  id: string;
  name: string;
  gender: string;
  scholarType: string;
  promote: boolean; // true = migrate, false = repeat
}

interface ClassOption {
  class_id: string;
  name: string;
  level: string | null;
  room: string;
}

export default function ClassMigration() {
  const { classId } = useParams();
  const navigate = useNavigate();

  // State management
  const [sourceClass, setSourceClass] = useState<any>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classesList, setClassesList] = useState<ClassOption[]>([]);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');

        // 1. Fetch current class details & students roster
        const classRes = await fetch(`http://localhost:3000/classes/${classId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!classRes.ok) throw new Error('Failed to retrieve source class data');
        const classJson = await classRes.json();
        setSourceClass(classJson);

        if (classJson.students) {
          setStudents(
            classJson.students.map((s: any) => ({
              id: s.student_id,
              name: `${s.firstName} ${s.lastName}`,
              gender: s.gender || 'N/A',
              scholarType: s.scholarType || 'Day',
              promote: true, // Promoted by default
            }))
          );
        }

        // 2. Fetch all school classes for promotion dropdown list
        const listRes = await fetch('http://localhost:3000/classes?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listRes.ok) {
          const listJson = await listRes.json();
          // Filter out the current class from promotion list
          const remaining = (listJson.data || []).filter((c: any) => c.class_id !== classId);
          setClassesList(remaining);
          if (remaining.length > 0) {
            setTargetClassId(remaining[0].class_id);
          }
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Error occurred while retrieving class lists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  // Bulk actions
  const selectAll = (promote: boolean) => {
    setStudents(prev => prev.map(s => ({ ...s, promote })));
  };

  const toggleStudent = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, promote: !s.promote } : s));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const promotedCount = students.filter(s => s.promote).length;
  const repeatingCount = students.length - promotedCount;
  const selectedTargetClass = classesList.find(c => c.class_id === targetClassId);

  // Submit Migration Action
  const handlePerformMigration = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        targetClassId,
        promotions: students.map(s => ({
          studentId: s.id,
          action: s.promote ? 'migrate' : 'repeat'
        }))
      };

      const res = await fetch(`http://localhost:3000/teachers/classes/${classId}/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to complete student class migration');
      }

      setSuccessMessage(`Success! Promoted ${promotedCount} students to ${selectedTargetClass?.name} and left ${repeatingCount} students to repeat.`);
      setShowConfirmModal(false);
      
      // Auto redirect back to main class after 2.5s
      setTimeout(() => {
        navigate(`/teacher/main-class`);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to complete migration request.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <RefreshCw size={40} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Retrieving class lists and active student parameters...</p>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="animate-fade" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ color: 'var(--text-light)', fontSize: '1.75rem', marginBottom: '1rem' }}>Migration Completed</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
            {successMessage}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <RefreshCw size={14} className="spin" />
            Redirecting to main class portal...
          </div>
        </div>
      </div>
    );
  }

  // Sub-renders
  const renderTargetSelector = () => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <GraduationCap size={16} color="var(--primary-gold)" /> Promotion Target Class
      </h3>
      
      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
        SELECT DESTINATION STREAM:
      </label>
      
      {classesList.length > 0 ? (
        <select 
          value={targetClassId}
          onChange={e => setTargetClassId(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '10px', 
            background: 'rgba(0,0,0,0.3)', 
            border: '1px solid var(--glass-border)', 
            color: 'var(--text-light)',
            fontWeight: 600,
            outline: 'none',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
          }}
        >
          {classesList.map(c => (
            <option key={c.class_id} value={c.class_id} style={{ background: '#1c1d24' }}>
              {c.name} {c.room ? `(${c.room})` : ''}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ef4444' }}>
          No alternative classes exist in system configuration to promote students.
        </div>
      )}
      
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block', marginTop: '0.5rem' }}>
        Promoted students will be assigned to their new class. In-term and final grade entries for their new year will start fresh.
      </span>
    </div>
  );

  const renderSummary = () => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        Ledger Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>From Class:</span>
          <strong style={{ color: 'var(--text-light)' }}>{sourceClass?.name}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>To Class:</span>
          <strong style={{ color: '#3b82f6' }}>{selectedTargetClass?.name || 'N/A'}</strong>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Promoted Students:</span>
          <strong style={{ color: '#10b981' }}>{promotedCount}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Repeating Students:</span>
          <strong style={{ color: '#ef4444' }}>{repeatingCount}</strong>
        </div>
      </div>

      <button 
        className="btn btn-primary"
        disabled={students.length === 0 || !targetClassId}
        onClick={() => setShowConfirmModal(true)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem 1rem', opacity: (students.length === 0 || !targetClassId) ? 0.5 : 1 }}
      >
        Perform Migration <ChevronRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="animate-fade" style={{ padding: isMobile ? '0 0.5rem' : '0' }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn-icon" 
          onClick={() => navigate('/teacher/main-class')}
          style={{ width: 'auto', padding: '0 1rem', borderRadius: '20px', gap: '0.5rem', marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={18} /> Back to Class
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Class Migration & Promotions
            </h1>
            <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Source Class: <strong style={{ color: 'var(--text-light)' }}>{sourceClass?.name}</strong> · Designate promoted & repeating students
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{errorMessage}</span>
        </div>
      )}

      {/* Migration Dynamic Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 1.25fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* On Mobile: Render Target Selector at the top */}
        {isMobile && renderTargetSelector()}

        {/* Student Selection Checklist */}
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#3b82f6" /> Student Selection ({students.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => selectAll(true)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Promote All
                </button>
                <button 
                  onClick={() => selectAll(false)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Repeat All
                </button>
              </div>
            </div>
            
            <div className="search-bar" style={{ width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.4rem', fontSize: '0.85rem' }} 
              />
            </div>
          </div>

          {/* Conditional Responsive Roster Layout */}
          {isMobile ? (
            /* MOBILE TOUCH CARDS RENDER */
            <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.75rem' }}>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  onClick={() => toggleStudent(student.id)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: student.promote ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.02)',
                    border: student.promote ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: student.promote ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: student.promote ? '#10b981' : 'var(--text-muted)' }}>
                      {student.promote ? <CheckSquare size={22} /> : <Square size={22} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-light)', fontSize: '0.9rem' }}>{student.name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {student.id} · {student.gender}</span>
                    </div>
                  </div>
                  <div>
                    <span 
                      style={{ 
                        fontSize: '0.65rem', fontWeight: 750, padding: '0.25rem 0.6rem', borderRadius: '6px',
                        background: student.promote ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: student.promote ? '#10b981' : '#ef4444',
                        border: student.promote ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      {student.promote ? 'PROMOTE' : 'REPEATING'}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No students match your query.
                </div>
              )}
            </div>
          ) : (
            /* DESKTOP TABLE RENDER */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem', width: '60px', textAlign: 'center' }}>ACTION</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem' }}>STUDENT ID</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem' }}>FULL NAME</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem' }}>GENDER</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease', background: student.promote ? 'transparent' : 'rgba(239, 68, 68, 0.01)' }}>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => toggleStudent(student.id)}
                          style={{ background: 'none', border: 'none', color: student.promote ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          {student.promote ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{student.id}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-light)', fontSize: '0.9rem' }}>{student.name}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--silver-light)', fontSize: '0.85rem' }}>{student.gender}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span 
                          onClick={() => toggleStudent(student.id)}
                          style={{ 
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
                            background: student.promote ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: student.promote ? '#10b981' : '#ef4444',
                            border: student.promote ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          {student.promote ? 'PROMOTE / MIGRATE' : 'REPEATING'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No students match your query filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* On Mobile: Render Ledger Summary at the bottom */}
        {isMobile && renderSummary()}

        {/* On Desktop: Render Destination & Summary on the right column */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderTargetSelector()}
            {renderSummary()}
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px', width: '100%', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '20px',
            border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.75rem' }}>
              Confirm Class Migration
            </h3>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              You are about to promote <strong style={{ color: '#10b981' }}>{promotedCount} students</strong> to <strong style={{ color: '#3b82f6' }}>{selectedTargetClass?.name}</strong> and keep <strong style={{ color: '#ef4444' }}>{repeatingCount} students</strong> in <strong style={{ color: 'var(--text-light)' }}>{sourceClass?.name}</strong>.
              <br/><br/>
              In the new academic year, their grade rosters will initialize fresh (with N/A scores). Historical entries are safely preserved in archives. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePerformMigration}
                disabled={isSubmitting}
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmitting ? <RefreshCw size={14} className="spin" /> : <Check size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
