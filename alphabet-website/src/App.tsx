import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Apply from './pages/Apply';
import ExamResults from './pages/ExamResults';
import ExploreCampus from './pages/ExploreCampus';
import ExploreCampusDetail from './pages/ExploreCampusDetail';
import CampusGallery from './pages/CampusGallery';
import PublicStudentReport from './pages/PublicStudentReport';
import PublicStudentHistory from './pages/PublicStudentHistory';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
