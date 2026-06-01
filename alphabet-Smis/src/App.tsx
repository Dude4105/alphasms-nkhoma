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
const Login = lazy(() => import('./pages/Login'));
const PublicStudentReport = lazy(() => import('./pages/PublicStudentReport'));
const PublicStudentHistory = lazy(() => import('./pages/PublicStudentHistory'));

// Teacher Layout & Pages
const TeacherLayout = lazy(() => import('./layouts/TeacherLayout'));
const Dashboard = lazy(() => import('./pages/teacher/Dashboard'));
const Classes = lazy(() => import('./pages/teacher/Classes'));
const ClassRoster = lazy(() => import('./pages/teacher/ClassRoster'));
const ClassMigration = lazy(() => import('./pages/teacher/ClassMigration'));
const InTermResults = lazy(() => import('./pages/teacher/InTermResults'));
const TeacherViewTimetable = lazy(() => import('./pages/teacher/ViewTimetable'));
const Grades = lazy(() => import('./pages/teacher/Grades'));
const MainClass = lazy(() => import('./pages/teacher/MainClass'));
const AddClassStudent = lazy(() => import('./pages/teacher/AddClassStudent'));
const FinalResults = lazy(() => import('./pages/teacher/FinalResults'));
const SubjectResults = lazy(() => import('./pages/teacher/SubjectResults'));
const StudentReport = lazy(() => import('./pages/teacher/StudentReport'));
const AttendanceTracker = lazy(() => import('./pages/teacher/AttendanceTracker'));
const AttendanceOverview = lazy(() => import('./pages/teacher/AttendanceOverview'));
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'));
const StudentHistory = lazy(() => import('./pages/admin/StudentHistory'));
const Profile = lazy(() => import('./pages/teacher/Profile'));

// Admin Layout & Pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Students = lazy(() => import('./pages/admin/Students'));
const AddStudent = lazy(() => import('./pages/admin/AddStudent'));
const EditStudent = lazy(() => import('./pages/admin/EditStudent'));
const Teachers = lazy(() => import('./pages/admin/Teachers'));
const AddTeacher = lazy(() => import('./pages/admin/AddTeacher'));
const TeacherDetail = lazy(() => import('./pages/admin/TeacherDetail'));
const EditTeacher = lazy(() => import('./pages/admin/EditTeacher'));
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses'));
const CreateClass = lazy(() => import('./pages/admin/CreateClass'));
const ClassDetail = lazy(() => import('./pages/admin/ClassDetail'));
const EditClass = lazy(() => import('./pages/admin/EditClass'));
const ViewTimetable = lazy(() => import('./pages/admin/ViewTimetable'));
const CreateTimetable = lazy(() => import('./pages/admin/CreateTimetable'));
const Subjects = lazy(() => import('./pages/admin/Subjects'));
const Enrollment = lazy(() => import('./pages/admin/Enrollment'));
const Finance = lazy(() => import('./pages/admin/Finance'));
const Boarding = lazy(() => import('./pages/admin/Boarding'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminDetail = lazy(() => import('./pages/admin/AdminDetail'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const PasswordResets = lazy(() => import('./pages/admin/PasswordResets'));
const SchoolFeeds = lazy(() => import('./pages/admin/SchoolFeeds'));
const SchoolFeedForm = lazy(() => import('./pages/admin/SchoolFeedForm'));
const SchoolGallery = lazy(() => import('./pages/admin/SchoolGallery'));
const SchoolGalleryForm = lazy(() => import('./pages/admin/SchoolGalleryForm'));

// Session management for "Remember Me"
const token = localStorage.getItem('accessToken');
if (token) {
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  const sessionActive = sessionStorage.getItem('sessionActive') === 'true';
  
  if (!rememberMe && !sessionActive) {
    // This is a new browser session, and user didn't select "Remember Me".
    // Clear storage to force login.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  } else {
    // Mark session as active so refreshing doesn't log the user out
    sessionStorage.setItem('sessionActive', 'true');
  }
}

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
          <Route path="/login" element={<Login />} />
          <Route path="/reports/:studentId" element={<PublicStudentReport />} />
          <Route path="/students/:studentId/history" element={<PublicStudentHistory />} />
          
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassRoster />} />
            <Route path="classes/:classId/migrate" element={<ClassMigration />} />
            <Route path="classes/:classId/in-term-results" element={<InTermResults />} />
            <Route path="classes/:classId/timetable" element={<TeacherViewTimetable />} />
            <Route path="grades" element={<Grades />} />
            <Route path="main-class" element={<MainClass />} />
            <Route path="main-class/add-student" element={<AddClassStudent />} />
            <Route path="main-class/results" element={<FinalResults />} />
            <Route path="subjects/results/:classId/:subjectKey" element={<SubjectResults />} />
            <Route path="students/:studentId/report" element={<StudentReport />} />
            <Route path="classes/:classId/attendance" element={<AttendanceTracker />} />
            <Route path="attendance" element={<AttendanceOverview />} />
            <Route path="students/:studentId" element={<StudentDetail />} />
            <Route path="students/:studentId/history" element={<StudentHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/:studentId" element={<StudentDetail />} />
            <Route path="students/:studentId/history" element={<StudentHistory />} />
            <Route path="students/:studentId/edit" element={<EditStudent />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/add" element={<AddTeacher />} />
            <Route path="teachers/:teacherId" element={<TeacherDetail />} />
            <Route path="teachers/:teacherId/edit" element={<EditTeacher />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="classes/create" element={<CreateClass />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="classes/:classId/results" element={<FinalResults />} />
            <Route path="classes/:classId/edit" element={<EditClass />} />
            <Route path="subjects/results/:classId/:subjectKey" element={<SubjectResults />} />
            <Route path="classes/:classId/timetable" element={<ViewTimetable />} />
            <Route path="classes/:classId/timetable/create" element={<CreateTimetable />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="finance" element={<Finance />} />
            <Route path="boarding" element={<Boarding />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/admins/:adminId" element={<AdminDetail />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="password-resets" element={<PasswordResets />} />
            <Route path="feeds" element={<SchoolFeeds />} />
            <Route path="feeds/add" element={<SchoolFeedForm />} />
            <Route path="feeds/:id/edit" element={<SchoolFeedForm />} />
            <Route path="gallery" element={<SchoolGallery />} />
            <Route path="gallery/add" element={<SchoolGalleryForm />} />
            <Route path="gallery/:id/edit" element={<SchoolGalleryForm />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
