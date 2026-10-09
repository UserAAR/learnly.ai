import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accessibility, Database, Globe, KeyRound, LogOut, RotateCcw, ShieldAlert, Volume2, Waves } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { playSound } from '@/lib/sound';
import { CHILD_MODE_PIN } from '@/mocks/users';
import type { Lang, MotionPref } from '@/types';
import { Badge, Button, Card, Dialog, PageHeader, Segmented, Switch } from '@/components/ui';

export default function SettingsPage() {
  const { prefs, setPrefs, soundLocked, selectedChild, resetDemo, logout, data } = useStore();
  const { t } = useLang();
  const reduce = useReduceMotion();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const storageKb = (() => {
    try {
      return Math.round((JSON.stringify(data).length / 1024) * 10) / 10;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Globe className="size-5 text-cobalt-500" /> {t('settings.language')}
          </h2>
          <p className="mt-1 text-sm text-muted">{t('settings.languageText')}</p>
          <Segmented
            className="mt-4"
            label={t('settings.language')}
            value={prefs.language}
            onChange={(v: Lang) => setPrefs({ language: v })}
            options={[
              { value: 'az', label: 'Azərbaycanca' },
              { value: 'en', label: 'English' },
              { value: 'ru', label: 'Русский' },
            ]}
          />
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Accessibility className="size-5 text-violet-500" /> {t('settings.sensory')}
          </h2>
          <p className="mt-1 text-sm text-muted">{t('settings.sensoryText')}</p>
          <div className="mt-5 space-y-5">
            <Switch
              checked={prefs.soundEnabled && !soundLocked}
              disabled={soundLocked}
              onChange={(v) => {
                setPrefs({ soundEnabled: v });
                if (v) playSound('tap');
              }}
              label={
                <span className="inline-flex items-center gap-2">
                  <Volume2 className="size-4" /> {t('settings.sound')}
                </span>
              }
              description={soundLocked ? t('settings.soundLocked', { name: selectedChild.name }) : t('settings.soundText')}
            />
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <Waves className="size-4" /> {t('settings.motion')}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">{t('settings.motionText')}</p>
              <Segmented
                className="mt-3"
                label={t('settings.motion')}
                value={prefs.motion}
                onChange={(v: MotionPref) => setPrefs({ motion: v })}
                options={[
                  { value: 'system', label: t('settings.motionSystem') },
                  { value: 'reduce', label: t('settings.motionReduce') },
                  { value: 'full', label: t('settings.motionFull') },
                ]}
              />
              <p className="mt-2 text-xs font-semibold text-muted">{reduce ? t('settings.motionNowReduced') : t('settings.motionNowFull')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <KeyRound className="size-5 text-sun-700" /> {t('settings.pin')}
          </h2>
          <p className="mt-1 text-sm text-muted">{t('settings.pinText')}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="rounded-2xl bg-canvas px-4 py-2 font-mono text-lg font-black tracking-[0.4em] text-ink">{CHILD_MODE_PIN}</span>
            <Badge tone="sun">{t('common.demo')}</Badge>
          </div>
          <p className="mt-3 flex gap-2 text-xs text-muted">
            <ShieldAlert className="size-4 shrink-0" />
            {t('settings.pinNote')}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Database className="size-5 text-teal-600" /> {t('settings.data')}
          </h2>
          <p className="mt-1 text-sm text-muted">{t('settings.dataText', { kb: storageKb })}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="danger" icon={<RotateCcw className="size-4" />} onClick={() => setConfirmReset(true)}>
              {t('settings.reset')}
            </Button>
            <Button
              variant="secondary"
              icon={<LogOut className="size-4" />}
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              {t('nav.logout')}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title={t('settings.resetTitle')}
        description={t('settings.resetText')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                toast({ title: t('toast.demoReset'), description: t('toast.demoResetText') });
                navigate('/parent/dashboard');
              }}
            >
              {t('settings.reset')}
            </Button>
          </>
        }
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {['r1', 'r2', 'r3', 'r4', 'r5'].map((k) => (
            <li key={k}>{t(`settings.resetItems.${k}`)}</li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
