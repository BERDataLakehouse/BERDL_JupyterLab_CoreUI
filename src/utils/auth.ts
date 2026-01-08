import { PageConfig } from '@jupyterlab/coreutils';

/**
 * Get the KBase origin URL from environment.
 */
export const getKBaseOrigin = (): string => {
  // Try to get from PageConfig (set by JupyterHub spawner)
  const kbaseOrigin = PageConfig.getOption('kbaseOrigin');
  if (kbaseOrigin) {
    return kbaseOrigin;
  }

  // Last resort: use ci.kbase.us
  return 'https://ci.kbase.us';
};

/**
 * Get the auth token from cookies.
 */
export const getAuthToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'kbase_session' || name === 'kbase_session_backup') {
      return value;
    }
  }
  return null;
};

/**
 * Logout the current session by calling the auth service.
 * This invalidates the token on the server.
 */
const logoutSession = async (): Promise<void> => {
  const kbaseOrigin = getKBaseOrigin();
  const token = getAuthToken();

  if (!token) {
    return;
  }

  try {
    await fetch(`${kbaseOrigin}/services/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'x-kbase-ui-auth': token
      }
    });
    console.log('Session logged out successfully');
  } catch (error) {
    // Log but don't block redirect if logout fails
    console.warn('Failed to logout session:', error);
  }
};

/**
 * Redirect to KBase login page for re-authentication.
 * First calls logout to invalidate the current token.
 */
export const redirectToReauth = async (): Promise<void> => {
  await logoutSession();
  const kbaseOrigin = getKBaseOrigin();
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${kbaseOrigin}/login?nextrequest=${returnUrl}`;
};
