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
 * Redirect to the Hub control panel where users can stop/start their server.
 */
export const redirectToHubHome = (): void => {
  const { hubPrefix } = getHubConfig();
  window.location.href = `${hubPrefix}home`;
};
