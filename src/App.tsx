import { useEffect, useState, type ReactNode } from 'react';
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
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

/** Mock frontend route guard — controls the simulated experience only, not real security. */
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, childMode } = useStore();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;
  if (role === 'parent' && childMode.active) return <Navigate to="/child" replace />;
  return <>{children}</>;
}

/** Number of in-app route changes since the document loaded (0 while rendering the first URL). */
let inAppNavigations = 0;

/** True when this document was opened by browser Back/Forward rather than a link, bookmark, typed URL or reload. */
function documentOpenedFromHistory(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'back_forward';
  } catch {
    return false;
  }
}

function RequireChildMode({ children }: { children: ReactNode }) {
  const { user, childMode, enterChildMode, selectedChild } = useStore();
  const location = useLocation();
  // Opening or refreshing a /child URL directly starts child mode. Reaching /child through browser
  // history after the parent left via the PIN must NOT silently restart it (that trapped the parent
  // in child mode, since every parent route then redirected back to /child).
  // Decided once, when this guard mounts: later child-mode changes (the PIN exit) must not re-trigger it.
  const [enterOnMount] = useState(
    () => user?.role === 'parent' && !childMode.active && inAppNavigations === 0 && !documentOpenedFromHistory(),
  );

  useEffect(() => {
    if (enterOnMount) enterChildMode(selectedChild.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount by design
  }, []);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user.role !== 'parent') return <Navigate to={homePathFor(user.role)} replace />;
  if (!childMode.active && !enterOnMount) return <Navigate to="/parent/dashboard" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, childMode } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'parent' && childMode.active) return <Navigate to="/child" replace />;
  return <Navigate to={homePathFor(user.role)} replace />;
}

/** Route-level error boundary: resets automatically when the user navigates elsewhere. */
function RouteBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname} variant="app">{children}</ErrorBoundary>;
}

export default function App() {
  const reduce = useReduceMotion();
  const location = useLocation();
  useEffect(() => {
    inAppNavigations += 1;
  }, [location.key]);
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduce);
  }, [reduce]);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <RouteBoundary>
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
      </RouteBoundary>
    </MotionConfig>
  );
}
