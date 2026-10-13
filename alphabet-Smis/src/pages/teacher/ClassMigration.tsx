import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, GraduationCap, CheckCircle2, XCircle, RefreshCw,
  Users, AlertTriangle, Loader, Clock, Trophy, Award
} from 'lucide-react';

/**
 * Promotion status & decisions page.
 *
 * The admin drives promotion from Settings ("Advance Year & Promote") —
 * students who passed the Term 3 final exams are moved automatically, and
 * this page shows the class teacher the outcome plus the students who did
 * NOT meet the criteria, so the class teacher decides: promote anyway or repeat.
 */

interface SubjectScore {
  key: string;
  score: number | null;
  passed: boolean;
}

interface PromotionStudent {
  id: string;
  name: string;
  gender: string | null;
  status: string; // promoted | pending_review | repeated | promoted_override | completed
  sourceClassName: string;
  targetClassName: string | null;
  reasons: {
    passCount: number;
    required: number;
    passMark: number;
    subjects: SubjectScore[];
  } | null;
  decidedAt: string | null;
}

interface RunInfo {
  fromYear: string;
  toYear: string;
  promoted: number;
  pending: number;
  completed: number;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  promoted: { label: 'Auto-promoted', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  promoted_override: { label: 'Promoted (your decision)', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  pending_review: { label: 'Needs your decision', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  repeated: { label: 'Repeating', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  completed: { label: 'Completed', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

export default function ClassMigration() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState<RunInfo | null>(null);
  const [currentYear, setCurrentYear] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<PromotionStudent[]>([]);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleBack = () => {
    if (location.pathname.startsWith('/admin')) {
      navigate(`/admin/classes/${classId}`);
    } else {
      navigate('/teacher/grades');
    }
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/teachers/classes/${classId}/migration-status`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to load promotion status.');
      }
      const json = await res.json();
      setRun(json.run);
      setCurrentYear(json.currentYear);
      setClassName(json.class?.name || '');
      setStudents(json.students || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load promotion status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleDecision = async (
    student: PromotionStudent,
    action: 'promote' | 'repeat',
  ) => {
    const question =
      action === 'promote'
        ? `Promote ${student.name} to ${student.targetClassName}?\n\nThey did not meet the automatic criteria, but as class teacher you may move them up. Their grades for the new year will start fresh.`
        : `Keep ${student.name} in ${student.sourceClassName} (repeat)?\n\nThey will remain in this class for the new academic year.`;
    if (!window.confirm(question)) return;

    setDecisionId(student.id);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/teachers/classes/${classId}/promotion-decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId: student.id, action }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Failed to save your decision.');

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,
                status: action === 'promote' ? 'promoted_override' : 'repeated',
                decidedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
      setNotice(json.message || 'Decision saved.');
      setTimeout(() => setNotice(null), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save your decision.');
    } finally {
      setDecisionId(null);
    }
  };

  // Grouping
  const pending = students.filter((s) => s.status === 'pending_review');
  const promoted = students.filter(
    (s) => s.status === 'promoted' || s.status === 'promoted_override',
  );
  const repeated = students.filter((s) => s.status === 'repeated');
  const completed = students.filter((s) => s.status === 'completed');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <RefreshCw size={40} className="spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading promotion status…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // State A: admin has not run the year transition yet
  // ─────────────────────────────────────────────────────────────
  if (!run) {
    return (
      <div className="animate-fade" style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GraduationCap size={44} />
          </div>
          <h2 style={{ color: 'var(--text-light)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            No promotion run yet
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 0.5rem' }}>
            Students are promoted automatically when the admin advances the
            academic year from <strong style={{ color: 'var(--text-light)' }}>Settings → Academic Configuration</strong>.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto' }}>
            {currentYear
              ? `Once the admin runs the ${currentYear} → ${parseInt(currentYear, 10) + 1} transition, this page will show who was promoted and who needs your decision.`
              : 'Once the transition runs, this page will show who was promoted and who needs your decision.'}
          </p>
          <button
            onClick={() => fetchStatus()}
            className="btn-primary"
            style={{ marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <RefreshCw size={16} /> Check again
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // State B: run exists — outcome + decisions
  // ─────────────────────────────────────────────────────────────
  const statCard = (icon: React.ReactNode, value: number, label: string, color: string, bg: string) => (
    <div style={{ flex: '1 1 160px', padding: '1.1rem 1.25rem', borderRadius: '16px', background: bg, border: `1px solid ${color}33` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color }}>
        {icon}
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );

  const scoreChips = (student: PromotionStudent) => {
    if (!student.reasons) return null;
    const { passCount, required, passMark, subjects } = student.reasons;
    return (
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {subjects.map((s) => (
            <span
              key={s.key}
              title={s.passed ? 'Passed' : `Below pass mark (${passMark})`}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.28rem 0.55rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                color: s.passed ? '#10b981' : '#ef4444',
                background: s.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${s.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.35)'}`,
              }}
            >
              {s.key.toUpperCase()} {s.score === null ? '—' : s.score}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.55rem' }}>
          <strong style={{ color: passCount >= required ? '#10b981' : '#ef4444' }}>
            {passCount} of {required}
          </strong>{' '}
          subjects passed (pass mark {passMark})
        </div>
      </div>
    );
  };

  const pendingCard = (student: PromotionStudent) => {
    const busy = decisionId === student.id;
    const canPromote = !!student.targetClassName;
    return (
      <div
        key={student.id}
        style={{
          padding: '1.25rem', borderRadius: '16px',
          background: 'rgba(245,158,11,0.05)',
          border: '1px solid rgba(245,158,11,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={17} color="#f59e0b" />
              <strong style={{ color: 'var(--text-light)', fontSize: '1.02rem' }}>{student.name}</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.id}</span>
            </div>
            <span
              style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                borderRadius: '999px', color: STATUS_META.pending_review.color,
                background: STATUS_META.pending_review.bg, display: 'inline-block', marginTop: '0.4rem',
              }}
            >
              {STATUS_META.pending_review.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleDecision(student, 'promote')}
              disabled={!!decisionId || !canPromote}
              title={canPromote ? 'Move them up anyway' : 'No target class exists (top form)'}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.4)', cursor: canPromote && !decisionId ? 'pointer' : 'not-allowed',
                opacity: !canPromote ? 0.45 : 1,
              }}
            >
              {busy && decisionId === student.id ? <Loader size={14} className="spin" /> : <CheckCircle2 size={14} />}
              Promote anyway {canPromote ? `→ ${student.targetClassName}` : ''}
            </button>
            <button
              onClick={() => handleDecision(student, 'repeat')}
              disabled={!!decisionId}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.4)', cursor: decisionId ? 'not-allowed' : 'pointer',
                opacity: decisionId ? 0.5 : 1,
              }}
            >
              <XCircle size={14} /> Keep repeating
            </button>
          </div>
        </div>
        {scoreChips(student)}
      </div>
    );
  };

  const resultRow = (student: PromotionStudent) => {
    const meta = STATUS_META[student.status] || STATUS_META.promoted;
    return (
      <div
        key={student.id}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', padding: '0.85rem 1.1rem', borderRadius: '12px', flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: '180px' }}>
          <Users size={15} color="var(--text-muted)" />
          <strong style={{ color: 'var(--text-light)', fontSize: '0.92rem' }}>{student.name}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
          {student.status.startsWith('promoted') && student.targetClassName && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              → <strong style={{ color: 'var(--text-light)' }}>{student.targetClassName}</strong>
            </span>
          )}
          <span
            style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.22rem 0.6rem',
              borderRadius: '999px', color: meta.color, background: meta.bg,
            }}
          >
            {meta.label}
          </span>
        </div>
      </div>
    );
  };

  const sectionHeader = (icon: React.ReactNode, title: string, count: number, color: string) => (
    <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '2rem 0 0.9rem' }}>
      {icon} {title} <span style={{ color: 'var(--text-muted)' }}>({count})</span>
    </h3>
  );

  return (
    <div className="animate-fade" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
        >
          <ArrowLeft size={17} /> Back
        </button>
        <h1 style={{ color: 'var(--text-light)', fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <GraduationCap size={24} color="#f59e0b" /> Promotion Review — {className}
        </h1>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', borderRadius: '24px' }}>
        {/* Run summary line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <Clock size={15} color="#f59e0b" />
          Academic year transition{' '}
          <strong style={{ color: 'var(--text-light)' }}>{run.fromYear} → {run.toYear}</strong>
          <span style={{ opacity: '0.5' }}>•</span>
          run {new Date(run.createdAt).toLocaleString()}
          <button
            onClick={() => fetchStatus()}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} /> {error}
          </div>
        )}
        {notice && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> {notice}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {statCard(<CheckCircle2 size={20} />, promoted.length, 'Promoted', '#10b981', 'rgba(16,185,129,0.07)')}
          {statCard(<AlertTriangle size={20} />, pending.length, 'Awaiting your decision', '#f59e0b', 'rgba(245,158,11,0.07)')}
          {statCard(<Trophy size={20} />, completed.length, 'Completed (top form)', '#a78bfa', 'rgba(167,139,250,0.07)')}
          {statCard(<Award size={20} />, repeated.length, 'Repeating', '#3b82f6', 'rgba(59,130,246,0.07)')}
        </div>

        {/* Rule explainer */}
        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7, padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)' }}>
          <strong style={{ color: 'var(--text-light)' }}>How promotion was decided:</strong> every student's
          Term {3} final-exam results for {run.fromYear} were checked — students passing{' '}
          <strong style={{ color: 'var(--text-light)' }}>at least 6 subjects with scores ≥ 40</strong> were
          promoted automatically. The rest are listed below for your decision.
        </p>

        {/* Pending decisions */}
        {sectionHeader(<AlertTriangle size={16} />, 'Needs your decision', pending.length, '#f59e0b')}
        {pending.length === 0 ? (
          <div style={{ padding: '1.1rem 1.25rem', borderRadius: '14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={17} />
            All students are resolved — every case in this class has been decided.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {pending.map(pendingCard)}
          </div>
        )}

        {/* Promoted */}
        {promoted.length > 0 && (
          <>
            {sectionHeader(<CheckCircle2 size={16} />, 'Promoted', promoted.length, '#10b981')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {promoted.map(resultRow)}
            </div>
          </>
        )}

        {/* Repeating (decided) */}
        {repeated.length > 0 && (
          <>
            {sectionHeader(<XCircle size={16} />, 'Repeating', repeated.length, '#3b82f6')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {repeated.map(resultRow)}
            </div>
          </>
        )}

        {/* Completed (top form) */}
        {completed.length > 0 && (
          <>
            {sectionHeader(<Trophy size={16} />, 'Completed (top form — nothing to promote into)', completed.length, '#a78bfa')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {completed.map(resultRow)}
            </div>
          </>
        )}

        {students.length === 0 && (
          <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This class had no students during the {run.fromYear} → {run.toYear} transition.
          </p>
        )}
      </div>
    </div>
  );
}
