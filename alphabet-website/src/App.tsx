import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Dynamic lazy imports for all pages to optimize bundle size and load performance
const Home = lazy(() => import('./pages/Home'));
const Apply = lazy(() => import('./pages/Apply'));
const ExamResults = lazy(() => import('./pages/ExamResults'));
const ExploreCampus = lazy(() => import('./pages/ExploreCampus'));
const ExploreCampusDetail = lazy(() => import('./pages/ExploreCampusDetail'));
const CampusGallery = lazy(() => import('./pages/CampusGallery'));
const PublicStudentReport = lazy(() => import('./pages/PublicStudentReport'));
const PublicStudentHistory = lazy(() => import('./pages/PublicStudentHistory'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: 'var(--text-muted)' }}>
          <div className="loading-spinner"></div>
          <span style={{ marginTop: '1rem', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>Loading page...</span>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/exam-results" element={<ExamResults />} />
          <Route path="/explore-campus" element={<ExploreCampus />} />
          <Route path="/explore-campus/:id" element={<ExploreCampusDetail />} />
          <Route path="/campus-gallery" element={<CampusGallery />} />
          <Route path="/reports/:studentId" element={<PublicStudentReport />} />
          <Route path="/students/:studentId/history" element={<PublicStudentHistory />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
