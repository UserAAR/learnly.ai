import { ArrowDownRight, ArrowRight, ArrowUpRight, Brain, Footprints, HandHeart, ListOrdered, Minus, Search, Smile, type LucideIcon } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { getLesson } from '@/mocks/lessons';
import { getGame } from '@/mocks/games';
import type { L10n, RequestStatus, Skill } from '@/types';
import type { Trend } from '@/lib/learning-metrics';
import { Badge, type Tone } from '@/components/ui';

export const SKILL_META: Record<Skill, { icon: LucideIcon; tone: Tone; color: string; soft: string; gradient: string }> = {
  hygiene: { icon: HandHeart, tone: 'teal', color: '#10BFC3', soft: 'bg-turquoise-50', gradient: 'from-turquoise-500 to-teal-500' },
  safety: { icon: Footprints, tone: 'cobalt', color: '#3563F6', soft: 'bg-cobalt-50', gradient: 'from-cobalt-500 to-cobalt-700' },
  emotions: { icon: Smile, tone: 'violet', color: '#8158E8', soft: 'bg-violet-50', gradient: 'from-violet-500 to-violet-700' },
  sequencing: { icon: ListOrdered, tone: 'sun', color: '#FFC21A', soft: 'bg-sun-50', gradient: 'from-sun-400 to-[#FFB547]' },
  attention: { icon: Search, tone: 'coral', color: '#FF6B5E', soft: 'bg-coral-50', gradient: 'from-coral-500 to-coral-600' },
};

export const BrainIcon = Brain;

export function activityTitle(slug: string): L10n {
  return getLesson(slug)?.title ?? getGame(slug)?.title ?? { az: slug, en: slug, ru: slug };
}

export function TrendBadge({ trend, delta, className }: { trend: Trend; delta: number | null; className?: string }) {
  const { t } = useLang();
  if (trend === 'na' || delta === null) return <Badge tone="gray" className={className}>{t('trend.na')}</Badge>;
  const sign = delta > 0 ? '+' : '';
  if (trend === 'up')
    return (
      <Badge tone="leaf" className={className} icon={<ArrowUpRight className="size-3.5" />}>
        {sign}
        {delta} {t('common.pp')}
      </Badge>
    );
  if (trend === 'down')
    return (
      <Badge tone="coral" className={className} icon={<ArrowDownRight className="size-3.5" />}>
        {delta} {t('common.pp')}
      </Badge>
    );
  return (
    <Badge tone="gray" className={className} icon={delta === 0 ? <Minus className="size-3.5" /> : <ArrowRight className="size-3.5" />}>
      {sign}
      {delta} {t('common.pp')}
    </Badge>
  );
}

export const STATUS_TONE: Record<RequestStatus, Tone> = {
  pending: 'sun',
  accepted: 'leaf',
  rejected: 'coral',
  canceled: 'gray',
  revoked: 'gray',
  closed: 'gray',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useLang();
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="size-1.5 rounded-full bg-current" />
      {t(`requestStatus.${status}`)}
    </Badge>
  );
}

export function pctText(v: number | null | undefined): string {
  return v === null || v === undefined ? '—' : `${v}%`;
}
