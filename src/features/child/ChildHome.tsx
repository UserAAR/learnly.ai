import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, BookHeart, Check, Gamepad2, HandHelping, Lock, Map, Play, RotateCcw, Sparkles, Sprout, Star, Timer } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useChildData } from '@/hooks/useChildData';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/cn';
import { toDateKey } from '@/lib/dates';
import { LESSONS, questionCount } from '@/mocks/lessons';
import { GAMES, ODD_ROUNDS, ROUTINE_ROUNDS } from '@/mocks/games';
import { ChildTopBar } from '@/layouts/ChildLayout';
import { KidAvatar, Logo, Mascot, StarShape } from '@/components/illustrations/Brand';
import { EmotionsArt, HygieneArt, OddArt, RoutineArt, SafetyArt } from '@/components/illustrations/World';
import { TiltCard } from '@/components/ui/TiltCard';

const ART = { handwashing: HygieneArt, 'road-safety': SafetyArt, emotions: EmotionsArt, 'my-day': RoutineArt, 'odd-one-out': OddArt } as const;
const EDGE: Record<string, { edge: string; btn: string; ring: string; chip: string }> = {
  handwashing: { edge: '#067476', btn: 'bg-turquoise-500 text-white', ring: 'ring-turquoise-300', chip: 'bg-turquoise-50 text-teal-700' },
  'road-safety': { edge: '#1F3BB0', btn: 'bg-cobalt-500 text-white', ring: 'ring-cobalt-300', chip: 'bg-cobalt-50 text-cobalt-700' },
  emotions: { edge: '#5530B3', btn: 'bg-violet-500 text-white', ring: 'ring-violet-300', chip: 'bg-violet-50 text-violet-700' },
  'my-day': { edge: '#B3810A', btn: 'bg-sun-400 text-navy-900', ring: 'ring-sun-300', chip: 'bg-sun-50 text-sun-700' },
  'odd-one-out': { edge: '#C43A2F', btn: 'bg-coral-500 text-white', ring: 'ring-coral-300', chip: 'bg-coral-50 text-coral-700' },
};

