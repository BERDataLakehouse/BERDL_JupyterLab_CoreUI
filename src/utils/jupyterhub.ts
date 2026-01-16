import { PageConfig } from '@jupyterlab/coreutils';
import { IBerdlProfile } from '../types';

/**
 * Get the BERDL profile from PageConfig.
 */
export const getBerdlProfile = (): IBerdlProfile | null => {
  const profileJson = PageConfig.getOption('berdlProfile');
  if (!profileJson) {
    return null;
  }
  try {
    return JSON.parse(profileJson) as IBerdlProfile;
  } catch {
    console.error('Failed to parse berdlProfile');
    return null;
  }
};

/**
 * Get JupyterHub configuration from PageConfig.
 */
const getHubConfig = () => {
  const hubPrefix = PageConfig.getOption('hubPrefix') || '/hub/';
  const hubUser = PageConfig.getOption('hubUser');
  const hubServerName = PageConfig.getOption('hubServerName') || '';
  return { hubPrefix, hubUser, hubServerName };
};

/**
 * Stop the current server and redirect to the spawn page.
 */
export const stopServerAndRedirect = async (): Promise<void> => {
  const { hubPrefix, hubUser, hubServerName } = getHubConfig();

  if (!hubUser) {
    console.error('Not running under JupyterHub');
    return;
  }

  const serverPath = hubServerName ? `servers/${hubServerName}` : 'server';
  const stopUrl = `${hubPrefix}api/users/${hubUser}/${serverPath}`;

  try {
    const response = await fetch(stopUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to stop server: ${response.status}`);
    }

    setTimeout(() => {
      window.location.href = `${hubPrefix}spawn`;
    }, 500);
  } catch (error) {
    console.error('Error stopping server:', error);
    window.location.href = `${hubPrefix}home`;
  }
};
