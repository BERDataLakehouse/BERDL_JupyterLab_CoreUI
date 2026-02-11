import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { ITokenInfo } from '../types';
import { getKBaseOrigin, getAuthToken } from '../utils/auth';

/**
 * Error thrown when no auth token is available
 */
export class NoTokenError extends Error {
  constructor() {
    super('No KBase session token found');
    this.name = 'NoTokenError';
  }
}

/**
 * Fetch token information from the KBase Auth2 API.
 * @throws {NoTokenError} if no token is available
 * @throws {Error} if the API request fails
 */
export const fetchTokenInfo = async (): Promise<ITokenInfo> => {
  const kbaseOrigin = getKBaseOrigin();
  const token = getAuthToken();

  if (!token) {
    throw new NoTokenError();
  }

  const response = await fetch(`${kbaseOrigin}/services/auth/api/V2/token`, {
    headers: {
      Authorization: token
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch token info: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Sync the current KBase session cookie to the Jupyter server process
 * so that server-side Python code has access to the fresh token.
 */
export const syncTokenToServer = async (): Promise<void> => {
  const settings = ServerConnection.makeSettings();
  const url = URLExt.join(settings.baseUrl, 'api/berdl-coreui/token-sync');
  const response = await ServerConnection.makeRequest(
    url,
    { method: 'POST' },
    settings
  );
  if (!response.ok) {
    throw new Error(`Token sync failed: ${response.status}`);
  }
};
