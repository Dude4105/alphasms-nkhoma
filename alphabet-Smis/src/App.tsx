import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Apply from './pages/Apply';
import ExamResults from './pages/ExamResults';
import Login from './pages/Login';
import ExploreCampus from './pages/ExploreCampus';
import ExploreCampusDetail from './pages/ExploreCampusDetail';
import CampusGallery from './pages/CampusGallery';
import TeacherLayout from './layouts/TeacherLayout';
import Dashboard from './pages/teacher/Dashboard';
import Classes from './pages/teacher/Classes';
import ClassRoster from './pages/teacher/ClassRoster';
import Grades from './pages/teacher/Grades';
import MainClass from './pages/teacher/MainClass';
import FinalResults from './pages/teacher/FinalResults';
import SubjectResults from './pages/teacher/SubjectResults';
import StudentReport from './pages/teacher/StudentReport';
import PublicStudentReport from './pages/PublicStudentReport';
import PublicStudentHistory from './pages/PublicStudentHistory';
import AttendanceTracker from './pages/teacher/AttendanceTracker';
import AttendanceOverview from './pages/teacher/AttendanceOverview';
import AddClassStudent from './pages/teacher/AddClassStudent';
import InTermResults from './pages/teacher/InTermResults';
import Profile from './pages/teacher/Profile';
import TeacherViewTimetable from './pages/teacher/ViewTimetable';
import ClassMigration from './pages/teacher/ClassMigration';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import AdminClasses from './pages/admin/AdminClasses';
import Enrollment from './pages/admin/Enrollment';
import ClassDetail from './pages/admin/ClassDetail';
import CreateClass from './pages/admin/CreateClass';
import Subjects from './pages/admin/Subjects';
import AddTeacher from './pages/admin/AddTeacher';
import AddStudent from './pages/admin/AddStudent';
import StudentDetail from './pages/admin/StudentDetail';
import StudentHistory from './pages/admin/StudentHistory';
import TeacherDetail from './pages/admin/TeacherDetail';
import EditTeacher from './pages/admin/EditTeacher';
import CreateTimetable from './pages/admin/CreateTimetable';
import ViewTimetable from './pages/admin/ViewTimetable';
import Finance from './pages/admin/Finance';
import Boarding from './pages/admin/Boarding';
import EditStudent from './pages/admin/EditStudent';
import EditClass from './pages/admin/EditClass';
import Settings from './pages/admin/Settings';
import AdminDetail from './pages/admin/AdminDetail';
import AdminProfile from './pages/admin/Profile';
import PasswordResets from './pages/admin/PasswordResets';
import SchoolFeeds from './pages/admin/SchoolFeeds';
import SchoolFeedForm from './pages/admin/SchoolFeedForm';
import SchoolGallery from './pages/admin/SchoolGallery';
import SchoolGalleryForm from './pages/admin/SchoolGalleryForm';
import './App.css';

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
    </Router>
  );
}

export default App;
