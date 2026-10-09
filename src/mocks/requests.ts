import type { SpecialistRequest } from '@/types';
import { daysAgo } from '@/lib/dates';
import { AYLIN_ID, EXTERNAL_PARENTS } from './children';
import { DEMO_SPECIALIST_ID } from './specialists';

const iso = (days: number, hour = 11) => daysAgo(days, hour).toISOString();

export function createDemoRequests(): SpecialistRequest[] {
  return [
    {
      id: 'req-demo-aylin-old',
      parentId: 'u-parent',
      parentName: 'Səbinə Məmmədova',
      childId: AYLIN_ID,
      specialistId: 'sp-aynur',
      message: 'Emosiyaları tanımaq mövzusunda onlayn görüş planlaşdırmaq istəyirik.',
      goals: ['emotions'],
      consentAt: iso(12, 9),
      createdAt: iso(12, 9),
      updatedAt: iso(10, 15),
      status: 'canceled',
      history: [
        { status: 'pending', at: iso(12, 9), by: 'parent' },
        { status: 'canceled', at: iso(10, 15), by: 'parent' },
      ],
      demo: true,
    },
    {
      id: 'req-demo-kamran',
      parentId: 'u-family-2',
      parentName: EXTERNAL_PARENTS['u-family-2'],
      childId: 'child-kamran',
      specialistId: DEMO_SPECIALIST_ID,
      message: 'Kamran əsasən tək sözlərlə danışır. PECS kartlarından istifadəni genişləndirmək istəyirik.',
      goals: ['communication'],
      consentAt: iso(9, 10),
      createdAt: iso(9, 10),
      updatedAt: iso(8, 14),
      status: 'accepted',
      history: [
        { status: 'pending', at: iso(9, 10), by: 'parent' },
        { status: 'accepted', at: iso(8, 14), by: 'specialist' },
      ],
      demo: true,
    },
    {
      id: 'req-demo-zahra',
      parentId: 'u-family-3',
      parentName: EXTERNAL_PARENTS['u-family-3'],
      childId: 'child-zahra',
      specialistId: DEMO_SPECIALIST_ID,
      message: 'Salam! Zəhra axşamlar çətin sakitləşir və yeni sözləri işlətməkdə çəkinir. Evdə vizual cədvəl və nitq oyunları ilə bağlı məsləhət almaq istərdik.',
      goals: ['communication', 'routine'],
      consentAt: iso(1, 18),
      createdAt: iso(1, 18),
      updatedAt: iso(1, 18),
      status: 'pending',
      history: [{ status: 'pending', at: iso(1, 18), by: 'parent' }],
      demo: true,
    },
    {
      id: 'req-demo-nihad',
      parentId: 'u-family-4',
      parentName: EXTERNAL_PARENTS['u-family-4'],
      childId: 'child-nihad',
      specialistId: DEMO_SPECIALIST_ID,
      message: 'Əl motorikası üçün erqoterapiya axtarırıq.',
      goals: ['motor'],
      consentAt: iso(4, 13),
      createdAt: iso(4, 13),
      updatedAt: iso(3, 10),
      status: 'rejected',
      history: [
        { status: 'pending', at: iso(4, 13), by: 'parent' },
        { status: 'rejected', at: iso(3, 10), by: 'specialist' },
      ],
      demo: true,
    },
  ];
}
