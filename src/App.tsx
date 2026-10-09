import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { useStore } from '@/store/AppStore';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { homePathFor } from '@/lib/mock-auth';
import type { Role } from '@/types';

import ParentLayout from '@/layouts/ParentLayout';
import ChildLayout from '@/layouts/ChildLayout';
import TeacherLayout from '@/layouts/TeacherLayout';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProfilePage from '@/features/profile/ProfilePage';
import ParentLessonsPage from '@/features/lessons/ParentLessonsPage';
import ReportsPage from '@/features/reports/ReportsPage';
import ObservationsPage from '@/features/observations/ObservationsPage';
import MarketplacePage from '@/features/marketplace/MarketplacePage';
import SettingsPage from '@/features/settings/SettingsPage';
import ChildHome from '@/features/child/ChildHome';
import LessonPlayer from '@/features/lessons/LessonPlayer';
import GamePage from '@/features/games/GamePage';
import TeacherDashboard from '@/features/teacher/TeacherDashboard';
import TeacherRequests from '@/features/teacher/TeacherRequests';
import TeacherRequestDetail from '@/features/teacher/TeacherRequestDetail';
import TeacherProfile from '@/features/teacher/TeacherProfile';
import NotFound from '@/features/NotFound';

/** Mock frontend route guard — controls the simulated experience only, not real security. */
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, childMode } = useStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;
  if (role === 'parent' && childMode.active) return <Navigate to="/child" replace />;
  return <>{children}</>;
}

function RequireChildMode({ children }: { children: ReactNode }) {
  const { user, childMode, enterChildMode, selectedChild } = useStore();
  // Direct navigation to /child starts child mode once (on mount). Leaving via the PIN must not re-enter it.
  useEffect(() => {
    if (user?.role === 'parent' && !childMode.active) enterChildMode(selectedChild.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'parent') return <Navigate to={homePathFor(user.role)} replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, childMode } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'parent' && childMode.active) return <Navigate to="/child" replace />;
  return <Navigate to={homePathFor(user.role)} replace />;
}

export default function App() {
  const reduce = useReduceMotion();
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduce);
  }, [reduce]);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/parent"
          element={
            <RequireRole role="parent">
              <ParentLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="lessons" element={<ParentLessonsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="observations" element={<ObservationsPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/child"
          element={
            <RequireChildMode>
              <ChildLayout />
            </RequireChildMode>
          }
        >
          <Route index element={<ChildHome />} />
          <Route path="lesson/:slug" element={<LessonPlayer />} />
          <Route path="game/:slug" element={<GamePage />} />
        </Route>

        <Route
          path="/teacher"
          element={
            <RequireRole role="specialist">
              <TeacherLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="requests" element={<TeacherRequests />} />
          <Route path="requests/:id" element={<TeacherRequestDetail />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MotionConfig>
  );
}