export default function ChildHome() {
  const { soundLocked } = useStore();
  const { t, l } = useLang();
  const reduce = useReduceMotion();
  const navigate = useNavigate();
  const play = useSound();
  const d = useChildData();
  const { child } = d;

  const completedSlugs = useMemo(() => new Set(d.sessions.filter((s) => s.completed).map((s) => s.activitySlug)), [d.sessions]);
  const timesDone = (slug: string) => d.sessions.filter((s) => s.activitySlug === slug && s.completed).length;
  const inProgress = Object.values(d.progress)
    .filter((p) => LESSONS.some((x) => x.slug === p.slug) || GAMES.some((g) => g.slug === p.slug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const inProgressTitle = inProgress ? (LESSONS.find((x) => x.slug === inProgress.slug) ?? GAMES.find((g) => g.slug === inProgress.slug))?.title : undefined;

  const journey = [...LESSONS.map((x) => ({ slug: x.slug, type: 'lesson' as const, title: x.title })), ...GAMES.map((g) => ({ slug: g.slug, type: 'game' as const, title: g.title }))];
  const todayKey = toDateKey(new Date());
  const doneToday = new Set(d.sessions.filter((s) => toDateKey(new Date(s.completedAt)) === todayKey).map((s) => s.activitySlug));
  const nextStation = journey.find((j) => !doneToday.has(j.slug)) ?? journey[0];

  const learningDays = new Set(d.sessions.map((s) => toDateKey(new Date(s.completedAt)))).size;
  const achievements = [
    { key: 'first', icon: Sprout, done: LESSONS.some((x) => completedSlugs.has(x.slug)), color: 'from-leaf-500 to-teal-500' },
    { key: 'explorer', icon: Map, done: completedSlugs.size >= 3, color: 'from-cobalt-500 to-violet-500' },
    { key: 'allLessons', icon: BookHeart, done: LESSONS.every((x) => completedSlugs.has(x.slug)), color: 'from-violet-500 to-coral-500' },
    { key: 'games', icon: Gamepad2, done: GAMES.every((g) => completedSlugs.has(g.slug)), color: 'from-sun-400 to-coral-500' },
    { key: 'helper', icon: HandHelping, done: d.sessions.some((s) => s.steps.some((st) => st.hintUsed)), color: 'from-turquoise-500 to-cobalt-500' },
    { key: 'days', icon: Award, done: learningDays >= 5, color: 'from-coral-500 to-violet-500' },
  ];

  const open = (type: 'lesson' | 'game', slug: string) => {
    play('tap');
    navigate(`/child/${type}/${slug}`);
  };

  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 * i, type: 'spring' as const, stiffness: 160, damping: 20 } });

  return (
    <div className="pb-16">
      <ChildTopBar
        left={
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-white/90 px-3 py-2 shadow-[0_4px_0_rgba(14,24,56,0.18)] backdrop-blur">
              <Logo size={30} />
            </span>
          </div>
        }
      />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ───────────── Greeting + journey ───────────── */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <motion.section {...rise(0)} className="relative overflow-hidden rounded-[40px] bg-white p-6 shadow-[0_10px_0_rgba(14,24,56,0.12),0_30px_60px_-30px_rgba(14,24,56,0.5)] sm:p-8">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-sun-100" aria-hidden="true" />
            <div className="absolute -bottom-20 right-24 size-40 rounded-full bg-turquoise-50" aria-hidden="true" />
            <div className="relative flex items-start gap-4 sm:gap-6">
              <motion.div className="shrink-0" animate={reduce ? undefined : { rotate: [0, -3, 3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <KidAvatar avatar={child.avatar} size={96} className="drop-shadow-[0_10px_0_rgba(14,24,56,0.12)] sm:hidden" />
                <KidAvatar avatar={child.avatar} size={120} className="hidden drop-shadow-[0_10px_0_rgba(14,24,56,0.12)] sm:block" />
              </motion.div>
              <div className="min-w-0 pt-1">
                <h1 className="text-[36px] font-black leading-[1.05] tracking-tight text-navy-800 sm:text-[52px]">{t('child.hello', { name: child.name })}</h1>
                <p className="mt-2 text-lg font-bold text-muted sm:text-xl">{t('child.helloText')}</p>
              </div>
            </div>
            <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3 rounded-3xl bg-sun-50 px-4 py-3 ring-2 ring-sun-300">
                <motion.span animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2 }}>
                  <StarShape size={40} />
                </motion.span>
                <div>
                  <p className="text-3xl font-black leading-none text-navy-800">{d.stars}</p>
                  <p className="text-sm font-extrabold text-sun-700">{t('child.starsCollected')}</p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="relative mb-12 max-w-[200px] rounded-3xl rounded-br-md bg-cobalt-500 px-4 py-3 text-[15px] font-extrabold text-white shadow-lg">
                  {t('child.mascotSays', { title: l(nextStation.title) })}
                </div>
                <Mascot size={110} mood="happy" animate={!reduce} />
              </div>
            </div>
            {soundLocked && <p className="relative mt-3 text-xs font-bold text-muted">{t('child.soundLockedNote')}</p>}
          </motion.section>

          <motion.section {...rise(1)} className="relative overflow-hidden rounded-[40px] bg-navy-800 p-6 text-white shadow-[0_10px_0_rgba(14,24,56,0.35),0_30px_60px_-30px_rgba(14,24,56,0.6)] sm:p-7" aria-labelledby="journey">
            <div className="absolute inset-0 opacity-60 [background:radial-gradient(70%_60%_at_100%_0%,rgba(129,88,232,0.6),transparent),radial-gradient(60%_60%_at_0%_100%,rgba(16,191,195,0.45),transparent)]" aria-hidden="true" />
            <div className="relative flex items-center justify-between">
              <h2 id="journey" className="flex items-center gap-2 text-2xl font-black">
                <Map className="size-6 text-sun-400" />
                {t('child.journey')}
              </h2>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-extrabold">
                {doneToday.size}/{journey.length} {t('child.today')}
              </span>
            </div>
            <ol className="relative mt-5 space-y-2.5">
              <span className="absolute bottom-6 left-[27px] top-6 w-1 rounded-full bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.35)_0_8px,transparent_8px_16px)]" aria-hidden="true" />
              {journey.map((j) => {
                const done = doneToday.has(j.slug);
                const isNext = j.slug === nextStation.slug && !done;
                return (
                  <li key={j.slug}>
                    <button
                      type="button"
                      onClick={() => open(j.type, j.slug)}
                      className={cn(
                        'relative flex w-full items-center gap-3 rounded-3xl p-1.5 pr-4 text-left transition-colors',
                        isNext ? 'bg-white text-navy-800' : 'hover:bg-white/10',
                      )}
                    >
                      <span
                        className={cn(
                          'relative grid size-11 shrink-0 place-items-center rounded-full text-base font-black ring-4',
                          done ? 'bg-leaf-500 text-white ring-leaf-300/40' : isNext ? 'bg-sun-400 text-navy-900 ring-sun-300' : 'bg-navy-700 text-white/80 ring-white/10',
                        )}
                      >
                        {done ? <Check className="size-5" strokeWidth={3.5} /> : j.type === 'game' ? <Gamepad2 className="size-5" /> : <Star className="size-5" />}
                        {isNext && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-sun-400/40 [animation-duration:2.6s]" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[17px] font-extrabold">{l(j.title)}</span>
                      {isNext && <span className="rounded-full bg-cobalt-500 px-2.5 py-1 text-xs font-extrabold text-white">{t('child.next')}</span>}
                      {done && <span className="text-xs font-extrabold text-leaf-300">{t('child.doneToday')}</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.section>
        </div>

        {/* ───────────── Continue ───────────── */}
        {inProgress && inProgressTitle && (
          <motion.section {...rise(2)} className="mt-5 flex flex-col items-start gap-4 rounded-[32px] bg-gradient-to-r from-coral-500 to-[#FF8A5C] p-5 text-white shadow-[0_8px_0_#C43A2F] sm:flex-row sm:items-center sm:p-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
              <Play className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold uppercase tracking-wider text-white/80">{t('child.continueTitle')}</p>
              <p className="text-2xl font-black">{l(inProgressTitle)}</p>
              <p className="text-sm font-bold text-white/85">
                {t('child.stepOf', {
                  step: inProgress.stepIndex + 1,
                  total: inProgress.activityType === 'lesson' ? LESSONS.find((x) => x.slug === inProgress.slug)?.steps.length ?? 0 : inProgress.slug === 'my-day' ? ROUTINE_ROUNDS.length : ODD_ROUNDS.length,
                })}
              </p>
            </div>
            <button type="button" onClick={() => open(inProgress.activityType, inProgress.slug)} className="kid-btn h-14 bg-white px-6 text-lg text-coral-600 [--edge:#FFC9C2]">
              {t('child.continue')}
            </button>
          </motion.section>
        )}

        {/* ───────────── Lessons ───────────── */}
        <section className="mt-10" aria-labelledby="lessons-h">
          <h2 id="lessons-h" className="mb-4 inline-flex items-center gap-3 rounded-[22px] bg-navy-800/85 py-1.5 pl-1.5 pr-5 text-[26px] font-black text-white shadow-[0_4px_0_rgba(14,24,56,0.25)] backdrop-blur">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-cobalt-600 shadow-[0_4px_0_rgba(14,24,56,0.2)]">
              <BookHeart className="size-6" />
            </span>
            {t('child.lessons')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {LESSONS.map((lesson, i) => {
              const Art = ART[lesson.slug as keyof typeof ART];
              const st = EDGE[lesson.slug];
              const times = timesDone(lesson.slug);
              const prog = d.progress[lesson.slug];
              return (
                <motion.div key={lesson.slug} {...rise(3 + i)}>
                  <TiltCard disabled={reduce} className="h-full">
                    <article className="flex h-full flex-col overflow-hidden rounded-[36px] bg-white shadow-[0_10px_0_rgba(14,24,56,0.14),0_30px_50px_-30px_rgba(14,24,56,0.55)]">
                      <button type="button" onClick={() => open('lesson', lesson.slug)} className="relative block h-48 overflow-hidden rounded-b-[28px] [transform-style:preserve-3d] sm:h-52" aria-label={l(lesson.title)}>
                        <Art />
                        {times > 0 && (
                          <span className="depth-3 absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-leaf-600 shadow">
                            <Check className="size-4" strokeWidth={3} /> {t('child.practiced', { count: times })}
                          </span>
                        )}
                      </button>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-[24px] font-black leading-tight text-navy-800">{l(lesson.title)}</h3>
                        <p className="mt-1 text-base font-bold text-muted">{l(lesson.subtitle)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold', st.chip)}>
                            <Timer className="size-4" /> {t('child.minutes', { count: lesson.minutes })}
                          </span>
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold', st.chip)}>
                            <Star className="size-4" /> {t('child.steps', { count: questionCount(lesson) })}
                          </span>
                        </div>
                        <div className="mt-auto pt-5">
                          <button
                            type="button"
                            onClick={() => open('lesson', lesson.slug)}
                            className={cn('kid-btn h-14 w-full text-lg', st.btn)}
                            style={{ ['--edge' as string]: st.edge }}
                          >
                            {prog ? <Play className="size-5" /> : times > 0 ? <RotateCcw className="size-5" /> : <Sparkles className="size-5" />}
                            {prog ? t('child.continue') : times > 0 ? t('child.playAgain') : t('child.start')}
                          </button>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ───────────── Games ───────────── */}
        <section className="mt-10" aria-labelledby="games-h">
          <h2 id="games-h" className="mb-4 inline-flex items-center gap-3 rounded-[22px] bg-navy-800/85 py-1.5 pl-1.5 pr-5 text-[26px] font-black text-white shadow-[0_4px_0_rgba(14,24,56,0.25)] backdrop-blur">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-coral-500 shadow-[0_4px_0_rgba(14,24,56,0.2)]">
              <Gamepad2 className="size-6" />
            </span>
            {t('child.games')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {GAMES.map((g, i) => {
              const Art = ART[g.slug as keyof typeof ART];
              const st = EDGE[g.slug];
              const times = timesDone(g.slug);
              return (
                <motion.div key={g.slug} {...rise(6 + i)}>
                  <TiltCard disabled={reduce} max={5} className="h-full">
                    <article className="grid h-full overflow-hidden rounded-[36px] bg-white shadow-[0_10px_0_rgba(14,24,56,0.14),0_30px_50px_-30px_rgba(14,24,56,0.55)] sm:grid-cols-[1fr_1.1fr]">
                      <button type="button" onClick={() => open('game', g.slug)} className="relative block h-44 overflow-hidden [transform-style:preserve-3d] sm:h-full sm:min-h-56" aria-label={l(g.title)}>
                        <Art />
                      </button>
                      <div className="flex flex-col p-5 sm:p-6">
                        <h3 className="text-[24px] font-black leading-tight text-navy-800">{l(g.title)}</h3>
                        <p className="mt-1 text-base font-bold text-muted">{l(g.subtitle)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold', st.chip)}>
                            <Timer className="size-4" /> {t('child.minutes', { count: g.minutes })}
                          </span>
                          {times > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-3 py-1 text-sm font-extrabold text-leaf-700">
                              <Check className="size-4" strokeWidth={3} /> {t('child.practiced', { count: times })}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto pt-5">
                          <button type="button" onClick={() => open('game', g.slug)} className={cn('kid-btn h-14 w-full text-lg', st.btn)} style={{ ['--edge' as string]: st.edge }}>
                            <Gamepad2 className="size-5" />
                            {d.progress[g.slug] ? t('child.continue') : t('child.play')}
                          </button>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ───────────── Achievements ───────────── */}
        <section className="mt-10 rounded-[40px] bg-white/90 p-6 shadow-[0_10px_0_rgba(14,24,56,0.12)] backdrop-blur sm:p-8" aria-labelledby="ach-h">
          <h2 id="ach-h" className="flex items-center gap-3 text-[26px] font-black text-navy-800">
            <Award className="size-7 text-sun-500" />
            {t('child.achievements')}
          </h2>
          <p className="mt-1 text-base font-bold text-muted">{t('child.achievementsText')}</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((a) => (
              <li key={a.key} className={cn('flex flex-col items-center rounded-3xl p-4 text-center', a.done ? 'bg-canvas' : 'bg-canvas/60')}>
                <span
                  className={cn(
                    'relative grid size-16 place-items-center rounded-full text-white',
                    a.done ? cn('bg-gradient-to-br shadow-[0_6px_0_rgba(14,24,56,0.18)]', a.color) : 'bg-line text-muted',
                  )}
                >
                  {a.done ? <a.icon className="size-8" /> : <Lock className="size-6" />}
                </span>
                <p className={cn('mt-3 text-[15px] font-black leading-tight', a.done ? 'text-navy-800' : 'text-muted')}>{t(`child.ach.${a.key}`)}</p>
                <p className="mt-1 text-xs font-bold text-muted">{a.done ? t('child.achDone') : t(`child.ach.${a.key}Hint`)}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
