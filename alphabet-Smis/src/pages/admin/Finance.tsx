import { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Users, Search, Plus, Filter, Download,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, ChevronRight,
  DollarSign, Settings, PieChart as PieChartIcon, Loader, Paperclip, Eye, X
} from 'lucide-react';

export default function Finance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  // Overview Data State
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fee Configuration State
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [dayScholarFee, setDayScholarFee] = useState('0');
  const [boardingScholarFee, setBoardingScholarFee] = useState('0');
  const [activeTerm, setActiveTerm] = useState(1);
  
  // Payment Recording State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerm, setPaymentTerm] = useState(0); // 0 = use active term
  const [isFeeFilterOpen, setIsFeeFilterOpen] = useState(false);
  const [feeFilters, setFeeFilters] = useState({ status: '', class: '', scholarType: '' });
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Term-based Fee View State  
  const [feeTermView, setFeeTermView] = useState('annual'); // 'annual', '1', '2', '3'
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [studentAccountData, setStudentAccountData] = useState<any>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // Overview Filters State
  const [overviewTerm, setOverviewTerm] = useState<number>(0); // 0 = All Terms
  const [overviewYear, setOverviewYear] = useState<string>(''); // Populated dynamically

  // Expense Management State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Salaries',
    description: '',
    amount: '',
    status: 'COMPLETED',
    date: new Date().toISOString().split('T')[0]
  });
  const [expenseFile, setExpenseFile] = useState<File | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  // Financial Reports State
  const [reportData, setReportData] = useState<any>(null);
  const [isRefreshingReport, setIsRefreshingReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOverview = async (termVal?: number, yearVal?: string) => {
    const termQuery = termVal !== undefined ? termVal : overviewTerm;
    const yearQuery = yearVal !== undefined ? yearVal : overviewYear;
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      const url = `${import.meta.env.VITE_API_URL}/finance/overview?term=${termQuery}&academicYear=${yearQuery}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        setOverviewData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch filtered overview:', err);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    if (activeTab === 'expenses') fetchExpenses();
    if (activeTab === 'fees') fetchStudentFees();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  useEffect(() => {
    if (overviewYear !== '') {
      fetchOverview();
    }
  }, [overviewTerm, overviewYear]);

  const filteredFees = studentFees.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !feeFilters.status || f.feeStatus === feeFilters.status;
    const matchesClass = !feeFilters.class || f.class === feeFilters.class;
    const matchesType = !feeFilters.scholarType || f.scholarType === feeFilters.scholarType;
    return matchesSearch && matchesStatus && matchesClass && matchesType;
  });

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [ovRes, fsRes, tRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/finance/overview`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/finance/fee-structure`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/finance/teachers`, { headers })
      ]);
      if (!ovRes.ok || !fsRes.ok || !tRes.ok) throw new Error('Failed to fetch financial records');
      const ovJson = await ovRes.json();
      const fsJson = await fsRes.json();
      const tJson = await tRes.json();
      setOverviewData(ovJson);
      setFeeStructures(fsJson);
      setTeachers(tJson);
      // Detect active term from fee structures
      if (fsJson.length > 0) {
        const currentTerm = fsJson[0].term || 1;
        const currentYear = fsJson[0].academicYear || new Date().getFullYear().toString();
        setActiveTerm(currentTerm);
        setPaymentTerm(currentTerm);
        setOverviewTerm(0); // 0 = All Terms default
        setOverviewYear(currentYear);
      } else {
        setOverviewYear(new Date().getFullYear().toString());
      }
      const day = fsJson.find((s: any) => s.scholarType === 'Day');
      const boarding = fsJson.find((s: any) => s.scholarType === 'Boarding');
      if (day) setDayScholarFee(day.totalAmount.toLocaleString());
      if (boarding) setBoardingScholarFee(boarding.totalAmount.toLocaleString());
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentFees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/student-fees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStudentFees(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { const json = await res.json(); setExpenses(Array.isArray(json) ? json : json.data ?? []); }
    } catch (err) { console.error(err); }
  };

  const fetchReports = async () => {
    setIsRefreshingReport(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setReportData(await res.json());
    } catch (err) { console.error(err); } finally { setIsRefreshingReport(false); }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let data = reportData;
      if (!data) {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          data = await res.json();
          setReportData(data);
        }
      }
      
      if (!data) {
        alert("Could not load report data");
        return;
      }

      // Small delay for UX
      await new Promise(r => setTimeout(r, 600));

      const headers = ['Date', 'ID', 'Type', 'Category', 'Description', 'Amount', 'Status'];
      const rows = data.transactions.map((t: any) => [
        new Date(t.date).toLocaleDateString(),
        t.id,
        t.type,
        t.category,
        t.description,
        t.amount,
        t.status
      ]);
      const csvContent = [headers, ...rows].map(e => e.map(field => `"${field ?? ''}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFilteredFees = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      const headers = ['Student Name', 'Student ID', 'Class', 'Scholar Type', 'Status', 'Amount Paid', 'Balance'];
      const rows = filteredFees.map(f => [
        f.name,
        f.id,
        f.class,
        f.scholarType,
        f.feeStatus,
        f.amountPaid,
        f.balance
      ]);
      const csvContent = [headers, ...rows].map(e => e.map(field => `"${field ?? ''}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fee_collection_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchStudentQuery.length > 1) {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/students?q=${searchStudentQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setDbStudents(await res.json());
      } else { setDbStudents([]); }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [searchStudentQuery]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount) return;
    setIsSavingPayment(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: parseAmount(paymentAmount),
          method: paymentMethod,
          reference: paymentReference,
          date: paymentDate,
          term: paymentTerm || activeTerm
        })
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        resetPaymentForm();
        fetchFinanceData();
        fetchStudentFees();
      } else throw new Error('Failed to record payment');
    } catch (err: any) { alert(err.message); } finally { setIsSavingPayment(false); }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseFile && expenseFile.type.startsWith('image/') && expenseFile.size > 512000) {
      alert('Image size must be less than 500KB');
      return;
    }
    const formData = new FormData();
    formData.append('category', expenseForm.category);
    formData.append('description', expenseForm.description);
    formData.append('amount', expenseForm.amount);
    formData.append('status', expenseForm.status);
    formData.append('date', expenseForm.date);
    if (expenseFile) formData.append('attachment', expenseFile);
    try {
      const token = localStorage.getItem('accessToken');
      const url = editingExpense ? `${import.meta.env.VITE_API_URL}/finance/expenses/${editingExpense.id}` : `${import.meta.env.VITE_API_URL}/finance/expenses`;
      const res = await fetch(url, {
        method: editingExpense ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setIsExpenseModalOpen(false);
        setEditingExpense(null);
        setExpenseForm({ category: 'Salaries', description: '', amount: '', status: 'COMPLETED', date: new Date().toISOString().split('T')[0] });
        setExpenseFile(null);
        fetchExpenses();
        fetchFinanceData();
      } else throw new Error((await res.json()).message || 'Failed to save expense');
    } catch (err: any) { alert(err.message); }
  };

  const handleSaveFees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/fee-structure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify([
          { scholarType: 'Day', totalAmount: parseAmount(dayScholarFee), installments: [] },
          { scholarType: 'Boarding', totalAmount: parseAmount(boardingScholarFee), installments: [] }
        ])
      });
      if (!res.ok) throw new Error('Failed to update fee structures');
      setIsConfigModalOpen(false);
      fetchFinanceData();
    } catch (err: any) { alert(err.message); }
  };

  const parseAmount = (val: string) => typeof val === 'number' ? val : (parseFloat(val.toString().replace(/,/g, '')) || 0);
  const resetPaymentForm = () => { setSelectedStudent(null); setSearchStudentQuery(''); setPaymentAmount(''); setPaymentReference(''); setDbStudents([]); setPaymentDate(new Date().toISOString().split('T')[0]); setPaymentTerm(activeTerm); };
  const iconMap: any = { 'TrendingUp': <TrendingUp size={20} />, 'TrendingDown': <TrendingDown size={20} />, 'Clock': <Clock size={20} />, 'Wallet': <Wallet size={20} /> };
  const statusColor = (status: string) => status === 'Paid' ? '#10b981' : status === 'Partial' ? '#f59e0b' : status === 'Overpaid' ? '#3b82f6' : status === 'N/A' ? 'var(--text-muted)' : '#ef4444';
  const statusBg = (status: string) => status === 'Paid' ? 'rgba(16,185,129,0.1)' : status === 'Partial' ? 'rgba(245,158,11,0.1)' : status === 'Overpaid' ? 'rgba(59,130,246,0.1)' : status === 'N/A' ? 'rgba(128,128,128,0.1)' : 'rgba(239,68,68,0.1)';

  const fetchStudentAccount = async (dbId: number) => {
    setIsLoadingAccount(true);
    setIsAccountModalOpen(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/finance/student-account/${dbId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStudentAccountData(await res.json());
    } catch (err) { console.error(err); } finally { setIsLoadingAccount(false); }
  };

  if (isLoading) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}><Loader size={32} className="spin" style={{ color: '#3b82f6' }} /><p style={{ color: 'var(--text-muted)' }}>Syncing financial records...</p></div>;
  if (error || !overviewData) return <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem', borderRadius: '16px' }}><AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} /><h2 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Finance Sync Error</h2><p style={{ color: 'var(--text-muted)' }}>{error || 'An unexpected error occurred.'}</p><button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => window.location.reload()}>Retry Sync</button></div>;

  const renderReports = () => {
    if (isRefreshingReport || !reportData) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}><Loader size={32} className="spin" style={{ color: '#3b82f6' }} /><p style={{ color: 'var(--text-muted)' }}>Generating comprehensive financial report...</p></div>;
    
    const { summary, transactions } = reportData;
    const filtered = transactions.filter((t: any) => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="animate-fade">
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Revenue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>MK {summary.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Expenses</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>MK {summary.totalExpenses.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Balance</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>MK {summary.netBalance.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Collection Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>{summary.collectionRate}%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Financial Statement</h3>
            <div className="search-bar" style={{ maxWidth: '300px', height: '36px', padding: '0 0.75rem' }}><Search size={14} /><input placeholder="Filter report..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ fontSize: '0.85rem' }} /></div>
          </div>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', minWidth: '600px' }}>
              <thead><tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Date</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Category</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Description</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Amount</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Type</th></tr></thead>
              <tbody>{filtered.map((t: any, i: number) => (
                <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{t.category}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.description}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.9rem', color: t.type === 'INCOME' ? '#10b981' : '#ef4444' }}>{t.type === 'INCOME' ? '+' : '-'} MK {t.amount.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: t.type === 'INCOME' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'INCOME' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{t.type}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const currentYear = new Date().getFullYear();
    const yearsList = [
      (currentYear + 1).toString(),
      currentYear.toString(),
      (currentYear - 1).toString(),
      (currentYear - 2).toString(),
    ];

    return (
      <div className="animate-fade">
        {/* Overview Filters */}
        <div className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-light)' }}>Overview Financial Filters</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Year:</span>
              <select 
                value={overviewYear} 
                onChange={(e) => setOverviewYear(e.target.value)} 
                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)', fontSize: '0.85rem', outline: 'none', fontWeight: 500 }}
              >
                {yearsList.map(y => <option key={y} value={y} style={{ background: '#1e1e22' }}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Term:</span>
              <select 
                value={overviewTerm} 
                onChange={(e) => setOverviewTerm(parseInt(e.target.value))} 
                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)', fontSize: '0.85rem', outline: 'none', fontWeight: 500 }}
              >
                <option value={0} style={{ background: '#1e1e22' }}>All Terms</option>
                <option value={1} style={{ background: '#1e1e22' }}>Term 1</option>
                <option value={2} style={{ background: '#1e1e22' }}>Term 2</option>
                <option value={3} style={{ background: '#1e1e22' }}>Term 3</option>
              </select>
            </div>
          </div>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
          {overviewData.stats.map((stat: any, i: number) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${stat.color}15, transparent)`, borderRadius: '0 0 0 100%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{iconMap[stat.icon] || <DollarSign size={20} />}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>{stat.trend === 'up' ? <ArrowUpRight size={14} /> : stat.trend === 'down' ? <ArrowDownRight size={14} /> : null}{stat.change}</div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{stat.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Collections</h3><button onClick={() => setActiveTab('fees')} style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{overviewData.recentCollections?.map((stu: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{stu.name.charAt(0)}</div>
                  <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stu.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.class} • {stu.id}</div></div>
                </div>
                <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, color: '#10b981' }}>{stu.amountPaid}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stu.date}</div></div>
              </div>
            ))}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Expense Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>{overviewData.expenseBreakdown.map((item: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>{item.label}</span><span style={{ fontWeight: 600 }}>{item.value}%</span></div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: '4px' }}></div></div>
              </div>
            ))}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeeCollection = () => {
    const uniqueClasses = Array.from(new Set(studentFees.map(f => f.class))).sort();

    // Filter helper for the selected term view
    const getTermData = (stu: any) => {
      if (feeTermView === 'annual') return { status: stu.annualSummary?.status || stu.feeStatus, paid: stu.annualSummary?.totalPaid || 0, balance: stu.annualSummary?.totalBalance || 0, expected: stu.annualSummary?.totalExpected || 0 };
      const t = stu.termBreakdown?.find((b: any) => b.term === parseInt(feeTermView));
      return t ? { status: t.status, paid: t.effectivePaid, balance: t.balance, expected: t.expectedFee } : { status: 'N/A', paid: 0, balance: 0, expected: 0 };
    };

    const filtered = filteredFees.filter(f => {
      const td = getTermData(f);
      return !feeFilters.status || td.status === feeFilters.status;
    });

    return (
      <div className="animate-fade">
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          {/* Term Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[{ id: 'annual', label: 'Annual' }, { id: '1', label: 'Term 1' }, { id: '2', label: 'Term 2' }, { id: '3', label: 'Term 3' }].map(tab => (
              <button key={tab.id} onClick={() => setFeeTermView(tab.id)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: feeTermView === tab.id ? '1px solid #3b82f6' : '1px solid var(--glass-border)', background: feeTermView === tab.id ? 'rgba(59,130,246,0.15)' : 'transparent', color: feeTermView === tab.id ? '#3b82f6' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: feeTermView === tab.id ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s ease' }}>{tab.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: isFeeFilterOpen ? '1rem' : '1.5rem' }}>
            <div className="search-bar" style={{ flex: 1, maxWidth: '400px', background: 'rgba(255,255,255,0.05)' }}><Search size={18} className="search-icon" /><input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setIsFeeFilterOpen(!isFeeFilterOpen)} style={{ background: isFeeFilterOpen ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}><Filter size={18} /> Filter</button>
              <button onClick={() => setIsPaymentModalOpen(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}><Plus size={18} /> Record Fee</button>
            </div>
          </div>

          {isFeeFilterOpen && (
            <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div className="fee-input-group" style={{ marginBottom: 0 }}><label>Status</label><div className="fee-input-wrapper"><select style={{ padding: '0.5rem' }} value={feeFilters.status} onChange={e => setFeeFilters({...feeFilters, status: e.target.value})}><option value="">All Statuses</option><option value="Paid">Paid</option><option value="Partial">Partial</option><option value="Unpaid">Unpaid</option><option value="Overpaid">Overpaid</option></select></div></div>
              <div className="fee-input-group" style={{ marginBottom: 0 }}><label>Class</label><div className="fee-input-wrapper"><select style={{ padding: '0.5rem' }} value={feeFilters.class} onChange={e => setFeeFilters({...feeFilters, class: e.target.value})}><option value="">All Classes</option>{uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
              <div className="fee-input-group" style={{ marginBottom: 0 }}><label>Scholar Type</label><div className="fee-input-wrapper"><select style={{ padding: '0.5rem' }} value={feeFilters.scholarType} onChange={e => setFeeFilters({...feeFilters, scholarType: e.target.value})}><option value="">All Types</option><option value="Day">Day</option><option value="Boarding">Boarding</option></select></div></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button onClick={() => setFeeFilters({ status: '', class: '', scholarType: '' })} style={{ width: '100%', padding: '0.6rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Clear Filters</button></div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="table-container desktop-only">
            <table className="system-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead><tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Class</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Expected</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Paid</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Balance</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>{filtered.map((stu, i) => {
                const td = getTermData(stu);
                return (
                <tr key={i} className="table-row-hover" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  <td style={{ padding: '1rem', borderRadius: '10px 0 0 10px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(215,185,0,0.1)', color: '#d7b900', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{stu.name.charAt(0)}</div><div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stu.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.id} • {stu.scholarType}</div></div></div></td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{stu.class}</td>
                  <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: statusBg(td.status), color: statusColor(td.status) }}>{td.status}</span></td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MK {td.expected.toLocaleString()}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>MK {td.paid.toLocaleString()}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: td.balance > 0 ? '#ef4444' : '#10b981' }}>MK {td.balance.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => fetchStudentAccount(stu.dbId)} title="View Account" style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}><Eye size={16} /></button>
                      <button onClick={() => { setSelectedReceipt({ ...stu, termData: getTermData(stu) }); setIsReceiptModalOpen(true); }} title="Receipt" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              )})}</tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-only student-fees-deck">
            {filtered.map((stu, i) => {
              const td = getTermData(stu);
              return (
                <div key={i} className="glass-panel student-fee-mobile-card">
                  {/* Card Top: Student Profile */}
                  <div className="mobile-card-header">
                    <div className="mobile-card-avatar">
                      {stu.name.charAt(0)}
                    </div>
                    <div className="mobile-card-student-info">
                      <div className="student-mobile-name">{stu.name}</div>
                      <div className="student-mobile-meta">{stu.id} &bull; <span className="scholar-type-label">{stu.scholarType}</span></div>
                    </div>
                    <div className="mobile-card-class-badge">
                      {stu.class}
                    </div>
                  </div>

                  {/* Card Middle: Term status and grid values */}
                  <div className="mobile-card-status-row">
                    <span className="term-view-label">Term Status:</span>
                    <span className="mobile-status-badge" style={{ background: statusBg(td.status), color: statusColor(td.status) }}>
                      {td.status}
                    </span>
                  </div>

                  <div className="mobile-card-details-grid">
                    <div className="detail-grid-item">
                      <span className="grid-item-label">Expected</span>
                      <span className="grid-item-val text-muted">MK {td.expected.toLocaleString()}</span>
                    </div>
                    <div className="detail-grid-item">
                      <span className="grid-item-label">Paid</span>
                      <span className="grid-item-val text-success">MK {td.paid.toLocaleString()}</span>
                    </div>
                    <div className="detail-grid-item">
                      <span className="grid-item-label">Balance</span>
                      <span className="grid-item-val" style={{ color: td.balance > 0 ? '#ef4444' : '#10b981' }}>MK {td.balance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mobile-card-actions">
                    <button onClick={() => fetchStudentAccount(stu.dbId)} className="mobile-action-btn view-account-btn">
                      <Eye size={16} /> Student Ledger
                    </button>
                    <button onClick={() => { setSelectedReceipt({ ...stu, termData: getTermData(stu) }); setIsReceiptModalOpen(true); }} className="mobile-action-btn view-receipt-btn">
                      <Download size={16} /> Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderReceiptModal = () => {
    if (!selectedReceipt) return null;
    return (
      <div className="modal-overlay" onClick={() => setIsReceiptModalOpen(false)}>
        <div id="receipt-card-modal" className="modal-content glass-panel" style={{ width: '95%', maxWidth: '600px', padding: '2.5rem', borderRadius: '32px', position: 'relative', border: '2px solid rgba(215,185,0,0.3)', background: 'linear-gradient(135deg, #1e1e22 0%, #121214 100%)' }} onClick={e => e.stopPropagation()}>
          <div className="no-print" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => window.print()} style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Print Receipt</button>
            <button onClick={() => setIsReceiptModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#d7b900', fontWeight: 700, letterSpacing: '2px', marginBottom: '0.25rem' }}>ALPHABET SMIS</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to bottom, #ffffff, #d1d5db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HEROES ACADEMY</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '1px' }}>OFFICIAL FEE STATEMENT</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>STUDENT NAME</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedReceipt.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>STUDENT ID</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedReceipt.id}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CLASS / FORM</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedReceipt.class}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SCHOLAR TYPE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedReceipt.scholarType}</div>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Fees Paid</span>
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.2rem' }}>{selectedReceipt.amountPaid}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Outstanding Balance</span>
              <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1.2rem' }}>{selectedReceipt.balance}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '150px', height: '1px', background: 'var(--text-muted)', marginBottom: '0.5rem' }}></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accountant Signature</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Issued Date</div>
              <div style={{ fontWeight: 600 }}>{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.1, fontSize: '4rem', fontWeight: 900, pointerEvents: 'none', color: '#d7b900' }}>PAID</div>
        </div>
      </div>
    );
  };

  const renderExpenses = () => (
    <div className="animate-fade">
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}><h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Expense Records</h3><button className="btn btn-primary" onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}><Plus size={18} /> New Expense</button></div>
        
        {/* Desktop Table */}
        <div className="table-container desktop-only">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead><tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>ID</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Category</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Description</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Amount</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th><th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Date</th><th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{expenses.map((exp, i) => (
              <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <td style={{ padding: '1rem', borderRadius: '10px 0 0 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>#{exp.id}</td>
                <td style={{ padding: '1rem' }}><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.category}</div></td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{exp.description}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 700, color: '#ef4444' }}>MK {exp.amount.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>{exp.status === 'COMPLETED' ? <CheckCircle2 size={16} color="#10b981" /> : <Clock size={16} color="#f59e0b" />}<span style={{ color: exp.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontWeight: 500 }}>{exp.status}</span></div></td>
                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(exp.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 10px 10px 0' }}><div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {exp.attachmentUrl && <a href={`${import.meta.env.VITE_API_URL}${exp.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ color: '#3b82f6' }}><Download size={18} /></a>}
                  {exp.status === 'PENDING' && <button onClick={() => { setEditingExpense(exp); setExpenseForm({ category: exp.category, description: exp.description, amount: exp.amount.toString(), status: exp.status, date: new Date(exp.date).toISOString().split('T')[0] }); setIsExpenseModalOpen(true); }} className="btn-icon" style={{ color: '#ffc107', background: 'none', border: 'none', cursor: 'pointer' }}><Settings size={18} /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-only expenses-deck">
          {expenses.map((exp, i) => (
            <div key={i} className="glass-panel expense-mobile-card">
              <div className="expense-mobile-header">
                <div className="expense-mobile-meta">
                  <span className="expense-id-badge">#{exp.id}</span>
                  <span className="expense-category-tag">{exp.category}</span>
                </div>
                <div className="expense-mobile-amount">
                  MK {exp.amount.toLocaleString()}
                </div>
              </div>
              <div className="expense-mobile-desc">
                {exp.description}
              </div>
              <div className="expense-mobile-footer">
                <div className="expense-mobile-left">
                  <span className="expense-mobile-date">{new Date(exp.date).toLocaleDateString()}</span>
                  <div className="expense-status-badge">
                    {exp.status === 'COMPLETED' ? <CheckCircle2 size={14} color="#10b981" /> : <Clock size={14} color="#f59e0b" />}
                    <span style={{ color: exp.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>{exp.status}</span>
                  </div>
                </div>
                <div className="expense-mobile-actions">
                  {exp.attachmentUrl && (
                    <a href={`${import.meta.env.VITE_API_URL}${exp.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="mobile-expense-act-btn doc-btn">
                      <Download size={14} /> Doc
                    </a>
                  )}
                  {exp.status === 'PENDING' && (
                    <button onClick={() => { setEditingExpense(exp); setExpenseForm({ category: exp.category, description: exp.description, amount: exp.amount.toString(), status: exp.status, date: new Date(exp.date).toISOString().split('T')[0] }); setIsExpenseModalOpen(true); }} className="mobile-expense-act-btn edit-btn">
                      <Settings size={14} /> Edit
                    </button>
                  )}
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
      <div className="header-stack" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #ffffff, var(--silver-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Finance Management</h1><p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>Monitor cash flow, manage student fee payments, and track school expenditures in one centralized portal.</p></div>
        <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={activeTab === 'fees' ? handleExportFilteredFees : handleExportCSV} disabled={isExporting} className="btn-icon header-action" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.6rem', borderRadius: '10px', color: 'var(--text-light)', cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.7 : 1 }}>{isExporting ? <Loader size={18} className="spin" /> : <Download size={18} />}</button>
          <button className="btn btn-primary" onClick={() => setIsConfigModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,193,7,0.1)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.2)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}><Settings size={18} /> Configure Fees</button>
          <button onClick={activeTab === 'fees' ? handleExportFilteredFees : handleExportCSV} disabled={isExporting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 600, cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.8 : 1 }}>
            {isExporting ? <Loader size={18} className="spin" /> : (activeTab === 'fees' ? <Users size={18} /> : <TrendingUp size={18} />)}
            {isExporting ? 'Generating...' : (activeTab === 'fees' ? 'Export Fees List' : 'Generate Report')}
          </button>
        </div>
      </div>
      <div className="scrollable-tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[{ id: 'overview', label: 'Overview', icon: <PieChartIcon size={18} /> }, { id: 'fees', label: 'Fee Collection', icon: <Users size={18} /> }, { id: 'expenses', label: 'Expenses', icon: <TrendingDown size={18} /> }, { id: 'reports', label: 'Financial Reports', icon: <TrendingUp size={18} /> }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === tab.id ? '#3b82f6' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}>{tab.icon}{tab.label}{activeTab === tab.id && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', background: '#3b82f6' }}></div>}</button>
        ))}
      </div>
      <div className="tab-content" style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'fees' && renderFeeCollection()}
        {activeTab === 'expenses' && renderExpenses()}
        {activeTab === 'reports' && renderReports()}
      </div>

      {isReceiptModalOpen && renderReceiptModal()}

      <style>{`
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .table-row-hover:hover { background: rgba(59, 130, 246, 0.08) !important; transition: all 0.2s ease; }
        .search-bar { display: flex; align-items: center; padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); color: var(--text-light); }
        .search-bar input { background: none; border: none; color: inherit; margin-left: 0.75rem; width: 100%; outline: none; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr !important; } }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { width: 90%; max-width: 500px; animation: modalSlideUp 0.3s ease-out; background: var(--bg-darker); border: 1px solid var(--glass-border); }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fee-input-group { margin-bottom: 1.25rem; }
        .fee-input-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
        .fee-input-wrapper { display: flex; align-items: center; background: rgba(128,128,128,0.05); border: 1px solid var(--glass-border); padding: 0 0.75rem; border-radius: 10px; }
        .fee-input-wrapper input, .fee-input-wrapper select { background: none; border: none; color: inherit; padding: 0.75rem; width: 100%; outline: none; font-weight: 500; }
        
        /* Mobile vs Desktop Display Rules */
        .mobile-only { display: none !important; }
        .desktop-only { display: block !important; }

        @media (max-width: 768px) {
          .mobile-only { display: block !important; }
          .desktop-only { display: none !important; }

          /* Header panel vertical stacking */
          .header-stack {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1.5rem !important;
          }
          .header-stack h1 {
            font-size: 1.7rem !important;
            text-align: center;
          }
          .header-stack p {
            text-align: center;
            font-size: 0.85rem;
          }
          .action-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem !important;
          }
          .action-buttons button, .action-buttons a {
            width: 100%;
            justify-content: center;
            padding: 0.8rem 1.2rem !important;
            border-radius: 12px !important;
            font-size: 0.9rem !important;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .header-action {
            order: 4; /* Pushes the export button to the end of the mobile action buttons */
          }

          /* Scrollable tabs visually modern horizontal slider */
          .scrollable-tabs {
            padding-bottom: 0.75rem !important;
            margin-bottom: 1.5rem !important;
            -webkit-overflow-scrolling: touch;
          }
          .scrollable-tabs::-webkit-scrollbar {
            height: 4px;
          }
          .scrollable-tabs::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 2px;
          }

          /* Fee collection toolbar controls stack */
          .fee-toolbar-panel {
            flex-direction: column;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          .fee-toolbar-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            width: 100%;
          }
          .fee-toolbar-actions button {
            width: 100%;
            justify-content: center;
            padding: 0.7rem !important;
            border-radius: 10px !important;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          /* Fee Filtering Drawer Grid */
          .fee-filter-drawer {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
            padding: 0.85rem !important;
          }

          /* Student Fees Mobile Cards */
          .student-fees-deck {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
          }
          .student-fee-mobile-card {
            padding: 1.25rem;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
          }
          .mobile-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            padding-bottom: 0.75rem;
          }
          .mobile-card-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(215, 185, 0, 0.1);
            color: #d7b900;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
          }
          .mobile-card-student-info {
            flex: 1;
          }
          .student-mobile-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-light);
          }
          .student-mobile-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.1rem;
          }
          .scholar-type-label {
            color: #3b82f6;
            font-weight: 600;
          }
          .mobile-card-class-badge {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            padding: 0.15rem 0.45rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--silver-light);
          }
          .mobile-card-status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
          }
          .term-view-label {
            color: var(--text-muted);
          }
          .mobile-status-badge {
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
          }
          .mobile-card-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.01);
            padding: 0.6rem;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.03);
          }
          .detail-grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .grid-item-label {
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-bottom: 0.15rem;
          }
          .grid-item-val {
            font-size: 0.8rem;
            font-weight: 700;
          }
          .text-success {
            color: #10b981;
          }
          .mobile-card-actions {
            display: flex;
            gap: 0.5rem;
          }
          .mobile-action-btn {
            flex: 1;
            padding: 0.55rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            cursor: pointer;
            border: none;
          }
          .view-account-btn {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.15);
          }
          .view-receipt-btn {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-light);
            border: 1px solid var(--glass-border);
          }

          /* Expenses Mobile Deck & Cards */
          .expenses-deck {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            margin-top: 1rem;
          }
          .expense-mobile-card {
            padding: 1.1rem;
            border-radius: 14px;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--glass-border);
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .expense-mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .expense-mobile-meta {
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          .expense-id-badge {
            font-size: 0.7rem;
            color: var(--text-muted);
            background: rgba(255,255,255,0.05);
            padding: 0.15rem 0.35rem;
            border-radius: 4px;
          }
          .expense-category-tag {
            font-size: 0.75rem;
            font-weight: 700;
            color: #f59e0b;
          }
          .expense-mobile-amount {
            font-size: 0.95rem;
            font-weight: 800;
            color: #ef4444;
          }
          .expense-mobile-desc {
            font-size: 0.8rem;
            color: var(--text-muted);
            line-height: 1.3;
          }
          .expense-mobile-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            padding-top: 0.6rem;
            margin-top: 0.2rem;
          }
          .expense-mobile-left {
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          .expense-mobile-date {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
          .expense-status-badge {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .expense-mobile-actions {
            display: flex;
            gap: 0.4rem;
          }
          .mobile-expense-act-btn {
            padding: 0.3rem 0.5rem;
            border-radius: 5px;
            font-size: 0.75rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.2rem;
            cursor: pointer;
            text-decoration: none;
            border: none;
          }
          .doc-btn {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.12);
          }
          .edit-btn {
            background: rgba(255, 193, 7, 0.1);
            color: #ffc107;
            border: 1px solid rgba(255, 193, 7, 0.12);
          }
        }

        @media print {
          body * { visibility: hidden; }
          #receipt-card-modal, #receipt-card-modal * { visibility: visible; }
          #receipt-card-modal { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: auto; 
            background: white !important; 
            color: black !important; 
            padding: 2rem !important; 
            box-shadow: none !important;
            border: 2px solid #000 !important;
            border-radius: 0 !important;
          }
          #receipt-card-modal h1 { color: black !important; -webkit-text-fill-color: black !important; }
          #receipt-card-modal .no-print { display: none !important; }
        }
      `}</style>

      {isConfigModalOpen && (
        <div className="modal-overlay" onClick={() => setIsConfigModalOpen(false)}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}><h2>Configure Fees</h2><button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={22} /></button></div>
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', display: 'inline-block' }}>Term {activeTerm} — Current</div>
            <div className="fee-input-group"><label>Day Scholar Fee (per term)</label><div className="fee-input-wrapper"><span>MK</span><input value={dayScholarFee} onChange={e => setDayScholarFee(e.target.value)} /></div></div>
            <div className="fee-input-group"><label>Boarding Fee (per term)</label><div className="fee-input-wrapper"><span>MK</span><input value={boardingScholarFee} onChange={e => setBoardingScholarFee(e.target.value)} /></div></div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>These fees apply to Term {activeTerm}. Each term can have different fee amounts.</p>
            <button onClick={handleSaveFees} className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600 }}>Save Term {activeTerm} Fees</button>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h2>Record Collection</h2><button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={22} /></button></div>
            <form onSubmit={handleRecordPayment}>
              <div className="fee-input-group"><label>Search Student</label><div className="fee-input-wrapper"><Search size={16} /><input placeholder="Type name..." value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : searchStudentQuery} onChange={e => { setSearchStudentQuery(e.target.value); setSelectedStudent(null); }} /></div>
                {dbStudents.length > 0 && !selectedStudent && <div style={{ background: '#1e1e22', borderRadius: '8px', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>{dbStudents.map(s => <div key={s.id} onClick={() => setSelectedStudent(s)} style={{ padding: '0.75rem', cursor: 'pointer' }} className="table-row-hover">{s.firstName} {s.lastName} ({s.student_id})</div>)}</div>}
              </div>
              <div className="fee-input-group"><label>Payment Term</label><div className="fee-input-wrapper"><select value={paymentTerm} onChange={e => setPaymentTerm(parseInt(e.target.value))}><option value={1}>Term 1</option><option value={2}>Term 2</option><option value={3}>Term 3</option></select></div></div>
              <div className="fee-input-group"><label>Amount</label><div className="fee-input-wrapper"><span>MK</span><input value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required /></div></div>
              <div className="fee-input-group"><label>Collection Date</label><div className="fee-input-wrapper"><input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required /></div></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>{isSavingPayment ? 'Processing...' : 'Record Payment'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Student Account Modal */}
      {isAccountModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAccountModalOpen(false)}>
          <div className="modal-content glass-panel" style={{ width: '95%', maxWidth: '700px', padding: '2rem', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {isLoadingAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}><Loader size={28} className="spin" style={{ color: '#3b82f6' }} /><p style={{ color: 'var(--text-muted)' }}>Loading student account...</p></div>
            ) : studentAccountData ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{studentAccountData.student.name}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentAccountData.student.studentId} • {studentAccountData.student.class} • {studentAccountData.student.scholarType}</div>
                  </div>
                  <button onClick={() => setIsAccountModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={22} /></button>
                </div>

                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', display: 'inline-block' }}>Academic Year {studentAccountData.academicYear}</div>

                {/* Per-Term Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {studentAccountData.terms.map((t: any) => {
                    const pct = t.expectedFee > 0 ? Math.min(100, Math.round((t.effectivePaid / t.expectedFee) * 100)) : 0;
                    return (
                      <div key={t.term} style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.term === studentAccountData.activeTerm ? 'rgba(59,130,246,0.3)' : 'var(--glass-border)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Term {t.term}</span>
                            {t.term === studentAccountData.activeTerm && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 600 }}>Current</span>}
                          </div>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: statusBg(t.status), color: statusColor(t.status) }}>{t.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Expected</div><div style={{ fontWeight: 600, fontSize: '0.95rem' }}>MK {t.expectedFee.toLocaleString()}</div></div>
                          <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Paid</div><div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#10b981' }}>MK {t.effectivePaid.toLocaleString()}</div></div>
                          <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{t.balance > 0 ? 'Balance' : 'Overpaid'}</div><div style={{ fontWeight: 600, fontSize: '0.95rem', color: t.balance > 0 ? '#ef4444' : '#3b82f6' }}>MK {(t.balance > 0 ? t.balance : t.overpaid).toLocaleString()}</div></div>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: t.payments.length > 0 ? '0.75rem' : 0 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#ef4444', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
                        </div>
                        {/* Payments list */}
                        {t.payments.length > 0 && (
                          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PAYMENTS</div>
                            {t.payments.map((p: any) => (
                              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString()} • {p.method}</span>
                                <span style={{ fontWeight: 600, color: '#10b981' }}>MK {p.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Annual Summary */}
                <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>Annual Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Expected</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>MK {studentAccountData.annualSummary.totalExpected.toLocaleString()}</div></div>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Paid</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>MK {studentAccountData.annualSummary.totalPaid.toLocaleString()}</div></div>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance</div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444' }}>MK {studentAccountData.annualSummary.totalBalance.toLocaleString()}</div></div>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div><div><span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: statusBg(studentAccountData.annualSummary.status), color: statusColor(studentAccountData.annualSummary.status) }}>{studentAccountData.annualSummary.status}</span></div></div>
                  </div>
                </div>
              </>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data available</p>}
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-content glass-panel" style={{ padding: '2rem', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h2>{editingExpense ? 'Edit Expense' : 'Record Expense'}</h2><button onClick={() => setIsExpenseModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button></div>
            <form onSubmit={handleRecordExpense}>
              <div className="fee-input-group"><label>Category</label><div className="fee-input-wrapper"><select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}><option value="Salaries">Salaries</option><option value="Utilities">Utilities</option><option value="Maintenance">Maintenance</option><option value="Supplies">Supplies</option><option value="Food">Food & Boarding</option><option value="Other">Other</option></select></div></div>
              
              {expenseForm.category === 'Salaries' && (
                <div className="fee-input-group"><label>Paid To (Teacher)</label><div className="fee-input-wrapper"><select onChange={e => { const t = teachers.find(t => t.id === parseInt(e.target.value)); if (t) setExpenseForm({...expenseForm, description: `Salary: ${t.firstName} ${t.lastName} (${t.teacher_id})`}); }}><option value="">Select Teacher...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.teacher_id})</option>)}</select></div></div>
              )}

              <div className="fee-input-group"><label>Description</label><div className="fee-input-wrapper"><input placeholder="Description..." value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} required /></div></div>
              <div className="fee-input-group"><label>Amount (MK)</label><div className="fee-input-wrapper"><input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required /></div></div>
              <div className="fee-input-group"><label>Expense Date</label><div className="fee-input-wrapper"><input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} required /></div></div>
              <div className="fee-input-group"><label>Status</label><div className="fee-input-wrapper"><select value={expenseForm.status} onChange={e => setExpenseForm({...expenseForm, status: e.target.value})}><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option></select></div></div>
              <div className="fee-input-group"><label>Attachment (Max 500KB)</label><div className="fee-input-wrapper"><Paperclip size={16} /><input type="file" onChange={e => setExpenseFile(e.target.files?.[0] || null)} /></div></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>{editingExpense ? 'Update Expense' : 'Save Expense'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
