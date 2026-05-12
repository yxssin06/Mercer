import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientAuthProvider } from './context/PatientAuthContext';
import { PhysicianAuthProvider } from './context/PhysicianAuthContext';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { PatientBookingPage } from './pages/PatientBookingPage';
import { PatientLandingPage } from './pages/PatientLandingPage';
import { PatientRegisterPage } from './pages/PatientRegisterPage';
import { PatientSignInPage } from './pages/PatientSignInPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { PatientReschedulePage } from './pages/PatientReschedulePage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { AdminPage } from './pages/AdminPage';
import { PhysicianLoginPage } from './pages/PhysicianLoginPage';
import { PhysicianDashboardPage } from './pages/PhysicianDashboardPage';
import { PhysicianBioPage } from './pages/PhysicianBioPage';
import './index.css';

function AdminGuard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminPage /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PatientAuthProvider>
          <PhysicianAuthProvider>
            <BookingProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/"                           element={<HomePage />} />
                  <Route path="/patient"                    element={<PatientLandingPage />} />
                  <Route path="/patient/register"           element={<PatientRegisterPage />} />
                  <Route path="/patient/signin"             element={<PatientSignInPage />} />
                  <Route path="/patient/dashboard"          element={<PatientDashboardPage />} />
                  <Route path="/patient/reschedule/:id"     element={<PatientReschedulePage />} />
                  <Route path="/patient/profile"            element={<PatientProfilePage />} />
                  <Route path="/physicians/:id"             element={<PhysicianBioPage />} />
                  <Route path="/book"                       element={<PatientBookingPage />} />
                  <Route path="/physician/login"            element={<PhysicianLoginPage />} />
                  <Route path="/physician/dashboard"        element={<PhysicianDashboardPage />} />
                  <Route path="/admin/login"                element={<AdminLoginPage />} />
                  <Route path="/admin"                      element={<AdminGuard />} />
                  <Route path="*"                           element={<Navigate to="/" replace />} />
                </Routes>
              </ToastProvider>
            </BookingProvider>
          </PhysicianAuthProvider>
        </PatientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
