import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock3,
  Filter,
  Languages,
  MapPin,
  MonitorSmartphone,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { CITIES, SPECIALISTS, getSpecialist } from '@/mocks/specialists';
import type { ConsultFormat, Lang, RequestStatus, Specialist, SpecialistRequest, SpecialtyKey } from '@/types';
import { KidAvatar } from '@/components/illustrations/Brand';
import { Badge, Button, Card, ChipToggle, DemoBadge, Dialog, EmptyState, Field, PageHeader, SectionHeader, Segmented, Switch } from '@/components/ui';
import { StatusBadge } from '@/features/shared';

const SPECIALTIES: SpecialtyKey[] = ['speech', 'special_ed', 'aba', 'psychology', 'ot'];
const GOALS = ['communication', 'safety', 'emotions', 'routine', 'motor', 'behavior'];
const PRICE_MAX = 120;

interface Filters {
  q: string;
  specialty: SpecialtyKey | 'all';
  city: string;
  format: ConsultFormat | 'all';
  languages: Lang[];
  minExp: number;
  maxPrice: number;
  verified: boolean;
}
const DEFAULT_FILTERS: Filters = { q: '', specialty: 'all', city: 'all', format: 'all', languages: [], minExp: 0, maxPrice: PRICE_MAX, verified: false };

export function SpecialistAvatar({ s, size = 56 }: { s: Specialist; size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-[22px] font-black text-white shadow-[inset_0_-6px_0_rgba(0,0,0,0.12)]"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(135deg, ${s.palette[0]}, ${s.palette[1]})` }}
      aria-hidden="true"
    >
      {s.initials}
      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-white/60" />
    </span>
  );
}

