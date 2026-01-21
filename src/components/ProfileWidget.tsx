import React, { useCallback } from 'react';
import { getBerdlProfile, redirectToHubHome } from '../utils/jupyterhub';
import { showChangeProfileDialog } from '../utils/dialogUtils';

/**
 * Widget displaying the current BERDL profile with a button to change it.
 */
export const ProfileWidget: React.FC = () => {
  const profile = getBerdlProfile();

  const handleChangeClick = useCallback(async () => {
    const confirmed = await showChangeProfileDialog();
    if (confirmed) {
      redirectToHubHome();
    }
  }, []);

  if (!profile) {
    return null;
  }

  return (
    <div className="berdl-profile-widget">
      <span className="berdl-profile-text">
        Resources: &nbsp;<strong>{profile.display_name}</strong>&nbsp;{' '}
        {profile.description} &nbsp;
        <a
          className="berdl-profile-respawn-link"
          onClick={handleChangeClick}
          title="Go to Hub control panel to change profile"
        >
          Switch
        </a>
      </span>
    </div>
  );
};
