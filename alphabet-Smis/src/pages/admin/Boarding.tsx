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
  Phone,
  Edit,
  Trash2,
  UserMinus,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function Boarding() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals visibility
  const [isAddHostelOpen, setIsAddHostelOpen] = useState(false);
  const [isEditHostelOpen, setIsEditHostelOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // API Data States
  const [stats, setStats] = useState<any>(null);
  const [hostels, setHostels] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [genderFilter, setGenderFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');

  // Form States (Hostel fields)
  const [newHostel, setNewHostel] = useState({
    name: '',
    type: 'Boys',
    capacity: ''
  });

  const [editingHostel, setEditingHostel] = useState<any>({
    id: '',
    name: '',
    type: 'Boys',
    capacity: ''
  });

  // Warden Selection & Creation Form States
  const [wardenMode, setWardenMode] = useState<'select' | 'create'>('create');
  const [selectedWardenName, setSelectedWardenName] = useState('');
  const [wardenFirstName, setWardenFirstName] = useState('');
  const [wardenLastName, setWardenLastName] = useState('');
  const [wardenPhone, setWardenPhone] = useState('');
  const [wardenEmail, setWardenEmail] = useState('');

  const [editWardenMode, setEditWardenMode] = useState<'select' | 'create'>('create');
  const [editSelectedWardenName, setEditSelectedWardenName] = useState('');
  const [editWardenFirstName, setEditWardenFirstName] = useState('');
  const [editWardenLastName, setEditWardenLastName] = useState('');
  const [editWardenPhone, setEditWardenPhone] = useState('');
  const [editWardenEmail, setEditWardenEmail] = useState('');

  const [assignData, setAssignData] = useState({
    studentId: '',
    hostelId: ''
  });

  const [studentSearchTerm, setStudentSearchTerm] = useState('');

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
      if (statRes.ok) {
        const statJson = await statRes.json();
        setStats(statJson);
      }

      // Fetch Hostels
      const hostelRes = await fetch(`${import.meta.env.VITE_API_URL}/hostels`, { headers });
      if (hostelRes.ok) {
        const hostelJson = await hostelRes.json();
        setHostels(hostelJson.data || []);
      }

      // Fetch All Students
      const studentRes = await fetch(`${import.meta.env.VITE_API_URL}/students?limit=250`, { headers });
      if (studentRes.ok) {
        const studentJson = await studentRes.json();
        const rawStudents = studentJson.data || [];
        setAllStudents(rawStudents);
        setStudents(rawStudents.filter((s: any) => s.hostelId !== null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Collect unique wardens from hostels
  const existingWardens = hostels.reduce((acc: any[], h: any) => {
    if (h.warden && !acc.find(w => w.name.toLowerCase() === h.warden.toLowerCase())) {
      acc.push({
        name: h.warden,
        phone: h.wardenPhone || '',
        email: h.wardenEmail || ''
      });
    }
    return acc;
  }, []);

  const handleAddHostel = async () => {
    let wardenName = '';
    let phone = '';
    let email = '';

    if (wardenMode === 'create') {
      if (!wardenFirstName || !wardenLastName || !wardenPhone || !wardenEmail) return;
      wardenName = `${wardenFirstName.trim()} ${wardenLastName.trim()}`;
      phone = wardenPhone.trim();
      email = wardenEmail.trim();
    } else {
      if (!selectedWardenName) return;
      const selectedW = existingWardens.find(w => w.name === selectedWardenName);
      if (selectedW) {
        wardenName = selectedW.name;
        phone = selectedW.phone;
        email = selectedW.email;
      }
    }

    if (!newHostel.name || !newHostel.capacity) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hostels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHostel.name,
          type: newHostel.type,
          capacity: newHostel.capacity,
          warden: wardenName,
          wardenPhone: phone,
          wardenEmail: email
        })
      });

      if (res.ok) {
        setIsAddHostelOpen(false);
        setNewHostel({ name: '', type: 'Boys', capacity: '' });
        setWardenFirstName('');
        setWardenLastName('');
        setWardenPhone('');
        setWardenEmail('');
        setSelectedWardenName('');
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

  const handleEditHostel = async () => {
    let wardenName = '';
    let phone = '';
    let email = '';

    if (editWardenMode === 'create') {
      if (!editWardenFirstName || !editWardenLastName || !editWardenPhone || !editWardenEmail) return;
      wardenName = `${editWardenFirstName.trim()} ${editWardenLastName.trim()}`;
      phone = editWardenPhone.trim();
      email = editWardenEmail.trim();
    } else {
      if (!editSelectedWardenName) return;
      const selectedW = existingWardens.find(w => w.name === editSelectedWardenName);
      if (selectedW) {
        wardenName = selectedW.name;
        phone = selectedW.phone;
        email = selectedW.email;
      }
    }

    if (!editingHostel.name || !editingHostel.capacity) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hostels/${editingHostel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingHostel.name,
          type: editingHostel.type,
          capacity: editingHostel.capacity,
          warden: wardenName,
          wardenPhone: phone,
          wardenEmail: email
        })
      });

      if (res.ok) {
        setIsEditHostelOpen(false);
        fetchBoardingData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update hostel.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleDeleteHostel = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will deallocate all students currently assigned to it.`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/hostels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchBoardingData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete hostel.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleAssignStudent = async () => {
    if (!assignData.studentId || !assignData.hostelId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const selectedStudent = allStudents.find(s => s.id === Number(assignData.studentId));
      if (!selectedStudent) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${selectedStudent.student_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hostelId: Number(assignData.hostelId),
          scholarType: 'Boarding'
        })
      });

      if (res.ok) {
        setIsAssignStudentOpen(false);
        setAssignData({ studentId: '', hostelId: '' });
        setStudentSearchTerm('');
        fetchBoardingData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to assign student.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleDeallocateStudent = async (studentId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from their hostel allocation?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hostelId: null
        })
      });

      if (res.ok) {
        fetchBoardingData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to deallocate student.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // Filter logic for Room Allocation Tab
  const filteredAllocations = students.filter(stu => {
    const searchString = `${stu.firstName} ${stu.lastName} ${stu.student_id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesGender = !genderFilter || stu.gender === genderFilter;
    const matchesClass = !classFilter || stu.class?.name === classFilter;
    const matchesHostel = !hostelFilter || stu.hostel?.name === hostelFilter;
    return matchesSearch && matchesGender && matchesClass && matchesHostel;
  });

  const uniqueClasses = Array.from(new Set(students.map(s => s.class?.name).filter(Boolean)));
  const uniqueHostelsList = Array.from(new Set(hostels.map(h => h.name).filter(Boolean)));

  // Derived Wardens/Matrons list using the live data
  const wardensList = hostels.reduce((acc: any[], hostel: any) => {
    if (hostel.warden && !acc.find(w => w.name.toLowerCase() === hostel.warden.toLowerCase())) {
      const isMatron = hostel.type === 'Girls';
      acc.push({
        name: hostel.warden,
        hostelName: hostel.name,
        role: isMatron ? 'Matron' : 'Warden',
        gender: hostel.type,
        phone: hostel.wardenPhone || '+265 990 070 000',
        email: hostel.wardenEmail || 'warden@alphasmis.com'
      });
    }
    return acc;
  }, []);

  const assignCandidates = allStudents.filter(stu => {
    const isUnassigned = stu.hostelId === null;
    const searchString = `${stu.firstName} ${stu.lastName} ${stu.student_id}`.toLowerCase();
    const matchesSearch = searchString.includes(studentSearchTerm.toLowerCase());
    return isUnassigned && matchesSearch;
  });

  // Validation checkers
  const isAddHostelFormValid = 
    newHostel.name && 
    newHostel.capacity && 
    (wardenMode === 'create' 
      ? (wardenFirstName && wardenLastName && wardenPhone && wardenEmail) 
      : selectedWardenName);

  const isEditHostelFormValid = 
    editingHostel.name && 
    editingHostel.capacity && 
    (editWardenMode === 'create' 
      ? (editWardenFirstName && editWardenLastName && editWardenPhone && editWardenEmail) 
      : editSelectedWardenName);

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
              onClick={() => {
                setWardenMode(existingWardens.length > 0 ? 'select' : 'create');
                setIsAddHostelOpen(true);
              }}
              className="btn-icon" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Add New Hostel
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hostels.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hostels created yet. Click "Add New Hostel" to begin.</div>
            ) : (
              hostels.map((hostel:any) => (
                <div key={hostel.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Home size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {hostel.name} 
                        <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '12px', background: hostel.type === 'Girls' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)', color: hostel.type === 'Girls' ? '#ec4899' : '#3b82f6' }}>
                          {hostel.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warden: {hostel.warden || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{hostel._count?.students || 0} / {hostel.capacity}</div>
                    <div style={{ height: '6px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, ((hostel._count?.students || 0) / hostel.capacity) * 100)}%`, background: hostel.type === 'Girls' ? '#ec4899' : '#3b82f6' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsAssignStudentOpen(true)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} /> Assign Student
              </button>
              <button 
                onClick={() => alert('Warden dashboard and advanced maintenance scheduling is coming in the next release.')}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Bed size={18} /> Room Maintenance
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Allocations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {students.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No active allocations.</div>
              ) : (
                students.slice(-4).reverse().map((stu:any, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: stu.gender === 'Female' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)', color: stu.gender === 'Female' ? '#ec4899' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {stu.firstName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{stu.firstName} {stu.lastName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stu.hostel?.name || 'Unassigned'}</div>
                    </div>
                  </div>
                ))
              )}
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
          
          <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="btn-icon-label" 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={18} /> Filters {(genderFilter || classFilter || hostelFilter) && '•'}
            </button>
            <button 
              onClick={() => setIsAssignStudentOpen(true)}
              className="btn btn-primary" 
              style={{ background: '#3b82f6', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> New Allocation
            </button>

            {isFilterDropdownOpen && (
              <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '48px', padding: '1.25rem', borderRadius: '12px', width: '250px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</label>
                  <select 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '8px', outline: 'none' }}
                    value={genderFilter} 
                    onChange={e => setGenderFilter(e.target.value)}
                  >
                    <option value="" style={{ background: '#111' }}>All Genders</option>
                    <option value="Male" style={{ background: '#111' }}>Male</option>
                    <option value="Female" style={{ background: '#111' }}>Female</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class</label>
                  <select 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '8px', outline: 'none' }}
                    value={classFilter} 
                    onChange={e => setClassFilter(e.target.value)}
                  >
                    <option value="" style={{ background: '#111' }}>All Classes</option>
                    {uniqueClasses.map((cls, idx) => (
                      <option key={idx} value={cls} style={{ background: '#111' }}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hostel</label>
                  <select 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '8px', outline: 'none' }}
                    value={hostelFilter} 
                    onChange={e => setHostelFilter(e.target.value)}
                  >
                    <option value="" style={{ background: '#111' }}>All Hostels</option>
                    {uniqueHostelsList.map((hostel, idx) => (
                      <option key={idx} value={hostel} style={{ background: '#111' }}>{hostel}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => { setGenderFilter(''); setClassFilter(''); setHostelFilter(''); setIsFilterDropdownOpen(false); }}
                  style={{ background: 'rgba(255,0,0,0.1)', border: 'none', color: '#ff4d4d', padding: '8px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredAllocations.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
            <Users size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <div>No matching allocations found.</div>
          </div>
        ) : (
          <>
            <div className="table-container desktop-only">
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Student</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Gender</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Class</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Hostel</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllocations.map((stu:any) => (
                    <tr key={stu.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      <td style={{ padding: '1rem', borderRadius: '10px 0 0 10px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stu.firstName} {stu.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.student_id}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.gender}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.class?.name || 'N/A'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                          <Home size={14} style={{ color: '#3b82f6' }} />
                          {stu.hostel?.name || 'N/A'}
                        </span>
                      </td>
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
                        <button 
                          onClick={() => handleDeallocateStudent(stu.student_id, `${stu.firstName} ${stu.lastName}`)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Deallocate Student"
                        >
                          <UserMinus size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="mobile-only" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
              {filteredAllocations.map((stu:any) => (
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
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hostel</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stu.hostel?.name || 'N/A'}</div>
                    </div>
                    <button 
                      onClick={() => handleDeallocateStudent(stu.student_id, `${stu.firstName} ${stu.lastName}`)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <UserMinus size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderHostelsTab = () => (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => {
            setWardenMode(existingWardens.length > 0 ? 'select' : 'create');
            setWardenFirstName('');
            setWardenLastName('');
            setWardenPhone('');
            setWardenEmail('');
            setSelectedWardenName('');
            setIsAddHostelOpen(true);
          }}
          className="btn btn-primary" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Add Hostel <Plus size={18} />
        </button>
      </div>

      {hostels.length === 0 ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', borderRadius: '20px', textAlign: 'center' }}>
          <Home size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Hostels Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Get started by creating your first hostel.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {hostels.map((hostel) => {
            const occupied = hostel._count?.students || 0;
            const cap = hostel.capacity;
            const percent = Math.min(100, Math.round((occupied / cap) * 100));

            return (
              <div key={hostel.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: hostel.type === 'Girls' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)', color: hostel.type === 'Girls' ? '#ec4899' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Home size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{hostel.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hostel.hostel_id}</span>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                      background: hostel.type === 'Girls' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)',
                      color: hostel.type === 'Girls' ? '#ec4899' : '#3b82f6'
                    }}>
                      {hostel.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>Occupancy</span>
                    <span style={{ fontWeight: 600, color: 'white' }}>{occupied} / {cap} beds</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: hostel.type === 'Girls' ? '#ec4899' : '#3b82f6', borderRadius: '4px' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Warden:</span>
                      <strong style={{ color: 'white' }}>{hostel.warden || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <button 
                    onClick={() => {
                      setEditingHostel(hostel);
                      
                      // Pre-populate Edit Warden fields
                      const wardenNameStr = hostel.warden || '';
                      const parts = wardenNameStr.trim().split(' ');
                      setEditWardenFirstName(parts[0] || '');
                      setEditWardenLastName(parts.slice(1).join(' ') || '');
                      setEditWardenPhone(hostel.wardenPhone || '');
                      setEditWardenEmail(hostel.wardenEmail || '');
                      setEditSelectedWardenName('');
                      setEditWardenMode('create');

                      setIsEditHostelOpen(true);
                    }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteHostel(hostel.id, hostel.name)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStaffTab = () => (
    <div className="animate-fade">
      {wardensList.length === 0 ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', borderRadius: '20px', textAlign: 'center' }}>
          <ShieldCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Warden Information Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Assign a warden when creating/editing a hostel to view them here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {wardensList.map((warden: any, idx: number) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: warden.gender === 'Girls' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)', color: warden.gender === 'Girls' ? '#ec4899' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                  {warden.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{warden.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: warden.gender === 'Girls' ? '#ec4899' : '#3b82f6', fontWeight: 600 }}>
                    {warden.role} ({warden.gender === 'Girls' ? 'Girls wing' : 'Boys wing'})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Home size={14} style={{ opacity: 0.7 }} />
                  <span>Hostel: <strong style={{ color: 'white' }}>{warden.hostelName}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ opacity: 0.7 }} />
                  <span>Phone: <strong style={{ color: 'white' }}>{warden.phone}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ opacity: 0.7 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Email: <strong style={{ color: 'white' }}>{warden.email}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <a 
                  href={`tel:${warden.phone}`}
                  style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <Phone size={14} /> Call
                </a>
                <a 
                  href={`https://wa.me/${warden.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
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
          <button 
            onClick={() => setIsAssignStudentOpen(true)}
            className="btn btn-secondary" 
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Assign Student
          </button>
          <button 
            onClick={() => {
              setWardenMode(existingWardens.length > 0 ? 'select' : 'create');
              setWardenFirstName('');
              setWardenLastName('');
              setWardenPhone('');
              setWardenEmail('');
              setSelectedWardenName('');
              setIsAddHostelOpen(true);
            }}
            className="btn btn-primary" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Add Hostel <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Add Hostel Modal */}
      {isAddHostelOpen && (
        <div className="modal-overlay" onClick={() => setIsAddHostelOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem 0' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '500px', width: '90%', margin: 'auto' }} onClick={e => e.stopPropagation()}>
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

              {/* Warden Option Toggle */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Warden Assignment</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                    <input 
                      type="radio" 
                      name="addWardenMode" 
                      disabled={existingWardens.length === 0}
                      checked={wardenMode === 'select'} 
                      onChange={() => setWardenMode('select')} 
                    />
                    Select Existing Warden
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                    <input 
                      type="radio" 
                      name="addWardenMode" 
                      checked={wardenMode === 'create'} 
                      onChange={() => setWardenMode('create')} 
                    />
                    Create New Warden
                  </label>
                </div>

                {wardenMode === 'select' && existingWardens.length > 0 ? (
                  <div className="form-group-custom">
                    <label>Choose Warden</label>
                    <select 
                      value={selectedWardenName}
                      onChange={e => setSelectedWardenName(e.target.value)}
                    >
                      <option value="">-- Choose Warden --</option>
                      {existingWardens.map((w, idx) => (
                        <option key={idx} value={w.name}>{w.name} ({w.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group-custom">
                        <label>Warden First Name</label>
                        <input 
                          type="text" 
                          value={wardenFirstName}
                          onChange={e => setWardenFirstName(e.target.value)}
                          placeholder="e.g. John" 
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Warden Last Name</label>
                        <input 
                          type="text" 
                          value={wardenLastName}
                          onChange={e => setWardenLastName(e.target.value)}
                          placeholder="e.g. Banda" 
                        />
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={wardenPhone}
                        onChange={e => setWardenPhone(e.target.value)}
                        placeholder="e.g. +265990070000" 
                      />
                    </div>

                    <div className="form-group-custom">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={wardenEmail}
                        onChange={e => setWardenEmail(e.target.value)}
                        placeholder="e.g. john@alphasmis.com" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setIsAddHostelOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  disabled={!isAddHostelFormValid}
                  onClick={handleAddHostel}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
                    background: !isAddHostelFormValid ? 'rgba(255,255,255,0.05)' : '#3b82f6', 
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    opacity: !isAddHostelFormValid ? 0.5 : 1
                  }}
                >
                  Save Hostel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hostel Modal */}
      {isEditHostelOpen && (
        <div className="modal-overlay" onClick={() => setIsEditHostelOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem 0' }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '500px', width: '90%', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Hostel Details</h2>
              </div>
              <button 
                onClick={() => setIsEditHostelOpen(false)}
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
                  value={editingHostel.name}
                  onChange={e => setEditingHostel({...editingHostel, name: e.target.value})}
                  placeholder="e.g. Liberty Boys Wing B" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Category</label>
                  <select 
                    value={editingHostel.type}
                    onChange={e => setEditingHostel({...editingHostel, type: e.target.value})}
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
                <div className="form-group-custom">
                  <label>Total Capacity</label>
                  <input 
                    type="number" 
                    value={editingHostel.capacity}
                    onChange={e => setEditingHostel({...editingHostel, capacity: e.target.value})}
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Edit Warden Option Toggle */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Warden Assignment</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                    <input 
                      type="radio" 
                      name="editWardenMode" 
                      disabled={existingWardens.length === 0}
                      checked={editWardenMode === 'select'} 
                      onChange={() => setEditWardenMode('select')} 
                    />
                    Select Existing Warden
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', color: 'white' }}>
                    <input 
                      type="radio" 
                      name="editWardenMode" 
                      checked={editWardenMode === 'create'} 
                      onChange={() => setEditWardenMode('create')} 
                    />
                    Edit/Create Warden details
                  </label>
                </div>

                {editWardenMode === 'select' && existingWardens.length > 0 ? (
                  <div className="form-group-custom">
                    <label>Choose Warden</label>
                    <select 
                      value={editSelectedWardenName}
                      onChange={e => setEditSelectedWardenName(e.target.value)}
                    >
                      <option value="">-- Choose Warden --</option>
                      {existingWardens.map((w, idx) => (
                        <option key={idx} value={w.name}>{w.name} ({w.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group-custom">
                        <label>Warden First Name</label>
                        <input 
                          type="text" 
                          value={editWardenFirstName}
                          onChange={e => setEditWardenFirstName(e.target.value)}
                          placeholder="e.g. John" 
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Warden Last Name</label>
                        <input 
                          type="text" 
                          value={editWardenLastName}
                          onChange={e => setEditWardenLastName(e.target.value)}
                          placeholder="e.g. Banda" 
                        />
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={editWardenPhone}
                        onChange={e => setEditWardenPhone(e.target.value)}
                        placeholder="e.g. +265990070000" 
                      />
                    </div>

                    <div className="form-group-custom">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={editWardenEmail}
                        onChange={e => setEditWardenEmail(e.target.value)}
                        placeholder="e.g. john@alphasmis.com" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setIsEditHostelOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  disabled={!isEditHostelFormValid}
                  onClick={handleEditHostel}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
                    background: !isEditHostelFormValid ? 'rgba(255,255,255,0.05)' : '#3b82f6', 
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    opacity: !isEditHostelFormValid ? 0.5 : 1
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {isAssignStudentOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignStudentOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxWidth: '480px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Allocate Student to Hostel</h2>
              </div>
              <button 
                onClick={() => setIsAssignStudentOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group-custom">
                <label>Find Student</label>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    style={{ paddingLeft: '2.5rem' }}
                    type="text" 
                    value={studentSearchTerm}
                    onChange={e => setStudentSearchTerm(e.target.value)}
                    placeholder="Search by student name or ID..." 
                  />
                </div>
                
                {/* Search Candidates List */}
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  {assignCandidates.length === 0 ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No unassigned students found.
                    </div>
                  ) : (
                    assignCandidates.map((stu) => (
                      <div 
                        key={stu.id}
                        onClick={() => {
                          setAssignData({...assignData, studentId: String(stu.id)});
                          setStudentSearchTerm(`${stu.firstName} ${stu.lastName} (${stu.student_id})`);
                        }}
                        style={{ 
                          padding: '10px 12px', 
                          borderBottom: '1px solid rgba(255,255,255,0.03)', 
                          cursor: 'pointer',
                          background: assignData.studentId === String(stu.id) ? 'rgba(59,130,246,0.15)' : 'transparent',
                          transition: 'background 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{stu.firstName} {stu.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.student_id} · {stu.class?.name || 'No Class'}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', background: stu.scholarType === 'Boarding' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: stu.scholarType === 'Boarding' ? '#3b82f6' : '#f59e0b' }}>
                          {stu.scholarType || 'Day'} Scholar
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group-custom">
                <label>Select Hostel</label>
                <select 
                  value={assignData.hostelId}
                  onChange={e => setAssignData({...assignData, hostelId: e.target.value})}
                >
                  <option value="">-- Choose a Hostel --</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type} wing) · ({h._count?.students || 0}/{h.capacity} filled)
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert message if scholar type conversion is needed */}
              {assignData.studentId && allStudents.find(s => s.id === Number(assignData.studentId))?.scholarType !== 'Boarding' && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.8rem' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>Note: This student is currently a <strong>Day scholar</strong>. Assigning a hostel will automatically change their scholar type to <strong>Boarding</strong>.</div>
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setIsAssignStudentOpen(false);
                    setAssignData({ studentId: '', hostelId: '' });
                    setStudentSearchTerm('');
                  }}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  disabled={!assignData.studentId || !assignData.hostelId}
                  onClick={handleAssignStudent}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', 
                    background: (!assignData.studentId || !assignData.hostelId) ? 'rgba(255,255,255,0.05)' : '#3b82f6', 
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    opacity: (!assignData.studentId || !assignData.hostelId) ? 0.5 : 1
                  }}
                >
                  Assign Student
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
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
            Loading Boarding Data...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'allocation' && renderAllocationTable()}
            {activeTab === 'hostels' && renderHostelsTab()}
            {activeTab === 'staff' && renderStaffTab()}
          </>
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
