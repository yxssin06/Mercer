import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [barWidth, setBarWidth] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;

    setBarVisible(true);
    setBarWidth(0);
    const t1 = setTimeout(() => setBarWidth(80), 20);
    const t2 = setTimeout(() => {
      setBarWidth(100);
    }, 500);
    const t3 = setTimeout(() => {
      setDisplayLocation(location);
      setEntering(true);
      setTimeout(() => setEntering(false), 250);
      setBarVisible(false);
      setBarWidth(0);
    }, 650);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  const routes = (
    <Routes location={displayLocation}>
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
  );

  return (
    <>
      <div
        className="nav-bar"
        style={{
          width: `${barWidth}%`,
          opacity: barVisible ? 1 : 0,
          transition: barVisible
            ? 'width 0.55s cubic-bezier(0.1, 0.05, 0.0, 1), opacity 0.1s'
            : 'opacity 0.3s',
        }}
      />
      <div className={entering ? 'page-enter' : ''}>
        {routes}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PatientAuthProvider>
          <PhysicianAuthProvider>
            <BookingProvider>
              <ToastProvider>
                <AnimatedRoutes />
              </ToastProvider>
            </BookingProvider>
          </PhysicianAuthProvider>
        </PatientAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
