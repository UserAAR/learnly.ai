import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpenCheck,
  ClipboardPenLine,
  FileChartColumn,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { cn } from '@/lib/cn';
import { Logo, KidAvatar } from '@/components/illustrations/Brand';
import { ChildSelector, LanguageSelector } from '@/components/navigation/Selectors';
import { DemoBadge } from '@/components/ui';

const NAV = [
  { to: '/parent/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/parent/profile', key: 'nav.profile', icon: UserRound },
  { to: '/parent/lessons', key: 'nav.lessons', icon: BookOpenCheck },
  { to: '/parent/reports', key: 'nav.reports', icon: FileChartColumn },
  { to: '/parent/observations', key: 'nav.observations', icon: ClipboardPenLine },
  { to: '/parent/marketplace', key: 'nav.marketplace', icon: UsersRound },
  { to: '/parent/settings', key: 'nav.settings', icon: Settings },
] as const;

const MOBILE_NAV = [NAV[0], NAV[2], NAV[3], NAV[5]];

export function useEnterChildMode() {
  const { enterChildMode, selectedChild } = useStore();
  const navigate = useNavigate();
  return (path = '/child', childId?: string) => {
    enterChildMode(childId ?? selectedChild.id);
    navigate(path);
  };
}

export default function ParentLayout() {
  const { user, logout, selectedChild } = useStore();
  const { t } = useLang();
  const reduce = useReduceMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const enterChild = useEnterChildMode();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh lg:pl-[272px]">
      {/* ───────────── Sidebar (desktop) ───────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col overflow-y-auto bg-navy-800 px-4 pb-5 pt-6 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cobalt-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-violet-500/20 blur-3xl" />
        </div>
        <div className="relative px-2">
          <Logo tone="light" />
          <p className="mt-1 pl-[46px] text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{t('nav.parentSpace')}</p>
        </div>
        <nav className="relative mt-8 flex flex-col gap-1" aria-label={t('nav.main')}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14.5px] font-semibold transition-colors',
                  isActive ? 'bg-white/[0.12] text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={reduce ? undefined : 'nav-active'}
                      className="absolute -left-4 top-2 bottom-2 w-1.5 rounded-r-full bg-sun-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <item.icon className={cn('size-[18px]', isActive ? 'text-sun-400' : 'text-white/55 group-hover:text-white')} />
                  {t(item.key)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative mt-auto pt-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sun-400 via-[#FFB547] to-coral-500 p-4 text-navy-900">
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/25" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <KidAvatar avatar={selectedChild.avatar} size={44} />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-navy-900/60">{t('nav.childMode')}</p>
                <p className="truncate text-sm font-extrabold">{selectedChild.name || t('profile.unnamed')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => enterChild()}
              className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-800 px-3 py-2.5 text-sm font-extrabold text-white transition-transform hover:bg-navy-700 active:scale-[0.98]"
            >
              <Sparkles className="size-4 text-sun-400" />
              {t('dashboard.enterChildMode')}
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-extrabold">{user?.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="truncate text-xs text-white/50">{user?.email}</p>
            </div>
            <button type="button" onClick={doLogout} className="grid size-9 place-items-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white" aria-label={t('nav.logout')} title={t('nav.logout')}>
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────────── Header ───────────── */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Logo size={32} label={false} />
          </div>
          <ChildSelector />
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <DemoBadge className="hidden sm:inline-flex" label={t('common.demoMode')} />
            <LanguageSelector compact />
            <button
              type="button"
              onClick={doLogout}
              className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-bold text-ink hover:bg-canvas lg:inline-flex"
            >
              <LogOut className="size-4" />
              {t('nav.logout')}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-line bg-white text-ink lg:hidden"
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
            >
              <MenuIcon className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <motion.div key={location.pathname} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
        </motion.div>
      </main>

      {/* ───────────── Bottom navigation (mobile) ───────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label={t('nav.main')}>
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold', isActive ? 'text-cobalt-600' : 'text-muted')}
            >
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-cobalt-50')}>
                    <item.icon className="size-[19px]" />
                  </span>
                  <span className="max-w-full truncate px-1">{t(`${item.key}Short`)}</span>
                </>
              )}
            </NavLink>
          ))}
          <button type="button" onClick={() => enterChild()} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-coral-600">
            <span className="grid h-7 w-12 place-items-center rounded-full bg-gradient-to-r from-sun-400 to-coral-500 text-white">
              <Sparkles className="size-[17px]" />
            </span>
            {t('nav.childModeShort')}
          </button>
        </div>
      </nav>

      {/* ───────────── Mobile menu sheet ───────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy-900/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              className="absolute inset-y-0 right-0 flex w-[min(86vw,340px)] flex-col bg-navy-800 p-5 text-white"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            >
              <div className="flex items-center justify-between">
                <Logo tone="light" size={32} />
                <button type="button" onClick={() => setMenuOpen(false)} className="grid size-10 place-items-center rounded-xl bg-white/10" aria-label={t('common.close')}>
                  <X className="size-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold', isActive ? 'bg-white/[0.12] text-white' : 'text-white/70')}
                  >
                    <item.icon className="size-[18px]" />
                    {t(item.key)}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto space-y-3">
                <DemoBadge label={t('common.demoMode')} />
                <button type="button" onClick={doLogout} className="flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
                  <LogOut className="size-4" />
                  {t('nav.logout')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
