import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { EmptyState, PageHeader, Segmented } from '@/components/ui';
import { useTeacherData } from './useTeacherData';
import { CaseRow } from './TeacherDashboard';

type Tab = 'all' | 'pending' | 'accepted' | 'rejected' | 'closed';

export default function TeacherRequests() {
  const { t } = useLang();
  const data = useTeacherData();
  const [tab, setTab] = useState<Tab>('all');
  const list = tab === 'all' ? data.cases : data[tab];
  return (
    <div>
      <PageHeader eyebrow={t('teacher.requestsEyebrow')} title={t('teacher.requestsTitle')} subtitle={t('teacher.requestsSubtitle')} />
      <Segmented
        className="mb-5"
        label={t('teacher.requestsTitle')}
        value={tab}
        onChange={setTab}
        options={(['all', 'pending', 'accepted', 'rejected', 'closed'] as Tab[]).map((k) => ({
          value: k,
          label: (
            <span className="inline-flex items-center gap-1.5">
              {k === 'all' ? t('common.all') : t(`teacher.stats.${k}`)}
              <span className="rounded-full bg-canvas px-1.5 text-[11px] font-black text-muted ring-1 ring-line">{k === 'all' ? data.cases.length : data[k].length}</span>
            </span>
          ),
        }))}
      />
      {list.length === 0 ? (
        <EmptyState icon={<Inbox className="size-6" />} title={t('teacher.emptyTab')} description={t('teacher.emptyTabText')} />
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <CaseRow key={c.request.id} c={c} highlight={c.request.status === 'pending'} />
          ))}
        </ul>
      )}
    </div>
  );
}
