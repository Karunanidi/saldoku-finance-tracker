import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { AnalyticsPage } from './features/analytics/pages/AnalyticsPage';
import { ScannerPage } from './features/ocr/pages/ScannerPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { HistoryPage } from './features/transactions/pages/HistoryPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';

function App() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // Check initial session
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (only for non-logged in users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes (only for logged in users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/scan" element={<ScannerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add more protected routes here */}
        </Route>

        {/* Catch all - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
