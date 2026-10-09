import type { AvatarConfig, ChildProfile, ExternalChild } from '@/types';
import { shiftKey, todayKey } from '@/lib/dates';

export const AVATAR_PRESETS: AvatarConfig[] = [
  { skin: '#F2C29B', hair: '#3B2416', hairStyle: 'puffs', shirt: '#FF6B5E', accent: '#FFD34E' },
  { skin: '#E9B48A', hair: '#1F1A17', hairStyle: 'short', shirt: '#3563F6', accent: '#10BFC3' },
  { skin: '#C98E64', hair: '#2A1A12', hairStyle: 'curly', shirt: '#36B878', accent: '#FFD34E' },
  { skin: '#F6D2B4', hair: '#8A4B22', hairStyle: 'bob', shirt: '#8158E8', accent: '#FF6B5E' },
  { skin: '#A8714E', hair: '#141010', hairStyle: 'long', shirt: '#10BFC3', accent: '#8158E8' },
  { skin: '#EDBE97', hair: '#5A3A22', hairStyle: 'short', shirt: '#FFB547', accent: '#3563F6' },
];

/** Known tag keys are translated in the UI; any other value is shown as typed. */
export const INTEREST_KEYS = ['trains', 'animals', 'music', 'drawing', 'puzzles', 'water', 'space', 'dinosaurs', 'cars', 'books', 'blocks', 'nature'];
export const THERAPY_KEYS = ['speech', 'aba', 'ot', 'psychology', 'music_therapy', 'special_ed'];
export const ALT_COMM_KEYS = ['pecs', 'gestures', 'sign', 'aac_device', 'visual_schedule'];

export function emptyChild(parentId: string, id: string, avatarIndex = 1): ChildProfile {
  return {
    id,
    parentId,
    name: '',
    birthDate: '',
    avatar: AVATAR_PRESETS[avatarIndex % AVATAR_PRESETS.length],
    diagnosisStatus: '',
    supportLevel: null,
    icdCode: '',
    conditions: [],
    conditionsOther: '',
    medicalHistory: [],
    chronicConditions: '',
    allergies: '',
    medications: '',
    communicationLevel: '',
    altCommunication: [],
    sensory: { sound: 'medium', light: 'medium', touch: 'medium' },
    interests: [],
    therapies: [],
    reviewedSections: [],
    demo: false,
  };
}

export const AYLIN_ID = 'child-aylin';

export function createAylin(): ChildProfile {
  const today = todayKey();
  return {
    id: AYLIN_ID,
    parentId: 'u-parent',
    name: 'Aylin',
    birthDate: '2019-04-12',
    avatar: AVATAR_PRESETS[0],
    diagnosisStatus: 'confirmed',
    supportLevel: 1,
    icdCode: 'F84.0',
    conditions: ['speech_delay', 'sensory_processing'],
    conditionsOther: '',
    medicalHistory: [
      {
        id: 'med-1',
        date: shiftKey(today, -210),
        doctor: 'Dr. Rauf Nəbiyev',
        specialty: 'Uşaq nevroloqu',
        institution: 'Demo Uşaq Klinikası',
        diagnosis: 'Autizm spektri pozuntusu (təsdiqləndi)',
        notes: 'Vizual dəstəyə yaxşı reaksiya verir. Səs-küylü mühitdə yorulur.',
        recommendations: 'Loqoped seansları, vizual gündəlik cədvəl.',
        nextAppointment: shiftKey(today, 24),
      },
      {
        id: 'med-2',
        date: shiftKey(today, -64),
        doctor: 'Dr. Səadət Hüseynova',
        specialty: 'Pediatr',
        institution: 'Demo Ailə Sağlamlığı Mərkəzi',
        diagnosis: 'Ümumi müayinə',
        notes: 'Fiziki inkişaf yaşına uyğundur.',
        recommendations: 'İllik müayinə.',
        nextAppointment: '',
      },
    ],
    chronicConditions: '',
    allergies: 'Fıstıq (yüngül)',
    medications: '',
    communicationLevel: 'phrases',
    altCommunication: ['visual_schedule', 'gestures'],
    sensory: { sound: 'high', light: 'medium', touch: 'low' },
    interests: ['trains', 'animals', 'water', 'drawing'],
    therapies: ['speech', 'ot'],
    reviewedSections: ['basic', 'diagnosis', 'conditions', 'medical', 'health', 'daily'],
    demo: true,
  };
}

/** Children of other fictional families, visible only inside the specialist demo. */
export function createExternalChildren(): ExternalChild[] {
  return [
    {
      profile: {
        ...emptyChild('u-family-2', 'child-kamran', 1),
        name: 'Kamran',
        birthDate: '2018-09-03',
        diagnosisStatus: 'confirmed',
        supportLevel: 2,
        icdCode: 'F84.0',
        conditions: ['speech_delay', 'adhd'],
        communicationLevel: 'single_words',
        altCommunication: ['pecs', 'visual_schedule'],
        sensory: { sound: 'medium', light: 'high', touch: 'medium' },
        interests: ['cars', 'puzzles'],
        therapies: ['aba', 'speech'],
        allergies: '—',
        reviewedSections: ['basic', 'diagnosis', 'conditions', 'daily'],
        demo: true,
      },
      snapshot: { firstTry: 58, completion: 86, difficult: 22, avgResponseSec: 11.4, sessions: 17, trendDelta: 9 },
    },
    {
      profile: {
        ...emptyChild('u-family-3', 'child-zahra', 3),
        name: 'Zəhra',
        birthDate: '2020-01-21',
        diagnosisStatus: 'in_progress',
        supportLevel: null,
        conditions: ['anxiety', 'sleep'],
        communicationLevel: 'verbal',
        sensory: { sound: 'high', light: 'high', touch: 'medium' },
        interests: ['music', 'books'],
        therapies: ['psychology'],
        reviewedSections: ['basic', 'diagnosis', 'conditions'],
        demo: true,
      },
      snapshot: { firstTry: 71, completion: 93, difficult: 12, avgResponseSec: 8.2, sessions: 11, trendDelta: 4 },
    },
    {
      profile: {
        ...emptyChild('u-family-4', 'child-nihad', 2),
        name: 'Nihad',
        birthDate: '2017-06-14',
        diagnosisStatus: 'suspected',
        supportLevel: null,
        conditions: ['dyspraxia'],
        communicationLevel: 'phrases',
        sensory: { sound: 'low', light: 'medium', touch: 'high' },
        interests: ['dinosaurs', 'blocks'],
        therapies: ['ot'],
        reviewedSections: ['basic', 'diagnosis'],
        demo: true,
      },
      snapshot: { firstTry: 49, completion: 80, difficult: 31, avgResponseSec: 14.9, sessions: 8, trendDelta: -6 },
    },
  ];
}

export const EXTERNAL_PARENTS: Record<string, string> = {
  'u-family-2': 'Rəşad Əliyev',
  'u-family-3': 'Fidan Quliyeva',
  'u-family-4': 'Orxan Babayev',
};
