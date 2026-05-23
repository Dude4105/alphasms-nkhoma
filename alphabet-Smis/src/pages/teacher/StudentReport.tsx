import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Loader } from 'lucide-react';

export default function StudentReport() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:3000/students/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data) setStudent(data);
      } catch (err) {
        console.error('Error fetching student report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const element = document.querySelector('.report-document');
    if (!element || !student) return;
    setIsDownloadingPDF(true);
    const opt = {
      margin: 0,
      filename: `${student.firstName}_${student.lastName}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    const runExport = () => {
      (window as any).html2pdf().set(opt).from(element).save()
        .then(() => setIsDownloadingPDF(false))
        .catch((err: any) => { console.error("PDF generation failed:", err); setIsDownloadingPDF(false); });
    };
    if ((window as any).html2pdf) {
      runExport();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = runExport;
      script.onerror = () => setIsDownloadingPDF(false);
      document.body.appendChild(script);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Generating report...</p>
      </div>
    );
  }

  if (!student) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Student not found.</div>;
  }

  const { academic, schoolInfo } = student;
  const average = academic?.average || 0;
  const passMinScore = academic?.grades?.[0]?.passMinScore || 40;
  const status = average >= passMinScore ? 'PASSED' : 'FAILED';
  const subjectsList = academic?.grades || [];

  const studentPoints = academic?.points;
  const studentRank = academic?.rank;
  const badges: { label: string; color: string; bg: string }[] = [];
  if (studentRank !== undefined && studentRank !== null) {
    if (Number(studentRank) === 1) badges.push({ label: '🥇 First in Class', color: '#7c5e10', bg: '#fef3c7' });
    else if (Number(studentRank) <= 3) badges.push({ label: `🥈 Top 3 (Rank ${studentRank})`, color: '#374151', bg: '#e5e7eb' });
    else if (Number(studentRank) <= 10) badges.push({ label: `🛡️ Top 10 (Rank ${studentRank})`, color: '#7c2d12', bg: '#fed7aa' });
  }
  if (studentPoints !== undefined && studentPoints !== null && Number(studentPoints) <= 9) {
    badges.push({ label: `⭐ Single Points (${studentPoints} pts)`, color: '#1e3a5f', bg: '#dbeafe' });
  }

  // Styles
  const C = {
    navy: '#0f2b5b',
    navyLight: '#1a3a6e',
    gold: '#c8a951',
    goldLight: '#f5ecd0',
    border: '#bfc9d9',
    textDark: '#111827',
    textMed: '#4b5563',
    textLight: '#6b7280',
    rowAlt: '#f8fafc',
    passGreen: '#166534',
    passBg: '#dcfce7',
    failRed: '#991b1b',
    failBg: '#fee2e2',
  };

  return (
    <div className="animate-fade">
      {/* Action Header */}
      <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          <ArrowLeft size={18} /> Back to Results
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-gold)', color: '#000' }}>
            <Printer size={18} /> Print
          </button>
          <button className="btn" onClick={handleDownloadPDF} disabled={isDownloadingPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isDownloadingPDF ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', color: isDownloadingPDF ? 'var(--text-muted)' : 'var(--text-light)', border: '1px solid var(--glass-border)', cursor: isDownloadingPDF ? 'not-allowed' : 'pointer', opacity: isDownloadingPDF ? 0.7 : 1 }}>
            {isDownloadingPDF ? <><Loader size={18} className="spin" style={{ color: 'var(--primary-gold)' }} /> Downloading...</> : <><Download size={18} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* === REPORT DOCUMENT === */}
      <div className="report-document" style={{
        maxWidth: '830px', margin: '0 auto', padding: '0',
        background: '#fff', color: C.textDark, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        border: `2px solid ${C.navy}`, borderRadius: '2px', position: 'relative', overflow: 'hidden',
        width: '210mm', minHeight: '295mm', maxHeight: '297mm', boxSizing: 'border-box',
      }}>

        {/* Top Gold Accent Bar */}
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${C.gold}, ${C.navy}, ${C.gold})` }} />

        {/* School Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: `2px solid ${C.navy}`, gap: '14px' }}>
          {/* Logo */}
          <div style={{ width: '52px', height: '52px', background: C.navy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${C.gold}` }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          {/* School Name */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: C.navy, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.2 }}>
              {schoolInfo?.name || 'SCHOOL NAME'}
            </div>
            <div style={{ fontSize: '0.7rem', color: C.textMed, fontWeight: 600, letterSpacing: '1px', marginTop: '1px' }}>
              {schoolInfo?.campus || 'Campus'} · {schoolInfo?.address || 'City, Country'}
            </div>
            <div style={{ fontSize: '0.65rem', color: C.textLight, marginTop: '1px' }}>
              {schoolInfo?.poBox || 'P.O. Box'} · {schoolInfo?.phone || 'Phone'}
            </div>
          </div>
          {/* Right Logo Mirror */}
          <div style={{ width: '52px', height: '52px', background: C.navy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${C.gold}` }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </div>

        {/* Report Title Bar */}
        <div style={{ background: C.navy, padding: '6px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <div style={{ height: '1px', flex: 1, background: C.gold, opacity: 0.4 }} />
          <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px' }}>Student Progress Report</span>
          <div style={{ height: '1px', flex: 1, background: C.gold, opacity: 0.4 }} />
        </div>
        <div style={{ textAlign: 'center', padding: '4px', background: C.goldLight, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.navy, letterSpacing: '1px' }}>
            ACADEMIC TERM {academic?.term} · {academic?.year}
          </span>
        </div>

        {/* Content Area */}
        <div style={{ padding: '14px 24px 12px' }}>

          {/* Student Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
              {[
                ['Student Name', `${student.firstName} ${student.lastName}`],
                ['Student ID', student.student_id],
                ['Class / Form', student.class?.name || 'Unassigned'],
                ['Class Rank', `${academic?.rank || 'N/A'} / ${academic?.totalStudents || 'N/A'}`],
                ['Gender', student.gender],
                ['Attendance', '100%'],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'baseline', padding: '3px 0', borderBottom: `1px dotted ${C.border}` }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: '72px' }}>{label}:</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: C.textDark }}>{value}</span>
                </div>
              ))}
            </div>
            {/* Photo */}
            <div style={{ width: '90px', height: '100px', border: `1.5px solid ${C.navy}`, borderRadius: '3px', background: '#f5f7fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#bfc9d9" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: '0.45rem', color: '#9ca3af', fontWeight: 700, marginTop: '2px' }}>PHOTO</span>
            </div>
          </div>

          {/* Academic Honors & Badges */}
          {badges.length > 0 && (
            <div style={{
              marginBottom: '10px', padding: '8px 12px', borderRadius: '4px',
              border: `1.5px double ${C.gold}`, background: `linear-gradient(135deg, #fffdf5 0%, #fdfcf7 100%)`,
            }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '6px' }}>
                ✦ Academic Honors & Achievements ✦
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Single Points Badge */}
                {studentPoints !== undefined && studentPoints !== null && Number(studentPoints) <= 9 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: '#fff',
                    border: `1px solid ${C.gold}`, boxShadow: '0 2px 6px rgba(30,60,114,0.2)',
                  }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#fcf6ba' }}>
                      {studentPoints}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fcf6ba', letterSpacing: '0.3px' }}>Single Points Club</div>
                      <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.7)' }}>Elite Aggregate: {studentPoints} Pts</div>
                    </div>
                  </div>
                )}
                {/* First in Class Badge */}
                {Number(studentRank) === 1 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                    background: 'linear-gradient(135deg, #bf953f 0%, #aa771c 100%)', color: '#fff',
                    border: '1px solid #fff', boxShadow: '0 2px 6px rgba(170,119,28,0.25)',
                  }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.8rem' }}>🥇</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#fff', letterSpacing: '0.3px', textTransform: 'uppercase' }}>First in Class</div>
                      <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.85)' }}>Top Performer</div>
                    </div>
                  </div>
                )}
                {/* Top 3 Badge */}
                {Number(studentRank) <= 3 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                    background: 'linear-gradient(135deg, #e0e0e0 0%, #a9a9a9 100%)', color: '#1a1a1a',
                    border: '1px solid #7f8c8d', boxShadow: '0 2px 6px rgba(169,169,169,0.2)',
                  }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: '1px solid #7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.8rem' }}>🥈</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '0.3px' }}>Academic Podium</div>
                      <div style={{ fontSize: '0.48rem', color: '#4a4a4a' }}>Top 3 · Rank {studentRank}</div>
                    </div>
                  </div>
                )}
                {/* Top 10 Badge */}
                {Number(studentRank) <= 10 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                    background: 'linear-gradient(135deg, #e6a15c 0%, #b87333 100%)', color: '#fff',
                    border: '1px solid #d35400', boxShadow: '0 2px 6px rgba(184,115,51,0.2)',
                  }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.8rem' }}>🛡️</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ffe6cc', letterSpacing: '0.3px' }}>Elite Ten</div>
                      <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.8)' }}>Top 10 · Rank {studentRank}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: `1.5px solid ${C.navy}` }}>
            <thead>
              <tr style={{ background: C.navy }}>
                {['#', 'SUBJECT', 'MARK (%)', 'GRADE', 'POINTS', 'RANK', 'REMARKS'].map((h, i) => (
                  <th key={i} style={{
                    padding: '5px 6px', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px',
                    textAlign: i === 1 || i === 6 ? 'left' : 'center',
                    borderRight: i < 6 ? `1px solid ${C.navyLight}` : 'none',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectsList.length > 0 ? subjectsList.map((s: any, i: number) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : C.rowAlt, borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.62rem', color: C.textLight, fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, color: C.textDark }}>{s.subject}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: C.textDark }}>{s.score}%</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: s.score >= 50 ? '#15803d' : '#dc2626' }}>{s.grade}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: C.textMed }}>{s.points || '—'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: C.textLight }}>{s.rank}/{s.totalInSubject}</td>
                  <td style={{ padding: '4px 6px', fontSize: '0.6rem', color: C.textLight, fontStyle: 'italic' }}>
                    {s.score >= 75 ? 'Excellent' : s.score >= 60 ? 'Good' : s.score >= 50 ? 'Satisfactory' : s.score >= 40 ? 'Needs Improvement' : 'Below Standard'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: C.textLight, fontSize: '0.75rem' }}>No results published for the active academic term.</td></tr>
              )}
            </tbody>
          </table>

          {/* Summary Bar */}
          <div style={{ display: 'flex', background: C.goldLight, border: `1.5px solid ${C.gold}`, borderRadius: '3px', padding: '6px 12px', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Average Score</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.navy }}>{average.toFixed(1)}%</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: C.gold }} />
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Best 6 Points</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.gold }}>{academic?.points || '—'}</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: C.gold }} />
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Class Position</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.navy }}>{academic?.rank || '—'}<span style={{ fontSize: '0.65rem', fontWeight: 600, color: C.textLight }}>/{academic?.totalStudents || '—'}</span></div>
              </div>
            </div>
            <div style={{
              padding: '4px 16px', borderRadius: '3px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px',
              background: average >= passMinScore ? C.passBg : C.failBg,
              color: average >= passMinScore ? C.passGreen : C.failRed,
              border: `1.5px solid ${average >= passMinScore ? '#86efac' : '#fca5a5'}`,
            }}>
              {status}
            </div>
          </div>

          {/* Remarks + Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: C.navy, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Class Teacher's Remarks</div>
              <div style={{ minHeight: '40px', borderBottom: `1.5px solid ${C.navy}`, padding: '4px 0', fontSize: '0.65rem', color: C.textMed, fontStyle: 'italic', lineHeight: 1.4 }}>
                {status === 'PASSED'
                  ? `${student.firstName} has demonstrated excellent dedication and progress. Keep up the good work.`
                  : `${student.firstName} needs to dedicate more time to studies in the coming term to meet expectations.`}
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ width: '150px', borderTop: `1.5px solid ${C.textDark}`, paddingTop: '3px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: C.textDark }}>Class Teacher</div>
                  <div style={{ fontSize: '0.5rem', color: C.textLight }}>Signature & Date</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: C.navy, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Head Teacher's Remarks</div>
              <div style={{ minHeight: '40px', borderBottom: `1.5px solid ${C.navy}`, padding: '4px 0', fontSize: '0.65rem', color: C.textMed, fontStyle: 'italic', lineHeight: 1.4 }}>
                {/* Head teacher remarks area */}
              </div>
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <div style={{ width: '150px', borderTop: `1.5px solid ${C.textDark}`, paddingTop: '3px', display: 'inline-block' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: C.textDark }}>School Principal</div>
                  <div style={{ fontSize: '0.5rem', color: C.textLight }}>Official Stamp & Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gold Bar */}
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${C.gold}, ${C.navy}, ${C.gold})`, marginTop: 'auto' }} />

        {/* Diagonal Watermark */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', opacity: 0.025, fontSize: '6rem', fontWeight: 900, pointerEvents: 'none', color: C.navy, letterSpacing: '12px', whiteSpace: 'nowrap' }}>
          OFFICIAL
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          .no-print, .sidebar, .system-header { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; }
          body { background: #fff !important; padding: 0 !important; margin: 0 !important; }
          .report-document {
            box-shadow: none !important; border: none !important;
            margin: 0 !important; border-radius: 0 !important;
            width: 100% !important; max-width: 100% !important;
            min-height: 100vh !important; max-height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
