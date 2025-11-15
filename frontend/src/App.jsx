import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import RegisterAdmin from "./pages/Register/RegisterAdmin";
import RegisterTeacher from "./pages/Register/RegisterTeacher";
import RegisterStudent from "./pages/Register/RegisterStudent";
import Login from "./pages/Login";
import AdminProfile from "./pages/profiles/AdminProfile";
import TeacherProfile from "./pages/profiles/TeacherProfile";
import StudentProfile from "./pages/profiles/StudentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Registration routes */}
          <Route path="/register/admin" element={<RegisterAdmin />} />
          <Route path="/register/teacher" element={<RegisterTeacher />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          
          {/* Login route */}
          <Route path="/login/:role" element={<Login />} />

          {/*Profile Routes*/}
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
