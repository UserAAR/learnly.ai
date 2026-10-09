import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CheckCheck, Home, Lightbulb, Play, RotateCcw, Sparkles, Star, Timer } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/cn';
import { uid } from '@/lib/random';
import { MAX_ATTEMPTS } from '@/lib/learning-metrics';
import { getLesson, LESSONS, questionCount } from '@/mocks/lessons';
import type { ChoiceStep, LearningSession, Lesson, LessonStep, QuestionStep, SequenceStep, StepAttempt, TapStep } from '@/types';
import { ChildTopBar } from '@/layouts/ChildLayout';
import { FacesScene, LightScene, RoadScene, SinkScene, type SceneTarget, type TargetState } from '@/components/illustrations/Scenes';
import { LessonVisual, visualTone } from '@/components/illustrations/LessonVisual';
import { AttemptDots, Celebration, FeedbackBubble } from './ChildFeedback';
import { SequenceBoard, stableShuffle } from './SequenceBoard';

type Status = 'answering' | 'correct' | 'revealed';
interface StepUI {
  attempts: number;
  hintUsed: boolean;
  hintTarget: string | null;
  wrong: string[];
  status: Status;
  shownAt: number;
  lastWrong: boolean;
  slots?: (string | null)[];
  slotState?: ('idle' | 'right' | 'wrong')[];
}

const RESPONSE_CAP_MS = 120_000;

function freshUI(step: LessonStep): StepUI {
  return {
    attempts: 0,
    hintUsed: false,
    hintTarget: null,
    wrong: [],
    status: 'answering',
    shownAt: Date.now(),
    lastWrong: false,
    slots: step.kind === 'sequence' ? step.items.map(() => null) : undefined,
  };
}

export default function LessonPlayer() {
  const { slug = '' } = useParams();
  const lesson = getLesson(slug);
  if (!lesson) return <Navigate to="/child" replace />;
  return <Player key={lesson.slug} lesson={lesson} />;
}

