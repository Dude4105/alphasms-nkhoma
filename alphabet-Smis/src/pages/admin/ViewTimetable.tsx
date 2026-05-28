import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Printer, Clock, 
  Calendar, BookOpen, Coffee, Sun, 
  Layout, Download
} from 'lucide-react';

interface Slot {
  id: string;
  type: 'Subject' | 'Break' | 'Assembly' | 'Lunch';
  subject?: string;
  activity?: string;
  startTime: string;
  endTime: string;
}

export default function ViewTimetable() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');

  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const classData = await res.json();
        if (res.ok && classData) {
          setData(classData);
        }
      } catch (err) {
        console.error('Error fetching timetable:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [classId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading timetable...</div>;
  if (!data?.timetable) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Calendar size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
      <h2 style={{ color: 'var(--text-light)' }}>No Timetable Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>A timetable hasn't been created for this class yet.</p>
      <button className="btn btn-primary" onClick={() => navigate(`/admin/classes/${classId}/timetable/create`)}>
        Create Timetable
      </button>
    </div>
  );

  const timetable = data.timetable as Record<string, Slot[]>;
  const currentDaySlots = timetable[activeDay] || [];

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'Subject': return { icon: <BookOpen size={16} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'Break': return { icon: <Clock size={16} />, color: 'var(--primary-gold)', bg: 'rgba(253, 184, 19, 0.1)' };
      case 'Lunch': return { icon: <Coffee size={16} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'Assembly': return { icon: <Sun size={16} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
      default: return { icon: <Clock size={16} />, color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(`/admin/classes/${classId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Class Details
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>{data.name} Timetable</h1>
            <p style={{ color: 'var(--text-muted)' }}>Weekly academic schedule and activity periods.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn no-print" 
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
            >
              <Download size={16} /> Export PDF
            </button>
            <button 
              className="btn btn-primary no-print" 
              onClick={() => navigate(`/admin/classes/${classId}/timetable/create`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6' }}
            >
              <Edit3 size={16} /> Edit Timetable
            </button>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        
        {/* Day Selector Tabs */}
        <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {workingDays.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                flex: 1, padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
                background: activeDay === day ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: activeDay === day ? '#3b82f6' : 'var(--text-muted)',
                fontWeight: activeDay === day ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease',
                minWidth: '120px'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable Grid/List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {currentDaySlots.length > 0 ? (
            currentDaySlots.map((slot, index) => {
              const style = getTypeStyles(slot.type);
              return (
                <div 
                  key={slot.id} 
                  className="glass-panel animate-slide-up" 
                  style={{ 
                    padding: '1.5rem', borderRadius: '15px', borderLeft: `4px solid ${style.color}`,
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ 
                      padding: '0.5rem', borderRadius: '10px', background: style.bg, color: style.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {style.icon}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{slot.startTime}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.endTime}</div>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--silver-light)', marginBottom: '0.25rem' }}>
                    {slot.type === 'Subject' ? slot.subject : slot.activity}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {slot.type}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px' }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No slots scheduled for {activeDay}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Week Summary / Full Grid (Optional desktop view) */}
      {!window.matchMedia('(max-width: 1024px)').matches && (
        <div className="glass-panel" style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={20} color="var(--primary-gold)" /> Week at a Glance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: '1px', background: 'var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>TIME</div>
            {workingDays.map(day => (
              <div key={day} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
                {day.toUpperCase()}
              </div>
            ))}
            
            {/* Simple representation of the grid slots could go here, but for now we'll stick to the tabbed view for clarity */}
            <div style={{ gridColumn: '1 / -1', background: 'rgba(30,30,30,0.4)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem italic' }}>
              Detailed weekly grid view is generated based on daily schedules.
            </div>
          </div>
        </div>
      )}
      {createPortal(<PrintLayout data={data} timetable={timetable} />, document.body)}
    </div>
  );
}

// Sub-component for the professional print-only layout
function PrintLayout({ data, timetable }: { data: any, timetable: Record<string, Slot[]> }) {
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Find all unique start times across all days to create rows
  const allTimeSlots = Array.from(new Set(
    Object.values(timetable).flatMap(slots => slots.map(s => s.startTime))
  )).sort();

  return (
    <div className="print-only" style={{ padding: '40px', color: '#1a1a1a', background: '#fff', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Institutional Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#1e3a8a', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '22pt', fontWeight: 800, margin: 0, color: '#1e3a8a', letterSpacing: '-0.02em' }}>ALPHABET SMIS</h1>
            <p style={{ margin: 0, fontSize: '10pt', color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Excellence in Education</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '16pt', fontWeight: 700, margin: '0 0 5px 0', color: '#333' }}>OFFICIAL CLASS SCHEDULE</h2>
          <div style={{ background: '#f1f5f9', padding: '8px 15px', borderRadius: '8px', display: 'inline-block' }}>
            <span style={{ fontSize: '11pt', fontWeight: 600, color: '#1e3a8a' }}>{data.name}</span>
            <span style={{ margin: '0 10px', color: '#cbd5e1' }}>|</span>
            <span style={{ fontSize: '10pt', color: '#64748b' }}>{data.level} · {data.track}</span>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '8.5pt', color: '#94a3b8' }}>Academic Session: 2025/2026</p>
        </div>
      </div>

      {/* Main Timetable Grid */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#1e3a8a' }}>
            <th style={{ padding: '15px', color: 'white', fontSize: '9pt', fontWeight: 700, width: '100px', borderRight: '1.5px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>PERIOD</th>
            {workingDays.map(day => (
              <th key={day} style={{ padding: '15px', color: 'white', fontSize: '9pt', fontWeight: 700, textAlign: 'center', letterSpacing: '0.05em' }}>{day.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allTimeSlots.map((time, idx) => (
            <tr key={time} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ padding: '15px', fontSize: '9.5pt', fontWeight: 700, color: '#475569', textAlign: 'center', borderRight: '1.5px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ color: '#1e3a8a' }}>{time}</div>
              </td>
              {workingDays.map(day => {
                const slot = timetable[day]?.find(s => s.startTime === time);
                if (!slot) return <td key={day} style={{ borderBottom: '1px solid #e2e8f0' }}></td>;
                
                const isBreak = slot.type !== 'Subject';
                return (
                  <td 
                    key={day} 
                    style={{ 
                      padding: '12px 10px', textAlign: 'center', 
                      borderBottom: '1px solid #e2e8f0',
                      borderRight: '1px solid #f1f5f9',
                      background: isBreak ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '10.5pt', color: isBreak ? '#64748b' : '#1e293b', marginBottom: '2px' }}>
                      {slot.type === 'Subject' ? slot.subject : slot.activity}
                    </div>
                    {slot.type !== 'Subject' ? (
                      <div style={{ fontSize: '7.5pt', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {slot.type}
                      </div>
                    ) : (
                      <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 400 }}>
                        {slot.endTime && `${slot.startTime} — ${slot.endTime}`}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature & Verification Footer */}
      <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '50px', borderBottom: '1px solid #cbd5e1', marginBottom: '10px' }}></div>
          <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: '#334155' }}>CLASS TEACHER</p>
          <p style={{ margin: 0, fontSize: '8pt', color: '#94a3b8' }}>Full Name & Signature</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '50px', borderBottom: '1px solid #cbd5e1', marginBottom: '10px' }}></div>
          <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: '#334155' }}>HEAD OF DEPARTMENT</p>
          <p style={{ margin: 0, fontSize: '8pt', color: '#94a3b8' }}>Full Name & Signature</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '50px', borderBottom: '1px solid #cbd5e1', marginBottom: '10px' }}></div>
          <p style={{ margin: 0, fontSize: '9pt', fontWeight: 700, color: '#334155' }}>PRINCIPAL / OFFICE</p>
          <p style={{ margin: 0, fontSize: '8pt', color: '#94a3b8' }}>Stamp & Signature</p>
        </div>
      </div>

      {/* Document Meta */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', color: '#94a3b8', fontSize: '8pt', display: 'flex', justifyContent: 'space-between' }}>
        <span>ALPHABET SMIS · Internal Curriculum System · {data.id}</span>
        <span>Generated: {new Date().toLocaleString()}</span>
      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          html, body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          #root { display: none !important; }
          .print-only { 
            display: block !important; 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 40px !important;
            margin: 0 !important;
          }
          table { page-break-inside: avoid; border: 2px solid #1e3a8a !important; }
          thead th { background-color: #1e3a8a !important; color: white !important; -webkit-print-color-adjust: exact; }
          tr:nth-child(even) { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
    </div>
  );
}
