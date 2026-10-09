import { BadgeCheck, Briefcase, CalendarClock, Languages, MapPin, MonitorSmartphone, Star, Users, Wallet } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { formatDate } from '@/lib/dates';
import { Badge, Card, DemoBadge, PageHeader, SectionHeader } from '@/components/ui';
import { SpecialistAvatar } from '@/features/marketplace/MarketplacePage';
import { useTeacherData } from './useTeacherData';

const SLOTS = [
  { day: 1, times: ['10:00', '11:00', '15:00'] },
  { day: 3, times: ['09:30', '14:00'] },
  { day: 5, times: ['10:00', '12:00', '16:30'] },
];

export default function TeacherProfile() {
  const { t, l, lang } = useLang();
  const { specialist: s, accepted, cases } = useTeacherData();
  const weekday = (d: number) => formatDate(new Date(2024, 0, d), lang, { weekday: 'long' });

  return (
    <div>
      <PageHeader eyebrow={t('teacher.profileEyebrow')} title={t('teacher.profileTitle')} subtitle={t('teacher.profileSubtitle')} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="h-24" style={{ background: `linear-gradient(120deg, ${s.palette[0]}, ${s.palette[1]})` }} aria-hidden="true" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex flex-wrap items-end gap-4">
                <span className="rounded-[26px] bg-white p-1.5">
                  <SpecialistAvatar s={s} size={84} />
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
                    {s.name} {s.verified && <BadgeCheck className="size-6 text-cobalt-500" aria-label={t('marketplace.verified')} />}
                  </h2>
                  <p className="text-sm text-muted">{l(s.title)}</p>
                </div>
                <DemoBadge label={t('marketplace.demoAccount')} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.specialties.map((x) => (
                  <Badge key={x} tone="teal">
                    {t(`specialties.${x}`)}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-ink">{l(s.bio)}</p>
              <p className="mt-3 rounded-2xl bg-canvas p-4 text-sm text-muted">
                <span className="font-bold text-ink">{t('marketplace.approach')}: </span>
                {l(s.approach)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <SectionHeader title={t('teacher.details')} className="mb-4" />
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
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-6">
            <SectionHeader title={t('teacher.stats.title')} className="mb-4" />
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-sun-50 p-4">
                <dd className="flex items-center gap-1 text-2xl font-extrabold text-ink">
                  <Star className="size-5 fill-sun-400 text-sun-500" /> {s.rating.toFixed(1)}
                </dd>
                <dt className="text-xs font-semibold text-muted">{t('teacher.rating')}</dt>
              </div>
              <div className="rounded-2xl bg-turquoise-50 p-4">
                <dd className="text-2xl font-extrabold text-ink">{s.sessionsCount}</dd>
                <dt className="text-xs font-semibold text-muted">{t('teacher.sessions')}</dt>
              </div>
              <div className="rounded-2xl bg-leaf-50 p-4">
                <dd className="text-2xl font-extrabold text-ink">{accepted.length}</dd>
                <dt className="text-xs font-semibold text-muted">{t('teacher.stats.accepted')}</dt>
              </div>
              <div className="rounded-2xl bg-cobalt-50 p-4">
                <dd className="text-2xl font-extrabold text-ink">{cases.length}</dd>
                <dt className="text-xs font-semibold text-muted">{t('teacher.totalRequests')}</dt>
              </div>
            </dl>
          </Card>
          <Card className="p-6">
            <SectionHeader title={t('teacher.availability')} subtitle={t('teacher.availabilityText')} className="mb-4" />
            <ul className="space-y-3">
              {SLOTS.map((sl) => (
                <li key={sl.day}>
                  <p className="flex items-center gap-1.5 text-sm font-bold capitalize text-ink">
                    <CalendarClock className="size-4 text-muted" /> {weekday(sl.day)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sl.times.map((x) => (
                      <span key={x} className="rounded-xl bg-canvas px-2.5 py-1 text-xs font-bold text-ink ring-1 ring-line">
                        {x}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
