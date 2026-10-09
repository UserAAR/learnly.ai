import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';
import { STORAGE_KEYS, removeKey } from '@/lib/mock-storage';

interface Props {
  children: ReactNode;
  /** When this value changes (e.g. the route path), a caught error is cleared and the subtree re-renders. */
  resetKey?: string;
  /** 'page' renders inside an existing layout; 'app' fills the screen when nothing else could render. */
  variant?: 'page' | 'app';
}

interface State {
  error: Error | null;
}

/** Translation that can never throw — the fallback must render even if i18n itself failed. */
function tr(key: string, fallback: string): string {
  try {
    const value = i18n.t(key);
    return typeof value === 'string' && value !== key ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Catches render errors so a failing page shows a recovery screen instead of an empty document.
 * It supplements, not replaces, fixing the underlying error: details are logged to the console
 * and shown in development builds.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[learnly] render error', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  private resetDemoData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k !== STORAGE_KEYS.prefs) removeKey(k);
    });
    window.location.assign('/');
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const app = this.props.variant === 'app';
    const btn = 'inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold transition-colors';
    return (
      <div role="alert" className={app ? 'grid min-h-dvh place-items-center bg-canvas px-6 py-10' : 'grid min-h-[60vh] place-items-center px-4 py-10'}>
        <div className="w-full max-w-lg rounded-[28px] border border-line bg-white p-7 text-center shadow-[0_24px_48px_-24px_rgba(14,24,56,0.35)]">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral-50 text-2xl" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-ink">{tr('errors.title', 'Something went wrong')}</h1>
          <p className="mt-2 text-sm text-muted">{tr('errors.text', 'This screen could not be displayed. Your saved data is safe.')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {!app && (
              <button type="button" className={`${btn} bg-cobalt-500 text-white hover:bg-cobalt-600`} onClick={() => this.setState({ error: null })}>
                {tr('errors.retry', 'Try again')}
              </button>
            )}
            <button type="button" className={`${btn} border border-line bg-white text-ink hover:bg-canvas`} onClick={() => window.location.reload()}>
              {tr('errors.reload', 'Reload page')}
            </button>
            <button type="button" className={`${btn} border border-line bg-white text-ink hover:bg-canvas`} onClick={() => window.location.assign('/')}>
              {tr('errors.home', 'Go to start page')}
            </button>
          </div>
          <button type="button" className="mt-4 text-xs font-bold text-coral-600 underline-offset-2 hover:underline" onClick={this.resetDemoData}>
            {tr('errors.reset', 'Reset demo data and start again')}
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-48 overflow-auto rounded-xl bg-canvas p-3 text-left text-[11px] text-coral-700">{error.stack ?? error.message}</pre>
          )}
        </div>
      </div>
    );
  }
}
