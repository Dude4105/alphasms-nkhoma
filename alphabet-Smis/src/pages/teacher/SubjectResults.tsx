import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Award, ArrowLeft, 
  TrendingUp, Printer, Download, GraduationCap, CheckCircle2, XCircle,
  PieChart, BookOpen, Loader
} from 'lucide-react';

interface ResultEntry {
  id: string;
  name: string;
  total: number;
  inTermScore: number;
  finalScore: number;
}

interface SubjectResultsData {
  name: string;
  class: string;
  teacher: string;
  term: string;
  isFinalMode?: boolean;
  results: ResultEntry[];
}

export default function SubjectResults() {
  const { classId, subjectKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<SubjectResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passMinScore, setPassMinScore] = useState(40);
  const [activeTab, setActiveTab] = useState<'interm' | 'final'>('interm');

  useEffect(() => {
    if (data) {
      setActiveTab(data.isFinalMode ? 'final' : 'interm');
    }
  }, [data]);

  const handleBack = () => {
    if (location.pathname.startsWith('/admin')) {
      navigate(`/admin/classes/${classId}`);
    } else {
      navigate('/teacher/grades');
    }
  };
  
  // Filtering state
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');

  // Fetch active settings context on mount
  useEffect(() => {
    const fetchActiveContext = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // Use the teacher-accessible settings endpoint. /admin/settings and
        // /admin/settings/grading-system both return 403 for teachers, which used to
        // force a hardcoded year (and no pass threshold) that broke the results.
        const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.currentTerm) setTerm(settings.currentTerm.toString());
          if (settings.academicYear) setYear(settings.academicYear.toString());
          if (typeof settings.gradingPassMin === 'number') setPassMinScore(settings.gradingPassMin);
        } else {
          setTerm('1');
          setYear('2024');
        }
      } catch (e) {
        setTerm('1');
        setYear('2024');
      }
    };
    fetchActiveContext();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const url = new URL(`${import.meta.env.VITE_API_URL}/teachers/classes/${classId}/subjects/${subjectKey}/results`);
        url.searchParams.append('term', term);
        url.searchParams.append('academicYear', year);

        const res = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch results for the selected period.');
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (classId && subjectKey && term && year) {
      fetchResults();
    }
  }, [classId, subjectKey, term, year]);

  // NOTE: passMinScore now comes from /teachers/me/settings in fetchActiveContext above,
  // so we no longer call the admin-only /admin/settings/grading-system (403 for teachers).

  const results = data ? data.results.map((s) => ({
    ...s,
    total: activeTab === 'final' ? s.finalScore : s.inTermScore
  })).sort((a, b) => b.total - a.total) : [];
  const totalStudents = results.length;
  const passedCount = results.filter(s => s.total >= passMinScore).length;
  const failedCount = totalStudents - passedCount;
  const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
  const avgScore = totalStudents > 0 ? results.reduce((acc, s) => acc + s.total, 0) / totalStudents : 0;
  const topStudent = results[0] || { name: 'N/A', total: 0, id: '-' };

  const getPassColor = (score: number) => score >= passMinScore ? '#10b981' : '#ef4444';

  const handleExportCSV = () => {
    if (!data || results.length === 0) return;
    
    const scoreHeader = activeTab === 'final' ? "Final Score (%)" : "In-Term Score (%)";
    const headers = ["Rank", "Student ID", "Student Name", scoreHeader, "Status"];
    const rows = results.map((s, i) => [
      i + 1,
      s.id,
      s.name,
      s.total,
      s.total >= passMinScore ? "PASS" : "FAIL"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const modeName = activeTab === 'final' ? 'Final_Exam' : 'InTerm';
    link.setAttribute("download", `${data.name}_${data.class}_${modeName}_Results.csv`.replace(/\s+/g, '_'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade">
      {/* Header & Filters (Always Visible) */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={handleBack}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {data?.name || 'Subject'} Results
                {data && (
                  data.isFinalMode ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: 'var(--primary-gold)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    }}>
                      Final Exam Results
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}>
                      In-Term Results
                    </span>
                  )
                )}
              </h1>
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span>{data?.class || 'Class'}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                
                {/* Period Selectors */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '8px' }}>
                  <select 
                    value={term} 
                    onChange={(e) => setTerm(e.target.value)}
                    style={{ background: 'none', color: 'var(--primary-gold)', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                  <span style={{ opacity: 0.3 }}>/</span>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    style={{ background: 'none', color: 'var(--primary-gold)', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    {Array.from(new Set(['2024', '2025', '2026', year])).filter(Boolean).sort().map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Teacher: {data?.teacher || '...'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {data && (
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                marginRight: '0.5rem'
              }}>
                <button
                  onClick={() => setActiveTab('interm')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeTab === 'interm' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: activeTab === 'interm' ? '#3b82f6' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <BookOpen size={14} />
                  In-Term
                </button>
                <button
                  onClick={() => setActiveTab('final')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeTab === 'final' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    color: activeTab === 'final' ? 'var(--primary-gold)' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Award size={14} />
                  Final Exam
                </button>
              </div>
            )}
            <button 
              className="btn" 
              onClick={() => window.print()} 
              disabled={!data}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', opacity: data ? 1 : 0.5 }}
            >
              <Printer size={16} /> Print Results
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleExportCSV} 
              disabled={!data}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: data ? 1 : 0.5 }}
            >
              <Download size={16} /> Export Live Data
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
          <Loader size={40} className="spin" style={{ color: '#3b82f6' }} />
          <p style={{ color: 'var(--text-muted)' }}>Retrieving results for {year} Term {term}...</p>
        </div>
      ) : error || !data ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
          <XCircle size={48} color="#ef4444" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>No Scores Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || "We couldn't find any result records for this specific period. Try switching the term or academic year above."}</p>
          <button className="btn btn-outline" onClick={handleBack}>Return</button>
        </div>
      ) : (
        <>
          {/* Stats Area */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Subject Average', value: `${avgScore.toFixed(1)}%`, icon: <BarChart3 size={20} />, color: '#3b82f6', sub: 'Class-wide mean' },
              { label: 'Pass Rate', value: `${passRate.toFixed(1)}%`, icon: <TrendingUp size={20} />, color: '#10b981', sub: `${passedCount} Students passed` },
              { label: 'Failure Rate', value: `${(100 - passRate).toFixed(1)}%`, icon: <XCircle size={20} />, color: failedCount > 0 ? '#ef4444' : '#10b981', sub: `${failedCount} Students failed` },
              { label: 'Evaluation Mode', value: activeTab === 'final' ? 'Final Exam' : 'In-Term', icon: <CheckCircle2 size={20} />, color: 'var(--primary-gold)', sub: activeTab === 'final' ? 'Definitive scores' : 'CA aggregate scores' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', borderLeft: `4px solid ${stat.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {stat.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.2rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Top Performer Profile */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', color: 'var(--primary-gold)', opacity: 0.1 }}>
                <Award size={100} />
              </div>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Top Performer Profile</h3>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary-gold), #ffde33)', 
                  margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,215,0,0.2)'
                }}>
                  <GraduationCap size={40} color="#000" />
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-light)' }}>{topStudent.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', fontWeight: 600 }}>#{topStudent.id}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{topStudent.total}%</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>EXCELLENT</div>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={16} color="#3b82f6" /> Grade Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  { label: 'Distinction (80-100)', color: '#10b981', count: results.filter(s => s.total >= 80).length },
                  { label: 'Credit (60-79)', color: '#3b82f6', count: results.filter(s => s.total >= 60 && s.total < 80).length },
                  { label: `Pass (${passMinScore}-59)`, color: 'var(--primary-gold)', count: results.filter(s => s.total >= passMinScore && s.total < 60).length },
                  { label: `Failed (0-${passMinScore - 1})`, color: '#ef4444', count: results.filter(s => s.total < passMinScore).length },
                ].map((g, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-light)' }}>{g.label}</span>
                      <span style={{ fontWeight: 700, color: g.color }}>{g.count}</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: totalStudents > 0 ? `${(g.count/totalStudents)*100}%` : '0%', background: g.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Merit List */}
          <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--primary-gold)" /> Subject Performance Merit List
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem' }}>RANK</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem' }}>STUDENT</th>
                    <th style={{ padding: '1rem' , fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>{activeTab === 'final' ? 'FINAL SCORE (%)' : 'IN-TERM SCORE (%)'}</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No student scores recorded yet.</td>
                    </tr>
                  ) : results.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: i < 3 ? 'var(--primary-gold)' : 'var(--text-muted)' }}>#{i + 1}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.9rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.id}</div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: getPassColor(s.total), fontSize: '1.1rem' }}>
                        {s.total}%
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                          background: s.total >= passMinScore ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: s.total >= passMinScore ? '#10b981' : '#ef4444'
                        }}>
                          {s.total >= passMinScore ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