function Player({ lesson }: { lesson: Lesson }) {
  const { selectedChild, data, saveProgress, clearProgress, recordSession } = useStore();
  const { t, l } = useLang();
  const reduce = useReduceMotion();
  const play = useSound();
  const navigate = useNavigate();
  const saved = data.progress[selectedChild.id]?.[lesson.slug];

  const [phase, setPhase] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [index, setIndex] = useState(0);
  const [ui, setUi] = useState<Record<string, StepUI>>({});
  const [results, setResults] = useState<Record<string, StepAttempt>>({});
  const [startedAt, setStartedAt] = useState('');
  const [finished, setFinished] = useState<LearningSession | null>(null);

  const step = lesson.steps[index];
  const cur: StepUI = ui[step.id] ?? freshUI(step);

  // Make sure the visible step has a UI record (and a start time for response tracking).
  useEffect(() => {
    if (phase !== 'playing') return;
    setUi((u) => (u[step.id] ? u : { ...u, [step.id]: freshUI(step) }));
  }, [phase, step]);

  // Persist "in progress" so the child (or parent) can continue later.
  useEffect(() => {
    if (phase !== 'playing') return;
    saveProgress(selectedChild.id, {
      slug: lesson.slug,
      activityType: 'lesson',
      stepIndex: index,
      steps: Object.values(results),
      startedAt,
      updatedAt: new Date().toISOString(),
    });
  }, [phase, index, results, startedAt, lesson.slug, selectedChild.id, saveProgress]);

  const begin = (fresh: boolean) => {
    play('tap');
    if (fresh || !saved) {
      clearProgress(selectedChild.id, lesson.slug);
      setIndex(0);
      setUi({});
      setResults({});
      setStartedAt(new Date().toISOString());
    } else {
      const restored: Record<string, StepAttempt> = {};
      const restoredUi: Record<string, StepUI> = {};
      saved.steps.forEach((s) => {
        restored[s.stepId] = s;
        const st = lesson.steps.find((x) => x.id === s.stepId);
        if (st) restoredUi[s.stepId] = { ...freshUI(st), attempts: s.attempts, hintUsed: s.hintUsed, status: s.resolved ? 'correct' : 'revealed' };
      });
      setResults(restored);
      setUi(restoredUi);
      setIndex(Math.min(saved.stepIndex, lesson.steps.length - 1));
      setStartedAt(saved.startedAt);
    }
    setPhase('playing');
  };

  const patch = useCallback((id: string, p: Partial<StepUI>) => setUi((u) => ({ ...u, [id]: { ...(u[id] ?? freshUI(step)), ...p } })), [step]);

  const settle = (q: QuestionStep, correct: boolean, wrongId: string | null, extra: Partial<StepUI> = {}) => {
    if (cur.status !== 'answering') return;
    const attempts = cur.attempts + 1;
    const responseMs = Math.min(Date.now() - cur.shownAt, RESPONSE_CAP_MS);
    if (correct) {
      patch(q.id, { ...extra, attempts, status: 'correct', lastWrong: false });
      setResults((r) => ({ ...r, [q.id]: { stepId: q.id, skill: lesson.skill, attempts, hintUsed: cur.hintUsed, resolved: true, responseMs } }));
      play('correct');
    } else if (attempts >= MAX_ATTEMPTS) {
      patch(q.id, { ...extra, attempts, status: 'revealed', lastWrong: false, wrong: wrongId ? [...cur.wrong, wrongId] : cur.wrong });
      setResults((r) => ({ ...r, [q.id]: { stepId: q.id, skill: lesson.skill, attempts, hintUsed: cur.hintUsed, resolved: false, responseMs } }));
      play('gentle');
    } else {
      patch(q.id, { ...extra, attempts, lastWrong: true, wrong: wrongId ? [...cur.wrong, wrongId] : cur.wrong });
      play('gentle');
    }
  };

  const showHint = () => {
    if (step.kind === 'info' || cur.status !== 'answering') return;
    play('hint');
    let target: string | null = null;
    if (step.kind === 'sequence') {
      target = step.items.find((it, i) => cur.slots?.[i] !== it.id)?.id ?? null;
    } else {
      const opts = step.kind === 'choice' ? step.options : step.targets;
      target = opts.find((o) => o.id !== step.correctId && !cur.wrong.includes(o.id))?.id ?? null;
    }
    patch(step.id, { hintUsed: true, hintTarget: target });
  };

  const finish = () => {
    const steps = lesson.steps.filter((s) => s.kind !== 'info').map((s) => results[s.id]).filter(Boolean);
    const session: LearningSession = {
      id: uid('session'),
      childId: selectedChild.id,
      activityType: 'lesson',
      activitySlug: lesson.slug,
      skill: lesson.skill,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completed: true,
      steps,
      demo: false,
    };
    recordSession(session);
    setFinished(session);
    setPhase('complete');
    play('complete');
  };

  const next = () => {
    play('tap');
    if (index < lesson.steps.length - 1) setIndex(index + 1);
    else finish();
  };

  const canAdvance = step.kind === 'info' || cur.status !== 'answering';
  const totalQ = questionCount(lesson);
  const nextLesson = LESSONS[(LESSONS.findIndex((x) => x.slug === lesson.slug) + 1) % LESSONS.length];

  const topLeft = (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => navigate('/child')}
        className="kid-btn h-12 shrink-0 bg-white px-3 text-base text-navy-800 [--edge:#C9D3E8] sm:h-14 sm:px-4"
        aria-label={t('child.backToWorld')}
      >
        <Home className="size-5" />
        <span className="hidden md:inline">{t('child.backToWorld')}</span>
      </button>
      <span className="hidden min-w-0 truncate rounded-2xl bg-white/85 px-4 py-3 text-lg font-black text-navy-800 backdrop-blur sm:block">{l(lesson.title)}</span>
    </div>
  );

  /* ───────────── Intro ───────────── */
  if (phase === 'intro') {
    return (
      <div className="pb-16">
        <ChildTopBar left={topLeft} />
        <main className="mx-auto mt-6 max-w-5xl px-4 sm:px-6">
          <section className="grid overflow-hidden rounded-[44px] bg-white shadow-[0_12px_0_rgba(14,24,56,0.14),0_40px_70px_-30px_rgba(14,24,56,0.6)] lg:grid-cols-[1.15fr_1fr]">
            <div className="p-4 sm:p-6">
              <IntroScene lesson={lesson} reduce={reduce} />
            </div>
            <div className="flex flex-col p-6 pt-2 sm:p-8 lg:pl-2">
              <span className="w-fit rounded-full bg-cobalt-50 px-3 py-1 text-sm font-extrabold text-cobalt-700">{t(`skills.${lesson.skill}`)}</span>
              <h1 className="mt-3 text-[36px] font-black leading-[1.05] text-navy-800 sm:text-[44px]">{l(lesson.title)}</h1>
              <p className="mt-3 text-lg font-bold text-muted">{l(lesson.goal)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-extrabold text-navy-800">
                  <Timer className="size-4" /> {t('child.minutes', { count: lesson.minutes })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-extrabold text-navy-800">
                  <Star className="size-4" /> {t('child.steps', { count: totalQ })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-extrabold text-navy-800">
                  <Lightbulb className="size-4" /> {t('lesson.hintsAvailable')}
                </span>
              </div>
              <div className="mt-auto flex flex-col gap-3 pt-8">
                {saved ? (
                  <>
                    <button type="button" onClick={() => begin(false)} className="kid-btn h-16 bg-cobalt-500 text-xl text-white [--edge:#1F3BB0]">
                      <Play className="size-6" /> {t('lesson.continueFrom', { step: saved.stepIndex + 1, total: lesson.steps.length })}
                    </button>
                    <button type="button" onClick={() => begin(true)} className="kid-btn h-14 bg-white text-lg text-navy-800 ring-2 ring-line [--edge:#C9D3E8]">
                      <RotateCcw className="size-5" /> {t('lesson.restart')}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => begin(true)} className="kid-btn h-16 bg-leaf-500 text-xl text-white [--edge:#1B7A4B]">
                    <Sparkles className="size-6" /> {t('lesson.start')}
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ───────────── Complete ───────────── */
  if (phase === 'complete' && finished) {
    const resolved = finished.steps.filter((s) => s.resolved).length;
    return (
      <div className="pb-16">
        <ChildTopBar left={topLeft} />
        <main className="mx-auto max-w-5xl px-4 pt-24 sm:px-6">
          <Celebration
            reduceMotion={reduce}
            title={t('lesson.completeTitle', { name: selectedChild.name })}
            subtitle={t('lesson.completeText', { title: l(lesson.title) })}
            stats={[
              { label: t('lesson.statSteps'), value: `${finished.steps.length}/${totalQ}` },
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
                {nextLesson.slug !== lesson.slug && (
                  <button type="button" onClick={() => navigate(`/child/lesson/${nextLesson.slug}`)} className="kid-btn h-14 bg-sun-400 px-6 text-lg text-navy-900 [--edge:#B3810A]">
                    {l(nextLesson.title)} <ArrowRight className="size-5" />
                  </button>
                )}
              </>
            }
          />
        </main>
      </div>
    );
  }

  /* ───────────── Playing ───────────── */
  const feedback = feedbackFor(step, cur, t, l);

  return (
    <div className="pb-36">
      <ChildTopBar left={topLeft} />

      {/* progress path */}
      <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
        <div className="flex items-center gap-1.5 rounded-full bg-white/85 p-2 shadow-[0_4px_0_rgba(14,24,56,0.14)] backdrop-blur" role="progressbar" aria-valuemin={1} aria-valuemax={lesson.steps.length} aria-valuenow={index + 1} aria-label={t('lesson.progress', { step: index + 1, total: lesson.steps.length })}>
          {lesson.steps.map((s, i) => {
            const done = i < index || (i === index && canAdvance);
            const r = results[s.id];
            return (
              <span key={s.id} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    'grid shrink-0 place-items-center rounded-full transition-all',
                    s.kind === 'info' ? 'size-6' : 'size-8',
                    i === index ? 'bg-cobalt-500 text-white ring-4 ring-cobalt-200' : done ? (r && !r.resolved ? 'bg-violet-500 text-white' : 'bg-leaf-500 text-white') : 'bg-canvas text-muted',
                  )}
                >
                  {s.kind === 'info' ? <span className="size-2 rounded-full bg-current" /> : done && i !== index ? <Check className="size-4" strokeWidth={3.5} /> : <Star className="size-4" />}
                </span>
                {i < lesson.steps.length - 1 && <span className={cn('h-1.5 flex-1 rounded-full', i < index ? 'bg-leaf-500' : 'bg-canvas')} />}
              </span>
            );
          })}
        </div>
      </div>

      <main className="mx-auto mt-5 max-w-5xl px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.section
            key={step.id}
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-[44px] bg-white p-4 shadow-[0_12px_0_rgba(14,24,56,0.14),0_40px_70px_-30px_rgba(14,24,56,0.6)] sm:p-7"
          >
            {step.kind === 'info' && <InfoView step={step} reduce={reduce} lesson={lesson} />}
            {step.kind === 'choice' && <ChoiceView step={step} cur={cur} reduce={reduce} onPick={(id) => settle(step, id === step.correctId, id === step.correctId ? null : id)} />}
            {step.kind === 'tap' && <TapView step={step} cur={cur} reduce={reduce} onPick={(id) => settle(step, id === step.correctId, id === step.correctId ? null : id)} />}
            {step.kind === 'sequence' && (
              <SequenceView
                step={step}
                cur={cur}
                reduce={reduce}
                onChange={(slots) => patch(step.id, { slots, slotState: undefined, lastWrong: false })}
                onTap={() => play('tap')}
              />
            )}

            {feedback && (
              <div className="mt-5">
                <FeedbackBubble tone={feedback.tone} title={feedback.title} text={feedback.text} reduceMotion={reduce} />
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      {/* bottom controls — always in the same place */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-navy-900/35 to-transparent pb-[max(env(safe-area-inset-bottom),12px)] pt-8">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              play('tap');
              setIndex(Math.max(0, index - 1));
            }}
            disabled={index === 0}
            className="kid-btn h-14 bg-white px-4 text-lg text-navy-800 [--edge:#C9D3E8] sm:h-16 sm:px-5"
            aria-label={t('lesson.previous')}
          >
            <ArrowLeft className="size-6" />
            <span className="hidden sm:inline">{t('lesson.previous')}</span>
          </button>
          {step.kind !== 'info' && (
            <button
              type="button"
              onClick={showHint}
              disabled={cur.status !== 'answering' || cur.hintUsed}
              className="kid-btn h-14 bg-sun-400 px-4 text-lg text-navy-900 [--edge:#B3810A] sm:h-16 sm:px-6"
            >
              <Lightbulb className="size-6" />
              {t('lesson.hint')}
            </button>
          )}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {step.kind !== 'info' && cur.status === 'answering' && (
              <span className="hidden rounded-2xl bg-white/90 px-3 py-2 sm:block">
                <AttemptDots used={cur.attempts} />
              </span>
            )}
            {step.kind === 'sequence' && cur.status === 'answering' ? (
              <button
                type="button"
                onClick={() => {
                  const slots = cur.slots ?? [];
                  const correct = step.items.every((it, i) => slots[i] === it.id);
                  const slotState = step.items.map((it, i) => (slots[i] === it.id ? 'right' : 'wrong')) as ('right' | 'wrong')[];
                  const willReveal = !correct && cur.attempts + 1 >= MAX_ATTEMPTS;
                  settle(step, correct, null, willReveal ? { slots: step.items.map((i) => i.id), slotState: step.items.map(() => 'right') } : { slotState });
                }}
                disabled={(cur.slots ?? []).some((s) => s === null)}
                className="kid-btn h-14 bg-cobalt-500 px-6 text-lg text-white [--edge:#1F3BB0] sm:h-16 sm:px-8"
              >
                <CheckCheck className="size-6" />
                {t('lesson.check')}
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={next}
                disabled={!canAdvance}
                animate={canAdvance && step.kind !== 'info' && !reduce ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.6 }}
                className="kid-btn h-14 bg-leaf-500 px-6 text-lg text-white [--edge:#1B7A4B] sm:h-16 sm:px-8"
              >
                {index === lesson.steps.length - 1 ? t('lesson.finish') : t('lesson.next')}
                <ArrowRight className="size-6" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Feedback copy ───────────── */

function feedbackFor(
  step: LessonStep,
  cur: StepUI,
  t: (k: string, o?: Record<string, unknown>) => string,
  l: (v: { az: string; en: string; ru: string }) => string,
): { tone: 'neutral' | 'success' | 'gentle' | 'reveal' | 'hint'; title: string; text?: string } | null {
  if (step.kind === 'info') return null;
  const praise = [t('lesson.praise1'), t('lesson.praise2'), t('lesson.praise3')];
  if (cur.status === 'correct') {
    return { tone: 'success', title: praise[(cur.attempts + step.id.length) % 3], text: step.kind === 'tap' ? l(step.success) : l(step.explanation) };
  }
  if (cur.status === 'revealed') return { tone: 'reveal', title: t('lesson.revealTitle'), text: l(step.explanation) };
  if (cur.lastWrong) return { tone: 'gentle', title: t('lesson.tryAgain'), text: cur.hintUsed ? l(step.hint) : t('lesson.tryAgainText') };
  if (cur.hintUsed) return { tone: 'hint', title: t('lesson.hintTitle'), text: l(step.hint) };
  return { tone: 'neutral', title: step.kind === 'sequence' ? t('lesson.sequenceIntro') : step.kind === 'tap' ? t('lesson.tapIntro') : t('lesson.choiceIntro') };
}

/* ───────────── Step views ───────────── */

function IntroScene({ lesson, reduce }: { lesson: Lesson; reduce: boolean }) {
  const { t } = useLang();
  if (lesson.theme === 'hygiene') return <SinkScene waterOn bubbles interactive={false} reduceMotion={reduce} targets={[{ id: 'faucet', label: t('lesson.obj.faucet'), state: 'idle' }, { id: 'soap', label: t('lesson.obj.soap'), state: 'idle' }, { id: 'towel', label: t('lesson.obj.towel'), state: 'idle' }]} />;
  if (lesson.theme === 'safety') return <RoadScene light="green" />;
  return <FacesScene labels={[t('feelings.happy'), t('feelings.sad'), t('feelings.angry')]} reduceMotion={reduce} />;
}

function InfoView({ step, reduce, lesson }: { step: Extract<LessonStep, { kind: 'info' }>; reduce: boolean; lesson: Lesson }) {
  const { t, l } = useLang();
  let visual: React.ReactNode;
  if (step.visual === 'scene-sink') visual = <SinkScene waterOn bubbles interactive={false} reduceMotion={reduce} targets={[{ id: 'faucet', label: t('lesson.obj.faucet'), state: 'idle' }, { id: 'soap', label: t('lesson.obj.soap'), state: 'idle' }, { id: 'towel', label: t('lesson.obj.towel'), state: 'idle' }]} />;
  else if (step.visual === 'scene-road') visual = <RoadScene light="red" />;
  else if (step.visual === 'scene-faces') visual = <FacesScene labels={[t('feelings.happy'), t('feelings.sad'), t('feelings.angry')]} reduceMotion={reduce} />;
  else
    visual = (
      <div className={cn('grid aspect-[4/3] place-items-center rounded-[32px] bg-gradient-to-br p-8', visualTone(step.visual))}>
        <LessonVisual visual={step.visual} className="max-h-full max-w-[70%]" animate={!reduce} />
      </div>
    );
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_1fr]">
      {visual}
      <div className="px-1 lg:pr-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1 text-sm font-extrabold text-sun-700">
          <Sparkles className="size-4" /> {t('lesson.learnCard')}
        </span>
        <h2 className="mt-3 text-[30px] font-black leading-tight text-navy-800 sm:text-[38px]">{l(step.title)}</h2>
        <p className="mt-3 text-xl font-bold leading-relaxed text-muted">{l(step.body)}</p>
        <p className="mt-4 text-sm font-bold text-muted/80">{l(lesson.title)}</p>
      </div>
    </div>
  );
}

function optionState(id: string, step: ChoiceStep | TapStep, cur: StepUI): TargetState {
  if (cur.status === 'correct' && id === step.correctId) return 'correct';
  if (cur.status === 'revealed' && id === step.correctId) return 'reveal';
  if (cur.wrong.includes(id)) return 'wrong';
  if (cur.hintTarget === id || cur.status !== 'answering') return 'dim';
  return 'idle';
}

function ChoiceView({ step, cur, reduce, onPick }: { step: ChoiceStep; cur: StepUI; reduce: boolean; onPick: (id: string) => void }) {
  const { t, l } = useLang();
  return (
    <div>
      <h2 className="text-[26px] font-black leading-tight text-navy-800 sm:text-[34px]">{l(step.prompt)}</h2>
      <div className={cn('mt-5 grid gap-5', step.visual && 'lg:grid-cols-[0.9fr_1.1fr]')}>
        {step.visual && (
          <div className={cn('grid aspect-square max-h-[360px] w-full place-items-center rounded-[32px] bg-gradient-to-br p-6 lg:aspect-auto lg:max-h-none', visualTone(step.visual))}>
            <LessonVisual visual={step.visual} className="max-h-[300px] max-w-[78%]" animate={!reduce} />
          </div>
        )}
        <ul className={cn('grid gap-3', step.visual ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3')} role="list">
          {step.options.map((o) => {
            const st = optionState(o.id, step, cur);
            const disabled = cur.status !== 'answering';
            return (
              <li key={o.id}>
                <motion.button
                  type="button"
                  onClick={() => onPick(o.id)}
                  disabled={disabled}
                  whileHover={disabled || reduce ? undefined : { y: -3 }}
                  whileTap={disabled || reduce ? undefined : { scale: 0.97 }}
                  animate={st === 'wrong' && !reduce ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'relative flex w-full items-center gap-4 rounded-[28px] border-[3px] bg-white p-3 text-left transition-[border,box-shadow,opacity] duration-200',
                    step.visual ? 'flex-row' : 'flex-row sm:flex-col sm:text-center',
                    st === 'idle' && 'border-line shadow-[0_6px_0_#E2E7F3] hover:border-cobalt-300',
                    (st === 'correct' || st === 'reveal') && 'border-leaf-500 shadow-[0_6px_0_#7FD6A7]',
                    st === 'wrong' && 'border-coral-300 opacity-70 shadow-none',
                    st === 'dim' && 'border-line opacity-45 shadow-none',
                  )}
                  aria-label={l(o.label)}
                >
                  <span className={cn('grid shrink-0 place-items-center rounded-[22px] bg-gradient-to-br p-2', visualTone(o.visual), step.visual ? 'size-20 sm:size-24' : 'size-20 sm:aspect-square sm:size-auto sm:w-full')}>
                    <LessonVisual visual={o.visual} className="max-h-full max-w-[86%]" animate={!reduce} />
                  </span>
                  <span className="flex-1 text-xl font-black leading-tight text-navy-800 sm:text-[22px]">{l(o.label)}</span>
                  {(st === 'correct' || st === 'reveal') && (
                    <span className="absolute -right-2 -top-2 grid size-10 place-items-center rounded-full bg-leaf-500 text-white shadow-lg">
                      <Check className="size-6" strokeWidth={3.5} />
                    </span>
                  )}
                  {st === 'reveal' && <span className="absolute -top-3 left-4 rounded-full bg-leaf-500 px-2.5 py-0.5 text-xs font-extrabold text-white">{t('lesson.rightAnswer')}</span>}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function TapView({ step, cur, reduce, onPick }: { step: TapStep; cur: StepUI; reduce: boolean; onPick: (id: string) => void }) {
  const { l } = useLang();
  const targets: SceneTarget[] = step.targets.map((o) => {
    const st = optionState(o.id, step, cur);
    return { id: o.id, label: l(o.label), state: st, disabled: cur.status !== 'answering', onSelect: () => onPick(o.id) };
  });
  const resolved = cur.status !== 'answering';
  return (
    <div>
      <h2 className="text-[26px] font-black leading-tight text-navy-800 sm:text-[34px]">{l(step.prompt)}</h2>
      <div className="mx-auto mt-5 w-full" style={{ maxWidth: 'max(300px, min(48rem, calc((100dvh - 410px) * 4 / 3)))' }}>
        {step.scene === 'sink' && (
          <SinkScene targets={targets} reduceMotion={reduce} waterOn={step.id === 'hw-soap' || (step.id === 'hw-faucet' && resolved)} bubbles={step.id === 'hw-soap' && resolved} />
        )}
        {step.scene === 'light' && <LightScene targets={targets} reduceMotion={reduce} />}
      </div>
    </div>
  );
}

function SequenceView({
  step,
  cur,
  reduce,
  onChange,
  onTap,
}: {
  step: SequenceStep;
  cur: StepUI;
  reduce: boolean;
  onChange: (slots: (string | null)[]) => void;
  onTap: () => void;
}) {
  const { l } = useLang();
  const poolOrder = useMemo(() => stableShuffle(step.items, step.id), [step]);
  return (
    <div>
      <h2 className="text-[26px] font-black leading-tight text-navy-800 sm:text-[34px]">{l(step.prompt)}</h2>
      <div className="mt-5">
        <SequenceBoard
          items={step.items}
          poolOrder={poolOrder}
          slots={cur.slots ?? step.items.map(() => null)}
          onChange={onChange}
          locked={cur.status !== 'answering'}
          slotState={cur.slotState}
          highlightId={cur.status === 'answering' && cur.hintUsed ? cur.hintTarget : null}
          reduceMotion={reduce}
          onTap={onTap}
        />
      </div>
    </div>
  );
}
