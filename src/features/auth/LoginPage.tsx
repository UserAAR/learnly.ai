import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { Role } from '@/types';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Eye, EyeOff, GraduationCap, HeartHandshake, LockKeyhole, Mail, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { homePathFor } from '@/lib/mock-auth';
import { cn } from '@/lib/cn';
import { DEMO_PASSWORD, PARENT_USER, SPECIALIST_USER } from '@/mocks/users';
import { Logo, Mascot, StarShape } from '@/components/illustrations/Brand';
import { EmotionFace, Hands, PedLight } from '@/components/illustrations/Objects';
import { LanguageSelector } from '@/components/navigation/Selectors';
import { Button, DemoBadge, Field } from '@/components/ui';

export default function LoginPage() {
  const { user, login, childMode } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Return to the page that sent the user here (e.g. a refreshed deep link), if it belongs to their role. */
  const destinationFor = (role: Role): string => {
    const from = (location.state as { from?: unknown } | null)?.from;
    const area = role === 'parent' ? /^\/(parent|child)(\/|\?|$)/ : /^\/teacher(\/|\?|$)/;
    return typeof from === 'string' && area.test(from) ? from : homePathFor(role);
  };

  if (user) return <Navigate to={user.role === 'parent' && childMode.active ? '/child' : destinationFor(user.role)} replace />;

  const submit = (e?: FormEvent, creds?: { email: string; password: string }) => {
    e?.preventDefault();
    const c = creds ?? { email, password };
    const res = login(c.email, c.password);
    if (!res.ok) {
      setError(res.error === 'empty' ? t('auth.errorEmpty') : t('auth.errorInvalid'));
      return;
    }
    navigate(destinationFor(res.user.role), { replace: true });
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <div className="relative flex flex-col bg-white px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DemoBadge label={t('common.demoMode')} />
            <LanguageSelector />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 lg:py-10">
          <div className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-cobalt-500 via-violet-500 to-violet-600 p-5 text-white lg:hidden">
            <div className="absolute -bottom-10 -right-6 opacity-95">
              <Mascot size={130} animate={false} />
            </div>
            <p className="relative max-w-[62%] text-xl font-extrabold leading-tight">
              {t('auth.heroTitle1')} <span className="text-sun-400">{t('auth.heroTitle2')}</span>
            </p>
            <div className="relative mt-3 flex gap-1.5">
              {(['happy', 'sad', 'angry'] as const).map((e) => (
                <EmotionFace key={e} emotion={e} size={30} />
              ))}
            </div>
          </div>
          <p className="eyebrow">{t('auth.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">{t('auth.title')}</h1>
          <p className="mt-2 text-[15px] text-muted">{t('auth.subtitle')}</p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <DemoButton
              tone="parent"
              title={t('auth.parentDemo')}
              text={t('auth.parentDemoText')}
              onClick={() => submit(undefined, { email: PARENT_USER.email, password: DEMO_PASSWORD })}
            />
            <DemoButton
              tone="teacher"
              title={t('auth.specialistDemo')}
              text={t('auth.specialistDemoText')}
              onClick={() => submit(undefined, { email: SPECIALIST_USER.email, password: DEMO_PASSWORD })}
            />
          </div>

          <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-line" />
            {t('auth.orEmail')}
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label={t('auth.email')} htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input pl-11"
                  placeholder="parent.demo@learnly.test"
                  value={email}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </Field>
            <Field label={t('auth.password')} htmlFor="password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pl-11 pr-12"
                  placeholder="••••••••••••"
                  value={password}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink"
                  aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                {error}
              </motion.p>
            )}
            <Button type="submit" size="lg" className="w-full" icon={<ArrowRight className="order-last size-4" />}>
              {t('auth.signIn')}
            </Button>
          </form>

          <details className="group mt-6 rounded-2xl border border-line bg-canvas/60 p-4 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-ink">
              {t('auth.credentialsTitle')}
              <span className="text-xs font-semibold text-cobalt-600 group-open:hidden">{t('common.show')}</span>
              <span className="hidden text-xs font-semibold text-cobalt-600 group-open:inline">{t('common.hide')}</span>
            </summary>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              <dt className="text-muted">{t('auth.parentDemo')}</dt>
              <dd className="font-mono font-semibold text-ink">{PARENT_USER.email}</dd>
              <dt className="text-muted">{t('auth.specialistDemo')}</dt>
              <dd className="font-mono font-semibold text-ink">{SPECIALIST_USER.email}</dd>
              <dt className="text-muted">{t('auth.password')}</dt>
              <dd className="font-mono font-semibold text-ink">{DEMO_PASSWORD}</dd>
              <dt className="text-muted">{t('auth.childPin')}</dt>
              <dd className="font-mono font-semibold text-ink">1234</dd>
            </dl>
            <p className="mt-3 text-xs text-muted">{t('auth.localNote')}</p>
          </details>
        </div>
      </div>
    </div>
  );
}

