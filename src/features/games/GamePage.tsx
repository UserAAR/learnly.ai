import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, CheckCheck, Gamepad2, Home, Lightbulb, Play, RotateCcw, Sparkles, Timer } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/cn';
import { uid } from '@/lib/random';
import { MAX_ATTEMPTS } from '@/lib/learning-metrics';
import { GAMES, ODD_ROUNDS, ROUTINE_ROUNDS, getGame } from '@/mocks/games';
import type { Game, LearningSession, StepAttempt } from '@/types';
import { ChildTopBar } from '@/layouts/ChildLayout';
import { OddArt, RoutineArt } from '@/components/illustrations/World';
import { AttemptDots, Celebration, FeedbackBubble, type FeedbackTone } from '@/features/lessons/ChildFeedback';
import { SequenceBoard, stableShuffle } from '@/features/lessons/SequenceBoard';

interface RoundUI {
  attempts: number;
  hintUsed: boolean;
  hintTarget: string | null;
  wrong: string[];
  status: 'answering' | 'correct' | 'revealed';
  lastWrong: boolean;
  shownAt: number;
  slots?: (string | null)[];
  slotState?: ('idle' | 'right' | 'wrong')[];
}

const fresh = (n?: number): RoundUI => ({
  attempts: 0,
  hintUsed: false,
  hintTarget: null,
  wrong: [],
  status: 'answering',
  lastWrong: false,
  shownAt: Date.now(),
  slots: n ? Array.from({ length: n }, () => null) : undefined,
});

export default function GamePage() {
  const { slug = '' } = useParams();
  const game = getGame(slug);
  if (!game) return <Navigate to="/child" replace />;
  return <GameRunner key={game.slug} game={game} />;
}

