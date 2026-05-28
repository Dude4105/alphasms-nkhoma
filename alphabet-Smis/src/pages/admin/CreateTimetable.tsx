import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, X, Clock, 
  Calendar, BookOpen, Coffee, Sun, 
  ArrowRight
} from 'lucide-react';
import SearchableSelect from '../../components/common/SearchableSelect';

interface Slot {
  id: string;
  type: 'Subject' | 'Break' | 'Assembly' | 'Lunch';
  subject?: string;
  activity?: string;
  startTime: string;
  endTime: string;
}

// Subjects will be fetched from DB
export default function CreateTimetable() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('Monday');
  const [startTime, setStartTime] = useState('07:30');
  const [periodDuration, setPeriodDuration] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Live Data
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Responsive check
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Fetch Data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [subRes, classRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/subjects?limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const subJson = await subRes.json();
        const classJson = await classRes.json();

        if (subRes.ok && subJson.data) {
          setDbSubjects(subJson.data.map((s: any) => s.name));
        }

        if (classRes.ok && classJson && classJson.timetable) {
          setTimetable(classJson.timetable);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();

    return () => window.removeEventListener('resize', handleResize);
  }, [classId]);

  const isMobile = windowWidth < 850;

  // Timetable State: Records per day
  const [timetable, setTimetable] = useState<Record<string, Slot[]>>({
    'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': []
  });

  const getNextTime = (currentTime: string, durationMin: number) => {
    const [hours, mins] = currentTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(mins + durationMin);
    return date.toTimeString().slice(0, 5);
  };

  const addSlot = (day: string) => {
    const slots = timetable[day];
    const prevSlot = slots[slots.length - 1];
    
    let nextStart = prevSlot ? prevSlot.endTime : startTime;
    let nextEnd = getNextTime(nextStart, periodDuration);

    const newSlot: Slot = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Subject',
      subject: dbSubjects[0] || 'Subject',
      startTime: nextStart,
      endTime: nextEnd
    };

    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
  };

  const removeSlot = (day: string, slotId: string) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter(s => s.id !== slotId)
    }));
  };

  const updateSlot = (day: string, slotId: string, updates: Partial<Slot>) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map(s => s.id === slotId ? { ...s, ...updates } : s)
    }));
  };

  const copyToAllDays = () => {
    const currentDaySlots = timetable[activeDay];
    const newTimetable = { ...timetable };
    workingDays.forEach(day => {
      newTimetable[day] = currentDaySlots.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
    });
    setTimetable(newTimetable);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timetable
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save timetable');
      }

      navigate(`/admin/classes/${classId}/timetable`);
    } catch (err: any) {
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
        <button 
          onClick={() => navigate(`/admin/classes/${classId}`)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> {isMobile ? 'Back' : 'Back to Class Details'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', color: 'var(--silver-light)', marginBottom: '0.25rem' }}>Timetable</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{classId?.replace('-', ' ').toUpperCase()}</p>
          </div>
          <button 
            type="submit"
            form="timetable-form"
            className="btn btn-primary" 
            disabled={isSubmitting}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: isMobile ? '0.6rem 1rem' : '0.7rem 1.5rem', 
              background: '#3b82f6', fontSize: isMobile ? '0.85rem' : '1rem'
            }}
          >
            <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Global Config */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', 
        display: 'flex', gap: isMobile ? '1rem' : '2rem', flexWrap: 'wrap', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>START TIME</div>
          <input 
            type="time" 
            value={startTime} 
            onChange={e => setStartTime(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>DURATION</div>
          <select 
            value={periodDuration} 
            onChange={e => setPeriodDuration(Number(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0.4rem 0.75rem', borderRadius: '8px' }}
          >
            <option value={30}>30m</option>
            <option value={40}>40m</option>
            <option value={45}>45m</option>
            <option value={60}>1h</option>
          </select>
        </div>
        <button 
          type="button" 
          onClick={copyToAllDays}
          className="btn" 
          style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', width: isMobile ? '100%' : 'auto' }}
        >
          Replicate {activeDay}
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: isMobile ? '1.5rem' : '2rem' 
      }}>
        {/* Day Navigator */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          gap: '0.5rem',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '0.5rem' : '0',
          scrollbarWidth: 'none'
        }}>
          {workingDays.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center',
                padding: isMobile ? '0.6rem 1.25rem' : '1rem 1.25rem', borderRadius: '10px', 
                textAlign: 'left', minWidth: isMobile ? 'max-content' : '230px',
                background: activeDay === day ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: activeDay === day ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                color: activeDay === day ? '#3b82f6' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: activeDay === day ? 600 : 400,
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}
            >
              {isMobile ? day.slice(0, 3) : day}
              {!isMobile && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{timetable[day].length} slots</span>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-panel" style={{ borderRadius: '12px', padding: isMobile ? '1rem' : '1.5rem', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={20} color="#f59e0b" /> {activeDay}
            </h2>
            <button 
              type="button" 
              onClick={() => addSlot(activeDay)}
              className="btn btn-primary" 
              style={{ padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem', fontSize: '0.8rem', gap: '0.4rem' }}
            >
              <Plus size={16} /> Add Slot
            </button>
          </div>

          <form id="timetable-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {timetable[activeDay].map((slot) => (
                <div 
                  key={slot.id} 
                  className="animate-slide-up"
                  style={{ 
                    padding: isMobile ? '1rem' : '1.25rem', borderRadius: '10px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--glass-border)',
                    position: 'relative'
                  }}
                >
                  <button 
                    type="button" 
                    onClick={() => removeSlot(activeDay, slot.id)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <X size={16} />
                  </button>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '130px 1fr auto', 
                    gap: isMobile ? '1rem' : '1.5rem', 
                    alignItems: isMobile ? 'stretch' : 'flex-end' 
                  }}>
                    {/* Time Range */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase' }}>Time Range</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                        <input 
                          type="time" 
                          value={slot.startTime} 
                          onChange={e => updateSlot(activeDay, slot.id, { startTime: e.target.value })}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '0.85rem', width: 'auto' }}
                        />
                        <ArrowRight size={14} color="var(--text-muted)" />
                        <input 
                          type="time" 
                          value={slot.endTime} 
                          onChange={e => updateSlot(activeDay, slot.id, { endTime: e.target.value })}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '0.85rem', width: 'auto' }}
                        />
                      </div>
                    </div>

                    {/* Activity Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase' }}>Activity / Subject</label>
                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.5rem' }}>
                        <select 
                          value={slot.type} 
                          onChange={e => updateSlot(activeDay, slot.id, { type: e.target.value as any })}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                          <option value="Subject">Subject</option>
                          <option value="Break">Break</option>
                          <option value="Assembly">Assembly</option>
                          <option value="Lunch">Lunch</option>
                        </select>

                        {slot.type === 'Subject' ? (
                          <div style={{ flex: 1 }}>
                            <SearchableSelect 
                              options={dbSubjects}
                              value={slot.subject || ''}
                              onChange={val => updateSlot(activeDay, slot.id, { subject: val })}
                              placeholder={isLoadingData ? "Loading..." : "Search Subject..."}
                            />
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Activity name..."
                            value={slot.activity} 
                            onChange={e => updateSlot(activeDay, slot.id, { activity: e.target.value })}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Hidden on mobile Icon Preview Label */}
                    {!isMobile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', height: '38px', border: '1px dashed var(--glass-border)' }}>
                        {slot.type === 'Subject' ? <BookOpen size={16} color="#3b82f6" /> : slot.type === 'Lunch' ? <Coffee size={16} color="#10b981" /> : <Clock size={16} color="var(--primary-gold)" />}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {timetable[activeDay].length === 0 && (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed var(--glass-border)' }}>
                  <Calendar size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slots defined.</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
