import { useHistory } from 'react-router-dom';
import { useNavigationStore } from '../stores/navigationStore';

class AppNavigationService {
  private stack: string[] = [];
  private historyInstance: any = null;

  constructor() {
    // Restore stack from sessionStorage if present
    try {
      const saved = sessionStorage.getItem('ve_nav_stack');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.stack = parsed;
        }
      }
    } catch (_) {}
  }

  setHistory(history: any) {
    this.historyInstance = history;
  }

  getStack(): string[] {
    return [...this.stack];
  }

  handleLocationChange(pathname: string, search: string, action: string) {
    const fullPath = pathname + (search || '');

    if (action === 'PUSH') {
      if (this.stack.length === 0 || this.stack[this.stack.length - 1] !== fullPath) {
        this.stack.push(fullPath);
      }
    } else if (action === 'POP') {
      if (this.stack.length > 1) {
        const foundIndex = this.stack.lastIndexOf(fullPath);
        if (foundIndex !== -1) {
          this.stack = this.stack.slice(0, foundIndex + 1);
        } else {
          this.stack.pop();
          if (this.stack.length === 0 || this.stack[this.stack.length - 1] !== fullPath) {
            this.stack.push(fullPath);
          }
        }
      } else {
        this.stack = [fullPath];
      }
    } else if (action === 'REPLACE') {
      if (this.stack.length > 0) {
        this.stack[this.stack.length - 1] = fullPath;
      } else {
        this.stack.push(fullPath);
      }
    }

    try {
      sessionStorage.setItem('ve_nav_stack', JSON.stringify(this.stack.slice(-30)));
      sessionStorage.setItem('ve_nav_current', fullPath);
    } catch (_) {}
  }

  getPreviousPath(): string | undefined {
    if (this.stack.length >= 2) {
      return this.stack[this.stack.length - 2];
    }
    try {
      const saved = sessionStorage.getItem('ve_nav_stack');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed[parsed.length - 2];
        }
      }
    } catch (_) {}
    return undefined;
  }

  canGoBack(): boolean {
    return this.stack.length > 1;
  }

  goBack(fallback = '/home') {
    // 1. If any modal is active in the modal stack, dismiss it first
    const dismissedModal = useNavigationStore.getState().dismissTopModal();
    if (dismissedModal) {
      return;
    }

    // 2. If stack has history, navigate back
    if (this.stack.length > 1) {
      this.stack.pop();
      if (this.historyInstance) {
        this.historyInstance.goBack();
        return;
      } else if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
      }
    }

    // 3. Check previous path from session storage if page was reloaded
    const prev = this.getPreviousPath();
    if (prev && this.historyInstance && prev !== this.historyInstance.location.pathname) {
      this.historyInstance.push(prev);
      return;
    }

    // 4. Default fallback
    if (this.historyInstance) {
      this.historyInstance.push(fallback);
    } else if (typeof window !== 'undefined') {
      window.location.href = fallback;
    }
  }
}

export const appNavigation = new AppNavigationService();

/**
 * Hook to access navigation back actions and state in any component
 */
export function useAppNavigation() {
  const history = useHistory();

  return {
    goBack: (fallback?: string) => appNavigation.goBack(fallback),
    canGoBack: () => appNavigation.canGoBack(),
    getPreviousPath: () => appNavigation.getPreviousPath(),
    push: (path: string, state?: any) => history.push(path, state),
    replace: (path: string, state?: any) => history.replace(path, state),
  };
}
