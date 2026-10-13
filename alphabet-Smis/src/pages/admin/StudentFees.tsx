import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Wallet, Receipt, Calendar, GraduationCap,
  AlertCircle, TrendingUp, CreditCard, CheckCircle2, Hourglass,
  UserCheck, PlusCircle, X
} from 'lucide-react';

export default function StudentFees() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [account, setAccount] = useState<any>(null);   // current-year fee account (expected / paid / balance)
  const [history, setHistory] = useState<any>(null);   // full payment history, grouped by year & term
  const [dbStudentId, setDbStudentId] = useState<number | null>(null);

  // Record payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentTerm, setPaymentTerm] = useState<number>(1);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mk = (n: number | undefined | null) => `MK ${(n ?? 0).toLocaleString()}`;
  const formatPayDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Live values for the record-payment modal
  const parsedAmount = parseFloat(paymentAmount.toString().replace(/,/g, '')) || 0;
  const termInfo = account?.terms?.find((t: any) => t.term === paymentTerm);
  const activeTermInfo = account?.terms?.find((t: any) => t.term === account?.activeTerm);
  const remainingAfter = Math.max(0, (termInfo?.balance || 0) - parsedAmount);
  const amountError = paymentAmount !== '' && parsedAmount <= 0;
  const studentInitials = (history?.student?.name || account?.student?.name || studentId || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  useEffect(() => {
    loadFeeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const loadFeeDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Finance endpoints are keyed by the numeric DB id, so resolve it first
      const studentRes = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, { headers });
      const studentJson = await studentRes.json();
      if (!studentRes.ok || !studentJson?.id) {
        setError('Student could not be found.');
        return;
      }
      setDbStudentId(studentJson.id);

      const [accRes, histRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/finance/student-account/${studentJson.id}`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/finance/student-payments/${studentJson.id}`, { headers }),
      ]);

      if (accRes.ok) setAccount(await accRes.json());
      if (histRes.ok) setHistory(await histRes.json());

      if (!accRes.ok && !histRes.ok) {
        setError('Unable to load fee records. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching fee details:', err);
      setError('A network error occurred while loading fee records.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentModal = () => {
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentTerm(account?.activeTerm || 1);
    setPaymentMethod('Cash');
    setPaymentReference('');
    setFormError('');
    setIsPaymentModalOpen(true);
  };

  // Close with ESC and lock page scroll while the modal is open
  useEffect(() => {
    if (!isPaymentModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsPaymentModalOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isPaymentModalOpen]);

  // Mirrors the Finance page payment collection flow, but always for this student
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbStudentId) return;
    if (parsedAmount <= 0) {
      setFormError('Enter an amount greater than zero.');
      return;
    }
    setFormError('');
    setIsSavingPayment(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          studentId: dbStudentId,
          amount: parsedAmount,
          method: paymentMethod,
          reference: paymentReference.trim() || null,
          date: paymentDate,
          term: paymentTerm
        })
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setSuccessMsg(`${mk(parsedAmount)} recorded for Term ${paymentTerm} (${paymentMethod}).`);
        window.setTimeout(() => setSuccessMsg(''), 5000);
        await loadFeeDetails();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to record payment');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to record payment.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleBack = () => {
    if (isTeacher) {
      navigate(`/teacher/students/${studentId}`);
    } else {
      navigate(`/admin/students/${studentId}`);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Partial': return '#f59e0b';
      case 'Overpaid': return '#3b82f6';
      case 'N/A': return 'var(--text-muted)';
      default: return '#ef4444';
    }
  };
  const statusBg = (status: string) => {
    switch (status) {
      case 'Paid': return 'rgba(16,185,129,0.1)';
      case 'Partial': return 'rgba(245,158,11,0.1)';
      case 'Overpaid': return 'rgba(59,130,246,0.1)';
      case 'N/A': return 'rgba(128,128,128,0.1)';
      default: return 'rgba(239,68,68,0.1)';
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'Paid' || status === 'Overpaid') return <CheckCircle2 size={14} />;
    if (status === 'Partial') return <Hourglass size={14} />;
    return <AlertCircle size={14} />;
  };

  if (isLoading) {
    return (
      <div className="animate-fade" style={{ padding: '4rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '0.95rem' }}>Compiling fee payment records...</p>
      </div>
    );
  }

  return (
    <div className="student-fees-container animate-fade">
      {/* Back button */}
      <button onClick={handleBack} className="fees-back-btn">
        <ArrowLeft size={18} /> Back to Profile
      </button>

      {/* Page header */}
      <div className="glass-panel fees-header-panel">
        <div className="fees-header-left">
          <div className="fees-header-icon-box">
            <Wallet size={28} />
          </div>
          <div>
            <h1 className="fees-header-title">Fee Payment Details</h1>
            <p className="fees-header-subtitle">
              {history?.student?.name || account?.student?.name || 'Student'} &bull;{' '}
              {history?.student?.studentId || account?.student?.studentId || studentId} &bull; Class:{' '}
              <strong style={{ color: 'var(--text-light)' }}>
                {history?.student?.class || account?.student?.class || 'N/A'}
              </strong> &bull;{' '}
              {history?.student?.scholarType || account?.student?.scholarType || ''}
            </p>
          </div>
        </div>
        <div className="fees-header-right">
          <div className="fees-badge fees-badge-year">
            <Calendar size={15} /> AY {account?.academicYear || history?.currentYear || '—'}
          </div>
          <div className="fees-badge fees-badge-term">
            <GraduationCap size={15} /> Term {account?.activeTerm || history?.currentTerm || '—'} (Current)
          </div>
          {!isTeacher && dbStudentId && (
            <button onClick={openPaymentModal} className="fees-record-btn">
              <PlusCircle size={16} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="fees-success-banner">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
          <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Fee Records Unavailable</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!error && (
        <>
          {/* Current academic year summary */}
          {account && (
            <>
              <div className="fees-summary-grid">
                {[
                  { label: 'Total Fees Expected', value: mk(account.annualSummary?.totalExpected), color: 'var(--primary-gold)', icon: <Receipt size={18} />, isStatus: false },
                  { label: 'Total Paid (This Year)', value: mk(account.annualSummary?.totalPaid), color: '#10b981', icon: <TrendingUp size={18} />, isStatus: false },
                  { label: 'Outstanding Balance', value: mk(account.annualSummary?.totalBalance), color: account.annualSummary?.totalBalance > 0 ? '#ef4444' : '#10b981', icon: <Wallet size={18} />, isStatus: false },
                  { label: 'Fee Status', value: account.annualSummary?.status || 'N/A', color: statusColor(account.annualSummary?.status), icon: statusIcon(account.annualSummary?.status), isStatus: true },
                ].map((card, i) => (
                  <div key={i} className="glass-panel fees-summary-card">
                    <div className="fees-summary-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: card.color }}>{card.icon}</span>
                      {card.label}
                    </div>
                    <div className="fees-summary-value" style={{ color: card.color }}>
                      {card.isStatus ? (
                        <span style={{ fontSize: '1rem', padding: '0.3rem 0.8rem', borderRadius: '20px', background: statusBg(card.value), display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {card.icon} {card.value}
                        </span>
                      ) : card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-term breakdown */}
              <div className="glass-panel fees-section">
                <h2 className="fees-section-title">
                  <Calendar size={18} color="#3b82f6" /> Term-by-Term Breakdown — AY {account.academicYear}
                </h2>
                <div className="fees-term-grid">
                  {account.terms.map((t: any) => {
                    const pct = t.expectedFee > 0 ? Math.min(100, Math.round((t.effectivePaid / t.expectedFee) * 100)) : 0;
                    return (
                      <div key={t.term} className="fees-term-card" style={{ borderColor: t.term === account.activeTerm ? 'rgba(59,130,246,0.35)' : 'var(--glass-border)' }}>
                        <div className="fees-term-head">
                          <span className="fees-term-name">
                            Term {t.term}
                            {t.term === account.activeTerm && <span className="fees-term-current">Current</span>}
                          </span>
                          <span className="fees-term-status" style={{ background: statusBg(t.status), color: statusColor(t.status) }}>
                            {statusIcon(t.status)} {t.status}
                          </span>
                        </div>

                        <div className="fees-progress-track">
                          <div className="fees-progress-fill" style={{ width: `${pct}%`, background: statusColor(t.status) === 'var(--text-muted)' ? '#6b7280' : statusColor(t.status) }}></div>
                        </div>

                        <div className="fees-term-figures">
                          <div>
                            <div className="fees-figure-label">Expected</div>
                            <div className="fees-figure-value" style={{ color: 'var(--text-light)' }}>{mk(t.expectedFee)}</div>
                          </div>
                          <div>
                            <div className="fees-figure-label">Paid</div>
                            <div className="fees-figure-value" style={{ color: '#10b981' }}>{mk(t.effectivePaid)}</div>
                          </div>
                          <div>
                            <div className="fees-figure-label">Balance</div>
                            <div className="fees-figure-value" style={{ color: t.balance > 0 ? '#ef4444' : '#10b981' }}>{mk(t.balance)}</div>
                          </div>
                        </div>

                        <div className="fees-term-payments">
                          {t.payments.length === 0 ? (
                            <p className="fees-empty-note">No payments recorded for this term.</p>
                          ) : t.payments.map((p: any) => (
                            <div key={p.id} className="fees-payment-row">
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>{formatPayDate(p.date)}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {p.method}{p.reference ? ` • Ref: ${p.reference}` : ''}
                                </div>
                                <div className="fees-recorded-by">
                                  <UserCheck size={12} /> Recorded by {p.recordedBy || 'Unknown'}
                                </div>
                              </div>
                              <div style={{ fontWeight: 700, color: '#10b981' }}>{mk(p.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Full payment history — all academic years */}
          {history && (
            <div className="glass-panel fees-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <h2 className="fees-section-title" style={{ marginBottom: 0 }}>
                  <CreditCard size={18} color="var(--primary-gold)" /> Payment History (All Years)
                </h2>
                <div className="fees-history-totals">
                  <span className="fees-badge fees-badge-year">{history.paymentCount} payment{history.paymentCount === 1 ? '' : 's'}</span>
                  <span className="fees-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Total: {mk(history.grandTotal)}</span>
                </div>
              </div>

              {history.years.length === 0 ? (
                <p className="fees-empty-note" style={{ padding: '2rem', textAlign: 'center' }}>No payments recorded yet for this student.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {history.years.map((y: any) => (
                    <div key={y.academicYear} style={{ borderRadius: '14px', border: `1px solid ${y.isCurrent ? 'rgba(59,130,246,0.3)' : 'var(--glass-border)'}`, background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.25rem', background: y.isCurrent ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>AY {y.academicYear}</span>
                          {y.isCurrent && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 600 }}>Current</span>}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>{mk(y.totalPaid)}</span>
                      </div>

                      {y.terms.map((t: any) => (
                        <div key={t.term} style={{ borderTop: '1px solid var(--glass-border)', padding: '0.9rem 1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                              Term {t.term}{y.isCurrent && t.term === history.currentTerm ? ' (Current)' : ''}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              Paid: <span style={{ color: '#10b981' }}>{mk(t.totalPaid)}</span>
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {t.payments.map((p: any) => (
                              <div key={p.id} className="fees-payment-row">
                                <div>
                                  <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>{formatPayDate(p.date)}</span>
                                    <span style={{ color: 'var(--text-muted)' }}> • {p.method}{p.reference ? ` • Ref: ${p.reference}` : ''}</span>
                                  </div>
                                  <div className="fees-recorded-by">
                                    <UserCheck size={12} /> Recorded by {p.recordedBy || 'Unknown'}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, background: p.status === 'VERIFIED' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: p.status === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>
                                    {p.status}
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#10b981', minWidth: '90px', textAlign: 'right' }}>{mk(p.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!account && !history && !error && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
              No fee records found for this student.
            </div>
          )}
        </>
      )}

      {/* Record Payment Modal — same collection flow as the Finance page, pinned to this student */}
      {isPaymentModalOpen && (
        <div className="modal-overlay rpm-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div
            className="rpm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rpm-title"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="rpm-head">
              <div className="rpm-head-icon"><Wallet size={22} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="rpm-title" className="rpm-title">Record Payment</h2>
                <p className="rpm-sub">Fee collection for AY {account?.academicYear || history?.currentYear || ''}</p>
              </div>
              <button type="button" className="rpm-close" onClick={() => setIsPaymentModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="rpm-body">
              {/* Student identity — fixed on this page, no search needed */}
              <div className="rpm-student">
                <div className="rpm-avatar">{studentInitials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rpm-student-name">{history?.student?.name || account?.student?.name || studentId}</div>
                  <div className="rpm-student-id">
                    {history?.student?.studentId || account?.student?.studentId} • {history?.student?.class || account?.student?.class} • {history?.student?.scholarType || account?.student?.scholarType}
                  </div>
                </div>
                {activeTermInfo && (
                  <span className="rpm-status-pill" style={{ background: statusBg(activeTermInfo.status), color: statusColor(activeTermInfo.status) }}>
                    {statusIcon(activeTermInfo.status)} {activeTermInfo.status}
                  </span>
                )}
              </div>

              {/* Term selector — segmented control */}
              <div className="rpm-block">
                <label className="rpm-label">Payment Term</label>
                <div className="rpm-terms">
                  {[1, 2, 3].map(t => {
                    const info = account?.terms?.find((x: any) => x.term === t);
                    const isActive = paymentTerm === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setPaymentTerm(t)}
                        className={`rpm-term ${isActive ? 'is-active' : ''}`}
                        aria-pressed={isActive}
                      >
                        <span className="rpm-term-name">Term {t}</span>
                        <span className="rpm-term-bal" style={{ color: isActive ? 'rgba(0,0,0,0.65)' : (info?.balance > 0 ? '#f59e0b' : '#10b981') }}>
                          {info ? `${mk(info.balance)} due` : '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div className="rpm-block">
                <div className="rpm-label-row">
                  <label className="rpm-label" htmlFor="rpm-amount">Amount</label>
                  {termInfo && termInfo.balance > 0 && (
                    <button type="button" className="rpm-chip" onClick={() => setPaymentAmount(String(termInfo.balance))}>
                      Pay balance • {mk(termInfo.balance)}
                    </button>
                  )}
                </div>
                <div className={`rpm-amount ${amountError ? 'has-error' : ''}`}>
                  <span className="rpm-cur">MK</span>
                  <input
                    id="rpm-amount"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    autoFocus
                  />
                  {paymentAmount && (
                    <button type="button" className="rpm-clear" onClick={() => setPaymentAmount('')} aria-label="Clear amount">
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div className="rpm-hint">
                  {parsedAmount > 0 && termInfo ? (
                    <>Balance after payment:{' '}
                      <strong style={{ color: remainingAfter > 0 ? '#ef4444' : '#10b981' }}>{mk(remainingAfter)}</strong>
                      {remainingAfter === 0 && ' — term fully settled'}
                    </>
                  ) : (
                    <>Outstanding balance on Term {paymentTerm}: <strong style={{ color: termInfo?.balance > 0 ? '#f59e0b' : '#10b981' }}>{mk(termInfo?.balance)}</strong></>
                  )}
                </div>
              </div>

              {/* Date + Method */}
              <div className="rpm-grid">
                <div className="rpm-block">
                  <label className="rpm-label" htmlFor="rpm-date">Collection Date</label>
                  <div className="rpm-field">
                    <Calendar size={16} />
                    <input id="rpm-date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
                  </div>
                </div>
                <div className="rpm-block">
                  <label className="rpm-label" htmlFor="rpm-method">Payment Method</label>
                  <div className="rpm-field">
                    <CreditCard size={16} />
                    <select id="rpm-method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Check">Check</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reference (optional) */}
              <div className="rpm-block">
                <label className="rpm-label" htmlFor="rpm-ref">Reference <span className="rpm-opt">optional</span></label>
                <div className="rpm-field">
                  <Receipt size={16} />
                  <input id="rpm-ref" value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="Receipt no. / transaction ID" />
                </div>
              </div>

              {formError && (
                <div className="rpm-error"><AlertCircle size={15} /> {formError}</div>
              )}

              {/* Actions */}
              <div className="rpm-actions">
                <button type="button" className="rpm-cancel" onClick={() => setIsPaymentModalOpen(false)} disabled={isSavingPayment}>
                  Cancel
                </button>
                <button type="submit" className="rpm-submit" disabled={isSavingPayment || parsedAmount <= 0}>
                  {isSavingPayment ? (
                    <><span className="rpm-spinner"></span> Processing…</>
                  ) : (
                    <><CheckCircle2 size={17} /> {parsedAmount > 0 ? `Record ${mk(parsedAmount)}` : 'Record Payment'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .student-fees-container { padding: 1.5rem; }
        .fees-back-btn {
          display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
          color: var(--text-muted); cursor: pointer; margin-bottom: 1.5rem; font-size: 0.9rem;
          padding: 0; transition: color 0.2s;
        }
        .fees-back-btn:hover { color: var(--text-light); }

        .fees-header-panel {
          border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .fees-header-left { display: flex; align-items: center; gap: 1rem; }
        .fees-header-icon-box {
          width: 50px; height: 50px; border-radius: 12px; flex-shrink: 0;
          background: rgba(16, 185, 129, 0.1); color: #10b981;
          display: flex; align-items: center; justify-content: center;
        }
        .fees-header-title { font-size: 1.6rem; color: var(--silver-light); margin: 0 0 0.15rem 0; font-weight: 700; }
        .fees-header-subtitle { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
        .fees-header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .fees-badge {
          display: flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.85rem;
          border-radius: 8px; font-size: 0.8rem; font-weight: 700;
        }
        .fees-badge-year { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .fees-badge-term { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

        .fees-summary-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem; margin-bottom: 1.5rem;
        }
        .fees-summary-card { padding: 1.25rem; border-radius: 12px; background: rgba(255,255,255,0.01); }
        .fees-summary-label {
          display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem;
          color: var(--text-muted); text-transform: uppercase; font-weight: 600;
          margin-bottom: 0.6rem;
        }
        .fees-summary-value { font-size: 1.45rem; font-weight: 700; }

        .fees-section { border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .fees-section-title {
          font-size: 1.05rem; font-weight: 600; color: var(--text-light);
          margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem;
        }

        .fees-term-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;
        }
        .fees-term-card {
          border: 1px solid var(--glass-border); border-radius: 14px; padding: 1.15rem;
          background: rgba(255,255,255,0.02);
        }
        .fees-term-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; gap: 0.5rem; }
        .fees-term-name { font-weight: 700; color: var(--text-light); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .fees-term-current {
          font-size: 0.65rem; font-weight: 700; padding: 0.12rem 0.5rem; border-radius: 4px;
          background: rgba(59,130,246,0.15); color: #3b82f6; text-transform: uppercase;
        }
        .fees-term-status {
          display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem;
          font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px;
        }

        .fees-progress-track {
          height: 7px; background: rgba(255,255,255,0.05); border-radius: 4px;
          overflow: hidden; margin-bottom: 1rem;
        }
        .fees-progress-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }

        .fees-term-figures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
        .fees-figure-label {
          font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;
          margin-bottom: 0.2rem; font-weight: 600;
        }
        .fees-figure-value { font-size: 0.98rem; font-weight: 700; }

        .fees-term-payments { display: flex; flex-direction: column; gap: 0.35rem; }
        .fees-payment-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0.75rem; border-radius: 10px; background: rgba(255,255,255,0.03);
          font-size: 0.85rem; gap: 0.75rem;
        }
        .fees-empty-note { color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 0.5rem 0; }

        .fees-history-totals { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

        .fees-record-btn {
          display: flex; align-items: center; gap: 0.45rem; padding: 0.45rem 1.1rem;
          border: none; border-radius: 8px; cursor: pointer;
          background: var(--primary-gold); color: #000;
          font-size: 0.85rem; font-weight: 700; transition: filter 0.2s, transform 0.1s;
        }
        .fees-record-btn:hover { filter: brightness(1.1); }
        .fees-record-btn:active { transform: translateY(1px); }

        .fees-recorded-by {
          display: flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem;
          font-size: 0.72rem; color: var(--text-muted);
        }

        .fees-success-banner {
          display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;
          padding: 0.75rem 1rem; border-radius: 10px;
          background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981; font-size: 0.85rem; font-weight: 600;
        }

        /* ============ Record Payment Modal ============ */
        @keyframes rpmIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes rpmSpin { to { transform: rotate(360deg); } }

        .rpm-overlay { padding: 1rem; }

        .rpm-modal {
          width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
          background: linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-dark) 100%);
          border: 1px solid var(--glass-border);
          border-radius: 22px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), 0 0 40px rgba(253, 184, 19, 0.07);
          animation: rpmIn 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }
        .rpm-modal::before {
          content: ''; position: sticky; top: 0; z-index: 2; display: block; height: 3px;
          background: linear-gradient(90deg, var(--primary-gold), var(--primary-gold-bright), transparent);
        }

        .rpm-head {
          display: flex; align-items: flex-start; gap: 0.85rem;
          padding: 1.35rem 1.5rem 1rem;
        }
        .rpm-head-icon {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(253, 184, 19, 0.2), rgba(253, 184, 19, 0.06));
          border: 1px solid rgba(253, 184, 19, 0.25);
          color: var(--primary-gold);
          display: flex; align-items: center; justify-content: center;
        }
        .rpm-title { font-size: 1.2rem; font-weight: 700; color: var(--silver-light); margin: 0 0 0.1rem; }
        .rpm-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
        .rpm-close {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(128, 128, 128, 0.08); border: 1px solid var(--glass-border);
          color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .rpm-close:hover { color: var(--silver-light); background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.35); }

        .rpm-body { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem; }

        .rpm-student {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.85rem 1rem; border-radius: 14px;
          background: rgba(59, 130, 246, 0.06);
          border: 1px solid rgba(59, 130, 246, 0.18);
        }
        .rpm-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff; font-weight: 700; font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 0.02em;
        }
        .rpm-student-name { font-weight: 700; color: var(--text-light); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rpm-student-id { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rpm-status-pill {
          display: inline-flex; align-items: center; gap: 0.3rem; flex-shrink: 0;
          font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 20px;
        }

        .rpm-block { display: flex; flex-direction: column; gap: 0.5rem; }
        .rpm-label-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .rpm-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .rpm-opt { font-weight: 500; text-transform: none; letter-spacing: 0; color: rgba(136, 136, 136, 0.7); }
        .rpm-chip {
          font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; cursor: pointer;
          border-radius: 20px; border: 1px solid rgba(253, 184, 19, 0.3);
          background: rgba(253, 184, 19, 0.1); color: var(--primary-gold);
          transition: all 0.2s ease;
        }
        .rpm-chip:hover { background: rgba(253, 184, 19, 0.2); }

        .rpm-terms { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        .rpm-term {
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem;
          padding: 0.6rem 0.7rem; border-radius: 11px; cursor: pointer; text-align: left;
          background: rgba(128, 128, 128, 0.06); border: 1px solid var(--glass-border);
          color: var(--text-light); transition: all 0.18s ease;
        }
        .rpm-term:hover { border-color: rgba(253, 184, 19, 0.45); background: rgba(253, 184, 19, 0.08); }
        .rpm-term.is-active {
          background: linear-gradient(135deg, var(--primary-gold), var(--primary-gold-bright));
          border-color: var(--primary-gold); color: #000;
          box-shadow: 0 6px 18px rgba(253, 184, 19, 0.22);
        }
        .rpm-term-name { font-size: 0.82rem; font-weight: 700; }
        .rpm-term-bal { font-size: 0.68rem; font-weight: 600; }

        .rpm-amount {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.85rem; border-radius: 14px;
          background: rgba(128, 128, 128, 0.06);
          border: 1px solid var(--glass-border);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rpm-amount:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 0 3px rgba(253, 184, 19, 0.12); background: rgba(253, 184, 19, 0.04); }
        .rpm-amount.has-error { border-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        .rpm-cur { font-size: 0.9rem; font-weight: 800; color: var(--primary-gold); }
        .rpm-amount input {
          flex: 1; min-width: 0; background: none; border: none; outline: none;
          color: var(--text-light); font-size: 1.6rem; font-weight: 700;
          font-family: var(--font-display); padding: 0.35rem 0;
        }
        .rpm-amount input::-webkit-outer-spin-button,
        .rpm-amount input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .rpm-amount input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        .rpm-amount input::placeholder { color: rgba(136, 136, 136, 0.45); font-weight: 600; }
        .rpm-clear {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; cursor: pointer;
          background: rgba(128, 128, 128, 0.15); border: none; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
        }
        .rpm-clear:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .rpm-hint { font-size: 0.78rem; color: var(--text-muted); }

        .rpm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }

        .rpm-field {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.6rem 0.75rem; border-radius: 11px;
          background: rgba(128, 128, 128, 0.06); border: 1px solid var(--glass-border);
          color: var(--text-muted); transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rpm-field:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 0 3px rgba(253, 184, 19, 0.1); }
        .rpm-field input, .rpm-field select {
          flex: 1; min-width: 0; background: none; border: none; outline: none;
          color: var(--text-light); font-size: 0.85rem; font-weight: 600; padding: 0;
        }
        .rpm-field select option { background: var(--bg-darker); color: var(--text-light); }
        .rpm-field input[type=date] { color-scheme: dark; }
        :root[data-theme='light'] .rpm-field input[type=date] { color-scheme: light; }

        .rpm-error {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 0.85rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;
          background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.28); color: #ef4444;
        }

        .rpm-actions { display: flex; gap: 0.75rem; margin-top: 0.35rem; }
        .rpm-cancel {
          flex: 0 0 auto; padding: 0.85rem 1.4rem; border-radius: 12px; cursor: pointer;
          background: rgba(128, 128, 128, 0.08); border: 1px solid var(--glass-border);
          color: var(--text-muted); font-size: 0.88rem; font-weight: 700; transition: all 0.2s ease;
        }
        .rpm-cancel:hover:not(:disabled) { color: var(--text-light); background: rgba(128, 128, 128, 0.16); }
        .rpm-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .rpm-submit {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; border: none;
          background: linear-gradient(135deg, var(--primary-gold), var(--primary-gold-bright));
          color: #000; font-size: 0.92rem; font-weight: 800;
          box-shadow: 0 8px 22px rgba(253, 184, 19, 0.25); transition: all 0.2s ease;
        }
        .rpm-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(253, 184, 19, 0.32); }
        .rpm-submit:active:not(:disabled) { transform: translateY(0); }
        .rpm-submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
        .rpm-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.25); border-top-color: #000;
          animation: rpmSpin 0.7s linear infinite;
        }

        @media (max-width: 768px) {
          .student-fees-container { padding: 0.85rem !important; }
          .fees-header-panel { padding: 1.25rem; flex-direction: column; align-items: stretch; gap: 1.25rem; }
          .fees-header-title { font-size: 1.3rem; }
          .fees-header-subtitle { font-size: 0.8rem; line-height: 1.4; }
          .fees-header-right { width: 100%; }
          .fees-badge { flex: 1; justify-content: center; }
          .fees-summary-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem; }
          .fees-summary-card { padding: 1rem; }
          .fees-summary-value { font-size: 1.15rem; }
          .fees-section { padding: 1.15rem; }
          .fees-term-grid { grid-template-columns: 1fr !important; }
          .fees-term-figures { gap: 0.5rem; }
          .fees-figure-value { font-size: 0.88rem; }
          .fees-record-btn { width: 100%; justify-content: center; padding: 0.65rem; }
          .rpm-overlay { padding: 0.75rem; }
          .rpm-head { padding: 1.1rem 1.1rem 0.75rem; }
          .rpm-body { padding: 0 1.1rem 1.25rem; gap: 1rem; }
          .rpm-grid { grid-template-columns: 1fr; gap: 1rem; }
          .rpm-amount input { font-size: 1.35rem; }
          .rpm-student { padding: 0.75rem 0.85rem; }
          .rpm-term { padding: 0.55rem 0.6rem; }
          .rpm-actions { flex-direction: column-reverse; }
          .rpm-cancel { width: 100%; }
        }
      `}</style>
    </div>
  );
}
