import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, ChevronRight, Search, AlertCircle, FileText, Trophy, 
  ArrowLeft, CheckCircle2, Home as HomeIcon, Sun, Moon, ExternalLink
} from 'lucide-react';
import '../App.css';

export default function ExamResults() {
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);
  const [resultsStep, setResultsStep] = useState(1);
  const [searchData, setSearchData] = useState({ firstName: '', lastName: '', dob: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [isResultsPublished, setIsResultsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResultsStatus();
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  const fetchResultsStatus = async () => {
    try {
      const res = await fetch('http://localhost:3000/public-results/status');
      if (res.ok) {
        const data = await res.json();
        setIsResultsPublished(data.published);
      }
    } catch (err) {
      console.error('Error fetching results status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: any) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = async () => {
    if (resultsStep === 1) {
      if (!searchData.firstName || !searchData.lastName) return alert('Please enter both first and last name');
      setResultsStep(2);
    } else if (resultsStep === 2) {
      if (!searchData.dob) return alert('Please enter date of birth');
      setIsSearching(true);
      try {
        const response = await fetch('http://localhost:3000/public-results/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchData)
        });
        const data = await response.json();
        setSearchResponse(data);
        setResultsStep(3);
      } catch (err) {
        alert('Failed to connect to the server. Please try again later.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  const resetSearch = () => {
    setResultsStep(1);
    setSearchData({ firstName: '', lastName: '', dob: '' });
    setSearchResponse(null);
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ background: 'var(--bg-darker)', transition: 'background 0.3s ease' }}>
      <div className="hero-gradient" style={{ opacity: isLightMode ? 0.05 : 0.4 }} />

      {/* Inline Theme Toggle */}
      <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 100 }}>
        <button 
          className="btn btn-outline theme-toggle" 
          onClick={() => setIsLightMode(!isLightMode)}
          style={{ padding: '0.75rem', borderRadius: '50%' }}
        >
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="apply-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 5 }}>
        
        <div className="apply-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
             <div style={{ background: 'var(--primary-gold)', color: '#000', padding: '1rem', borderRadius: '50%' }}>
                <FileText size={32} />
             </div>
          </div>
          <h1 className="hero-title font-crimson" style={{ fontSize: '3.5rem', marginBottom: '1rem', color: isLightMode ? 'var(--text-light)' : '#FFFFFF', textShadow: isLightMode ? 'none' : 'var(--hero-title-shadow)' }}>
            Examination <span className="highlight" style={isLightMode ? { background: 'none', WebkitTextFillColor: 'initial', color: 'var(--gold-text)', filter: 'none' } : {}}>Results</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '600px', margin: '0 auto', color: isLightMode ? 'var(--text-muted)' : '#FFFFFF', textShadow: isLightMode ? 'none' : 'var(--hero-subtitle-shadow)' }}>
            Access our school's official performance database. Enter student details below to retrieve their academic standing for the current term.
          </p>
        </div>

        {!isResultsPublished ? (
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
            <AlertCircle size={64} color="var(--primary-gold)" style={{ marginBottom: '1.5rem' }} />
            <h2 className="step-title" style={{ marginBottom: '1.5rem' }}>Results Not Yet Published</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.1rem' }}>
              The examination results for the current academic term have not been officially released to the public database yet.
            </p>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Please check back later or contact the school administration for more information.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem' }} onClick={() => navigate('/')}>
              Return Home
            </button>
          </div>
        ) : (
          <div 
            className={resultsStep === 3 ? "animate-fade" : "verification-card animate-fade"} 
            style={resultsStep === 3 ? { width: '100%', maxWidth: '1200px' } : {}}
          >
            
            {resultsStep < 3 && (
              <div className="modal-progress" style={{ marginBottom: '4rem' }}>
                {[1, 2, 3].map(step => (
                  <div key={step} className={`progress-step ${resultsStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <span style={{ 
                      position: 'absolute', top: '50px', fontSize: '0.7rem', fontWeight: 600, width: '100px', textAlign: 'center', 
                      color: resultsStep >= step ? 'var(--primary-gold)' : 'var(--text-muted)' 
                    }}>
                      {step === 1 ? 'IDENTIFICATION' : step === 2 ? 'SECURITY' : 'PERFORMANCE'}
                    </span>
                  </div>
                ))}
                <div className="progress-line" style={{ width: `${((resultsStep - 1) / 2) * 100}%` }}></div>
              </div>
            )}

            {resultsStep === 1 && (
              <div className="step-content animate-fade">
                <h2 className="step-title">Student Identification</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Please enter the student's legal names exactly as they appear in our registration records.
                </p>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <div className="input-wrapper enhanced">
                      <Users className="input-icon" size={18} />
                      <input 
                        type="text" 
                        name="firstName" 
                        value={searchData.firstName} 
                        onChange={handleSearchChange} 
                        placeholder="e.g. John"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Last Name / Surname</label>
                    <div className="input-wrapper enhanced">
                      <Users className="input-icon" size={18} />
                      <input 
                        type="text" 
                        name="lastName" 
                        value={searchData.lastName} 
                        onChange={handleSearchChange} 
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resultsStep === 2 && (
              <div className="step-content animate-fade">
                <h2 className="step-title">Security Verification</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  To protect student privacy, please provide the registered date of birth associated with this student.
                </p>
                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <div className="input-wrapper enhanced">
                      <Calendar className="input-icon" size={18} />
                      <input 
                        type="date" 
                        name="dob" 
                        value={searchData.dob} 
                        onChange={handleSearchChange} 
                        style={{ fontSize: '1.2rem', padding: '1.2rem 3rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resultsStep === 3 && searchResponse && (
              <div className="step-content animate-fade" style={{ width: '100%' }}>
                {!searchResponse.found ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
                    <Search size={80} color="#ef4444" style={{ marginBottom: '2rem', opacity: 0.8 }} />
                    <h2 className="step-title" style={{ marginBottom: '1.5rem' }}>Record Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                      {searchResponse.message}
                    </p>
                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button className="btn btn-outline" onClick={() => setResultsStep(1)}>
                        Try Different Name
                      </button>
                      <button className="btn btn-primary" onClick={() => setResultsStep(2)}>
                        Try Different DOB
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem 0' }}>
                    {/* Header Section */}
                    <div className="results-header-flex">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', justifyContent: window.innerWidth < 992 ? 'center' : 'flex-start' }}>
                           <Trophy size={32} color="var(--primary-gold)" className="animate-pulse-metric" />
                           <span className="trust-badge gold">Official Digital Result</span>
                        </div>
                        <h2 className="font-crimson" style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                          {searchResponse.student.firstName} {searchResponse.student.lastName}
                        </h2>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: window.innerWidth < 992 ? 'center' : 'flex-start' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                              <Calendar size={18} />
                              <span>Term {searchResponse.student.academic.term}, {searchResponse.student.academic.year}</span>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                              <Users size={18} />
                              <span>{searchResponse.student.className || 'Secondary School'}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <img src="/heroesLogo.png" alt="Logo" style={{ height: '70px', marginBottom: '1rem', filter: isLightMode ? 'none' : 'brightness(0) invert(1)' }} />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RECORDS AUTHENTICATED: {new Date().toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Report Content Grid */}
                    <div className="results-dashboard-layout">
                      
                      {/* Side Stats */}
                      <div className="results-stats-stack">
                        <div className="glass-panel stat-reveal delay-100" style={{ padding: '2rem', textAlign: 'left', border: '1px solid rgba(253, 184, 19, 0.3)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Aggregate Points</span>
                          <div className="font-atkinson animate-pulse-metric" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary-gold)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            {searchResponse.student.academic.points}
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>pts</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Calculated from top 6 performing subjects.</p>
                        </div>

                        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="glass-panel stat-reveal delay-200" style={{ padding: '1.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Rank</span>
                            <div className="font-atkinson" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{searchResponse.student.academic.rank} / {searchResponse.student.academic.totalStudents}</div>
                          </div>
                          <div className="glass-panel stat-reveal delay-300" style={{ padding: '1.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Average</span>
                            <div className="font-atkinson" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{searchResponse.student.academic.average}%</div>
                          </div>
                        </div>

                        <div className="glass-panel stat-reveal delay-400" style={{ padding: '2rem' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>Performance Insight</h4>
                          <div className="font-atkinson" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Distinctions</span>
                              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>{searchResponse.student.academic.grades.filter((g: any) => g.grade.includes('A')).length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Credits</span>
                              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem' }}>{searchResponse.student.academic.grades.filter((g: any) => g.grade.includes('B')).length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Passed Subjects</span>
                              <span style={{ color: 'var(--text-light)', fontWeight: 700, fontSize: '1.1rem' }}>{searchResponse.student.academic.grades.filter((g: any) => !g.grade.includes('F')).length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Table */}
                      <div className="glass-panel stat-reveal delay-500" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileText size={20} color="var(--primary-gold)" /> Subject Performance Breakdown
                        </h4>
                        <table className="results-table results-table-enhanced font-atkinson" style={{ margin: 0, background: 'transparent' }}>
                          <thead>
                            <tr>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0' }}>Subject</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', textAlign: 'center' }}>Score</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', textAlign: 'center' }}>Highest</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', textAlign: 'center' }}>Rank</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', textAlign: 'center' }}>Points</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', textAlign: 'center' }}>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchResponse.student.academic.grades.map((g: any, i: number) => (
                              <tr key={i}>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: 600 }}>{g.subject}</td>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700 }}>{g.score}%</td>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{g.highestScore}%</td>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>{g.rank} / {g.totalInSubject}</td>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontWeight: 700, color: 'var(--primary-gold)' }}>{g.points}</td>
                                <td style={{ padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                  <span className={`result-badge ${g.grade.toLowerCase().includes('a') ? 'distinction' : g.grade.toLowerCase().includes('b') ? 'credit' : g.grade.toLowerCase().includes('f') ? 'fail' : 'pass'}`}>
                                    {g.grade}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile Cards View */}
                        <div className="mobile-cards-view">
                          {searchResponse.student.academic.grades.map((g: any, i: number) => (
                            <div key={i} className="subject-card">
                              <div className="subject-card-header">
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{g.subject}</span>
                                <span className={`result-badge ${g.grade.toLowerCase().includes('a') ? 'distinction' : g.grade.toLowerCase().includes('b') ? 'credit' : g.grade.toLowerCase().includes('f') ? 'fail' : 'pass'}`}>
                                  {g.grade}
                                </span>
                              </div>
                              <div className="subject-card-stats">
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Score</span>
                                  <span style={{ fontWeight: 700 }}>{g.score}% <span style={{ color: '#10b981', fontSize: '0.7rem' }}>(Max: {g.highestScore}%)</span></span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rank</span>
                                  <span style={{ fontWeight: 700 }}>{g.rank} / {g.totalInSubject}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Points</span>
                                  <span style={{ fontWeight: 700, color: 'var(--primary-gold)' }}>{g.points}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(200, 169, 81, 0.05)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(200, 169, 81, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0 }}>
                            <AlertCircle size={14} /> This is an unofficial digital summary. For the full stamped report, click below.
                          </p>
                          <button
                            onClick={() => window.open(`/reports/${searchResponse.student.student_id}?term=${searchResponse.student.academic.term}&year=${searchResponse.student.academic.year}`, '_blank')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(200, 169, 81, 0.12)', color: 'var(--primary-gold)', border: '1px solid rgba(200, 169, 81, 0.35)', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,169,81,0.22)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,169,81,0.12)')}
                          >
                            <FileText size={16} /> View Official Report
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '3rem' }}>
              {resultsStep < 3 && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    {resultsStep > 1 && (
                      <button className="btn btn-outline" style={{ flex: 1, padding: '1rem' }} onClick={() => setResultsStep(prev => prev - 1)}>
                        Back
                      </button>
                    )}
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: resultsStep > 1 ? 2 : 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} 
                      onClick={handleSearchSubmit}
                      disabled={isSearching}
                    >
                      {isSearching ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }} /> : resultsStep === 2 ? <Search size={20} /> : null}
                      {isSearching ? 'Verifying...' : resultsStep === 2 ? 'View Results' : 'Continue to Security'}
                    </button>
                  </div>
                </>
              )}
              {resultsStep === 3 && (
                <div className="result-actions-container">
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={resetSearch}>
                    <Search size={20} style={{ marginRight: '0.5rem' }} /> Search Another Student
                  </button>
                  {searchResponse?.found && (
                    <button
                      className="btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(200, 169, 81, 0.12)', color: 'var(--primary-gold)', border: '1px solid rgba(200, 169, 81, 0.35)', fontWeight: 700 }}
                      onClick={() => window.open(`/reports/${searchResponse.student.id}?term=${searchResponse.student.academic.term}&year=${searchResponse.student.academic.year}`, '_blank')}
                    >
                      <ExternalLink size={20} /> View Official Report
                    </button>
                  )}
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/')}>
                    <HomeIcon size={20} style={{ marginRight: '0.5rem' }} /> Exit to Landing Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="footer-bottom" style={{ marginTop: '4rem', opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} Heroes Academy | Official Examination Portal
        </div>
      </div>
    </div>
  );
}
