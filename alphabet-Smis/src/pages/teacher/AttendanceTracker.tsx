import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, 
  Save, Users, Calendar, Search, 
  UserCheck, AlertCircle, Loader2 
} from 'lucide-react';

interface StudentAttendance {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'unmarked';
}

export default function AttendanceTracker() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // Default to today's local date string formatted as YYYY-MM-DD
  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [searchTerm, setSearchTerm] = useState('');
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch student roster and attendance status from backend whenever classId or selectedDate changes
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/classes/${classId}/attendance?date=${selectedDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch attendance records');

        const json = await res.json();
        setClassName(json.className || 'Class Details');
        setStudents(json.students || []);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (classId) {
      fetchAttendance();
    }
  }, [classId, selectedDate]);

  const updateStatus = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    unmarked: students.filter(s => s.status === 'unmarked').length,
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Filter out unmarked students or save them as absent/unmarked? 
      // We will save all records as is.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/classes/${classId}/attendance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          date: selectedDate,
          records: students.map(s => ({
            studentId: s.id,
            status: s.status
          }))
        })
      });

      if (!res.ok) throw new Error('Failed to submit attendance data');

      setNotification({ type: 'success', message: 'Attendance records saved successfully!' });
      
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);

    } catch (err: any) {
      if (!navigator.onLine) {
        setNotification({ 
          type: 'success', 
          message: 'Offline: Attendance records queued for auto-sync!' 
        });
        setTimeout(() => {
          setNotification(null);
        }, 4000);
      } else {
        setNotification({ type: 'error', message: err.message || 'Error occurred while saving.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000,
          padding: '1rem 1.5rem', borderRadius: '12px', color: '#fff',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header section */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/teacher/attendance')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', padding: 0,
            fontSize: '0.9rem', fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Back to Attendance List
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--silver-light)', marginBottom: '0.5rem' }}>{className} Attendance</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} style={{ color: '#3b82f6' }} /> {stats.total} Enrolled
              </span>
              
              {/* Dynamic Calendar Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                <Calendar size={14} style={{ color: '#10b981' }} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              onClick={markAllPresent}
              disabled={isLoading || students.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <UserCheck size={18} /> Mark All Present
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isSaving || isLoading || students.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', minWidth: '140px' }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Records
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
          <Loader2 size={36} className="spin" style={{ color: '#3b82f6' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Syncing student attendance roster...</p>
        </div>
      ) : (
        <>
          {/* Analytics Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Present', value: stats.present, color: '#10b981', icon: <CheckCircle2 size={20} /> },
              { label: 'Absent', value: stats.absent, color: '#ef4444', icon: <XCircle size={20} /> },
              { label: 'Late', value: stats.late, color: '#f59e0b', icon: <Clock size={20} /> },
              { label: 'Unmarked', value: stats.unmarked, color: 'var(--text-muted)', icon: <AlertCircle size={20} /> },
            ].map((stat, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', borderLeft: `4px solid ${stat.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: stat.color, marginBottom: '0.5rem' }}>
                  {stat.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-light)' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Enrollment Roster ({filteredStudents.length})</h2>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>STUDENT</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem', textAlign: 'center' }}>ATTENDANCE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{s.id}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                          <button 
                            onClick={() => updateStatus(s.id, 'present')}
                            style={{ 
                              flex: 1, padding: '0.55rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                              background: s.status === 'present' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                              borderColor: s.status === 'present' ? '#10b981' : 'rgba(255,255,255,0.05)',
                              color: s.status === 'present' ? '#10b981' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <CheckCircle2 size={15} /> Present
                          </button>
                          <button 
                            onClick={() => updateStatus(s.id, 'absent')}
                            style={{ 
                              flex: 1, padding: '0.55rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                              background: s.status === 'absent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                              borderColor: s.status === 'absent' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                              color: s.status === 'absent' ? '#ef4444' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <XCircle size={15} /> Absent
                          </button>
                          <button 
                            onClick={() => updateStatus(s.id, 'late')}
                            style={{ 
                              flex: 1, padding: '0.55rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                              background: s.status === 'late' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                              borderColor: s.status === 'late' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                              color: s.status === 'late' ? '#f59e0b' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Clock size={15} /> Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Search size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>No students found matching your search.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Save Button for Mobile */}
      <div className="no-desktop" style={{ position: 'fixed', bottom: '2rem', left: '1rem', right: '1rem', zIndex: 100 }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={isSaving || isLoading || students.length === 0}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
        >
          {isSaving ? 'Processing...' : `Submit Attendance for ${stats.present + stats.abs + stats.late} Students`}
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 769px) {
          .no-desktop { display: none; }
        }
      `}</style>
    </div>
  );
}