function DemoButton({ tone, title, text, onClick }: { tone: 'parent' | 'teacher'; title: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-3xl p-4 text-left text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]',
        tone === 'parent' ? 'bg-gradient-to-br from-cobalt-500 to-violet-500 shadow-[0_16px_30px_-16px_rgba(53,99,246,0.9)]' : 'bg-gradient-to-br from-teal-500 to-turquoise-500 shadow-[0_16px_30px_-16px_rgba(7,143,145,0.9)]',
      )}
    >
      <span className="absolute -right-5 -top-5 size-20 rounded-full bg-white/15 transition-transform group-hover:scale-125" aria-hidden="true" />
      <span className="relative grid size-10 place-items-center rounded-2xl bg-white/20">
        {tone === 'parent' ? <HeartHandshake className="size-5" /> : <GraduationCap className="size-5" />}
      </span>
      <span className="relative mt-3 block text-[15px] font-extrabold">{title}</span>
      <span className="relative mt-0.5 block text-xs text-white/80">{text}</span>
      <ArrowRight className="absolute bottom-4 right-4 size-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function BrandPanel() {
  const { t } = useLang();
  const reduce = useReduceMotion();
  const float = (delay: number) =>
    reduce ? {} : { animate: { y: [0, -10, 0] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay } };

  return (
    <div className="relative hidden overflow-hidden bg-navy-800 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,#3563F6_0%,transparent_55%),radial-gradient(90%_70%_at_100%_100%,#8158E8_0%,transparent_60%),radial-gradient(60%_50%_at_90%_10%,#10BFC3_0%,transparent_60%)] opacity-90" />
      <div className="grain absolute inset-0 opacity-40" />
      <div className="relative flex h-full flex-col p-12 xl:p-14">
        <Logo tone="light" size={40} />
        <div className="mt-12 max-w-lg">
          <h2 className="text-[40px] font-extrabold leading-[1.08] tracking-tight text-white xl:text-[46px]">
            {t('auth.heroTitle1')} <span className="text-sun-400">{t('auth.heroTitle2')}</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/75">{t('auth.heroText')}</p>
        </div>

        {/* composition */}
        <div className="relative mt-auto h-[360px] [perspective:1200px]">
          <div className="absolute bottom-0 left-1/2 h-40 w-[110%] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-leaf-600/70 to-leaf-500/0" />
          <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" {...float(0)}>
            <Mascot size={190} mood="happy" animate={!reduce} />
          </motion.div>

          <motion.div className="absolute left-0 top-6 w-44 rotate-[-6deg] rounded-3xl bg-white p-3 shadow-[0_24px_40px_-18px_rgba(0,0,0,0.5)]" {...float(0.6)}>
            <div className="rounded-2xl bg-gradient-to-br from-turquoise-100 to-turquoise-300 p-2">
              <Hands state="soap" size={140} className="h-auto w-full" />
            </div>
            <p className="mt-2 text-xs font-extrabold text-navy-800">{t('auth.chipHygiene')}</p>
            <div className="mt-1 flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <StarShape key={i} size={14} />
              ))}
            </div>
          </motion.div>

          <motion.div className="absolute right-2 top-0 w-36 rotate-[7deg] rounded-3xl bg-white p-3 shadow-[0_24px_40px_-18px_rgba(0,0,0,0.5)]" {...float(1.2)}>
            <div className="rounded-2xl bg-gradient-to-b from-[#6FB8FF] to-[#CDEEFF] p-2">
              <PedLight lit="green" size={110} className="mx-auto h-auto w-3/4" />
            </div>
            <p className="mt-2 text-xs font-extrabold text-navy-800">{t('auth.chipSafety')}</p>
          </motion.div>

          <motion.div className="absolute bottom-24 right-0 flex items-center gap-1 rounded-3xl bg-white/95 p-2.5 shadow-[0_24px_40px_-18px_rgba(0,0,0,0.5)]" {...float(1.8)}>
            {(['happy', 'sad', 'angry'] as const).map((e) => (
              <EmotionFace key={e} emotion={e} size={42} />
            ))}
          </motion.div>

          <motion.div className="absolute bottom-28 left-4 rounded-2xl bg-navy-900/80 px-4 py-3 text-white shadow-xl ring-1 ring-white/10 backdrop-blur" {...float(2.4)}>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
              <TrendingUp className="size-3.5 text-leaf-300" /> {t('auth.chipProgress')}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold">+24%</p>
          </motion.div>
        </div>

        <ul className="relative mt-8 grid grid-cols-3 gap-3 text-[13px] text-white/80">
          <li className="flex items-center gap-2">
            <Sparkles className="size-4 text-sun-400" /> {t('auth.point1')}
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-turquoise-300" /> {t('auth.point2')}
          </li>
          <li className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-coral-300" /> {t('auth.point3')}
          </li>
        </ul>
      </div>
    </div>
  );
}
