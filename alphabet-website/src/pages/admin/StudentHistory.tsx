import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Award, BarChart3, TrendingUp, Users, User, Calendar, MessageCircle
} from 'lucide-react';

export default function StudentHistory() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');

  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('2027');
  const [availableYears, setAvailableYears] = useState<string[]>(['2025', '2026', '2027']);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch basic info first with year parameter
        const infoRes = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}?academicYear=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const infoJson = await infoRes.json();
        if (infoRes.ok && infoJson) {
          setStudentInfo({
            name: `${infoJson.firstName} ${infoJson.lastName}`,
            id: infoJson.student_id,
            class: infoJson.class?.name || 'Unassigned',
            status: 'Active',
            guardian: {
              name: infoJson.guardianName || 'N/A',
              phone: infoJson.guardianPhone || 'N/A',
              relationship: infoJson.guardianRelation || 'N/A',
            }
          });

          // Dynamically populate available years from classHistory
          let yearsList = ['2025', '2026'];
          if (infoJson.classHistory) {
            try {
              const hist = JSON.parse(infoJson.classHistory);
              const parsedYears = Object.keys(hist);
              yearsList = Array.from(new Set([...yearsList, ...parsedYears, infoJson.academic?.year])).filter(Boolean).sort() as string[];
            } catch {}
          }
          setAvailableYears(yearsList);
        }

        const fetchTerm = async (t: number) => {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}?term=${t}&academicYear=${selectedYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) return null;
          return res.json();
        };
        
        const [term1, term2, term3] = await Promise.all([
          fetchTerm(1),
          fetchTerm(2),
          fetchTerm(3),
        ]);
        
        setHistoryData({
          term1: term1?.academic,
          term2: term2?.academic,
          term3: term3?.academic,
        });
      } catch (err) {
        console.error('Error fetching academic history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [studentId, selectedYear]);

  const getAvgColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return 'var(--primary-gold)';
    return '#ef4444';
  };

  const handleBack = () => {
    if (isTeacher) {
      navigate(`/teacher/students/${studentId}`);
    } else {
      navigate(`/admin/students/${studentId}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '0.95rem' }}>Analyzing term assessment indices and grade archives...</p>
      </div>
    );
  }

  if (!studentInfo || !historyData) {
    return (
      <div className="animate-fade" style={{ padding: '2rem' }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
          <ArrowLeft size={18} /> Back to Profile
        </button>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Unable to retrieve historical academic records for this student.
        </div>
      </div>
    );
  }

  const t1 = historyData.term1?.average || 0;
  const t2 = historyData.term2?.average || 0;
  const t3 = historyData.term3?.average || 0;

  // Calculate overall trajectory
  let trajectory = 'Stable';
  let trajectoryColor = 'var(--text-muted)';
  let trajectoryDiff = 0;

  const activeTerms = [t1, t2, t3].filter(v => v > 0);
  if (activeTerms.length >= 2) {
    const firstVal = [t1, t2, t3].find(v => v > 0) || 0;
    const lastVal = [...[t1, t2, t3]].reverse().find(v => v > 0) || 0;
    trajectoryDiff = lastVal - firstVal;
    if (trajectoryDiff > 0) {
      trajectory = 'Improving';
      trajectoryColor = '#10b981';
    } else if (trajectoryDiff < 0) {
      trajectory = 'Declining';
      trajectoryColor = '#ef4444';
    }
  }

  // SVG calculations for trend line graph
  const width = 500;
  const height = 180;
  const paddingX = 80;
  
  const points: {x: number, y: number, score: number, term: string}[] = [];
  if (t1 > 0) points.push({ x: paddingX, y: height - (t1/100)*(height - 60) - 30, score: t1, term: 'Term 1' });
  if (t2 > 0) points.push({ x: width/2, y: height - (t2/100)*(height - 60) - 30, score: t2, term: 'Term 2' });
  if (t3 > 0) points.push({ x: width - paddingX, y: height - (t3/100)*(height - 60) - 30, score: t3, term: 'Term 3' });

  const dAttr = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaDAttr = points.length > 0 
    ? `${dAttr} L ${points[points.length - 1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`
    : '';

  // Gather subject performance matrices
  const subjectMap: Record<string, { term1?: number, term2?: number, term3?: number }> = {};
  const extractGrades = (termGrades: any, termKey: 'term1' | 'term2' | 'term3') => {
    if (termGrades) {
      termGrades.forEach((g: any) => {
        const key = g.subject.toUpperCase();
        if (!subjectMap[key]) subjectMap[key] = {};
        subjectMap[key][termKey] = g.score;
      });
    }
  };
  extractGrades(historyData.term1?.grades, 'term1');
  extractGrades(historyData.term2?.grades, 'term2');
  extractGrades(historyData.term3?.grades, 'term3');

  // Gather Grade Distribution counters
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let totalGradesCount = 0;
  [historyData.term1, historyData.term2, historyData.term3].forEach(term => {
    if (term?.grades) {
      term.grades.forEach((g: any) => {
        const letter = (g.grade || 'C').toUpperCase().charAt(0);
        if (gradeCounts[letter] !== undefined) {
          gradeCounts[letter]++;
        } else {
          gradeCounts['F']++;
        }
        totalGradesCount++;
      });
    }
  });

  // Circular Pie Ring calculations
  const r = 50;
  const circum = 2 * Math.PI * r;
  let localOffset = 0;
  const gradeColors: Record<string, string> = {
    A: '#10b981',
    B: '#3b82f6',
    C: 'var(--primary-gold)',
    D: '#f97316',
    F: '#ef4444',
  };

  return (
    <div className="student-history-container animate-fade">
      {/* Header Back Button */}
      <button onClick={handleBack} className="history-back-btn">
        <ArrowLeft size={18} /> Back to Profile
      </button>

      {/* Standalone Dashboard Header */}
      <div className="glass-panel history-header-panel">
        <div className="history-header-left">
          <div className="history-header-icon-box">
            <Award size={28} />
          </div>
          <div>
            <h1 className="history-header-title">Academic Performance Analytics</h1>
            <p className="history-header-subtitle">
              Term-over-Term history for <strong style={{ color: 'var(--text-light)' }}>{studentInfo.name}</strong> ({studentInfo.id}) &bull; Class: <strong style={{ color: 'var(--text-light)' }}>{studentInfo.class}</strong>
            </p>
          </div>
        </div>
        <div className="history-header-right">
          {/* Elegant Year Selector */}
          <div className="history-year-selector">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  setIsLoading(true);
                  setSelectedYear(yr);
                }}
                className={`year-btn ${selectedYear === yr ? 'active' : ''}`}
              >
                {yr}
              </button>
            ))}
          </div>

          <div className="history-active-year-badge">
            <TrendingUp size={16} /> Active Year: {selectedYear}
          </div>

          {/* WhatsApp Guardian Link */}
          {studentInfo?.guardian?.phone && studentInfo.guardian.phone !== 'N/A' ? (
            <a
              href={`https://wa.me/${studentInfo.guardian.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Mr. / Mrs. ${studentInfo.guardian.name}, ${studentInfo.name}'s ${studentInfo.guardian.relationship}\nHow are you!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: 'rgba(37, 211, 102, 0.1)', color: '#10b981',
                padding: '0.4rem 0.85rem', borderRadius: '8px',
                fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)')}
            >
              <MessageCircle size={15} /> WhatsApp Parent
            </a>
          ) : null}
        </div>
      </div>

      <div className="history-dashboard-content">
        {/* Top Stats Overview */}
        <div className="history-overview-grid">
          {[
            { label: 'Term 1 Average', value: t1 > 0 ? `${t1}%` : 'N/A', color: t1 > 0 ? getAvgColor(t1) : 'var(--text-muted)' },
            { label: 'Term 2 Average', value: t2 > 0 ? `${t2}%` : 'N/A', color: t2 > 0 ? getAvgColor(t2) : 'var(--text-muted)' },
            { label: 'Term 3 Average', value: t3 > 0 ? `${t3}%` : 'N/A', color: t3 > 0 ? getAvgColor(t3) : 'var(--text-muted)' },
            { 
              label: 'Overall Progress', 
              value: trajectoryDiff !== 0 
                ? `${trajectory} (${trajectoryDiff > 0 ? '+' : ''}${trajectoryDiff}%)` 
                : trajectory, 
              color: trajectoryColor 
            },
          ].map((card, idx) => (
            <div key={idx} className="glass-panel stat-overview-card">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value" style={{ color: card.color }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Graphs Row */}
        <div className="history-charts-row">
          
          {/* SVG Trend Line Graph */}
          <div className="glass-panel history-trajectory-card">
            <h3 className="chart-card-title">
              <BarChart3 size={18} color="#3b82f6" /> Term-over-Term Trajectory Chart
            </h3>
            {points.length > 0 ? (
              <div className="svg-container-wrapper">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="glow-grad-hist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[25, 50, 75, 100].map((level) => {
                    const yPos = height - (level/100)*(height - 60) - 30;
                    return (
                      <g key={level}>
                        <line x1="40" y1={yPos} x2={width - 40} y2={yPos} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                        <text x="25" y={yPos + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{level}%</text>
                      </g>
                    );
                  })}

                  {areaDAttr && (
                    <path d={areaDAttr} fill="url(#glow-grad-hist)" />
                  )}

                  {dAttr && (
                    <path d={dAttr} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                  )}

                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                      <rect x={p.x - 22} y={p.y - 28} width="44" height="18" rx="5" fill="rgba(20,20,25,0.95)" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
                      <text x={p.x} y={p.y - 15} fill="var(--text-light)" fontSize="10" fontWeight="700" textAnchor="middle">{p.score}%</text>
                      <text x={p.x} y={height - 2} fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontWeight="500">{p.term}</text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="insufficient-data-block">
                Insufficient term data to build linear graph.
              </div>
            )}
          </div>

          {/* Grade doughnut Chart */}
          <div className="glass-panel history-doughnut-card">
            <h3 className="chart-card-title">
              <Users size={18} color="var(--primary-gold)" /> Performance Grade Shares
            </h3>
            {totalGradesCount > 0 ? (
              <div className="doughnut-body-wrapper">
                <svg width="130" height="130" viewBox="0 0 130 130" className="doughnut-svg-element">
                  <circle cx="65" cy="65" r={r} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  {Object.entries(gradeCounts).map(([grade, count]) => {
                    if (count === 0) return null;
                    const pct = count / totalGradesCount;
                    const strokeDash = pct * circum;
                    const strokeOffset = circum - strokeDash + localOffset;
                    localOffset -= strokeDash;

                    return (
                      <circle
                        key={grade}
                        cx="65"
                        cy="65"
                        r={r}
                        fill="transparent"
                        stroke={gradeColors[grade]}
                        strokeWidth="12"
                        strokeDasharray={`${strokeDash} ${circum}`}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 65 65)"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  
                  <text x="65" y="62" fill="var(--text-light)" fontSize="18" fontWeight="800" textAnchor="middle">{totalGradesCount}</text>
                  <text x="65" y="78" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle" textTransform="uppercase">Grades</text>
                </svg>

                <div className="doughnut-grades-list">
                  {Object.entries(gradeCounts).map(([grade, count]) => {
                    if (count === 0) return null;
                    const pct = Math.round((count / totalGradesCount) * 100);
                    return (
                      <div key={grade} className="doughnut-grade-item">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gradeColors[grade] }}></span>
                        <strong className="doughnut-grade-label">{grade}</strong>
                        <span className="doughnut-grade-count">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="insufficient-data-block">
                No grade metrics available.
              </div>
            )}
          </div>
        </div>

        {/* Subject performance matrix */}
        <div className="glass-panel subject-matrix-card">
          <h3 className="subject-matrix-title">
            Subject Performance Over Time
          </h3>
          <div className="subject-progress-grid">
            {Object.keys(subjectMap).length > 0 ? (
              Object.entries(subjectMap).map(([subj, terms], idx) => {
                const s1 = terms.term1 || 0;
                const s2 = terms.term2 || 0;
                const s3 = terms.term3 || 0;

                let progressLabel = 'Stable';
                let progressColor = 'var(--text-muted)';
                const sValues = [s1, s2, s3].filter(v => v > 0);
                if (sValues.length >= 2) {
                  const firstVal = [s1, s2, s3].find(v => v > 0) || 0;
                  const lastVal = [...[s1, s2, s3]].reverse().find(v => v > 0) || 0;
                  const diff = lastVal - firstVal;
                  if (diff > 0) {
                    progressLabel = `+${diff}% Improvement`;
                    progressColor = '#10b981';
                  } else if (diff < 0) {
                    progressLabel = `${diff}% Decline`;
                    progressColor = '#ef4444';
                  }
                }

                return (
                  <div key={idx} className="subject-progress-card">
                    <div className="subject-progress-card-header">
                      <span className="subject-progress-name">{subj}</span>
                      <span className="subject-progress-label" style={{ color: progressColor }}>
                        {progressLabel}
                      </span>
                    </div>
                    
                    <div className="subject-progress-bars">
                      {[
                        { label: 'Term 1', val: s1, color: '#f59e0b' },
                        { label: 'Term 2', val: s2, color: '#3b82f6' },
                        { label: 'Term 3', val: s3, color: '#10b981' },
                      ].map((termBar, bIdx) => (
                        <div key={bIdx} className="subject-progress-bar-row">
                          <span className="term-bar-label">{termBar.label}</span>
                          {termBar.val > 0 ? (
                            <div className="term-bar-rail">
                              <div style={{ width: `${termBar.val}%`, background: termBar.color }} className="term-bar-fill"></div>
                            </div>
                          ) : (
                            <span className="term-bar-empty">Not Enrolled / Graded</span>
                          )}
                          <span className="term-bar-percentage" style={{ color: termBar.val > 0 ? 'var(--text-light)' : 'rgba(255,255,255,0.1)' }}>
                            {termBar.val > 0 ? `${termBar.val}%` : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="insufficient-data-block">No individual subject parameters available.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Local Premium Styles for Student History Dashboard */
        .student-history-container {
          padding: 1.5rem;
        }

        .history-back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          padding: 0;
          transition: color 0.2s;
        }

        .history-back-btn:hover {
          color: var(--text-light);
        }

        .history-header-panel {
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .history-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .history-header-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.1);
          color: '#3b82f6';
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .history-header-title {
          font-size: 1.6rem;
          color: var(--silver-light);
          margin: 0 0 0.15rem 0;
          fontWeight: 700;
        }

        .history-header-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0;
        }

        .history-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .history-year-selector {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 2px;
          borderRadius: 8px;
        }

        .year-btn {
          padding: 0.4rem 0.9rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .year-btn.active {
          background: var(--primary-gold);
          color: #000;
        }

        .history-active-year-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .history-dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .history-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .stat-overview-card {
          padding: 1.25rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.01);
          transition: transform 0.2s ease;
        }

        .stat-overview-card:hover {
          transform: translateY(-2px);
        }

        .stat-card-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .stat-card-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .history-charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .chart-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .svg-container-wrapper {
          width: 100%;
          overflow: visible;
        }

        .doughnut-body-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .doughnut-grades-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .doughnut-grade-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
        }

        .doughnut-grade-label {
          color: var(--text-light);
          width: 12px;
        }

        .doughnut-grade-count {
          color: var(--text-muted);
        }

        .insufficient-data-block {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .subject-matrix-card {
          padding: 1.5rem;
          border-radius: 14px;
        }

        .subject-matrix-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }

        .subject-progress-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .subject-progress-card {
          padding: 1.25rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          transition: transform 0.2s ease;
        }

        .subject-progress-card:hover {
          transform: translateY(-2px);
          border-color: rgba(253,184,19,0.15);
        }

        .subject-progress-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .subject-progress-name {
          font-weight: 650;
          color: var(--text-light);
          font-size: 1rem;
        }

        .subject-progress-label {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          background: rgba(255,255,255,0.02);
        }

        .subject-progress-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subject-progress-bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .term-bar-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          width: 45px;
          flex-shrink: 0;
        }

        .term-bar-rail {
          flex-grow: 1;
          height: 6px;
          background: rgba(255,255,255,0.03);
          border-radius: 3px;
          overflow: hidden;
          display: flex;
        }

        .term-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        .term-bar-empty {
          flex-grow: 1;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.1);
        }

        .term-bar-percentage {
          font-size: 0.75rem;
          font-weight: 700;
          width: 35px;
          text-align: right;
        }

        /* --- Mobile Overrides (width <= 768px) --- */
        @media (max-width: 768px) {
          .student-history-container {
            padding: 0.85rem !important; /* Maximizes viewport real estate */
          }

          .history-header-panel {
            padding: 1.25rem;
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .history-header-left {
            gap: 0.75rem;
          }

          .history-header-title {
            font-size: 1.3rem;
          }

          .history-header-subtitle {
            font-size: 0.8rem;
            line-height: 1.4;
          }

          .history-header-right {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 0.85rem;
          }

          .history-year-selector {
            width: 100%;
          }

          .year-btn {
            flex: 1;
            padding: 0.55rem 0.5rem;
            font-size: 0.75rem;
          }

          .history-active-year-badge {
            justify-content: center;
            padding: 0.55rem;
            font-size: 0.75rem;
          }

          .history-overview-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem;
          }

          .stat-overview-card {
            padding: 1rem;
          }

          .stat-card-label {
            font-size: 0.65rem;
          }

          .stat-card-value {
            font-size: 1.25rem;
          }

          .history-charts-row {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .doughnut-body-wrapper {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }

          .doughnut-grades-list {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            padding: 0 0.5rem;
          }

          .doughnut-grade-item {
            justify-content: center;
            background: rgba(255,255,255,0.02);
            padding: 0.5rem;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.03);
          }

          .subject-progress-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem;
          }

          .subject-progress-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
