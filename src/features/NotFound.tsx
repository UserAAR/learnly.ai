import { Compass } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { homePathFor } from '@/lib/mock-auth';
import { ButtonLink } from '@/components/ui';
import { Mascot } from '@/components/illustrations/Brand';

export default function NotFound() {
  const { user } = useStore();
  const { t } = useLang();
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-cobalt-50 to-canvas px-6 text-center">
      <div className="flex flex-col items-center">
        <Mascot size={140} mood="think" />
        <h1 className="mt-4 text-3xl font-extrabold text-ink">{t('notFound.title')}</h1>
        <p className="mt-2 max-w-sm text-muted">{t('notFound.text')}</p>
        <ButtonLink to={user ? homePathFor(user.role) : '/login'} className="mt-6" icon={<Compass className="size-4" />}>
          {t('notFound.action')}
        </ButtonLink>
      </div>
    </div>
  );
}
