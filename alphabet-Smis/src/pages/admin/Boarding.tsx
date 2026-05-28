import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Bed, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Settings,
  UserCheck,
  Building2,
  Phone
} from 'lucide-react';

export default function Boarding() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddHostelOpen, setIsAddHostelOpen] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [hostels, setHostels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoardingData();
  }, []);

  const fetchBoardingData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const statRes = await fetch(`${import.meta.env.VITE_API_URL}/hostels/stats`, { headers });
      const statJson = await statRes.json();
      if (statRes.ok) setStats(statJson);

      // Fetch Hostels
      const hostelRes = await fetch(`${import.meta.env.VITE_API_URL}/hostels`, { headers });
      const hostelJson = await hostelRes.json();
      if (hostelRes.ok) setHostels(hostelJson.data);

      // Fetch Students with Hostels (Allocations)
      const studentRes = await fetch(`${import.meta.env.VITE_API_URL}/students?limit=100`, { headers });
      const studentJson = await studentRes.json();
      if (studentRes.ok) {
        setStudents(studentJson.data.filter((s:any) => s.hostelId !== null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [newHostel, setNewHostel] = useState({
    name: '',
    type: 'Boys',
    capacity: '',
    warden: ''
  });

  const handleAddHostel = async () => {
    if (!newHostel.name || !newHostel.capacity || !newHostel.warden) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hostels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHostel)
      });

      if (res.ok) {
        setIsAddHostelOpen(false);
        setNewHostel({ name: '', type: 'Boys', capacity: '', warden: '' });
        fetchBoardingData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create hostel.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const renderOverview = () => (
    <div className="animate-fade">
      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Total Capacity', value: stats?.totalCapacity || 0, icon: <Building2 />, color: '#3b82f6', sub: 'Beds available' },
          { title: 'Currently Boarding', value: stats?.currentlyBoarding || 0, icon: <Users />, color: '#10b981', sub: 'Active residents' },
          { title: 'Occupancy Rate', value: stats?.occupancyRate || '0%', icon: <UserCheck />, color: '#f59e0b', sub: 'Current fill' },
          { title: 'Maintenance', value: stats?.maintenanceRooms || 0, icon: <AlertTriangle />, color: '#ef4444', sub: 'Rooms offline' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.title}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Hostel Status */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hostel Overview</h3>
            <button 
              onClick={() => setIsAddHostelOpen(true)}
              className="btn-icon" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Add New Hostel
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hostels.map((hostel:any) => (
              <div key={hostel.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{hostel.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warden: {hostel.warden || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{hostel._count?.students || 0} / {hostel.capacity}</div>
                  <div style={{ height: '6px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((hostel._count?.students || 0) / hostel.capacity) * 100}%`, background: '#3b82f6' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Assign Student
              </button>
              <button style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Bed size={18} /> Room Maintenance
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Allocations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {students.slice(0, 3).map((stu:any, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                    {stu.firstName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{stu.firstName} {stu.lastName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stu.hostel?.name || 'Unassigned'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocationTable = () => (
    <div className="animate-fade">
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search students by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-icon-label" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} /> Filter
            </button>
            <button className="btn btn-primary" style={{ background: '#3b82f6', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Allocation
            </button>
          </div>
        </div>

        <div className="table-container desktop-only">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Student</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Gender</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Class</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Hostel</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Room</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu:any) => (
                <tr key={stu.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <td style={{ padding: '1rem', borderRadius: '10px 0 0 10px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stu.firstName} {stu.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.student_id}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.gender}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.class?.name || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.hostel?.name || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>TBD</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981'
                    }}>
                      Allocated
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
          {students.map((stu:any) => (
            <div key={stu.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{stu.firstName} {stu.lastName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.student_id} · {stu.class?.name || 'N/A'}</div>
                </div>
                <span style={{ 
                  padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, alignSelf: 'flex-start',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981'
                }}>
                  Allocated
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hostel</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stu.hostel?.name || 'N/A'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room</div>
                  <div style={{ fontWeight: 700 }}>TBD</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ color: 'var(--text-light)' }}>
      {/* Header */}
      <div className="header-stack" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #ffffff, var(--silver-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Boarding Management
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
            Manage hostels, room allocations, and student residents across the academy's boarding facilities.
          </p>
        </div>
        <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-icon header-action" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-light)' }}>
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsAddHostelOpen(true)}
            className="btn btn-primary" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Add Hostel <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Add Hostel Modal */}
      {isAddHostelOpen && (
        <div className="modal-overlay" onClick={() => setIsAddHostelOpen(false)}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Add New Hostel</h2>
              </div>
              <button 
                onClick={() => setIsAddHostelOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group-custom">
                <label>Hostel Name</label>
                <input 
                  type="text" 
                  value={newHostel.name}
                  onChange={e => setNewHostel({...newHostel, name: e.target.value})}
                  placeholder="e.g. Liberty Boys Wing B" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Category</label>
                  <select 
                    value={newHostel.type}
                    onChange={e => setNewHostel({...newHostel, type: e.target.value})}
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
                <div className="form-group-custom">
                  <label>Total Capacity</label>
                  <input 
                    type="number" 
                    value={newHostel.capacity}
                    onChange={e => setNewHostel({...newHostel, capacity: e.target.value})}
                    placeholder="0" 
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Assigned Warden</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    style={{ paddingLeft: '2.5rem' }}
                    type="text" 
                    value={newHostel.warden}
                    onChange={e => setNewHostel({...newHostel, warden: e.target.value})}
                    placeholder="Warden Name" 
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setIsAddHostelOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  disabled={!newHostel.name || !newHostel.capacity || !newHostel.warden}
                  onClick={handleAddHostel}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
                    background: (!newHostel.name || !newHostel.capacity || !newHostel.warden) ? 'rgba(255,255,255,0.05)' : '#3b82f6', 
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    opacity: (!newHostel.name || !newHostel.capacity || !newHostel.warden) ? 0.5 : 1
                  }}
                >
                  Save Hostel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="scrollable-tabs" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: <Building2 size={18} /> },
          { id: 'allocation', label: 'Room Allocation', icon: <Bed size={18} /> },
          { id: 'hostels', label: 'Hostels', icon: <Home size={18} /> },
          { id: 'staff', label: 'Matrons & Wardens', icon: <ShieldCheck size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.5rem',
              background: 'transparent',
              color: activeTab === tab.id ? '#3b82f6' : 'var(--text-muted)',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              fontSize: '0.95rem', fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              marginBottom: '-0.6rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content" style={{ minHeight: '500px' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'allocation' && renderAllocationTable()}
        {['hostels', 'staff'].includes(activeTab) && (
          <div className="glass-panel animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Settings size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Advanced Module Coming Soon</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>This section is currently being populated with data. Detailed hostel and staff management will be available in the next update.</p>
          </div>
        )}
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .animate-fade {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .search-bar {
          display: flex;
          align-items: center;
          padding: 0.65rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
        }
        .search-bar input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          margin-left: 0.75rem;
        }
        .search-icon { color: var(--text-muted); }

        .form-group-custom {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group-custom label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .form-group-custom input, .form-group-custom select {
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          outline: none;
          font-family: inherit;
        }
        .form-group-custom select option {
          background: #1a1a1a;
          color: white;
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .dashboard-row { grid-template-columns: 1fr !important; }
          .header-stack { flex-direction: column; align-items: flex-start !important; }
          .action-buttons { width: 100%; flex-direction: column; }
          .action-buttons button { width: 100%; justify-content: center; }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          h1 { font-size: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
