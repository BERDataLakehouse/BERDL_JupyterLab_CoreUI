import { useEffect, useState, useRef } from 'react';
import { useTokenQuery } from '../hooks/useTokenQuery';
import { NoTokenError } from '../api/authApi';
import { redirectToReauth } from '../utils/auth';
import {
  showNoTokenDialog,
  showWarningDialog,
  showBlockingDialog
} from '../utils/dialogUtils';
import { WARNING_BEFORE_EXPIRY_MS, DISMISS_COOLDOWN_MS } from '../constants';

type TokenState = 'checking' | 'valid' | 'warning' | 'blocked';

/**
 * Calculates minutes remaining until token expiration.
 */
const getMinutesLeft = (tokenExpires: number): number =>
  Math.max(1, Math.ceil((tokenExpires - Date.now()) / 60000));

/**
 * Invisible React component that monitors token expiration.
 *
 * State machine:
 *   checking → valid → warning → blocked
 *                ↑        ↓
 *                └────────┘ (on dismiss, after cooldown)
 */
export const TokenMonitor: React.FC = () => {
  const [state, setState] = useState<TokenState>('checking');
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const isShowingDialog = useRef(false);

  const tokenQuery = useTokenQuery(state !== 'blocked');
  const tokenExpires = tokenQuery.data?.expires ?? null;
  const hasNoToken = tokenQuery.error instanceof NoTokenError;

  // Handle terminal conditions: no token or expired
  useEffect(() => {
    if (state === 'blocked' || isShowingDialog.current) {
      return;
    }

    if (hasNoToken) {
      isShowingDialog.current = true;
      setState('blocked');
      showNoTokenDialog().then(redirectToReauth);
      return;
    }

    if (tokenExpires !== null && tokenExpires <= Date.now()) {
      isShowingDialog.current = true;
      setState('blocked');
      showBlockingDialog().then(redirectToReauth);
    }
  }, [state, hasNoToken, tokenExpires]);

  // Transition from checking → valid once we have token data
  useEffect(() => {
    if (state === 'checking' && tokenExpires !== null) {
      setState('valid');
    }
  }, [state, tokenExpires]);

  // Schedule warning state transition
  useEffect(() => {
    if (state !== 'valid' || tokenExpires === null) {
      return;
    }

    const now = Date.now();
    const warningTime = tokenExpires - WARNING_BEFORE_EXPIRY_MS;

    // If dismissed, wait for cooldown before re-entering warning
    const cooldownEnd = dismissedAt ? dismissedAt + DISMISS_COOLDOWN_MS : 0;
    const nextWarningTime = Math.max(warningTime, cooldownEnd);
    const delay = nextWarningTime - now;

    if (delay <= 0 && now < tokenExpires) {
      setState('warning');
      return;
    }

    if (delay > 0) {
      const timerId = setTimeout(() => setState('warning'), delay);
      return () => clearTimeout(timerId);
    }
  }, [state, tokenExpires, dismissedAt]);

  // Show warning dialog
  useEffect(() => {
    if (state !== 'warning' || isShowingDialog.current) {
      return;
    }

    isShowingDialog.current = true;

    showWarningDialog(getMinutesLeft(tokenExpires!)).then(accepted => {
      isShowingDialog.current = false;

      if (accepted) {
        setState('blocked');
        redirectToReauth();
      } else {
        setDismissedAt(Date.now());
        setState('valid');
      }
    });
  }, [state, tokenExpires]);

  return null;
};
