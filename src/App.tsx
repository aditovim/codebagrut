import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RegisterTeacher from '@/pages/RegisterTeacher';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import Teacher from '@/pages/Teacher';
import BagrutArchive from '@/pages/BagrutArchive';
import Announcements from '@/pages/Announcements';
import Skills from '@/pages/Skills';
import Exam from '@/pages/Exam';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* לא מקושר משום מקום בממשק - נגיש רק למי שמקבל את הכתובת הזו ישירות */}
          <Route path="/register-teacher" element={<RegisterTeacher />} />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/practice"
            element={
              <Layout>
                <Practice />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requireRole="teacher">
                <Layout>
                  <Teacher />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive"
            element={
              <Layout>
                <BagrutArchive />
              </Layout>
            }
          />
          <Route
            path="/announcements"
            element={
              <Layout>
                <Announcements />
              </Layout>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <Layout>
                  <Skills />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <Layout>
                  <Exam />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
