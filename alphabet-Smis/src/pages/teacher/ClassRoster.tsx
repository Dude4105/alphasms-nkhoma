import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserCheck, Download, BarChart3, Users, Loader, GraduationCap, Calendar } from 'lucide-react';

interface StudentRow {
  id: string;
  name: string;
  gender: string | null;
  type: string;
}

export default function ClassRoster() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [teacherName, setTeacherName] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch class data');

        const json = await res.json();
        setClassData(json);
        setStudents(
          (json.students || []).map((s: any) => ({
            id: s.student_id,
            name: `${s.firstName} ${s.lastName}`,
            gender: s.gender || 'N/A',
            type: s.scholarType || 'Day',
          }))
        );

        try {
          const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/classes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            setTeacherName(profileJson.teacher?.name || '');
          }
        } catch (e) {
          console.error('Error fetching teacher profile:', e);
        }
      } catch (err) {
        console.error('Error fetching class:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);



  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading class roster...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem', borderRadius: '16px' }}>
        <GraduationCap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Class Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The class record could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn-icon" 
          onClick={() => navigate('/teacher/classes')}
          style={{ width: 'auto', padding: '0 1rem', borderRadius: '20px', gap: '0.5rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} /> Back to My Classes
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>{classData.name}</h1>
            <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
              {classData.level || 'General'} · {classData.room || 'No Room'} · {students.length} students enrolled
            </p>
            {(() => {
              const teacherSubjects = (classData?.subjects || [])
                .filter((s: any) => s.teacher === teacherName)
                .map((s: any) => s.name);

              if (teacherSubjects.length === 0) return null;

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Your Subject{teacherSubjects.length > 1 ? 's' : ''}:</span>
                  {teacherSubjects.map(sub => (
                    <span 
                      key={sub}
                      onClick={() => navigate(`/teacher/subjects/results/${classId}/${getSubjectKey(sub)}`)}
                      style={{ 
                        fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn" 
              onClick={() => navigate(`/teacher/classes/${classId}/timetable`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
            >
              <Calendar size={16} /> View Timetable
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate(`/teacher/classes/${classId}/in-term-results`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
            >
              <BarChart3 size={16} /> View In-Term Results
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(`/teacher/classes/${classId}/attendance`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
            >
              <UserCheck size={16} /> Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: students.length, color: '#3b82f6' },
          { label: 'Boys', value: students.filter(s => s.gender === 'Male').length, color: '#3b82f6' },
          { label: 'Girls', value: students.filter(s => s.gender === 'Female').length, color: '#ec4899' },
          { label: 'Boarding', value: students.filter(s => s.type === 'Boarding').length, color: '#10b981' },
          { label: 'Day', value: students.filter(s => s.type !== 'Boarding').length, color: 'var(--primary-gold)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-light)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: stat.color, fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#3b82f6" /> Student Roster ({filteredStudents.length})
          </h2>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search student name or ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '220px', padding: '0.5rem 1rem 0.5rem 2.2rem' }} 
            />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>STUDENT ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>FULL NAME</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>GENDER</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.8rem' }}>SCHOLAR TYPE</th>
              </tr>
            </thead>
            <tbody>
               {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{student.id}</td>
                  <td 
                    style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-light)', cursor: 'pointer' }}
                    onClick={() => navigate(`/teacher/students/${student.id}`)}
                  >
                    <div style={{ transition: 'color 0.2s ease' }}
                         onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                         onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}>
                      {student.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--silver-light)', fontSize: '0.9rem' }}>{student.gender}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      background: student.type === 'Boarding' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: student.type === 'Boarding' ? '#10b981' : 'var(--text-muted)'
                    }}>
                      {student.type}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'No students match your search.' : 'No students enrolled in this class yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
