import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Layout } from '@/shared/components';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { WorkoutListPage } from '@/features/workout/pages/WorkoutListPage';
import { WorkoutFormPage } from '@/features/workout/pages/WorkoutFormPage';
import { WorkoutDetailPage } from '@/features/workout/pages/WorkoutDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workouts" element={<WorkoutListPage />} />
        <Route path="/workouts/new" element={<WorkoutFormPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
