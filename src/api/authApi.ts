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
