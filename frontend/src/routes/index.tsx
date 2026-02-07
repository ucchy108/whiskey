import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { WorkoutListPage } from '@/features/workout/pages/WorkoutListPage';
import { WorkoutDetailPage } from '@/features/workout/pages/WorkoutDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes (auth guard will be added later) */}
      <Route path="/" element={<DashboardPage />} />
      <Route path="/workouts" element={<WorkoutListPage />} />
      <Route path="/workouts/:id" element={<WorkoutDetailPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
