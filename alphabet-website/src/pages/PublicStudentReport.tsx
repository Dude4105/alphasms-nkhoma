import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer, Download, Loader } from 'lucide-react';

export default function PublicStudentReport() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const term = searchParams.get('term') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true);
      setError('');
      try {
        let url = `${import.meta.env.VITE_API_URL}/public-results/report/${studentId}`;
        const params = new URLSearchParams();
        if (term) params.append('term', term);
        if (year) params.append('academicYear', year);
        const queryStr = params.toString();
        if (queryStr) {
          url += `?${queryStr}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Report not found or not published.');
        const data = await res.json();
        if (data) {
          setStudent(data);
        } else {
          throw new Error('Report details could not be retrieved.');
        }
      } catch (err: any) {
        console.error('Error fetching student report:', err);
        setError(err.message || 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };
    if (studentId) {
      fetchStudent();
    }
  }, [studentId, term, year]);

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
        .catch((err: any) => {
          console.error("PDF generation failed:", err);
          setIsDownloadingPDF(false);
        });
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', background: '#090d16', color: '#fff' }}>
        <Loader size={32} className="spin" style={{ color: '#c8a951' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Retrieving Academic Progress Report...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', background: '#090d16', color: '#fff', padding: '2rem' }}>
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', textAlign: 'center', maxWidth: '480px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Unable to Load Report</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>{error || 'The requested student report could not be found or has not been published.'}</p>
        </div>
      </div>
    );
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
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Action Header */}
      <div className="no-print" style={{ width: '100%', maxWidth: '830px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Parent Portal</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>Official Progress Report Download</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.gold, color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            <Printer size={18} /> Print
          </button>
          <button className="btn" onClick={handleDownloadPDF} disabled={isDownloadingPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isDownloadingPDF ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', color: isDownloadingPDF ? 'rgba(255,255,255,0.4)' : '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: isDownloadingPDF ? 'not-allowed' : 'pointer', opacity: isDownloadingPDF ? 0.7 : 1 }}>
            {isDownloadingPDF ? <><Loader size={18} className="spin" style={{ color: C.gold }} /> Downloading...</> : <><Download size={18} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* === REPORT DOCUMENT === */}
      <div className="report-document" style={{
        maxWidth: '830px', padding: '0',
        background: '#fff', color: C.textDark, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        border: `2px solid ${C.navy}`, borderRadius: '2px', position: 'relative', overflow: 'hidden',
        width: '210mm', minHeight: '295mm', maxHeight: '297mm', boxSizing: 'border-box',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>

        {/* Top Gold Accent Bar */}
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${C.gold}, ${C.navy}, ${C.gold})` }} />

        {/* School Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: `2px solid ${C.navy}`, gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', background: C.navy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${C.gold}` }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
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

          {/* Badges */}
          {badges.length > 0 && (
            <div style={{ marginBottom: '10px', padding: '6px 12px', borderRadius: '4px', border: `1.5px double ${C.gold}`, background: `linear-gradient(135deg, #fffdf5 0%, #fdfcf7 100%)`, display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {badges.map((b, idx) => (
                <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', background: b.bg, color: b.color, fontSize: '0.55rem', fontWeight: 800, border: '1px solid rgba(0,0,0,0.05)' }}>
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {/* Subject Grades Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: `1.5px solid ${C.navy}` }}>
            <thead>
              <tr style={{ background: C.navy }}>
                {['#', 'SUBJECT', 'MARK (%)', 'GRADE', 'POINTS', 'RANK', 'REMARKS'].map((h, i) => (
                  <th key={i} style={{
                    padding: '5px 6px', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px',
                    textAlign: i === 1 || i === 6 ? 'left' : 'center',
                    borderRight: i < 6 ? `1px solid ${C.navyLight}` : 'none'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectsList.length > 0 ? subjectsList.map((g: any, i: number) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : C.rowAlt, borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.62rem', color: C.textLight, fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, color: C.textDark }}>{g.subject}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: C.textDark }}>{g.score}%</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: g.score >= 50 ? '#15803d' : '#dc2626' }}>{g.grade}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563' }}>{g.points || '—'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: C.textLight }}>{g.rank}/{g.totalInSubject}</td>
                  <td style={{ padding: '4px 6px', fontSize: '0.6rem', color: C.textLight, fontStyle: 'italic' }}>
                    {g.score >= 75 ? 'Excellent' : g.score >= 60 ? 'Good' : g.score >= 50 ? 'Satisfactory' : g.score >= 40 ? 'Needs Improvement' : 'Below Standard'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: C.textLight, fontSize: '0.75rem' }}>No results published for the active academic term.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Performance Summary Bar */}
          <div style={{ display: 'flex', background: C.goldLight, border: `1.5px solid ${C.gold}`, borderRadius: '3px', padding: '6px 12px', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Average Score</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.navy }}>{average.toFixed(1)}%</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: C.gold }} />
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Best 6 Points</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.gold }}>{studentPoints || '—'}</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: C.gold }} />
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: C.textLight, textTransform: 'uppercase' }}>Class Position</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: C.navy }}>{studentRank || '—'}<span style={{ fontSize: '0.65rem', fontWeight: 600, color: C.textLight }}>/{academic?.totalStudents || '—'}</span></div>
              </div>
            </div>
            <div style={{
              padding: '4px 16px', borderRadius: '3px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px',
              background: average >= passMinScore ? '#dcfce7' : '#fee2e2',
              color: average >= passMinScore ? '#166534' : '#991b1b',
              border: `1.5px solid ${average >= passMinScore ? '#86efac' : '#fca5a5'}`
            }}>
              {status}
            </div>
          </div>

          {/* Remarks Section */}
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
                {/* Optional remarks */}
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

        {/* Bottom Gold Accent Bar */}
        <div style={{ height: '5px', background: `linear-gradient(90deg, ${C.gold}, ${C.navy}, ${C.gold})`, marginTop: 'auto' }} />

        {/* Diagonal Watermark */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', opacity: 0.025, fontSize: '6rem', fontWeight: 900, pointerEvents: 'none', color: C.navy, letterSpacing: '12px', whiteSpace: 'nowrap' }}>
          OFFICIAL
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; padding: 0 !important; }
          .no-print, button { display: none !important; }
          .report-document { box-shadow: none !important; border: 1.5px solid #0f2b5b !important; }
          @page { margin: 1cm; size: portrait; }
        }
      `}</style>
    </div>
  );
}
