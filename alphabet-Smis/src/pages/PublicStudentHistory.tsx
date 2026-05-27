import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Award, BarChart3, TrendingUp, Users, FileText,
  Sun, Moon, Home as HomeIcon, AlertCircle
} from 'lucide-react';
import '../App.css';

export default function PublicStudentHistory() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [loadedYear, setLoadedYear] = useState('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  useEffect(() => {
    if (!studentId) return;
    
    // Check if a year is explicitly specified in the query parameters
    const queryYear = new URLSearchParams(window.location.search).get('year');
    if (queryYear) {
      setSelectedYear(queryYear);
    } else {
      // Fetch without a year parameter to let backend resolve default/active year
      fetchHistory('');
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId || !selectedYear) return;
    if (selectedYear === loadedYear) return;
    fetchHistory(selectedYear);
  }, [studentId, selectedYear, loadedYear]);

  const fetchHistory = async (year: string) => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const url = year 
        ? `http://localhost:3000/public-results/history/${studentId}?academicYear=${year}`
        : `http://localhost:3000/public-results/history/${studentId}`;

      const res = await fetch(url);
      if (!res.ok || res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      if (!data || !data.student) { setNotFound(true); return; }

      setStudentInfo(data.student);
      setHistoryData(data.history);
      setLoadedYear(data.activeYear);

      if (!selectedYear && data.activeYear) {
        setSelectedYear(data.activeYear);
      }

      // Build available years list: ensure selected/active year and past 2 years are in the list
      const baseYear = parseInt(data.activeYear || year || new Date().getFullYear().toString());
      const defaultYears = [String(baseYear - 2), String(baseYear - 1), String(baseYear)];

      // Enrich available years from classHistory if present
      let classHistoryYears: string[] = [];
      if (data.student.classHistory) {
        try {
          const hist = JSON.parse(data.student.classHistory);
          classHistoryYears = Object.keys(hist);
        } catch {}
      }

      setAvailableYears(
        Array.from(new Set([...defaultYears, ...classHistoryYears])).sort()
      );
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Derived values ────────────────────────────────────── */
  const t1 = historyData?.term1?.average || 0;
  const t2 = historyData?.term2?.average || 0;
  const t3 = historyData?.term3?.average || 0;

  const activeTerms = [t1, t2, t3].filter(v => v > 0);
  let trajectory = 'Stable';
  let trajectoryColor = 'var(--text-muted)';
  let trajectoryDiff = 0;
  if (activeTerms.length >= 2) {
    const firstVal = [t1, t2, t3].find(v => v > 0) || 0;
    const lastVal = [...[t1, t2, t3]].reverse().find(v => v > 0) || 0;
    trajectoryDiff = lastVal - firstVal;
    if (trajectoryDiff > 0) { trajectory = 'Improving'; trajectoryColor = '#10b981'; }
    else if (trajectoryDiff < 0) { trajectory = 'Declining'; trajectoryColor = '#ef4444'; }
  }

  const getAvgColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return 'var(--primary-gold)';
    return '#ef4444';
  };

  /* SVG trend line */
  const width = 500; const height = 180; const paddingX = 80;
  const points: { x: number; y: number; score: number; term: string }[] = [];
  if (t1 > 0) points.push({ x: paddingX,      y: height - (t1/100)*(height-60) - 30, score: t1, term: 'Term 1' });
  if (t2 > 0) points.push({ x: width/2,        y: height - (t2/100)*(height-60) - 30, score: t2, term: 'Term 2' });
  if (t3 > 0) points.push({ x: width-paddingX, y: height - (t3/100)*(height-60) - 30, score: t3, term: 'Term 3' });
  const dAttr     = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaDAttr = points.length > 0
    ? `${dAttr} L ${points[points.length-1].x} ${height-20} L ${points[0].x} ${height-20} Z`
    : '';

  /* Subject matrix */
  const subjectMap: Record<string, { term1?: number; term2?: number; term3?: number }> = {};
  const extractGrades = (grades: any, key: 'term1' | 'term2' | 'term3') => {
    if (!grades) return;
    grades.forEach((g: any) => {
      const k = g.subject.toUpperCase();
      if (!subjectMap[k]) subjectMap[k] = {};
      subjectMap[k][key] = g.score;
    });
  };
  if (historyData) {
    extractGrades(historyData.term1?.grades, 'term1');
    extractGrades(historyData.term2?.grades, 'term2');
    extractGrades(historyData.term3?.grades, 'term3');
  }

  /* Grade doughnut */
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let totalGradesCount = 0;
  if (historyData) {
    [historyData.term1, historyData.term2, historyData.term3].forEach(term => {
      if (term?.grades) {
        term.grades.forEach((g: any) => {
          const letter = (g.grade || 'C').toUpperCase().charAt(0);
          if (gradeCounts[letter] !== undefined) gradeCounts[letter]++;
          else gradeCounts['F']++;
          totalGradesCount++;
        });
      }
    });
  }
  const r = 50; const circum = 2 * Math.PI * r;
  let localOffset = 0;
  const gradeColors: Record<string, string> = {
    A: '#10b981', B: '#3b82f6', C: 'var(--primary-gold)', D: '#f97316', F: '#ef4444'
  };

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div className="app-container" style={{ background: 'var(--bg-darker)', minHeight: '100vh' }}>
      <div className="hero-gradient" style={{ opacity: isLightMode ? 0.05 : 0.3 }} />

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <button
          className="btn btn-outline"
          onClick={() => setIsLightMode(!isLightMode)}
          style={{ padding: '0.65rem', borderRadius: '50%' }}
        >
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.25rem', position: 'relative', zIndex: 5 }}>

        {/* Top nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/exam-results')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} /> Back to Results
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
          >
            <HomeIcon size={16} /> Home
          </button>
        </div>

        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary-gold)', color: '#000', padding: '0.9rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Award size={28} />
          </div>
          <h1 className="hero-title font-crimson" style={{ fontSize: '2.8rem', marginBottom: '0.5rem', color: isLightMode ? 'var(--text-light)' : '#fff' }}>
            Academic <span className="highlight" style={isLightMode ? { background: 'none', WebkitTextFillColor: 'initial', color: 'var(--gold-text)' } : {}}>History</span>
          </h1>
          {studentInfo && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {studentInfo.firstName} {studentInfo.lastName} &bull; <span style={{ color: 'var(--primary-gold)' }}>{studentId}</span>
              {studentInfo.className ? ` · ${studentInfo.className}` : ''}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ width: '44px', height: '44px' }} />
            <p>Retrieving academic records…</p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && notFound && (
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem', borderRadius: '24px' }}>
            <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
            <h2 className="step-title" style={{ marginBottom: '1rem' }}>Records Not Found</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              No academic history found for <strong style={{ color: 'var(--text-light)' }}>{studentId}</strong> in {selectedYear}.
              Try selecting a different year.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/exam-results')}>
              Back to Results
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !notFound && studentInfo && historyData && (
          <div className="animate-fade">

            {/* Year selector */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    style={{
                      padding: '0.45rem 1rem',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: selectedYear === yr ? 'var(--primary-gold)' : 'transparent',
                      color: selectedYear === yr ? '#000' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { label: 'Term 1 Average', value: t1 > 0 ? `${t1}%` : 'N/A', color: t1 > 0 ? getAvgColor(t1) : 'var(--text-muted)' },
                { label: 'Term 2 Average', value: t2 > 0 ? `${t2}%` : 'N/A', color: t2 > 0 ? getAvgColor(t2) : 'var(--text-muted)' },
                { label: 'Term 3 Average', value: t3 > 0 ? `${t3}%` : 'N/A', color: t3 > 0 ? getAvgColor(t3) : 'var(--text-muted)' },
                {
                  label: 'Overall Progress',
                  value: trajectoryDiff !== 0 ? `${trajectory} (${trajectoryDiff > 0 ? '+' : ''}${trajectoryDiff}%)` : trajectory,
                  color: trajectoryColor
                },
              ].map((card, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

              {/* Trend line */}
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarChart3 size={18} color="#3b82f6" /> Term-over-Term Trajectory
                </h3>
                {points.length > 0 ? (
                  <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="pub-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[25, 50, 75, 100].map(level => {
                      const yPos = height - (level/100)*(height-60) - 30;
                      return (
                        <g key={level}>
                          <line x1="40" y1={yPos} x2={width-40} y2={yPos} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                          <text x="25" y={yPos+4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{level}%</text>
                        </g>
                      );
                    })}
                    {areaDAttr && <path d={areaDAttr} fill="url(#pub-glow)" />}
                    {dAttr     && <path d={dAttr} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
                        <rect x={p.x-22} y={p.y-28} width="44" height="18" rx="5" fill="rgba(20,20,25,0.95)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                        <text x={p.x} y={p.y-15} fill="var(--text-light)" fontSize="10" fontWeight="700" textAnchor="middle">{p.score}%</text>
                        <text x={p.x} y={height-2} fill="var(--text-muted)" fontSize="11" textAnchor="middle">{p.term}</text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No term data available for {selectedYear}.
                  </div>
                )}
              </div>

              {/* Doughnut */}
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} color="var(--primary-gold)" /> Grade Distribution
                </h3>
                {totalGradesCount > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <svg width="130" height="130" viewBox="0 0 130 130">
                      <circle cx="65" cy="65" r={r} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                      {Object.entries(gradeCounts).map(([grade, count]) => {
                        if (count === 0) return null;
                        const pct = count / totalGradesCount;
                        const strokeDash = pct * circum;
                        const strokeOffset = circum - strokeDash + localOffset;
                        localOffset -= strokeDash;
                        return (
                          <circle key={grade} cx="65" cy="65" r={r} fill="transparent"
                            stroke={gradeColors[grade]} strokeWidth="12"
                            strokeDasharray={`${strokeDash} ${circum}`}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 65 65)" strokeLinecap="round"
                          />
                        );
                      })}
                      <text x="65" y="62" fill="var(--text-light)" fontSize="18" fontWeight="800" textAnchor="middle">{totalGradesCount}</text>
                      <text x="65" y="78" fill="var(--text-muted)" fontSize="9" textAnchor="middle">GRADES</text>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(gradeCounts).map(([grade, count]) => {
                        if (count === 0) return null;
                        const pct = Math.round((count / totalGradesCount) * 100);
                        return (
                          <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gradeColors[grade], flexShrink: 0 }} />
                            <strong style={{ color: 'var(--text-light)', width: '14px' }}>{grade}</strong>
                            <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No grade data available.
                  </div>
                )}
              </div>
            </div>

            {/* Subject matrix */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--primary-gold)" /> Subject Performance Over Time
              </h3>
              {Object.keys(subjectMap).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {Object.entries(subjectMap).map(([subj, terms], idx) => {
                    const s1 = terms.term1 || 0;
                    const s2 = terms.term2 || 0;
                    const s3 = terms.term3 || 0;
                    const sValues = [s1, s2, s3].filter(v => v > 0);
                    let progressLabel = 'Stable';
                    let progressColor = 'var(--text-muted)';
                    if (sValues.length >= 2) {
                      const first = [s1, s2, s3].find(v => v > 0) || 0;
                      const last  = [...[s1, s2, s3]].reverse().find(v => v > 0) || 0;
                      const diff  = last - first;
                      if (diff > 0)  { progressLabel = `+${diff}% Improvement`; progressColor = '#10b981'; }
                      if (diff < 0)  { progressLabel = `${diff}% Decline`;      progressColor = '#ef4444'; }
                    }
                    return (
                      <div key={idx} style={{ padding: '1.1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 650, color: 'var(--text-light)' }}>{subj}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: progressColor, background: 'rgba(255,255,255,0.02)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            {progressLabel}
                          </span>
                        </div>
                        {[
                          { label: 'Term 1', val: s1, color: '#f59e0b' },
                          { label: 'Term 2', val: s2, color: '#3b82f6' },
                          { label: 'Term 3', val: s3, color: '#10b981' },
                        ].map((bar, bi) => (
                          <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '45px', flexShrink: 0 }}>{bar.label}</span>
                            {bar.val > 0 ? (
                              <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${bar.val}%`, height: '100%', background: bar.color, borderRadius: '3px' }} />
                              </div>
                            ) : (
                              <span style={{ flexGrow: 1, fontSize: '0.68rem', color: 'rgba(255,255,255,0.1)' }}>Not graded</span>
                            )}
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, width: '35px', textAlign: 'right', color: bar.val > 0 ? 'var(--text-light)' : 'rgba(255,255,255,0.1)' }}>
                              {bar.val > 0 ? `${bar.val}%` : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No subject data available for this year.</p>
              )}
            </div>

            {/* Per-term grades tables */}
            {[1, 2, 3].map(termNum => {
              const termData = historyData[`term${termNum}`];
              if (!termData?.grades?.length) return null;
              return (
                <div key={termNum} className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                    Term {termNum} Results &mdash; Average: <span style={{ color: getAvgColor(termData.average), fontWeight: 800 }}>{termData.average}%</span>
                    {termData.points != null && (
                      <span style={{ color: 'var(--primary-gold)', marginLeft: '1rem', fontWeight: 700 }}>{termData.points} pts</span>
                    )}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="results-table font-atkinson" style={{ margin: 0, background: 'transparent', width: '100%' }}>
                      <thead>
                        <tr>
                          {['Subject', 'Score', 'Grade', 'Points', 'Rank'].map(h => (
                            <th key={h} style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '0.85rem 0.5rem', textAlign: h === 'Subject' ? 'left' : 'center', fontSize: '0.8rem' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {termData.grades.map((g: any, i: number) => (
                          <tr key={i}>
                            <td style={{ padding: '0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: 600 }}>{g.subject}</td>
                            <td style={{ padding: '0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700 }}>{g.score}%</td>
                            <td style={{ padding: '0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                              <span className={`result-badge ${g.grade?.toLowerCase().includes('a') ? 'distinction' : g.grade?.toLowerCase().includes('b') ? 'credit' : g.grade?.toLowerCase().includes('f') ? 'fail' : 'pass'}`}>
                                {g.grade}
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700, color: 'var(--primary-gold)' }}>{g.points ?? '-'}</td>
                            <td style={{ padding: '0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', color: 'var(--text-muted)' }}>
                              {g.rank != null ? `${g.rank} / ${g.totalInSubject}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Disclaimer */}
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(200,169,81,0.05)', borderRadius: '12px', border: '1px solid rgba(200,169,81,0.2)', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0 }}>
                <AlertCircle size={14} /> This is an unofficial academic summary for reference purposes only.
              </p>
            </div>

          </div>
        )}

        <div className="footer-bottom" style={{ marginTop: '2rem', opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} Heroes Academy | Academic Records Portal
        </div>
      </div>
    </div>
  );
}
