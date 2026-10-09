import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Table2, LineChart as LineIcon } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { formatDate } from '@/lib/dates';
import type { DailyPoint, SkillSummary } from '@/lib/learning-metrics';
import { cn } from '@/lib/cn';

/* Validated pair (light surface): cobalt + turquoise — CVD ΔE 24.6. Contrast relief via legend, end labels and table view. */
const SERIES = { firstTry: '#3563F6', completion: '#10BFC3' };
const PREV = '#BCCDFF';
const CURR = '#3563F6';

interface TipProps {
  active?: boolean;
  payload?: { name?: string; value?: number | null; color?: string; dataKey?: string | number }[];
  label?: string | number;
  labelFmt: (label: string) => string;
}

function ChartTooltip({ active, payload, label, labelFmt }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-44 rounded-2xl border border-line bg-white px-3.5 py-3 text-[13px] shadow-[0_18px_40px_-18px_rgba(14,24,56,0.4)]">
      <p className="mb-1.5 font-extrabold text-ink">{labelFmt(String(label))}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-muted">
            <span className="size-2.5 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold tabular-nums text-ink">{p.value === null || p.value === undefined ? '—' : `${p.value}%`}</span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] font-semibold text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="h-2.5 w-4 rounded-full" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function ViewToggle({ table, onChange }: { table: boolean; onChange: (v: boolean) => void }) {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={() => onChange(!table)}
      className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 text-xs font-bold text-muted hover:text-ink"
      aria-pressed={table}
    >
      {table ? <LineIcon className="size-3.5" /> : <Table2 className="size-3.5" />}
      {table ? t('charts.showChart') : t('charts.showTable')}
    </button>
  );
}

export function DailyAccuracyChart({ series }: { series: DailyPoint[] }) {
  const { t, lang } = useLang();
  const [table, setTable] = useState(false);
  const fmt = (d: string) => formatDate(d, lang, { weekday: 'short', day: 'numeric', month: 'short' });
  const data = series.map((p) => ({ ...p, label: p.date }));
  const last = [...data].reverse().find((p) => p.firstTry !== null);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Legend
          items={[
            { color: SERIES.firstTry, label: t('metrics.firstTry') },
            { color: SERIES.completion, label: t('metrics.completion') },
          ]}
        />
        <ViewToggle table={table} onChange={setTable} />
      </div>
      {table ? (
        <div className="max-h-[260px] overflow-auto rounded-2xl border border-line">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-canvas text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">{t('charts.date')}</th>
                <th className="px-3 py-2 text-right font-bold">{t('metrics.firstTry')}</th>
                <th className="px-3 py-2 text-right font-bold">{t('metrics.completion')}</th>
                <th className="px-3 py-2 text-right font-bold">{t('charts.activities')}</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((p) => (
                <tr key={p.date} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{fmt(p.date)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.firstTry === null ? '—' : `${p.firstTry}%`}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.completion === null ? '—' : `${p.completion}%`}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 40, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="fillFirst" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={SERIES.firstTry} stopOpacity={0.22} />
                  <stop offset="1" stopColor={SERIES.firstTry} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E7F3" strokeDasharray="3 5" />
              <XAxis
                dataKey="label"
                tickFormatter={(d: string) => formatDate(d, lang, { day: 'numeric' })}
                tick={{ fill: '#59648A', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={4}
              />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#59648A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                cursor={{ stroke: '#8EAAFF', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                content={(props) => <ChartTooltip {...(props as unknown as Omit<TipProps, 'labelFmt'>)} labelFmt={fmt} />}
              />
              <Area
                type="monotone"
                dataKey="completion"
                name={t('metrics.completion')}
                stroke={SERIES.completion}
                strokeWidth={2}
                fill="transparent"
                connectNulls
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="firstTry"
                name={t('metrics.firstTry')}
                stroke={SERIES.firstTry}
                strokeWidth={2.5}
                fill="url(#fillFirst)"
                connectNulls
                dot={{ r: 3.5, fill: SERIES.firstTry, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                label={(props: { index?: number; x?: unknown; y?: unknown; value?: unknown }) =>
                  last && data[props.index ?? -1]?.date === last.date ? (
                    <text x={Number(props.x) + 8} y={Number(props.y) - 8} fill="#1F3BB0" fontSize={12} fontWeight={800}>
                      {String(props.value)}%
                    </text>
                  ) : (
                    <g />
                  )
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-[12px] text-muted">{t('charts.dailyNote')}</p>
    </div>
  );
}

export function WeeklyComparisonChart({ skills }: { skills: SkillSummary[] }) {
  const { t } = useLang();
  const [table, setTable] = useState(false);
  const data = skills.map((s) => ({
    skill: t(`skills.${s.skill}`),
    previous: s.previous.firstTry,
    current: s.current.firstTry,
  }));
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Legend
          items={[
            { color: PREV, label: t('charts.prevWeek') },
            { color: CURR, label: t('charts.thisWeek') },
          ]}
        />
        <ViewToggle table={table} onChange={setTable} />
      </div>
      {table ? (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-canvas text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">{t('charts.skill')}</th>
                <th className="px-3 py-2 text-right font-bold">{t('charts.prevWeek')}</th>
                <th className="px-3 py-2 text-right font-bold">{t('charts.thisWeek')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.skill} className="border-t border-line">
                  <td className="px-3 py-2 font-semibold">{d.skill}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{d.previous === null ? '—' : `${d.previous}%`}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{d.current === null ? '—' : `${d.current}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[236px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 18, right: 4, left: -22, bottom: 0 }} barGap={2} barCategoryGap="26%">
              <CartesianGrid vertical={false} stroke="#E2E7F3" strokeDasharray="3 5" />
              <XAxis dataKey="skill" tick={{ fill: '#59648A', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fill: '#59648A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip cursor={{ fill: '#EEF3FF', radius: 8 }} content={(props) => <ChartTooltip {...(props as unknown as Omit<TipProps, 'labelFmt'>)} labelFmt={(v) => v} />} />
              <Bar dataKey="previous" name={t('charts.prevWeek')} fill={PREV} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar
                dataKey="current"
                name={t('charts.thisWeek')}
                fill={CURR}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                label={{ position: 'top', fill: '#121A3A', fontSize: 12, fontWeight: 800, formatter: (v: unknown) => (v === null || v === undefined ? '' : `${v}%`) }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function MiniBars({ values, color = 'bg-cobalt-500', className }: { values: (number | null)[]; color?: string; className?: string }) {
  return (
    <div className={cn('flex h-10 items-end gap-[3px]', className)} aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className={cn('w-full min-w-[4px] rounded-t-[3px]', v === null ? 'bg-line' : color)} style={{ height: v === null ? 3 : `${Math.max(8, v)}%`, opacity: v === null ? 1 : 0.35 + (i / values.length) * 0.65 }} />
      ))}
    </div>
  );
}
