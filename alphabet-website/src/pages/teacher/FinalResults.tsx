import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BarChart3, Award, ArrowLeft, 
  TrendingUp, Clock, Search,
  Printer, Download, Filter, GraduationCap, CheckCircle2, XCircle,
  BookOpen, ChevronRight, FileText, Loader, Calendar, MessageCircle
} from 'lucide-react';

export default function FinalResults() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Period state
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');

  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);
  const [reportStudentData, setReportStudentData] = useState<any>(null);

  const handleSendWhatsAppReport = async (studentId: string) => {
    setGeneratingReportId(studentId);
    try {
      const token = localStorage.getItem('accessToken');
      // Fetch full student report details
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch student report data');
      const studentData = await res.json();
      
      // Set the data to render the report component
      setReportStudentData(studentData);
      
      // Wait for React to render the element in the DOM
      setTimeout(() => {
        const element = document.querySelector('.whatsapp-report-document');
        if (!element) {
          setGeneratingReportId(null);
          setReportStudentData(null);
          alert('Could not generate report document element');
          return;
        }

        const opt = {
          margin: 0,
          filename: `${studentData.firstName}_${studentData.lastName}_Report.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        const downloadAndSend = () => {
          (window as any).html2pdf().set(opt).from(element).save()
            .then(() => {
              setGeneratingReportId(null);
              setReportStudentData(null);
              // Trigger WhatsApp message link opening
              const guardianPhone = studentData.guardianPhone || '';
              const guardianName = studentData.guardianName || 'N/A';
              const studentName = `${studentData.firstName} ${studentData.lastName}`;
              const relationship = studentData.guardianRelation || 'N/A';
              
              // Clean phone number
              const cleanPhone = guardianPhone.replace(/\D/g, '');
              
              const reportLink = `${window.location.origin}/reports/${studentId}?term=${term}&year=${year}`;
              const message = `Hello Mr. / Mrs. ${guardianName}, ${studentName}'s ${relationship}\nHow are you!\nBelow is the academic performance report detailing ${studentName}'s results for the ${year} Term ${term} final exams\nplease click the link to download: ${reportLink}`;
              
              window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
            })
            .catch((err: any) => {
              console.error("PDF generation failed:", err);
              setGeneratingReportId(null);
              setReportStudentData(null);
              alert("Failed to export PDF report");
            });
        };

        if ((window as any).html2pdf) {
          downloadAndSend();
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = downloadAndSend;
          script.onerror = () => {
            setGeneratingReportId(null);
            setReportStudentData(null);
            alert("Could not load pdf script");
          };
          document.body.appendChild(script);
        }
      }, 500); // Wait 500ms for React to render
    } catch (err) {
      console.error(err);
      setGeneratingReportId(null);
      setReportStudentData(null);
      alert('Error generating report');
    }
  };

  // Fetch active settings context on mount
  useEffect(() => {
    const fetchActiveContext = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // Use the teacher-accessible settings endpoint. /admin/settings returns 403 for
        // teachers, which used to force a hardcoded year that didn't match the saved grades.
        const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/teachers/me/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.currentTerm) setTerm(settings.currentTerm.toString());
          if (settings.academicYear) setYear(settings.academicYear.toString());
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
  const [gradingConfig, setGradingConfig] = useState<any>(DEFAULT_GRADING);

  const resolveGrade = (score: number) => {
    const rounded = Math.round(score);
    for (const g of gradingConfig.grades) {
      if (rounded >= g.minScore && rounded <= g.maxScore) {
        return { grade: g.grade, label: g.label, points: g.points };
      }
    }
    const worst = gradingConfig.grades[gradingConfig.grades.length - 1];
    return { grade: worst.grade, label: worst.label, points: worst.points };
  };

  useEffect(() => {
    if (term && year) {
      fetchResults();
    }
  }, [classId, term, year]);

  const fetchResults = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = classId 
        ? `${import.meta.env.VITE_API_URL}/classes/${classId}/results`
        : `${import.meta.env.VITE_API_URL}/teachers/me/main-class/results`;
      
      const url = new URL(baseUrl);
      url.searchParams.append('term', term);
      url.searchParams.append('academicYear', year);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch class results');
      const data = await res.json();
      setResultsData(data.results || []);
      setClassInfo(data.class);
      if (data.gradingConfig) setGradingConfig(data.gradingConfig);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadMeritPDF = () => {
    const element = document.getElementById('printable-merit-list');
    if (!element) return;
    setIsDownloadingPDF(true);

    const opt = {
      margin: 0.15,
      filename: `${classInfo?.name || 'Class'}_Merit_List_${year}_Term${term}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
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

  const handleExportCSV = () => {
    if (!classInfo || !resultsData.length) return;

    const subjects = classInfo.subjects || [];
    const headers = ['POS', 'NAME', 'ID', ...subjects.map((s: any) => s.name.toUpperCase()), 'TOTAL', 'AVG', 'STATUS'];
    
    const rows = resultsData.map((s, i) => [
      i + 1,
      s.name,
      s.id,
      ...subjects.map((subj: any) => s[subj.key] || 0),
      s.total,
      s.avg.toFixed(1),
      s.avg >= gradingConfig.passMinScore ? 'PASSED' : 'FAILED'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${classInfo.name}_Merit_List_${year}_Term${term}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        <Loader className="spin" size={32} />
        <span style={{ marginLeft: '1rem' }}>Loading live results...</span>
      </div>
    );
  }

  // Performance Statistics
  const totalStudents = resultsData.length;
  const passedCount = resultsData.filter(s => s.avg >= gradingConfig.passMinScore).length;
  const failedCount = totalStudents - passedCount;
  const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;
  const classMean = totalStudents > 0 ? resultsData.reduce((acc, curr) => acc + curr.avg, 0) / totalStudents : 0;
  const topStudent = resultsData.length > 0 ? resultsData[0] : { name: 'N/A', total: 0, avg: 0 };

  const filteredResults = resultsData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute Best 6 Points from live subject scores (picks 6 lowest/best grade-point subjects)
  const computeBest6Points = (s: any): number | null => {
    const subjects = classInfo?.subjects || [];
    if (subjects.length === 0 || s.total === 0) return null;
    const worstPoint = Math.max(...gradingConfig.grades.map((g: any) => g.points));
    const gradedPoints: number[] = (subjects as any[])
      .map((subj: any) => {
        const score = s[subj.key];
        return (score !== undefined && score !== null && score > 0)
          ? resolveGrade(score).points
          : null;
      })
      .filter((p): p is number => p !== null);
    if (gradedPoints.length === 0) return null;
    const sorted = [...gradedPoints].sort((a, b) => a - b);
    const padded = [...sorted];
    while (padded.length < 6) padded.push(worstPoint);
    return padded.slice(0, 6).reduce((acc, p) => acc + p, 0);
  };

  return (
    <div className="animate-fade">
      <style>{`
        /* ── Mobile responsive styles for FinalResults ── */
        .fr-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .fr-action-btns {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .fr-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .fr-info-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        /* Desktop table, mobile cards */
        .fr-table-wrap { display: block; overflow-x: auto; }
        .fr-student-cards { display: none; }
        .fr-title-h1 { font-size: 1.8rem; }
        .fr-btn-text { display: inline; }

        @media (max-width: 768px) {
          .fr-header-row { align-items: flex-start; }
          .fr-action-btns { width: 100%; }
          .fr-action-btns .btn {
            flex: 1;
            justify-content: center;
            padding: 0.6rem 0.5rem;
            font-size: 0.75rem;
          }
          .fr-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .fr-info-row {
            grid-template-columns: 1fr;
          }
          .fr-table-wrap { display: none; }
          .fr-student-cards { display: flex; flex-direction: column; gap: 0.85rem; padding: 1rem; }
          .fr-title-h1 { font-size: 1.3rem; }
          .fr-btn-text { display: none; }
          .fr-merit-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .fr-merit-search {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        .fr-student-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        .fr-card-rank-badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .fr-card-subjects {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.75rem;
        }
        .fr-card-subject-pill {
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
        }
        .fr-card-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .fr-card-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.4rem 0.5rem;
          text-align: center;
        }
        .fr-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .fr-card-actions .btn {
          flex: 1;
          justify-content: center;
          font-size: 0.72rem;
          padding: 0.45rem 0.5rem;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => classId ? navigate(`/admin/classes/${classId}`) : navigate('/teacher/main-class')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> {classId ? 'Back to Class Details' : 'Back to Dashboard'}
        </button>
        <div className="fr-header-row">
          <div>
            <h1 className="fr-title-h1" style={{ color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Final Exam Results</h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              {classInfo?.name} · Merit List
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <Calendar size={12} style={{ color: 'var(--primary-gold)' }} />
                <select 
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)}
                  style={{ background: 'none', color: '#3b82f6', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="1" style={{ background: '#1c1d24', color: 'var(--text-light)' }}>Term 1</option>
                  <option value="2" style={{ background: '#1c1d24', color: 'var(--text-light)' }}>Term 2</option>
                  <option value="3" style={{ background: '#1c1d24', color: 'var(--text-light)' }}>Term 3</option>
                </select>
                <span style={{ opacity: 0.3 }}>/</span>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  style={{ background: 'none', color: '#3b82f6', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                >
                  {Array.from(new Set(['2024', '2025', '2026', year])).filter(Boolean).sort().map(y => (
                    <option key={y} value={y} style={{ background: '#1c1d24', color: 'var(--text-light)' }}>{y}</option>
                  ))}
                </select>
              </span>
            </p>
          </div>
          <div className="fr-action-btns no-print">
            <button 
              onClick={handlePrint}
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
            >
              <Printer size={16} /> <span className="fr-btn-text">Print</span>
            </button>
            <button 
              onClick={handleDownloadMeritPDF}
              disabled={isDownloadingPDF}
              className="btn" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', 
                border: '1px solid rgba(59, 130, 246, 0.2)',
                cursor: isDownloadingPDF ? 'not-allowed' : 'pointer'
              }}
            >
              {isDownloadingPDF ? (
                <><Loader size={16} className="spin" style={{ color: '#3b82f6' }} /><span className="fr-btn-text">Generating...</span></>
              ) : (
                <><FileText size={16} /><span className="fr-btn-text">Merit PDF</span></>
              )}
            </button>
            <button 
              onClick={handleExportCSV}
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} /> <span className="fr-btn-text">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="fr-stats-grid">
        {[
          { label: 'Pass Rate', value: `${passRate.toFixed(1)}%`, icon: <TrendingUp size={20} />, color: '#10b981', desc: `Met ${gradingConfig.passMinScore}% threshold` },
          { label: 'Students Passed', value: passedCount, icon: <CheckCircle2 size={20} />, color: '#10b981', desc: `Out of ${totalStudents}` },
          { label: 'Students Failed', value: failedCount, icon: <XCircle size={20} />, color: failedCount > 0 ? '#ef4444' : '#10b981', desc: `Below ${gradingConfig.passMinScore}% average` },
          { label: 'Class Mean Score', value: `${classMean.toFixed(1)}%`, icon: <BarChart3 size={20} />, color: '#3b82f6', desc: 'Overall academic avg' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(1.5)', color: stat.color }}>{stat.icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, marginBottom: '0.2rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="fr-info-row">
        {/* Top Performer Card */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-gold)', color: '#000', padding: '0.75rem', borderRadius: '12px' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Performer</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)' }}>{topStudent.name}</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Marks</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-gold)' }}>
                {topStudent.total}/{(classInfo?.subjects?.length || 0) * 100}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Average Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-gold)' }}>{topStudent.avg.toFixed(1)}%</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(253,184,19,0.3)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best 6 Points</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-gold)' }}>{computeBest6Points(topStudent) ?? 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Exam Timeline info */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="#3b82f6" /> Exam Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assessment Status</span>
              <span style={{ color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table + Card Section */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Panel Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="fr-merit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <GraduationCap size={24} color="#3b82f6" /> Class Merit List
            </h2>
            <div className="fr-merit-search" style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '400px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <button className="btn" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', flexShrink: 0 }}>
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="fr-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8rem' }}>POS</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem' }}>STUDENT NAME</th>
                {(classInfo?.subjects || []).map((subj: any) => (
                  <th key={subj.key} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>
                    {subj.name.substring(0, 4).toUpperCase()}
                  </th>
                ))}
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>TOTAL</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>AVG (%)</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>GRADE</th>
                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>BEST 6 PTS</th>
                <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8rem', textAlign: 'right' }}>REPORT</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((s, i) => {
                const rank = i + 1;
                const isFailed = s.avg < gradingConfig.passMinScore;
                const resolved = resolveGrade(s.avg);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease' }} className="table-row-hover">
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: rank <= 3 ? (rank === 1 ? 'var(--primary-gold)' : rank === 2 ? '#c0c0c0' : '#cd7f32') : 'rgba(255,255,255,0.05)',
                        color: rank <= 3 ? '#000' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem'
                      }}>
                        {rank}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.id}</div>
                    </td>
                    {(classInfo?.subjects || []).map((subj: any) => {
                      const score = s[subj.key] || 0;
                      return (
                        <td key={subj.key} style={{ padding: '1rem', textAlign: 'center', color: score < gradingConfig.passMinScore ? '#ef4444' : 'var(--text-light)', fontSize: '0.9rem' }}>
                          {score}
                        </td>
                      );
                    })}
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-light)' }}>{s.total}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: isFailed ? '#ef4444' : '#10b981' }}>{s.avg.toFixed(1)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: isFailed ? '#ef4444' : '#10b981' }}>{resolved.grade}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary-gold)' }}>{computeBest6Points(s) ?? 'N/A'}</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '6px',
                        background: isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isFailed ? '#ef4444' : '#10b981',
                        letterSpacing: '0.05em'
                      }}>
                        {isFailed ? 'FAILED' : 'PASSED'}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        className="btn no-print"
                        onClick={() => navigate(`/teacher/students/${s.id}/report`)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary-gold)', border: '1px solid rgba(255, 215, 0, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FileText size={14} /> View Report
                      </button>
                      <button 
                        className="btn no-print"
                        onClick={() => handleSendWhatsAppReport(s.id)}
                        disabled={generatingReportId === s.id}
                        style={{ 
                          padding: '0.4rem 0.8rem', fontSize: '0.75rem', 
                          background: 'rgba(37, 211, 102, 0.1)', color: '#10b981', 
                          border: '1px solid rgba(37, 211, 102, 0.2)', 
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          cursor: generatingReportId === s.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {generatingReportId === s.id ? (
                          <><Loader size={14} className="spin" /> Sending...</>
                        ) : (
                          <><MessageCircle size={14} /> Send Report</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="fr-student-cards">
          {filteredResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No results found.
            </div>
          )}
          {filteredResults.map((s, i) => {
            const rank = i + 1;
            const isFailed = s.avg < gradingConfig.passMinScore;
            const resolved = resolveGrade(s.avg);
            const rankBg = rank === 1 ? 'var(--primary-gold)' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.08)';
            const rankColor = rank <= 3 ? '#000' : 'var(--text-muted)';
            return (
              <div key={s.id} className="fr-student-card" style={{ borderLeft: `4px solid ${isFailed ? '#ef4444' : '#10b981'}` }}>
                {/* Rank badge */}
                <span className="fr-card-rank-badge" style={{ background: rankBg, color: rankColor }}>
                  {rank}
                </span>

                {/* Identity */}
                <div style={{ paddingRight: '2.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.2 }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{s.id}</div>
                </div>

                {/* Subject pills */}
                {(classInfo?.subjects || []).length > 0 && (
                  <div className="fr-card-subjects">
                    {(classInfo?.subjects || []).map((subj: any) => {
                      const score = s[subj.key] || 0;
                      const fail = score < gradingConfig.passMinScore;
                      return (
                        <span key={subj.key} className="fr-card-subject-pill" style={{
                          color: fail ? '#ef4444' : 'var(--text-light)',
                          borderColor: fail ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'
                        }}>
                          {subj.name.substring(0, 3).toUpperCase()}: <strong>{score}</strong>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Summary stats */}
                <div className="fr-card-summary" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  <div className="fr-card-stat">
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>TOTAL</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-light)' }}>{s.total}</div>
                  </div>
                  <div className="fr-card-stat">
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>AVG</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isFailed ? '#ef4444' : '#10b981' }}>{s.avg.toFixed(1)}%</div>
                  </div>
                  <div className="fr-card-stat">
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>GRADE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isFailed ? '#ef4444' : '#10b981' }}>{resolved.grade}</div>
                  </div>
                  <div className="fr-card-stat" style={{ borderColor: 'rgba(253,184,19,0.3)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>BEST 6</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-gold)' }}>{computeBest6Points(s) ?? 'N/A'}</div>
                  </div>
                  <div className="fr-card-stat">
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>STATUS</div>
                    <div style={{ 
                      fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '5px', display: 'inline-block', marginTop: '0.1rem',
                      background: isFailed ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                      color: isFailed ? '#ef4444' : '#10b981'
                    }}>{isFailed ? 'FAIL' : 'PASS'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="fr-card-actions no-print">
                  <button 
                    className="btn"
                    onClick={() => navigate(`/teacher/students/${s.id}/report`)}
                    style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--primary-gold)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileText size={14} /> Report
                  </button>
                  <button 
                    className="btn"
                    onClick={() => handleSendWhatsAppReport(s.id)}
                    disabled={generatingReportId === s.id}
                    style={{ 
                      background: 'rgba(37,211,102,0.1)', color: '#10b981', 
                      border: '1px solid rgba(37,211,102,0.2)',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      cursor: generatingReportId === s.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {generatingReportId === s.id ? <><Loader size={14} className="spin" /> Sending...</> : <><MessageCircle size={14} /> WhatsApp</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredResults.length} students ranked by overall aggregate.
          </div>
        </div>
      </div>

      {/* Subject Performance Overview (Homeroom Teacher Drill-down) */}
      <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--primary-gold)', borderRadius: '2px' }}></div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-light)' }}>Subject Performance Overview</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {(classInfo?.subjects || []).map((subj: any) => {
            const subjectScores = resultsData.map(s => (s as any)[subj.key] || 0);
            const subjPassed = subjectScores.filter(score => score >= gradingConfig.passMinScore).length;
            const subjPassRate = totalStudents > 0 ? (subjPassed / totalStudents) * 100 : 0;
            
            return (
              <div 
                key={subj.id}
                onClick={() => {
                  const basePath = classId ? '/admin' : '/teacher';
                  navigate(`${basePath}/subjects/results/${classInfo?.id}/${subj.key}`);
                }}
                className="glass-panel"
                style={{ 
                  borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: `4px solid ${subj.color}`, position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 10px 20px -5px ${subj.color}20`;
                  e.currentTarget.style.borderColor = subj.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', background: `${subj.color}15`,
                    color: subj.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
                
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.25rem' }}>{subj.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: subj.color }}>{subjPassRate.toFixed(1)}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PASS RATE</span>
                </div>
                
                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${subjPassRate}%`, background: subj.color, borderRadius: '10px' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Merit List Area Hidden Wrapper */}
      {classInfo && resultsData.length > 0 && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '1120px', height: '1px', overflow: 'hidden', pointerEvents: 'none', zIndex: -9999, opacity: 0 }}>
          <div id="printable-merit-list" style={{
            width: '1120px',
            background: '#ffffff',
            color: '#111827',
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          }}>
          {/* Top Accent */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #c8a951, #0f2b5b, #c8a951)' }}></div>

          {/* School Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '2px solid #0f2b5b', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: '#0f2b5b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #c8a951' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c8a951" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f2b5b', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.2 }}>Heroes Academy</div>
              <div style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: 600, letterSpacing: '1px' }}>Blantyre Campus · Striving for Excellence</div>
            </div>
            <div style={{ width: '40px', height: '40px', background: '#0f2b5b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #c8a951' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c8a951" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
          </div>

          {/* Title Bar */}
          <div style={{ background: '#0f2b5b', padding: '6px 16px', textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px' }}>Official Class Merit List</span>
          </div>
          <div style={{ textAlign: 'center', padding: '4px', background: '#f5ecd0', borderBottom: '1px solid #bfc9d9' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0f2b5b', letterSpacing: '1px' }}>
              {classInfo?.name} · Term {term} · Academic Year {year}
            </span>
          </div>

          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '4px 12px', border: '1px solid #bfc9d9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Students</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f2b5b' }}>{totalStudents}</div>
            </div>
            <div style={{ padding: '4px 12px', border: '1px solid #bfc9d9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Passed</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#166534' }}>{passedCount}</div>
            </div>
            <div style={{ padding: '4px 12px', border: '1px solid #bfc9d9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Failed</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#991b1b' }}>{failedCount}</div>
            </div>
            <div style={{ padding: '4px 12px', border: '1px solid #bfc9d9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Pass Rate</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f2b5b' }}>{passRate.toFixed(1)}%</div>
            </div>
            <div style={{ padding: '4px 12px', border: '1px solid #bfc9d9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Class Mean</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f2b5b' }}>{classMean.toFixed(1)}%</div>
            </div>
          </div>

          {/* Merit List Table */}
          <div style={{ padding: '0 10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #0f2b5b' }}>
              <thead>
                <tr style={{ background: '#0f2b5b' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>POS</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>STUDENT NAME</th>
                  <th style={{ padding: '4px 4px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>ID</th>
                  {(classInfo?.subjects || []).map((subj: any) => (
                    <th key={subj.key} style={{ padding: '4px 3px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e', whiteSpace: 'nowrap' }}>
                      {subj.name.substring(0, 4).toUpperCase()}
                    </th>
                  ))}
                  <th style={{ padding: '4px 4px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e', borderLeft: '2px solid #c8a951' }}>TOT</th>
                  <th style={{ padding: '4px 4px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>AVG</th>
                  <th style={{ padding: '4px 3px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>GR</th>
                  <th style={{ padding: '4px 3px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', borderRight: '1px solid #1a3a6e' }}>PTS</th>
                  <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {resultsData.map((s: any, i: number) => {
                  const rank = i + 1;
                  const isFailed = s.avg < gradingConfig.passMinScore;
                  const resolved = resolveGrade(s.avg);
                  const bgColor = i % 2 === 0 ? '#fff' : '#f8fafc';
                  const rankBg = rank === 1 ? '#c8a951' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : 'transparent';
                  const rankColor = rank <= 3 ? '#fff' : '#374151';

                  return (
                    <tr key={s.id} style={{ background: bgColor, borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '3px 6px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: rankBg, color: rankColor, fontSize: '0.58rem', fontWeight: 800 }}>{rank}</span>
                      </td>
                      <td style={{ padding: '3px 6px', fontSize: '0.62rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{s.name}</td>
                      <td style={{ padding: '3px 4px', fontSize: '0.55rem', color: '#6b7280', textAlign: 'center' }}>{s.id}</td>
                      {(classInfo?.subjects || []).map((subj: any) => {
                        const score = s[subj.key] || 0;
                        return (
                          <td key={subj.key} style={{ padding: '3px 2px', textAlign: 'center', fontSize: '0.62rem', fontWeight: 600, color: score < gradingConfig.passMinScore ? '#dc2626' : '#111827', borderRight: '1px solid #e5e7eb' }}>
                            {score}
                          </td>
                        );
                      })}
                      <td style={{ padding: '3px 4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: '#0f2b5b', borderLeft: '2px solid #0f2b5b' }}>{s.total}</td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: isFailed ? '#dc2626' : '#166534' }}>{s.avg.toFixed(1)}%</td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 900, color: isFailed ? '#dc2626' : '#166534' }}>{resolved.grade}</td>
                      <td style={{ padding: '3px 4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#c8a951' }}>{s.points || resolved.points}</td>
                      <td style={{ padding: '3px 6px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: isFailed ? '#fee2e2' : '#dcfce7', color: isFailed ? '#991b1b' : '#166534' }}>{isFailed ? 'FAIL' : 'PASS'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grading Key + Signatures */}
          <div style={{ display: 'flex', gap: '20px', padding: '12px 16px', marginTop: '8px' }}>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#0f2b5b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Grading Key</div>
              <table style={{ borderCollapse: 'collapse', border: '1px solid #bfc9d9' }}>
                <thead>
                  <tr style={{ background: '#0f2b5b' }}>
                    <th style={{ padding: '2px 6px', fontSize: '0.5rem', color: '#fff' }}>Grade</th>
                    <th style={{ padding: '2px 6px', fontSize: '0.5rem', color: '#fff' }}>Label</th>
                    <th style={{ padding: '2px 6px', fontSize: '0.5rem', color: '#fff' }}>Range</th>
                    <th style={{ padding: '2px 6px', fontSize: '0.5rem', color: '#fff' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {(gradingConfig?.grades || []).map((g: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '2px 6px', fontSize: '0.58rem', fontWeight: 800, textAlign: 'center', color: '#0f2b5b' }}>{g.grade}</td>
                      <td style={{ padding: '2px 6px', fontSize: '0.55rem', color: '#374151' }}>{g.label}</td>
                      <td style={{ padding: '2px 6px', fontSize: '0.55rem', color: '#374151', textAlign: 'center' }}>{g.minScore}-{g.maxScore}%</td>
                      <td style={{ padding: '2px 6px', fontSize: '0.55rem', fontWeight: 700, color: '#c8a951', textAlign: 'center' }}>{g.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', borderTop: '1.5px solid #111827', paddingTop: '3px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#111827' }}>Class Teacher</div>
                  <div style={{ fontSize: '0.45rem', color: '#6b7280' }}>Signature & Date</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', borderTop: '1.5px solid #111827', paddingTop: '3px' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#111827' }}>School Principal</div>
                  <div style={{ fontSize: '0.45rem', color: '#6b7280' }}>Official Stamp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #c8a951, #0f2b5b, #c8a951)', marginTop: '6px' }}></div>
        </div>
      </div>
    )}

      {/* Hidden Report Container for WhatsApp Generation */}
      {reportStudentData && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '830px', height: '1px', overflow: 'hidden', pointerEvents: 'none', zIndex: -9999, opacity: 0 }}>
          <div className="whatsapp-report-document" style={{
            width: '210mm', minHeight: '295mm', maxHeight: '297mm', boxSizing: 'border-box',
            background: '#fff', color: '#111827', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            border: `2px solid #0f2b5b`, borderRadius: '2px', position: 'relative', overflow: 'hidden', padding: '0',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Top Gold Accent Bar */}
            <div style={{ height: '5px', background: `linear-gradient(90deg, #c8a951, #0f2b5b, #c8a951)` }} />

            {/* School Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: `2px solid #0f2b5b`, gap: '14px' }}>
              <div style={{ width: '52px', height: '52px', background: '#0f2b5b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid #c8a951` }}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#c8a951" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f2b5b', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.2 }}>
                  {reportStudentData.schoolInfo?.name || 'SCHOOL NAME'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 600, letterSpacing: '1px', marginTop: '1px' }}>
                  {reportStudentData.schoolInfo?.campus || 'Campus'} · {reportStudentData.schoolInfo?.address || 'City, Country'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '1px' }}>
                  {reportStudentData.schoolInfo?.poBox || 'P.O. Box'} · {reportStudentData.schoolInfo?.phone || 'Phone'}
                </div>
              </div>
              <div style={{ width: '52px', height: '52px', background: '#0f2b5b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid #c8a951` }}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#c8a951" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
            </div>

            {/* Title Bar */}
            <div style={{ background: '#0f2b5b', padding: '6px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
              <div style={{ height: '1px', flex: 1, background: '#c8a951', opacity: 0.4 }} />
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px' }}>Student Progress Report</span>
              <div style={{ height: '1px', flex: 1, background: '#c8a951', opacity: 0.4 }} />
            </div>
            <div style={{ textAlign: 'center', padding: '4px', background: '#f5ecd0', borderBottom: `1px solid #bfc9d9` }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f2b5b', letterSpacing: '1px' }}>
                ACADEMIC TERM {reportStudentData.academic?.term} · {reportStudentData.academic?.year}
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: '14px 24px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                  {[
                    ['Student Name', `${reportStudentData.firstName} ${reportStudentData.lastName}`],
                    ['Student ID', reportStudentData.student_id],
                    ['Class / Form', reportStudentData.class?.name || 'Unassigned'],
                    ['Class Rank', `${reportStudentData.academic?.rank || 'N/A'} / ${reportStudentData.academic?.totalStudents || 'N/A'}`],
                    ['Gender', reportStudentData.gender],
                    ['Attendance', '100%'],
                  ].map(([label, value], idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'baseline', padding: '3px 0', borderBottom: `1px dotted #bfc9d9` }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: '72px' }}>{label}:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ width: '90px', height: '100px', border: `1.5px solid #0f2b5b`, borderRadius: '3px', background: '#f5f7fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#bfc9d9" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span style={{ fontSize: '0.45rem', color: '#9ca3af', fontWeight: 700, marginTop: '2px' }}>PHOTO</span>
                </div>
              </div>

              {/* Badges / Honors */}
              {(() => {
                const sRank = reportStudentData.academic?.rank;
                const sPoints = reportStudentData.academic?.points;
                const rBadges: any[] = [];
                if (sRank !== undefined && sRank !== null) {
                  if (Number(sRank) === 1) rBadges.push({ label: '🥇 First in Class', color: '#7c5e10', bg: '#fef3c7', type: 'first' });
                  else if (Number(sRank) <= 3) rBadges.push({ label: `🥈 Top 3`, rank: sRank, type: 'top3' });
                  else if (Number(sRank) <= 10) rBadges.push({ label: `🛡️ Top 10`, rank: sRank, type: 'top10' });
                }
                if (sPoints !== undefined && sPoints !== null && Number(sPoints) <= 9) {
                  rBadges.push({ type: 'singlePoints', pts: sPoints });
                }

                if (rBadges.length === 0) return null;

                return (
                  <div style={{
                    marginBottom: '10px', padding: '8px 12px', borderRadius: '4px',
                    border: `1.5px double #c8a951`, background: `linear-gradient(135deg, #fffdf5 0%, #fdfcf7 100%)`,
                  }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#c8a951', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '6px' }}>
                      ✦ Academic Honors & Achievements ✦
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {rBadges.map((badge, bidx) => {
                        if (badge.type === 'singlePoints') {
                          return (
                            <div key={bidx} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: '#fff',
                              border: `1px solid #c8a951`, boxShadow: '0 2px 6px rgba(30,60,114,0.2)',
                            }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: `1px solid #c8a951`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#fcf6ba' }}>
                                {badge.pts}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fcf6ba', letterSpacing: '0.3px' }}>Single Points Club</div>
                                <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.7)' }}>Elite Aggregate: {badge.pts} Pts</div>
                              </div>
                            </div>
                          );
                        }
                        if (badge.type === 'first') {
                          return (
                            <div key={bidx} style={{
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
                          );
                        }
                        if (badge.type === 'top3') {
                          return (
                            <div key={bidx} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                              background: 'linear-gradient(135deg, #e0e0e0 0%, #a9a9a9 100%)', color: '#1a1a1a',
                              border: '1px solid #7f8c8d', boxShadow: '0 2px 6px rgba(169,169,169,0.2)',
                            }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: '1px solid #7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.8rem' }}>🥈</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '0.3px' }}>Academic Podium</div>
                                <div style={{ fontSize: '0.48rem', color: '#4a4a4a' }}>Top 3 · Rank {badge.rank}</div>
                              </div>
                            </div>
                          );
                        }
                        if (badge.type === 'top10') {
                          return (
                            <div key={bidx} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '6px',
                              background: 'linear-gradient(135deg, #e6a15c 0%, #b87333 100%)', color: '#fff',
                              border: '1px solid #d35400', boxShadow: '0 2px 6px rgba(184,115,51,0.2)',
                            }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.8rem' }}>🛡️</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ffe6cc', letterSpacing: '0.3px' }}>Elite Ten</div>
                                <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.8)' }}>Top 10 · Rank {badge.rank}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: `1.5px solid #0f2b5b` }}>
                <thead>
                  <tr style={{ background: '#0f2b5b' }}>
                    {['#', 'SUBJECT', 'MARK (%)', 'GRADE', 'POINTS', 'RANK', 'REMARKS'].map((h, hidx) => (
                      <th key={hidx} style={{
                        padding: '5px 6px', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px',
                        textAlign: hidx === 1 || hidx === 6 ? 'left' : 'center',
                        borderRight: hidx < 6 ? `1px solid #1a3a6e` : 'none',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reportStudentData.academic?.grades || []).length > 0 ? (reportStudentData.academic.grades || []).map((subjGrade: any, sidx: number) => (
                    <tr key={sidx} style={{ background: sidx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: `1px solid #bfc9d9` }}>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.62rem', color: '#6b7280', fontWeight: 700 }}>{sidx + 1}</td>
                      <td style={{ padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, color: '#111827' }}>{subjGrade.subject}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#111827' }}>{subjGrade.score}%</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: subjGrade.score >= 50 ? '#15803d' : '#dc2626' }}>{subjGrade.grade}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563' }}>{subjGrade.points || '—'}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: '#6b7280' }}>{subjGrade.rank}/{subjGrade.totalInSubject}</td>
                      <td style={{ padding: '4px 6px', fontSize: '0.6rem', color: '#6b7280', fontStyle: 'italic' }}>
                        {subjGrade.score >= 75 ? 'Excellent' : subjGrade.score >= 60 ? 'Good' : subjGrade.score >= 50 ? 'Satisfactory' : subjGrade.score >= 40 ? 'Needs Improvement' : 'Below Standard'}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem' }}>No results published for the active academic term.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary Bar */}
              {(() => {
                const sAverage = reportStudentData.academic?.average || 0;
                const sPassMinScore = reportStudentData.academic?.grades?.[0]?.passMinScore || 40;
                const sStatus = sAverage >= sPassMinScore ? 'PASSED' : 'FAILED';
                return (
                  <div style={{ display: 'flex', background: '#f5ecd0', border: `1.5px solid #c8a951`, borderRadius: '3px', padding: '6px 12px', marginBottom: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Average Score</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f2b5b' }}>{sAverage.toFixed(1)}%</div>
                      </div>
                      <div style={{ width: '1px', height: '28px', background: '#c8a951' }} />
                      <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Best 6 Points</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#c8a951' }}>{reportStudentData.academic?.points || '—'}</div>
                      </div>
                      <div style={{ width: '1px', height: '28px', background: '#c8a951' }} />
                      <div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Class Position</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f2b5b' }}>{reportStudentData.academic?.rank || '—'}<span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b7280' }}>/{reportStudentData.academic?.totalStudents || '—'}</span></div>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 16px', borderRadius: '3px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px',
                      background: sAverage >= sPassMinScore ? '#dcfce7' : '#fee2e2',
                      color: sAverage >= sPassMinScore ? '#166534' : '#991b1b',
                      border: `1.5px solid ${sAverage >= sPassMinScore ? '#86efac' : '#fca5a5'}`,
                    }}>
                      {sStatus}
                    </div>
                  </div>
                );
              })()}

              {/* Remarks */}
              {(() => {
                const sAverage = reportStudentData.academic?.average || 0;
                const sPassMinScore = reportStudentData.academic?.grades?.[0]?.passMinScore || 40;
                const sStatus = sAverage >= sPassMinScore ? 'PASSED' : 'FAILED';
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0f2b5b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Class Teacher's Remarks</div>
                      <div style={{ minHeight: '40px', borderBottom: `1.5px solid #0f2b5b`, padding: '4px 0', fontSize: '0.65rem', color: '#4b5563', fontStyle: 'italic', lineHeight: 1.4 }}>
                        {sStatus === 'PASSED'
                          ? `${reportStudentData.firstName} has demonstrated excellent dedication and progress. Keep up the good work.`
                          : `${reportStudentData.firstName} needs to dedicate more time to studies in the coming term to meet expectations.`}
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <div style={{ width: '150px', borderTop: `1.5px solid #111827`, paddingTop: '3px' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#111827' }}>Class Teacher</div>
                          <div style={{ fontSize: '0.5rem', color: '#6b7280' }}>Signature & Date</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0f2b5b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Head Teacher's Remarks</div>
                      <div style={{ minHeight: '40px', borderBottom: `1.5px solid #0f2b5b`, padding: '4px 0', fontSize: '0.65rem', color: '#4b5563', fontStyle: 'italic', lineHeight: 1.4 }}>
                        {/* Head Remarks */}
                      </div>
                      <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <div style={{ width: '150px', borderTop: `1.5px solid #111827`, paddingTop: '3px', display: 'inline-block' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#111827' }}>School Principal</div>
                          <div style={{ fontSize: '0.5rem', color: '#6b7280' }}>Official Stamp & Signature</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Gold Bar */}
            <div style={{ height: '5px', background: `linear-gradient(90deg, #c8a951, #0f2b5b, #c8a951)`, marginTop: 'auto' }} />

            {/* Diagonal Watermark */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', opacity: 0.025, fontSize: '6rem', fontWeight: 900, pointerEvents: 'none', color: '#0f2b5b', letterSpacing: '12px', whiteSpace: 'nowrap' }}>
              OFFICIAL
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print, .fr-action-btns, .search-container, .sidebar, .top-nav, button { display: none !important; }
          .glass-panel { background: white !important; border: 1px solid #eee !important; color: black !important; box-shadow: none !important; }
          .animate-fade { animation: none !important; }
          .fr-table-wrap { display: block !important; }
          .fr-student-cards { display: none !important; }
          table { width: 100% !important; border: 1px solid #eee !important; color: black !important; font-size: 10pt !important; }
          th { background: #f9f9f9 !important; color: black !important; border: 1px solid #eee !important; }
          td { border: 1px solid #eee !important; color: black !important; }
          h1, h2, h3, p { color: black !important; }
          .page-break { page-break-before: always; }
          @page { margin: 1cm; size: portrait; }
        }
      `}</style>
    </div>
  );
}
