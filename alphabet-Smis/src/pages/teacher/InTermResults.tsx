import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Award, ArrowLeft, 
  TrendingUp, Printer, Download, GraduationCap, CheckCircle2, XCircle,
  PieChart, BookOpen, Loader, Calendar
} from 'lucide-react';

interface ResultItem {
  id: string;
  name: string;
  totalMarks: number;
  maxPotential: number;
  total: number;
  [key: string]: any; // To support dynamic subject keys
}

interface SubjectItem {
  id: string;
  name: string;
  key: string;
}

interface InTermData {
  name: string;
  level: string;
  term: string;
  subjects: SubjectItem[];
  gradingConfig?: any;
  results: ResultItem[];
}

export default function InTermResults() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<InTermData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const getGradingConfig = () => data?.gradingConfig || DEFAULT_GRADING;

  const resolveGrade = (score: number) => {
    const config = getGradingConfig();
    const rounded = Math.round(score);
    for (const g of config.grades) {
      if (rounded >= g.minScore && rounded <= g.maxScore) {
        return { grade: g.grade, label: g.label, points: g.points };
      }
    }
    const worst = config.grades[config.grades.length - 1];
    return { grade: worst.grade, label: worst.label, points: worst.points };
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:3000/teachers/classes/${classId}/in-term-results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const json = await res.json();
            setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch in-term results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Calculating aggregate term scores...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fade" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Failed to load results.
      </div>
    );
  }

  const { results } = data;
  const gc = getGradingConfig();
  const totalStudents = results.length;
  const passedCount = results.filter(s => s.total >= gc.passMinScore).length;
  const failedCount = totalStudents - passedCount;
  const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
  const avgScore = totalStudents > 0 ? results.reduce((acc, s) => acc + s.total, 0) / totalStudents : 0;
  const topStudent = results[0] || { name: 'N/A', total: 0, id: 'N/A' };

  const getPassColor = (score: number) => score >= gc.passMinScore ? '#10b981' : '#ef4444';

  const handleExportCSV = () => {
    if (!data || data.results.length === 0) return;
    
    const dynamicSubjectHeaders = (data.subjects || []).map(subj => subj.name.toUpperCase());
    const headers = ['Rank', 'Student ID', 'Student Name', ...dynamicSubjectHeaders, 'Aggregate Marks', 'Max Potential', 'Average Score (%)', 'Status'];
    
    const rows = data.results.map((s, i) => {
      const rank = s.total > 0 ? i + 1 : '-';
      const status = s.total >= 50 ? 'PASS' : 'FAIL';
      const subjectScores = (data.subjects || []).map(subj => {
        const score = s[subj.key];
        return typeof score === 'number' ? `${score}%` : (score || 'N/A');
      });
      
      return [
        rank,
        s.id,
        `"${s.name}"`,
        ...subjectScores,
        s.totalMarks,
        s.maxPotential,
        s.total,
        status
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}_${data.term.replace(/\s+/g, '_')}_Results.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(`/teacher/classes/${classId}`)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> Back to Class Roster
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
              <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>{data.name} In-Term Results</h1>
              <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>{data.level || 'General'}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <Calendar size={12} />
                  {data.term}
                </span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Aggregated Continuous Assessments</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
              <Printer size={16} /> Print Report
            </button>
            <button className="btn btn-primary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Export Live Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Class Average', value: `${avgScore.toFixed(1)}%`, icon: <BarChart3 size={20} />, color: '#3b82f6', sub: 'Across all tests' },
          { label: 'Pass Rate', value: `${passRate.toFixed(1)}%`, icon: <TrendingUp size={20} />, color: '#10b981', sub: `${passedCount} Students passing` },
          { label: 'Failure Rate', value: `${(100 - passRate).toFixed(1)}%`, icon: <XCircle size={20} />, color: failedCount > 0 ? '#ef4444' : '#10b981', sub: `${failedCount} Students failing` },
          { label: 'Data Source', value: 'Live', icon: <CheckCircle2 size={20} />, color: 'var(--primary-gold)', sub: 'From continuous scores' },
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
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Term Score</div>
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
            <PieChart size={16} color="#3b82f6" /> Score Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              ...gc.grades.filter((g: any) => g.minScore >= gc.passMinScore).map((g: any) => ({
                label: `${g.label} (${g.grade})`,
                color: g.grade === 'A' ? '#10b981' : g.grade === 'B' ? '#3b82f6' : g.grade === 'C' ? '#f59e0b' : g.grade === 'D' ? '#f97316' : '#6b7280',
                count: results.filter(s => s.total >= g.minScore && s.total <= g.maxScore).length,
              })),
              ...gc.grades.filter((g: any) => g.minScore < gc.passMinScore).map((g: any) => ({
                label: `${g.label} (${g.grade})`,
                color: '#ef4444',
                count: results.filter(s => s.total >= g.minScore && s.total <= g.maxScore).length,
              })),
            ].map((g, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-light)' }}>{g.label}</span>
                  <span style={{ fontWeight: 700, color: g.color }}>{g.count}</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalStudents > 0 ? (g.count/totalStudents)*100 : 0}%`, background: g.color }}></div>
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
            <Award size={20} color="var(--primary-gold)" /> In-Term Performance List
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem' }}>RANK</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem' }}>STUDENT</th>
                
                {/* Dynamic Subject Columns */}
                {(data.subjects || []).map(subj => (
                  <th key={subj.key} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>
                    {subj.name.toUpperCase()}
                  </th>
                ))}

                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>AGGREGATE MARKS</th>
                <th style={{ padding: '1rem' , fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>AVG SCORE</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>GRADE</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>PTS</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? results.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }} className="table-row-hover">
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: i < 3 && s.total > 0 ? 'var(--primary-gold)' : 'var(--text-muted)' }}>#{s.total > 0 ? i + 1 : '-'}</span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.95rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.id}</div>
                  </td>

                   {/* Dynamic Subject Scores */}
                   {(data.subjects || []).map(subj => {
                    const score = s[subj.key];
                    const isSubjFailed = typeof score === 'number' && score < gc.passMinScore;
                    return (
                      <td key={subj.key} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ 
                          color: isSubjFailed ? '#ef4444' : (score === 'N/A' ? 'var(--text-muted)' : 'var(--text-light)'),
                          fontWeight: typeof score === 'number' ? 600 : 400
                        }}>
                          {score}{typeof score === 'number' ? '%' : ''}
                        </span>
                      </td>
                    );
                  })}

                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px', color: 'var(--text-light)' }}>
                      <span style={{ fontWeight: 700 }}>{s.totalMarks}</span>
                      <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>/</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.maxPotential}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center', fontWeight: 800, color: getPassColor(s.total), fontSize: '1rem' }}>
                    {s.total}%
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: getPassColor(s.total) }}>
                    {resolveGrade(s.total).grade}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary-gold)' }}>
                    {s.points || resolveGrade(s.total).points}
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                      background: s.total >= gc.passMinScore ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: s.total >= gc.passMinScore ? '#10b981' : '#ef4444'
                    }}>
                      {s.total >= gc.passMinScore ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={(data.subjects?.length || 0) + 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No test grades have been entered for this class yet.
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
