import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BadgeCheck, Inbox, LayoutGrid, LogOut, UserRoundCog } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/illustrations/Brand';
import { LanguageSelector } from '@/components/navigation/Selectors';
import { DemoBadge } from '@/components/ui';
import { DEMO_SPECIALIST_ID, getSpecialist } from '@/mocks/specialists';

const NAV = [
  { to: '/teacher/dashboard', key: 'teacher.nav.dashboard', icon: LayoutGrid },
  { to: '/teacher/requests', key: 'teacher.nav.requests', icon: Inbox },
  { to: '/teacher/profile', key: 'teacher.nav.profile', icon: UserRoundCog },
] as const;

export default function TeacherLayout() {
  const { user, logout, data } = useStore();
  const { t } = useLang();
  const reduce = useReduceMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const spec = getSpecialist(user?.role === 'specialist' ? user.specialistId : DEMO_SPECIALIST_ID);
  const pending = data.requests.filter((r) => r.specialistId === spec?.id && r.status === 'pending').length;

  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);

  return (
    <div className="min-h-dvh bg-[#F2F6F7]">
      <header className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-teal-600 to-[#0B7C8F] text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-20 right-10 size-72 rounded-full bg-turquoise-300/25 blur-3xl" />
          <svg className="absolute bottom-0 right-0 h-full opacity-15" viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0 120C80 60 160 100 240 50s120-30 160-50v120z" fill="#fff" />
          </svg>
        </div>
        <div className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <Logo tone="light" size={32} />
          <span className="hidden rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] sm:inline">{t('teacher.space')}</span>
          <div className="ml-auto flex items-center gap-2">
            <DemoBadge className="hidden bg-white md:inline-flex" label={t('common.demoMode')} />
            <LanguageSelector tone="dark" compact />
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-bold hover:bg-white/20"
              aria-label={t('nav.logout')}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
        <div className="relative mx-auto flex max-w-[1200px] items-end justify-between gap-4 px-4 pb-0 pt-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 pb-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl text-base font-black text-white ring-2 ring-white/40"
              style={{ background: `linear-gradient(135deg, ${spec?.palette[0]}, ${spec?.palette[1]})` }}
            >
              {spec?.initials}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-lg font-extrabold">
                {user?.name}
                {spec?.verified && <BadgeCheck className="size-5 text-sun-400" aria-label={t('marketplace.verified')} />}
              </p>
              <p className="truncate text-sm text-white/70">{spec ? t(`specialties.${spec.specialties[0]}`) : ''}</p>
            </div>
          </div>
        </div>
        <nav className="relative mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none" aria-label={t('nav.main')}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to !== '/teacher/requests'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 whitespace-nowrap rounded-t-2xl px-4 py-3 text-sm font-bold transition-colors',
                  isActive ? 'bg-[#F2F6F7] text-teal-700' : 'text-white/75 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <item.icon className="size-4" />
              {t(item.key)}
              {item.to === '/teacher/requests' && pending > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1.5 text-[11px] font-black text-white">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        <motion.div key={location.pathname} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
