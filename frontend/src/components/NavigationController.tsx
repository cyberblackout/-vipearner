import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { appNavigation } from '../services/navigation';
import { useNavigationStore } from '../stores/navigationStore';

export default function NavigationController() {
  const history = useHistory();
  const location = useLocation();

  // 1. Keep appNavigation in sync with current history instance
  useEffect(() => {
    appNavigation.setHistory(history);
  }, [history]);

  // 2. Track route history stack on every location change
  useEffect(() => {
    // Record initial route or route transition
    const action = (history as any).action || 'PUSH';
    appNavigation.handleLocationChange(location.pathname, location.search, action);
  }, [location, history]);

  // 3. Android Hardware Back Button + Ionic ionBackButton handlers
  useEffect(() => {
    let capRemoveListener: (() => void) | null = null;

    // Register Capacitor Hardware Back Button handler
    try {
      CapApp.addListener('backButton', () => {
        // Priority 1: Dismiss any open modal registered in navigationStore
        if (useNavigationStore.getState().dismissTopModal()) {
          return;
        }

        // Priority 2: Dismiss standard Ionic overlays if any exist in DOM
        const openOverlay = document.querySelector(
          'ion-modal.can-dismiss, ion-alert, ion-action-sheet, ion-popover, ion-loading'
        );
        if (openOverlay) {
          return;
        }

        // Priority 3: If on root page (/home) with no prior history, exit app
        const currentPath = history.location.pathname;
        if (currentPath === '/home' && !appNavigation.canGoBack()) {
          CapApp.exitApp();
          return;
        }

        // Priority 4: Navigate to actual previous page
        appNavigation.goBack('/home');
      }).then((handle) => {
        capRemoveListener = () => handle.remove();
      }).catch(() => {});
    } catch (_) {}

    // Register Ionic ionBackButton handler on document
    const handleIonBackButton = (event: any) => {
      event.detail.register(10, (processNextHandler: () => void) => {
        if (useNavigationStore.getState().dismissTopModal()) {
          return;
        }

        const currentPath = history.location.pathname;
        if (currentPath === '/home' && !appNavigation.canGoBack()) {
          processNextHandler();
          return;
        }

        appNavigation.goBack('/home');
      });
    };

    document.addEventListener('ionBackButton', handleIonBackButton);

    return () => {
      if (capRemoveListener) {
        capRemoveListener();
      }
      document.removeEventListener('ionBackButton', handleIonBackButton);
    };
  }, [history]);

  return null;
}
