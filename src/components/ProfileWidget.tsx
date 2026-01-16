import React, { useCallback, useState } from 'react';
import { getBerdlProfile, stopServerAndRedirect } from '../utils/jupyterhub';
import { showChangeProfileDialog } from '../utils/dialogUtils';

/**
 * Widget displaying the current BERDL profile with a button to change it.
 */
export const ProfileWidget: React.FC = () => {
  const profile = getBerdlProfile();
  const [isChanging, setIsChanging] = useState(false);

  const handleChangeClick = useCallback(async () => {
    const confirmed = await showChangeProfileDialog();
    if (confirmed) {
      setIsChanging(true);
      await stopServerAndRedirect();
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
          onClick={isChanging ? undefined : handleChangeClick}
          title="Stop server and choose a different profile"
        >
          {isChanging ? 'Stopping...' : 'Respawn'}
        </a>
      </span>
    </div>
  );
};