export default function MarketplacePage() {
  const { data, setRequestStatus, user } = useStore();
  const { t, l, lang } = useLang();
  const reduce = useReduceMotion();
  const toast = useToast();
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [detail, setDetail] = useState<Specialist | null>(null);
  const [requestFor, setRequestFor] = useState<Specialist | null>(null);
  const [confirm, setConfirm] = useState<{ req: SpecialistRequest; status: RequestStatus } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return SPECIALISTS.filter((s) => {
      if (f.specialty !== 'all' && !s.specialties.includes(f.specialty)) return false;
      if (f.city !== 'all' && s.city !== f.city) return false;
      if (f.format !== 'all' && s.format !== f.format && !(s.format === 'hybrid' && f.format !== 'hybrid')) return false;
      if (f.languages.length && !f.languages.every((lg) => s.languages.includes(lg))) return false;
      if (s.experienceYears < f.minExp) return false;
      if (s.priceMin > f.maxPrice) return false;
      if (f.verified && !s.verified) return false;
      if (q) {
        const hay = [s.name, l(s.title), l(s.bio), s.city, l(s.district), ...s.specialties.map((x) => t(`specialties.${x}`))].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => Number(!!b.demoAccount) - Number(!!a.demoAccount) || b.rating - a.rating);
  }, [f, l, t]);

  const myRequests = data.requests.filter((r) => r.parentId === user?.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const activeCount = Object.entries(f).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(DEFAULT_FILTERS[k as keyof Filters])).length;

  const filterPanel = (
    <div className="space-y-5">
      <Field label={t('marketplace.specialty')} htmlFor="f-spec">
        <select id="f-spec" className="input" value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value as Filters['specialty'] })}>
          <option value="all">{t('common.all')}</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {t(`specialties.${s}`)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t('marketplace.city')} htmlFor="f-city">
        <select id="f-city" className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>
          <option value="all">{t('common.all')}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {t(`cities.${c}`)}
            </option>
          ))}
        </select>
      </Field>
      <div>
        <p className="mb-2 text-[13px] font-bold text-ink">{t('marketplace.format')}</p>
        <Segmented
          size="sm"
          label={t('marketplace.format')}
          value={f.format}
          onChange={(v) => setF({ ...f, format: v })}
          options={[{ value: 'all', label: t('common.all') }, ...(['online', 'in_person', 'hybrid'] as ConsultFormat[]).map((x) => ({ value: x, label: t(`formats.${x}`) }))]}
        />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-bold text-ink">{t('marketplace.languages')}</p>
        <div className="flex flex-wrap gap-2">
          {(['az', 'ru', 'en'] as Lang[]).map((lg) => (
            <ChipToggle key={lg} selected={f.languages.includes(lg)} onClick={() => setF({ ...f, languages: f.languages.includes(lg) ? f.languages.filter((x) => x !== lg) : [...f.languages, lg] })} className="py-1.5">
              {t(`langNames.${lg}`)}
            </ChipToggle>
          ))}
        </div>
      </div>
      <Field label={t('marketplace.minExperience')} htmlFor="f-exp">
        <select id="f-exp" className="input" value={f.minExp} onChange={(e) => setF({ ...f, minExp: Number(e.target.value) })}>
          {[0, 3, 5, 10].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? t('marketplace.anyExperience') : t('marketplace.yearsPlus', { count: n })}
            </option>
          ))}
        </select>
      </Field>
      <div>
        <label htmlFor="f-price" className="mb-2 flex justify-between text-[13px] font-bold text-ink">
          {t('marketplace.maxPrice')}
          <span className="text-cobalt-600">{f.maxPrice >= PRICE_MAX ? t('marketplace.anyPrice') : `≤ ${f.maxPrice} AZN`}</span>
        </label>
        <input id="f-price" type="range" min={20} max={PRICE_MAX} step={5} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: Number(e.target.value) })} className="w-full accent-cobalt-500" />
      </div>
      <Switch checked={f.verified} onChange={(v) => setF({ ...f, verified: v })} label={t('marketplace.verifiedOnly')} description={t('marketplace.verifiedHint')} />
      <Button variant="ghost" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={() => setF(DEFAULT_FILTERS)} disabled={activeCount === 0}>
        {t('marketplace.resetFilters')}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('marketplace.eyebrow')} title={t('marketplace.title')} subtitle={t('marketplace.subtitle')} />

      {/* hero search */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-teal-600 via-turquoise-500 to-cobalt-500 p-5 text-white sm:p-7">
        <div className="absolute -right-10 -top-16 size-60 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <p className="text-lg font-extrabold">{t('marketplace.heroTitle')}</p>
            <p className="text-sm text-white/80">{t('marketplace.heroText')}</p>
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
              placeholder={t('marketplace.searchPlaceholder')}
              aria-label={t('marketplace.search')}
              className="h-14 w-full rounded-2xl border-0 bg-white pl-12 pr-4 text-[15px] text-ink shadow-lg placeholder:text-muted/70 focus:outline-none focus:ring-4 focus:ring-white/40"
            />
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setF({ ...f, specialty: f.specialty === s ? 'all' : s })}
              aria-pressed={f.specialty === s}
              className={cn('rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors', f.specialty === s ? 'bg-white text-teal-700' : 'bg-white/15 text-white hover:bg-white/25')}
            >
              {t(`specialties.${s}`)}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-5">
            <p className="mb-4 flex items-center gap-2 font-extrabold text-ink">
              <Filter className="size-4" /> {t('marketplace.filters')}
            </p>
            {filterPanel}
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted" aria-live="polite">
              {t('marketplace.results', { count: results.length })}
            </p>
            <Button variant="secondary" size="sm" className="lg:hidden" icon={<Filter className="size-3.5" />} onClick={() => setShowFilters(true)}>
              {t('marketplace.filters')}
              {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-cobalt-500 text-[11px] text-white">{activeCount}</span>}
            </Button>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={<Users className="size-6" />}
              title={t('marketplace.noResults')}
              description={t('marketplace.noResultsText')}
              action={
                <Button variant="secondary" icon={<RotateCcw className="size-4" />} onClick={() => setF(DEFAULT_FILTERS)}>
                  {t('marketplace.resetFilters')}
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 xl:grid-cols-2">
              {results.map((s, i) => {
                const active = data.requests.find((r) => r.specialistId === s.id && r.parentId === user?.id && (r.status === 'pending' || r.status === 'accepted'));
                return (
                  <motion.li key={s.id} layout={!reduce} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.03 }}>
                    <article className="card flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
                      <div className="flex items-start gap-4">
                        <SpecialistAvatar s={s} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-base font-extrabold text-ink">{s.name}</h3>
                            {s.verified && <BadgeCheck className="size-5 text-cobalt-500" aria-label={t('marketplace.verified')} />}
                          </div>
                          <p className="text-sm text-muted">{l(s.title)}</p>
                          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-ink">
                            <Star className="size-3.5 fill-sun-400 text-sun-500" /> {s.rating.toFixed(1)}
                            <span className="font-semibold text-muted">· {t('marketplace.sessions', { count: s.sessionsCount })}</span>
                          </div>
                        </div>
                        {s.demoAccount && <DemoBadge label={t('marketplace.demoAccount')} />}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.specialties.map((x) => (
                          <Badge key={x} tone="teal">
                            {t(`specialties.${x}`)}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted">{l(s.bio)}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                        <Meta icon={Briefcase} label={t('marketplace.years', { count: s.experienceYears })} />
                        <Meta icon={MapPin} label={`${t(`cities.${s.city}`)}, ${l(s.district)}`} />
                        <Meta icon={MonitorSmartphone} label={t(`formats.${s.format}`)} />
                        <Meta icon={Languages} label={s.languages.map((x) => x.toUpperCase()).join(' · ')} />
                        <Meta icon={Wallet} label={`${s.priceMin}–${s.priceMax} AZN`} />
                        <Meta icon={Users} label={t('marketplace.ages', { min: s.ageMin, max: s.ageMax })} />
                      </dl>
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Button variant="secondary" size="sm" onClick={() => setDetail(s)}>
                          {t('marketplace.details')}
                        </Button>
                        {active ? (
                          <span className="ml-auto">
                            <StatusBadge status={active.status} />
                          </span>
                        ) : (
                          <Button size="sm" className="ml-auto" icon={<Send className="size-3.5" />} onClick={() => setRequestFor(s)}>
                            {t('marketplace.request')}
                          </Button>
                        )}
                      </div>
                    </article>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* my requests */}
      <Card className="p-5 sm:p-6" as="section">
        <SectionHeader title={t('marketplace.myRequests')} subtitle={t('marketplace.myRequestsText')} className="mb-4" />
        {myRequests.length === 0 ? (
          <p className="rounded-2xl bg-canvas p-5 text-center text-sm text-muted">{t('marketplace.noRequests')}</p>
        ) : (
          <ul className="space-y-3">
            {myRequests.map((r) => {
              const s = getSpecialist(r.specialistId);
              const child = data.children.find((c) => c.id === r.childId);
              if (!s) return null;
              return (
                <li key={r.id} className="flex flex-col gap-4 rounded-2xl border border-line p-4 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <SpecialistAvatar s={s} size={46} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-extrabold text-ink">
                        {s.name} <StatusBadge status={r.status} /> {r.demo && <Badge tone="sun">{t('common.demo')}</Badge>}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        {child && <KidAvatar avatar={child.avatar} size={18} ring={false} />}
                        {child?.name} · {t('marketplace.updated', { date: formatDateTime(r.updatedAt, lang) })}
                      </p>
                    </div>
                  </div>
                  <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-muted">
                    {r.history.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        {i > 0 && <span className="h-px w-3 bg-line" />}
                        <span className="rounded-full bg-canvas px-2 py-0.5">{t(`requestStatus.${h.status}`)}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex gap-2">
                    {r.status === 'pending' && (
                      <Button size="sm" variant="secondary" icon={<X className="size-3.5" />} onClick={() => setConfirm({ req: r, status: 'canceled' })}>
                        {t('marketplace.cancelRequest')}
                      </Button>
                    )}
                    {r.status === 'accepted' && (
                      <Button size="sm" variant="secondary" icon={<ShieldCheck className="size-3.5" />} onClick={() => setConfirm({ req: r, status: 'revoked' })}>
                        {t('marketplace.revokeAccess')}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">{t('marketplace.frontendNote')}</p>
      </Card>

      {/* mobile filters */}
      <Dialog open={showFilters} onClose={() => setShowFilters(false)} title={t('marketplace.filters')} footer={<Button onClick={() => setShowFilters(false)}>{t('marketplace.showResults', { count: results.length })}</Button>}>
        {filterPanel}
      </Dialog>

      <SpecialistDetail s={detail} onClose={() => setDetail(null)} onRequest={(s) => { setDetail(null); setRequestFor(s); }} />
      <RequestDialog s={requestFor} onClose={() => setRequestFor(null)} />

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={confirm?.status === 'revoked' ? t('marketplace.revokeTitle') : t('marketplace.cancelTitle')}
        description={confirm?.status === 'revoked' ? t('marketplace.revokeText') : t('marketplace.cancelText')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              {t('common.back')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm) {
                  setRequestStatus(confirm.req.id, confirm.status, 'parent');
                  toast({ title: confirm.status === 'revoked' ? t('toast.accessRevoked') : t('toast.requestCanceled'), tone: 'info' });
                }
                setConfirm(null);
              }}
            >
              {confirm?.status === 'revoked' ? t('marketplace.revokeAccess') : t('marketplace.cancelRequest')}
            </Button>
          </>
        }
      />
    </div>
  );
}

function Meta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-ink">
      <Icon className="size-4 shrink-0 text-muted" />
      <span className="truncate font-semibold">{label}</span>
    </div>
  );
}

function SpecialistDetail({ s, onClose, onRequest }: { s: Specialist | null; onClose: () => void; onRequest: (s: Specialist) => void }) {
  const { data, user } = useStore();
  const { t, l } = useLang();
  const active = s ? data.requests.find((r) => r.specialistId === s.id && r.parentId === user?.id && (r.status === 'pending' || r.status === 'accepted')) : null;
  return (
    <Dialog open={!!s} onClose={onClose} size="lg" title={s?.name} description={s ? l(s.title) : ''}>
      {s && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-r from-canvas to-white p-4">
            <SpecialistAvatar s={s} size={72} />
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {s.verified ? (
                  <Badge tone="cobalt" icon={<BadgeCheck className="size-3.5" />}>
                    {t('marketplace.verified')}
                  </Badge>
                ) : (
                  <Badge tone="gray">{t('marketplace.notVerified')}</Badge>
                )}
                {s.demoAccount && <DemoBadge label={t('marketplace.demoAccount')} />}
                {s.specialties.map((x) => (
                  <Badge key={x} tone="teal">
                    {t(`specialties.${x}`)}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-bold text-ink">
                <Star className="size-4 fill-sun-400 text-sun-500" /> {s.rating.toFixed(1)} <span className="font-semibold text-muted">· {t('marketplace.sessions', { count: s.sessionsCount })}</span>
              </p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{t('marketplace.about')}</p>
            <p className="text-[15px] leading-relaxed text-ink">{l(s.bio)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{t('marketplace.approach')}</p>
            <p className="text-[15px] leading-relaxed text-ink">{l(s.approach)}</p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Briefcase, k: 'marketplace.experience', v: t('marketplace.years', { count: s.experienceYears }) },
              { icon: MapPin, k: 'marketplace.location', v: `${t(`cities.${s.city}`)}, ${l(s.district)}` },
              { icon: MonitorSmartphone, k: 'marketplace.format', v: t(`formats.${s.format}`) },
              { icon: Languages, k: 'marketplace.languages', v: s.languages.map((x) => t(`langNames.${x}`)).join(', ') },
              { icon: Wallet, k: 'marketplace.price', v: `${s.priceMin}–${s.priceMax} AZN` },
              { icon: Users, k: 'marketplace.ageGroup', v: t('marketplace.ages', { min: s.ageMin, max: s.ageMax }) },
            ].map((m) => (
              <div key={m.k} className="rounded-2xl bg-canvas p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                  <m.icon className="size-3.5" /> {t(m.k)}
                </dt>
                <dd className="mt-1 text-sm font-extrabold text-ink">{m.v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
            {active ? (
              <p className="mr-auto flex items-center gap-2 text-sm font-semibold text-muted">
                <Clock3 className="size-4" /> {t('marketplace.alreadyRequested')} <StatusBadge status={active.status} />
              </p>
            ) : (
              <Button icon={<Send className="size-4" />} onClick={() => onRequest(s)}>
                {t('marketplace.request')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

function RequestDialog({ s, onClose }: { s: Specialist | null; onClose: () => void }) {
  const { data, selectedChild, createRequest } = useStore();
  const { t, l } = useLang();
  const toast = useToast();
  const [childId, setChildId] = useState(selectedChild.id);
  const [goals, setGoals] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [done, setDone] = useState<SpecialistRequest | null>(null);

  const reset = () => {
    setChildId(selectedChild.id);
    setGoals([]);
    setMessage('');
    setConsent(false);
    setConsentError(false);
    setDone(null);
  };
  const close = () => {
    onClose();
    window.setTimeout(reset, 250);
  };

  const submit = () => {
    if (!s) return;
    if (!consent) {
      setConsentError(true);
      return;
    }
    const req = createRequest({ childId, specialistId: s.id, message: message.trim() || t('marketplace.defaultMessage'), goals });
    setDone(req);
    toast({ title: t('toast.requestSent'), description: s.name });
  };

  return (
    <Dialog
      open={!!s}
      onClose={close}
      size="md"
      title={done ? t('marketplace.sentTitle') : t('marketplace.requestTitle', { name: s?.name ?? '' })}
      description={done ? undefined : s ? l(s.title) : ''}
      footer={
        done ? (
          <Button onClick={close}>{t('common.done')}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button icon={<Send className="size-4" />} onClick={submit}>
              {t('marketplace.send')}
            </Button>
          </>
        )
      }
    >
      {done && s ? (
        <div className="flex flex-col items-center py-4 text-center">
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid size-16 place-items-center rounded-full bg-leaf-500 text-white shadow-lg">
            <CheckCircle2 className="size-8" />
          </motion.span>
          <p className="mt-4 text-lg font-extrabold text-ink">{t('marketplace.sentText', { name: s.name })}</p>
          <div className="mt-3">
            <StatusBadge status="pending" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">{t('marketplace.sentHint')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <Field label={t('marketplace.forChild')} htmlFor="rq-child">
            <select id="rq-child" className="input" value={childId} onChange={(e) => setChildId(e.target.value)}>
              {data.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || t('profile.unnamed')}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink">{t('marketplace.goals')}</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <ChipToggle key={g} selected={goals.includes(g)} onClick={() => setGoals(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g])} className="py-1.5">
                  {t(`goals.${g}`)}
                </ChipToggle>
              ))}
            </div>
          </div>
          <Field label={t('marketplace.message')} htmlFor="rq-msg" hint={t('marketplace.messageHint')}>
            <textarea id="rq-msg" rows={3} className="input resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('marketplace.messagePlaceholder')} />
          </Field>
          <div className={cn('rounded-2xl border-2 p-4 transition-colors', consentError ? 'border-coral-300 bg-coral-50' : consent ? 'border-leaf-500 bg-leaf-50' : 'border-line')}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setConsentError(false);
                }}
                className="mt-0.5 size-5 shrink-0 accent-cobalt-500"
                aria-invalid={consentError}
                aria-describedby="consent-help"
              />
              <span className="text-sm font-bold text-ink">{t('marketplace.consent')}</span>
            </label>
            <p id="consent-help" className={cn('mt-2 pl-8 text-xs', consentError ? 'font-bold text-coral-700' : 'text-muted')} role={consentError ? 'alert' : undefined}>
              {consentError ? t('marketplace.consentRequired') : t('marketplace.consentHelp')}
            </p>
          </div>
        </div>
      )}
    </Dialog>
  );
}
