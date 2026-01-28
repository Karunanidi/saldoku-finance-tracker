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
import { ENV } from '@/core/config/env';

function App() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    if (!ENV.IS_VALID) {
      setLoading(false);
      return;
    }

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

  if (!ENV.IS_VALID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-red-100 text-center">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-red-500 text-6xl">warning</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Configuration Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            It looks like some environment variables are missing. Please ensure your <code className="bg-gray-100 px-1 rounded">.env</code> file is set up correctly for local development, or add the required variables in your Netlify settings.
          </p>
          <div className="pt-4 text-left space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Required variables:</p>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
              <li>VITE_GEMINI_API_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

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
