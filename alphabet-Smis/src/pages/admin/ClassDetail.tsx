import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, BookOpen, GraduationCap, Clock, MapPin,
  Calendar, Award, BarChart3, UserCheck, Trash2, Edit3
} from 'lucide-react';

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const handleDeleteClass = async () => {
    if (!await window.confirm(`Are you sure you want to delete ${data.name}? This will unassign all students and remove class records.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        navigate('/admin/classes');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete class.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
  };

  const fetchClassDetails = async () => {
    if (!classId) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const c = await res.json();
      if (res.ok && c) {
        const parsedSubjects = Array.isArray(c.subjects) ? c.subjects : [];
        const students = c.students || [];

        const boysCount = students.filter((s:any) => s.gender === 'Male').length;
        const girlsCount = students.filter((s:any) => s.gender === 'Female').length;
        const boardingCount = students.filter((s:any) => s.scholarType === 'Boarding').length;
        const dayCount = students.filter((s:any) => s.scholarType === 'Day').length;

        const mappedData = {
          name: c.name,
          level: c.level || 'General',
          track: c.track || 'General',
          color: '#3b82f6',
          classTeacher: { name: c.classTeacher || 'Unassigned', subject: 'Class Teacher' },
          room: c.room || 'TBD',
          schedule: c.schedule || 'Standard Time',
          term: 'Term 1 (2025)',
          totalStudents: students.length,
          boysCount,
          girlsCount,
          boardingCount,
          dayCount,
          subjects: parsedSubjects.map((s: any) => ({
             name: s.name || 'Unknown', 
             teacher: s.teacher || 'Pending Assignment', 
             periods: s.periods || 5, 
             color: '#10b981'
          })),
          students: students.map((s: any) => ({
             id: s.student_id,
             name: `${s.firstName} ${s.lastName}`,
             gender: s.gender || 'Unknown',
             type: s.scholarType || 'Unknown',
             avg: s.avg !== undefined ? s.avg : 'N/A',
             status: 'Active'
          })),
          hasTimetable: !!c.timetable,
          performance: c.performance || { classAvg: 'N/A', passRate: 'N/A', topStudent: 'N/A' }
        };
        setData(mappedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const avgColor = (avg: string) => {
    if (avg === 'N/A') return 'var(--text-muted)';
    const n = parseInt(avg);
    if (n >= 80) return '#10b981';
    if (n >= 60) return 'var(--primary-gold)';
    if (n >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getSubjectKey = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n.includes('agriculture')) return 'agri';
    if (n.includes('biology')) return 'bio';
    if (n.includes('mathematics')) return 'math';
    if (n.includes('english')) return 'eng';
    if (n.includes('chichewa')) return 'chi';
    if (n.includes('physical science')) return 'phys';
    if (n.includes('chemistry')) return 'chem';
    if (n.includes('physics')) return 'physics';
    if (n.includes('history')) return 'hist';
    if (n.includes('geography')) return 'geog';
    if (n.includes('academic') || n.includes('general')) return 'gen';
    if (n.includes('social')) return 'social';
    if (n.includes('business')) return 'biz';
    if (n.includes('computer')) return 'comp';
    if (n.includes('home')) return 'home';
    return n.slice(0, 4);
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading class details...</div>;
  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Class not found.</div>;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/classes')} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> Back to Classes
        </button>
        <div className="class-detail-header-panel">
          <div className="class-detail-title-area">
            <div style={{ background: `${data.color}18`, padding: '0.75rem', borderRadius: '12px', color: data.color }}>
              <BookOpen size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.15rem', margin: 0 }}>{data.name}</h1>
              <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>{data.level} · {data.track}</p>
            </div>
          </div>
          <div className="class-detail-actions">
            <button 
              onClick={data.totalStudents === 0 ? handleDeleteClass : undefined}
              disabled={data.totalStudents > 0}
              title={data.totalStudents > 0 ? `Cannot delete: ${data.totalStudents} student(s) are still enrolled in this class` : 'Delete this class'}
              className="btn btn-delete-class"
              style={{
                opacity: data.totalStudents > 0 ? 0.5 : 1,
                cursor: data.totalStudents > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Trash2 size={16} /> Delete Class
            </button>
            <button 
              className="btn btn-final-results" 
              onClick={() => navigate(`/admin/classes/${classId}/results`)}
            >
              <BarChart3 size={16} /> Final Results
            </button>
            <button 
              className="btn btn-edit-class" 
              onClick={() => navigate(`/admin/classes/${classId}/edit`)}
            >
              <Edit3 size={16} /> Edit Class
            </button>
            <button 
              className="btn btn-primary btn-timetable" 
              onClick={() => navigate(`/admin/classes/${classId}/timetable${data.hasTimetable ? '' : '/create'}`)}
            >
              <Calendar size={18} /> {data.hasTimetable ? 'View Timetable' : 'Create Timetable'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Students', value: data.totalStudents, icon: <Users size={20} />, color: '#3b82f6' },
          { label: 'Boys / Girls', value: `${data.boysCount} / ${data.girlsCount}`, icon: <UserCheck size={20} />, color: '#8b5cf6' },
          { label: 'Boarding / Day', value: `${data.boardingCount} / ${data.dayCount}`, icon: <MapPin size={20} />, color: '#10b981' },
          { label: 'Class Average', value: `${data.performance.classAvg}%`, icon: <BarChart3 size={20} />, color: data.performance.classAvg >= 70 ? '#10b981' : '#f59e0b' },
          { label: 'Pass Rate', value: `${data.performance.passRate}%`, icon: <Award size={20} />, color: '#10b981' },
          { label: 'Top Student', value: data.performance.topStudent, icon: <GraduationCap size={20} />, color: 'var(--primary-gold)' },
        ].map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-light)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Class Info + Subjects side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Class Information */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color={data.color} /> Class Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Class Teacher', value: `${data.classTeacher.name} (${data.classTeacher.subject})`, icon: <GraduationCap size={16} /> },
              { label: 'Classroom', value: data.room, icon: <MapPin size={16} /> },
              { label: 'Schedule', value: data.schedule, icon: <Clock size={16} /> },
              { label: 'Academic Level', value: data.level, icon: <Award size={16} /> },
              { label: 'Current Term', value: data.term, icon: <Calendar size={16} /> },
              { label: 'Academic Track', value: data.track, icon: <BarChart3 size={16} /> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects & Teachers */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} color={data.color} /> Subjects & Teachers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.subjects.map((subj: any, i: number) => (
              <div 
                key={i} 
                onClick={() => navigate(`/admin/subjects/results/${classId}/${getSubjectKey(subj.name)}`)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.02)',
                  borderLeft: `3px solid ${subj.color}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, transform 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.95rem' }}>{subj.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subj.teacher}</div>
                </div>
                <span style={{ 
                  fontSize: '0.75rem', color: subj.color, fontWeight: 600,
                  padding: '0.2rem 0.6rem', borderRadius: '8px', background: `${subj.color}12`
                }}>
                  {subj.periods} periods/wk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      {data.students.length > 0 && (
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color={data.color} /> Student Roster
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{data.students.length} of {data.totalStudents} shown</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1.5rem', fontWeight: 500, fontSize: '0.85rem' }}>#</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Student ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Full Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Gender</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem', textAlign: 'center' }}>Average</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s: any, i: number) => (
                  <tr 
                    key={i} 
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-light)' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--silver-light)' }}>{s.gender}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '8px',
                        background: s.type === 'Boarding' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                        color: s.type === 'Boarding' ? '#3b82f6' : '#8b5cf6'
                      }}>{s.type}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: avgColor(s.avg) }}>{s.avg}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)', color: '#10b981'
                      }}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        /* Local Premium Styles for Admin Class Detail page */
        .class-detail-header-panel {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .class-detail-title-area {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .class-detail-actions {
          margin-left: auto;
          display: flex;
          gap: 0.75rem;
        }

        .btn-delete-class {
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }

        .btn-delete-class:not([disabled]):hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }

        .btn-delete-class[disabled] {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
        }

        .btn-final-results {
          display: flex;
          align-items: center;
          gap: 0.5rem; 
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6; 
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
        }

        .btn-edit-class {
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: white;
        }

        .btn-timetable {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #3b82f6;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
        }

        /* --- Mobile Responsive Rules --- */
        @media (max-width: 768px) {
          .class-detail-header-panel {
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
          }

          .class-detail-title-area {
            width: 100%;
          }

          .class-detail-actions {
            margin-left: 0;
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }

          .class-detail-actions .btn {
            width: 100%;
            justify-content: center;
            padding: 0.8rem 1.2rem !important;
            font-size: 0.95rem;
            border-radius: 12px !important;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
