import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, BookOpen, 
  MapPin, Calendar, Award, GraduationCap, 
  Shield, Clock, Briefcase, BarChart3, Trash2
} from 'lucide-react';

export default function TeacherDetail() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'mainClass'>('assignments');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/${teacherId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const teacher = await res.json();

        if (res.ok && teacher) {
          setData({
            id: teacher.teacher_id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            status: 'Active',
            role: 'Subject Teacher',
            joiningDate: new Date(teacher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            qualification: teacher.qualification || 'Not Specified',
            email: teacher.email || 'N/A',
            phone: teacher.phone || 'N/A',
            specialization: Array.isArray(teacher.subjects) ? teacher.subjects : [],
            workload: {
              totalPeriods: (Array.isArray(teacher.classes) ? teacher.classes.length : 0) * 6,
              assignedClasses: Array.isArray(teacher.classes) ? teacher.classes.length : 0,
              department: 'General Academics'
            },
            rawClasses: Array.isArray(teacher.classes) ? teacher.classes : []
          });
        }
      } catch (err) {
        console.error('Error fetching teacher:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/classes?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setClassesList(json.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    fetchTeacher();
    fetchClasses();
  }, [teacherId]);

  const handleUnenroll = async () => {
    if (!await window.confirm(`Are you sure you want to unenroll ${data.name}? This will permanently delete their teaching records and system access.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        navigate('/admin/teachers');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to remove staff.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
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

  const getAssignments = () => {
    if (!data || !classesList.length) return [];
    
    const fullName = data.name;
    const list: any[] = [];
    
    classesList.forEach(cls => {
      const subjects = Array.isArray(cls.subjects) ? cls.subjects : [];
      subjects.forEach((subj: any) => {
        if (subj.teacher === fullName) {
          list.push({
            classId: cls.class_id,
            className: cls.name,
            subjectName: subj.name,
            periods: subj.periods || 6
          });
        }
      });
    });
    
    // Fallback if no live matches yet (so it doesn't break mock/pre-existing assignments)
    if (list.length === 0 && data.rawClasses) {
      data.rawClasses.forEach((className: string) => {
        const found = classesList.find(c => c.name === className);
        list.push({
          classId: found ? found.class_id : `CLS-${className.replace(/\s+/g, '')}`,
          className: className,
          subjectName: data.specialization?.[0] || 'Subject',
          periods: 6
        });
      });
    }
    
    return list;
  };

  const getMainClassTeacherStatus = () => {
    if (!data || !classesList.length) return null;
    const fullName = data.name;
    const foundClass = classesList.find(c => c.classTeacher === fullName);
    return foundClass ? foundClass : null;
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading teacher profile...</div>;
  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Staff record not found.</div>;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/teachers')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> Back to Teachers
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '16px', 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: '#3b82f6', display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.15rem' }}>{data.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{data.id}</span>
                <span style={{ 
                  fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', textTransform: 'uppercase'
                }}>{data.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleUnenroll}
              style={{ 
                padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
            >
              <Trash2 size={16} /> Unenroll Staff
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(`/admin/teachers/${teacherId}/edit`)}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Assigned Classes', value: data.workload.assignedClasses, icon: <Briefcase size={20} />, color: '#3b82f6' },
          { label: 'Total Periods', value: `${data.workload.totalPeriods}/wk`, icon: <Clock size={20} />, color: '#8b5cf6' },
          { label: 'Department', value: data.workload.department.split(' ')[0], icon: <BookOpen size={20} />, color: '#10b981' },
          { label: 'Staff Role', value: data.role.split(' ')[0], icon: <Shield size={20} />, color: 'var(--primary-gold)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: stat.color }}>
              {stat.icon}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-light)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Professional & Contact Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Professional Credentials */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#3b82f6" /> Professional Credentials
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Title & Role</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-light)', fontWeight: 600 }}>{data.role}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Joining Date</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} color="var(--text-muted)" /> {data.joiningDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Department</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={14} color="var(--text-muted)" /> {data.workload.department}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Qualifications</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} color="var(--text-muted)" /> {data.qualification}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Specializations</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.specialization.map((s: string) => (
                    <span key={s} style={{ 
                      fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px', 
                      background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Panel */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} color="#10b981" /> Communication Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <a href={`mailto:${data.email}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Official Email</div>
                <div style={{ fontSize: '0.95rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> {data.email}
                </div>
              </a>
              <a href={`tel:${data.phone}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone Number</div>
                <div style={{ fontSize: '0.95rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> {data.phone}
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs & Cards */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {/* Tab Switcher Headers */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('assignments')}
              style={{
                background: 'none', border: 'none', 
                color: activeTab === 'assignments' ? 'var(--primary-gold)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '0.4rem 0.8rem', position: 'relative',
                transition: 'color 0.2s ease'
              }}
            >
              Class Assignments
              {activeTab === 'assignments' && (
                <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: 'var(--primary-gold)' }} />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('mainClass')}
              style={{
                background: 'none', border: 'none', 
                color: activeTab === 'mainClass' ? 'var(--primary-gold)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '0.4rem 0.8rem', position: 'relative',
                transition: 'color 0.2s ease'
              }}
            >
              Main Class Teacher
              {activeTab === 'mainClass' && (
                <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: 'var(--primary-gold)' }} />
              )}
            </button>
          </div>

          {activeTab === 'assignments' ? (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--primary-gold)" /> Current Class Assignments
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {getAssignments().length > 0 ? (
                  getAssignments().map((asgn: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(`/admin/subjects/results/${asgn.classId}/${getSubjectKey(asgn.subjectName)}`)}
                      style={{ 
                        padding: '1rem', borderRadius: '10px', 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '1rem' }}>{asgn.className}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{asgn.subjectName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-gold)' }}>{asgn.periods}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Periods/wk</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active class assignments for this academic term.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={20} color="#10b981" /> Main Class Teacher Status
              </h2>
              {getMainClassTeacherStatus() ? (
                (() => {
                  const mClass = getMainClassTeacherStatus()!;
                  return (
                    <div 
                      onClick={() => navigate(`/admin/classes/${mClass.class_id}`)}
                      style={{
                        padding: '1.5rem', borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255,255,255,0.01) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(255,255,255,0.03) 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255,255,255,0.01) 100%)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Class Teacher</span>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-light)', marginTop: '0.5rem', marginBottom: '0.15rem' }}>{mClass.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Class ID: {mClass.class_id}</span>
                        </div>
                        <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
                          <GraduationCap size={24} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Classroom</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-light)' }}>{mClass.room || 'TBD'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Academic Level</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-light)' }}>{mClass.level || 'N/A'}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary-gold)', fontWeight: 600 }}>
                        Click to view full Class details & roster →
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Teacher Only</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem', lineHeight: '1.4' }}>
                    This staff member is currently not assigned as a Class Teacher (Main Class Teacher) for any main class.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    To assign them, please modify class settings in the Class management dashboard.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