function GameRunner({ game }: { game: Game }) {
  const { selectedChild, data, saveProgress, clearProgress, recordSession } = useStore();
  const { t, l } = useLang();
  const reduce = useReduceMotion();
  const play = useSound();
  const navigate = useNavigate();
  const saved = data.progress[selectedChild.id]?.[game.slug];
  const isRoutine = game.slug === 'my-day';
  const rounds = isRoutine ? ROUTINE_ROUNDS : ODD_ROUNDS;

  const [phase, setPhase] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [index, setIndex] = useState(0);
  const [ui, setUi] = useState<RoundUI>(fresh(isRoutine ? ROUTINE_ROUNDS[0].items.length : undefined));
  const [results, setResults] = useState<StepAttempt[]>([]);
  const [startedAt, setStartedAt] = useState('');
  const [finished, setFinished] = useState<LearningSession | null>(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    saveProgress(selectedChild.id, { slug: game.slug, activityType: 'game', stepIndex: index, steps: results, startedAt, updatedAt: new Date().toISOString() });
  }, [phase, index, results, startedAt, game.slug, selectedChild.id, saveProgress]);

  const roundSize = (i: number) => (isRoutine ? ROUTINE_ROUNDS[i].items.length : undefined);

  const begin = (restart: boolean) => {
    play('tap');
    if (restart || !saved) {
      clearProgress(selectedChild.id, game.slug);
      setIndex(0);
      setResults([]);
      setStartedAt(new Date().toISOString());
      setUi(fresh(roundSize(0)));
    } else {
      const i = Math.min(saved.stepIndex, rounds.length - 1);
      setIndex(i);
      setResults(saved.steps);
      setStartedAt(saved.startedAt);
      setUi(fresh(roundSize(i)));
    }
    setPhase('playing');
  };

  const settle = (correct: boolean, wrongId: string | null, extra: Partial<RoundUI> = {}) => {
    if (ui.status !== 'answering') return;
    const attempts = ui.attempts + 1;
    const responseMs = Math.min(Date.now() - ui.shownAt, 120_000);
    const roundId = rounds[index].id;
    if (correct || attempts >= MAX_ATTEMPTS) {
      setUi({ ...ui, ...extra, attempts, status: correct ? 'correct' : 'revealed', lastWrong: false, wrong: wrongId ? [...ui.wrong, wrongId] : ui.wrong });
      setResults((r) => [...r.filter((x) => x.stepId !== roundId), { stepId: roundId, skill: game.skill, attempts, hintUsed: ui.hintUsed, resolved: correct, responseMs }]);
      play(correct ? 'correct' : 'gentle');
    } else {
      setUi({ ...ui, ...extra, attempts, lastWrong: true, wrong: wrongId ? [...ui.wrong, wrongId] : ui.wrong });
      play('gentle');
    }
  };

  const next = () => {
    play('tap');
    if (index < rounds.length - 1) {
      setIndex(index + 1);
      setUi(fresh(roundSize(index + 1)));
      return;
    }
    const session: LearningSession = {
      id: uid('session'),
      childId: selectedChild.id,
      activityType: 'game',
      activitySlug: game.slug,
      skill: game.skill,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completed: true,
      steps: results,
      demo: false,
    };
    recordSession(session);
    setFinished(session);
    setPhase('complete');
    play('complete');
  };

  const topLeft = (
    <div className="flex min-w-0 items-center gap-2">
      <button type="button" onClick={() => navigate('/child')} className="kid-btn h-12 shrink-0 bg-white px-3 text-base text-navy-800 [--edge:#C9D3E8] sm:h-14 sm:px-4" aria-label={t('child.backToWorld')}>
        <Home className="size-5" />
        <span className="hidden md:inline">{t('child.backToWorld')}</span>
      </button>
      <span className="hidden min-w-0 truncate rounded-2xl bg-white/85 px-4 py-3 text-lg font-black text-navy-800 backdrop-blur sm:block">{l(game.title)}</span>
    </div>
  );

  if (phase === 'intro') {
    const Art = isRoutine ? RoutineArt : OddArt;
    return (
      <div className="pb-16">
        <ChildTopBar left={topLeft} />
        <main className="mx-auto mt-6 max-w-5xl px-4 sm:px-6">
          <section className="grid overflow-hidden rounded-[44px] bg-white shadow-[0_12px_0_rgba(14,24,56,0.14),0_40px_70px_-30px_rgba(14,24,56,0.6)] lg:grid-cols-[1.1fr_1fr]">
            <div className="relative h-64 overflow-hidden lg:h-auto lg:min-h-[420px]">
              <Art />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-coral-50 px-3 py-1 text-sm font-extrabold text-coral-700">
                <Gamepad2 className="size-4" /> {t('child.game')}
              </span>
              <h1 className="mt-3 text-[36px] font-black leading-[1.05] text-navy-800 sm:text-[44px]">{l(game.title)}</h1>
              <div className="mt-4 rounded-3xl bg-sun-50 p-4 ring-2 ring-sun-300">
                <p className="text-sm font-extrabold uppercase tracking-wider text-sun-700">{t('game.howToPlay')}</p>
                <p className="mt-1 text-lg font-bold text-navy-800">{l(game.instructions)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-extrabold text-navy-800">
                  <Timer className="size-4" /> {t('child.minutes', { count: game.minutes })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-extrabold text-navy-800">
                  <Sparkles className="size-4" /> {t('game.rounds', { count: rounds.length })}
                </span>
              </div>
              <div className="mt-auto flex flex-col gap-3 pt-8">
                {saved ? (
                  <>
                    <button type="button" onClick={() => begin(false)} className="kid-btn h-16 bg-coral-500 text-xl text-white [--edge:#C43A2F]">
                      <Play className="size-6" /> {t('game.continueRound', { round: saved.stepIndex + 1, total: rounds.length })}
                    </button>
                    <button type="button" onClick={() => begin(true)} className="kid-btn h-14 bg-white text-lg text-navy-800 ring-2 ring-line [--edge:#C9D3E8]">
                      <RotateCcw className="size-5" /> {t('lesson.restart')}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => begin(true)} className="kid-btn h-16 bg-coral-500 text-xl text-white [--edge:#C43A2F]">
                    <Play className="size-6" /> {t('child.play')}
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (phase === 'complete' && finished) {
    const resolved = finished.steps.filter((s) => s.resolved).length;
    const other = GAMES.find((g) => g.slug !== game.slug)!;
    return (
      <div className="pb-16">
        <ChildTopBar left={topLeft} />
        <main className="mx-auto max-w-5xl px-4 pt-24 sm:px-6">
          <Celebration
            reduceMotion={reduce}
            title={t('game.completeTitle', { name: selectedChild.name })}
            subtitle={t('game.completeText', { title: l(game.title) })}
            stats={[
              { label: t('game.statRounds'), value: `${finished.steps.length}/${rounds.length}` },
              { label: t('lesson.statStars'), value: `+${resolved}` },
            ]}
            actions={
              <>
                <button type="button" onClick={() => navigate('/child')} className="kid-btn h-14 bg-cobalt-500 px-6 text-lg text-white [--edge:#1F3BB0]">
                  <Home className="size-5" /> {t('child.backToWorld')}
                </button>
                <button type="button" onClick={() => begin(true)} className="kid-btn h-14 bg-white px-6 text-lg text-navy-800 ring-2 ring-line [--edge:#C9D3E8]">
                  <RotateCcw className="size-5" /> {t('child.playAgain')}
                </button>
                <button type="button" onClick={() => navigate(`/child/game/${other.slug}`)} className="kid-btn h-14 bg-sun-400 px-6 text-lg text-navy-900 [--edge:#B3810A]">
                  {l(other.title)} <ArrowRight className="size-5" />
                </button>
              </>
            }
          />
        </main>
      </div>
    );
  }

  /* playing */
  const round = rounds[index];
  const roundHint = isRoutine ? l(ROUTINE_ROUNDS[index].hint) : l(ODD_ROUNDS[index].hint);
  const explanation = isRoutine ? null : l(ODD_ROUNDS[index].explanation);
  const fb: { tone: FeedbackTone; title: string; text?: string } =
    ui.status === 'correct'
      ? { tone: 'success', title: [t('lesson.praise1'), t('lesson.praise2'), t('lesson.praise3')][index % 3], text: explanation ?? t('game.routineRight') }
      : ui.status === 'revealed'
        ? { tone: 'reveal', title: t('lesson.revealTitle'), text: explanation ?? t('game.routineReveal') }
        : ui.lastWrong
          ? { tone: 'gentle', title: t('lesson.tryAgain'), text: ui.hintUsed ? roundHint : isRoutine ? t('game.routineTryAgain') : t('lesson.tryAgainText') }
          : ui.hintUsed
            ? { tone: 'hint', title: t('lesson.hintTitle'), text: roundHint }
            : { tone: 'neutral', title: isRoutine ? t('lesson.sequenceIntro') : t('game.oddIntro') };

  const checkRoutine = () => {
    const r = ROUTINE_ROUNDS[index];
    const slots = ui.slots ?? [];
    const correct = r.items.every((it, i) => slots[i] === it.id);
    const slotState = r.items.map((it, i) => (slots[i] === it.id ? 'right' : 'wrong')) as ('right' | 'wrong')[];
    const reveal = !correct && ui.attempts + 1 >= MAX_ATTEMPTS;
    settle(correct, null, reveal ? { slots: r.items.map((i) => i.id), slotState: r.items.map(() => 'right') } : { slotState });
  };

  const showHint = () => {
    if (ui.status !== 'answering') return;
    play('hint');
    let target: string | null = null;
    if (isRoutine) {
      const r = ROUTINE_ROUNDS[index];
      target = r.items.find((it, i) => ui.slots?.[i] !== it.id)?.id ?? null;
    } else {
      const r = ODD_ROUNDS[index];
      target = r.items.find((it) => it.id !== r.correctId && !ui.wrong.includes(it.id))?.id ?? null;
    }
    setUi({ ...ui, hintUsed: true, hintTarget: target });
  };

  return (
    <div className="pb-36">
      <ChildTopBar left={topLeft} />
      <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-2 rounded-full bg-white/85 p-2 shadow-[0_4px_0_rgba(14,24,56,0.14)] backdrop-blur" role="progressbar" aria-valuemin={1} aria-valuemax={rounds.length} aria-valuenow={index + 1} aria-label={t('game.roundOf', { round: index + 1, total: rounds.length })}>
          {rounds.map((r, i) => (
            <span key={r.id} className={cn('h-4 flex-1 rounded-full transition-colors', i < index ? 'bg-leaf-500' : i === index ? 'bg-coral-500' : 'bg-canvas')} />
          ))}
          <span className="px-2 text-sm font-black text-navy-800">
            {index + 1}/{rounds.length}
          </span>
        </div>
      </div>

      <main className="mx-auto mt-5 max-w-5xl px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.section
            key={round.id}
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="rounded-[44px] bg-white p-4 shadow-[0_12px_0_rgba(14,24,56,0.14),0_40px_70px_-30px_rgba(14,24,56,0.6)] sm:p-7"
          >
            {isRoutine ? (
              <RoutineRoundView index={index} ui={ui} reduce={reduce} onChange={(slots) => setUi({ ...ui, slots, slotState: undefined, lastWrong: false })} onTap={() => play('tap')} />
            ) : (
              <OddRoundView index={index} ui={ui} reduce={reduce} onPick={(id) => settle(id === ODD_ROUNDS[index].correctId, id === ODD_ROUNDS[index].correctId ? null : id)} />
            )}
            <div className="mt-5">
              <FeedbackBubble tone={fb.tone} title={fb.title} text={fb.text} reduceMotion={reduce} />
            </div>
          </motion.section>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-navy-900/35 to-transparent pb-[max(env(safe-area-inset-bottom),12px)] pt-8">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button type="button" onClick={showHint} disabled={ui.status !== 'answering' || ui.hintUsed} className="kid-btn h-14 bg-sun-400 px-4 text-lg text-navy-900 [--edge:#B3810A] sm:h-16 sm:px-6">
            <Lightbulb className="size-6" />
            {t('lesson.hint')}
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {ui.status === 'answering' && (
              <span className="hidden rounded-2xl bg-white/90 px-3 py-2 sm:block">
                <AttemptDots used={ui.attempts} />
              </span>
            )}
            {isRoutine && ui.status === 'answering' ? (
              <button type="button" onClick={checkRoutine} disabled={(ui.slots ?? []).some((s) => s === null)} className="kid-btn h-14 bg-cobalt-500 px-6 text-lg text-white [--edge:#1F3BB0] sm:h-16 sm:px-8">
                <CheckCheck className="size-6" />
                {t('lesson.check')}
              </button>
            ) : (
              <button type="button" onClick={next} disabled={ui.status === 'answering'} className="kid-btn h-14 bg-leaf-500 px-6 text-lg text-white [--edge:#1B7A4B] sm:h-16 sm:px-8">
                {index === rounds.length - 1 ? t('lesson.finish') : t('game.nextRound')}
                <ArrowRight className="size-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundTitle({ children, chip }: { children: ReactNode; chip?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {chip}
      <h2 className="text-[26px] font-black leading-tight text-navy-800 sm:text-[34px]">{children}</h2>
    </div>
  );
}

function RoutineRoundView({ index, ui, reduce, onChange, onTap }: { index: number; ui: RoundUI; reduce: boolean; onChange: (s: (string | null)[]) => void; onTap: () => void }) {
  const { t, l } = useLang();
  const r = ROUTINE_ROUNDS[index];
  const poolOrder = useMemo(() => stableShuffle(r.items, `routine-${r.id}`), [r]);
  return (
    <div>
      <RoundTitle chip={<span className={cn('rounded-full px-4 py-1.5 text-base font-black', r.id === 'morning' ? 'bg-sun-100 text-sun-700' : 'bg-violet-100 text-violet-700')}>{r.id === 'morning' ? '🌅' : '🌙'} {l(r.title)}</span>}>
        {t('game.routinePrompt')}
      </RoundTitle>
      <div className="mt-5">
        <SequenceBoard
          items={r.items}
          poolOrder={poolOrder}
          slots={ui.slots ?? r.items.map(() => null)}
          onChange={onChange}
          locked={ui.status !== 'answering'}
          slotState={ui.slotState}
          highlightId={ui.status === 'answering' && ui.hintUsed ? ui.hintTarget : null}
          reduceMotion={reduce}
          onTap={onTap}
        />
      </div>
    </div>
  );
}

function OddRoundView({ index, ui, reduce, onPick }: { index: number; ui: RoundUI; reduce: boolean; onPick: (id: string) => void }) {
  const { t, l } = useLang();
  const r = ODD_ROUNDS[index];
  return (
    <div>
      <RoundTitle>{l(r.prompt)}</RoundTitle>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {r.items.map((it, i) => {
          const isCorrect = it.id === r.correctId;
          const state =
            ui.status === 'correct' && isCorrect ? 'correct' : ui.status === 'revealed' && isCorrect ? 'reveal' : ui.wrong.includes(it.id) ? 'wrong' : ui.hintTarget === it.id || ui.status !== 'answering' ? 'dim' : 'idle';
          const disabled = ui.status !== 'answering';
          return (
            <li key={it.id}>
              <motion.button
                type="button"
                onClick={() => onPick(it.id)}
                disabled={disabled}
                initial={reduce ? false : { opacity: 0, y: 20, rotate: [-3, 2, -2, 3][i] }}
                animate={state === 'wrong' && !reduce ? { opacity: 1, y: 0, x: [0, -6, 6, -3, 0], rotate: 0 } : { opacity: 1, y: 0, x: 0, rotate: 0 }}
                transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.4 }}
                whileHover={disabled || reduce ? undefined : { y: -6, rotate: [-2, 2, -1, 1][i] }}
                whileTap={disabled || reduce ? undefined : { scale: 0.95 }}
                aria-label={l(it.label)}
                className={cn(
                  'relative flex aspect-square w-full flex-col items-center justify-center rounded-[32px] border-[4px] transition-[border,opacity,box-shadow]',
                  state === 'idle' && 'border-white shadow-[0_8px_0_rgba(14,24,56,0.12)] hover:border-cobalt-300',
                  (state === 'correct' || state === 'reveal') && 'border-leaf-500 shadow-[0_8px_0_#7FD6A7]',
                  state === 'wrong' && 'border-coral-300 opacity-70',
                  state === 'dim' && 'border-white opacity-40',
                )}
                style={{ background: `radial-gradient(circle at 35% 30%, #fff 0%, ${it.tone} 70%)` }}
              >
                <span className="text-[64px] leading-none drop-shadow-[0_6px_0_rgba(14,24,56,0.12)] sm:text-[78px]" aria-hidden="true">
                  {it.emoji}
                </span>
                <span className="mt-2 rounded-full bg-white/90 px-3 py-0.5 text-base font-black text-navy-800">{l(it.label)}</span>
                {(state === 'correct' || state === 'reveal') && (
                  <span className="absolute -right-2 -top-2 grid size-11 place-items-center rounded-full bg-leaf-500 text-white shadow-lg">
                    <Check className="size-6" strokeWidth={3.5} />
                  </span>
                )}
                {state === 'reveal' && <span className="absolute -top-3 left-3 rounded-full bg-leaf-500 px-2.5 py-0.5 text-xs font-extrabold text-white">{t('game.different')}</span>}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
